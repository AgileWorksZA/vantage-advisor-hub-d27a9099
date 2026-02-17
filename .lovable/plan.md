

## Export Analytics Table to Excel

### What It Does
When clicking "Export Report", the system will generate a proper `.xlsx` Excel file (instead of the current CSV) containing the analytics table data as currently filtered (by user/type view, date range, etc.), with formatting for headers and a totals row.

### Technical Approach

**Install dependency**: Add the `xlsx` (SheetJS) package -- a lightweight, zero-dependency library for generating Excel files in the browser.

**Replace `exportToCsv` with `exportToExcel`** in `src/components/tasks/TaskAnalyticsTab.tsx`:

| Step | Detail |
|------|--------|
| 1. Import `xlsx` | `import * as XLSX from "xlsx"` |
| 2. Replace export function | Build a worksheet from the same `rows` array + totals row, with proper column headers matching the table ("Assigned To" or "Workflow Type", "Due Items", "Overdue", etc.) |
| 3. Column widths | Set reasonable auto-widths so the spreadsheet is readable on open |
| 4. File naming | `workflow-analytics-by-user-2026-02-17.xlsx` (matches current CSV naming pattern but with `.xlsx`) |
| 5. Download trigger | Use `XLSX.writeFile()` to trigger browser download |

**Data included in export:**
- All currently visible rows (respecting the "By User" or "By Workflow Type" grouping)
- For the "By User" view: adviser group headers with their members indented beneath (flattened into rows)
- A totals row at the bottom
- Columns: Group label, Due Items, Overdue, Due Today, Due Tomorrow, Due This Week, Due Next Week, Completed in Period, Completed Prior Period, Utilisation %, SLA Adherence %

### Files Changed

| File | Change |
|------|--------|
| `package.json` | Add `xlsx` dependency |
| `src/components/tasks/TaskAnalyticsTab.tsx` | Replace `exportToCsv` function with `exportToExcel` using the `xlsx` library; update the button's onClick |

