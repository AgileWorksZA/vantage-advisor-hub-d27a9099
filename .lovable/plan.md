

## Replace "Wealth Manager" with "Family Group" and Seed Relationships

### Overview

Two changes: (1) Replace the "Wealth Manager" column in the client search results table with a "Family Group" column, and (2) create a new edge function that seeds relationships (family members, businesses, and professional contacts) for existing clients, restricted to same-jurisdiction pairings. The relationships will display on each client's Relationships tab.

---

### Part 1: Replace "Wealth Manager" with "Family Group"

**Database Migration**

Add a `family_group` column to the `clients` table:

```sql
ALTER TABLE public.clients ADD COLUMN family_group text;
```

The seed function (Part 2) will populate this field for clients that belong to a family group.

**File: `src/hooks/useClients.ts`**

- Add `family_group` to the `Client` interface
- Replace `wealthManager` with `familyGroup` in `ClientListItem`
- Update `transformClientToListItem` to map `family_group` instead of `wealth_manager`

**File: `src/pages/Clients.tsx`**

- Change the table header from "Wealth Manager" to "Family Group"
- Change the table cell from `client.wealthManager` to `client.familyGroup`

---

### Part 2: Seed Relationships Edge Function

**New file: `supabase/functions/seed-demo-relationships/index.ts`**

Creates a new edge function that populates all three relationship types for existing demo clients. The function:

1. Fetches all existing clients grouped by advisor and jurisdiction
2. For each advisor's book, pairs clients into family groups (spouse pairs, parent-child links, siblings) -- all within the same jurisdiction
3. Creates business entity relationships (Director, Shareholder, Trustee) between individual clients and business/trust-type clients in the same jurisdiction
4. Creates professional contacts (Accountant, Attorney, Financial Planner) for a subset of clients, using jurisdiction-appropriate names and companies
5. Sets the `family_group` field on the `clients` table for clients that are grouped into a family
6. All relationships are bi-directional (e.g., Spouse<->Spouse, Parent<->Child)

**Relationship seeding logic per advisor (within one jurisdiction):**

| Relationship Type | Logic | Count per advisor |
|---|---|---|
| Spouse pairs | Pair male+female individual clients (2 per pair) | ~3-4 pairs |
| Parent-Child | Link older clients as Parent to younger clients | ~4-6 links |
| Business entities | Link individual clients as Director/Shareholder to business/trust clients | ~2-3 links |
| Professional Contacts | Create contact records (Accountant, Attorney, etc.) for ~5 clients | ~5 contacts |

**Jurisdiction constraint:** Every `related_client_id` must point to a client with the same `country_of_issue` as the source client. Professional contacts are created as `client_contacts` records (not linked to other client profiles), so they are inherently scoped to the client's own context.

**Family Group naming:** Each spouse pair and their children get a shared `family_group` label (e.g., "The Van Niekerk Family" for ZA, "The Mitchell Family" for AU). This value is written to the `clients.family_group` column for display in the search table.

**Config update: `supabase/config.toml`**

Add the new function with `verify_jwt = false` so it can be called from the admin seeding flow.

---

### Technical Summary

| Item | Detail |
|------|--------|
| DB migration | Add `family_group` text column to `clients` |
| Modified files | `src/hooks/useClients.ts`, `src/pages/Clients.tsx` |
| New file | `supabase/functions/seed-demo-relationships/index.ts` |
| Config update | `supabase/config.toml` -- add function entry |
| Tables written to | `clients` (family_group), `client_relationships`, `client_contacts` |
| Jurisdiction rule | All relationships constrained to same `country_of_issue` |

