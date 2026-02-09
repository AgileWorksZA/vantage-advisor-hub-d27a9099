

## Account Onboarding Progress Widget + Onboarding Task Seeding

### Overview
Add an "Account onboarding progress" dashboard widget that displays onboarding tasks grouped by time bucket and status, matching the reference image. Clicking any count navigates to the Tasks page with pre-applied filters showing those specific tasks. Also seed additional onboarding tasks to ensure every jurisdiction has meaningful data.

### 1. Seed Onboarding Tasks for All Jurisdictions

**File: `supabase/functions/seed-onboarding-tasks/index.ts`** (new edge function)

Create a dedicated seeding function that inserts onboarding tasks across all 5 jurisdictions (ZA, AU, CA, GB, US). Currently there are only ~36 onboarding tasks, unevenly distributed. This function will:

- Query all clients grouped by nationality
- Create onboarding tasks with varied statuses: "In Progress", "Pending Client" (maps to "Pending client acceptance"), "Not Started" (maps to "Pending approval")
- Distribute due dates across the 5 time buckets: Today, less than 7 days, less than 14 days, less than 1 month, 1 month or more
- Link tasks to clients via `task_clients` junction table
- Target ~10-15 onboarding tasks per jurisdiction for a realistic distribution
- Skip seeding if sufficient onboarding tasks already exist (idempotent)

Task titles will use existing "Onboarding" templates from the task system (e.g., "New client onboarding - documentation", "New client onboarding - risk profiling", etc.)

### 2. Dashboard Widget Component

**File: `src/components/dashboard/OnboardingProgressWidget.tsx`** (new)

A table-based widget matching the reference image with:
- Icon + title: "Account onboarding progress"
- Drag handle (GripVertical) and close button (X) consistent with other widgets
- Columns: Time | In progress | Pending client acceptance | Pending approval
- Rows: Today, less than 7 days, less than 14 days, less than 1 month, greater than or equal to 1 month
- Each cell count is a clickable link (underlined, blue) that navigates to `/tasks?view=detail&taskType=Onboarding&status=X&dueBucket=Y`
- Data sourced from a new hook that queries onboarding tasks from the database, filtered by the current region's advisors

### 3. Onboarding Data Hook

**File: `src/hooks/useOnboardingProgress.ts`** (new)

- Queries tasks where `task_type = 'Onboarding'` and `is_deleted = false`
- Joins with clients to get advisor info for region filtering
- Groups by status and due date bucket:
  - Today: `due_date = today`
  - Less than 7 days: `due_date > today AND due_date <= today+7`
  - Less than 14 days: `due_date > today+7 AND due_date <= today+14`
  - Less than 1 month: `due_date > today+14 AND due_date <= today+30`
  - Greater than or equal to 1 month: `due_date > today+30 OR due_date IS NULL`
- Returns a matrix of counts: `Record<timeBucket, Record<status, number>>`
- Accepts selected advisor names for filtering (same pattern as Tasks page)

### 4. Integrate Widget into Dashboard

**File: `src/pages/Dashboard.tsx`** (modified)

- Add `'onboarding-progress'` to `defaultDashboardLayout` at position `{ i: 'onboarding-progress', x: 0, y: 6, w: 3, h: 3 }`
- Add to `DASHBOARD_WIDGETS` config array
- Render the `OnboardingProgressWidget` inside `DraggableWidgetGrid` with `isWidgetVisible` check
- Pass region context (selected advisors) to the widget

### 5. Tasks Page: Handle Onboarding Filter from URL

**File: `src/pages/Tasks.tsx`** (modified)

- Read `taskType`, `status`, and `dueBucket` from URL search params
- When these params are present, auto-switch to "detail" view and pre-populate filters
- The `dueBucket` param sets `dueDateFrom` and `dueDateTo` in the filter object
- This allows clicking a number in the widget to show exactly those filtered tasks

### 6. Trigger Seeding on Dashboard Load

**File: `src/pages/Dashboard.tsx`** (modified)

- Add a call to the `seed-onboarding-tasks` edge function alongside the existing `seedDemoClients` call
- Runs once on login/load, idempotent (skips if tasks already exist)

### Status Mapping
The widget columns map to database status values:
- "In progress" -> `status = 'In Progress'`
- "Pending client acceptance" -> `status = 'Pending Client'`
- "Pending approval" -> `status = 'Not Started'`

### Files Summary
| File | Action |
|------|--------|
| `supabase/functions/seed-onboarding-tasks/index.ts` | Create |
| `src/components/dashboard/OnboardingProgressWidget.tsx` | Create |
| `src/hooks/useOnboardingProgress.ts` | Create |
| `src/pages/Dashboard.tsx` | Modify (add widget + seeding call) |
| `src/pages/Tasks.tsx` | Modify (read URL filter params) |

