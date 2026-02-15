

## Fix Drill-Down Filtering, Seed Task Type Standards, and Add Standards Management Table

### Problem Summary
1. **Drill-down bug**: Clicking a number in the analytics table triggers `"Failed to load tasks"` because the filter passes a person's name (e.g., "Rachel Kim") to `assigned_to_user_id` -- a UUID column. It should filter on `assigned_to_name` instead.
2. **No SLA/Utilisation standards data**: The `task_type_standards` table exists but is empty, so all Utilisation and SLA columns show "-".
3. **No UI to manage standards**: There's no table where users can view/edit SLA hours and standard execution minutes per task type.

---

### Changes

#### 1. Fix the drill-down filter bug (`src/hooks/useTasksEnhanced.ts`)

Change line 126 from:
```
query = query.eq("assigned_to_user_id", filters.assignedTo);
```
to:
```
query = query.eq("assigned_to_name", filters.assignedTo);
```

This ensures clicking a person's name in the analytics table filters tasks by the text `assigned_to_name` column rather than the UUID `assigned_to_user_id` column.

#### 2. Seed task type standards data

Insert default SLA and utilisation standards for all 7 existing task types into `task_type_standards`. The seed will run via the existing `seed-demo-tasks` edge function (or a new dedicated seed function).

| Task Type | Standard Execution (mins) | SLA (hours) |
|---|---|---|
| Annual Review | 120 | 168 (7 days) |
| Portfolio Review | 90 | 120 (5 days) |
| Client Complaint | 60 | 48 (2 days) |
| Follow-up | 30 | 72 (3 days) |
| Compliance | 45 | 96 (4 days) |
| Onboarding | 180 | 240 (10 days) |
| Document Request | 20 | 48 (2 days) |

Also update the `seed-demo-tasks` function to:
- Populate `standard_execution_minutes` on each seeded task (matching its task type)
- Populate `sla_deadline` on each seeded task (created_at + SLA hours)
- Re-seed tasks so the 208 NULL `assigned_to_name` tasks get proper assignments

#### 3. Add SLA and Utilisation standards management table (`src/components/tasks/TaskAnalyticsTab.tsx`)

Add a new section below the analytics table (or as a collapsible panel) with an editable table showing:
- Task Type (read-only)
- Standard Execution Time (minutes) -- editable
- SLA Target (hours) -- editable
- Save button per row

This uses the existing `useTaskTypeStandards` hook which already has `upsertStandard` mutation support.

The table will be rendered inside a Card with a "Task Type Standards" header, visible on the Analytics tab. Each row will have inline-editable number inputs that call `upsertStandard` on change/blur.

#### 4. Wire standards into analytics calculations

Update `computeRows` in `TaskAnalyticsTab.tsx` to use the standards from `useTaskTypeStandards`:
- For utilisation: use `standard_execution_minutes` from the standards table (currently reads from task-level field which may be 0)
- For SLA: already computed from `sla_deadline` on each task, which will now be populated by the seed

---

### Technical Details

**Files to modify:**
- `src/hooks/useTasksEnhanced.ts` -- Fix `assignedTo` filter (1 line change)
- `supabase/functions/seed-demo-tasks/index.ts` -- Add SLA/execution data to seeded tasks, seed `task_type_standards`, fix NULL assignments
- `src/components/tasks/TaskAnalyticsTab.tsx` -- Add standards management table UI

**No database migration needed** -- the `task_type_standards` table and all required columns already exist.

