

## Fix "Clients by Age Group" Widget Sizing

### Problem
The widget content overflows its container, and the previous fix added scrollbars which is not desired. The widget should simply be tall enough to fit all its content, matching the visual style of other widgets.

### Changes

**File: `src/pages/Dashboard.tsx`**

Two changes:

1. **Increase widget height to fit content** -- change `h: 3` to `h: 4` in `defaultDashboardLayout`:
```
// Before
{ i: 'age-groups', x: 3, y: 6, w: 3, h: 3 }

// After
{ i: 'age-groups', x: 3, y: 6, w: 3, h: 4 }
```

2. **Revert Card/CardContent to standard widget styling** -- remove the overflow and flex classes added in the previous fix so the widget matches the simple styling used by every other widget:
```
// Before (with scroll classes)
<Card className="h-full overflow-hidden flex flex-col">
  ...
  <CardContent className="px-4 pb-4 flex-1 overflow-y-auto min-h-0">

// After (standard widget styling)
<Card className="h-full">
  ...
  <CardContent className="px-4 pb-4">
```

### Why this works
- `h: 4` gives the widget 480px of vertical space (4 rows x 120px), enough for the header + 8 age group rows
- The Card and CardContent use the same simple classes as every other widget on the dashboard (e.g., Birthdays, Top Accounts)
- The auto-heal logic in `useWidgetLayout.ts` will automatically migrate any saved user layouts to the new height

