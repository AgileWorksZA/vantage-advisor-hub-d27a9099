

# Step-Change Chart for Tax Losses Harvested

## Overview

Replace the smooth area chart for "Tax Losses Harvested" with a step-change (staircase) line chart matching the reference image. The reference shows sharp horizontal plateaus with sudden vertical jumps -- representing discrete harvesting events rather than a smooth accumulation curve. Each client will have a unique step pattern aligned with their portfolio size and harvesting activity.

## Changes Required

### 1. Chart Configuration (`src/components/tax-loss-harvesting/TLHDashboard.tsx`)

Update the ECharts series configuration on lines 143-162:
- Remove `smooth: true`
- Add `step: 'end'` to create the staircase pattern (horizontal lines that jump vertically at data points)
- Remove the area fill gradient to match the reference image (which shows a plain green line with no fill)
- Keep tooltip, grid, axis styling unchanged

### 2. Monthly Harvested Data (`src/data/tlhDemoData.ts`)

Replace all `monthlyHarvested` arrays (for all 12 per-client records and 5 jurisdiction records) with step-change data patterns. Instead of smooth incremental growth, the data will show:
- Periods of flat values (same value repeated across multiple months -- no harvesting activity)
- Sudden jumps representing discrete TLH trade executions
- Each client gets a unique pattern based on their profile:

**Pattern design by client archetype:**

| Client | Balance | Pattern Description | Steps |
|--------|---------|-------------------|-------|
| John Smith | 1.25M | 3 medium harvests spread across year | Flat-jump-flat-jump-flat-jump |
| Mary Jones | 892K | 2 larger harvests, one early, one late | Jump-flat-jump-flat |
| Peter Williams | 1.52M | 4 smaller frequent harvests | Jump-flat-jump-flat-jump-flat-jump |
| Sarah Brown | 654K | 1 large harvest mid-year, 1 small late | Flat-flat-jump-flat-jump |
| David Miller | 2.1M | 5 harvests, largest portfolio = most active | Many small jumps throughout |
| Emma Davis | 446K | 2 small harvests | Flat-jump-flat-jump-flat |
| Michael Wilson | 1.89M | 3 harvests clustered in Q2-Q3 | Flat-flat-jump-jump-jump-flat |
| Lisa Anderson | 780K | 2 medium harvests | Jump-flat-flat-jump-flat |
| James Taylor | 1.34M | 3 evenly-spaced harvests | Jump-flat-jump-flat-jump |
| Jennifer Thomas | 560K | 1 large harvest plus 1 small | Flat-jump-flat-flat-jump |
| Robert Jackson | 320K | 2 small harvests | Flat-jump-flat-jump |
| Amanda White | 280K | 1 single harvest event | Flat-flat-jump-flat-flat |

Each array will have more data points (12 months, Jan-Dec) with repeated values creating visible plateaus between jumps. The final value in each array must match the client's `totalHarvested` value.

The 5 jurisdiction-level metric records (ZA, AU, GB, US, CA) will also get step-change patterns appropriate for aggregate portfolio activity.

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/tax-loss-harvesting/TLHDashboard.tsx` | Modify | Change chart from `smooth: true` to `step: 'end'`; remove area gradient fill |
| `src/data/tlhDemoData.ts` | Modify | Replace all 17 `monthlyHarvested` arrays with step-change data patterns unique to each client/jurisdiction |

## Technical Notes

- ECharts `step: 'end'` draws a horizontal line from each point, then jumps vertically to the next -- exactly matching the reference image's staircase pattern
- Removing `areaStyle` entirely gives the clean green line without fill, matching the reference
- All final values in `monthlyHarvested` arrays will continue to equal the respective `totalHarvested` to maintain data consistency
- The x-axis will expand to show all 12 months for more granular step visualization

