

## Add Analytics Tab to Tasks Module with SLA and Utilisation Tracking

### Overview

Add a third "Analytics" tab to the Tasks page (between Dashboard and All Tasks) that provides per-task-type and per-user productivity analysis. This includes two reference table views matching the uploaded screenshots, SLA adherence tracking, utilisation percentage calculations, and the ability to drill into individual tasks from the analytics summaries.

### Database Changes

**New column on `tasks` table:**
- `standard_execution_minutes` (integer, nullable) -- the standard time in minutes expected to complete this task type instance

**New reference table: `task_type_standards`**
Stores the default SLA and execution time for each task type so new tasks auto-populate.

| Column | Type | Default | Description |
|--------|------|---------|-------------|
| id | uuid | gen_random_uuid() | PK |
| user_id | uuid | NOT NULL | Owner (RLS) |
| task_type | task_type enum | NOT NULL | Unique per user |
| standard_execution_minutes | integer | 60 | Default productive time for this task type |
| sla_hours | integer | 48 | Default SLA deadline hours from creation |
| created_at | timestamptz | now() | |

This table lets admins configure "Client Complaint = 120 mins execution, 24h SLA" etc. When tasks are created, these defaults are applied.

### New Component: `TaskAnalyticsTab`

**File: `src/components/tasks/TaskAnalyticsTab.tsx`**

Two switchable views via sub-tabs:

#### 1. "By User" View (matches image-106)
A table with columns:
- **Assigned To** -- user name or "Unassigned"
- **No. due items** -- open tasks count
- **Overdue items** -- tasks past due date (red background)
- **Due today** -- tasks due today (yellow background)
- **Due tomorrow**
- **Due this week**
- **Due next week**
- **Completed this week** (green background)
- **Completed last week**
- **% Utilisation** -- `(sum of standard_execution_minutes for completed tasks this week) / (7.5h x 5 days x 60 min) x 100`
- **% SLA adherence** -- `(completed within SLA / total completed) x 100`

Each row is clickable to drill into that user's task list (switches to All Tasks view with assignee filter).

#### 2. "By Task Type" View (matches image-107)
Same columns but grouped by task type instead of user. Each row clickable to drill into that task type's list.

#### Filters
- Task Type multi-select dropdown (when on "By User" view)
- User/Assignee multi-select dropdown (when on "By Task Type" view)
- Date range picker for the analysis period

#### Report Export
- "Export Report" button that generates a CSV download of the current analytics view

### Changes to Existing Files

**`src/pages/Tasks.tsx`**
- Add `"analytics"` to the view state type: `"dashboard" | "analytics" | "detail"`
- Add Analytics button between Dashboard and All Tasks in the tab bar (using `TrendingUp` icon from lucide)
- Import and render `TaskAnalyticsTab` when view is "analytics"
- Pass `tasks` array and an `onDrillDown` callback that switches to detail view with appropriate filters

**`src/hooks/useTasksEnhanced.ts`**
- No filter changes needed -- the analytics tab will compute its own aggregations from the full task list passed to it

**`src/components/tasks/CreateTaskDialog.tsx`**
- When creating a task, look up `task_type_standards` for the selected type and auto-populate `standard_execution_minutes` and `sla_deadline` (creation time + sla_hours)

### Utilisation % Calculation

```
Utilisation % = (Total standard_execution_minutes of completed tasks in period) 
                / (7.5 hours x working days in period x 60)
                x 100
```

- 7.5 hours = productive day length
- Working days = weekdays in the selected period (default: current week Mon-Fri)
- Uses `standard_execution_minutes` (not actual_hours) as the measure of productive time

### SLA Adherence Calculation

```
SLA % = (Tasks completed where completed_at <= sla_deadline)
        / (Total completed tasks in period)
        x 100
```

Tasks without an SLA deadline are excluded from the calculation.

### Drill-Down Behavior

Clicking any row in the analytics table:
- Switches to "All Tasks" (detail) view
- Pre-populates filters with the relevant dimension (e.g., task type = "Client Onboarding" or assigned user)
- User can then click individual tasks to open the TaskDetailSheet

### Visual Design

- Table styling matches the uploaded screenshots: colored header backgrounds (red for overdue, yellow for due today, green for completed)
- Utilisation and SLA columns show "-" when no data is available
- Rows are zebra-striped for readability
- Consistent with existing Vantage design system (Card containers, muted backgrounds)

### Technical Summary

| Item | Detail |
|------|--------|
| New DB table | `task_type_standards` with RLS |
| New DB column | `tasks.standard_execution_minutes` |
| New component | `src/components/tasks/TaskAnalyticsTab.tsx` |
| Modified files | `src/pages/Tasks.tsx`, `src/components/tasks/CreateTaskDialog.tsx` |
| Migration | Add column + create table + seed defaults for existing task types |

