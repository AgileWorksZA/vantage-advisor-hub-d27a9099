

## Add Period Selector and Sparklines to Change in Valuation Widget

### What changes

The Change in Valuation widget currently shows static values (Starting Value, Deposits/Withdrawals, Investment Returns, Ending Value). Two enhancements will be made:

1. **Period selector buttons (6M, 1Y, 3Y, 5Y)** in the widget header -- same style as the Portfolio Overview widget's period buttons
2. **Mini sparkline with percentage change** next to each row value -- a tiny inline line chart showing the trend, plus a green/red percentage badge

### How it will look

- Header row: "Change in Valuation" title on left, `6M 1Y 3Y 5Y` pill buttons on right (matching Portfolio Overview style)
- Each row (Starting Value, Deposits/Withdrawals, Investment Returns) gets a small sparkline (approx 48px wide, 16px tall) and a percentage change badge (e.g., "+3.2%") next to the value
- The Ending Value row gets a sparkline and percentage too
- Selecting a different period recalculates all values and sparkline data

### Technical details

**File: `src/components/client-detail/ClientDashboardTab.tsx`**

1. Add a `useState` for `valuationPeriod` (`'6m' | '1y' | '3y' | '5y'`, default `'1y'`)

2. Expand the `valuationData` useMemo to generate period-specific data:
   - For each period, generate different multipliers using the seeded random function
   - Shorter periods = smaller changes, longer periods = larger changes
   - Each line item gets a `sparkData: number[]` array (6 points) and a `changePct: number`

3. Add period selector buttons to the CardHeader (right side, before the X button), styled identically to the Portfolio Overview widget's buttons:
   ```
   px-2 py-0.5 rounded text-[9px] transition-all duration-200
   ```

4. For each row, render an inline SVG sparkline (48x16px) using a simple polyline, plus a percentage badge:
   - Green sparkline + green % for positive values
   - Red sparkline + red % for negative values
   - Sparkline uses 6 data points with smooth rendering

5. Layout adjustment: each row becomes a flex container with label on left, then sparkline + percentage + value on right

No new files needed. No new dependencies. Uses the same seeded random approach already in the component for deterministic data.

