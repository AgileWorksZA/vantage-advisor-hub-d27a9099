

# Fix: Restore Original Widget Column Width While Maintaining Wrapping

## Problem Analysis

The current implementation calculates `dynamicCols` based on a 280px minimum widget width, which changes the total number of columns as the container resizes. This creates a formula like:

```
dynamicCols = floor((containerWidth + 16) / (280 + 16))
```

For a 1200px container: `floor(1216 / 296) = 4 columns`

**The Problem**: With 4 columns and widgets having `w: 3`, each widget spans 75% of the grid (3/4 columns), making them much wider than intended.

**Original Intent**: The layout uses `w: 3` values assuming a **12-column grid** where `w: 3` means 25% of the width (3/12 = 25%).

## Solution

Keep the fixed 12-column grid system but **hide columns** on smaller screens rather than reducing the column count. This preserves the original widget proportions while achieving wrapping:

1. Keep `cols: 12` as a fixed value
2. Calculate how many "visible" columns fit based on container width
3. When laying out widgets, clamp their positions to fit within visible columns
4. Widgets that don't fit will naturally flow to the next row due to `compactType="vertical"`

### Key Insight
With a 12-column grid on a 1200px container, each column is 100px. For widgets with `w: 3`, that's 300px per widget - close to the original design.

The fix is to:
- Keep the 12-column grid for width proportions
- Adjust only the `x` positions so widgets wrap when they don't fit

## Implementation

### Updated `DraggableWidgetGrid.tsx`

```tsx
import { ReactNode, useRef, useState, useEffect } from 'react';
import { Responsive } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';

// Fixed 12-column grid (original design)
const FIXED_COLS = 12;
const GRID_MARGIN = 16;
// Minimum width before wrapping occurs - based on original ~100px per column
const MIN_COL_WIDTH = 80;

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
}

export const DraggableWidgetGrid = ({
  layout,
  onLayoutChange,
  children,
  rowHeight = 100,
}: DraggableWidgetGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  // Measure container width with ResizeObserver
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Initial measurement
    setContainerWidth(element.getBoundingClientRect().width);

    const observer = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Calculate how many columns can visibly fit
  // This determines wrapping behavior while keeping widget proportions
  const effectiveColWidth = (containerWidth - (FIXED_COLS - 1) * GRID_MARGIN) / FIXED_COLS;
  const visibleCols = effectiveColWidth < MIN_COL_WIDTH 
    ? Math.max(3, Math.floor(containerWidth / (MIN_COL_WIDTH + GRID_MARGIN)))
    : FIXED_COLS;

  // Adjust layout - widgets that exceed visible columns wrap to next row
  const adjustedLayout = layout.map(item => ({
    ...item,
    w: Math.min(item.w, visibleCols), // Cap width to visible columns
    x: item.x >= visibleCols ? 0 : Math.min(item.x, visibleCols - Math.min(item.w, visibleCols)),
  }));

  // Always use FIXED_COLS so widget widths stay proportional
  const layouts = { lg: adjustedLayout };

  return (
    <div ref={containerRef} className="w-full">
      {containerWidth > 0 && (
        <Responsive
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 0 }}
          cols={{ lg: visibleCols }}
          width={containerWidth}
          rowHeight={rowHeight}
          onLayoutChange={(currentLayout: any) => 
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
      )}
    </div>
  );
};
```

## Key Changes

| Aspect | Current | Fixed |
|--------|---------|-------|
| Column count | Dynamic (4-1 based on 280px min) | Fixed 12, reduced to 9/6/3 on smaller screens |
| Column width | Variable (~280px each) | Fixed proportion (~100px on 1200px screen) |
| Widget `w:3` | 75% width (3/4 cols) | 25% width (3/12 cols) |
| Wrapping trigger | When cols < widget width | When column width < 80px |

## Result

- On large screens (1200px+): 12 columns, widgets with `w:3` = ~300px each (4 per row)
- On medium screens (~900px): 9 columns visible, widgets wrap earlier
- On small screens (~600px): 6 columns visible, 2 widgets per row  
- On mobile (~400px): 3 columns visible, 1 widget per row

Widget proportions remain consistent - a `w:3` widget is always ~25% of the visible grid.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/widgets/DraggableWidgetGrid.tsx` | Restore 12-column base grid, add visible column calculation for wrapping |

