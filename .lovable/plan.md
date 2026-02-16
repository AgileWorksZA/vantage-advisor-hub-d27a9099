

## Fix Chart Drill-Down Filters to Include Date Range

### Problem
When clicking on any chart segment or stat card, the drill-down to the Overview table does not include the dashboard's selected date range. This means clicking "In Progress" on the Status chart (while viewing "This Week") shows all "In Progress" tasks across all time instead of just this week's tasks.

### Affected Click Handlers

| Widget | Current Filter | Missing |
|--------|---------------|---------|
| Total Open card | `status: openStatuses` | date range |
| Due Today card | `dueDateFrom/To: today` | OK (has its own date logic) |
| Overdue card | `dueDateTo: yesterday` | OK (has its own date logic) |
| Completed card | `status: ["Completed"]` | date range |
| Status chart | `status: [clicked]` | date range |
| Type chart | `taskType: [clicked], status: openStatuses` | date range |
| Priority chart | `priority: [clicked], status: openStatuses` | date range |
| SLA card | `status: openStatuses` | date range |

### Solution

**File: `src/components/tasks/TaskDashboard.tsx`**

1. Create formatted date strings from `periodStart` and `periodEnd` (yyyy-MM-dd format) using the existing `format` import.

2. Update click handlers and card onClick callbacks to include `dueDateFrom` and `dueDateTo` in the filter object, so every drill-down is scoped to the selected date range.

3. The **Due Today** and **Overdue** cards already have their own specific date logic and should keep their existing behavior (they override the period range with their own more specific date constraints).

### Technical Detail

Add two derived values after `periodLabel`:
```typescript
const periodFromStr = format(periodStart, "yyyy-MM-dd");
const periodToStr = format(periodEnd, "yyyy-MM-dd");
```

Then update each handler/onClick to include these:
- `handleStatusChartClick`: add `dueDateFrom: periodFromStr, dueDateTo: periodToStr`
- `handleTypeChartClick`: add `dueDateFrom: periodFromStr, dueDateTo: periodToStr`
- `handlePriorityChartClick`: add `dueDateFrom: periodFromStr, dueDateTo: periodToStr`
- Total Open card: add `dueDateFrom: periodFromStr, dueDateTo: periodToStr`
- Completed card: add `dueDateFrom: periodFromStr, dueDateTo: periodToStr`
- SLA card: add `dueDateFrom: periodFromStr, dueDateTo: periodToStr`
- Due Today and Overdue cards: no change (they have their own date constraints)

