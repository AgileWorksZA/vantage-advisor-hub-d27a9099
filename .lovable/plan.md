

## Position Gear Icon Above Rightmost Widget

### Problem
The settings gear icon is positioned relative to the full container width (via `justify-between` or `ml-auto`), but the widget grid has a fixed `exactGridWidth` that is often narrower than the container. This means the gear doesn't align with the right edge of the rightmost widget.

### Solution
Pass the gear (settings dialog) into the `DraggableWidgetGrid` component as a `toolbar` prop. The grid already calculates `exactGridWidth`, so it can render the toolbar right-aligned within that exact width -- guaranteeing the gear always sits directly above the rightmost widget's X button.

### Changes

**1. `src/components/widgets/DraggableWidgetGrid.tsx`**
- Add an optional `toolbar?: ReactNode` prop
- Render it above the grid, right-aligned, constrained to `exactGridWidth`
- Structure:
```tsx
<div ref={containerRef} className="w-full flex justify-start">
  <div style={{ width: exactGridWidth }}>
    {toolbar && (
      <div className="flex justify-end mb-2">
        {toolbar}
      </div>
    )}
    <Responsive ...>
      {children}
    </Responsive>
  </div>
</div>
```

**2. `src/pages/Dashboard.tsx`**
- Remove the `WidgetSettingsDialog` from the header row (line 308-312)
- Pass it as `toolbar` prop to `DraggableWidgetGrid`

**3. `src/components/client-detail/ClientDashboardTab.tsx`**
- Remove the `WidgetSettingsDialog` from the toolbar area (lines 373-379)
- Pass it as `toolbar` prop to `DraggableWidgetGrid`

### Files

| File | Change |
|------|--------|
| `src/components/widgets/DraggableWidgetGrid.tsx` | Add `toolbar` prop, render it above grid at `exactGridWidth` |
| `src/pages/Dashboard.tsx` | Move `WidgetSettingsDialog` into grid's `toolbar` prop |
| `src/components/client-detail/ClientDashboardTab.tsx` | Move `WidgetSettingsDialog` into grid's `toolbar` prop |

