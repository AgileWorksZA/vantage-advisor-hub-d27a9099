

## Add Small Spacer Before Growth Indicators

The sparkline SVGs were removed but the `gap-0` on the flex containers means the growth percentage indicators are flush against the numbers. A small spacer (`gap-1.5`) will be added to each of the four widget header rows.

### Changes in `src/pages/Dashboard.tsx`

| Line | Current | New |
|------|---------|-----|
| 347 | `gap-0` | `gap-1.5` |
| 415 | `gap-0` | `gap-1.5` |
| 485 | `gap-0` | `gap-1.5` |
| 639 | `gap-0` | `gap-1.5` |

These are the Provider View, Top 5 Accounts, AUM total, and Clients by Value widget headers respectively.

