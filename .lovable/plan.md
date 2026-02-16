

## Add Data to SLA Adherence Widget

### Current State
The SLA Adherence widget currently only shows a half-gauge with a percentage. The underlying data (adherent/breached counts) is already computed but not displayed. The widget lacks context -- users see a number but no breakdown.

### Changes

**File: `src/pages/Tasks.tsx` -- no changes needed**

**File: `src/components/tasks/TaskDashboard.tsx`**

1. **Expand `slaData` to include additional metrics** -- add counts for "at risk" (open tasks with SLA deadline within 3 days) and total tasks with SLA:
   - `atRisk`: open tasks where deadline is within the next 3 days
   - `total`: total tasks that have an SLA deadline
   - Keep existing `adherent`, `breached`, `pct`

2. **Add summary stats below the gauge** -- render a compact row of labeled counts beneath the ECharts gauge:
   - Adherent (green) | Breached (red) | At Risk (amber)
   - Use small text with colored dots, matching the style of the SLA indicator component already in the project

3. **Reduce gauge height to make room** -- change gauge `height` from `220` to `160` to leave space for the summary row below it without increasing the card size

### Result
The SLA Adherence card will show:
- The gauge percentage (existing)
- A row with "X Met | Y Breached | Z At Risk" with color-coded indicators
- All within the same card size as other chart widgets

### Technical Detail

```typescript
// Updated slaData computation (adds atRisk, total)
const slaData = useMemo(() => {
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const withSla = tasks.filter(t => t.sla_deadline);
  let adherent = 0, breached = 0, atRisk = 0;
  withSla.forEach(t => {
    const deadline = new Date(t.sla_deadline!);
    if (t.status === "Completed" && t.completed_at) {
      if (new Date(t.completed_at) <= deadline) adherent++;
      else breached++;
    } else if (!["Completed", "Cancelled"].includes(t.status) && isBefore(deadline, now)) {
      breached++;
    } else if (!["Completed", "Cancelled"].includes(t.status) && isBefore(deadline, threeDaysFromNow)) {
      atRisk++;
    } else if (t.status === "Completed") {
      adherent++;
    }
  });
  const pct = (adherent + breached) > 0 ? Math.round((adherent / (adherent + breached)) * 100) : 100;
  return { adherent, breached, atRisk, pct, total: withSla.length };
}, [tasks]);

// Updated JSX for SLA card
<Card>
  <CardHeader><CardTitle>SLA Adherence</CardTitle></CardHeader>
  <CardContent>
    <EChartsWrapper option={slaGaugeOption} height={160} />
    <div className="flex justify-center gap-4 mt-1 text-xs">
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        {slaData.adherent} Met
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-rose-500" />
        {slaData.breached} Breached
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        {slaData.atRisk} At Risk
      </span>
    </div>
  </CardContent>
</Card>
```

**Files to edit:** `src/components/tasks/TaskDashboard.tsx` only

