

## Update ID Type to be Jurisdiction-Aware

### Overview

Currently, the `id_type` field for family member relationships is hardcoded to "SA ID" in all places -- the seed function, the add dialog, the edit dialog, and the hook default. This needs to use jurisdiction-appropriate ID type labels (e.g., "National ID" for Australia, "SIN" for Canada, "NI Number" for UK, "SSN" for US).

### Jurisdiction-to-ID-Type Mapping

| Country of Issue | ID Type Label |
|---|---|
| South Africa | SA ID |
| Australia | National ID |
| Canada | SIN |
| United Kingdom | NI Number |
| United States | SSN |
| (fallback) | National ID |

### Changes

**1. Create a shared utility: `src/lib/jurisdiction-utils.ts`** (or add to existing utils)

Add a helper function `getIdTypeForJurisdiction(countryOfIssue: string): string` that maps country names to the appropriate ID type label. This will be reused across all files.

**2. File: `src/components/client-detail/AddFamilyMemberDialog.tsx`**

- Fetch the parent client's `country_of_issue` when the dialog opens
- Replace the two hardcoded `id_type: "SA ID"` values (lines 183, 201) with the result of `getIdTypeForJurisdiction(parentClient.country_of_issue)`

**3. File: `src/hooks/useClientRelationships.ts`**

- Change the fallback default on line 82 from `"SA ID"` to `"National ID"` (the data itself will already have the correct value from the seed/create)
- Change the default on line 127 from `"SA ID"` to `"National ID"`

**4. File: `supabase/functions/seed-demo-relationships/index.ts`**

- Add the same jurisdiction mapping function inside the edge function
- Replace all instances of `id_type: client.id_number ? "SA ID" : "Passport"` with `id_type: client.id_number ? getIdTypeForJurisdiction(jurisdiction) : "Passport"` (approximately 8 occurrences)

**5. File: `src/components/client-detail/EditFamilyMemberDialog.tsx`**

- If any hardcoded "SA ID" references exist in this file, update them similarly

**6. Update existing seeded data**

- After deploying the updated seed function, run it again (or use a targeted UPDATE query) to fix the `id_type` on already-seeded relationship records so existing data reflects the correct labels

### Technical Summary

| Item | Detail |
|------|--------|
| New file | `src/lib/jurisdiction-utils.ts` (shared mapping function) |
| Modified files | `AddFamilyMemberDialog.tsx`, `useClientRelationships.ts`, `seed-demo-relationships/index.ts`, `EditFamilyMemberDialog.tsx` |
| No DB schema changes | Data update only (fix existing `id_type` values) |
| Jurisdictions covered | South Africa, Australia, Canada, United Kingdom, United States |

