
# Tax Loss Harvesting Transactional Screen

## Overview

Transform the existing Tax Loss Harvesting nudge card into a comprehensive transactional screen with a full dashboard (inspired by the reference image), interactive fund switching capabilities, a jurisdiction-aware fund universe, and before/after comparison views. The screen will use the main application theme (teal sidebar, standard layout) -- not the Command Center's navy AI theme.

## What Will Be Built

### 1. New Database Tables

**`tlh_opportunities`** -- Stores identified tax-loss harvesting opportunities per client holding:
- client_id, client_name, current_fund_id, current_fund_name, current_ticker
- purchase_value, current_value, unrealized_gain_loss
- cost_basis, holding_period (short_term / long_term)
- wash_sale_ok (boolean), jurisdiction (ZA, AU, GB, US, CA)
- suggested_replacement_id, suggested_replacement_name
- estimated_tax_savings, status (new, reviewed, executed, dismissed)
- executed_at, trade_notes

**`tlh_trades`** -- Records executed switch trades for audit trail:
- opportunity_id (FK to tlh_opportunities)
- client_id, sell_fund_id, sell_fund_name, sell_ticker, sell_value
- buy_fund_id, buy_fund_name, buy_ticker, buy_value
- realized_loss, estimated_tax_saving
- trade_type (switch / sell_only)
- status (pending, executed, settled, cancelled)
- executed_at, settled_at, notes

**`tlh_fund_replacements`** -- Pre-mapped replacement fund pairs per jurisdiction:
- jurisdiction (ZA, AU, GB, US, CA)
- original_fund_id (FK to admin_funds)
- replacement_fund_id (FK to admin_funds)
- correlation, tracking_error, fee_differential
- is_active, reason (e.g., "Same index, different provider")

All tables include user_id, RLS policies, standard timestamps, and soft delete.

### 2. New Components

**`src/components/tax-loss-harvesting/TLHDashboard.tsx`** -- Full-page dashboard (opened via Dialog from the nudge card):
- Header: Client name, account number, account balance, total earnings
- Summary cards: "Tax Losses Harvested" total and "Estimated Tax Savings" total
- Estimated Tax Savings breakdown: Gains deferral, Short-to-long reclassification, Loss harvesting
- Tracking Error gauge/chart with acceptable range indicator
- Holdings in Portfolio summary (Model primary, Model substitutes, Not in model)
- Tax Losses Harvested area chart (monthly cumulative)
- Short-term vs Long-term losses breakdown (collapsible sections with daily/non-daily scan)
- Total Net Realized Gains/Losses summary
- Current Tax Settings panel (tax sensitivity, TLH toggle, capital gains budget, tax rates)

**`src/components/tax-loss-harvesting/TLHOpportunitiesTable.tsx`** -- Interactive table of harvesting opportunities:
- Columns: Client, Current Holding, Unrealized Loss, Holding Period, Wash Sale Check, Suggested Replacement, Est. Tax Savings, Action
- Row selection with checkboxes for bulk operations
- "Switch Fund" and "Dismiss" actions per row
- Bulk "Execute Selected" button

**`src/components/tax-loss-harvesting/FundSwitchDialog.tsx`** -- The core transactional dialog:
- Two-panel before/after layout
- **Before panel**: Current fund details (name, ISIN, Morningstar rating, sector, expense ratio, 1Y/3Y/5Y performance, risk rating)
- **After panel**: Replacement fund details with same metrics
- Fund search/selector pulling from `admin_funds` table filtered by jurisdiction
- Key comparison metrics highlighted: fee difference, tracking error, correlation, performance delta
- Confirmation step with sell order and buy order summary
- "Confirm & Execute" button to record the trade

**`src/components/tax-loss-harvesting/FundUniverseSelector.tsx`** -- Searchable fund picker:
- Filters by jurisdiction (ZA, AU, GB, US, CA) based on the current region context
- Searches `admin_funds` by name, ticker, ISIN, Morningstar ID
- Shows fund details: name, ticker, exchange, sector, type, expense ratio
- Pre-filters to show recommended replacements first (from `tlh_fund_replacements`)

**`src/components/tax-loss-harvesting/TLHTradeHistory.tsx`** -- Audit log of executed trades:
- Table of all completed switches with dates, amounts, savings
- Status indicators (Pending, Executed, Settled)

**`src/components/tax-loss-harvesting/BeforeAfterComparison.tsx`** -- Side-by-side metrics view:
- Visual comparison cards showing current vs replacement fund
- Metrics: Annual fee, 1Y return, 3Y return, 5Y return, Sharpe ratio, Max drawdown, Tracking error
- Green/red indicators showing improvement or regression per metric
- Net impact summary at bottom

### 3. New Hook

**`src/hooks/useTLHData.ts`** -- Data management hook:
- Fetches opportunities, trades, and replacement mappings from database
- CRUD operations for opportunities and trades
- Aggregation functions for dashboard metrics
- Integration with `useRegion` for jurisdiction-aware fund filtering

### 4. Demo Data

**`src/data/tlhDemoData.ts`** -- Jurisdiction-specific demo data:
- Pre-populated opportunities for each region (ZA: JSE ETFs and shares, AU: ASX funds, GB: LSE ETFs, US: NYSE/NASDAQ, CA: TSX)
- Each opportunity includes realistic fund pairs with Morningstar-style metrics
- Example replacement mappings (e.g., SATRIX TOP 40 to 1NVEST SA TOP 40 ETF for ZA)

### 5. Integration Points

- The existing `TaxLossHarvestingNudge` "Review & Harvest" button will open the new `TLHDashboard` as a full-screen Dialog instead of the current basic Sheet
- Region context determines which jurisdiction's fund universe is shown
- Fund replacements reference the existing `admin_funds` table (seeded with 800+ instruments across 8 exchanges)
- Trade execution creates records in `tlh_trades` for compliance audit trail
- Currency formatting uses the existing `useRegion().formatCurrency` helper

## Technical Details

### Database Migration

```sql
-- tlh_opportunities table
CREATE TABLE public.tlh_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_id UUID REFERENCES public.clients(id),
  client_name TEXT NOT NULL,
  current_fund_name TEXT NOT NULL,
  current_ticker TEXT,
  current_fund_id UUID REFERENCES public.admin_funds(id),
  purchase_value NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  unrealized_gain_loss NUMERIC DEFAULT 0,
  cost_basis NUMERIC DEFAULT 0,
  holding_period TEXT DEFAULT 'short_term',
  wash_sale_ok BOOLEAN DEFAULT true,
  jurisdiction TEXT DEFAULT 'ZA',
  suggested_replacement_id UUID REFERENCES public.admin_funds(id),
  suggested_replacement_name TEXT,
  estimated_tax_savings NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'new',
  executed_at TIMESTAMPTZ,
  trade_notes TEXT,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- tlh_trades table
CREATE TABLE public.tlh_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  opportunity_id UUID REFERENCES public.tlh_opportunities(id),
  client_id UUID REFERENCES public.clients(id),
  sell_fund_name TEXT NOT NULL,
  sell_ticker TEXT,
  sell_fund_id UUID REFERENCES public.admin_funds(id),
  sell_value NUMERIC DEFAULT 0,
  buy_fund_name TEXT NOT NULL,
  buy_ticker TEXT,
  buy_fund_id UUID REFERENCES public.admin_funds(id),
  buy_value NUMERIC DEFAULT 0,
  realized_loss NUMERIC DEFAULT 0,
  estimated_tax_saving NUMERIC DEFAULT 0,
  trade_type TEXT DEFAULT 'switch',
  status TEXT DEFAULT 'pending',
  executed_at TIMESTAMPTZ DEFAULT now(),
  settled_at TIMESTAMPTZ,
  notes TEXT,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- tlh_fund_replacements table
CREATE TABLE public.tlh_fund_replacements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  jurisdiction TEXT NOT NULL DEFAULT 'ZA',
  original_fund_id UUID REFERENCES public.admin_funds(id),
  replacement_fund_id UUID REFERENCES public.admin_funds(id),
  correlation NUMERIC DEFAULT 0.95,
  tracking_error NUMERIC DEFAULT 0.02,
  fee_differential NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies for all three tables
-- (standard user_id-based policies for SELECT, INSERT, UPDATE, DELETE)
```

### File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/tax-loss-harvesting/TLHDashboard.tsx` | Create | Full dashboard with charts, metrics, and settings panels |
| `src/components/tax-loss-harvesting/TLHOpportunitiesTable.tsx` | Create | Interactive opportunities table with bulk actions |
| `src/components/tax-loss-harvesting/FundSwitchDialog.tsx` | Create | Before/after fund comparison and trade execution |
| `src/components/tax-loss-harvesting/FundUniverseSelector.tsx` | Create | Jurisdiction-aware fund picker from admin_funds |
| `src/components/tax-loss-harvesting/BeforeAfterComparison.tsx` | Create | Side-by-side metrics comparison view |
| `src/components/tax-loss-harvesting/TLHTradeHistory.tsx` | Create | Executed trades audit log |
| `src/hooks/useTLHData.ts` | Create | Data hook for TLH CRUD operations |
| `src/data/tlhDemoData.ts` | Create | Region-specific demo opportunities and fund pairs |
| `src/components/command-center/TaxLossHarvestingNudge.tsx` | Modify | Connect "Review & Harvest" to new TLH Dashboard |
| Database migration | Create | 3 new tables with RLS policies |

### Visual Design

The dashboard uses the main application theme:
- Standard `Card` components with `border` styling
- ECharts for the Tax Losses Harvested area chart and Tracking Error gauge
- Teal accent color for positive actions (matching the adviser portal identity)
- Red/destructive for losses, green for savings
- Collapsible sections using `Collapsible` component for short/long term breakdowns
- The fund switch dialog uses a clean two-column layout with highlighted metric deltas
