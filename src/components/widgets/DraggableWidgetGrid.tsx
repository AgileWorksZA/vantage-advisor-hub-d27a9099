import { ReactNode, useRef, useState, useEffect } from 'react';
import { Responsive } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';

// Fixed 12-column grid (original design)
const FIXED_COLS = 12;
const GRID_MARGIN = 16;
// Default minimum width before wrapping occurs - based on original ~100px per column
const DEFAULT_MIN_COL_WIDTH = 80;

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
  minColWidth?: number; // Configurable wrap threshold per page
}

export const DraggableWidgetGrid = ({
  layout,
  onLayoutChange,
  children,
  rowHeight = 100,
  minColWidth = DEFAULT_MIN_COL_WIDTH,
}: DraggableWidgetGridProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  // Measure container width with ResizeObserver
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    // Initial measurement - use requestAnimationFrame to ensure layout is complete
    const measureWidth = () => {
      const width = element.getBoundingClientRect().width;
      if (width > 0) {
        setContainerWidth(width);
      }
    };

    // Measure on next frame to ensure container has rendered with proper width
    requestAnimationFrame(measureWidth);

    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Don't render until we have an accurate width measurement
  if (containerWidth === null) {
    return <div ref={containerRef} className="w-full min-h-[200px]" />;
  }

  // Calculate how many columns can visibly fit
  // This determines wrapping behavior while keeping widget proportions
  const effectiveColWidth = (containerWidth - (FIXED_COLS - 1) * GRID_MARGIN) / FIXED_COLS;
  const visibleCols = effectiveColWidth < minColWidth 
    ? Math.max(3, Math.floor(containerWidth / (minColWidth + GRID_MARGIN)))
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
