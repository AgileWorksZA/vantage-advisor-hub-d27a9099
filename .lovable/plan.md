

## Restructure Analytics "By User" to Show Advisers with Expandable Assistants + Seed Tasks + Drill-Down Filtering

### Overview
Replace the current team-name grouping with adviser-name grouping. Each adviser row is expandable to show their assistants (non-primary team members). Update the seed function so tasks are distributed across all team members with proper `assigned_to_name`. Add click-to-filter so clicking any row drills down to that person's tasks.

---

### 1. Restructure the "By User" Table (TaskAnalyticsTab.tsx)

**Current**: Groups by `team_name` (e.g., "Jordaan Financial Planning")
**New**: Groups by adviser name (e.g., "Johan Botha") with assistants nested underneath

Changes to `TaskAnalyticsTab.tsx`:

- **Rename `TeamGroupRow` to `AdviserGroupRow`** -- the header row displays the adviser's full name (from `regionalData.advisors`) instead of team name
- **Grouping logic**: Instead of grouping by `team_name`, group by `advisor_initials`. For each group:
  - The header row shows the adviser's name (the primary team member / Financial Adviser) with aggregated totals
  - Expanded children show only the non-primary members (assistants, paraplanners, administrators)
- **Remove team filter MultiSelect** -- replace with adviser-based filtering (already handled by top bar)
- **Expand/Collapse All** remains the same, just keyed on adviser initials instead of team names

**Grouping data flow:**
```text
team_members (filtered by selectedAdvisors + selectedRegion)
  --> group by advisor_initials
  --> for each group:
       Header row = adviser name (from regionalData.advisors matching initials)
       Child rows = members where is_primary_adviser = false
```

### 2. Click-to-Filter Drill-Down

**Current**: `handleRowClick` only filters by `task_type` in the "By Type" view; in "By User" view it does nothing meaningful.

**Changes:**
- When clicking an adviser header row: call `onDrillDown({ assignedTo: adviserName })` -- this switches to the "All Tasks" detail view filtered to that adviser's name
- When clicking an assistant row: call `onDrillDown({ assignedTo: assistantName })` -- filters to that specific person
- The `TaskFilters` interface already has `assignedTo?: string` so no schema change needed

### 3. Re-seed Task Data with Proper Distribution

**Update `supabase/functions/seed-demo-tasks/index.ts`:**

Currently 834 out of ~1000+ tasks have `assigned_to_name = NULL`. The seed function distributes tasks only across team members it finds, but many tasks remain unassigned.

Changes:
- Delete existing tasks before re-seeding (idempotent)
- Ensure every task gets an `assigned_to_name` from the team members list (no nulls)
- Distribute tasks proportionally: Financial Advisers get ~60% of tasks, assistants/paraplanners get ~40%
- This ensures the analytics table has meaningful data for every team member

### 4. Cleanup

- Remove the `selectedTeams` / team filter MultiSelect state and UI (lines 358, 409-417, 567-575, 634-641) since grouping is now by adviser from the top bar
- Remove references to `teamOptions` and `memberTeamMap` -- replace with an `adviserGroupMap` keyed on `advisor_initials`
- Update the `groupedRows` memo to build groups by adviser initials
- Update expand/collapse state keys from team names to adviser initials

---

### Technical Details

**File: `src/components/tasks/TaskAnalyticsTab.tsx`**

| Section | Change |
|---|---|
| `groupedRows` memo (~line 424) | Group rows by `advisor_initials` instead of `team_name`. Use `regionalData.advisors` to get the adviser display name for each initials key |
| `TeamGroupRow` component (~line 327) | Rename to `AdviserGroupRow`; display adviser name instead of team name |
| `handleRowClick` (~line 456) | For "user" subView: set `assignedTo` filter to the clicked person's name and call `onDrillDown` |
| Team filter UI (~line 567) | Remove the MultiSelect for team filtering |
| Expand/Collapse (~line 677) | Key on adviser initials instead of team names |

**File: `supabase/functions/seed-demo-tasks/index.ts`**

| Section | Change |
|---|---|
| Before insert (~line 328) | Delete existing tasks for the user first (`DELETE FROM tasks WHERE user_id = ...`) |
| Task assignment (~line 352) | Always assign a team member name; weight Financial Advisers at 60% |
| Total tasks | Keep at 500 |

