# Track 1: Containerized Pipeline Agent — Builder Prompt

> Use this as a system prompt or epic brief for implementing containerized
> pipeline agent execution on the Kapable platform.

---

## Mission

Package the `kapable-agent` daemon + Claude Code CLI + toolchain into a
single Docker image that customers download and run on their own hardware.
One container. One `docker run`. Agent registers with Kapable, claims
pipeline jobs, does the work, pushes results.

**Customer experience:**
```bash
docker run -d \
  -e KAPABLE_API_URL=https://api.kapable.dev \
  -e KAPABLE_SERVICE_TOKEN=st_ci_xxx \
  -e KAPABLE_ORG_ID=xxx \
  ghcr.io/kapable/pipeline-agent:latest
```

That's it. Agent appears in Console. Ready to claim work.

**Why this matters:**

1. **CX/DX foundation.** Customers deploy their own agents on their own
   hardware. The container has no SSH, no direct DB — only platform APIs.
   Every wall the agent hits is a platform gap we must fill.

2. **Customer-owned compute.** They control cost, location, scale.
   Kapable doesn't pay for their compute. They don't worry about ours.

3. **Platform surface exposure.** Current agents have SSH and make direct
   server changes, hiding incomplete platform surfaces. The container
   forces pure platform integration.

**First customer:** AgileWorks deploying agents for Vantage Advisor Hub.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  epic-runner / theme-runner / Console UI                     │
│  Submits pipeline via POST /v1/pipelines/run                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│  kapable-prod (Kapable infrastructure)                       │
│  ┌─────────────┐  ┌──────────┐  ┌───────────┐              │
│  │ kapable-api  │  │ postgres │  │ kapable-  │              │
│  │ (port 3003)  │  │ (5432)   │  │ forge     │              │
│  └──────┬───────┘  └──────────┘  └─────┬─────┘              │
│         │                              │                     │
│   pipeline_agent_jobs table      Enqueues agent steps        │
└─────────┬────────────────────────────────────────────────────┘
          │  HTTPS (long-poll)
          │
┌─────────▼────────────────────────────────────────────────────┐
│  CUSTOMER'S MACHINE (any Docker host)                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  ghcr.io/kapable/pipeline-agent (ONE CONTAINER)        │  │
│  │                                                        │  │
│  │  kapable-agent daemon                                  │  │
│  │    ├── Registers with platform (service token)         │  │
│  │    ├── Long-polls for jobs                             │  │
│  │    ├── Per job:                                        │  │
│  │    │   ├── git clone <repo> /workspaces/<job-id>/      │  │
│  │    │   ├── claude -p <prompt> --output-format stream-json │
│  │    │   ├── (Claude reads/writes /workspaces/<job-id>/) │  │
│  │    │   ├── git add, commit, push                       │  │
│  │    │   └── Report completion to platform API           │  │
│  │    └── Streams events back to platform                 │  │
│  │                                                        │  │
│  │  Tools available:                                      │  │
│  │    ├── Claude Code CLI (headless)                      │  │
│  │    ├── Git (clone, commit, push)                       │  │
│  │    ├── Bun (TypeScript runtime + package manager)      │  │
│  │    ├── Node.js                                         │  │
│  │    └── curl (HTTPS to Kapable APIs only)               │  │
│  │                                                        │  │
│  │  ╔══════════════════════════════════════════════╗      │  │
│  │  ║  SANDBOX CONTRACT:                          ║      │  │
│  │  ║  - NO SSH (not installed)                   ║      │  │
│  │  ║  - NO direct DB access (no drivers)         ║      │  │
│  │  ║  - NO raw SQL                               ║      │  │
│  │  ║  - ONLY Kapable Data API (HTTPS)            ║      │  │
│  │  ║  - ONLY git for code changes                ║      │  │
│  │  ║  - ONLY k8way for LLM calls                 ║      │  │
│  │  ╚══════════════════════════════════════════════╝      │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  Scale: run more containers on more machines.                │
│  Each one registers independently.                           │
└──────────────────────────────────────────────────────────────┘
```

### One Image. Everything Inside.

The container includes the agent daemon, Claude CLI, and all tooling.
No Docker-in-Docker. No sibling containers. No Docker socket mounting.
The container boundary IS the sandbox.

---

## Context: What Exists Today

### Agent Daemon (Working — Needs Containerization)

**Binary:** `crates/kapable-agent/` (standalone Rust daemon)
**Status:** Live on `prod-agent-01`, runs directly on host

**Current flow:**
1. Agent registers with platform via service token (`st_ci_*`)
2. Long-polls `/v1/pipeline/agent/jobs/claim`
3. Claims job → clones repo → runs Claude CLI
4. Streams events back via `HttpEventSink`

**What works:** Job claiming, Claude execution, event streaming.
**What's wrong:** Runs on host with full system access (SSH, DB, etc.)

**Agent step definition** (`crates/kapable-pipeline/src/types.rs:687-746`):
```rust
pub struct AgentStepDef {
    pub prompt: String,
    pub chrome: bool,
    pub worktree: Option<String>,
    pub session_id: Option<String>,
    pub resume: bool,
    pub max_turns: u32,              // default 40
    pub heartbeat_timeout_secs: u64, // kill if silent
    pub model: Option<String>,
    pub system_prompt: Option<String>,
    pub add_dirs: Vec<String>,
    pub hooks_settings: Option<serde_json::Value>,
}
```

**Agent step runner** (`crates/kapable-pipeline/src/steps/agent.rs`):
- Spawns `claude -p <prompt> --output-format stream-json`
- Reads JSONL events from stdout
- Extracts `session_id` from first `result` event
- Subsequent messages use `--resume <session_id>`

### Pipeline Agent API (Live)

8 endpoints at `crates/kapable-api/src/routes/pipeline_agents.rs`:
- `POST /v1/pipeline/agents` — register agent
- `POST /v1/pipeline/agent/jobs/claim` — claim next job
- `POST /v1/pipeline/agent/jobs/{id}/heartbeat` — keep alive
- `POST /v1/pipeline/agent/jobs/{id}/complete` — report completion

### KAIT (Reference Only)

KAIT runs Claude in Incus containers on kapable-prod. We reference its
credential injection and env var patterns but don't reuse Incus.
The pipeline agent is Docker-only, customer-deployed.

**Useful patterns from KAIT:**
- k8way gateway routing (ANTHROPIC_API_KEY + ANTHROPIC_BASE_URL)
- Claude CLI gotcha: `--mcp-config` with missing file → exits code 0, no output
- Stream-JSON parsing for session management

### Event Sink (Partially Working)

`HttpEventSink` posts events to `/v1/ceremony-events` endpoint.
**Known issue:** Events may not reach `pipeline_runs` table reliably.

---

## Implementation Plan

### Story 1: Docker Image

**Goal:** Create a single Docker image containing the agent daemon,
Claude CLI, and all tooling.

**Dockerfile:**
```dockerfile
FROM ubuntu:24.04

# System deps
RUN apt-get update && apt-get install -y \
    curl git ca-certificates unzip jq \
    && rm -rf /var/lib/apt/lists/*

# Bun runtime
RUN curl -fsSL https://bun.sh/install | BUN_INSTALL=/usr/local bash

# Node.js 22
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Claude Code CLI
RUN npm install -g @anthropic-ai/claude-code

# kapable-agent binary (cross-compiled for linux/amd64)
COPY kapable-agent /usr/local/bin/kapable-agent
RUN chmod +x /usr/local/bin/kapable-agent

# Non-root user
RUN useradd -m -u 1000 -s /bin/bash agent
RUN mkdir -p /workspaces && chown agent:agent /workspaces

# CLAUDE.md — DX contract for sandboxed agents (see Story 6)
COPY CLAUDE.md /home/agent/CLAUDE.md

# Intentionally NOT installed:
# - openssh-client (no SSH)
# - postgresql-client (no DB access)
# - docker (no container spawning)

USER agent
WORKDIR /workspaces

ENTRYPOINT ["/usr/local/bin/kapable-agent"]
```

**Build & publish:**
```bash
# Cross-compile agent binary
cd dev.kapable
cargo zigbuild --release --target x86_64-unknown-linux-gnu -p kapable-agent

# Build Docker image
cd docker/pipeline-agent
cp ../../target/x86_64-unknown-linux-gnu/release/kapable-agent .
docker build -t ghcr.io/kapable/pipeline-agent:latest .
docker push ghcr.io/kapable/pipeline-agent:latest
```

**Acceptance criteria:**
- [ ] Image builds successfully
- [ ] `kapable-agent`, `claude`, `bun`, `git`, `node` all available
- [ ] No SSH client, no psql, no Docker CLI inside image
- [ ] Runs as non-root user (`agent`, UID 1000)
- [ ] Image size < 1.5 GB
- [ ] Published to `ghcr.io/kapable/pipeline-agent`
- [ ] `docker run` with env vars starts the agent and registers with platform

---

### Story 2: Agent Daemon — Containerized Mode

**Goal:** Modify the agent daemon to work well inside Docker:
workspace management, git credentials, Claude credential injection.

**Files to modify:**
- `crates/kapable-agent/src/daemon.rs` — Workspace lifecycle
- `crates/kapable-agent/src/workspace.rs` — Git clone/push inside container

**Workspace lifecycle per job:**
```
1. Receive job with git_clone_url + git_token
2. git clone https://<token>@github.com/<org>/<repo>.git /workspaces/<job-id>/
3. cd /workspaces/<job-id>
4. Run Claude CLI with --cwd /workspaces/<job-id>
5. After completion: git add/commit/push (if changes made)
6. Cleanup: rm -rf /workspaces/<job-id>
```

**Claude credential setup:**
The agent daemon must configure Claude CLI credentials before first use.
Two approaches:

```rust
// Option A: Environment variables (preferred — stateless)
// Claude CLI reads ANTHROPIC_API_KEY from env
// k8way gateway URL set via ANTHROPIC_BASE_URL
// No files needed

// Option B: Write credentials file on startup
// /home/agent/.claude/.credentials.json
// Only needed if Claude CLI requires file-based auth
```

**Git credential setup:**
```rust
// Configure git to use token from job context
fn setup_git_credentials(workspace: &Path, token: &str) -> Result<()> {
    // Use credential helper that returns the token
    std::process::Command::new("git")
        .args(&["config", "credential.helper",
                &format!("!f() {{ echo password={}; }}; f", token)])
        .current_dir(workspace)
        .status()?;
    Ok(())
}
```

**Acceptance criteria:**
- [ ] Agent clones repos using git token from job context
- [ ] Claude CLI uses k8way gateway via env vars
- [ ] Workspaces are cleaned up after job completion
- [ ] Git push works with clone token
- [ ] Multiple concurrent jobs use separate workspace dirs
- [ ] Agent daemon handles network interruptions gracefully (reconnect)

---

### Story 3: Job Context — Credentials in Claim Response

**Goal:** When an agent claims a job, the API returns all credentials
the agent needs to execute it. No pre-configuration required beyond
the service token.

**Files to modify:**
- `crates/kapable-api/src/routes/pipeline_agents.rs` — Enrich claim response

**Claim response format:**
```json
{
  "job_id": "uuid",
  "step": {
    "type": "agent",
    "prompt": "...",
    "max_turns": 40,
    "model": "claude-sonnet-4-6"
  },
  "context": {
    "org_id": "uuid",
    "app_id": "uuid",
    "k8way_api_key": "k8w_...",
    "data_key": "sk_live_...",
    "git_clone_url": "https://github.com/org/repo.git",
    "git_token": "ghp_...",
    "git_branch": "main",
    "env_vars": {
      "KAPABLE_API_URL": "https://api.kapable.dev",
      "CUSTOM_VAR": "value"
    }
  }
}
```

The agent daemon uses this context to:
1. Set `ANTHROPIC_API_KEY` = `k8way_api_key`
2. Set `ANTHROPIC_BASE_URL` = `https://k8way.kapable.dev`
3. Set `KAPABLE_DATA_KEY` = `data_key`
4. Clone repo using `git_token`
5. Pass any `env_vars` to Claude CLI

**Acceptance criteria:**
- [ ] Claim response includes all needed credentials
- [ ] Agent doesn't need pre-configured API keys (only service token)
- [ ] Credentials are scoped to the org that owns the pipeline
- [ ] Git token has appropriate permissions (read + write)
- [ ] k8way key routes Claude calls through the gateway

---

### Story 4: Capability-Based Job Routing

**Goal:** Agents only claim jobs they can handle.

**Files to modify:**
- `crates/kapable-api/src/routes/pipeline_agents.rs` — Filter by capabilities
- `crates/kapable-pipeline/src/types.rs` — Add `required_capabilities`

**Implementation:**
```rust
// Agent registers with capabilities
POST /v1/pipeline/agents
{
  "name": "agileworks-agent-01",
  "capabilities": ["claude", "typescript", "bun"]
}

// Job claim filters by capability
SELECT * FROM pipeline_agent_jobs
WHERE status = 'pending'
  AND required_capabilities <@ agent_capabilities
ORDER BY created_at ASC
LIMIT 1
FOR UPDATE SKIP LOCKED
```

**Acceptance criteria:**
- [ ] Agent only claims jobs matching its capabilities
- [ ] Unmatched jobs stay in queue
- [ ] Capabilities configurable via `AGENT_CAPABILITIES` env var

---

### Story 5: Event Persistence Fix

**Goal:** Events from agent execution reliably reach `pipeline_events`
table for Console UI status tracking.

**Files to investigate:**
- `crates/kapable-pipeline/src/events.rs` — HttpEventSink
- `crates/kapable-api/src/routes/ceremony_events.rs` — Ingest endpoint

**Acceptance criteria:**
- [ ] Agent step events appear in `/v1/pipeline-runs/{id}/events/history`
- [ ] Status updates (started, running, completed, failed) are visible
- [ ] Claude CLI output (assistant messages, tool calls) captured
- [ ] Console UI shows live agent progress

---

### Story 6: CLAUDE.md — Agent DX Contract

**Goal:** Bake a CLAUDE.md into the image that teaches Claude how to
interact with Kapable from inside the container.

**File:** `docker/pipeline-agent/CLAUDE.md`

```markdown
# Building on Kapable

You are a pipeline agent running inside a container.
You interact with Kapable exclusively via HTTPS APIs.

## Environment Variables
- KAPABLE_API_URL — Platform API base URL
- KAPABLE_ORG_ID — Organization ID
- KAPABLE_DATA_KEY — Data API key (sk_live_*)

## Data API

### Tables
GET    /v1/tables                    — List all tables
POST   /v1/tables                    — Create table
GET    /v1/tables/{id}               — Get table schema
DELETE /v1/tables/{id}               — Drop table

### Data
GET    /v1/{table}                   — List rows
POST   /v1/{table}                   — Insert row(s)
PATCH  /v1/{table}?id=eq.{uuid}      — Update row
DELETE /v1/{table}?id=eq.{uuid}      — Delete row

### Auth Header
x-api-key: $KAPABLE_DATA_KEY

## Deployment
Push to git. The Connect App Pipeline deploys automatically.
Do NOT try to deploy manually or via SSH.

## Constraints
- No SSH — not installed
- No database clients — not installed
- No Docker — not available
- Only HTTPS outbound to Kapable APIs and GitHub
```

**Acceptance criteria:**
- [ ] CLAUDE.md is in the image at a path Claude CLI discovers
- [ ] Agent can use Data API successfully following the docs
- [ ] Updated with each image release as APIs evolve

---

### Story 7: Customer Onboarding

**Goal:** End-to-end flow from "I want an agent" to "agent is running."

**Customer steps:**
```
1. Kapable Console → Settings → Service Tokens → Create
   Scope: pipeline_agent
   → Receive: st_ci_xxx

2. On their machine:
   docker run -d \
     --name kapable-agent \
     --restart unless-stopped \
     -e KAPABLE_API_URL=https://api.kapable.dev \
     -e KAPABLE_SERVICE_TOKEN=st_ci_xxx \
     -e KAPABLE_ORG_ID=<from-console> \
     ghcr.io/kapable/pipeline-agent:latest

3. Console → Settings → Pipeline Agents
   Agent appears as "online" ✓

4. Submit pipeline (Console UI or API)
   Agent claims job and starts working ✓
```

**Platform prerequisites (may need building):**
- [ ] Console UI: Service Token creation (may already exist)
- [ ] Console UI: Pipeline Agents page showing online/offline status
- [ ] API: Job claim response includes all credentials (Story 3)
- [ ] API: Clear error messages on registration failures

**Acceptance criteria:**
- [ ] Zero-to-running in under 5 minutes
- [ ] Self-service — no Kapable-side setup needed
- [ ] Agent visible in Console within 30 seconds
- [ ] Test pipeline completes successfully on first try

---

## Constraints

1. **One container.** Everything runs inside a single Docker container.
   No Docker-in-Docker, no sibling containers, no Docker socket mounting.
2. **Docker-first.** No Incus in customer-facing anything. Internally
   Kapable can still use Incus for KAIT — that's separate.
3. **Backwards compatible.** Agent daemon must still work outside Docker
   for local dev (`cargo run -p kapable-agent`).
4. **No SSH.** Not installed in the image. Period.
5. **No DB access.** No psql, no drivers, no connection strings. Data API only.
6. **Customer-owned hardware.** Kapable only hosts API + job queue.
7. **Stateless container.** No persistent volumes needed. Workspaces are
   ephemeral (clone per job, push results, delete). Container can be
   replaced at any time without losing state.
8. **Every wall is a backlog item.** When the agent can't do something
   it needs, file a platform gap — don't add workarounds.

---

## Verification

### Smoke Test
```yaml
name: "Pipeline Agent Smoke Test"
steps:
  - name: "Verify agent capabilities"
    type: agent
    prompt: |
      Verify your environment:
      1. Create /workspace/hello.txt with "Hello from pipeline agent"
      2. Confirm bun is available: bun --version
      3. Confirm git is available: git --version
      4. List Kapable tables via Data API
      5. Confirm SSH is NOT available
      6. Confirm psql is NOT available
      7. Report all results
    max_turns: 10
    required_capabilities: ["claude"]
```

### Vantage Integration Test
```yaml
name: "Vantage: Create clients table"
steps:
  - name: "Create table via Data API"
    type: agent
    prompt: |
      Using the Kapable Data API, create a "clients" table with columns:
      id (uuid PK), org_id (uuid), first_name (text), surname (text),
      email (text), profile_state (text default 'Active'), created_at (timestamptz).
      Insert a test client. Read it back. Report results.
    max_turns: 15
    required_capabilities: ["claude"]
```

---

## Dependencies

| Dependency | Status | Required For |
|-----------|--------|-------------|
| k8way gateway | Live | Claude API routing |
| Agent daemon (`kapable-agent`) | Live (host mode) | Stories 2-4 |
| Pipeline agent API | Live | Job claiming |
| `pipeline_agent_jobs` table | Live | Job queue |
| Service token auth | Live | Agent registration |
| GHCR access | Available | Image publishing |
| **Job context with credentials** | **Needs work** | Story 3 |
| **Console: agent status page** | **May need work** | Story 7 |

---

## Non-Goals (This Epic)

- Chrome/browser automation inside the container (separate epic)
- Per-org k8way consumer key auto-provisioning (manual for now)
- Workspace caching across jobs (fresh clone each time)
- Multi-job concurrency (one job at a time per container for now)
- Auto-scaling (customer manages their own scaling)
- Rust compilation inside container (TypeScript/Bun only for now)
- Windows containers (Linux amd64 + arm64 only)
- GPU access (CPU-only for now)
