

## Fix Widget Layout Swap on Both Dashboards

### Problem
The current skeleton approach puts loading placeholders **inside** each widget's CardContent, but the `DraggableWidgetGrid` still renders with the default layout first, then jumps to the saved layout once it loads from the database. This causes the visible "swapping around" effect even though skeletons are showing.

### Solution
Instead of rendering the real `DraggableWidgetGrid` while the layout is loading, render a **static CSS grid of skeleton cards** that matches the visual shape of the dashboard. Once the layout finishes loading, swap in the real draggable grid with the correct saved positions and full widget content. This eliminates the layout jump entirely.

### Changes

**1. `src/pages/Dashboard.tsx` -- Replace grid with skeleton placeholder during load**

- When `layoutLoading` is true, render a static grid of skeleton cards (3 columns, matching the typical dashboard appearance) instead of the `DraggableWidgetGrid`
- Remove the per-widget `layoutLoading` skeleton checks inside CardContent (no longer needed)
- When `layoutLoading` is false, render the `DraggableWidgetGrid` as normal with full widget content

**2. `src/components/client-detail/ClientDashboardTab.tsx` -- Same pattern**

- When `layoutLoading` is true, render static skeleton cards in a CSS grid
- Remove per-widget skeleton checks inside CardContent
- When `layoutLoading` is false, render the real `DraggableWidgetGrid`

### Visual Result

While loading:
```text
+--skeleton--+  +--skeleton--+  +--skeleton--+
|             |  |             |  |             |
+-------------+  +-------------+  +-------------+
+--skeleton--+  +--skeleton--+  +--skeleton--+
|             |  |             |  |             |
+-------------+  +-------------+  +-------------+
```

After load: real widgets appear in their saved positions with no jump.

### Files

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Wrap `DraggableWidgetGrid` in `!layoutLoading` check; add static skeleton grid for loading state |
| `src/components/client-detail/ClientDashboardTab.tsx` | Same pattern as above |

