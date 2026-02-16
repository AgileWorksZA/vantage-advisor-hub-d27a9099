

## Fix SLA Gauge Percentage Display and Bar Chart Hover

### Issue 1: SLA Gauge Not Showing Percentage Value
The gauge arc and "SLA Met" label render correctly, but the percentage number (e.g., "7%") is invisible. The cause is `color: "inherit"` in the `detail` configuration -- ECharts renders on canvas where CSS `inherit` has no meaning, so the text renders as invisible/black on a dark background.

### Issue 2: Bar Chart Hover Highlights Entire Row
The "Tasks by Type" bar chart uses `axisPointer: { type: "shadow" }` which draws a full-width shaded band across the entire row when hovering. Only the bar itself should highlight.

### Changes

**File: `src/components/tasks/TaskDashboard.tsx`**

1. **Fix gauge detail color** -- Replace `color: "inherit"` with `color: "auto"`. ECharts' `"auto"` inherits from the series itemStyle color, which matches the gauge progress arc color and is always visible.

2. **Fix bar chart hover** -- Change `axisPointer` type from `"shadow"` to `"none"` so hovering only triggers the tooltip without highlighting the full row. Keep the tooltip trigger as `"axis"` so it still activates when hovering near a bar.

### Technical Detail

```typescript
// Gauge detail fix (line ~211)
detail: {
  ...
  color: "auto",  // was "inherit" which doesn't work in canvas
},

// Bar chart tooltip fix (line ~152)
tooltip: { trigger: "axis", axisPointer: { type: "none" } },
```
