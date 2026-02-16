

## Convert Client Dashboard to Draggable Widget Grid

### Overview
Apply the same widget grid system used on the Advisor Dashboard to the Client Dashboard tab -- draggable cards with grip handles, a settings gear to show/hide widgets, and layout persistence per user.

### Changes

**`src/components/client-detail/ClientDashboardTab.tsx` -- Major edit**

1. **Import** `DraggableWidgetGrid`, `WidgetLayout`, `useWidgetLayout`, `WidgetSettingsDialog`, `WidgetConfig`, and icons (`GripVertical`, `X`, `Settings`)

2. **Define widget config and default layout** (same pattern as Dashboard.tsx):
```text
defaultClientDashboardLayout:
  asset-allocation      x:0 y:0 w:3 h:3
  valuation-change      x:3 y:0 w:3 h:3
  geo-diversification   x:6 y:0 w:3 h:3
  top-opportunities     x:0 y:3 w:3 h:3
  opp-breakdown         x:3 y:3 w:3 h:3
  opp-value-summary     x:6 y:3 w:3 h:3
  action-priority       x:0 y:6 w:3 h:3
  key-dates             x:3 y:6 w:3 h:3

CLIENT_DASHBOARD_WIDGETS: WidgetConfig[] (8 entries matching above)
```

3. **Hook up `useWidgetLayout`** with `pageId: 'dashboard'` and `userId` (passed as new prop from ClientDetail page)

4. **Replace the static CSS grid** with `DraggableWidgetGrid` component:
   - Each widget card wrapped in a `<div key="widget-id">` with `isWidgetVisible()` guard
   - Card headers get the `widget-drag-handle` class, `GripVertical` icon, and `cursor-move`
   - Toolbar (contracts + household multi-selects) stays above the grid, unchanged

5. **Add `WidgetSettingsDialog`** next to the toolbar area (right-aligned), wired to `hiddenWidgets` and `handleToggleWidget`

6. **Widget card header pattern** (matching Advisor Dashboard exactly):
```tsx
<CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
  <div className="flex items-center gap-2">
    <GripVertical className="w-4 h-4 text-muted-foreground" />
    <CardTitle className="text-sm font-medium">Widget Name</CardTitle>
  </div>
</CardHeader>
```

**`src/pages/ClientDetail.tsx` -- Minor edit**

- Pass `userId={user?.id}` to `ClientDashboardTab` so it can persist layout per user

### What stays the same
- All widget content (charts, opportunity lists, key dates, etc.) remains identical
- The toolbar with MultiSelect dropdowns and Add Member button stays above the grid
- All data generation logic (seededRandom, opportunities, etc.) unchanged

### Files

| File | Action |
|------|--------|
| `src/components/client-detail/ClientDashboardTab.tsx` | Edit -- wrap widgets in DraggableWidgetGrid, add settings gear |
| `src/pages/ClientDetail.tsx` | Edit -- pass userId prop |

