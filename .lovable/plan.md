
## Fix SLA Gauge: Date Filtering + 3-Color Segments

### Issue 1: SLA Not Responding to Date Range
The `slaData` calculation on line 111 filters from `tasks` (the full unfiltered list) instead of `periodTasks` (the date-filtered list). Changing this dependency makes the SLA widget react to the date selector.

### Issue 2: Show 3 Colors (Met / Breached / At Risk)
The current gauge uses a single `progress` arc with one color based on the overall percentage. To show all three categories visually, we replace the single-value gauge with a **pie chart** styled as a half-donut (semi-circle) that displays three colored segments:
- Green for % Met
- Red for % Breached  
- Orange for % At Risk

The percentage label in the center will still show "SLA Met" percentage.

### Technical Changes

**File: `src/components/tasks/TaskDashboard.tsx`**

1. **Fix date filtering** -- Change `slaData` to use `periodTasks` instead of `tasks`:
   ```typescript
   const withSla = periodTasks.filter(t => t.sla_deadline);
   ```
   Update the `useMemo` dependency from `[tasks]` to `[periodTasks]`.

2. **Replace gauge with semi-circle pie** -- Replace `slaGaugeOption` with a pie chart configuration:
   - `startAngle: 180`, `endAngle: 0` to create a half-circle
   - Three data items with fixed colors: green (adherent), red (breached), orange (atRisk)
   - A "phantom" transparent segment to fill the bottom half
   - Center label showing the SLA Met percentage using `graphic` elements
   - If all counts are zero, show a single grey placeholder segment

3. **Update the legend beneath the chart** -- The existing HTML legend below the chart already shows Met/Breached/At Risk counts with colored dots, so no changes needed there.

### Summary
- Only one file changes: `src/components/tasks/TaskDashboard.tsx`
- Two edits: swap `tasks` to `periodTasks` in the SLA calculation, and replace the gauge series config with a 3-segment semi-circle pie
