import { ReactNode, useRef, useState, useEffect } from 'react';
import { Responsive } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';

const GRID_MARGIN = 16;

// Target width for a standard widget (w:3 in original 12-col grid)
// Fixed pixel width that never changes regardless of viewport
const DEFAULT_TARGET_WIDGET_WIDTH = 350;
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
  rowHeight = 120,
  targetWidgetWidth = DEFAULT_TARGET_WIDGET_WIDTH,
  baseWidgetUnits = 3,
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

  // Calculate how many "standard widgets" (w:3) can fit side by side
  // Each widget needs targetWidgetWidth + margin
  const widgetsPerRow = Math.max(1, Math.floor(
    (containerWidth + GRID_MARGIN) / (targetWidgetWidth + GRID_MARGIN)
  ));

  // Convert to column units (each standard widget = baseWidgetUnits columns)
  const visibleCols = widgetsPerRow * baseWidgetUnits;

  // Calculate exact grid width so each w:3 widget = targetWidgetWidth exactly
  // react-grid-layout formula: colWidth = (width - margin*(cols-1)) / cols
  // We want: colWidth * baseWidgetUnits = targetWidgetWidth → colWidth = targetWidgetWidth / baseWidgetUnits
  const colWidth = targetWidgetWidth / baseWidgetUnits;
  const exactGridWidth = (colWidth * visibleCols) + (GRID_MARGIN * (visibleCols - 1));

  // Adjust layout for current column count
  const adjustedLayout = layout.map(item => ({
    ...item,
    w: Math.min(item.w, visibleCols),
    x: item.x >= visibleCols ? 0 : Math.min(item.x, visibleCols - Math.min(item.w, visibleCols)),
  }));

  const layouts = { lg: adjustedLayout };

  return (
    <div ref={containerRef} className="w-full flex justify-start">
      <Responsive
        key={visibleCols}
        className="layout"
        layouts={layouts}
        breakpoints={{ lg: 0 }}
        cols={{ lg: visibleCols }}
        width={exactGridWidth}
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
