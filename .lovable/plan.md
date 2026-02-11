

## Always-On Opportunities in Next Best Action

### Overview
Make the Opportunities tab always show relevant opportunities for every client -- no scanning required. Add five new opportunity types: New Business, Bank Balance Scraping, Tax Loss Harvesting, Upselling, and Idle Cash Reduction.

### Changes

#### 1. `src/components/client-detail/next-best-action/OpportunitiesTab.tsx`

**Add new opportunity type configs:**

| Type | Label | Color | Icon |
|------|-------|-------|------|
| New Business | New Business | blue-100/blue-700 | `Briefcase` |
| Bank Scrape | Bank Scrape | amber-100/amber-700 | `Landmark` |
| Tax Loss | Tax Loss | rose-100/rose-700 | `Receipt` |
| Idle Cash | Idle Cash | yellow-100/yellow-700 | `Banknote` |

(Upsell already exists as "Growth")

**Update `buildGapOpportunities` to always generate opportunities:**
- Remove the dependency on `hasScanned` -- always build gap opportunities from the client's product data
- Add new rules:
  - **New Business**: Always show for clients with fewer than 3 products (suggest expanding portfolio)
  - **Bank Balance Scraping**: Always show if client has bank/savings products (suggest linking bank feeds for real-time tracking)
  - **Tax Loss Harvesting**: Show if client has investment products with total value over R200,000 (suggest reviewing for tax-loss harvesting)
  - **Upsell**: Existing rule (total value over R500,000)
  - **Idle Cash**: Show if client has money market or cash products (suggest deploying idle cash into growth assets)
  - **Cross-sell**: Existing rule (investments but no insurance)
  - **Platform**: Existing rule (multiple providers)

**Update the rendering logic:**
- Remove the condition that only builds gaps when `hasScanned` is true
- Always call `buildGapOpportunities(products)` so opportunities appear immediately
- The `getOpportunitiesCount` function will also reflect this (it already falls back to gaps)

#### 2. `src/components/client-detail/ClientSummaryTab.tsx`

- Remove `hasScanned` and `isScanning` state variables (the Optimize button can remain but becomes a "refresh" that re-fetches from DB)
- Or alternatively, keep the Optimize button for AI-powered scanning but show gap-based opportunities by default without needing to click it first

**Chosen approach**: Keep the Optimize button for future AI scanning, but show gap-based opportunities by default for all clients. The Optimize button enriches/replaces them with AI-scanned results.

### Technical Summary

| File | Change |
|------|--------|
| `OpportunitiesTab.tsx` | Add 4 new type configs (New Business, Bank Scrape, Tax Loss, Idle Cash); expand `buildGapOpportunities` with 4 new rules; remove `hasScanned` gate so gaps always render |
| `ClientSummaryTab.tsx` | No structural changes needed -- just pass opportunities as before; gap opportunities will now always appear |

### Default Opportunities per Client (examples)

```text
Client with 2 investment products, R800k total, 1 provider:
  - New Business (< 3 products)
  - Tax Loss Harvesting (investments > R200k)
  - Upsell / Growth (> R500k)

Client with investments + money market, no insurance, 3 providers:
  - Cross-sell (no insurance)
  - Platform consolidation (3 providers)
  - Idle Cash (has money market)
  - Tax Loss Harvesting (has investments)
```

