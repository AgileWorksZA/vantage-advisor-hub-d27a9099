

## Rename Summary Tab to "Next Best Action" and Move Widgets

### Overview
Rename the "Summary" tab to "Next Best Action" and relocate the "Current Advisor and Accounts" and "Outstanding Documents" cards from the Summary/NBA page into the Client Dashboard as new draggable widgets.

### Changes

**1. `src/pages/ClientDetail.tsx` -- Minor edit**
- Change the tab label from `"Summary"` to `"Next Best Action"` in the TabsList array (line 258)

**2. `src/components/client-detail/ClientSummaryTab.tsx` -- Edit**
- Remove the "Current Advisor and Accounts" card (lines 201-233) and the `advisorData` constant (lines 38-41)
- Remove the "Outstanding Documents" card (lines 235-258) and the `outstandingDocs` constant (lines 43-47)
- With those two cards removed, the left column will contain only "General details"; the right column stays as-is with the Next Best Action panel
- Remove the now-unused `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow` imports

**3. `src/components/client-detail/ClientDashboardTab.tsx` -- Edit**

Add two new widgets to the draggable grid:

- **`advisor-accounts`** -- "Current Advisor & Accounts" widget showing the advisor table (same data/layout as the removed card, using the `client.advisor` prop)
- **`outstanding-docs`** -- "Outstanding Documents" widget showing the static outstanding documents table

Specific changes:
- Add `Table`, `TableBody`, `TableCell`, `TableHead`, `TableHeader`, `TableRow` imports
- Add the `advisorData` and `outstandingDocs` constants (moved from SummaryTab)
- Add two new entries to `defaultClientDashboardLayout`:
  - `{ i: 'advisor-accounts', x: 6, y: 6, w: 3, h: 3 }`
  - `{ i: 'outstanding-docs', x: 0, y: 9, w: 3, h: 3 }`
- Add two new entries to `CLIENT_DASHBOARD_WIDGETS`:
  - `{ id: 'advisor-accounts', label: 'Current Advisor & Accounts' }`
  - `{ id: 'outstanding-docs', label: 'Outstanding Documents' }`
- Add the two widget card blocks inside `DraggableWidgetGrid`, following the same drag-handle pattern as existing widgets

### What stays the same
- All existing 8 dashboard widgets remain unchanged
- The Next Best Action panel content (Opportunities, Outstanding, Recent Activity sub-tabs) stays in the renamed tab
- The "General details" card stays on the renamed tab
- All data generation and hook logic unchanged

### Files

| File | Action |
|------|--------|
| `src/pages/ClientDetail.tsx` | Rename tab label from "Summary" to "Next Best Action" |
| `src/components/client-detail/ClientSummaryTab.tsx` | Remove Advisor/Accounts and Outstanding Docs cards and related imports |
| `src/components/client-detail/ClientDashboardTab.tsx` | Add two new draggable widgets with the moved content |

