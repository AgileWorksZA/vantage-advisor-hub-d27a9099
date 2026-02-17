

## Add Growth Metrics to AUM by Product Widget

### Overview
Add growth percentage indicators (1 Month, 6 Months, YTD) to each product row in the AUM by Product widget legend area, with a period toggle to switch between the three timeframes.

### Data Changes

**File: `src/data/regionalData.ts`**

- Extend the `ProductData` interface to include growth metrics:
  ```typescript
  export interface ProductData {
    name: string;
    value: number;
    color: string;
    growth1m?: number;   // e.g. 1.2 means +1.2%
    growth6m?: number;
    growthYtd?: number;
  }
  ```
- Add deterministic growth values to every product entry across all 5 regions (ZA, AU, CA, UK, US). Values will vary by product -- some positive, some negative -- to look realistic.

### Widget UI Changes

**File: `src/pages/Dashboard.tsx`**

- Add a small period toggle (1M | 6M | YTD) below the pie chart, using inline pill-style buttons
- Add local state: `const [aumGrowthPeriod, setAumGrowthPeriod] = useState<'1m' | '6m' | 'ytd'>('1m')`
- Update the product legend rows to show a growth badge next to each product name:
  - Green text with up arrow for positive growth
  - Red text with down arrow for negative growth
  - Format: "+2.3%" or "-1.1%"
- Layout: each legend row becomes `[color dot] [product name] [growth badge]`

### Visual Design
- Period toggle: small text buttons with active state highlight, placed between chart and legend
- Growth badges: compact, colored text (green/red) with a tiny arrow icon, no background
- Keeps existing pie chart and total AUM display unchanged

### Files

| File | Action |
|------|--------|
| `src/data/regionalData.ts` | Edit - extend ProductData interface, add growth values to all regions |
| `src/pages/Dashboard.tsx` | Edit - add period toggle state, render growth badges in legend |

