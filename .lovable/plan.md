

## Add Date Range Selector, Team Grouping, and Seed Teams/Users for Analytics

### Overview

Enhance the Analytics tab with a date range selector and team-based filtering. Create a seeding edge function that populates team members linked to each jurisdiction's advisors, organized into realistic practice teams.

---

### 1. Database Changes

**Extend `team_members` table** with two new columns:
- `team_name` (text, nullable) -- groups members into named teams (e.g., "Jordaan Financial Planning", "PSG Wealth Tygervalley")
- `jurisdiction` (text, nullable) -- links the team member to a region (ZA, AU, CA, GB, US)

No new tables needed. The existing `team_members` table already has `name`, `role`, `is_primary_adviser`, and `is_active`.

---

### 2. Seed Edge Function: `seed-team-members`

**New file: `supabase/functions/seed-team-members/index.ts`**

Creates realistic team members for each jurisdiction, organized into teams per advisor. For each of the 5 jurisdictions (5 advisors each = 25 advisors total), seed:

- **The advisor** as a team member with `is_primary_adviser = true` and `role = "Financial Adviser"`
- **2-3 support staff** per advisor team (Assistant, Paraplanner, Administrator)

This produces approximately 75-100 team members across 25 teams. Each record includes the `jurisdiction` and `team_name` fields.

The function is idempotent -- it deletes existing team members before re-seeding.

**Sample data structure per jurisdiction:**

| Team Name | Member | Role | Jurisdiction |
|-----------|--------|------|-------------|
| Jordaan Financial Planning | Johan Botha | Financial Adviser | ZA |
| Jordaan Financial Planning | Anele Mkhize | Paraplanner | ZA |
| Jordaan Financial Planning | Zanele Dlamini | Administrator | ZA |
| Mostert Advisory | Sarah Mostert | Financial Adviser | ZA |
| Mostert Advisory | Thabo Mokoena | Assistant | ZA |

---

### 3. Analytics Tab Enhancements

**File: `src/components/tasks/TaskAnalyticsTab.tsx`**

#### A. Date Range Selector
Add a date range picker at the top toolbar (next to the sub-view tabs) with preset options:
- This Week (default)
- Last Week
- This Month
- Last Month
- Custom Range (using two date inputs)

The selected range replaces the hardcoded "this week / last week" logic in `computeRows`. The "Completed this week" and "Completed last week" columns become "Completed in period" and "Completed prior period" (the prior period being the same length immediately before the selected range).

Utilisation % recalculates based on the working days in the selected period.

#### B. Team Filter (By User view only)
When in "By User" view, add a team multi-select dropdown filter. This:
- Fetches team members from the database via `useTeamMembers` (extended to include `team_name` and `jurisdiction`)
- Filters the displayed rows to only show users belonging to selected teams
- Automatically filters by current jurisdiction from `RegionContext`

#### C. Collapsible Team Grouping
In "By User" view, rows are grouped under collapsible team name headers. Each team header shows aggregated totals for that team. Individual member rows are indented beneath.

---

### 4. Hook Changes

**File: `src/hooks/useTeamMembers.ts`**

Extend the `TeamMember` interface to include:
- `team_name: string | null`
- `jurisdiction: string | null`

Update the query to fetch these new columns.

---

### 5. Update Task Seeding

**File: `supabase/functions/seed-demo-tasks/index.ts`**

Update to assign `assigned_to_user_id` values by looking up seeded team members, so that analytics shows realistic per-user distribution. Currently all tasks show "Current User" -- after this change, tasks will be distributed across team members for the analytics view.

Since `assigned_to_user_id` references UUIDs but team members share the same `user_id`, we will instead use `assigned_to_name` as a text field on the tasks table to store the team member's display name. This avoids auth coupling while enabling per-person analytics.

**New column on `tasks` table:** `assigned_to_name` (text, nullable) -- stores the display name of the person the task is assigned to, populated during seeding.

---

### Technical Summary

| Item | Detail |
|------|--------|
| DB migration | Add `team_name`, `jurisdiction` to `team_members`; add `assigned_to_name` to `tasks` |
| New edge function | `seed-team-members` (creates ~75-100 members across 5 jurisdictions) |
| Modified edge function | `seed-demo-tasks` (assigns tasks to team member names) |
| Modified component | `TaskAnalyticsTab.tsx` (date range, team filter, team grouping) |
| Modified hook | `useTeamMembers.ts` (new fields) |
| Modified hook | `useTasksEnhanced.ts` (use `assigned_to_name` from DB instead of hardcoded "Current User") |

