
# Deduplicate Client Names Across All Advisors

## Problem
The `generateAdditionalClients()` function in the seed edge function uses small name pools (16 first names x 16 last names per jurisdiction) and cycles through them identically for each of the 5 advisors. This produces the same name (e.g., "Lindiwe Wessels") assigned to every advisor, each with a unique ID number -- resulting in 266 excess duplicate-name records (553 total clients, only 287 unique names).

## Solution (Two Steps)

### Step 1: Fix the Seed Function
Modify `generateAdditionalClients()` in `supabase/functions/seed-demo-clients/index.ts` to ensure each generated client has a unique first+last name combination. Instead of cycling through the same pool indices for each advisor, use a global index that increments across advisors within a jurisdiction so that no two advisors share a name.

Additionally, expand the name pools slightly per jurisdiction (adding a few more first names or last names) to ensure there are enough unique combinations (5 advisors x ~13 clients each = ~65 unique combos needed per jurisdiction).

### Step 2: Delete Duplicate Data (Both Environments)
For each group of clients sharing the same `first_name + surname`, keep only the first record (the one with the lowest `created_at`) and delete the rest. This will be done by:

1. Deleting duplicates in **Test** using a data operation
2. Providing guidance for the user to run the same cleanup on **Live** (production) via the Cloud View, or handling it through the seed function's dedup logic

The dedup approach:
- For each `(first_name, surname)` group with `COUNT > 1`, keep the record with `MIN(created_at)` and delete the others
- This preserves the original record and removes the ~266 excess entries
- After cleanup, the unique constraint on `id_number` stays intact (each remaining record has its own unique ID)

### Step 3: Prevent Future Duplicates
Add a `UNIQUE` constraint on `LOWER(first_name) || '|' || LOWER(surname)` per user, or add dedup logic in the seed function's insert step to skip names already used. The seed function approach is preferred since the same name could legitimately exist for different users.

## Technical Details

### Files to Modify
- `supabase/functions/seed-demo-clients/index.ts`
  - Expand name pools to have enough unique combinations
  - Change the index calculation in `generateAdditionalClients()` to use a jurisdiction-wide counter instead of per-advisor cycling
  - Add dedup check in Step 3 (insert) to match on `first_name + surname` (already partially exists via `existingNames` Set)

### Database Operations
- Delete duplicate records in Test (keep oldest per name group)
- User will need to run the same delete on Live via Cloud View, or we re-run the seed function after cleaning

### Data Cleanup Query
```text
-- Identifies and deletes duplicates, keeping the earliest record per name
DELETE FROM clients
WHERE id NOT IN (
  SELECT DISTINCT ON (LOWER(first_name), LOWER(surname), user_id)
    id
  FROM clients
  ORDER BY LOWER(first_name), LOWER(surname), user_id, created_at ASC
);
```

### Seed Function Name Pool Fix
Each jurisdiction will get enough unique names to cover all advisors without reuse. The index formula changes from:
```text
-- Before (same index per advisor):
pool.firstNames[(advIdx * 20 + i) % pool.firstNames.length]

-- After (unique across all advisors):
pool.firstNames[globalNameIndex % pool.firstNames.length]
// where globalNameIndex increments globally and uses a dedup set
```

A `usedNames` Set will track `first_name|surname` combinations already assigned, skipping any collisions.

### Expected Outcome
- ~287 unique client records remain (down from 553)
- Each client name appears exactly once across all advisors
- Future seed runs will not recreate duplicates
- Applied to both Test and Live environments
