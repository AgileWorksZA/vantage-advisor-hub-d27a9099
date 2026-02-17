

## Remove Spacing Between Numbers/Headings and Sparklines

### Problem
The sparkline SVGs have visible spacing separating them from the number or heading they refer to. The user wants the sparkline to sit flush against its associated text (e.g. `$ 4,650,000,000{sparkline}` with no gap).

### Solution
Change `gap-0.5` to `gap-0` on all four sparkline heading rows in `src/pages/Dashboard.tsx`. This removes the flex gap so the sparkline SVG sits immediately next to the number/heading text.

### Changes in `src/pages/Dashboard.tsx`

| Location | Line | Widget |
|----------|------|--------|
| Line 346 | `gap-0.5` to `gap-0` | Provider View (AUM heading) |
| Line 417 | `gap-0.5` to `gap-0` | Top 5 Accounts heading |
| Line 490 | `gap-0.5` to `gap-0` | AUM by Product heading |
| Line 647 | `gap-0.5` to `gap-0` | Clients by Value heading |

Single file, four one-word changes.

