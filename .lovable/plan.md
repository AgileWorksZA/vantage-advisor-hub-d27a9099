

# Dynamic Time Period Dropdowns for Insights Charts

## Overview
Replace the static "3 Months" and "1 Year" buttons with interactive dropdown selects that allow users to choose different time periods. When a new period is selected, the charts will dynamically update to show the appropriate date range on the x-axis with corresponding data values.

---

## Current State

The Insights page has three charts with time period buttons that are currently static:

| Chart | Current Button | Location (Line) |
|-------|----------------|-----------------|
| Commission by Type | "3 Months" | Line 370-372 |
| Commission Earned | "3 Months" | Line 414-416 |
| Commission Summary | "1 Year" | Line 534-536 |

These are plain `<Button>` components with no dropdown or state management.

---

## Solution

### 1. Add State Variables for Each Period Selector

```typescript
// Time period states for each chart
const [commissionByTypePeriod, setCommissionByTypePeriod] = useState<string>("3m");
const [commissionEarnedPeriod, setCommissionEarnedPeriod] = useState<string>("3m");
const [commissionSummaryPeriod, setCommissionSummaryPeriod] = useState<string>("1y");
```

### 2. Define Period Options

**For "3 Months" dropdowns (Commission by Type & Commission Earned):**
- 3 Months
- 6 Months
- 1 Year
- 5 Years
- Year to Date

**For "1 Year" dropdown (Commission Summary):**
- 3 Months
- 6 Months
- 1 Year (existing)
- 5 Years
- Year to Date

### 3. Create Extended Data Sets

Each chart needs data for all time periods. The implementation will generate data dynamically based on the selected period:

```text
Period       | Months Shown    | X-Axis Format
-------------|-----------------|----------------
3 Months     | 3 data points   | "Oct 2025", "Nov 2025", "Dec 2025"
6 Months     | 6 data points   | "Jul 2025" - "Dec 2025"
1 Year       | 12 data points  | "Jan 2025" - "Dec 2025"
5 Years      | 60 data points  | "Jan 2021" - "Dec 2025"
Year to Date | Varies          | "Jan 2025" - "Dec 2025" (current month)
```

---

## Files to Modify

### `src/pages/Insights.tsx`

**Changes:**

1. **Add Import for Select component**
   ```typescript
   import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
   ```

2. **Add State Variables**
   Three new useState hooks for tracking selected periods

3. **Create Data Generation Functions**
   Helper functions to generate chart data based on selected period:
   ```typescript
   const getFilteredCommissionByTypeData = (period: string) => { ... }
   const getFilteredCommissionEarnedData = (period: string) => { ... }
   const getFilteredCommissionSummaryData = (period: string) => { ... }
   ```

4. **Expand Base Data**
   Extend the existing static data arrays to include 5 years of data:
   - `commissionByTypeData`: 60 months (Jan 2021 - Dec 2025)
   - `commissionEarnedData`: 60 months
   - `commissionSummaryData`: 60 months

5. **Replace Buttons with Select Components**

   **Commission by Type (Line 370-372):**
   ```tsx
   <Select value={commissionByTypePeriod} onValueChange={setCommissionByTypePeriod}>
     <SelectTrigger className="w-[120px] h-8 bg-[hsl(180,25%,25%)] text-white border-0">
       <SelectValue />
     </SelectTrigger>
     <SelectContent>
       <SelectItem value="3m">3 Months</SelectItem>
       <SelectItem value="6m">6 Months</SelectItem>
       <SelectItem value="1y">1 Year</SelectItem>
       <SelectItem value="5y">5 Years</SelectItem>
       <SelectItem value="ytd">Year to Date</SelectItem>
     </SelectContent>
   </Select>
   ```

   **Commission Earned (Line 414-416):**
   Same dropdown structure with `commissionEarnedPeriod` state

   **Commission Summary (Line 534-536):**
   Same dropdown structure with `commissionSummaryPeriod` state

6. **Update Chart Options to Use Filtered Data**
   The chart option objects will use the filtered data functions:
   ```typescript
   const commissionByTypeOption = {
     xAxis: {
       data: getFilteredCommissionByTypeData(commissionByTypePeriod).map(d => d.month),
     },
     series: [
       { data: getFilteredCommissionByTypeData(commissionByTypePeriod).map(d => d.PUFs) },
       // ... other series
     ],
   };
   ```

---

## Data Structure Details

### Extended Commission Data (5 Years)

Generate 60 months of realistic data with:
- Seasonal variations (Q4 typically higher)
- Year-over-year growth trend
- Randomized but consistent values

Example data generation logic:
```typescript
const generateMonthlyData = (baseValue: number, months: number, growthRate: number) => {
  return Array.from({ length: months }, (_, i) => {
    const date = subMonths(new Date(2025, 11, 1), months - 1 - i);
    const seasonalFactor = 1 + (Math.sin(i * Math.PI / 6) * 0.1);
    const growthFactor = Math.pow(1 + growthRate, i / 12);
    return {
      month: format(date, 'MMM yyyy'),
      value: Math.round(baseValue * seasonalFactor * growthFactor),
    };
  });
};
```

### Period Filtering Logic

```typescript
const filterDataByPeriod = (data: any[], period: string) => {
  const now = new Date(2025, 11, 1); // December 2025
  let monthsToShow: number;
  
  switch (period) {
    case "3m": monthsToShow = 3; break;
    case "6m": monthsToShow = 6; break;
    case "1y": monthsToShow = 12; break;
    case "5y": monthsToShow = 60; break;
    case "ytd": monthsToShow = 12; break; // January to current month
    default: monthsToShow = 3;
  }
  
  return data.slice(-monthsToShow);
};
```

---

## Visual Behavior

When user selects a different time period:

1. Dropdown shows checkmark next to current selection
2. Chart smoothly animates to new data (ECharts handles this automatically)
3. X-axis labels update to show appropriate date range
4. Y-axis auto-scales to fit new data range
5. DataZoom slider (on Commission Summary) resets to show full range

---

## Technical Considerations

- **Performance**: Data filtering uses `useMemo` to prevent recalculation on every render
- **Animations**: ECharts' built-in animation will smoothly transition between data states
- **Styling**: Select trigger styled to match existing teal button design
- **Accessibility**: Select component provides keyboard navigation and screen reader support

---

## Summary of Changes

| Location | Change |
|----------|--------|
| Line 1-31 | Add Select import |
| Line 85-89 | Add 3 new state variables |
| Line 33-65 | Expand data arrays to 5 years |
| After line 65 | Add data filtering helper functions |
| Lines 127-160 | Update commissionByTypeOption to use filtered data |
| Lines 163-193 | Update commissionEarnedOption to use filtered data |
| Lines 225-300 | Update commissionSummaryOption to use filtered data |
| Lines 370-372 | Replace Button with Select for Commission by Type |
| Lines 414-416 | Replace Button with Select for Commission Earned |
| Lines 534-536 | Replace Button with Select for Commission Summary |

