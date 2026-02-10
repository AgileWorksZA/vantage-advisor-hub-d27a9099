

## Remove Summary Charts and Add Totals Row to Analytics Tab

### Overview

Remove the 4-column summary chart grid (Status donut, Priority donut, Utilisation gauge, SLA gauge) from the Analytics tab and add a sticky totals row at the bottom of the data table that aggregates all visible columns.

### Changes

**File: `src/components/tasks/TaskAnalyticsTab.tsx`**

#### 1. Remove Summary Charts
- Remove the `EChartsWrapper` import and the 4-card chart grid (Status, Priority, Utilisation, SLA)
- Remove the associated `useMemo` hooks for `statusChartData`, `priorityChartData`, `aggregateUtilisation`, `aggregateSla`, and chart option builders (`makeGaugeOption`, donut options)
- Remove the `Card`/`CardHeader`/`CardTitle`/`CardContent` imports if no longer used elsewhere in the component

#### 2. Add Totals Row
- Append a `<tfoot>` / final `<TableRow>` at the bottom of the data table with bold styling and a top border
- The row displays aggregated totals for all numeric columns:
  - **Name column**: displays "Totals"
  - **Open Tasks**: sum of all visible rows
  - **Completed (period)**: sum
  - **Completed (prior)**: sum
  - **Overdue**: sum
  - **Avg Days to Close**: weighted average (or simple average across rows that have values)
  - **Utilisation %**: weighted average based on total standard minutes vs total capacity
  - **SLA Adherence %**: weighted average (total on-time / total with SLA)
- Compute totals from the currently displayed `computedRows` (respects active filters)
- Style the totals row with `font-semibold bg-muted/30 border-t-2` to visually separate it from data rows

### Technical Details

| Item | Detail |
|------|--------|
| Modified file | `src/components/tasks/TaskAnalyticsTab.tsx` |
| Removed | EChartsWrapper charts, chart data memos, chart grid |
| Added | Totals row at table bottom with aggregated metrics |
| No DB changes | Pure UI update |

