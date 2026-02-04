
# Expand Instruments Seeding: Add ASX (Australia) and TSX (Canada)

## Overview

This implementation expands the existing instrument seeding functionality to include the largest exchange from Australia (ASX) and Canada (TSX), each with their top 100 instruments.

## New Exchanges to Add

| Exchange | Code | Location | Description |
|----------|------|----------|-------------|
| Australian Securities Exchange | ASX | Australia | Largest exchange in Australia |
| Toronto Stock Exchange | TSX | Canada | Largest exchange in Canada |

**Updated Total: 8 exchanges (up from 6)**

## Implementation Changes

### 1. Add Exchange Definitions

Add two new exchange entries to the `exchanges` array:

```typescript
{ code: "ASX", name: "Australian Securities Exchange", description: "Australia - Largest in Oceania", icon: "Sunrise" },
{ code: "TSX", name: "Toronto Stock Exchange", description: "Canada - Largest in Canada", icon: "Maple" },
```

### 2. ASX Top 100 Instruments (Australia)

Sample instruments from the Australian Securities Exchange:

| Code | Name | ISIN | Sector | Industry |
|------|------|------|--------|----------|
| BHP | BHP Group Ltd | AU000000BHP4 | Materials | Mining |
| CBA | Commonwealth Bank | AU000000CBA7 | Financials | Banks |
| CSL | CSL Limited | AU000000CSL8 | Healthcare | Biotechnology |
| NAB | National Australia Bank | AU000000NAB4 | Financials | Banks |
| WBC | Westpac Banking | AU000000WBC1 | Financials | Banks |
| ANZ | ANZ Group Holdings | AU000000ANZ3 | Financials | Banks |
| WES | Wesfarmers Limited | AU000000WES1 | Consumer Discretionary | Retail |
| MQG | Macquarie Group | AU000000MQG1 | Financials | Diversified Financials |
| FMG | Fortescue Ltd | AU000000FMG4 | Materials | Mining |
| RIO | Rio Tinto Limited | AU000000RIO1 | Materials | Mining |
| WOW | Woolworths Group | AU000000WOW2 | Consumer Staples | Food Retail |
| TLS | Telstra Group | AU000000TLS2 | Communication | Telecommunications |
| ... | ... | ... | ... | ... |

**100 total instruments covering major Australian companies**

### 3. TSX Top 100 Instruments (Canada)

Sample instruments from the Toronto Stock Exchange:

| Code | Name | ISIN | Sector | Industry |
|------|------|------|--------|----------|
| RY | Royal Bank of Canada | CA7800871021 | Financials | Banks |
| TD | Toronto-Dominion Bank | CA8911605092 | Financials | Banks |
| ENB | Enbridge Inc | CA29250N1050 | Energy | Oil & Gas |
| CNR | Canadian National Railway | CA1363751027 | Industrials | Transportation |
| BNS | Bank of Nova Scotia | CA0641491075 | Financials | Banks |
| BMO | Bank of Montreal | CA0636711016 | Financials | Banks |
| CP | Canadian Pacific Kansas City | CA13646K1084 | Industrials | Transportation |
| SU | Suncor Energy | CA8672241079 | Energy | Oil & Gas |
| CNQ | Canadian Natural Resources | CA1363851017 | Energy | Oil & Gas |
| TRI | Thomson Reuters | CA8849037095 | Technology | Software |
| ATD | Alimentation Couche-Tard | CA01626P4033 | Consumer Staples | Food Retail |
| MFC | Manulife Financial | CA56501R1064 | Financials | Insurance |
| ... | ... | ... | ... | ... |

**100 total instruments covering major Canadian companies**

### 4. Update Instrument Seeding Logic

Modify the `allInstruments` array to include the new exchanges:

```typescript
const allInstruments = [
  ...createInstrumentRecords(nyseInstruments, "NYSE", "US"),
  ...createInstrumentRecords(nasdaqInstruments, "NASDAQ", "US"),
  ...createInstrumentRecords(jseInstruments, "JSE", "ZA"),
  ...createInstrumentRecords(tseInstruments, "TSE", "JP"),
  ...createInstrumentRecords(sseInstruments, "SSE", "CN"),
  ...createInstrumentRecords(lseInstruments, "LSE", "GB"),
  ...createInstrumentRecords(asxInstruments, "ASX", "AU"),  // NEW
  ...createInstrumentRecords(tsxInstruments, "TSX", "CA"),  // NEW
];
```

## Files to Modify

| File | Changes |
|------|---------|
| `supabase/functions/seed-instruments-data/index.ts` | Add ASX and TSX exchanges, add 200 new instruments (100 each) |

## Data Summary

### Before
- **6 Exchanges**: NYSE, NASDAQ, TSE, SSE, LSE, JSE
- **~600 Instruments**: 100 per exchange

### After
- **8 Exchanges**: NYSE, NASDAQ, TSE, SSE, LSE, JSE, ASX, TSX
- **~800 Instruments**: 100 per exchange

## Expected Behavior

| Action | Result |
|--------|--------|
| Navigate to Exchanges tab | Shows 8 exchanges (including ASX and TSX) |
| Navigate to Instruments tab | Shows ~800 instruments |
| Filter by ASX | Shows 100 Australian instruments |
| Filter by TSX | Shows 100 Canadian instruments |
| Search "BHP" | Finds BHP Group from ASX |
| Search "Royal Bank" | Finds Royal Bank of Canada from TSX |

## Icon Selection

| Exchange | Icon | Rationale |
|----------|------|-----------|
| ASX | Sunrise | Represents Australia (land of the rising sun in the Southern Hemisphere) |
| TSX | Leaf | Represents Canada (maple leaf symbolism) |

## Technical Notes

1. **Idempotent Seeding**: Uses existing upsert pattern with `ON CONFLICT (user_id, code, exchange)`
2. **Batch Processing**: Instruments inserted in batches of 100 to avoid timeout
3. **Country Codes**: AU for Australia, CA for Canada (ISO 3166-1 alpha-2)
4. **Icon Storage**: Icons stored in `metadata.icon` JSONB field in `admin_general_lists`
