import { ReactNode } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';

const Responsive = (GridLayout as any).Responsive;
const WidthProvider = (GridLayout as any).WidthProvider;
const ResponsiveGridLayout = WidthProvider(Responsive);

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
  // Define responsive breakpoints and column counts
  const breakpoints = { lg: 1200, md: 992, sm: 768, xs: 480 };
  const cols = { lg: 12, md: 9, sm: 6, xs: 3 };

  // Generate layouts for all breakpoints based on current layout
  const generateResponsiveLayouts = () => {
    const layouts: { [key: string]: WidgetLayout[] } = {
      lg: layout,
      md: layout.map(item => ({
        ...item,
        // For medium screens, adjust x position to fit 9 columns
        x: item.x >= 9 ? 0 : item.x >= 6 ? Math.max(0, item.x - 3) : item.x,
        w: Math.min(item.w, 9),
      })),
      sm: layout.map(item => ({
        ...item,
        // For small screens, 6 columns max
        x: item.x >= 6 ? 0 : item.x >= 3 ? Math.max(0, item.x - 3) : item.x,
        w: Math.min(item.w, 6),
      })),
      xs: layout.map(item => ({
        ...item,
        // For extra small screens, 3 columns, stack vertically
        x: 0,
        w: 3,
      })),
    };
    return layouts;
  };

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={generateResponsiveLayouts()}
      breakpoints={breakpoints}
      cols={cols}
      rowHeight={rowHeight}
      onLayoutChange={(currentLayout: WidgetLayout[]) => onLayoutChange(currentLayout)}
      draggableHandle=".widget-drag-handle"
      margin={[16, 16]}
      containerPadding={[0, 0]}
      isResizable={false}
      compactType="vertical"
      preventCollision={false}
      useCSSTransforms={true}
    >
      {children}
    </ResponsiveGridLayout>
  );
};
