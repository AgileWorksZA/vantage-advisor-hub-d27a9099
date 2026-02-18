

## Rename Performance to Portfolio with New Landing Page

### Overview
Rename the "Performance" tab to "Portfolio" and create a new Portfolio landing page matching the reference image. The current Performance comparison screen moves into a "Performance" sub-tab within the new Portfolio view.

### What changes

**1. New component: `src/components/client-detail/ClientPortfolioTab.tsx`**

A new wrapper component that serves as the Portfolio landing page with sub-tabs matching the reference image:
- **Sub-tab bar**: Holdings | Companies | **Performance** | Asset class | ESG impact | Sectors | Geography
- **Account dropdown**: "All accounts" with total value, populated from the client's on-platform products
- **Period selector**: "Since opening", date range display, and an Analysis/Summary toggle
- The **Performance sub-tab** (default active) renders the reference-image layout:
  - Left panel: "Return in this period" showing IRR percentage and Benchmark comparison (e.g., Domestic Fixed Income), plus "By period" horizontal bar chart (date ranges with positive/negative bars and percentages)
  - Right panel: "Changes affecting value" waterfall bar chart with categories: Opening net value, Capital movement, Gains/losses, Income, Expenses, Closing net value
- Other sub-tabs (Holdings, Companies, Asset class, ESG impact, Sectors, Geography) show placeholder content initially
- A dedicated sub-tab renders the existing `ClientPerformanceTab` (the fund comparison tool) -- accessible but not the landing view

**2. Edit: `src/pages/ClientDetail.tsx`**

- Rename tab from `{ value: "performance", label: "Performance" }` to `{ value: "portfolio", label: "Portfolio" }`
- Update the TabsContent to render `ClientPortfolioTab` instead of `ClientPerformanceTab`
- Pass through `clientId`, `nationality`, and `countryOfIssue` props

### Reference image layout

The Performance sub-tab within Portfolio will have:
- A row of filter controls at top (account selector, period selector, Analysis/Summary toggle, Benchmark dropdown)
- Two-column layout below:
  - Left (~35%): Return summary card with IRR value, benchmark value, and "By period" horizontal bars showing returns for different time ranges
  - Right (~65%): "Changes affecting value" waterfall chart using ECharts with labeled bars for each category and value annotations

### Technical details

- Data generation uses the existing seeded random approach from `performanceComparisonData.ts` and `regional360ViewData.ts` for deterministic values based on clientId
- Waterfall chart built with ECharts (already installed) using a stacked bar technique (invisible base + visible segment)
- "By period" bars use a simple horizontal bar chart with positive (teal) and negative (pink/red) coloring
- The existing `ClientPerformanceTab` component is imported and rendered inside one of the sub-tabs, keeping all current functionality intact
- No database changes needed -- all data is derived from existing client/product data

### Files

| File | Action |
|------|--------|
| `src/components/client-detail/ClientPortfolioTab.tsx` | Create -- new Portfolio landing page with sub-tabs and reference-image charts |
| `src/pages/ClientDetail.tsx` | Edit -- rename tab label and swap component |

