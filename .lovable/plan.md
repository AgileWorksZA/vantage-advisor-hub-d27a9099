

## Remove Decimals from Widget Headings & Close Sparkline Gap

### Overview
Two changes across all dashboard widgets:
1. Remove decimal places from the large AUM/value numbers in widget headings (e.g., `$ 5,572,649,990.00` becomes `$ 5,572,649,990`)
2. Remove remaining whitespace between the heading number and the sparkline SVG

### Changes

#### 1. `src/data/regionalData.ts`

**Update `formatAUM` helper** (line ~99-101): Change from 2 decimal places to 0:
```typescript
function formatAUM(value: number): string {
  return value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
```

**Update static `totalAUM` strings** for all 5 regions to remove decimals:
- South Africa: `"3,667,726,572.38"` to `"3,667,726,572"`
- Australia: `"4,389,625,872.00"` to `"4,389,625,872"`
- Canada: `"5,572,649,990.00"` to `"5,572,649,990"`
- United Kingdom: `"2,847,392,156.00"` to `"2,847,392,156"`
- United States: `"5,572,649,990.00"` to `"5,572,649,990"`

#### 2. `src/pages/Dashboard.tsx`

**Close sparkline gap** in all 4 widget headers -- change `gap-1` to `gap-0.5` to bring sparklines right next to the last digit:

- Provider View header (line ~351)
- Top 5 Accounts header (line ~422)
- AUM by Product header (line ~495)
- Clients by Value header (line ~652)

### Files

| File | Action |
|------|--------|
| `src/data/regionalData.ts` | Edit `formatAUM` function and 5 static `totalAUM` strings |
| `src/pages/Dashboard.tsx` | Edit 4 header flex containers from `gap-1` to `gap-0.5` |
