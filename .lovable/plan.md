

## Remove Decimals & Move Sparklines Next to Last Digit

### Overview
Two changes across all dashboard widgets:
1. Remove decimal places from all growth percentages (e.g., `+3.2%` becomes `+3%`)
2. Move sparkline SVGs to appear immediately after the value text (next to the last digit), removing the gap

### Changes in `src/pages/Dashboard.tsx`

**1. Remove decimals** - Change all `.toFixed(1)` to `.toFixed(0)` or `Math.round()`:

| Widget | Lines (approx) | Current | New |
|--------|----------------|---------|-----|
| Provider View - header | ~358 | `providerGrowth.toFixed(1)` | `Math.round(providerGrowth)` |
| Provider View - rows | ~384 | `g.toFixed(1)` | `Math.round(g)` |
| Top 5 Accounts - header | ~429 | `top5Growth.toFixed(1)` | `Math.round(top5Growth)` |
| Top 5 Accounts - rows | ~457 | `g.toFixed(1)` | `Math.round(g)` |
| AUM by Product - header | ~502 | `totalGrowth.toFixed(1)` | `Math.round(totalGrowth)` |
| AUM by Product - legend | ~566 | `growth.toFixed(1)` | `Math.round(growth)` |
| Clients by Value - header | ~659 | `cbvGrowth.toFixed(1)` | `Math.round(cbvGrowth)` |
| Clients by Value - rows | ~685 | `g.toFixed(1)` | `Math.round(g)` |

**2. Move sparklines next to the last digit** - In each widget header, change the layout so the sparkline appears directly after the value with minimal gap (`gap-1` instead of `gap-2`), removing separation between value and sparkline:

- Provider View header (line ~351): `gap-2` to `gap-1`
- Top 5 Accounts header (line ~422): `gap-2` to `gap-1`
- AUM by Product header (line ~495): `gap-2` to `gap-1`
- Clients by Value header (line ~652): `gap-2` to `gap-1`

### Files

| File | Action |
|------|--------|
| `src/pages/Dashboard.tsx` | Edit - update ~12 growth formatting calls and 4 sparkline gap values |

