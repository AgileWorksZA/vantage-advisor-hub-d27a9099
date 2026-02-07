
# Redesign TLH Dashboard to Match Altruist-Style Client View

## Overview

Restructure the TLH Dashboard dialog to match the reference image layout precisely. The current implementation uses a 4-card summary row with various grid arrangements. The target design uses a clean two-column layout with hero metric cards, collapsible breakdowns nested within parent cards, a horizontal tracking error band chart, and a professional footer disclaimer.

## Visual Layout (Reference Image)

```text
+---------------------------------------------------------------+
|  Client Name (Account #)          Account Balance | Earnings   |
|  [Tabs: Overview, Holdings, etc.]  [Trade] [Transfer] [...]   |
+---------------------------------------------------------------+
|  Data from Jan 1, 2025 to [prev business day]      [YTD v]    |
+---------------------------------------------------------------+
|  +---------------------------+  +---------------------------+  |
|  | Tax Losses Harvested      |  | Estimated Tax Savings 1   |  |
|  | $51,039.67                |  | $23,539.00                |  |
|  +---------------------------+  +---------------------------+  |
+---------------------------------------------------------------+
|  LEFT COLUMN (~55%)             |  RIGHT COLUMN (~45%)        |
|  +-------------------------+   |  +-------------------------+ |
|  | Estimated Tax Savings   |   |  | Tracking error   1.32%  | |
|  | Gains deferral  $20,033 |   |  | [horizontal band chart] | |
|  | Short to long    $3,506 |   |  +-------------------------+ |
|  | Loss harvesting $45,345 |   |  +-------------------------+ |
|  | Total           $23,539 |   |  | Holdings in portfolio   | |
|  +-------------------------+   |  | 540 total               | |
|  +-------------------------+   |  | Model primary      536  | |
|  | Tax Losses Harvested    |   |  | Model substitutes    2  | |
|  | [green area chart]      |   |  | Not in model         2  | |
|  | v Short term   $44,779  |   |  +-------------------------+ |
|  |   Daily scan   $29,019  |   |  +-------------------------+ |
|  |   Non daily    $15,750  |   |  | Current tax settings    | |
|  | v Long term     $6,259  |   |  | Current portfolio       | |
|  |   Daily scan       $2   |   |  | Tax Sensitivity    On   | |
|  |   Non daily     $6,257  |   |  | Tax Loss Harvest   On   | |
|  | Total from TLH $51,039  |   |  | CG Budget         Off   | |
|  +-------------------------+   |  | Tax Rates  ST:20 LT:15  | |
|  +-------------------------+   |  +-------------------------+ |
|  | Total net realized G/L  |   |                             |
|  | v Short term  -$43,381  |   |                             |
|  | v Long term    $33,196  |   |                             |
|  | Total net     -$10,184  |   |                             |
|  +-------------------------+   |                             |
+---------------------------------------------------------------+
|  1 Estimated tax savings are modeled projections...           |
+---------------------------------------------------------------+
```

## Changes Required

### 1. Update `TLHDashboardMetrics` interface (`src/data/tlhDemoData.ts`)

Add absolute holding counts and a `currentPortfolio` name field:
- `totalHoldings: number` (e.g., 540)
- `holdingsPrimaryCount: number` (e.g., 536)
- `holdingsSubstitutesCount: number` (e.g., 2)
- `holdingsNotInModelCount: number` (e.g., 2)
- `currentPortfolio: string` (e.g., "NQ HD Direct Indexing 70/30")

Add these fields to each jurisdiction's metric data.

Also update the `shortTermLosses` and `longTermLosses` to include `dailyScan` and `nonDailyScan` sub-amounts matching the image breakdown pattern, and add totals for each category.

### 2. Redesign `TLHDashboard.tsx` layout

Complete restructure of the component to match the reference image:

**Header section:**
- Client name with account identifier (use data from the first opportunity or a new prop)
- Account Balance and Total Earnings on the right
- Simple tab-like navigation row (Overview, Holdings, Activity, Documents, Details) with Trade and Transfer Funds action buttons
- Date range text: "Data from Jan 1, {year} to [previous business day]" with a YTD dropdown

**Hero cards row (2 cards):**
- "Tax Losses Harvested" with bold value (left)
- "Estimated Tax Savings" with superscript footnote marker (right)
- Simple bordered cards, no icons, clean typography

**Two-column content (grid-cols-[55%_45%]):**

**Left column cards:**
1. **Estimated Tax Savings** card with info icon
   - Line items: Gains deferral, Short to long, Loss harvesting
   - Separator line, then "Estimated Tax Savings" total row in bold

2. **Tax Losses Harvested** card
   - Legend: green square + "Total tax losses harvested"
   - Green area chart (keep existing ECharts config, style to match)
   - Collapsible "Short term losses harvested" with total, then Daily scan / Non daily scan breakdown
   - Collapsible "Long term losses harvested" with total, then breakdown
   - Bold "Total Losses Harvested from TLH" total at bottom

3. **Total net realized gains / losses** card
   - Collapsible "Short term" with value
   - Collapsible "Long term" with value
   - Bold "Total net realized gains / losses" total

**Right column cards:**
1. **Tracking error** card
   - Large percentage value aligned right in the header (e.g., "1.32%")
   - Horizontal band chart (replace the gauge) -- a simple horizontal range visualization showing a band from 0% to >8% with a line indicating current value and a shaded confidence area

2. **Holdings in portfolio** card with info icon
   - Large count in header (e.g., "540")
   - Three line items: Model primary, Model substitutes, Not in model -- each with a right-aligned count

3. **Current tax settings** card
   - "Edit" link in header (right-aligned, teal colored)
   - Line items: Current portfolio (name), Tax Sensitivity (On/Off), Tax Loss Harvesting (On/Off), Annual Capital Gains Budget (On/Off), Tax Rates (ST: X%, LT: Y%)

**Footer:**
- Footnote disclaimer: "Estimated tax savings are modeled projections based on the below tax-savings strategies. They are hypothetical, illustrative, and not guaranteed. Results vary by investor. Not tax advice."

**Remove from this view:**
- The 4 summary cards at top
- The Opportunities table tab
- The Trade History tab
- The DB-backed/syncing indicators (keep the auto-seed logic in the hook, just don't show status)

### 3. Tracking Error Band Chart

Replace the half-gauge with a horizontal band chart. This can be built with pure CSS/HTML:
- A horizontal bar spanning 0% to >8% with labeled tick marks
- A shaded band (light blue/purple) showing the expected range
- A vertical line marker showing the current tracking error value
- Clean axis labels below

### 4. Keep existing functionality intact

- `FundSwitchDialog` and `BeforeAfterComparison` remain unchanged
- Trade execution logic in `useTLHData` stays the same
- The Opportunities table and Trade History can be accessed via a secondary tab or kept as a separate view in future

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/data/tlhDemoData.ts` | Modify | Add holding counts, currentPortfolio, and updated loss breakdown data to TLHDashboardMetrics |
| `src/components/tax-loss-harvesting/TLHDashboard.tsx` | Rewrite | Complete layout restructure to match the reference image's two-column Altruist-style design |

## Technical Notes

- The tracking error band chart will be built with CSS (a positioned horizontal bar with gradient fill and a marker), avoiding ECharts overhead for this simple visualization
- The area chart for "Tax Losses Harvested" will continue using ECharts with the already-fixed static HSL colors
- All collapsible sections will use the existing Radix `Collapsible` component
- Currency formatting continues to use the region-aware `formatCurrency` from `useRegion`
- The dialog sizing remains `max-w-[95vw] w-[1400px]` to accommodate the two-column layout
