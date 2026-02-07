

# Gradual Tax Loss Harvesting Curves

## Overview

Replace the instant step-change jumps in the "Tax Losses Harvested" chart with gradual ramps that show losses being harvested over realistic multi-month periods. Instead of a value jumping from 0 to 15,200 in a single month, the value will ramp up incrementally over 2-4 months per harvesting period. This creates a more realistic visualization of how tax-loss harvesting activity actually unfolds -- positions are sold across multiple trading sessions over weeks or months, not all at once.

## Changes Required

### 1. Chart Configuration (`src/components/tax-loss-harvesting/TLHDashboard.tsx`)

- Remove `step: 'end'` from the ECharts series configuration (line 147) to allow a regular connected line chart
- Add `smooth: 0.3` for a slight smoothing effect (not fully smooth, just enough to avoid harsh angles)
- This creates visible ramps/slopes on the chart where harvesting activity occurs, with flat plateaus in between

### 2. Monthly Harvested Data (`src/data/tlhDemoData.ts`)

Replace all 17 `monthlyHarvested` arrays (12 clients + 5 jurisdictions) with gradual ramp patterns. Each harvesting event now spans 2-4 months of incremental increases before leveling off.

**Pattern examples:**

Instead of:
```
Jan: 0, Feb: 0, Mar: 15200, Apr: 15200, May: 15200 ...
```

Now:
```
Jan: 0, Feb: 0, Mar: 4000, Apr: 9500, May: 15200, Jun: 15200 ...
```

The ramp-up speed varies by client profile:
- **Large portfolios** (David Miller, Peter Williams): More gradual ramps over 3-4 months per event (larger positions take longer to unwind)
- **Medium portfolios** (John Smith, Michael Wilson, James Taylor): 2-3 month ramps
- **Small portfolios** (Amanda White, Robert Jackson): Shorter 1-2 month ramps (smaller positions harvest faster)

**Per-client ramp designs:**

| Client | Total Harvested | Ramp Pattern |
|--------|----------------|--------------|
| John Smith | 51,040 | 3 harvesting periods: ramp Mar-Apr, ramp Jul-Aug, ramp Oct-Nov |
| Mary Jones | 38,200 | 2 harvesting periods: ramp Feb-Apr, ramp Sep-Nov |
| Peter Williams | 62,800 | 4 harvesting periods: ramp Jan-Feb, Apr-May, Jul-Aug, Oct-Nov |
| Sarah Brown | 24,100 | 2 harvesting periods: ramp May-Jul, ramp Nov-Dec |
| David Miller | 78,500 | 5 gradual ramps spread across the year |
| Emma Davis | 19,800 | 2 harvesting periods: ramp Apr-May, ramp Aug-Sep |
| Michael Wilson | 55,200 | 3 harvesting periods clustered Q2-Q3 with gradual ramps |
| Lisa Anderson | 31,600 | 2 harvesting periods: ramp Jan-Mar, ramp Aug-Sep |
| James Taylor | 42,900 | 3 evenly-spaced ramps: Feb-Mar, Jun-Jul, Oct-Nov |
| Jennifer Thomas | 21,400 | 2 harvesting periods: ramp Mar-May, ramp Nov-Dec |
| Robert Jackson | 12,800 | 2 short ramps: Apr, Aug-Sep |
| Amanda White | 9,600 | 1 ramp: Jun-Jul |

The 5 jurisdiction records (ZA, AU, GB, US, CA) will also get gradual ramp patterns matching aggregate activity.

All final values continue to match each client's `totalHarvested` for data consistency.

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/tax-loss-harvesting/TLHDashboard.tsx` | Modify | Remove `step: 'end'`, add slight `smooth: 0.3` to series config |
| `src/data/tlhDemoData.ts` | Modify | Replace all 17 `monthlyHarvested` arrays with gradual ramp patterns |

## Technical Notes

- Removing `step: 'end'` reverts to a standard line chart where the line connects data points directly, creating visible slopes during ramp periods
- Using `smooth: 0.3` (partial smoothing) gives the ramps a slight curve without making the chart look fully smoothed -- the plateaus remain clearly flat
- The `symbol: 'none'` setting is kept to maintain a clean line without dot markers
- No changes to tooltips, axis formatting, or grid layout
