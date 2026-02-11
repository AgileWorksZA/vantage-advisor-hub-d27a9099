

## Include 360 View Products in Next Best Action Opportunities

### Problem
The Next Best Action opportunities are driven by `PrepProduct` data from the `client_products` database table, which is often empty. Meanwhile, the 360 View tab shows rich product data generated deterministically via `generateClient360Data`. The opportunities should reflect these 360 View products so every client sees relevant suggestions.

### Approach
Feed the 360 View product data into the `OpportunitiesTab` by converting the generated 360 data into the `PrepProduct` format used by the gap analysis engine.

### Changes

#### 1. `src/components/client-detail/ClientSummaryTab.tsx`

- Import `generateClient360Data` and `mapNationalityToJurisdiction` from `@/data/regional360ViewData`
- Use `useMemo` to generate the 360 data for the current client (same call the 360 View tab makes)
- Convert the 360 View products (on-platform, external, platform cash, risk, short-term, medical) into `PrepProduct[]` format with appropriate category names (e.g. "Investment", "Insurance", "Cash", "Medical Aid")
- Merge these with any existing database products (deduplication not needed since DB products are typically empty)
- Pass the merged/converted product list to `OpportunitiesTab` as the `products` prop

#### 2. `src/components/client-detail/next-best-action/OpportunitiesTab.tsx`

- Update `buildGapOpportunities` to recognize the new category strings from 360 View products (e.g. "investment", "retirement annuity", "living annuity", "risk", "short-term insurance", "medical aid", "platform cash")
- This ensures the gap rules fire correctly based on the richer product data:
  - **New Business**: Still triggers if total product count is low
  - **Cross-sell**: Detects investments without risk/insurance products
  - **Platform**: Counts distinct providers from 360 data (Vantage + external providers)
  - **Upsell/Growth**: Uses actual investment values from 360 data
  - **Bank Scrape**: Triggers on platform cash accounts
  - **Tax Loss**: Uses investment values from 360 data
  - **Idle Cash**: Triggers on platform cash / money market products

### Product Mapping (360 View to PrepProduct)

| 360 View Source | PrepProduct.productName | PrepProduct.category | PrepProduct.currentValue |
|----------------|------------------------|---------------------|------------------------|
| On-Platform Products | product name (e.g. "Retirement Annuity Fund") | "Investment - On Platform" | amountValue |
| External Products | product name + provider | "Investment - External" | amountValue |
| Platform Cash | account name | "Cash" | amountValue |
| Risk Products | holding name | "Risk / Insurance" | 0 |
| Short-Term Products | policy type + insurer | "Short-Term Insurance" | 0 |
| Medical Aid | scheme + plan | "Medical Aid" | 0 |

### Technical Summary

| File | Change |
|------|--------|
| `ClientSummaryTab.tsx` | Import 360 data generator; convert 360 products to `PrepProduct[]`; pass as products prop |
| `OpportunitiesTab.tsx` | Broaden category matching in `buildGapOpportunities` to recognize 360 View category strings |

