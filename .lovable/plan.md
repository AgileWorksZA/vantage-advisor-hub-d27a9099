

## Fixed-Size Widget Layout System

### Problem Analysis

The current implementation uses `react-grid-layout` which operates on a **proportional column model**:
- Container width is divided equally among columns
- Widget width = `(containerWidth / cols) * widget.w`
- This means widgets always stretch/shrink to fill their allocated space

**What the reference screenshots show:**
- Widgets have **absolute fixed pixel sizes** (e.g., ~350px wide, ~380px tall)
- Widget dimensions never change regardless of screen width
- When the viewport narrows, widgets wrap to the next row
- No horizontal scrollbar, no text overflow

### Solution: Hybrid Fixed-Width Grid

We need to fundamentally change the approach:

1. **Calculate a fixed column width** based on the target widget size
2. **Set the grid width to the exact pixel width needed** for the widgets that fit
3. **Use flexbox for the outer container** to handle wrapping naturally
4. Alternatively, force react-grid-layout to use exact pixel widths by calculating the container width to match the column calculation exactly

### Technical Implementation

**Option A: Force exact column widths in react-grid-layout**

Calculate the grid `width` prop to be exactly what's needed for the visible columns:
```typescript
// Target widget width for w:3 widgets
const TARGET_WIDGET_WIDTH = 350;
const GRID_MARGIN = 16;

// Calculate how many widgets fit
const widgetsPerRow = Math.max(1, Math.floor(
  (containerWidth + GRID_MARGIN) / (TARGET_WIDGET_WIDTH + GRID_MARGIN)
));

// Calculate exact grid width so columns = target width exactly
// Formula: colWidth = (width - margin*(cols-1)) / cols
// We want colWidth * 3 = TARGET_WIDGET_WIDTH
// So colWidth = TARGET_WIDGET_WIDTH / 3
// width = colWidth * cols + margin * (cols - 1)
const colWidth = TARGET_WIDGET_WIDTH / 3;
const visibleCols = widgetsPerRow * 3;
const exactGridWidth = colWidth * visibleCols + GRID_MARGIN * (visibleCols - 1);
```

Pass `exactGridWidth` as the `width` prop instead of `containerWidth`. This ensures widgets are exactly the target size.

**Option B: Use flexbox wrapper (simpler, more reliable)**

Wrap widgets in a flexbox container with `flex-wrap: wrap` and give each widget a fixed width. Keep react-grid-layout for drag-and-drop reordering, but disable its width stretching.

### Recommended Approach: Fixed Grid Width Calculation

Modify `DraggableWidgetGrid.tsx`:

1. Calculate how many widgets fit at target width
2. Calculate the exact grid width that produces that target widget width
3. Center the grid container if there's leftover space
4. Widgets maintain exact pixel dimensions at all times

### Code Changes

**File: `src/components/widgets/DraggableWidgetGrid.tsx`**

```tsx
const GRID_MARGIN = 16;
const DEFAULT_TARGET_WIDGET_WIDTH = 350; // Fixed widget width for w:3

export const DraggableWidgetGrid = ({
  layout,
  onLayoutChange,
  children,
  rowHeight = 120, // Taller rows for fixed-size widgets
  targetWidgetWidth = DEFAULT_TARGET_WIDGET_WIDTH,
  baseWidgetUnits = 3,
}: DraggableWidgetGridProps) => {
  // ... container width measurement code stays the same ...

  // Calculate how many w:3 widgets can fit
  const widgetsPerRow = Math.max(1, Math.floor(
    (containerWidth + GRID_MARGIN) / (targetWidgetWidth + GRID_MARGIN)
  ));

  const visibleCols = widgetsPerRow * baseWidgetUnits;

  // Calculate exact grid width so each w:3 widget = targetWidgetWidth exactly
  // react-grid-layout formula: colWidth = (width - margin*(cols-1)) / cols
  // We want: colWidth * 3 = targetWidgetWidth → colWidth = targetWidgetWidth / 3
  const colWidth = targetWidgetWidth / baseWidgetUnits;
  const exactGridWidth = (colWidth * visibleCols) + (GRID_MARGIN * (visibleCols - 1));

  // Adjust layout for current column count
  const adjustedLayout = layout.map(item => ({
    ...item,
    w: Math.min(item.w, visibleCols),
    x: item.x >= visibleCols ? 0 : Math.min(item.x, visibleCols - Math.min(item.w, visibleCols)),
  }));

  return (
    <div ref={containerRef} className="w-full flex justify-start">
      <Responsive
        key={visibleCols}
        className="layout"
        layouts={{ lg: adjustedLayout }}
        breakpoints={{ lg: 0 }}
        cols={{ lg: visibleCols }}
        width={exactGridWidth}  // Use exact width, not container width
        rowHeight={rowHeight}
        onDragStop={(currentLayout) => onLayoutChange(currentLayout as WidgetLayout[])}
        draggableHandle=".widget-drag-handle"
        margin={[GRID_MARGIN, GRID_MARGIN]}
        containerPadding={[0, 0]}
        isResizable={false}
        compactType="vertical"
        preventCollision={false}
        useCSSTransforms={true}
      >
        {children}
      </Responsive>
    </div>
  );
};
```

### Expected Behavior

| Container Width | Widgets Per Row | Exact Grid Width | Widget Width (w:3) |
|-----------------|-----------------|------------------|-------------------|
| 1500px | 4 | 1448px | 350px |
| 1100px | 3 | 1082px | 350px |
| 750px | 2 | 716px | 350px |
| 400px | 1 | 350px | 350px |

- Widgets **never shrink or stretch**
- Grid is left-aligned within the container (or can be centered)
- As screen narrows, widgets wrap to new rows
- Content inside widgets never overflows

### Row Height Adjustment

Current `rowHeight=100` may be too short for fixed-size widgets. Based on the reference screenshots, widgets appear taller. Adjusting to `rowHeight=120` or `130` will better match the reference.

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/widgets/DraggableWidgetGrid.tsx` | Calculate exact grid width to force fixed widget sizes. Add container centering/alignment. |
| `src/pages/Dashboard.tsx` | Optionally adjust `targetWidgetWidth` if needed (default should work). |
| `src/pages/Insights.tsx` | Optionally adjust `targetWidgetWidth` if needed (default should work). |

### Result

- Widgets maintain their exact pixel size regardless of viewport
- Wrapping occurs naturally when space runs out
- No horizontal scrollbars within widgets
- No text overflow - content is contained within fixed widget bounds
- Drag-and-drop still works for repositioning widgets

