

# Time Period Selector for TLH Dashboard

## Overview

Replace the static "YTD" button with a functional dropdown that lets users view tax-loss harvesting data across multiple time periods: 3 Months, 6 Months, 1 Year, 3 Years, and 5 Years. The "Data from" label, chart x-axis, and displayed data will all dynamically update to reflect the selected period.

## Changes Required

### 1. Add Time Period State and Dropdown (`TLHDashboard.tsx`)

**Replace the static YTD button** (lines 222-227) with a Radix Select component offering these options:

| Option | Label | "Data from" Start Date |
|--------|-------|----------------------|
| 3M | 3 Months | 3 months before today |
| 6M | 6 Months | 6 months before today |
| 1Y | 1 Year | 1 year before today |
| 3Y | 3 Years | 3 years before today |
| 5Y | 5 Years | 5 years before today |
| YTD | YTD | Jan 1 of the current year |

Default selection: **YTD** (preserves current behavior).

The "Data from" text will dynamically compute the start date using `date-fns` (e.g., `subMonths(new Date(), 3)` for 3M) and format it as "MMM d, yyyy".

### 2. Extend Monthly Harvested Data (`tlhDemoData.ts`)

Currently each record has 12 data points (Jan-Dec of the current year). To support 3Y and 5Y views, we need to extend the data to **60 months** (5 years of history).

**New approach:**
- Rename `monthlyHarvested` to keep it, but add a new `monthlyHarvestedHistory` array with 60 data points on each metrics record
- Each entry will use format `{ month: "MMM YYYY", value: number }` (e.g., "Feb 2021", "Mar 2023")
- The existing 12-month YTD data becomes the final 12 entries of the history
- Historical data (months 1-48) will show prior-year harvesting activity with realistic cumulative patterns that reset at the start of each calendar year (since TLH is annual)
- Each client/jurisdiction gets unique historical patterns scaled to their portfolio size

**Data pattern per year:**
- Each calendar year starts at 0 and accumulates to a year-end total
- Year-end totals vary across years to show portfolio growth (earlier years have smaller totals)
- The current year's data matches the existing `monthlyHarvested` values exactly

### 3. Dynamic Chart X-Axis and Data Filtering (`TLHDashboard.tsx`)

Based on the selected time period, the chart will:

**Filter data points:**
- **3M**: Last 3 months of current data
- **6M**: Last 6 months of current data
- **1Y / YTD**: Full 12 months of current year (current behavior)
- **3Y**: 36 months of history
- **5Y**: 60 months of history

**X-axis label intervals:**
- **3M / 6M**: Show every month label (e.g., "Nov", "Dec", "Jan")
- **1Y / YTD**: Show every month (current behavior)
- **3Y**: Show every 3rd month or quarterly labels (e.g., "Q1 '23", "Q2 '23")
- **5Y**: Show every 6th month or yearly labels (e.g., "2021", "2022", "2023")

The `axisLabel.interval` will be dynamically set to avoid overcrowding.

### 4. Add Required Import

Import the `Select` components from `@/components/ui/select` and `subMonths`, `subYears`, `format` from `date-fns`.

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/tax-loss-harvesting/TLHDashboard.tsx` | Modify | Add time period state, replace static button with Select dropdown, update date range text dynamically, filter chart data and adjust x-axis intervals based on selection |
| `src/data/tlhDemoData.ts` | Modify | Add `monthlyHarvestedHistory` (60-month arrays) to all 17 metrics records (12 clients + 5 jurisdictions) with realistic multi-year harvesting patterns |

## Technical Details

**Select component usage:**
```tsx
<Select value={timePeriod} onValueChange={setTimePeriod}>
  <SelectTrigger className="h-7 w-[90px] text-xs">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="3M">3 Months</SelectItem>
    <SelectItem value="6M">6 Months</SelectItem>
    <SelectItem value="1Y">1 Year</SelectItem>
    <SelectItem value="3Y">3 Years</SelectItem>
    <SelectItem value="5Y">5 Years</SelectItem>
    <SelectItem value="YTD">YTD</SelectItem>
  </SelectContent>
</Select>
```

**Date calculation logic:**
```tsx
const getStartDate = (period: string) => {
  const now = new Date();
  switch (period) {
    case "3M": return subMonths(now, 3);
    case "6M": return subMonths(now, 6);
    case "1Y": return subYears(now, 1);
    case "3Y": return subYears(now, 3);
    case "5Y": return subYears(now, 5);
    case "YTD": return new Date(now.getFullYear(), 0, 1);
  }
};
```

**Chart data slicing:**
- For 3M/6M: slice the last N entries from the 12-month YTD array
- For 1Y/YTD: use the full 12-month array (existing behavior)
- For 3Y/5Y: use the `monthlyHarvestedHistory` array, taking the last 36 or 60 entries

**X-axis interval config:**
```tsx
axisLabel: {
  interval: period === "5Y" ? 11 : period === "3Y" ? 5 : 0,
  rotate: period === "3Y" || period === "5Y" ? 30 : 0,
}
```

This ensures labels remain readable at all zoom levels while accurately reflecting the timeline.

