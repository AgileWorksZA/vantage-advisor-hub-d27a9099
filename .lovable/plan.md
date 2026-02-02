

# Plan: Add Regional Settings Selector to Dashboard Header

## Overview
This plan adds a regional settings button (flag selector) to the right of the notification bell in the dashboard header. Selecting a different country will dynamically update all dashboard data to reflect that region's currency, local providers, client names, and product types.

---

## Current State
- The dashboard header contains: Search, AdvisorFilter, NotificationDropdown, and User info
- All dashboard data is hardcoded as South African data (ZAR currency, SA providers, Afrikaans names)
- Data arrays are defined at the top of `Dashboard.tsx`

---

## Proposed Changes

### 1. Create RegionSelector Component
A new component `src/components/dashboard/RegionSelector.tsx` that:
- Displays a circular flag button showing the currently selected country
- Uses emoji flags for clean, universal display: ZA, AU, CA, GB, US
- Opens a dropdown popover with all 5 country options when clicked
- Stores selected region in state and provides it via callback

### 2. Create Regional Data Configuration
A new data file `src/data/regionalData.ts` containing region-specific data for each of the 5 countries:

**Countries supported:**
- South Africa (default) - ZAR (R)
- Australia - AUD (A$)
- Canada - CAD (C$)
- United Kingdom - GBP (pound)
- United States - USD ($)

**Data per region:**
- **Currency symbol** and formatting
- **Providers** (local custody platforms)
- **Top 5 Accounts** (local names)
- **Birthdays** (culturally appropriate names)
- **Products** (region-specific investment products)
- **Clients by Value** (currency ranges)

### 3. Update Dashboard to Use Regional Data
- Add region state management in `Dashboard.tsx`
- Import and use regional data based on selected region
- Pass region setter to RegionSelector component
- All cards dynamically render based on selected region

---

## Technical Details

### New Files

#### `src/components/dashboard/RegionSelector.tsx`
```typescript
// Core structure
interface Region {
  code: string;        // "ZA", "AU", "CA", "GB", "US"
  name: string;        // "South Africa", etc.
  flag: string;        // Emoji flag
  currencyCode: string; // "ZAR", "AUD", etc.
  currencySymbol: string; // "R", "A$", etc.
}

// Component using Popover similar to AdvisorFilter
// Flag button with dropdown list of countries
// onClick updates parent state via callback
```

#### `src/data/regionalData.ts`
Region-specific data including:

**South Africa (ZA):**
- Currency: R (ZAR)
- Providers: Ninety One, Old Mutual, Allan Gray, Sanlam Glacier, Investec
- Names: Afrikaans/South African (e.g., Van der Merwe, Botha, De Villiers)
- Products: Living Annuity, Endowment, Preservation Fund, Tax-Free Savings

**Australia (AU):**
- Currency: A$ (AUD)
- Providers: Macquarie, AMP, BT Wrap, Colonial First State, Hub24
- Names: Australian (e.g., Smith, Williams, Brown, O'Connor)
- Products: Superannuation, SMSF, Pension Phase, Investment Bond

**Canada (CA):**
- Currency: C$ (CAD)
- Providers: RBC Dominion, TD Direct, CIBC Wood Gundy, BMO Nesbitt Burns, National Bank
- Names: Canadian (e.g., Tremblay, Roy, Gagnon, MacDonald)
- Products: RRSP, TFSA, RRIF, RESP, Non-Registered

**United Kingdom (GB):**
- Currency: pound (GBP)
- Providers: Hargreaves Lansdown, AJ Bell, Interactive Investor, Fidelity, Vanguard UK
- Names: British (e.g., Smith, Jones, Williams, Taylor)
- Products: ISA, SIPP, GIA, Junior ISA, Stocks & Shares ISA

**United States (US):**
- Currency: $ (USD)
- Providers: Fidelity, Charles Schwab, Vanguard, TD Ameritrade, E*TRADE
- Names: American (e.g., Johnson, Williams, Garcia, Martinez)
- Products: 401(k), IRA, Roth IRA, 529 Plan, Brokerage Account

### File Modifications

#### `src/pages/Dashboard.tsx`
1. **Add import** for RegionSelector component and regional data
2. **Add state**: `const [selectedRegion, setSelectedRegion] = useState<string>("ZA")`
3. **Replace hardcoded data** with dynamic data lookup:
   ```typescript
   const currentData = getRegionalData(selectedRegion);
   const { providers, topAccounts, birthdays, products, clientsByValue, currency } = currentData;
   ```
4. **Add RegionSelector** to header between NotificationDropdown and user info:
   ```tsx
   <NotificationDropdown />
   <RegionSelector selectedRegion={selectedRegion} onRegionChange={setSelectedRegion} />
   <div className="flex items-center gap-2">...</div>
   ```
5. **Update currency display** in all value columns to use dynamic currency symbol
6. **Update AUM total** to reflect regional data

---

## Regional Data Samples

### Australia
```typescript
{
  providers: [
    { name: "Macquarie Wrap", bookPercent: "42.1 %", value: "A$ 1,847,293,441" },
    { name: "AMP North", bookPercent: "18.3 %", value: "A$ 803,156,229" },
    { name: "BT Wrap", bookPercent: "15.7 %", value: "A$ 689,321,847" },
    { name: "Colonial First State", bookPercent: "12.4 %", value: "A$ 544,871,203" },
    { name: "Hub24", bookPercent: "11.5 %", value: "A$ 504,983,152" }
  ],
  topAccounts: [
    { investor: "Melbourne Grammar School Foundation", bookPercent: "1.3 %", value: "A$ 57,182,341.50" },
    { investor: "O'Connor, Michael", bookPercent: "1.1 %", value: "A$ 48,347,892.30" },
    ...
  ],
  birthdays: [
    { name: "William James Mitchell", nextBirthday: "3 February", age: 58 },
    { name: "Sarah Elizabeth Thompson", nextBirthday: "3 February", age: 44 },
    ...
  ],
  products: [
    { name: "Superannuation", value: 35.2, color: "hsl(210, 70%, 40%)" },
    { name: "SMSF", value: 22.8, color: "hsl(142, 76%, 36%)" },
    { name: "Pension Phase", value: 18.4, color: "hsl(45, 93%, 47%)" },
    ...
  ]
}
```

### United States
```typescript
{
  providers: [
    { name: "Fidelity Investments", bookPercent: "38.7 %", value: "$ 2,156,842,193" },
    { name: "Charles Schwab", bookPercent: "24.2 %", value: "$ 1,348,291,847" },
    { name: "Vanguard", bookPercent: "19.8 %", value: "$ 1,103,284,621" },
    { name: "TD Ameritrade", bookPercent: "10.1 %", value: "$ 562,947,382" },
    { name: "E*TRADE", bookPercent: "7.2 %", value: "$ 401,283,947" }
  ],
  topAccounts: [
    { investor: "St. Mary's Hospital Foundation", bookPercent: "1.4 %", value: "$ 78,012,493.20" },
    { investor: "Johnson, Robert", bookPercent: "1.2 %", value: "$ 66,847,291.80" },
    ...
  ],
  birthdays: [
    { name: "Michael David Johnson", nextBirthday: "5 February", age: 52 },
    { name: "Jennifer Marie Williams", nextBirthday: "5 February", age: 47 },
    ...
  ],
  products: [
    { name: "401(k)", value: 32.1, color: "hsl(210, 70%, 40%)" },
    { name: "IRA", value: 24.3, color: "hsl(142, 76%, 36%)" },
    { name: "Roth IRA", value: 18.9, color: "hsl(45, 93%, 47%)" },
    ...
  ]
}
```

---

## Visual Design

### Flag Button
- Circular button (same size as notification bell ~36px)
- Shows emoji flag of current country
- Subtle hover effect matching existing header buttons
- Positioned between notification bell and user name

### Dropdown Menu
- Clean popover matching existing design patterns
- Country name with flag emoji for each option
- Check mark or highlight for selected country
- Smooth transition when switching regions

---

## UI Component Structure
```text
Header
|-- Search Input
|-- AdvisorFilter
|-- NotificationDropdown
|-- RegionSelector (NEW)
|   |-- Flag Button (trigger)
|   |-- Popover Content
|       |-- South Africa
|       |-- Australia
|       |-- Canada
|       |-- United Kingdom
|       |-- United States
|-- User Name + Logout
```

---

## Files to Create
1. `src/components/dashboard/RegionSelector.tsx` - Flag dropdown component
2. `src/data/regionalData.ts` - All region-specific data configurations

## Files to Modify
1. `src/pages/Dashboard.tsx` - Integrate region state and dynamic data rendering

