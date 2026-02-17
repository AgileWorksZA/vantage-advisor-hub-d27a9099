

## Dynamic Portfolio Overview Widget Data Based on Advisor Selection

### Overview
Make all numbers in the Portfolio Overview widget change dynamically when advisors are selected/deselected in the advisor filter. Each advisor will have unique portfolio data, and the widget will compute blended/averaged values based on the current selection. All transitions will animate smoothly.

### Data Architecture

Create a per-advisor data map for each jurisdiction (ZA, AU, CA, GB, US) containing:
- **Performance chart data** (all 4 periods) -- slightly varied per advisor
- **Fee comparison** (current and model fees) -- varied per advisor
- **Asset allocation** (equities, bonds, property, cash) -- varied per advisor

When multiple advisors are selected, the widget will show **weighted averages** of their data. When a single advisor is selected, their exact numbers display.

### Changes

#### 1. `src/components/dashboard/PortfolioAnalysisWidget.tsx`

- **Accept `selectedAdvisors` prop** alongside the existing `region` prop
- **Replace static data constants** with a new function `getPortfolioData(region, selectedAdvisors)` that:
  - Looks up each selected advisor's data from a region-keyed map
  - Computes averaged performance lines, fees, and allocations
- **Add CSS transitions** on the SVG paths and bar widths using `transition: all 0.5s ease` so numbers and chart lines animate when data changes
- **Use `useMemo`** to recompute derived data when `selectedAdvisors` or `region` changes
- Add a `key` based on advisor selection to trigger smooth re-renders

#### 2. `src/pages/Dashboard.tsx`

- **Pass `selectedAdvisors`** to the `PortfolioAnalysisWidget`:
  ```tsx
  <PortfolioAnalysisWidget region={selectedRegion} selectedAdvisors={selectedAdvisors} />
  ```

### Data Generation Strategy

A seeded pseudo-random approach will create plausible per-advisor data for all 5 jurisdictions. Each jurisdiction has its own set of advisors (from `regionalData`), so the data map uses `region + advisorInitials` as the key. Base values will be offset by small random deltas per advisor to create variety while keeping numbers realistic (e.g., fees between 0.9% and 2.1%, equities between 35%-60%).

### Animation Approach

- SVG path `d` attributes will animate via CSS `transition` on the path elements
- Fee bar widths will use inline `transition: width 0.5s ease`
- Allocation bar widths similarly transition
- Text numbers will use a lightweight animated counter (increment/decrement over ~400ms) for fee percentages and allocation percentages

### Technical Details

| File | Change |
|------|--------|
| `src/components/dashboard/PortfolioAnalysisWidget.tsx` | Add advisor-aware data generation, accept `selectedAdvisors` prop, animate transitions |
| `src/pages/Dashboard.tsx` | Pass `selectedAdvisors` to widget |

