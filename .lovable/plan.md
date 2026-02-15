

## Fix Analytics Drill-Down, Add SLA/Utilisation to Task Table, Rename Button

### 1. Rename "All Tasks" to "Overview"

**File: `src/pages/Tasks.tsx` (line 238)**

Change the button label from "All Tasks" to "Overview". Also update any references in `handleViewChange` and URL params that use "detail" display text.

---

### 2. Fix Analytics Click-to-Filter (Column-Aware Drill-Down)

**Problem**: Clicking any number in a row (e.g., the "Overdue" count for "Annual Review") only filters by the row label (task type or person name). It does not filter by the specific column (overdue, due today, etc.), so all tasks for that category appear.

**Fix in `src/components/tasks/TaskAnalyticsTab.tsx`:**

- Update `AnalyticsDataRow` so each cell has its own click handler that passes both the row filter AND the column-specific date/status filter
- Each clickable cell will call `onDrillDown` with combined filters:
  - "Overdue" cell: adds `dueDateTo: yesterday` + excludes completed
  - "Due Today" cell: adds `dueDateFrom: today, dueDateTo: today`
  - "Due Tomorrow" cell: adds `dueDateFrom: tomorrow, dueDateTo: tomorrow`
  - "Due This Week" cell: adds `dueDateFrom: weekStart, dueDateTo: weekEnd`
  - "Due Next Week" cell: adds `dueDateFrom: nextWeekStart, dueDateTo: nextWeekEnd`
  - "Completed in Period" cell: adds `status: ["Completed"]` + period date range
  - "Due Items" cell: filters by row only (current behavior)
- Pass `onCellClick(row, column)` instead of a single `onClick` per row
- The same logic applies to `AdviserGroupRow` header cells

---

### 3. Show SLA and Utilisation Columns on the Overview (Task Table)

**File: `src/components/tasks/TaskTable.tsx`:**

- Add a "Utilisation" column next to the existing "SLA" column
- Display the `standard_execution_minutes` value from each task (e.g., "120 min" or "2h")
- The SLA column already shows "On Track" / "Breached" -- keep as is

**File: `src/hooks/useTasksEnhanced.ts`:**

- Ensure `standard_execution_minutes` is included in the `EnhancedTask` interface (it comes from the DB but is currently accessed via `(t as any).standard_execution_minutes`)
- Add `standard_execution_minutes` to the `EnhancedTask` type definition so it is properly typed

---

### Technical Summary

| File | Changes |
|---|---|
| `src/pages/Tasks.tsx` | Rename "All Tasks" button to "Overview" (line 238) |
| `src/components/tasks/TaskAnalyticsTab.tsx` | Refactor `AnalyticsDataRow` to pass column-specific filters on each cell click; update `handleRowClick` to accept a column parameter |
| `src/components/tasks/TaskTable.tsx` | Add "Utilisation" column showing `standard_execution_minutes` |
| `src/hooks/useTasksEnhanced.ts` | Add `standard_execution_minutes: number | null` to `EnhancedTask` interface |

