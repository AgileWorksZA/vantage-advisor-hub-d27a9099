

## Dynamic Dashboard Filtering by Selected Advisors

### Overview

Enable the dashboard to dynamically update all numerical data (providers, accounts, AUM, birthdays, clients by value) when advisors are selected or deselected in the AdvisorFilter component. This requires sharing advisor selection state globally and creating per-advisor data breakdowns for each jurisdiction.

---

## Architecture Changes

```text
┌─────────────────────────────────────────────────────────────────┐
│                       RegionContext                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ selectedRegion  │  │ selectedAdvisors│  │ filteredData    │  │
│  │     (ZA)        │  │   [JB, SM, PN]  │  │ (computed)      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
              │                    │                    │
              ▼                    ▼                    ▼
        ┌─────────────────────────────────────────────────────┐
        │                   Dashboard                          │
        │  Uses filteredData instead of raw regionalData       │
        └─────────────────────────────────────────────────────┘
              │
              ▼
        ┌─────────────────────────────────────────────────────┐
        │                  AdvisorFilter                       │
        │  Updates selectedAdvisors via context               │
        └─────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### 1. Extend Regional Data with Per-Advisor Breakdowns

**File**: `src/data/regionalData.ts`

Add advisor attribution to each data point so values can be filtered:

```typescript
export interface AdvisorData {
  initials: string;
  name: string;
  // New: Each advisor's share of the practice
  aum: number;           // Their portion of totalAUM
  clientCount: number;   // Number of clients they manage
}

// Add helper function to compute filtered data
export function getFilteredRegionalData(
  regionCode: string, 
  selectedAdvisors: string[]
): RegionalData {
  // Returns data filtered/aggregated based on selected advisors
}
```

Each advisor will have:
- A percentage share of total AUM
- Assigned clients (for Top Accounts, Birthdays)
- Proportional provider/product distribution

---

### 2. Update RegionContext to Manage Advisor Selection

**File**: `src/contexts/RegionContext.tsx`

Add advisor selection state and filtered data computation:

```typescript
interface RegionContextType {
  // Existing
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  regionalData: RegionalData;
  
  // New
  selectedAdvisors: string[];
  setSelectedAdvisors: (advisors: string[]) => void;
  filteredRegionalData: RegionalData;  // Data filtered by selected advisors
}
```

The context will:
- Store `selectedAdvisors` array (persisted to localStorage)
- Auto-reset when region changes
- Compute `filteredRegionalData` based on selections

---

### 3. Create Per-Advisor Data for Each Jurisdiction

**File**: `src/data/regionalData.ts`

For each jurisdiction, define advisor-specific data:

| Data Type | Advisor Attribution |
|-----------|---------------------|
| **totalAUM** | Each advisor has an AUM amount; sum selected advisors |
| **providers** | Each provider has advisor breakdown; aggregate selected |
| **topAccounts** | Each account assigned to one advisor |
| **birthdays** | Each client birthday assigned to one advisor |
| **products** | Proportional to advisor's AUM share |
| **clientsByValue** | Each tier has advisor breakdown |

Example for South Africa:
```typescript
advisors: [
  { initials: "JB", name: "Johan Botha", aum: 980000000, clientCount: 425 },
  { initials: "SM", name: "Sarah Mostert", aum: 850000000, clientCount: 380 },
  { initials: "PN", name: "Pieter Naudé", aum: 720000000, clientCount: 340 },
  { initials: "LV", name: "Linda van Wyk", aum: 650000000, clientCount: 310 },
  { initials: "DG", name: "David Greenberg", aum: 467726572, clientCount: 270 },
]
// Total: R 3,667,726,572 (matches current totalAUM)
```

---

### 4. Update AdvisorFilter to Use Context

**File**: `src/components/dashboard/AdvisorFilter.tsx`

Change from local state to context state:

```typescript
export const AdvisorFilter = () => {
  const { 
    regionalData, 
    selectedAdvisors, 
    setSelectedAdvisors 
  } = useRegion();
  
  // Remove local useState for selectedAdvisors
  // Use context state instead
};
```

---

### 5. Update Dashboard to Use Filtered Data

**File**: `src/pages/Dashboard.tsx`

Change to use filtered data:

```typescript
const { 
  selectedRegion, 
  setSelectedRegion, 
  filteredRegionalData  // Use this instead of regionalData
} = useRegion();

// All widgets now render from filteredRegionalData
```

---

## Data Filtering Logic

### When advisors are selected/deselected:

| Widget | Filtering Behavior |
|--------|-------------------|
| **Provider View** | Aggregate values based on selected advisors' proportional shares |
| **AUM by Product** | Sum AUM from selected advisors; recalculate product percentages |
| **Top 5 Accounts** | Show only accounts managed by selected advisors |
| **Birthdays** | Show only clients assigned to selected advisors |
| **Clients by Value** | Aggregate investor counts and values for selected advisors |

### Calculation Example:

If Johan Botha (JB) has 26.7% of practice AUM and is the only selected advisor:
- totalAUM: R 980,000,000 (JB's portion)
- providers: Each provider value × 26.7%
- topAccounts: Only JB's assigned accounts
- birthdays: Only JB's clients
- clientsByValue: Only JB's client tiers

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/data/regionalData.ts` | Add per-advisor AUM/client data, add `getFilteredRegionalData` function, assign data points to specific advisors |
| `src/contexts/RegionContext.tsx` | Add `selectedAdvisors` state, add `setSelectedAdvisors`, add `filteredRegionalData` computed value |
| `src/components/dashboard/AdvisorFilter.tsx` | Use context state instead of local state |
| `src/pages/Dashboard.tsx` | Use `filteredRegionalData` instead of `regionalData` |

---

## Result

- Selecting/deselecting advisors immediately updates all dashboard numbers
- All jurisdictions (ZA, AU, CA, GB, US) have unique advisor data
- Region changes reset advisor selection to all selected
- Data is proportionally calculated based on each advisor's book of business
- Visual feedback shows which advisors are selected (existing pill display)

