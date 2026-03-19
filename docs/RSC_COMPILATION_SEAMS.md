# RSC → Kapable Compilation Seams

> Maps where Hardy's RSC/AYIOS engine could automate what we built manually.
> Each seam identifies: the RSC layer, the Kapable API surface, and the manual work it replaces.
>
> **Created:** 2026-03-19 | **Status:** Reference document

---

## Overview

The EFG preconversion manually created 82 Kapable typed tables from RSC L0 canonical specs.
This document identifies the seams where RSC compilers would plug in to automate this process.

```
RSC Canonical Spec                    Kapable Platform
─────────────────                    ─────────────────
L0: Entity definitions    ──────►   PUT /v1/_meta/tables (typed)
L0: Invariant predicates  ──────►   SSF validators (TypeScript→WASM)
L1: Effect flows          ──────►   AI Flows (DAG executor)
L2: Access declarations   ──────►   RLS policies + RBAC roles
L3: Integration specs     ──────►   SSF external API callers
L4: Presentation specs    ──────►   React component generation
```

---

## Seam 1: Schema Compiler (L0 Entities → Typed Tables)

### What it replaces
Manual reading of RSC domain files → designing column schemas → curl calls to Data API.
We did this for 507 RSC entities → 82 Kapable tables (dropping UI helpers, flattening hierarchies).

### RSC input format
```
entity CRM_Onboarding_BankDetails {
  account_number: string
  account_holder: string
  status: ENUM_BankStatus
  passed_verification: ENUM_VerificationStatus
  validated: bool
  // reference: CRM_Onboarding_CRMProfile
}
```

### Kapable output format
```json
PUT /v1/_meta/tables/client_bank_details
{
  "storage_mode": "typed",
  "columns": [
    {"name": "client_id", "col_type": "text", "nullable": false, "indexed": true},
    {"name": "account_number", "col_type": "text", "nullable": true},
    {"name": "status", "col_type": "text", "nullable": true},
    {"name": "verification_status", "col_type": "text", "nullable": true}
  ]
}
```

### Compiler responsibilities
1. **Entity filtering** — Drop `*Helper`, `*Iterator`, `Current*`, `*View` entities (35-40% of RSC corpus is UI bloat)
2. **Name mapping** — RSC module_entity → Kapable table name (e.g., `CRM_Onboarding_BankDetails` → `client_bank_details`)
3. **Type mapping** — RSC types → Kapable col_types:
   - `string` → `text`
   - `i64` / `integer` → `integer`
   - `f64` / `decimal` → `float`
   - `bool` → `boolean`
   - `datetime` → `timestamp`
   - `enum` → `text` (allowed values in metadata)
   - `list<T>` → `json` (no native arrays)
4. **Reference resolution** — RSC `reference: Entity` → `text` column with `_id` suffix (application-level FK)
5. **Hierarchy flattening** — Deep 1:1 compositions (e.g., `Transaction → InvestorProfile → Address`) become separate tables with FK columns rather than nested fields
6. **Index inference** — FK columns and natural keys get `indexed: true`
7. **Platform collision avoidance** — `tasks` → `advisor_tasks`, `notifications` → `advisor_notifications`

### Tables affected
All 82 tables. Compiler would produce the exact `create-phase2-tables.sh` script we wrote manually.

### Gaps to solve
- **Enum metadata** — Kapable has no enum type; compiler must emit allowed values as documentation or SSF validators
- **No FK constraints** — Compiler must emit application-level referential integrity rules
- **No UPSERT** — Compiler must generate GET+conditional POST/PATCH patterns

---

## Seam 2: Invariant Compiler (L0 Predicates → SSF Validators)

### What it replaces
Manual extraction of 283 RSC invariants → hand-written validation rules in frontend hooks.

### RSC input format
```
invariant beneficial_owner_threshold {
  scope: client_relationships
  predicate: share_percentage >= 25 IMPLIES requires_ubo = true
  severity: error
  message: "Ownership >= 25% triggers UBO requirements"
}
```

### Kapable output: SSF validator
```typescript
// Generated: client_relationships_validator.ts
export default function validate(row: Record<string, any>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (row.share_percentage >= 25 && !row.requires_ubo) {
    errors.push("Ownership >= 25% triggers UBO requirements");
  }
  return { valid: errors.length === 0, errors };
}
```

### Compiler responsibilities
1. **Predicate parsing** — RSC predicate expressions → TypeScript boolean expressions
2. **Cross-table validation** — Some invariants span tables (e.g., "holdings percentages sum to ~100%"); these become SSF functions that query related rows via Data ABI
3. **Severity mapping** — RSC `error`/`warning` → SSF return codes that trigger/allow mutation
4. **Trigger points** — Map invariants to pre-insert/pre-update hooks on specific tables
5. **Data ABI integration** — Cross-table invariants need `kapable.query()` calls via the Data ABI

### Invariant domains
| Domain | Count | Complexity | Notes |
|--------|-------|-----------|-------|
| Client (CRM_Onboarding) | 81 | Medium | ID format validation, compliance checks, threshold triggers |
| Portfolio (Contract) | 90 | High | Percentage bounds, allocation sums, Reg28 compliance |
| Task | 60 | Low | State machine transitions, typing constraints |
| Transaction | ~50* | High | Multi-step wizard validation, payment routing rules |
| Masterdata | 66 | Low | Reference data integrity, active/inactive rules |

*Transaction invariants are in L1 flows, not L0 declarations — they'd need the Effect Compiler (Seam 3).

### Tables most affected
- `client_risk_ratings` — 15+ invariants (score bounds, review dates, PEP/sanctions correlation)
- `transactions` — wizard step validation, status transitions, lock rules
- `portfolio_holdings` / `contract_lines` — allocation sum constraints, Reg28 limits
- `standing_instructions` — date bounds, escalation rules, day-of-month validation

---

## Seam 3: Effect Compiler (L1 Flows → AI Flows DAG)

### What it replaces
Manual implementation of business process orchestration (e.g., transaction wizard state machine).

### RSC input
89 effect files in `canonical/effects/` — state transitions, side effects, async workflows.

### Kapable target
AI Flows with Kahn's topological executor — 30 node types supporting:
- Conditional branching
- External API calls
- Human-in-the-loop approval
- Budget-tracked LLM calls

### Key flows to compile
1. **Transaction wizard** — 6-step process: Capture → Review → Submit → OTP → Process → Complete
2. **AML screening** — External API call → result classification → compliance review trigger
3. **Risk rating calculation** — Multi-factor scoring → threshold evaluation → review scheduling
4. **Onboarding workflow** — Document collection → verification → compliance sign-off → activation

### Compiler responsibilities
1. **State machine extraction** — RSC effect chains → DAG node graph
2. **Side effect mapping** — RSC `emit` → AI Flow external action nodes
3. **Guard conditions** — RSC `when` clauses → DAG conditional edges
4. **Human-in-the-loop** — RSC `await approval` → AI Flow approval nodes

### Gap: Transaction wizard
This is the biggest missing piece. The RSC Transaction module has 82 entities but the flows are in L1 (behavioral layer, MIR3 corpus — 4,162 microflows). Compiling MIR3 → AI Flows is a separate research project.

---

## Seam 4: Access Compiler (L2 Security → RLS Policies)

### What it replaces
Manual RLS policy design per table.

### RSC input
```
access CRM_Onboarding_BankDetails {
  read: advisor_of(client) OR compliance_officer
  write: advisor_of(client) AND NOT client.is_locked
  delete: compliance_officer ONLY
}
```

### Kapable output
Kapable RLS automatically scopes by `org_id`. Additional role-based restrictions would be:
1. Row-level: `WHERE created_by = current_user_id OR role = 'admin'`
2. Column-level: Sensitive fields (account_number, id_number) masked for non-compliance roles

### Compiler responsibilities
1. **Role mapping** — RSC roles → Kapable RBAC roles (admin, member, viewer)
2. **Scope expansion** — `advisor_of(client)` → `WHERE advisor_id = current_user_id`
3. **Temporal access** — Some access rules are time-bound (e.g., review window)
4. **Audit trail** — Access events → `compliance_rules` table entries

### Tables with complex access
- `client_bank_details` — PCI-sensitive, masked for non-compliance
- `client_aml_checks` — compliance-only write access
- `transactions` — locked transactions read-only for all except admin
- `beneficial_owners` — UBO data has FICA privacy requirements

---

## Seam 5: Integration Compiler (L3 → SSF External Callers)

### What it replaces
Manual implementation of 55 consumed REST API calls and 16 published endpoints.

### Published endpoints to replicate
These are the EFG REST endpoints that external systems call:
1. Task creation / update
2. Transaction submission
3. Risk response retrieval
4. Mobile profile access
5. Dashboard data aggregation

Each maps to a Kapable SSF that accepts the request, validates, and writes to typed tables.

### Consumed endpoints to bridge
When live Mendix API access arrives, these become SSF functions calling EFG via the XAS protocol:
- PlatformGateway (Azure service bus)
- OIDC provider
- e-Signature services
- Document generation
- MorningStar data feeds
- Astute compliance checks

### MCP tools available
The `mxtoai/mx_admin/tools/mxruntime/` directory has 13 MCP tools for the XAS protocol.
These would be wrapped as Kapable SSF functions calling the Mendix runtime.

---

## Implementation Priority

| Seam | Value | Effort | Priority | Notes |
|------|-------|--------|----------|-------|
| **Schema Compiler** | High | Medium | P1 | 80-90 tables is manageable manually, but scales poorly |
| **Invariant Compiler** | Very High | High | P1 | 283 invariants are expensive to hand-code as SSF |
| **Access Compiler** | High | Low | P2 | Kapable RLS covers 80% of cases automatically |
| **Effect Compiler** | Very High | Very High | P3 | MIR3 corpus is 4,162 flows — needs research |
| **Integration Compiler** | Medium | High | P3 | Blocked on live Mendix API access |

---

## Table-to-RSC Traceability

Every Phase 2 table traces back to specific RSC entities:

| Kapable Table | RSC Entity | RSC File | Invariant Count |
|---------------|-----------|----------|-----------------|
| `transactions` | Transaction_Transaction | Transaction.rsc | ~50 (in L1) |
| `transaction_steps` | Transaction_ProcessingStep | Transaction.rsc | 5 |
| `transaction_investments` | Transaction_Investment + InvestmentLine | Transaction.rsc | 12 |
| `transaction_documents` | Transaction_TransactionDocument | Transaction.rsc | 8 |
| `otp_details` | Transaction_OTPDetails | Transaction.rsc | 4 |
| `client_bank_details` | CRM_Onboarding_BankDetails | CRM_Onboarding.rsc | 11 |
| `client_aml_checks` | CRM_Onboarding_AMLCheck | CRM_Onboarding.rsc | 8 |
| `client_risk_ratings` | CRM_Onboarding_ClientRiskRating + Results | CRM_Onboarding.rsc | 15 |
| `client_addresses` | Transaction_Address (shared) | Transaction.rsc | 3 |
| `beneficial_owners` | CRM_Onboarding_BeneficialOwnerIndividual + Entity | CRM_Onboarding.rsc | 9 |
| `authorized_signatories` | CRM_Onboarding_AuthorisedSignatory | CRM_Onboarding.rsc | 6 |
| `contracts` | Contract_Contract | Contract.rsc | 14 |
| `contract_lines` | Contract_ContractLine | Contract.rsc | 8 |
| `standing_instructions` | Contract_StandingInstruction | Contract.rsc | 12 |
| `masterdata_instruments` | Masterdata_Instruments | Masterdata.rsc | 4 |
| `masterdata_banks` | Masterdata_Bank + BankBranch | Masterdata.rsc | 2 |
| `masterdata_countries` | Masterdata_Country | Masterdata.rsc | 3 |
| `reg28_limits` | Masterdata_Regulation28Limits | Masterdata.rsc | 6 |
| `fsp_licenses` | Masterdata_FSPLicense | Advisor.rsc | 5 |
| `compliance_rules` | (synthetic — aggregates RSC invariants) | Multiple | N/A |
