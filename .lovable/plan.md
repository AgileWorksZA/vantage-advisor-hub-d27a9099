

## Add "Clients by Age Group" Dashboard Widget

### Overview

Add a new widget to the Advisor Dashboard that displays client counts grouped into 10-year age brackets (e.g., 20-29, 30-39, etc.), sorted from youngest to oldest. The widget follows the same table-based layout as the Birthdays widget.

### Changes

**File: `src/pages/Dashboard.tsx`**

1. **Add widget to layout and config arrays:**
   - Add `{ i: 'age-groups', x: 3, y: 6, w: 3, h: 3 }` to `defaultDashboardLayout`
   - Add `{ id: 'age-groups', label: 'Clients by Age Group' }` to `DASHBOARD_WIDGETS`

2. **Fetch client age data from database:**
   - Add a `useEffect` that queries clients for `date_of_birth` (only non-null values)
   - Compute age from `date_of_birth`, then bucket into 10-year groups: "Under 20", "20-29", "30-39", ..., "80-89", "90+"
   - Store as state: `{ label: string; count: number }[]`

3. **Render the widget** (matching Birthday widget style):
   - Table with columns: "Age Group" (left-aligned) and "Clients" (right-aligned)
   - Each row shows the bracket label and client count
   - Sorted youngest to oldest
   - Clicking a row navigates to `/clients` filtered by that age range
   - Same Card/CardHeader/CardContent structure with drag handle and close button

### Widget Layout (table format)

```text
Age Group    Clients
Under 20          3
20 - 29          12
30 - 39          28
40 - 49          35
50 - 59          22
60 - 69          15
70 - 79           8
80+               4
```

### Technical Detail

| Aspect | Detail |
|---|---|
| File | `src/pages/Dashboard.tsx` |
| Data source | `supabase.from('clients').select('date_of_birth')` filtered to current user |
| Age calculation | Same logic as `calculateAge` in `src/types/client.ts` |
| Grouping | 10-year buckets: Under 20, 20-29, 30-39, 40-49, 50-59, 60-69, 70-79, 80+ |
| Sorting | Ascending by age (youngest first) |
| Click behavior | Navigate to `/clients?filter=age-group&ageFrom=X&ageTo=Y` (or simply show filtered view) |
| Widget ID | `age-groups` |

