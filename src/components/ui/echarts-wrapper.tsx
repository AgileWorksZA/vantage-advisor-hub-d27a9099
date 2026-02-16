import React, { useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts/core';
import { BarChart, PieChart, LineChart, GaugeChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import { cn } from '@/lib/utils';
import { lightTheme, darkTheme } from '@/lib/echarts-themes';

// Register ECharts components for tree-shaking
echarts.use([
  BarChart,
  PieChart,
  LineChart,
  GaugeChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer,
]);

// Register custom themes
echarts.registerTheme('vantage-light', lightTheme);
echarts.registerTheme('vantage-dark', darkTheme);

export interface EChartsWrapperProps {
  option: EChartsOption;
  height?: string | number;
  className?: string;
  transparent?: boolean;
  loading?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChartReady?: (instance: any) => void;
  onEvents?: Record<string, (params: unknown) => void>;
}

export function EChartsWrapper({
  option,
  height = 200,
  className,
  transparent = true,
  loading = false,
  onChartReady,
  onEvents,
}: EChartsWrapperProps) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === 'dark' ? 'vantage-dark' : 'vantage-light';

  // Merge transparent background into options
  const mergedOption = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      ...option,
      grid: {
        containLabel: true,
        left: 0,
        right: 0,
        top: 8,
        bottom: 8,
        ...option.grid,
      },
    };
  }, [option]);

  return (
    <div
      className={cn(
        transparent && 'echarts-glass-container',
        className
      )}
    >
      <ReactECharts
        echarts={echarts}
        option={mergedOption}
        theme={theme}
        style={{ height, width: '100%' }}
        notMerge={true}
        lazyUpdate={true}
        showLoading={loading}
        onChartReady={onChartReady}
        onEvents={onEvents}
      />
    </div>
  );
}

// Helper to create gradient colors
export function createGradient(
  startColor: string,
  endColor: string,
  direction: 'vertical' | 'horizontal' = 'vertical'
) {
  return new echarts.graphic.LinearGradient(
    0,
    0,
    direction === 'horizontal' ? 1 : 0,
    direction === 'vertical' ? 1 : 0,
    [
      { offset: 0, color: startColor },
      { offset: 1, color: endColor },
    ]
  );
}

// Export echarts for advanced usage
export { echarts };
