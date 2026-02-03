
# Fix: Widgets Maintain Fixed Pixel Width and Wrap Based on Available Space

## Problem Summary

The current implementation uses a **12-column proportional grid** where:
- Widget width `w: 3` = 25% of container width
- As the container shrinks, widgets shrink proportionally
- Only when columns become too narrow (< 80px) does wrapping occur

**What the user wants**: Widgets should have a **fixed pixel width** (e.g., ~280px). The number of widgets per row should be calculated based on how many can fit at that fixed width, and remaining widgets wrap to the next row.

---

## Solution: Fixed-Width Widget Calculation

Instead of using a 12-column proportional grid, we'll:

1. Define a base "unit width" per column (e.g., 280px for a `w: 1` widget, or ~70px per column unit for `w: 3` = 210px)
2. Calculate how many column units fit: `visibleCols = floor(containerWidth / columnUnitWidth)`
3. Widgets that don't fit on the current row automatically wrap to the next row
4. Widget pixel width stays consistent regardless of container size

### Key Insight

Looking at the default layouts:
- Dashboard widgets: `w: 3` (4 widgets per 12-col row)
- Insights widgets: `w: 3` (4 widgets per row), `w: 6` (2 per row)

To keep widgets at ~280px, each column unit should be ~93px (since `w: 3` × 93px ≈ 280px).

We need a different approach: **calculate the visible columns based on how many widget-widths can fit**, not based on shrinking columns below a minimum.

---

## Implementation Approach

### Change in `DraggableWidgetGrid.tsx`

**New logic:**
```typescript
// Target widget width in pixels (w:3 widgets should be ~280px)
const TARGET_WIDGET_WIDTH = 280;
const GRID_MARGIN = 16;

// Calculate based on the most common widget width (w:3)
// Each column unit = TARGET_WIDGET_WIDTH / 3 ≈ 93px
const COLUMN_UNIT_WIDTH = TARGET_WIDGET_WIDTH / 3;

// Calculate how many column units fit in the container
const visibleCols = Math.max(3, Math.floor(
  (containerWidth + GRID_MARGIN) / (COLUMN_UNIT_WIDTH + GRID_MARGIN / 3)
));
```

However, this still creates proportional sizing. For truly **fixed pixel widths**, we need to:

1. Set `cols` to match exactly how many widgets can fit
2. Let react-grid-layout calculate `(containerWidth - margins) / cols` per column
3. Ensure this calculation results in the target widget width

**Better approach - work backwards from desired widget width:**

```typescript
// Desired width for a w:3 widget
const TARGET_W3_WIDTH = 280;

// Calculate how many w:3 widgets fit side by side
const widgetsPerRow = Math.max(1, Math.floor(
  (containerWidth + GRID_MARGIN) / (TARGET_W3_WIDTH + GRID_MARGIN)
));

// The grid needs 3 columns per widget (since w:3)
const visibleCols = widgetsPerRow * 3;
```

This ensures:
- On a 1200px container: `floor(1216 / 296)` = 4 widgets → 12 columns → each w:3 widget = 280px
- On a 900px container: `floor(916 / 296)` = 3 widgets → 9 columns → each w:3 widget = 280px
- On a 600px container: `floor(616 / 296)` = 2 widgets → 6 columns → each w:3 widget = 280px
- On a 400px container: `floor(416 / 296)` = 1 widget → 3 columns → each w:3 widget = 380px (full width)

---

## Updated Code

### `DraggableWidgetGrid.tsx`

```tsx
import { ReactNode, useRef, useState, useEffect } from 'react';
import { Responsive } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';

const GRID_MARGIN = 16;

// Target width for a standard widget (w:3 in a 12-col grid)
// This is the "original" width we want to preserve
const DEFAULT_TARGET_WIDGET_WIDTH = 280;

export interface WidgetLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
}

interface DraggableWidgetGridProps {
  layout: WidgetLayout[];
  onLayoutChange: (layout: WidgetLayout[]) => void;
  children: ReactNode;
  rowHeight?: number;
  targetWidgetWidth?: number; // Target pixel width for a w:3 widget
  baseWidgetUnits?: number; // How many column units = one "standard" widget (default: 3)
}

export const DraggableWidgetGrid = ({
  layout,
  onLayoutChange,
  children,
  rowHeight = 100,
  targetWidgetWidth = DEFAULT_TARGET_WIDGET_WIDTH,
  baseWidgetUnits = 3,
}: DraggableWidgetGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const measureWidth = () => {
      const width = element.getBoundingClientRect().width;
      if (width > 0) {
        setContainerWidth(width);
      }
    };

    requestAnimationFrame(measureWidth);

    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (containerWidth === null) {
    return <div ref={containerRef} className="w-full min-h-[200px]" />;
  }

  // Calculate how many "standard widgets" (w:3) can fit side by side
  // Each widget needs targetWidgetWidth + margin
  const widgetsPerRow = Math.max(1, Math.floor(
    (containerWidth + GRID_MARGIN) / (targetWidgetWidth + GRID_MARGIN)
  ));

  // Convert to column units (each standard widget = baseWidgetUnits columns)
  const visibleCols = widgetsPerRow * baseWidgetUnits;

  // Adjust layout for current column count
  const adjustedLayout = layout.map(item => ({
    ...item,
    w: Math.min(item.w, visibleCols),
    x: item.x >= visibleCols ? 0 : Math.min(item.x, visibleCols - Math.min(item.w, visibleCols)),
  }));

  const layouts = { lg: adjustedLayout };

  return (
    <div ref={containerRef} className="w-full">
      <Responsive
        key={visibleCols}
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 0 }}
        cols={{ lg: visibleCols }}
        width={containerWidth}
        rowHeight={rowHeight}
        onDragStop={(currentLayout: any) => 
          onLayoutChange(currentLayout as WidgetLayout[])
        }
        draggableHandle=".widget-drag-handle"
        margin={[GRID_MARGIN, GRID_MARGIN] as [number, number]}
        containerPadding={[0, 0] as [number, number]}
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

---

## How It Works

| Container Width | Widgets Per Row | Visible Cols | Widget Width (w:3) |
|-----------------|-----------------|--------------|-------------------|
| 1200px | 4 | 12 | ~290px |
| 900px | 3 | 9 | ~290px |
| 600px | 2 | 6 | ~290px |
| 400px | 1 | 3 | ~380px (fills row) |

The key difference: instead of shrinking widgets until a minimum column width is hit, we calculate upfront how many fixed-width widgets fit and set the column count accordingly.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/widgets/DraggableWidgetGrid.tsx` | Replace column-width-based wrapping with widget-count-based calculation. Add `targetWidgetWidth` and `baseWidgetUnits` props. |

---

## Additional Considerations

- **Insights page**: Remove the `minColWidth={100}` prop since it's no longer needed
- **Dashboard and Insights**: Both can use default props (`targetWidgetWidth=280`, `baseWidgetUnits=3`)
- **Larger widgets (w:6)**: Will span 2 widget slots, maintaining correct proportions

---

## Result

- Widgets maintain their original ~280px width regardless of screen size
- On narrower screens, fewer widgets fit per row and the rest wrap
- Users scroll vertically to see all widgets
- No shrinking of widget content
