

## Seed Meeting Prep Data

The Prep step pulls from 6 tables. **Communications** and **tasks** are already seeded. The missing data sources are: **client_notes**, **documents**, **project_opportunities** (+ parent `opportunity_projects`), and **client_products** (needs existing `products`).

### New Edge Function: `seed-meeting-prep-data`

A single `supabase/functions/seed-meeting-prep-data/index.ts` that seeds the 4 missing tables for all clients.

**1. Client Notes** (`client_notes`) — 3-5 per client
- Jurisdiction-aware subjects: "FICA verification follow-up" (ZA), "Superannuation rollover discussion" (AU), "RRSP contribution review" (CA), "ISA transfer notes" (GB), "401(k) rollover discussion" (US)
- Interaction types: "Note", "Email", "Call"
- Priorities: Low/Medium/High
- Dated over the past 6 months

**2. Documents** (`documents`) — 3-6 per client
- Mix of statuses: Pending, Complete, Expired
- Links to existing `document_types` for category resolution
- Jurisdiction-aware names: "FICA - Proof of ID" (ZA), "Tax File Declaration" (AU), "KYC Verification" (CA), "ISA Transfer Form" (GB), "W-9 Form" (US)
- Some with past expiry dates to trigger "Expired" status and recommended actions

**3. Opportunity Projects + Project Opportunities** — 1-2 per client
- Creates an `opportunity_projects` row per user/region, then `project_opportunities` linked to clients
- Types: "Portfolio Rebalancing", "Life Cover Gap", "Retirement Planning", "Tax Optimization", "Estate Planning"
- Includes `potential_revenue`, `confidence`, `suggested_action`, `reasoning`

**4. Client Products** (`client_products`) — 2-4 per client
- Links to existing `products` table (seeded by `seed-providers-data`)
- Fetches real product IDs; if none exist, skips
- Realistic `current_value`, `premium_amount`, `policy_number`, `status: "Active"`

### Flow
1. Fetch all clients with jurisdiction
2. Fetch existing `document_types` and `products` for FK references
3. Delete existing seeded data (idempotent) — delete where `user_id` matches
4. Batch insert into all 4 tables

### Integration
- Register in `supabase/config.toml` with `verify_jwt = false`
- Add to seed sequence in `SystemSettingsSection.tsx` after "Demo Tasks" and before "TLH Clients"

### Files
| File | Action |
|------|--------|
| `supabase/functions/seed-meeting-prep-data/index.ts` | Create |
| `supabase/config.toml` | Add function config |
| `src/components/administration/system/SystemSettingsSection.tsx` | Add to seed sequence |

