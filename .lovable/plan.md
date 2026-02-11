

## Enhance Opportunities Tab: Currency, Optimize Scan, and Opportunity Details

### 1. Region-Aware Currency Formatting

**Problem**: `formatCurrency` in `OpportunitiesTab.tsx` is hardcoded to `en-ZA` / `ZAR`. US clients show "R" instead of "$".

**Fix**: 
- Pass the client's jurisdiction (derived from `country_of_issue` or `nationality`) from `ClientSummaryTab` into `OpportunitiesTab` as a new `jurisdiction` prop
- Update `formatCurrency` to accept a jurisdiction parameter and use the correct currency code/locale from a mapping (same as `RegionContext`'s `currencyMap`)
- Apply this to all currency displays: gap descriptions, opportunity revenue, and opportunity size

### 2. Optimize Button: Show Scan Results Popup with New Opportunities

**Problem**: Clicking "Optimize" runs a fake scan but shows no results. Need a popup summarizing findings and adding 1-2 new opportunities each time.

**Fix in `ClientSummaryTab.tsx`**:
- Add state for `scanResults`: an array of dynamically generated opportunities (persisted across scans within the session)
- On scan complete, generate 1-2 new `PrepOpportunity`-like items from a pool of opportunity templates (e.g. "Rebalance to target allocation", "Estate planning review", "Fee reduction via platform switch", "Retirement contribution top-up")
- Show a Dialog/AlertDialog after scan completes with a summary: "AI Scan Complete - X new opportunities identified" listing the new items
- Merge `scanResults` into the `activeOpps` array passed to `OpportunitiesTab`

**Opportunity templates pool** (rotates on each scan):
- Migration: "Consolidate external holdings to reduce fees"
- Upsell: "Increase retirement contributions by 5%"  
- Cross-sell: "Add disability cover to protect income"
- Platform: "Switch to lower-fee share class"
- New Business: "Offshore investment diversification"
- Tax Loss: "Harvest unrealised losses in equity portfolio"

### 3. Show Opportunity Size and Date Identified

**Problem**: Each opportunity row doesn't show its estimated value or when it was identified.

**Fix in `OpportunitiesTab.tsx`**:
- For gap opportunities: calculate an `opportunitySize` based on the gap type (e.g. Upsell = 5% of totalValue, Tax Loss = 2% of investmentValue, Platform = 3% of totalValue, etc.)
- Add a `dateIdentified` field to `GapOpportunity` (default to today's date for gap-based, or the scan date for optimize-generated ones)
- Display opportunity size (top-left, next to the badge) and date below it in a compact format (e.g. "14 Feb")
- For `PrepOpportunity` items from the optimize scan, include `potentialRevenue` as the size and a timestamp

### Technical Summary

| File | Change |
|------|--------|
| `OpportunitiesTab.tsx` | Add `jurisdiction` prop; make `formatCurrency` jurisdiction-aware; add `opportunitySize` and `dateIdentified` to `GapOpportunity`; display size and date on each row |
| `ClientSummaryTab.tsx` | Pass jurisdiction to OpportunitiesTab; add scan result state with Dialog popup; generate 1-2 new opportunities per scan; merge scan results into active opportunities |

### Currency Mapping

| Jurisdiction | Symbol | Code | Locale |
|-------------|--------|------|--------|
| ZA | R | ZAR | en-ZA |
| US | $ | USD | en-US |
| AU | A$ | AUD | en-AU |
| CA | C$ | CAD | en-CA |
| GB | pound | GBP | en-GB |

### Opportunity Size Calculation

| Gap Type | Size Formula |
|----------|-------------|
| Upsell/Growth | 5% of total portfolio value |
| Cross-sell | 3% of investment value |
| Platform | 3% of total value |
| Tax Loss | 2% of investment value |
| Idle Cash | 80% of cash value |
| Bank Scrape | 0 (no monetary value) |
| New Business | 5% of total value |

