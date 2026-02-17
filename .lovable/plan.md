

## Add Sparkline + Growth % to Three Dashboard Widgets

### Overview
Add a sparkline chart and growth percentage badge to the header area of the **Top 5 Accounts**, **Clients by Value**, and **Provider View** widgets, matching the pattern already implemented in the AUM by Product widget.

### 1. Extend Data Interfaces (`src/data/regionalData.ts`)

Add growth fields to three interfaces:

```typescript
export interface ProviderData {
  name: string;
  bookPercent: string;
  value: string;
  growth1m?: number;
  growth6m?: number;
  growthYtd?: number;
}

export interface TopAccountData {
  investor: string;
  bookPercent: string;
  value: string;
  advisorInitials: string;
  growth1m?: number;
  growth6m?: number;
  growthYtd?: number;
}

export interface ClientsByValueData {
  range: string;
  value: string;
  investors: number;
  growth1m?: number;
  growth6m?: number;
  growthYtd?: number;
}
```

Add deterministic growth values to all entries across all 5 regions (ZA, AU, CA, UK, US). Values will be realistic and vary -- some positive, some negative.

### 2. Update Dashboard Widgets (`src/pages/Dashboard.tsx`)

For each of the three widgets, add a sparkline + growth badge row between the header and the table, following the same pattern as the AUM widget:

- Add a shared `aumGrowthPeriod` state (already exists) and reuse it across all three widgets for consistency
- Each widget gets a row showing: `[Total/Summary value] [SVG sparkline] [growth % badge]`
- Below each table, add the same period toggle pills (1M | 6M | YTD) already used in AUM widget
- Each table row also gets a small inline growth % next to the value column

**Provider View widget:**
- Summary line: total provider AUM with sparkline and average growth
- Each provider row gets a growth badge in the value column

**Top 5 Accounts widget:**
- Summary line: total top-5 value with sparkline and average growth
- Each account row gets a growth badge in the value column

**Clients by Value widget:**
- Summary line: total client value with sparkline and average growth
- Each value-range row gets a growth badge next to the investors count

### Visual Design
- Sparkline: 60x20px inline SVG polyline (6 points), green stroke for positive, red for negative
- Growth badge: text-xs, emerald-600/red-600, with TrendingUp/TrendingDown icon
- Period toggle: same pill buttons as AUM widget, sharing the same state variable
- Row-level badges: text-[10px], compact, next to existing values

### Files

| File | Action |
|------|--------|
| `src/data/regionalData.ts` | Edit -- add growth fields to 3 interfaces and all region data |
| `src/pages/Dashboard.tsx` | Edit -- add sparkline rows and row-level growth badges to 3 widgets |

