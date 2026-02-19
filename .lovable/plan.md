

## Remove Sparkline and Percentage from "Starting Value" Row

### Problem
The "Starting Value" row in the Change in Valuation widget shows a sparkline and a percentage change, which is misleading -- starting value is a static reference point, not a trend.

### Changes

**File: `src/components/client-detail/ClientDashboardTab.tsx`**

1. **Skip sparkline and % for non-highlight, non-ending rows** (lines 654-678):
   - In the `valuationData.items.map` loop, conditionally render the sparkline SVG and the percentage badge only when `item.highlight` is true.
   - The "Starting Value" row (which has no `highlight` flag) will show just the label and the currency value, no sparkline or percentage.

This is a small, targeted change -- wrap the sparkline `<svg>` and the `changePct` `<span>` inside the map callback with `{item.highlight && (...)}` guards.

### Files to Edit
- `src/components/client-detail/ClientDashboardTab.tsx` (lines ~666-671)

