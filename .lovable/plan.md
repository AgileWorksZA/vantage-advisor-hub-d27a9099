

## Add Performance Tab with Fund Comparison Tool

### Overview
Add a new "Performance" tab after "360 View" in the client detail page. This tab provides a full-page portfolio comparison tool where advisors can compare a client's current holdings against alternative mutual funds, with interactive fee tables, performance charts, asset allocation breakdowns, and holdings analysis -- all driven by jurisdiction-specific fund data from the `admin_funds` table.

### New Files

**1. `src/components/client-detail/ClientPerformanceTab.tsx`** - Main tab component

The page is organized as a single scrollable view with these sections:

**Section A: Portfolio Selection Header**
- Left: "Current Portfolio" showing the client's on-platform products from the 360 view data (fund name, allocation %, value)
- Right: "Comparison Portfolio" with searchable dropdown selectors pulling from `admin_funds` filtered by jurisdiction (ZA=JSE, AU=ASX, CA=TSX, GB=LSE, US=NYSE+NASDAQ), allocation % inputs, "+ Add" button, and delete buttons
- A "Compare" button triggers the comparison calculations

**Section B: Fee Comparison (side-by-side tables)**
- "Current Portfolio Fees and EAC" on the left
- "Comparison Portfolio Fees and EAC" on the right
- Ongoing fees table: Instrument, Investment Management Fee, Admin Fee, Advisor Fee, Other Fee, Cost Per Instrument
- EAC table: Impact of Charge rows (Admin, Advice, Investment Mgmt, Other) across Year 1/3/5/10
- Weighted averages row at bottom
- All fee data generated deterministically from fund metadata (sector, exchange) using seeded random

**Section C: Performance Returns (interactive ECharts)**
- Left chart: Grouped bar chart comparing 6M, 1Y, 3Y, 5Y, 7Y, 10Y returns (current portfolio blue vs comparison green)
- Radio toggle: "Portfolio" vs "Instrument" view
- Right chart: Line chart showing historical monthly/quarterly/annually performance with area fill, date picker, time period toggles
- Both use the `EChartsWrapper` component with tooltips, zoom, and legend interactivity

**Section D: Top 10 Holdings (interactive ECharts)**
- 4 horizontal bar charts in a 2x2 grid:
  1. Top 10 Holdings (current) - blue bars
  2. Top 10 Holdings Comparison - green bars
  3. Top 10 Underlying Holdings (current) - blue bars
  4. Top 10 Underlying Holdings Comparison - green bars
- Generated from seeded random data based on fund names

**Section E: Asset Allocation Breakdown**
- Table showing Local/Offshore/Overall breakdown by asset class (Equity, Property, Bond, Cash, Other) for current portfolio
- 3 interactive pie charts: Overall, Local, Offshore asset allocation (current)
- Comparison table and 3 comparison pie charts below
- All pie charts use ECharts with tooltip and "explode" interaction on click

**2. `src/data/performanceComparisonData.ts`** - Data generation utilities

- `generateCurrentPortfolioFees(products, jurisdiction)` - deterministic fee generation from 360 view products
- `generateComparisonFees(funds)` - fee generation for selected comparison funds
- `generatePerformanceReturns(products, comparisonFunds)` - return data for bar chart
- `generateHistoricalPerformance(products, comparisonFunds)` - monthly time series
- `generateHoldings(products)` - top 10 holdings from product names
- `generateAssetAllocation(products)` - asset class breakdown
- Exchange-to-jurisdiction mapping: JSE=ZA, ASX=AU, TSX=CA, LSE=GB, NYSE/NASDAQ=US

### Changes to Existing Files

**`src/pages/ClientDetail.tsx`**
- Import `ClientPerformanceTab`
- Add `{ value: "performance", label: "Performance" }` to the tabs array after "360-view" (line 255)
- Add `TabsContent` for the performance tab passing `clientId`

### Technical Details

- Fund dropdown uses `supabase.from('admin_funds').select('id, name, code, exchange, sector, fund_manager').eq('is_deleted', false)` filtered by jurisdiction exchanges
- All charts use the existing `EChartsWrapper` with `vantage-light`/`vantage-dark` themes
- Fee percentages are seeded-random based on fund name hash for consistency
- Comparison state managed locally: `comparisonFunds: { fundId, name, code, allocation }[]`
- The "Compare" button recalculates all derived data via `useMemo`
- Current portfolio data reuses `generateClient360Data` from `regional360ViewData.ts`
- Color convention: blue/teal for current portfolio, green for comparison (matching reference images)
- All charts have tooltips, legend toggles, and dataZoom where applicable

