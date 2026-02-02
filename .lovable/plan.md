

# Widget Size Alignment: Insights to Match Dashboard

## Overview
Standardize the widget heights on the Insights page to match the Dashboard page, while keeping the Commission Summary widget spanning two columns.

---

## Current State Analysis

### Dashboard Widgets
- Grid: `grid-cols-12 gap-4`
- All cards: `col-span-3` (4 cards per row)
- Chart heights: `h-48` (192px) with `EChartsWrapper height={192}`

### Insights Widgets (Current Issues)
| Widget | Current Size | Issue |
|--------|--------------|-------|
| Commission by Type | `col-span-3`, `h-48` (192px) | ✓ Correct |
| Commission Earned | `col-span-3`, `h-48` (192px) | ✓ Correct |
| Monthly Commission | `col-span-3`, `h-[400px]` (400px) | ✗ Too tall - needs to be 192px |
| Commission Snapshot | `col-span-3` | ✓ Correct |
| Commission Summary | `col-span-6`, `h-56` (224px) | ✓ Correct (wider, slightly taller is OK) |
| Leaderboard Snapshot | `col-span-3` | ✓ Correct |

---

## Changes Required

### 1. Reduce Monthly Commission Pie Chart Height

**File:** `src/pages/Insights.tsx`

**Line 574:** Change container height
```diff
- <div className="h-[400px] flex items-center justify-center">
+ <div className="h-48 flex items-center justify-center">
```

**Line 575-576:** Change EChartsWrapper height
```diff
  <EChartsWrapper
-   height={400}
+   height={192}
    option={monthlyCommissionOption}
  />
```

### 2. Adjust Pie Chart Radius for Smaller Size

Since the chart will be smaller, the radius should be adjusted to maintain good proportions within the 192px container.

**In the `monthlyCommissionOption` configuration (around line 307-310):**
```diff
  series: [{
    type: 'pie',
-   radius: ['45%', '85%'],
+   radius: ['40%', '75%'],
    center: ['50%', '50%'],
```

This matches the Dashboard's pie chart proportions.

---

## Summary of Changes

| Line | Current | New |
|------|---------|-----|
| 309 | `radius: ['45%', '85%']` | `radius: ['40%', '75%']` |
| 574 | `h-[400px]` | `h-48` |
| 576 | `height={400}` | `height={192}` |

---

## Visual Result

After changes:
- All standard widgets will have consistent heights matching Dashboard
- Commission Summary remains `col-span-6` (spanning 2 columns as requested)
- Monthly Commission pie chart will be proportional to the card size
- Grid layout will align properly across both pages

