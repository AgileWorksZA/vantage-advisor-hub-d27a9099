

## Realtime Fund Comparison with Analyst-Style Charts

### Key Changes

**1. Remove the "Compare" button gate -- make all calculations realtime**

Currently, all comparison data is gated behind a `compared` boolean set by clicking "Compare". This will be removed so that all charts and tables update live as funds are added/removed or allocations changed.

- Remove `compared` state entirely
- All `useMemo` hooks for fees, EAC, performance, holdings, and allocation will depend directly on `comparisonFunds` array
- Show comparison sections whenever `comparisonFunds.length > 0` (instead of `compared`)
- Keep the "Auto Balance" button but remove the "Compare" button

**2. Restructure layout into 2-4 card boxes per row (analyst dashboard style)**

Replace the current single-card-per-section layout with individual cards per chart/table, arranged in a grid matching the reference image:

```text
Row 1: [Current Portfolio Card] [Comparison Portfolio Card]
Row 2: [Current Fees + EAC Card] [Comparison Fees + EAC Card]  
Row 3: [Portfolio Performance Returns Card] [History Performance Return Card]
Row 4: [Top 10 Holdings] [Top 10 Holdings Comparison] [Top 10 Underlying] [Top 10 Underlying Comparison]
Row 5: [Current Asset Alloc Table+Pies] [Comparison Asset Alloc Table+Pies]
```

- Fee tables become narrower individual cards (2 per row)
- Holdings charts become 4 individual cards per row (matching the reference image exactly)
- Each card has its own header with teal-colored title text (matching reference style)

**3. Enhance chart styling to match analyst-style reference**

- **Performance Returns bar chart**: Add "Portfolio / Instrument" radio toggle at top-left, light blue bars for current, green bars for comparison, clean axis labels like "6-Month Return", "1-Year Return" etc.
- **History Performance Return line chart**: Add "Monthly / Quarterly / Annually" radio toggle, date input field, green area-fill for comparison, blue line for current, smooth curves with confidence band feel
- **Holdings bar charts**: Light blue (#a3d5f7) fill for current, light green (#b3e6b3) fill for comparison, horizontal bars with percentage axis (0-50%), truncated labels on y-axis
- All charts get `dataZoom` for interactivity

**4. File changes**

**`src/components/client-detail/ClientPerformanceTab.tsx`** (major rewrite):
- Remove `compared` state and "Compare" button
- All computed data (`comparisonFees`, `comparisonEAC`, `perfReturns`, `historicalPerf`, `compHoldings`, `compUnderlying`, `compAlloc`) now derived directly when `comparisonFunds.length > 0`
- Add `perfViewMode` state ("portfolio" | "instrument") for the bar chart radio toggle
- Add `historyFrequency` state ("monthly" | "quarterly" | "annually") for line chart toggle
- Restructure JSX: each visualization gets its own `Card` wrapper
- Holdings section: `grid grid-cols-2 xl:grid-cols-4 gap-4` with 4 individual cards
- Fee section: `grid grid-cols-1 lg:grid-cols-2 gap-4` with 2 individual cards
- Performance section: `grid grid-cols-1 lg:grid-cols-2 gap-4` with 2 individual cards
- Chart titles use `text-teal-600` color matching reference
- Bar chart colors: `hsl(200, 70%, 75%)` (light blue) for current, `hsl(142, 60%, 70%)` (light green) for comparison
- Holdings bar height reduced to 220px per card to fit 4 across

### Technical Details

- Removing the `compared` gate means `useMemo` dependencies change from `[compared, comparisonFunds]` to just `[comparisonFunds]`
- Empty comparison state shows placeholder text in comparison cards: "Add funds to see comparison"
- `compAllocTotal` validation warning remains on the portfolio selection card
- Radio toggles use simple `button` elements with active state styling (matching reference: circle radio indicators)
- History chart date filtering: when "Quarterly" selected, sample every 3rd point; "Annually" every 12th point from the generated monthly data
