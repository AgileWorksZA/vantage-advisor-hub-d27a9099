

## Fix: SLA Gauge Not Showing Percentage Value

### Root Cause
The ECharts wrapper (`src/components/ui/echarts-wrapper.tsx`) uses tree-shaking and only registers `BarChart`, `PieChart`, and `LineChart`. The `GaugeChart` component is **not registered**, so ECharts silently fails to render the gauge data/detail -- it only shows the title label because that's a generic series property.

### Fix

**File: `src/components/ui/echarts-wrapper.tsx`**

1. Import `GaugeChart` from `echarts/charts`
2. Add it to the `echarts.use([...])` registration array

```typescript
import { BarChart, PieChart, LineChart, GaugeChart } from 'echarts/charts';

echarts.use([
  BarChart,
  PieChart,
  LineChart,
  GaugeChart,   // <-- add this
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  CanvasRenderer,
]);
```

This single change will make the gauge render correctly, showing the percentage value, the progress arc, and the "SLA Met" label as intended. No other files need changes -- the `TaskDashboard.tsx` configuration is already correct.

