

## Remove Extra Status Filters from Chart Drill-Downs

### Problem
When clicking a segment on the **Type** or **Priority** charts, the drill-down adds an extra `status: openStatuses` filter (Not Started, In Progress, Pending Client). The user expects only the clicked dimension and the date range to be passed as filters.

The screenshot confirms this: clicking "Client Complaint" on the Type chart should show only two filter chips -- "Client Complaint" and the date range.

### Changes

**File: `src/components/tasks/TaskDashboard.tsx`**

Remove the `status: openStatuses` from both chart click handlers:

- **`handleTypeChartClick` (line 229)**: Change from `{ taskType: [params.name], status: openStatuses, dueDateFrom, dueDateTo }` to `{ taskType: [params.name], dueDateFrom, dueDateTo }`
- **`handlePriorityChartClick` (line 232)**: Change from `{ priority: [params.name], status: openStatuses, dueDateFrom, dueDateTo }` to `{ priority: [params.name], dueDateFrom, dueDateTo }`

The **Status chart** handler already only passes the clicked status + date range, so no change needed there.

Single file, two one-line edits.
