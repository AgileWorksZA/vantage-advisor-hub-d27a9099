

## Fix Task Dashboard Data: Jurisdiction-Aligned Task Assignment

### Root Cause
The task seed function assigns tasks to random team members from ALL jurisdictions, regardless of the client's region. For example, a Johan Botha (ZA) client's task might be assigned to a US or AU team member. This causes the analytics "By User" view to show very low numbers because:
1. Tasks.tsx filters tasks by `client_advisor` matching the selected region's advisors
2. The analytics then groups by `assigned_to_name` -- but those names belong to other regions
3. Result: most tasks fall through the cracks between both filters

Additionally, 403 tasks from other seed functions have NULL `assigned_to_name`, diluting the data.

### Solution

**Update `supabase/functions/seed-demo-tasks/index.ts`:**

1. **Fetch clients WITH their advisor field** -- currently only fetches `id`. Change to also select `advisor` so we know which jurisdiction each client belongs to.

2. **Build a client-to-jurisdiction mapping** using the advisor name:
   - Map each advisor name to their jurisdiction (e.g., "Johan Botha" -> ZA, "James Mitchell" -> AU)
   - Group team members by jurisdiction

3. **Assign tasks to same-jurisdiction team members** -- when assigning a task for a client, look up the client's jurisdiction via their advisor, then pick a random team member from that same jurisdiction (60% primary, 40% assistant).

4. **Increase total tasks to 750** to guarantee 150 per jurisdiction (5 regions x 150 = 750).

5. **Clean up orphan tasks** -- the delete step already deletes by `user_id`. Also delete tasks from `task_clients` first. Run the seed AFTER other seeders to ensure it's the final state.

### Advisor-to-Jurisdiction Mapping (in seed function)

```text
ZA: Johan Botha, Sarah Mostert, Pieter Naude, Linda van Wyk, David Greenberg
AU: James Mitchell, Sarah Thompson, Michael O'Brien, Emily Anderson, Thomas Murphy
CA: Pierre Tremblay, Marie Bouchard, James MacDonald, Sophie Gagnon, Robert Singh
GB: William Smith, Elizabeth Jones, Thomas Williams, Victoria Brown, James Taylor
US: Michael Johnson, Jennifer Williams, Robert Brown, Maria Garcia, William Davis
```

### Data Flow After Fix

```text
Client (advisor = "Johan Botha") -> Jurisdiction = ZA
  -> Task assigned to ZA team member (e.g., "Zanele Dlamini" or "Johan Botha")
  -> Tasks.tsx filters: client_advisor "Johan Botha" matches selectedAdvisorNames -> VISIBLE
  -> Analytics: assigned_to_name "Zanele Dlamini" matches ZA jurisdictionMembers -> COUNTED
```

### Steps

1. Update `seed-demo-tasks/index.ts`:
   - Fetch clients with `id, advisor` fields
   - Build advisor-to-jurisdiction lookup table (hardcoded, matching regionalData)
   - Group team members by jurisdiction
   - Assign tasks to jurisdiction-matched team members
   - Increase TOTAL_TASKS from 500 to 750
2. Deploy and run the updated seed function
3. Verify dashboard shows 100+ tasks per jurisdiction with all advisors selected

### Files to Modify
- `supabase/functions/seed-demo-tasks/index.ts`

No frontend changes needed -- the filtering logic is correct, the data just needs proper jurisdiction alignment.

