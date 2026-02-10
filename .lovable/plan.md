

## Add Filter Tags, Reset, and Saved Filter Views to Analytics Tab

### Overview

Add the same filter persistence UX from the All Tasks view into the Analytics tab: active filter tags displayed as removable badges, a "Reset Filters" link, and a "Save Filter" / "Saved Views" dropdown with searchable selection.

### Changes

**File: `src/components/tasks/TaskAnalyticsTab.tsx`**

#### 1. Integrate `useSavedTaskFilters` hook
- Import and use the existing `useSavedTaskFilters` hook to load, save, and delete analytics filter configurations.
- Define an `AnalyticsFilterState` object that captures `datePreset`, `customFrom`, `customTo`, `selectedTeams`, and `subView` so the full analytics filter context can be saved and restored.

#### 2. Active Filter Tags Row
Below the toolbar, when any filter is active (non-default date preset, selected teams, or specific sub-view), render a row of removable Badge tags showing:
- **Date preset**: e.g., "Last Week", "This Month", or "10 Feb – 15 Feb 2026" for custom ranges
- **Each selected team**: e.g., "Jordaan Financial Planning" with an X to remove
- A **"Reset Filters"** link that resets all filters to defaults (This Week, no team filter, By User view)

#### 3. Save Filter Button
- Show a "Save Filter" button (with Save icon) in the filter tags row when filters are active
- Clicking opens a small Dialog to name and save the current filter configuration
- Reuses the same `useSavedTaskFilters.saveFilter()` method, storing the analytics-specific filter state in the existing `saved_task_filters` table with a JSON payload

#### 4. Saved Views Dropdown
- Add a "Saved Views" button (with BookmarkCheck icon) to the toolbar, visible when saved filters exist
- Uses a `DropdownMenu` with a searchable input at the top (using a text Input for filtering the list)
- Each item shows the filter name, with a delete (Trash2) icon
- Clicking a saved view restores the full analytics filter state (date preset, teams, sub-view)

### Technical Details

- The saved filter payload will include an `analyticsContext` flag so the hook can differentiate between All Tasks filters and Analytics filters if needed, though both use the same DB table
- Filter state serialized as: `{ type: "analytics", subView, datePreset, customFrom, customTo, selectedTeams }`
- The searchable dropdown uses a local `searchTerm` state to filter the `savedFilters` list by name
- All icons and patterns (Badge, X, Save, BookmarkCheck, Trash2) match the existing TaskFilters component exactly

### Visual Layout

The toolbar area will look like:

```text
Row 1: [By User | By Task Type]  [This Week v]  [Custom dates]  [Filter by team...]  [Saved Views v]  [Export Report]
Row 2: Filtered by:  [Last Month x]  [Team A x]  [Team B x]   Reset Filters   |  Save Filter
```

Row 2 only appears when filters differ from defaults.

