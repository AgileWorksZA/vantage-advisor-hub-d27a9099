

# Scale Client Records to 600 Total

## Overview
Increase the total client count from 287 to 600 across all 25 advisors and 5 jurisdictions, targeting 24 clients per advisor (120 per jurisdiction). This requires a single-line change in the seed function, redeployment, and triggering the seed in both environments.

## Current vs Target Distribution

```text
Jurisdiction | Current | Target | Additional Needed
-------------|---------|--------|------------------
ZA           |     101 |    120 |               ~19
AU           |      48 |    120 |               ~72
CA           |      45 |    120 |               ~75
GB           |      47 |    120 |               ~73
US           |      46 |    120 |               ~74
-------------|---------|--------|------------------
Total        |     287 |    600 |              ~313
```

Each advisor will have exactly 24 clients (a mix of static + generated records).

## Implementation Steps

### Step 1: Update the per-advisor target in the seed function
In `supabase/functions/seed-demo-clients/index.ts`, change the target from 20 to 24 on the line:
```text
const needed = Math.max(0, 20 - existing)
```
becomes:
```text
const needed = Math.max(0, 24 - existing)
```

This is safe because the name pools already support 480 unique combinations per jurisdiction (24 first names x 20 last names), far exceeding the ~120 names needed per jurisdiction.

### Step 2: Deploy and trigger seeding in Test
- Deploy the updated edge function
- Call the seed function to populate the additional ~313 clients in the Test database
- Verify the final count reaches 600

### Step 3: Seed Production (Live)
- Publish the updated function to Live
- The seed function will automatically run when any user visits the Dashboard, adding the missing clients
- Alternatively, the function can be triggered directly against the Live environment

## Technical Details

### File to Modify
- `supabase/functions/seed-demo-clients/index.ts` -- line 545: change target from `20` to `24`

### How It Works
The existing seed logic already handles this gracefully:
1. It counts how many clients each advisor currently has
2. It generates only the difference (e.g., if Johan Botha has 19, it generates 5 more)
3. It uses a global name dedup Set to avoid duplicate name combinations
4. It skips names that already exist in the database via the `existingNames` Set
5. New clients get unique ID numbers via the jurisdiction-specific ID generators

### No Database Migration Needed
No schema changes are required. The seed function simply inserts additional rows into the existing `clients` table using the same structure and constraints already in place.

### Expected Outcome
- 600 total client records (up from 287)
- 120 clients per jurisdiction, 24 per advisor
- All new clients have unique names and ID numbers
- Applied to both Test and Live environments

