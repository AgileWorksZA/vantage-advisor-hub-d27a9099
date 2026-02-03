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

  // Always use visibleCols so widget widths stay proportional
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
