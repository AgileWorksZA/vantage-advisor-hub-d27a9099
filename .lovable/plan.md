

# Fix: Widgets Maintain Fixed Width and Wrap to New Rows

## Problem Analysis

The current implementation uses `react-grid-layout`'s `Responsive` component with `WidthProvider`, which:
- Calculates column width as: `(containerWidth - margins) / columnCount`
- This means widgets shrink proportionally as the container shrinks
- Even with responsive breakpoints changing the column count, the widgets still shrink because the container itself is smaller

**Desired Behavior**: Widgets should maintain a **fixed minimum width** (~280px) and wrap to new rows when the screen becomes narrower, rather than shrinking.

---

## Solution: Dynamic Column Count Based on Container Width

Instead of using fixed breakpoints with fixed column counts, we'll dynamically calculate the number of columns based on the actual container width:

```
columns = floor(containerWidth / minWidgetWidth)
```

For example, with a 280px minimum widget width:
- 1200px container → 4 columns (300px each)
- 900px container → 3 columns (300px each)
- 600px container → 2 columns (300px each)
- 400px container → 1 column (400px)

---

## Implementation Changes

### 1. Update `DraggableWidgetGrid.tsx`

**Key changes:**
- Add `useRef` and `useEffect` to measure container width with ResizeObserver
- Calculate dynamic column count based on minimum widget width (280px)
- Pass dynamic `cols` to the grid instead of using breakpoint-based column counts
- Simplify the responsive layouts since column count is now dynamic

```tsx
// New constants
const MIN_WIDGET_WIDTH = 280; // Minimum pixel width per widget
const GRID_MARGIN = 16; // Margin between widgets

// Inside component - measure container width
const containerRef = useRef<HTMLDivElement>(null);
const [containerWidth, setContainerWidth] = useState(1200);

useEffect(() => {
  const element = containerRef.current;
  if (!element) return;
  
  const observer = new ResizeObserver(([entry]) => {
    setContainerWidth(entry.contentRect.width);
  });
  
  observer.observe(element);
  return () => observer.disconnect();
}, []);

// Calculate dynamic columns
const dynamicCols = Math.max(1, Math.floor(containerWidth / MIN_WIDGET_WIDTH));
```

### 2. Adjust Layout Items for Current Column Count

When the column count changes, widget positions need adjustment:
- Widgets that would be positioned outside the available columns get repositioned
- Widget widths are capped at the current column count

```tsx
const adjustedLayout = layout.map(item => ({
  ...item,
  x: item.x % dynamicCols, // Wrap x position
  w: Math.min(item.w, dynamicCols), // Cap width
}));
```

### 3. Remove WidthProvider Dependency

Since we're measuring width ourselves, we can use the base `Responsive` component directly or simplify to `GridLayout`:

```tsx
import { Responsive } from 'react-grid-layout/legacy';

// Instead of WidthProvider(Responsive), pass width directly
<Responsive
  width={containerWidth}
  cols={{ lg: dynamicCols, md: dynamicCols, sm: dynamicCols, xs: dynamicCols }}
  breakpoints={{ lg: 0, md: 0, sm: 0, xs: 0 }}
  // ... other props
>
```

---

## Updated DraggableWidgetGrid Component

```tsx
import { ReactNode, useRef, useState, useEffect } from 'react';
import { Responsive } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';

// Minimum widget width in pixels - widgets will wrap rather than shrink below this
const MIN_WIDGET_WIDTH = 280;
const GRID_MARGIN = 16;

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
  minWidgetWidth?: number;
}

export const DraggableWidgetGrid = ({
  layout,
  onLayoutChange,
  children,
  rowHeight = 100,
  minWidgetWidth = MIN_WIDGET_WIDTH,
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

  // Calculate dynamic column count based on container width
  const dynamicCols = Math.max(1, Math.floor(
    (containerWidth + GRID_MARGIN) / (minWidgetWidth + GRID_MARGIN)
  ));

  // Adjust layout for current column count
  const adjustedLayout = layout.map(item => ({
    ...item,
    x: Math.min(item.x, Math.max(0, dynamicCols - item.w)),
    w: Math.min(item.w, dynamicCols),
  }));

  // Generate layouts object for Responsive component
  const layouts = { lg: adjustedLayout };

  return (
    <div ref={containerRef} className="w-full">
      {containerWidth > 0 && (
        <Responsive
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 0 }}
          cols={{ lg: dynamicCols }}
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
        />
      )}
    </div>
  );
};
```

---

## Technical Summary

| Aspect | Before | After |
|--------|--------|-------|
| Column count | Fixed per breakpoint (12/9/6/3) | Dynamic based on container width |
| Widget width | Shrinks with container | Fixed minimum (280px) |
| Responsive behavior | Breakpoint-based | Width-calculation-based |
| Width measurement | WidthProvider HOC | ResizeObserver directly |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/widgets/DraggableWidgetGrid.tsx` | Replace WidthProvider approach with ResizeObserver-based dynamic column calculation |

---

## Result

After these changes:
- Widgets will maintain approximately 280px minimum width
- When the screen shrinks, widgets will wrap to new rows instead of shrinking
- The grid will show 4 widgets per row on wide screens, 3 on medium, 2 on narrow, and 1 on mobile
- Users can scroll vertically to see all widgets
- Drag-and-drop and layout persistence will continue to work

