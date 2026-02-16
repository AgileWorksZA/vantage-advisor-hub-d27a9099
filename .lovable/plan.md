

## Add "% SLA Met" Label to SLA Gauge

### Problem
The SLA Adherence gauge displays a percentage number but does not indicate what the percentage represents. Users cannot tell at a glance that it shows the percentage of SLA targets met.

### Change

**File: `src/components/tasks/TaskDashboard.tsx`**

Update the `slaGaugeOption` to add a title element inside the gauge that reads "SLA Met" beneath the percentage value. This uses ECharts' built-in gauge `title` property:

```typescript
// In slaGaugeOption, update the series data to include a name
data: [{ value: slaData.pct, name: "SLA Met" }],

// And enable the title display
title: {
  show: true,
  offsetCenter: [0, "25%"],
  fontSize: 12,
  color: "hsl(var(--muted-foreground))",
},
```

This places a "SLA Met" label directly below the percentage inside the gauge arc, making the metric self-explanatory. No other files need changes.

