
# Regional Context for AI Assistant

## Overview
Create a global region context to share the selected region (SA, UK, AUS, Canada, US) across the application. The AI Assistant page will consume this context to display region-appropriate data including client names, currency symbols, and product types.

---

## Current Architecture Problem

The region state is currently stored locally in the `Dashboard` component:
```typescript
const [selectedRegion, setSelectedRegion] = useState<string>("ZA");
```

When navigating to the AI Assistant page, this state is lost because the Dashboard unmounts. The AI Assistant currently uses hardcoded mock data with no regional awareness.

---

## Solution: Global Region Context

### 1. Create Region Context

Create a new context provider that:
- Stores the selected region in React context
- Persists the selection in localStorage for session continuity
- Provides region data (currency, products, client names) to any consuming component

```text
src/contexts/
└── RegionContext.tsx   # New context provider
```

### 2. Context Structure

```typescript
interface RegionContextType {
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  regionalData: RegionalData;
  currencySymbol: string;
  formatCurrency: (value: number) => string;
}
```

### 3. Add Regional Opportunity Data

Extend `src/data/regionalData.ts` to include region-specific client opportunities for the AI Assistant:

```typescript
export interface RegionalOpportunityData {
  clientName: string;
  currentValue: number;
  opportunityType: "upsell" | "cross-sell" | "migration" | "platform";
  potentialRevenue: number;
  confidence: number;
  reasoning: string;
  suggestedAction: string;
}

// Each region will have localized client names and values
```

---

## Files to Create

### `src/contexts/RegionContext.tsx`

New context provider with:
- `RegionProvider` component wrapping the app
- `useRegion` hook for consuming components
- localStorage persistence for selected region
- Memoized regional data lookup

---

## Files to Modify

### `src/App.tsx`

Wrap the application with `RegionProvider`:
```typescript
<RegionProvider>
  <ThemeProvider>
    {/* existing structure */}
  </ThemeProvider>
</RegionProvider>
```

### `src/pages/Dashboard.tsx`

- Remove local `selectedRegion` state
- Import and use `useRegion` hook
- Pass context values to AppHeader

### `src/data/regionalData.ts`

Add region-specific opportunity data:

| Region | Example Client Names | Currency | Product Types |
|--------|---------------------|----------|---------------|
| ZA | Johan van der Merwe, Thandi Nkosi | R | Living Annuity, Preservation Fund |
| AU | James Mitchell, Sarah Thompson | A$ | Superannuation, SMSF |
| CA | Pierre Tremblay, Marie-Claire Roy | C$ | RRSP, TFSA |
| GB | William Smith, Elizabeth Jones | £ | SIPP, ISA |
| US | Michael Johnson, Patricia Williams | $ | 401(k), IRA |

### `src/pages/AIAssistant.tsx`

- Import `useRegion` hook
- Replace hardcoded `mockOpportunities` with region-specific data
- Update currency formatting to use `formatCurrency` from context
- Update AI chat responses to use regional currency

### `src/components/ai-assistant/OpportunityCard.tsx`

- Accept `currencySymbol` or `formatCurrency` function as prop
- Use regional currency formatting instead of hardcoded ZAR

---

## Regional Opportunity Data Structure

Each region will have 5 sample client opportunities:

**South Africa (ZA)**
- Client names: Johan van der Merwe, Thandi Nkosi, Pieter du Plessis, etc.
- Products: Living Annuity migration, Preservation Fund consolidation
- Currency: R (ZAR)

**Australia (AU)**
- Client names: James Mitchell, Sarah Thompson, Michael O'Brien, etc.
- Products: Superannuation growth, SMSF setup opportunity
- Currency: A$ (AUD)

**Canada (CA)**
- Client names: Pierre Tremblay, Marie-Claire Bouchard, James MacDonald, etc.
- Products: RRSP maximization, TFSA optimization
- Currency: C$ (CAD)

**United Kingdom (GB)**
- Client names: William Smith, Elizabeth Jones, Thomas Williams, etc.
- Products: ISA upsell, SIPP consolidation
- Currency: £ (GBP)

**United States (US)**
- Client names: Michael Johnson, Patricia Williams, Robert Brown, etc.
- Products: 401(k) rollover, Roth IRA conversion
- Currency: $ (USD)

---

## Implementation Flow

```text
+----------------+     +------------------+     +-----------------+
|   App.tsx      | --> | RegionProvider   | --> | Dashboard.tsx   |
|                |     | (stores region)  |     | (uses context)  |
+----------------+     +------------------+     +-----------------+
                              |
                              v
                       +-----------------+
                       | AIAssistant.tsx |
                       | (uses context)  |
                       +-----------------+
```

---

## Chat Response Updates

The AI chat responses in `AIAssistant.tsx` will dynamically use:
- Regional currency symbol for values
- Region-appropriate client names from opportunities
- Localized product terminology (e.g., "SIPP" in UK vs "401(k)" in US)

Example for UK:
```
"I've identified 2 clients with upselling potential. 
William Smith shows the highest opportunity with £125,000 
potential revenue from ISA expansion."
```

---

## Benefits

1. **Consistent Experience**: Region selection persists across navigation
2. **Localized Data**: Client names, currencies, and products match selected region
3. **Scalable**: Easy to add more regions or region-specific features
4. **Type Safety**: Full TypeScript support for regional data structures
