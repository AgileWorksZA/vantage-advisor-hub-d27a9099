

## Align Analytics Tab Charts with Dashboard/Insights Visual Style

### Overview

Add summary charts to the Analytics tab that match the visual patterns used on the Dashboard and Insights pages. All charts will use the `EChartsWrapper` component (which handles theme synchronization, glassmorphism, and HSL color variables). Fix sizing and label positioning to prevent overlaps.

### Changes

**File: `src/components/tasks/TaskAnalyticsTab.tsx`**

#### 1. Add Summary Charts Row

Insert a 4-column grid of chart cards (matching the Dashboard's `lg:grid-cols-4` layout) between the filter tags row and the data table. Each card uses `EChartsWrapper` with `height={200}`.

**Charts to add:**

| Chart | Type | Description |
|-------|------|-------------|
| Tasks by Status | Donut pie (`radius: ['40%', '70%']`) | Matches Dashboard's `statusChartOption` pattern -- no labels, emphasis on hover, legend at bottom |
| Tasks by Priority | Donut pie (`radius: ['40%', '70%']`) | Same donut style with `selectedOffset: 12` explode effect (matching Insights' monthly commission pie) |
| Utilisation Gauge | Gauge (`startAngle: 180, endAngle: 0`) | Reuses Dashboard's `slaGaugeOption` pattern with progress bar, color-coded by threshold |
| SLA Adherence Gauge | Gauge (same pattern) | Second gauge showing aggregate SLA % across filtered rows |

#### 2. Chart Configuration Details

All charts follow these Dashboard/Insights conventions:
- **Grid padding**: `{ left: 8, right: 8, top: 8, bottom: 24, containLabel: true }` (Insights pattern)
- **Pie charts**: `label: { show: false }`, legend at `{ bottom: 0, left: 'center' }`, `borderRadius: 10` on items
- **Gauge charts**: No pointer (`pointer: { show: false }`), progress bar width 18, no axis labels/ticks/splitLines, centered `detail` with `fontSize: 24`
- **Colors**: Use HSL theme palette from `echarts-themes.ts` (teal, gold, blue, green, purple, red)
- **Tooltips**: Inherit from theme (glassmorphism blur, rounded corners)

#### 3. Compute Chart Data from Filtered Tasks

Derive chart data from the already-filtered `filteredTasks` array (respects date range and team filters):
- **By Status**: Count tasks grouped by `status` field
- **By Priority**: Count tasks grouped by `priority` field
- **Utilisation**: Aggregate `utilisationPct` from computed rows (weighted average)
- **SLA**: Aggregate `slaPct` from computed rows (weighted average)

#### 4. Label/Sizing Fixes

- Pie charts use `avoidLabelOverlap: true` with labels hidden (legend only) to prevent text overlap
- Gauge charts use `offsetCenter: [0, '0%']` positioning for the percentage text
- Chart height set to 200px (matching Dashboard card heights within a 350px widget)
- Card uses `CardHeader` with `pb-2` and `CardTitle` with `text-sm font-medium` (Dashboard pattern)

### Technical Summary

| Item | Detail |
|------|--------|
| Modified file | `src/components/tasks/TaskAnalyticsTab.tsx` |
| New imports | `EChartsWrapper` from `@/components/ui/echarts-wrapper` |
| Chart library | ECharts via existing `EChartsWrapper` (themed, glassmorphism) |
| No new files | All changes within existing component |
| No DB changes | Charts derive from existing task data |

