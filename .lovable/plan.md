

## Fix Task Dashboard: Decouple Filters, SLA Adherence, Date Selector, and Drill-Down

### Problem Summary

1. **Coupled filters**: Dashboard and Overview share the same `filters` state passed to `useTasksEnhanced`. When a dashboard widget sets filters and navigates to Overview, those filters persist when returning to Dashboard, causing the stats/charts to show filtered data instead of all tasks.

2. **SLA gauge uses wrong data**: Currently calculated as `(totalOpen - overdue) / totalOpen`, which is just "% not overdue" -- not actual SLA adherence. Should use `sla_deadline` field from tasks.

3. **No date selector on Dashboard**: Analytics tab has a date period dropdown (This Week, Last Week, etc.) but Dashboard does not.

4. **Dashboard drill-down incomplete**: Chart clicks only pass status/type/priority but miss excluding completed/cancelled tasks where appropriate. SLA gauge is not clickable.

---

### Solution

#### 1. Decouple Dashboard from Detail Filters

**File: `src/pages/Tasks.tsx`**

- Separate the filter state: keep `filters` for the Overview table only
- When `handleViewChange` switches to `"dashboard"`, clear the detail filters back to empty `{}`
- Fetch all tasks without filters (pass no filters to `useTasksEnhanced`), then apply `filters` client-side for the Overview table only

Specifically:
- Call `useTasksEnhanced()` with NO filters (fetch all tasks)
- Apply `filters` to tasks in a `useMemo` for the Overview table pagination
- Dashboard stats are always computed from the full (advisor-filtered) task set
- Dashboard date period filtering is applied separately in the stats `useMemo`

#### 2. Fix SLA Adherence Gauge

**File: `src/components/tasks/TaskDashboard.tsx`**

- Rename "SLA Compliance" to "SLA Adherence"
- Change calculation: Instead of `(totalOpen - overdue) / totalOpen`, compute from tasks that have an `sla_deadline`:
  - Count tasks with `sla_deadline` that were completed on or before their SLA deadline (adherent)
  - Count tasks with `sla_deadline` that are overdue past their SLA deadline (breached)
  - SLA Adherence % = adherent / (adherent + breached) * 100
- Update `TaskStats` interface in `useTasksEnhanced.ts` to include `slaAdherent` and `slaBreached` counts
- Make the SLA gauge clickable -- clicking navigates to Overview filtered to show SLA-breached tasks

#### 3. Add Date Period Dropdown to Dashboard

**File: `src/components/tasks/TaskDashboard.tsx`**

- Add a date period `Select` dropdown in the header area (matching the reference image: This Week, Last Week, This Month, Last Month, Custom Range)
- Default to "This Week"
- The selected period filters the dashboard stats (stat cards + charts) by task `due_date` or `created_at` within the range
- Reuse the same `DatePreset` type and `getDateRange` logic from `TaskAnalyticsTab.tsx` (extract to shared utility or duplicate inline)

#### 4. Fix Dashboard Chart Drill-Down Filters

**File: `src/components/tasks/TaskDashboard.tsx`**

Update click handlers to pass complete, correct filters:

- **Status chart click**: Pass `status: [clickedStatus]` (current behavior is correct)
- **Type chart click**: Pass `taskType: [clickedType]` plus `status: ["Not Started", "In Progress", "Pending Client"]` to exclude completed
- **Priority chart click**: Pass `priority: [clickedPriority]` plus `status: ["Not Started", "In Progress", "Pending Client"]`
- **SLA Adherence gauge click**: Pass filter for tasks where SLA is breached
- **"Total Open" card**: Pass `status: ["Not Started", "In Progress", "Pending Client"]` instead of no filter
- **"Due Today" card**: Already correct
- **"Overdue" card**: Add `status: ["Not Started", "In Progress", "Pending Client"]` to exclude completed
- **"Completed This Week" card**: Already correct

---

### Technical Detail

#### Files to Modify

| File | Changes |
|---|---|
| `src/hooks/useTasksEnhanced.ts` | Remove `filters` from DB query; add `slaAdherent` and `slaBreached` to `TaskStats`; add `slaBreached` filter support |
| `src/pages/Tasks.tsx` | Apply filters client-side for Overview only; clear filters on dashboard return; pass dashboard date period to `TaskDashboard` |
| `src/components/tasks/TaskDashboard.tsx` | Add date period dropdown; fix SLA calculation using `sla_deadline`; rename to "SLA Adherence"; fix all drill-down filters; accept `allTasks` prop for date-filtered stats |

#### Updated TaskDashboard Props

```text
interface TaskDashboardProps {
  tasks: EnhancedTask[];          // All advisor-filtered tasks (unfiltered by detail filters)
  onViewDetail: (filters?: TaskFilters) => void;
}
```

The dashboard will compute its own stats internally from the `tasks` prop, filtered by the selected date period. This fully decouples it from the Overview filter state.

#### SLA Adherence Calculation

```text
Tasks with sla_deadline:
  - Completed before/on sla_deadline -> "adherent"
  - Completed after sla_deadline OR still open past sla_deadline -> "breached"
  
SLA Adherence % = adherent / (adherent + breached) * 100
```

#### Date Period Dropdown (Dashboard Header)

Renders as a `Select` component with calendar icon, matching the reference image:
- This Week (default, checked)
- Last Week
- This Month
- Last Month
- Custom Range (with date pickers)

