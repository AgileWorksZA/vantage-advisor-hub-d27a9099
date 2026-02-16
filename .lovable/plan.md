

## Add Tooltip on Hover to SLA Adherence Chart

### Change

**File: `src/components/tasks/TaskDashboard.tsx`**

Enable the tooltip on the SLA semi-circle pie chart so hovering over a segment shows the name and value, matching the formatting used by the other pie/bar charts.

- Change `tooltip: { show: false }` to `tooltip: { trigger: "item" }` -- this is the same configuration used by the Status and Priority pie charts.
- This will show the default ECharts tooltip with the segment name, value, and percentage on hover, consistent with the other charts in the dashboard.

Single-line change, no other files affected.

