

## Add SLA Segment Drill-Down Filtering

### Problem
Currently the SLA Adherence card has a single `onClick` on the entire card that passes `status: openStatuses` -- it doesn't distinguish between which segment (Met, Breached, At Risk) was clicked. Clicking a specific segment should drill down showing only tasks matching that SLA status plus the date range.

### Complexity
SLA status ("Met", "Breached", "At Risk") is not a database column -- it's computed from `sla_deadline`, `status`, and `completed_at`. This means filtering must happen client-side after fetching tasks.

### Changes

**1. `src/hooks/useTasksEnhanced.ts`** -- Add `slaStatus` to `TaskFilters` and implement client-side filtering

- Add `slaStatus?: string[]` to the `TaskFilters` interface
- After fetching and transforming tasks, apply a client-side filter that computes SLA status for each task (using the same logic as the dashboard) and keeps only those matching the selected SLA statuses

**2. `src/components/tasks/TaskDashboard.tsx`** -- Add SLA chart click handler

- Remove the card-level `onClick` from the SLA card
- Add a `handleSlaChartClick` function that maps clicked segment names ("Met", "Breached", "At Risk") to the new `slaStatus` filter
- Pass `{ slaStatus: [params.name], dueDateFrom: periodFromStr, dueDateTo: periodToStr }` -- no extra status filter, matching the pattern of the other charts
- Wire the handler into `onEvents={{ click: handleSlaChartClick }}`

**3. `src/components/tasks/TaskFilters.tsx`** -- Render SLA filter tags

- Add the `slaStatus` field to `hasActiveFilters` check
- Add filter tag rendering for each `slaStatus` value (e.g., "SLA: Met", "SLA: Breached")
- Add removal logic for `slaStatus` tags

### Result
Clicking "Met" on the SLA semi-circle shows only two filter chips: "SLA: Met" and the date range -- consistent with how Type and Priority charts now work.
