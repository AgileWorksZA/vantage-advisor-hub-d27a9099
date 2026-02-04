
# Populate Instruments, Exchanges, Sectors & Industries

## Overview

This implementation populates the Funds & Instruments section with share instruments from the top 5 global exchanges plus the JSE, along with their associated exchanges, sectors, and industries with icons.

## Target Exchanges (6 Total)

| Exchange | Code | Location | Top 100 Instruments |
|----------|------|----------|---------------------|
| NYSE | NYSE | United States | Apple, Microsoft, Berkshire, etc. |
| NASDAQ | NASDAQ | United States | Alphabet, Amazon, Meta, Tesla, etc. |
| Tokyo Stock Exchange | TSE | Japan | Toyota, Sony, Mitsubishi, etc. |
| Shanghai Stock Exchange | SSE | China | ICBC, PetroChina, Kweichow Moutai, etc. |
| London Stock Exchange | LSE | United Kingdom | Shell, AstraZeneca, HSBC, etc. |
| Johannesburg Stock Exchange | JSE | South Africa | Naspers, Anglo American, FirstRand, etc. |

## Data Structure

### 1. Exchanges Table (`admin_general_lists` with `list_type: 'exchanges'`)

| Code | Name | Icon |
|------|------|------|
| NYSE | New York Stock Exchange | Building2 |
| NASDAQ | NASDAQ | BarChart3 |
| TSE | Tokyo Stock Exchange | Landmark |
| SSE | Shanghai Stock Exchange | Building |
| LSE | London Stock Exchange | Castle |
| JSE | Johannesburg Stock Exchange | TrendingUp |

**Icon storage:** Uses `metadata` JSONB column: `{"icon": "Building2"}`

### 2. Sectors Table (`admin_general_lists` with `list_type: 'sectors'`)

| Code | Name | Icon |
|------|------|------|
| TECH | Technology | Cpu |
| HLTH | Healthcare | Heart |
| FINA | Financials | Banknote |
| CONS | Consumer Discretionary | ShoppingCart |
| STAP | Consumer Staples | Package |
| ENGY | Energy | Fuel |
| INDU | Industrials | Factory |
| MATL | Materials | Pickaxe |
| REAL | Real Estate | Home |
| UTIL | Utilities | Zap |
| COMM | Communication Services | Radio |

### 3. Industries Table (`admin_general_lists` with `list_type: 'industries'`)

Industries are sub-categories of sectors. Examples:

| Code | Name | Sector | Icon |
|------|------|--------|------|
| SOFT | Software | Technology | Code |
| SEMI | Semiconductors | Technology | Microchip |
| BANK | Banks | Financials | Building2 |
| PHAR | Pharmaceuticals | Healthcare | Pill |
| AUTO | Automobiles | Consumer Discretionary | Car |
| MINE | Mining | Materials | Gem |
| TELE | Telecommunications | Communication | Phone |
| RETL | Retail | Consumer Discretionary | Store |
| ... | ... | ... | ... |

**Total: ~40 industries**

### 4. Instruments Table (`admin_funds`)

Each instrument includes:

| Field | Example Value |
|-------|--------------|
| name | Apple Inc. |
| code | AAPL |
| isin | US0378331005 |
| morningstar_id | 0P000000GY |
| exchange | NYSE |
| sector | TECH |
| industry | SOFT |
| fund_type | Share |
| domicile | US |
| is_active | true |

**Total: ~600 instruments (100 per exchange)**

## Database Schema Updates

The current `admin_funds` table already has all required columns:
- `code` - Ticker symbol
- `isin` - ISIN code
- `morningstar_id` - Morningstar ID
- `exchange` - References exchange code
- `sector` - References sector code
- `industry` - References industry code
- `name` - Full instrument name

A database migration will add a unique constraint on `(user_id, code, exchange)` in `admin_funds` to prevent duplicate instruments.

## Implementation Approach

### New Edge Function: `seed-instruments-data`

**File:** `supabase/functions/seed-instruments-data/index.ts`

This edge function will:
1. Authenticate the user
2. Seed 6 exchanges with icons
3. Seed 11 sectors with icons
4. Seed ~40 industries with icons
5. Seed 600 instruments (100 per exchange)
6. Use upsert to avoid duplicates

### Frontend Integration

**Modify:** `src/components/administration/funds/FundsSection.tsx`

Add a "Seed Instrument Data" button that:
- Appears only on Instruments/Exchanges/Sectors/Industries tabs
- Calls the edge function
- Shows loading state
- Displays success/error toast
- Refreshes the data table

### UI Enhancement for Icons

Update the table columns for Exchanges/Sectors/Industries to display icons:
- Read icon name from `metadata.icon`
- Render appropriate Lucide icon

---

## Sample Instrument Data by Exchange

### NYSE (100 instruments)
```text
AAPL - Apple Inc. (US0378331005) - Technology/Software
MSFT - Microsoft Corporation (US5949181045) - Technology/Software
BRK.A - Berkshire Hathaway (US0846707026) - Financials/Insurance
JNJ - Johnson & Johnson (US4781601046) - Healthcare/Pharmaceuticals
JPM - JPMorgan Chase (US46625H1005) - Financials/Banks
V - Visa Inc. (US92826C8394) - Technology/Financial Technology
PG - Procter & Gamble (US7427181091) - Consumer Staples/Household
UNH - UnitedHealth Group (US91324P1021) - Healthcare/Insurance
HD - Home Depot (US4370761029) - Consumer Discretionary/Retail
MA - Mastercard (US57636Q1040) - Technology/Financial Technology
... (90 more)
```

### NASDAQ (100 instruments)
```text
GOOGL - Alphabet Inc. (US02079K3059) - Communication/Internet
AMZN - Amazon.com (US0231351067) - Consumer Discretionary/E-commerce
NVDA - NVIDIA Corporation (US67066G1040) - Technology/Semiconductors
META - Meta Platforms (US30303M1027) - Communication/Social Media
TSLA - Tesla Inc. (US88160R1014) - Consumer Discretionary/Automobiles
AVGO - Broadcom Inc. (US11135F1012) - Technology/Semiconductors
COST - Costco Wholesale (US22160K1051) - Consumer Staples/Retail
ADBE - Adobe Inc. (US00724F1012) - Technology/Software
NFLX - Netflix Inc. (US64110L1061) - Communication/Entertainment
... (91 more)
```

### JSE (100 instruments)
```text
NPN - Naspers Limited (ZAE000015889) - Consumer Discretionary/Media
AGL - Anglo American (GB00B1XZS820) - Materials/Mining
FSR - FirstRand Limited (ZAE000066304) - Financials/Banks
SOL - Sasol Limited (ZAE000006896) - Energy/Chemicals
SBK - Standard Bank (ZAE000109815) - Financials/Banks
MTN - MTN Group (ZAE000042164) - Communication/Telecom
ABG - Absa Group (ZAE000255915) - Financials/Banks
CFR - Compagnie Financière Richemont (CH0210483332) - Consumer Discretionary/Luxury
BHP - BHP Group (AU000000BHP4) - Materials/Mining
GLN - Glencore (JE00B4T3BW64) - Materials/Mining
... (90 more)
```

### TSE (100 instruments)
```text
7203 - Toyota Motor (JP3633400001) - Consumer Discretionary/Automobiles
6758 - Sony Group (JP3435000009) - Technology/Electronics
8306 - Mitsubishi UFJ (JP3902900004) - Financials/Banks
6861 - Keyence (JP3236200006) - Technology/Electronics
6501 - Hitachi (JP3788600009) - Industrials/Conglomerate
9984 - SoftBank Group (JP3436100006) - Communication/Investment
6902 - Denso (JP3551500006) - Consumer Discretionary/Auto Parts
7267 - Honda Motor (JP3854600008) - Consumer Discretionary/Automobiles
... (92 more)
```

### SSE (100 instruments)
```text
601398 - ICBC (CNE1000003G1) - Financials/Banks
601857 - PetroChina (CNE1000003W8) - Energy/Oil & Gas
600519 - Kweichow Moutai (CNE0000018R8) - Consumer Staples/Beverages
601288 - Agricultural Bank (CNE100000Q43) - Financials/Banks
600036 - China Merchants Bank (CNE000001B33) - Financials/Banks
601988 - Bank of China (CNE1000001Z5) - Financials/Banks
600028 - Sinopec (CNE1000002Q2) - Energy/Oil & Gas
... (93 more)
```

### LSE (100 instruments)
```text
SHEL - Shell plc (GB00BP6MXD84) - Energy/Oil & Gas
AZN - AstraZeneca (GB0009895292) - Healthcare/Pharmaceuticals
HSBA - HSBC Holdings (GB0005405286) - Financials/Banks
ULVR - Unilever (GB00B10RZP78) - Consumer Staples/Personal Products
BP - BP plc (GB0007980591) - Energy/Oil & Gas
GSK - GSK plc (GB00BN7SWP63) - Healthcare/Pharmaceuticals
RIO - Rio Tinto (GB0007188757) - Materials/Mining
DGE - Diageo (GB0002374006) - Consumer Staples/Beverages
... (92 more)
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/seed-instruments-data/index.ts` | Edge function to seed all instrument data |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/administration/funds/FundsSection.tsx` | Add "Seed Instrument Data" button, add icon column rendering |
| Database migration | Add unique constraint on `(user_id, code, exchange)` in `admin_funds` |

---

## Expected Behavior

| Action | Result |
|--------|--------|
| Navigate to Instruments tab | Shows empty table (no data yet) |
| Click "Seed Instrument Data" | Calls edge function, seeds all data |
| Navigate to Exchanges tab | Shows 6 exchanges with icons |
| Navigate to Sectors tab | Shows 11 sectors with icons |
| Navigate to Industries tab | Shows ~40 industries with icons |
| Navigate to Instruments tab | Shows 600 instruments with exchange/sector/industry references |
| Search for "Apple" | Finds AAPL from NYSE |
| Filter by exchange | Shows only instruments from selected exchange |

---

## Icon Rendering in UI

The `metadata.icon` field stores Lucide icon names. The UI will:

```typescript
// In FundsSection.tsx for list columns
{
  header: "Icon",
  accessor: "metadata",
  render: (value) => {
    const iconName = value?.icon;
    const IconComponent = iconName ? Icons[iconName] : null;
    return IconComponent ? <IconComponent className="h-4 w-4" /> : "—";
  },
}
```

---

## Data Integrity

- **Exchanges** are referenced by code in `admin_funds.exchange`
- **Sectors** are referenced by code in `admin_funds.sector`
- **Industries** are referenced by code in `admin_funds.industry`
- Unique constraint prevents duplicate instruments per user
- Upsert pattern allows re-running seed without duplicates

---

## Summary

This implementation seeds:
- **6 exchanges** (NYSE, NASDAQ, TSE, SSE, LSE, JSE) with icons
- **11 sectors** with icons (Technology, Healthcare, Financials, etc.)
- **~40 industries** with icons (Software, Banks, Pharmaceuticals, etc.)
- **600 instruments** (100 per exchange) with ISIN, Morningstar ID, ticker, and sector/industry links

All data is stored in the database with proper user scoping and can be customized per user after seeding.
