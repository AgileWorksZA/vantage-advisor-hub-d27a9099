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
        >
          {children}
        </Responsive>
      )}
    </div>
  );
};
