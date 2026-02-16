

## Fix "Tasks by Status" Donut Chart Layout

### Changes

**File: `src/components/tasks/TaskDashboard.tsx`**

1. **Remove rounded edges** on donut segments by changing `borderRadius: 10` to `borderRadius: 0` in the pie series `itemStyle` (line 27).

2. **Tighten chart layout** to fit the widget card:
   - Reduce the donut radius from `["40%", "70%"]` to `["35%", "60%"]` so the chart does not overflow.
   - Move the legend closer by adjusting `bottom: 0` to `bottom: "0%"` and adding `itemGap: 8` and smaller font.
   - Add a `grid` with zero padding to maximize space usage.

### Technical Detail

Only one file changes -- the `statusChartOption` useMemo block in `TaskDashboard.tsx`:

```typescript
// Before
radius: ["40%", "70%"],
itemStyle: { borderRadius: 10, borderColor: "transparent", borderWidth: 2 },

// After
radius: ["35%", "60%"],
itemStyle: { borderRadius: 0, borderColor: "transparent", borderWidth: 2 },
```

Also add `center: ["50%", "45%"]` to shift the donut up slightly to make room for the legend below.

