# Vantage Advisor Hub — Backend Reference Design

> Grounding artifact for migrating Vantage from Supabase to Kapable Data API,
> enriched by EFG RSC L0 domain specifications.
>
> **Status:** Living document. Update as migration progresses.
> **Created:** 2026-03-18 | **Platform App ID:** `3ee81a58-8035-4fcc-993f-303fe956f3d4`

---

## 1. Architecture Overview

### Current State (Supabase)

```
Browser (React Router 7 SPA)
  ├── Cookie session (kses_* from Kapable auth)
  ├── 55+ React hooks (useState + useEffect)
  └── Supabase JS client (anon key, direct DB calls)
        ↓
  Supabase PostgreSQL (50+ tables, seeded demo data)
  + Synthetic portfolio data (in-memory generation)
```

### Target State (Kapable)

```
Browser (React Router 7 SSR)
  ├── Cookie session (kses_* from Kapable auth) ← already done
  ├── Route loaders (SSR data fetching)
  ├── React hooks → Kapable SDK fetch calls
  └── usePlatformSSE() for real-time updates
        ↓
  Kapable Data API (tables created via API)
  + Kapable SSF (validation, business logic as WASM)
  + RSC invariant validators (aspirational)
```

### Key Migration Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth | Keep as-is | Already migrated to Kapable (`session.server.ts`) |
| Data access | Kapable SDK `fetch` | Replace `supabase.from().select()` with REST calls |
| Real-time | `usePlatformSSE()` | Replace `channel.on("postgres_changes")` |
| Multi-tenancy | Kapable RLS (`app.current_org_id`) | Replace `user_id` scoping |
| Validation | Kapable SSF + RSC invariants | Replace client-side-only validation |
| Soft deletes | Keep pattern | `is_deleted` + `deleted_at` columns retained |
| Synthetic data | Replace with real tables | `regional360ViewData.ts` → actual portfolio records |

---

## 2. Domain Model

### 2.1 Domain Map (Vantage Tables + EFG Enrichment)

```
┌─────────────────────────────────────────────────────────────┐
│                    VANTAGE DOMAIN MODEL                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │   CLIENTS    │  │  PORTFOLIOS  │  │   TRANSACTIONS    │  │
│  │  (CRM_Onb)   │  │  (Contract)  │  │  (Transaction)    │  │
│  │              │  │              │  │                   │  │
│  │ clients      │  │ portfolios   │  │ (NEW from EFG)    │  │
│  │ relationships│  │ holdings     │  │ transaction_wiz   │  │
│  │ contacts     │  │ products     │  │ investments       │  │
│  │ views        │  │ providers    │  │ otp_details       │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬──────────┘  │
│         │                 │                    │             │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌────────▼──────────┐  │
│  │   PLANNING   │  │    TASKS     │  │   COMPLIANCE      │  │
│  │              │  │   (Tasks)    │  │   (CRM_Onb +      │  │
│  │ fp_workflows │  │              │  │    Advisor)        │  │
│  │ assets       │  │ tasks        │  │                   │  │
│  │ liabilities  │  │ task_clients │  │ commissions       │  │
│  │ income       │  │ task_history │  │ cpd_cycles        │  │
│  │ expenses     │  │ task_docs    │  │ cpd_records       │  │
│  │ goals        │  │ workflows    │  │ fais_controls     │  │
│  └──────────────┘  └──────────────┘  │ aml_checks (NEW)  │  │
│                                      │ risk_ratings(NEW) │  │
│  ┌──────────────┐  ┌──────────────┐  └───────────────────┘  │
│  │   COMMS      │  │  CALENDAR    │                         │
│  │              │  │              │  ┌───────────────────┐  │
│  │ emails       │  │ cal_events   │  │   OPPORTUNITIES   │  │
│  │ direct_msgs  │  │ recordings   │  │                   │  │
│  │ campaigns    │  │              │  │ opp_projects      │  │
│  │ comms_log    │  │              │  │ project_opps      │  │
│  │              │  │              │  │ project_tasks     │  │
│  └──────────────┘  └──────────────┘  │ tlh_*             │  │
│                                      └───────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │  DOCUMENTS   │  │  REFERENCE   │  ┌───────────────────┐  │
│  │ (Documents)  │  │ (Masterdata) │  │    SETTINGS       │  │
│  │              │  │              │  │                   │  │
│  │ documents    │  │ products     │  │ user_settings     │  │
│  │ doc_types    │  │ providers    │  │ user_jurisdictions│  │
│  │ attachments  │  │ categories   │  │ widget_layouts    │  │
│  │              │  │ gen_lists    │  │ email_settings    │  │
│  └──────────────┘  └──────────────┘  │ saved_filters     │  │
│                                      └───────────────────┘  │
│  (RSC Domain)  = EFG module providing formal specification  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 EFG Domain Modules → Vantage Mapping

| EFG RSC Module | Entities | Invariants | Vantage Coverage | Gap |
|----------------|----------|------------|------------------|-----|
| **CRM_Onboarding** | 150 | 81 | ~70% (clients, relationships) | Missing: AML checks, risk ratings, bank details verification, PEP/sanctions screening |
| **Contract** | 31 | 90 | ~40% (portfolios, holdings) | Missing: standing instructions, contract lifecycle, fund allocations |
| **Transaction** | 82 | 0* | 0% | Entire investment transaction wizard (new/switch/withdraw) — **biggest gap** |
| **Tasks** | 66 | 2 | ~60% (tasks, task_clients) | Missing: typed task subtypes (Onboarding/Transfer/CRM), task line items |
| **Documents** | 12 | 10 | ~50% (documents, doc_types) | Missing: relationship source tracking, compliance-linked docs |
| **Advisor** | 59 | 34 | ~20% (team_members) | Missing: FSP licensing, authorization categories, permission model |
| **Masterdata** | 84 | 66 | ~30% (products, providers) | Missing: Reg28 limits, fee rules, instruments, banks, regulatory config |
| **General** | 15 | 0 | ~10% (notifications) | Missing: feature flags, audit trail, history line items |

*Transaction invariants are enforced in L1 (behavioral) flows, not L0 declarations.

---

## 3. Table Migration Map

### 3.1 Direct Migrations (Supabase → Kapable Data API)

Each table below maps from the current Supabase schema to a Kapable table definition.
The `Auth Tier` column indicates which Kapable auth level protects the endpoint.

#### Core Client Tables

| # | Supabase Table | Kapable Table | Auth Tier | RSC Module | Notes |
|---|---------------|---------------|-----------|------------|-------|
| 1 | `clients` | `clients` | `data_key` | CRM_Onboarding | Core entity. Add EFG fields: `is_pep`, `is_sanctioned`, `onboarding_status` |
| 2 | `client_relationships` | `client_relationships` | `data_key` | CRM_Onboarding | Add `share_percentage` validation [0,100] |
| 3 | `client_contacts` | `client_contacts` | `data_key` | CRM_Onboarding | Professional advisors per client |
| 4 | `client_views` | `client_views` | `data_key` | — | Recently viewed tracking |
| 5 | `client_notes` | `client_notes` | `data_key` | — | Interaction log |
| 6 | `client_products` | `client_products` | `data_key` | Contract | Map to EFG `ContractLine` pattern |
| 7 | `client_assets` | `client_assets` | `data_key` | — | Balance sheet (Vantage-specific) |
| 8 | `client_liabilities` | `client_liabilities` | `data_key` | — | Balance sheet (Vantage-specific) |
| 9 | `client_income` | `client_income` | `data_key` | — | Income sources |
| 10 | `client_expenses` | `client_expenses` | `data_key` | — | Expense tracking |
| 11 | `client_goals` | `client_goals` | `data_key` | — | Financial goals |

#### Portfolio & Investment Tables

| # | Supabase Table | Kapable Table | Auth Tier | RSC Module | Notes |
|---|---------------|---------------|-----------|------------|-------|
| 12 | `portfolios` | `portfolios` | `data_key` | Contract | Map to EFG `Contract` entity |
| 13 | `portfolio_holdings` | `portfolio_holdings` | `data_key` | Contract | Map to EFG `ContractLine` |
| 14 | `products` | `products` | `data_key` | Masterdata | Enrich with EFG `allows_switch`, `requires_reg28` |
| 15 | `product_providers` | `product_providers` | `data_key` | Masterdata | Add `swift_code`, `provider_type` |
| 16 | `product_categories` | `product_categories` | `data_key` | Masterdata | — |

#### Task & Workflow Tables

| # | Supabase Table | Kapable Table | Auth Tier | RSC Module | Notes |
|---|---------------|---------------|-----------|------------|-------|
| 17 | `tasks` | `tasks` | `data_key` | Tasks | Add `task_number` sequence, EFG status enum |
| 18 | `task_clients` | `task_clients` | `data_key` | Tasks | Many-to-many junction |
| 19 | `task_documents` | `task_documents` | `data_key` | Tasks | — |
| 20 | `task_communications` | `task_communications` | `data_key` | Tasks | — |
| 21 | `task_history` | `task_history` | `data_key` | Tasks | Audit log |
| 22 | `saved_task_filters` | `saved_task_filters` | `data_key` | — | User preference |
| 23 | `task_type_standards` | `task_type_standards` | `data_key` | Tasks | SLA config |
| 24 | `workflow_templates` | `workflow_templates` | `data_key` | Tasks | — |
| 25 | `workflows` | `workflows` | `data_key` | Tasks | — |
| 26 | `advice_workflows` | `advice_workflows` | `data_key` | Tasks | — |
| 27 | `fais_controls` | `fais_controls` | `data_key` | CRM_Onboarding | FAIS compliance |

#### Financial Planning Tables

| # | Supabase Table | Kapable Table | Auth Tier | RSC Module | Notes |
|---|---------------|---------------|-----------|------------|-------|
| 28 | `financial_planning_workflows` | `fp_workflows` | `data_key` | — | 6-step planning wizard |
| 29 | `fp_workflow_documents` | `fp_workflow_documents` | `data_key` | Documents | — |
| 30 | `goal_product_links` | `goal_product_links` | `data_key` | — | — |
| 31 | `bucket_allocations` | `bucket_allocations` | `data_key` | — | Three-bucket strategy |
| 32 | `product_implementations` | `product_implementations` | `data_key` | — | Step 5 tracking |
| 33 | `sla_commitments` | `sla_commitments` | `data_key` | — | Step 6 SLA |

#### Communication Tables

| # | Supabase Table | Kapable Table | Auth Tier | RSC Module | Notes |
|---|---------------|---------------|-----------|------------|-------|
| 34 | `emails` | `emails` | `data_key` | — | — |
| 35 | `email_clients` | `email_clients` | `data_key` | — | — |
| 36 | `email_tasks` | `email_tasks` | `data_key` | — | — |
| 37 | `email_attachments` | `email_attachments` | `data_key` | Documents | — |
| 38 | `email_settings` | `email_settings` | `data_key` | — | — |
| 39 | `direct_messages` | `direct_messages` | `data_key` | — | WhatsApp/SMS |
| 40 | `communications` | `communications` | `data_key` | — | Unified log |
| 41 | `communication_campaigns` | `communication_campaigns` | `data_key` | — | — |
| 42 | `campaign_attachments` | `campaign_attachments` | `data_key` | — | — |

#### Calendar & Meeting Tables

| # | Supabase Table | Kapable Table | Auth Tier | RSC Module | Notes |
|---|---------------|---------------|-----------|------------|-------|
| 43 | `calendar_events` | `calendar_events` | `data_key` | — | — |
| 44 | `meeting_recordings` | `meeting_recordings` | `data_key` | — | — |

#### Compliance & Finance Tables

| # | Supabase Table | Kapable Table | Auth Tier | RSC Module | Notes |
|---|---------------|---------------|-----------|------------|-------|
| 45 | `commissions` | `commissions` | `data_key` | — | — |
| 46 | `cpd_cycles` | `cpd_cycles` | `data_key` | — | — |
| 47 | `cpd_records` | `cpd_records` | `data_key` | — | — |

#### Opportunity & TLH Tables

| # | Supabase Table | Kapable Table | Auth Tier | RSC Module | Notes |
|---|---------------|---------------|-----------|------------|-------|
| 48 | `opportunity_projects` | `opportunity_projects` | `data_key` | — | — |
| 49 | `project_opportunities` | `project_opportunities` | `data_key` | — | — |
| 50 | `project_tasks` | `project_tasks` | `data_key` | — | — |
| 51 | `tlh_opportunities` | `tlh_opportunities` | `data_key` | — | — |
| 52 | `tlh_trades` | `tlh_trades` | `data_key` | — | — |
| 53 | `tlh_fund_replacements` | `tlh_fund_replacements` | `data_key` | — | — |

#### Settings & UI Tables

| # | Supabase Table | Kapable Table | Auth Tier | RSC Module | Notes |
|---|---------------|---------------|-----------|------------|-------|
| 54 | `user_settings` | `user_settings` | `data_key` | — | — |
| 55 | `user_jurisdictions` | `user_jurisdictions` | `data_key` | — | — |
| 56 | `user_widget_layouts` | `user_widget_layouts` | `data_key` | — | — |
| 57 | `team_members` | `team_members` | `data_key` | Advisor | — |
| 58 | `notifications` | `notifications` | `data_key` | General | — |
| 59 | `advisor_posts` | `advisor_posts` | `data_key` | — | — |

#### Vantage-Specific (No Supabase table yet)

| # | Supabase Table | Kapable Table | Auth Tier | RSC Module | Notes |
|---|---------------|---------------|-----------|------------|-------|
| 60 | — | `whatsapp_favourites` | `data_key` | — | Referenced in hooks but no migration |
| 61 | — | `admin_general_lists` | `data_key` | Masterdata | Admin reference lists |
| 62 | — | `admin_funds` | `data_key` | Masterdata | Fund reference for TLH |

### 3.2 New Tables from EFG (Phase 2+)

These don't exist in Vantage yet but are needed for full EFG parity:

| # | Kapable Table | RSC Module | Purpose |
|---|---------------|------------|---------|
| 63 | `client_bank_details` | CRM_Onboarding | Bank accounts with verification status |
| 64 | `client_aml_checks` | CRM_Onboarding | AML/CFT screening results |
| 65 | `client_risk_ratings` | CRM_Onboarding | FICA risk classification |
| 66 | `client_addresses` | CRM_Onboarding | Structured addresses (physical/postal/business) |
| 67 | `beneficial_owners` | CRM_Onboarding | UBO tracking (>25% ownership) |
| 68 | `authorized_signatories` | CRM_Onboarding | Entity signatories |
| 69 | `contracts` | Contract | Investment contract lifecycle |
| 70 | `contract_lines` | Contract | Fund positions within contract |
| 71 | `standing_instructions` | Contract | Recurring investment rules |
| 72 | `transactions` | Transaction | Investment transaction wizard |
| 73 | `transaction_steps` | Transaction | Wizard step tracking |
| 74 | `transaction_investments` | Transaction | Investment details per transaction |
| 75 | `transaction_documents` | Transaction | Document verification per transaction |
| 76 | `otp_details` | Transaction | OTP verification tracking |
| 77 | `masterdata_instruments` | Masterdata | Fund/ETF reference data (ISIN, asset class) |
| 78 | `masterdata_banks` | Masterdata | Bank reference data |
| 79 | `masterdata_countries` | Masterdata | Country reference (blacklist/greylist) |
| 80 | `reg28_limits` | Masterdata | Regulatory limits (SA pension fund rules) |
| 81 | `fsp_licenses` | Advisor | FAIS licensing per advisor |
| 82 | `compliance_rules` | CRM_Onboarding | Dynamic compliance rule engine |

---

## 4. Multi-Tenancy Model

### Current (Supabase): User-Scoped

Every table has `user_id` column with RLS policy: `auth.uid() = user_id`.
This means each advisor sees only their own data. No organization-level sharing.

### Target (Kapable): Org-Scoped with Role-Based Access

```
Organization (e.g., "Vantage Wealth Advisors")
  ├── org_member: advisor_1@vantage.co.za (role: admin)
  ├── org_member: advisor_2@vantage.co.za (role: member)
  └── org_member: assistant@vantage.co.za (role: viewer)

Kapable RLS: WHERE org_id = app.current_org_id
```

**Migration path:**
1. Replace `user_id` with `org_id` on all tables
2. Add `created_by` (UUID) for audit trail (replaces `user_id` semantics)
3. Kapable RLS automatically scopes by `org_id`
4. Role-based visibility handled by Kapable RBAC

**EFG RSC parallel:** The `Advisor` domain module defines authorization categories (Cat1/Cat2)
and permission types (Compliance, CSReview) that map to Kapable roles.

---

## 5. Hook Migration Guide

### 5.1 Pattern: Supabase Hook → Kapable SDK

**Before (Supabase):**
```typescript
const useClients = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      else setData(data);
    };
    fetch();
  }, []);
  return { data };
};
```

**After (Kapable SDK):**
```typescript
// Option A: Route loader (SSR — preferred)
export async function loader({ request }: LoaderFunctionArgs) {
  const { sessionToken } = await requireAuth(request);
  const res = await fetch(`${KAPABLE_API}/v1/clients?order=created_at.desc`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  return { clients: await res.json() };
}

// Option B: Client-side hook (for dynamic queries)
const useClients = () => {
  const { sessionToken } = useAuth();
  return useQuery({
    queryKey: ["clients"],
    queryFn: () => kapableClient.from("clients").select().order("created_at", "desc"),
  });
};
```

### 5.2 Real-Time Migration

**Before (Supabase):**
```typescript
supabase.channel("notifications")
  .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, callback)
  .subscribe();
```

**After (Kapable SSE):**
```typescript
// In parent layout loader — already done for most pages via _app.tsx
// SSE auto-revalidates loaders when data changes
// No explicit subscription needed — usePlatformSSE() handles it
```

### 5.3 Hook-by-Hook Migration Checklist

| Hook File | Tables | Priority | Complexity | Notes |
|-----------|--------|----------|------------|-------|
| `useClients.ts` | clients | P0 | Low | Straightforward CRUD |
| `useClientDetail.ts` | clients | P0 | Low | Single-row fetch + update |
| `useTasks.ts` | tasks, clients | P0 | Medium | Join pattern needed |
| `useTaskSearch.ts` | tasks, clients | P1 | Medium | Complex filters |
| `useTasksEnhanced.ts` | tasks, task_clients, task_history | P1 | High | Multi-table + history |
| `useEmails.ts` | emails, clients, email_tasks | P1 | High | Client matching logic |
| `useEmailDetail.ts` | emails, email_attachments | P1 | Medium | — |
| `useCalendarEvents.ts` | calendar_events | P1 | Low | — |
| `useNotifications.ts` | notifications, user_settings | P0 | Medium | Real-time subscription |
| `useClientRelationships.ts` | client_relationships | P1 | Low | — |
| `useClientContacts.ts` | client_contacts | P1 | Low | — |
| `useClientProducts.ts` | client_products, products | P1 | Medium | Join |
| `useClientNotes.ts` | client_notes | P2 | Low | — |
| `usePortfolios.ts` | portfolios, portfolio_holdings | P1 | Medium | — |
| `useDocuments.ts` | documents, document_types | P2 | Medium | — |
| `useCommunications.ts` | communications | P2 | Low | — |
| `useCampaigns.ts` | communication_campaigns | P2 | Medium | — |
| `useDirectMessages.ts` | direct_messages | P2 | Low | WhatsApp/SMS |
| `useCommissions.ts` | commissions | P2 | Medium | — |
| `useCPD.ts` | cpd_cycles, cpd_records | P2 | Medium | — |
| `useWorkflows.ts` | workflows, workflow_templates | P2 | Medium | — |
| `useFPWorkflows.ts` | financial_planning_workflows | P2 | High | 6-step wizard |
| `useTLHData.ts` | tlh_opportunities, tlh_trades | P2 | Medium | — |
| `useOpportunities.ts` | opportunity_projects, project_* | P2 | Medium | — |
| `useTeamMembers.ts` | team_members | P1 | Low | — |
| `useUserSettings.ts` | user_settings | P0 | Low | — |
| `useUserJurisdictions.ts` | user_jurisdictions | P1 | Low | — |
| `useWidgetLayouts.ts` | user_widget_layouts | P2 | Low | — |
| `useAdminData.ts` | admin_general_lists, products, etc | P1 | High | Multi-table reference data |
| `useOnboardingProgress.ts` | tasks (filtered) | P1 | Low | — |
| `useAdvisorPosts.ts` | advisor_posts | P2 | Low | — |

**Priority key:** P0 = core app works, P1 = main features work, P2 = full feature parity

---

## 6. Business Rules & Invariants

### 6.1 Rules from EFG RSC (to become Kapable SSF validators)

These invariants are extracted from the EFG RSC L0 domain layer (283 total).
Each should become a Kapable serverless function that validates on insert/update.

#### Client Domain (81 invariants)

```yaml
# Identity
- rule: "client_type_exclusive"
  desc: "A client cannot be both Individual AND Entity type"
  tables: [clients]
  validation: "NOT (client_type = 'individual' AND has_entity_details)"

- rule: "id_number_format"
  desc: "SA ID number must be 13 digits matching YYMMDD format"
  tables: [clients]
  validation: "id_number ~ '^[0-9]{13}$' AND substring(id_number, 1, 6) is valid date"

- rule: "beneficial_owner_threshold"
  desc: "Ownership >= 25% triggers UBO requirements"
  tables: [client_relationships]
  validation: "share_percentage >= 25 IMPLIES requires_ubo = true"

# Compliance
- rule: "risk_rating_review_date"
  desc: "Next review must be after calculation date"
  tables: [client_risk_ratings]
  validation: "next_review_date > calculated_date"

- rule: "aml_score_bounds"
  desc: "AML match score must be 0-100"
  tables: [client_aml_checks]
  validation: "match_score BETWEEN 0 AND 100"

- rule: "aml_review_completion"
  desc: "If review required, must be completed"
  tables: [client_aml_checks]
  validation: "review_required = true IMPLIES review_completed IS NOT NULL"
```

#### Portfolio Domain (90 invariants)

```yaml
# Financial bounds
- rule: "percentage_bounds"
  desc: "All percentage fields must be 0-100"
  tables: [portfolio_holdings, client_products]
  validation: "percentage_allocation BETWEEN 0 AND 100"

- rule: "non_negative_values"
  desc: "Market values, units cannot be negative"
  tables: [portfolios, portfolio_holdings]
  validation: "total_value >= 0 AND units >= 0"

- rule: "allocation_sum"
  desc: "Holdings percentages should sum to ~100%"
  tables: [portfolio_holdings]
  validation: "SUM(percentage_allocation) WHERE portfolio_id = X ≈ 100"

# Standing instructions (EFG Contract domain)
- rule: "contribution_day_bounds"
  desc: "Collection day must be valid calendar day"
  tables: [standing_instructions]
  validation: "contribution_day BETWEEN 1 AND 31"

- rule: "escalation_bounds"
  desc: "Escalation percentage must be non-negative"
  tables: [standing_instructions]
  validation: "escalation_percentage >= 0"
```

#### Task Domain (60 invariants)

```yaml
# Status machine
- rule: "task_status_transitions"
  desc: "Valid transitions: Not Started→In Progress→Completed/Cancelled"
  tables: [tasks]
  validation: "status transition is valid per state machine"

- rule: "completed_task_immutable"
  desc: "Completed tasks cannot change status (except via admin override)"
  tables: [tasks]
  validation: "old.status = 'Completed' IMPLIES new.status = 'Completed'"

# Task typing (from EFG)
- rule: "transfer_task_requires_contract"
  desc: "Transfer tasks must reference a portfolio/contract"
  tables: [tasks]
  validation: "task_type = 'Transfer' IMPLIES portfolio_id IS NOT NULL"
```

### 6.2 RSC Integration Seams

These are the points where Hardy's RSC engine could eventually plug in:

| Seam | Current Approach | RSC Evolution |
|------|-----------------|---------------|
| **Schema generation** | Manual table creation via Data API | RSC L0 compiles to table definitions |
| **Validation rules** | Kapable SSF (TypeScript→WASM) | RSC invariants compile to WASM validators |
| **State machines** | Hand-coded status transitions | RSC L1 flows compile to state machine definitions |
| **Access control** | Kapable RBAC | RSC L2 security specs compile to RLS policies |
| **API contracts** | Kapable Data API auto-generates | RSC L3 integration specs define API shape |
| **UI bindings** | React components | RSC L4 presentation specs inform component generation |

**Key insight:** Each RSC layer maps to a Kapable platform capability. The migration path is:
1. **Now:** Use RSC specs as documentation to inform manual implementation
2. **Next:** Write RSC-to-Kapable compilers for L0 (schema) and invariants (validation)
3. **Later:** Full bidirectional — changes in Kapable reflect back to RSC specs

---

## 7. Data Seeding Strategy

### 7.1 Current Seed Functions (Supabase Edge Functions)

| Function | Target Tables | Records | Priority |
|----------|--------------|---------|----------|
| `seed-demo-clients` | clients | ~20 realistic profiles | P0 |
| `seed-demo-tasks` | tasks | ~50 varied tasks | P0 |
| `seed-demo-communications` | communications | ~30 entries | P1 |
| `seed-calendar-events` | calendar_events | ~20 events | P1 |
| `seed-meeting-recordings` | meeting_recordings | ~5 recordings | P2 |
| `seed-email-tasks` | email_tasks | ~15 links | P1 |
| `seed-onboarding-tasks` | tasks (filtered) | ~10 onboarding tasks | P1 |
| `seed-admin-reference-data` | admin_general_lists, task_type_standards | Reference data | P0 |
| `seed-tlh-clients` | tlh_opportunities | ~4 TLH scenarios | P2 |
| `seed-instruments-data` | products, admin_funds | Fund reference | P1 |
| `seed-providers-data` | product_providers | Provider list | P1 |
| `seed-team-members` | team_members | ~5 team members | P0 |
| `seed-meeting-prep-data` | calendar_events (enriched) | AI prep notes | P2 |
| `seed-notifications` | notifications | ~10 notifications | P1 |
| `seed-open-tasks` | tasks | Additional tasks | P1 |
| `seed-whatsapp-enhanced` | direct_messages | WhatsApp history | P2 |

### 7.2 Migration Path

**Phase 1:** Convert seed functions to Kapable Data API POST calls (bulk insert).
**Phase 2:** Convert to Kapable serverless functions (SSF) for on-demand seeding.
**Phase 3:** Replace synthetic `regional360ViewData.ts` with real portfolio records in DB.

### 7.3 Synthetic Data Replacement

The `regional360ViewData.ts` file generates portfolio data in-memory based on client ID + jurisdiction.
This must be replaced with actual database records:

| Synthetic Type | Target Table | Notes |
|---------------|-------------|-------|
| `OnPlatformProduct` | `client_products` + `portfolios` | Investment holdings |
| `ExternalProduct` | `client_products` (external flag) | Third-party holdings |
| `PlatformCashAccount` | `client_products` (cash type) | Cash accounts |
| `WillData` | `client_products` (will type) | Estate planning |
| `ShortTermProduct` | `client_products` (insurance type) | Short-term insurance |
| `RiskProduct` | `client_products` (risk type) | Life insurance |
| `MedicalAid` | `client_products` (medical type) | Health insurance |

---

## 8. EFG RSC Source Files

Reference files for domain model enrichment:

| Layer | Path | Content |
|-------|------|---------|
| L0 Domain | `mxtoai/mx_admin/mx_apps/EFG/canonical/domains/CRM_Onboarding.rsc` | 150 entities, 81 invariants — clients, compliance |
| L0 Domain | `mxtoai/mx_admin/mx_apps/EFG/canonical/domains/Contract.rsc` | 31 entities, 90 invariants — portfolios, holdings |
| L0 Domain | `mxtoai/mx_admin/mx_apps/EFG/canonical/domains/Transaction.rsc` | 82 entities — investment workflows |
| L0 Domain | `mxtoai/mx_admin/mx_apps/EFG/canonical/domains/Tasks.rsc` | 66 entities — task management |
| L0 Domain | `mxtoai/mx_admin/mx_apps/EFG/canonical/domains/Documents.rsc` | 12 entities — document management |
| L0 Domain | `mxtoai/mx_admin/mx_apps/EFG/canonical/domains/Advisor.rsc` | 59 entities — advisor licensing |
| L0 Domain | `mxtoai/mx_admin/mx_apps/EFG/canonical/domains/Masterdata.rsc` | 84 entities — reference data, regulatory |
| L0 Domain | `mxtoai/mx_admin/mx_apps/EFG/canonical/domains/General.rsc` | 15 entities — system config |
| Context | `mxtoai/mx_admin/mx_apps/EFG/CONTEXT.md` | Session charter, architecture overview |

---

## 9. Migration Execution Order

### Sprint 1: Foundation (P0)
1. Create all 62 Kapable tables via Data API
2. Migrate `useClients`, `useClientDetail`, `useUserSettings`, `useNotifications` hooks
3. Port `seed-demo-clients`, `seed-admin-reference-data`, `seed-team-members`
4. Verify: Client list, client detail, settings all work with Kapable backend

### Sprint 2: Core Features (P1)
5. Migrate task hooks (`useTasks`, `useTaskSearch`, `useTasksEnhanced`)
6. Migrate email hooks (`useEmails`, `useEmailDetail`)
7. Migrate calendar hooks (`useCalendarEvents`)
8. Port remaining P1 seed functions
9. Wire up SSE for real-time notifications

### Sprint 3: Full Parity (P2)
10. Migrate all remaining hooks (communications, documents, workflows, TLH, opportunities)
11. Replace `regional360ViewData.ts` with real portfolio data
12. Port compliance features (commissions, CPD, FAIS)
13. Implement EFG invariants as SSF validators

### Sprint 4: EFG Enrichment
14. Add new tables from EFG (contracts, transactions, AML, risk ratings)
15. Implement transaction wizard state machine
16. Add regulatory rule engine (Reg28, fee rules)
17. RSC L0 → Kapable schema compiler (proof of concept)

---

## 10. Appendix: Enum Types

### Existing (from Supabase migrations)

```sql
-- Task management
CREATE TYPE task_type AS ENUM ('Client Complaint', 'Follow-up', 'Annual Review', 'Portfolio Review', 'Compliance', 'Onboarding', 'Document Request');
CREATE TYPE task_status AS ENUM ('Not Started', 'In Progress', 'Pending Client', 'Completed', 'Cancelled');
CREATE TYPE task_priority AS ENUM ('Low', 'Medium', 'High', 'Urgent');

-- Documents
CREATE TYPE document_status AS ENUM ('Pending', 'Complete', 'Cancelled', 'Expired');

-- Communications
CREATE TYPE email_folder AS ENUM ('Task Pool', 'Inbox', 'Draft', 'Sent', 'Queue', 'Failed', 'Archived');
CREATE TYPE communication_channel AS ENUM ('Email', 'SMS', 'Phone', 'WhatsApp', 'Push', 'Webinar', 'Office Event');

-- Finance
CREATE TYPE commission_status AS ENUM ('Matched', 'Pending', 'Disputed', 'Excessive', 'Reconciled');
CREATE TYPE workflow_status AS ENUM ('Active', 'Complete', 'Inactive', 'Cancelled');

-- Compliance
CREATE TYPE cpd_category AS ENUM ('Ethics', 'Regulatory', 'Professional', 'Product Knowledge');

-- Relationships
CREATE TYPE relationship_type AS ENUM ('Spouse', 'Child', 'Parent', 'Sibling', 'Business Partner', 'Trustee', 'Beneficiary', 'Director', 'Shareholder', 'Member', 'Owner');
CREATE TYPE entity_type AS ENUM ('Individual', 'Trust', 'Company', 'Close Corporation');

-- Calendar
CREATE TYPE calendar_event_type AS ENUM ('Meeting', 'Annual Review', 'Portfolio Review', 'Compliance Review', 'Reminder', 'Personal', 'Team Event', 'Client Call');
CREATE TYPE calendar_event_status AS ENUM ('Scheduled', 'Completed', 'Cancelled');
CREATE TYPE transcription_status AS ENUM ('pending', 'processing', 'completed', 'failed');
```

### New (from EFG RSC — Phase 2+)

```sql
-- Investment transactions
CREATE TYPE transaction_type AS ENUM ('NewBusiness', 'Switch', 'Rebalance', 'Withdrawal', 'AdditionalContribution', 'Quote', 'OngoingFee', 'PhaseIn', 'ExternalTransferIn', 'InternalTransferIn');
CREATE TYPE transaction_primary_status AS ENUM ('Capture', 'Review', 'Submitted', 'Complete', 'Cancelled');
CREATE TYPE transaction_secondary_status AS ENUM ('Submitted', 'Approved', 'InProgress', 'AwaitingClientAuthorization', 'OTPSent', 'Complete', 'CSReview');

-- Compliance & risk
CREATE TYPE risk_rating AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE aml_check_result AS ENUM ('Passed', 'Failed', 'ReviewRequired');

-- Advisor authorization
CREATE TYPE advisor_authorization AS ENUM ('Cat1', 'Cat2');
CREATE TYPE advisor_permission_type AS ENUM ('Compliance', 'CSReview');

-- Contract
CREATE TYPE contract_type AS ENUM ('RetirementAnnuity', 'VIP', 'Endowment', 'ELLA', 'TaxFreeInvestment', 'PreservationFund');
CREATE TYPE contract_status AS ENUM ('Concept', 'Active', 'Cancelled');
```
