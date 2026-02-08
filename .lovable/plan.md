
# Restore ID Numbers, Enforce Advisor-Jurisdiction Filtering, and Scale to 20 Clients Per Advisor

## Overview

Three interconnected changes:

1. **Restore the identity number on the ribbon** -- all non-ZA clients are missing `id_number` in the database. The UI code is correct; the data is the gap.
2. **Enforce advisor-jurisdiction linkage** -- 4 orphan advisors (48 clients) exist outside the regional advisor definitions. Their clients are invisible. Reassign them to the 5 main ZA advisors.
3. **Scale to 20 clients per advisor** -- add ~300 new clients via a programmatic generator in the seed function, each with full profile data and a unique identification number.

## Detailed Changes

### 1. Seed Function Overhaul (`supabase/functions/seed-demo-clients/index.ts`)

**a) Add unique `id_number` to every existing demo client entry**

Currently, only ZA clients have `id_number` set. Update every non-ZA client in the `demoClients` array to include a jurisdiction-appropriate ID:

| Jurisdiction | Format | Example |
|---|---|---|
| ZA | 13-digit SA ID (YYMMDDGSSSCAZ) | `8203155078085` |
| AU | 9-digit Tax File Number | `123456782` |
| CA | 9-digit SIN (XXX-XXX-XXX style stored as digits) | `123456789` |
| GB | National Insurance Number (XX 99 99 99 X) | `AB123456C` |
| US | 9-digit SSN (XXX-XX-XXXX style) | `123456789` |

Each ID will be unique across the entire database to satisfy the existing unique index on `LOWER(id_number)`.

**b) Add a programmatic client generator**

After the static `demoClients` array, add a function `generateAdditionalClients()` that creates extra clients to reach 20 per advisor. For each jurisdiction, it will:

- Use jurisdiction-appropriate first and last name pools (culturally consistent)
- Generate unique emails, phone numbers, occupations, employers
- Assign a unique `id_number` in the correct format
- Distribute evenly across the 5 advisors in that jurisdiction
- Set profile_state to "Active", profile_type to "Client"

Target counts after generation:

| Jurisdiction | Advisors | Current per advisor | Target | New clients needed |
|---|---|---|---|---|
| ZA | 5 (JB, SM, PN, LV, DG) | 7 + ~10 redistributed orphans = ~17 | 20 | ~15 |
| AU | 5 (JM, ST, MO, EA, TM) | 5-7 | 20 | ~70 |
| CA | 5 (PT, MB, JM, SG, RS) | 5-7 | 20 | ~70 |
| GB | 5 (WS, EJ, TW, VB, JT) | 6-7 | 20 | ~65 |
| US | 5 (MJ, JW, RB, MG, WD) | 6-7 | 20 | ~65 |
| **Total** | | | | **~285** |

**c) Reassign orphan advisor clients**

Add logic to the seed function to update clients assigned to "Christo van Zyl", "Dale Harding", "Emile Wegner", and "Ihan Nel" -- reassigning them to the 5 main ZA advisors (round-robin). Also reassign the 6 clients with `advisor IS NULL`.

**d) Backfill `id_number` for existing clients missing it**

Extend the update logic to also set `id_number` on any existing client where it is null, generating a unique jurisdiction-appropriate number based on their `country_of_issue` or `advisor` mapping.

### 2. No UI Code Changes Needed

The ribbon and expanded section already handle all fields correctly:

- **`ClientRibbon.tsx`** lines 208-213: conditionally renders `# {idNumber}` when `client.id_number || client.passport_number` is truthy
- **`ClientRibbonExpandedDetails.tsx`**: shows address, phone (with copy), email (with copy), category, tax number
- **`Clients.tsx`** lines 278-282: already filters clients by `selectedAdvisorNames` from the region context
- **`AdvisorFilter.tsx`**: already reads from `regionalData.advisors` which is jurisdiction-specific
- **`RegionContext.tsx`**: resets advisors when region changes (line 68)

### 3. Deployment Steps

1. Update the seed function code
2. Deploy the `seed-demo-clients` edge function
3. Invoke the function to populate the database
4. Verify all 500+ clients have `id_number` populated and correct advisor assignments

## Files Summary

| File | Action |
|------|--------|
| `supabase/functions/seed-demo-clients/index.ts` | Major update -- add id_numbers to all existing entries, add programmatic client generator, add orphan advisor reassignment logic, add id_number backfill for existing records |

## Technical Notes

- The unique index `LOWER(id_number)` on the clients table means all generated IDs must be globally unique
- The `clients_preferred_contact_check` constraint only allows 'Phone' or 'Email' -- the existing `mapPreferredContact` helper already handles this
- Generated clients will use `calculateDOB(age)` for date_of_birth consistency
- The generator will use deterministic patterns (e.g., advisor index + client index) to avoid ID collisions
