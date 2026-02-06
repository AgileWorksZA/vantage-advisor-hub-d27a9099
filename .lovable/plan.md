

# Transform Demo Opportunity Clients into Real Database Clients with Holdings

## Overview

Convert the 31 static demo clients from the AI Opportunity Scanner (John Smith, Mary Jones, etc.) and the 10 TLH demo clients (John Van Der Berg, Maria Pretorius, etc.) into real, persistent database records. Each client will be created with investment products and fund holdings mapped to their jurisdiction. A new edge function will handle the seeding of clients, product categories, products, client holdings, and TLH opportunities -- all linked to real `admin_funds` instrument IDs.

## Current State

- **31 opportunity clients** in `sampleNewOpportunities.ts` use fake IDs (c1-c31) and static names
- **10 TLH clients** in `tlhDemoData.ts` use fake IDs (za-1, au-1, etc.) with no DB records
- Clicking any of these clients shows a toast "This is a demo client" because IDs are not valid UUIDs
- **211 real clients** already exist in the database from `seed-demo-clients`
- **576 instruments** exist in `admin_funds` across JSE, LSE, NYSE, NASDAQ, SSE, TSE
- **No ASX or TSX instruments** exist yet -- AU and CA jurisdictions need instruments seeded too
- `product_categories` and `products` tables exist but are **empty**
- `client_products` table exists and is ready for holdings data

## What Will Be Built

### 1. New Edge Function: `seed-tlh-clients`

A comprehensive seeding function that performs the following steps in order:

**Step A -- Seed ASX and TSX instruments into `admin_funds`**
- Add top ETFs and shares for Australia (ASX: VAS, IOZ, A200, STW, BHP.AX, CBA.AX, CSL.AX, etc.)
- Add top ETFs and shares for Canada (TSX: XIU, ZCN, XIC, VCN, RY.TO, TD.TO, SHOP.TO, etc.)
- ~30-40 instruments per exchange, matched by real ISIN and Morningstar data
- Uses UPSERT on ISIN to avoid duplicates

**Step B -- Seed opportunity clients into `clients` table**
- All 31 clients from `sampleNewOpportunities.ts` (John Smith, Mary Jones, Peter Williams, etc.)
- All TLH-specific clients from `tlhDemoData.ts` (John Van Der Berg, Maria Pretorius, Susan Khumalo, James Mitchell, William Thompson, Sarah Johnson, Marc Leblanc)
- Assign each client to a jurisdiction (ZA, AU, GB, US, CA) with appropriate nationality, advisor, language, and contact details
- Uses the same duplicate-detection pattern as `seed-demo-clients` (case-insensitive first_name|surname matching)
- Returns a name-to-UUID mapping for subsequent steps

**Step C -- Seed product categories**
- Investment-specific categories: Equity ETF, Unit Trust, Retirement Annuity (ZA), Superannuation (AU), RRSP (CA), ISA (GB), 401k/IRA (US), TFSA, Living Annuity, Preservation Fund, Discretionary Portfolio
- Uses UPSERT on category code to avoid duplicates

**Step D -- Seed products**
- Create product records referencing real `admin_funds` instruments and product categories
- Map fund names from `tlhDemoData` (Satrix Top 40, Vanguard S&P 500, iShares FTSE 100, etc.) to real admin_funds entries
- Each product linked to a provider from `product_providers` where available

**Step E -- Seed client_products (holdings)**
- Create realistic holdings for each client with:
  - Purchase values and current values from the demo data
  - Premium amounts and frequencies
  - Start dates (historical, staggered)
  - Links to real product and admin_fund IDs
- Holdings per jurisdiction match the opportunity type (e.g., TLH clients hold underperforming funds, fee-optimization clients hold high-TER funds)

**Step F -- Seed tlh_opportunities**
- Create records in the `tlh_opportunities` table with:
  - Real `client_id` UUIDs (from Step B lookup)
  - Real `current_fund_id` and `suggested_replacement_id` (from `admin_funds`)
  - Accurate unrealized_gain_loss, estimated_tax_savings, holding_period
  - Jurisdiction-appropriate data

### 2. Update `sampleNewOpportunities.ts`

- Add a `jurisdiction` field to each opportunity type and client
- Keep static data as fallback but add `dbClientId` optional field for real DB linkage

### 3. New Hook: `useOpportunityClients`

- On mount, queries the `clients` table for all opportunity-related clients by name
- Builds a name-to-UUID mapping
- Enriches the static `sampleNewOpportunities` data with real `dbClientId` values
- Falls back gracefully to demo mode if clients haven't been seeded yet

### 4. Update Frontend Components

**`ClientOpportunityList.tsx`**
- Use the enriched data from `useOpportunityClients` to navigate with real UUIDs
- Keep the existing UUID validation as a safety net

**`NewOpportunitiesTable.tsx`**
- Pass through enriched client data with real IDs

**`useTLHData.ts`**
- Add database query mode: fetch `tlh_opportunities` from DB when available
- Fall back to static `tlhDemoData` if no DB records exist
- Update `executeTrade` to write to `tlh_trades` table

**`TLHDashboard.tsx`** and **`TLHOpportunitiesTable.tsx`**
- Use real client IDs for navigation links
- Show client detail links that navigate to real CRM profiles

### 5. Jurisdiction-to-Exchange Mapping

| Jurisdiction | Primary Exchange(s) | Funds to Seed |
|---|---|---|
| ZA | JSE | Already has 96 instruments. ETF pairs: STX40/ETFT40, GLD/ETFGLD, NPN/PRX, MTN/VOD |
| AU | ASX (new) | ~30 instruments: VAS, IOZ, A200, STW, BHP, CBA, CSL, WBC, ANZ, NAB |
| GB | LSE | Already has 95 instruments. Pairs: ISF/VUKE, BARC/LLOY, VOD/NG |
| US | NYSE + NASDAQ | Already has 196 instruments. Pairs: VOO/IVV (to be added), SPY/SCHB, AAPL/MSFT |
| CA | TSX (new) | ~30 instruments: XIU, ZCN, XIC, VCN, RY, TD, BMO, SHOP, ENB, CNR |

### 6. Client Distribution by Jurisdiction

| Jurisdiction | Opportunity Clients | TLH Clients | Total New |
|---|---|---|---|
| ZA | 12 (TLH) + 3 (Legacy) + 2 (Fee Opt) + 2 (Contrib) | 4 | ~19 |
| AU | 2 (Legacy) + 1 (Fee Opt) + 1 (Contrib) | 1 | ~4 |
| GB | 1 (Legacy) + 1 (Fee Opt) + 1 (Contrib) | 1 | ~3 |
| US | 2 (Legacy) + 1 (Fee Opt) + 1 (Contrib) | 1 | ~4 |
| CA | 1 (Legacy) + 1 (Fee Opt) + 1 (Contrib) | 1 | ~3 |

## Technical Details

### Edge Function Structure

```text
supabase/functions/seed-tlh-clients/index.ts

1. Auth verification (same pattern as seed-demo-clients)
2. Seed ASX/TSX instruments into admin_funds (UPSERT on isin)
3. Seed opportunity + TLH clients into clients (duplicate detection)
4. Look up all seeded clients to get UUID mapping
5. Seed product_categories (UPSERT on code)
6. Seed client_products with holdings data
7. Seed tlh_opportunities with real fund + client references
8. Return summary with counts
```

### File Changes Summary

| File | Action | Description |
|---|---|---|
| `supabase/functions/seed-tlh-clients/index.ts` | Create | Edge function to seed all TLH/opportunity data |
| `src/data/sampleNewOpportunities.ts` | Modify | Add jurisdiction field and optional dbClientId |
| `src/hooks/useOpportunityClients.ts` | Create | Hook to enrich demo data with real client UUIDs |
| `src/hooks/useTLHData.ts` | Modify | Add DB query mode for opportunities and trade execution |
| `src/components/ai-assistant/ClientOpportunityList.tsx` | Modify | Use enriched data with real UUIDs |
| `src/components/ai-assistant/NewOpportunitiesTable.tsx` | Modify | Pass enriched client data through |
| `src/components/ai-assistant/NewOpportunityRow.tsx` | Modify | Accept enriched client data |
| `src/components/tax-loss-harvesting/TLHOpportunitiesTable.tsx` | Modify | Use real client IDs for navigation |
| `src/components/tax-loss-harvesting/TLHDashboard.tsx` | Modify | Add seed button for initial setup |

### Triggering the Seed

- A "Seed TLH Data" button will be added to the TLH Dashboard header (similar to how other seed functions are triggered from their respective admin sections)
- The button calls the `seed-tlh-clients` edge function
- After successful seeding, the dashboard auto-refreshes to show DB-backed data
- The button is hidden once data exists

