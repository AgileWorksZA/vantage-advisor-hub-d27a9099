

## Upgrade Task Filters to Multi-Select with Filter Tags

### Overview
Replace the single-select dropdowns for Status, Priority, Task Type, and Category with the existing `MultiSelect` component (already used on the Clients page). Add a date range picker (From/To) instead of just "Due by". Show removable filter tags (badges) for each active selection, with a "Reset Filters" option.

### Changes

**File: `src/components/tasks/TaskFilters.tsx`** (rewrite filter controls)

1. Replace `Select` imports with `MultiSelect` from `@/components/ui/multi-select`
2. Convert Status, Priority, Task Type, and Category filters to use `MultiSelect`:
   - Each shows `"Status (all)"` when nothing selected, `"Status (3)"` when 3 items selected
   - `onChange` sets the full array on the filters (or `undefined` if empty)
3. Replace the single "Due by" date picker with a date range using two calendar popovers:
   - "Due from" and "Due to" buttons
4. Add a "Filtered by:" row below the filter bar showing removable `Badge` tags for each active filter value
5. Add inline "Reset Filters" link that clears all filters

### Display Logic for MultiSelect Labels
- Nothing selected: `"Status (all)"`
- Some selected: `"Status (3)"`
- All selected: `"Status (all)"`

This matches the pattern shown in the reference images (Profile status / Client types).

### Filter Tags Row
Below the main filter bar, when filters are active, render:
```
Filtered by: [In Progress x] [High x] [Follow-up x] [Due to: Feb 9, 2026 x]  Reset Filters
```
Each badge has an X to remove that individual filter value.

### Files Changed
| File | Action |
|------|--------|
| `src/components/tasks/TaskFilters.tsx` | Modify - replace Select with MultiSelect, add date range, add filter tags row |

