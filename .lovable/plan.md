

## Add Portfolio Analysis Widget to Advisor Dashboard & Remove Action Button Screen

### Overview
Add a new "Portfolio Analysis" dashboard widget that mirrors the home screen's Portfolio Analysis card (performance chart, fee comparison, asset allocation) adapted for the dashboard widget grid. Also remove the OpportunityAction page and its route.

### 1. Remove OpportunityAction Page

**File: `src/App.tsx`**
- Remove the import of `OpportunityAction`
- Remove the route `<Route path="/opportunities/:category" ...>`

**File: `src/pages/OpportunityAction.tsx`**
- Delete this file

### 2. Create Portfolio Analysis Dashboard Widget

**File: `src/components/dashboard/PortfolioAnalysisWidget.tsx`** (new)

A self-contained widget component adapted from `HeroPortfolioCard.tsx`'s `PortfolioAnalysisCard`, but simplified for the dashboard context:

- **Performance Comparison Chart**: SVG line chart with 3 lines (Current, Model, Benchmark) and period toggles (6M, 1Y, 3Y, 5Y). Uses static demo data matching the home screen card.
- **Annual Fee Comparison**: Horizontal bar comparison showing Current (1.85%) vs Model (1.25%) with the "Potential fee saving" callout.
- **Asset Allocation**: Side-by-side bars for Equities, Bonds, Property, Cash showing Current vs Model percentages.
- **"Switch to Model Portfolio" button**: At the bottom with the `animated-border-button` styling (matching home screen).
- Standard widget card wrapper with `GripVertical` drag handle and close button, matching all other dashboard widgets.
- No entry animation (unlike the home screen card which animates on carousel focus) -- content renders immediately.

### 3. Register Widget in Dashboard

**File: `src/pages/Dashboard.tsx`**

- Import `PortfolioAnalysisWidget`
- Add to `defaultDashboardLayout`: `{ i: 'portfolio-analysis', x: 9, y: 6, w: 3, h: 3 }`
- Add to `DASHBOARD_WIDGETS`: `{ id: 'portfolio-analysis', label: 'Portfolio Analysis' }`
- Add widget render block inside `DraggableWidgetGrid`:
  ```
  {isWidgetVisible('portfolio-analysis') && (
    <div key="portfolio-analysis">
      <PortfolioAnalysisWidget />
    </div>
  )}
  ```

### Visual Design
- Chart uses brand colors: orange for Current, blue for Model, green dashed for Benchmark
- Fee bars use the same orange/blue color scheme
- Asset allocation dots use blue, orange, green, purple
- Compact text sizes (text-xs, text-[10px]) to fit within the widget grid cell
- Same card styling as other widgets (Card, CardHeader, CardContent)

### Files Summary

| File | Action |
|------|--------|
| `src/pages/OpportunityAction.tsx` | Delete |
| `src/App.tsx` | Edit - remove OpportunityAction import and route |
| `src/components/dashboard/PortfolioAnalysisWidget.tsx` | Create - new widget component |
| `src/pages/Dashboard.tsx` | Edit - register and render new widget |

