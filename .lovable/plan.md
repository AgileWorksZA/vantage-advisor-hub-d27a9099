

## Replace Asset Allocation with Portfolio Overview on Client Dashboard

### What changes
The "Asset Allocation" widget (horizontal bar chart) on the Client Dashboard will be replaced with the "Portfolio Overview" widget already used on the Adviser Dashboard. This widget shows performance comparison, fee comparison, and asset allocation in a single compact card.

### Technical changes

**1. `src/components/client-detail/ClientDashboardTab.tsx`**

- Import `PortfolioAnalysisWidget` from `@/components/dashboard/PortfolioAnalysisWidget`
- Import `useRegion` from `@/contexts/RegionContext` to pass the region prop
- Update the default layout entry: rename `'asset-allocation'` to `'portfolio-overview'` (keeping same position: x:0, y:0, w:3, h:3)
- Update the widget config entry: change id/label from "Asset Allocation" to "Portfolio Overview"
- Replace the Asset Allocation widget block (lines 397-415) with:
  ```tsx
  {isWidgetVisible('portfolio-overview') && (
    <div key="portfolio-overview">
      <PortfolioAnalysisWidget
        region={region}
        onClose={() => handleToggleWidget('portfolio-overview', false)}
      />
    </div>
  )}
  ```
- Remove the now-unused `assetAllocationOption` memo and related `EChartsWrapper` usage for that widget
- Update the `handleToggleWidget` references from `'asset-allocation'` to `'portfolio-overview'`

**2. Layout migration** -- The `useWidgetLayout` hook already has auto-heal logic that detects foreign widget IDs and resets to default layout. Since we're renaming the widget ID, existing saved layouts will auto-heal on next load.

