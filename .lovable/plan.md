

# Per-Client TLH Dashboard with Tracking Error Timeline, Slider, Info Tooltips, and Product Linkage

## Overview

Transform the TLH Dashboard from showing generic jurisdiction-level metrics into a **client-specific view** that displays unique financial data for each client clicked from the AI Assistant's opportunity list. Add an interactive tracking error timeline chart with a time-range slider, info tooltips across all cards, and link the displayed data back to the client's master product records in `client_products`.

## What Changes

### 1. Per-Client Metrics Data (`src/data/tlhDemoData.ts`)

**New interface**: `TLHClientMetrics` -- extends the existing `TLHDashboardMetrics` with per-client fields:
- All existing fields remain
- Add `trackingErrorTimeline: { date: string; value: number }[]` -- 12 months of daily/weekly tracking error data points showing the value increasing over time (matching the reference image's line chart pattern)

**New function**: `getClientTLHMetrics(clientName: string, jurisdiction: string): TLHClientMetrics`
- Returns unique, differentiated metric values for each of the 12 TLH opportunity clients
- Each client gets different amounts for: `totalHarvested`, `estimatedTaxSavings`, `gainsDeferral`, `shortToLongReclassification`, `lossHarvesting`, `accountBalance`, `totalEarnings`, `trackingError`, holdings counts, short/long term breakdowns, net realized gains/losses
- Generates a `trackingErrorTimeline` array with ~30 data points showing tracking error gradually increasing from a low value (e.g., 0.2%) to the client's current tracking error value
- Falls back to the existing jurisdiction-level `getTLHDashboardMetrics` if the client name isn't recognized

Client-specific data (12 TLH clients with distinct values):

| Client | Account Balance | Total Harvested | Est. Tax Savings | Tracking Error |
|--------|----------------|----------------|------------------|----------------|
| John Smith | 1,245,800 | 51,040 | 23,539 | 1.32% |
| Mary Jones | 892,400 | 38,200 | 17,600 | 0.95% |
| Peter Williams | 1,520,000 | 62,800 | 28,400 | 1.68% |
| Sarah Brown | 654,200 | 24,100 | 11,200 | 0.72% |
| David Miller | 2,100,000 | 78,500 | 35,800 | 2.15% |
| Emma Davis | 445,600 | 19,800 | 9,100 | 0.58% |
| Michael Wilson | 1,890,000 | 55,200 | 25,100 | 1.45% |
| Lisa Anderson | 780,000 | 31,600 | 14,500 | 1.10% |
| James Taylor | 1,340,000 | 42,900 | 19,800 | 1.28% |
| Jennifer Thomas | 560,000 | 21,400 | 9,800 | 0.65% |
| Robert Jackson | 320,000 | 12,800 | 5,900 | 0.42% |
| Amanda White | 280,000 | 9,600 | 4,400 | 0.35% |

### 2. Pass Client Context to TLH Dashboard

**`src/components/ai-assistant/ClientOpportunityList.tsx`**
- When `opportunityType === "tax-loss-harvesting"`, store the clicked client's name and ID in state
- Pass `clientName` and `clientId` (dbClientId or static id) as new props to `TLHDashboard`

**`src/components/tax-loss-harvesting/TLHDashboard.tsx`** (props update)
- Add optional props: `clientName?: string`, `clientId?: string`
- Use `clientName` to call the new `getClientTLHMetrics()` function instead of generic `getTLHDashboardMetrics()`
- Display the actual client name in the header instead of the generic trust/entity name

### 3. Tracking Error Timeline Chart with Slider

**`src/components/tax-loss-harvesting/TrackingErrorBand.tsx`** (enhanced)
- Keep the existing horizontal band visualization at the top
- Add below it: an ECharts line chart showing tracking error over time (~30 data points over 12 months)
  - Y-axis: tracking error percentage (0% to max + buffer)
  - X-axis: dates
  - Line: smooth, with area fill using brand teal gradient
  - A horizontal dashed reference line at the target tracking error value
- Add a **Radix UI Slider** below the chart for time-range filtering:
  - Dual-thumb slider representing start and end dates
  - Default: full range (all data points)
  - As the user drags the thumbs, the chart zooms to the selected date range
  - Display the selected date range as text labels (e.g., "Mar 2025 - Jan 2026")
- The band chart marker updates to show the tracking error at the slider's end position (so users can scrub through time and see how tracking error changed)

New props for TrackingErrorBand:
```
interface TrackingErrorBandProps {
  value: number;
  target: number;
  timeline: { date: string; value: number }[];
}
```

### 4. Info Tooltips on All Cards

Add `Tooltip` wrappers around the `Info` icons on every card. Each tooltip provides a brief, helpful explanation:

| Card | Tooltip Text |
|------|-------------|
| Estimated Tax Savings | "Projected tax savings from gains deferral, short-to-long reclassification, and direct loss harvesting strategies." |
| Tax Losses Harvested | "Total capital losses realized through strategic tax-loss harvesting trades during the selected period." |
| Tracking Error | "Measures how closely the portfolio tracks its benchmark index. Lower values indicate tighter tracking." |
| Holdings in Portfolio | "Breakdown of positions by category: primary model holdings, tax-loss substitutes, and out-of-model positions." |
| Current Tax Settings | "Your active tax optimization configuration including sensitivity levels, harvesting rules, and applicable tax rates." |
| Total Net Realized G/L | "Net capital gains or losses realized from all portfolio transactions, separated by holding period." |

Implementation: Wrap each `<Info>` icon in `<Tooltip><TooltipTrigger>...<Info /></TooltipTrigger><TooltipContent>...</TooltipContent></Tooltip>` using the existing Radix tooltip components. Wrap the entire dashboard content in `<TooltipProvider>`.

### 5. Link to Client Product Records

**Data flow**: When the dashboard loads for a specific client:
- If `clientId` is a valid UUID (from `dbClientId`), query `client_products` for that client
- Display a "View Products" link in the header that navigates to `/clients/{clientId}?tab=products`
- In the "Holdings in portfolio" card, if real product data exists, show actual product count from `client_products` instead of static demo numbers
- In the "Current tax settings" card, show the client's actual portfolio name if product data is available

**`src/hooks/useTLHData.ts`** (minor update)
- Add a `getClientMetrics(clientName: string)` function that returns `getClientTLHMetrics(clientName, selectedRegion)` 
- Export it alongside existing returns

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/data/tlhDemoData.ts` | Modify | Add `trackingErrorTimeline` to metrics interface; add `getClientTLHMetrics()` with unique data for all 12 TLH clients |
| `src/components/tax-loss-harvesting/TrackingErrorBand.tsx` | Rewrite | Add ECharts timeline chart below the band, add Radix Slider for time-range scrubbing, accept timeline data prop |
| `src/components/tax-loss-harvesting/TLHDashboard.tsx` | Modify | Accept `clientName`/`clientId` props; use per-client metrics; add Tooltip wrappers on all Info icons; add "View Products" navigation link; wrap in TooltipProvider |
| `src/components/ai-assistant/ClientOpportunityList.tsx` | Modify | Store clicked client name/id; pass to TLHDashboard as props |
| `src/hooks/useTLHData.ts` | Modify | Add `getClientMetrics` helper that delegates to `getClientTLHMetrics` |

## Technical Notes

- The tracking error timeline ECharts chart will use static HSL color values (not CSS variables) to avoid the `addColorStop` canvas error encountered previously
- The Radix Slider component is already installed (`@radix-ui/react-slider`) and available at `src/components/ui/slider.tsx`
- Tooltip components are already available at `src/components/ui/tooltip.tsx`
- The timeline chart data will be generated deterministically from the client name (seeded random) so it's consistent across renders
- The slider will control a `[startIndex, endIndex]` state that slices the timeline array, and the chart re-renders with the filtered data
- Product linkage is best-effort: if `clientId` is a valid UUID, fetch real product data; otherwise show the static demo values

