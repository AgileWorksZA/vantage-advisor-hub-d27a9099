

## Make Task Dashboard Stats Cards and Charts Clickable with Filters

### Current State
The task dashboard stats and charts already use real database data. However:
- All 4 stat cards navigate to the detail view without any filters
- The 4 ECharts (status pie, type bar, priority pie, SLA gauge) have no click handlers at all

### Changes

**File: `src/components/tasks/TaskDashboard.tsx`**

1. Change the `onViewDetail` callback signature to accept optional filters: `onViewDetail: (filters?: TaskFilters) => void`
2. Update each stat card's `onClick` to pass specific filters:
   - **Total Open**: `status` excludes Completed/Cancelled (no specific filter needed, just switch view)
   - **Due Today**: `dueDateFrom` and `dueDateTo` set to today's date
   - **Overdue**: `dueDateTo` set to yesterday, status excludes Completed/Cancelled
   - **Completed This Week**: `status: ["Completed"]`
3. Add `onEvents` handlers to the 3 interactive charts:
   - **Status pie chart**: clicking a slice sets `status` filter to the clicked status name
   - **Type bar chart**: clicking a bar sets `taskType` filter to the clicked type name
   - **Priority pie chart**: clicking a slice sets `priority` filter to the clicked priority name
4. Import `TaskFilters` type from the hook

**File: `src/pages/Tasks.tsx`**

1. Update `handleViewChange` to accept optional filters
2. When called with filters, merge them into the current filter state and switch to detail view
3. Pass the updated callback to `TaskDashboard`

### How It Works
- Clicking "Due Today" card switches to detail view with date filter set to today
- Clicking "Overdue" card switches to detail view showing only overdue tasks
- Clicking "In Progress" slice on the status pie chart switches to detail view filtered to `status=["In Progress"]`
- Clicking "Onboarding" bar on the type chart switches to detail view filtered to `taskType=["Onboarding"]`
- Same pattern for priority pie chart

### Files Changed
| File | Action |
|------|--------|
| `src/components/tasks/TaskDashboard.tsx` | Modify (add click handlers, update prop types) |
| `src/pages/Tasks.tsx` | Modify (update handleViewChange to accept filters) |

