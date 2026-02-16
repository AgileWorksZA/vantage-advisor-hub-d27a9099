

## Fix New Widget Sizing on Client Dashboard

### Problem
The two new widgets ("Current Advisor & Accounts" and "Outstanding Documents") are set to `h: 3` (360px height), matching the chart-based widgets. However, they only contain 2-3 small table rows, resulting in large amounts of empty white space. They need a smaller height to match their content density.

### Changes

**1. `src/components/client-detail/ClientDashboardTab.tsx`**

Update the default heights for the two new widgets from `h: 3` to `h: 2`:

```
{ i: 'advisor-accounts', x: 6, y: 6, w: 3, h: 2 }   // was h: 3
{ i: 'outstanding-docs', x: 0, y: 9, w: 3, h: 2 }    // was h: 3
```

This makes them 240px tall instead of 360px, appropriate for their sparse table content.

**2. Database cleanup**

Delete any saved `client-dashboard` layout row so the corrected defaults take effect on next load. The existing auto-heal logic (which detects height mismatches via `needsHeightMigration`) will also auto-correct any future stale layouts since widget heights are not user-resizable.

### Why this won't recur

The `useWidgetLayout` hook already contains three safeguards:
- **Foreign widget detection**: resets layout if widget IDs from another page are found
- **Width validation**: resets layout if saved widths differ from defaults
- **Height migration**: auto-corrects saved heights to match defaults (since widgets are not resizable)

So if we update the default `h` values and clear the stale DB row, the system will self-heal going forward.

| File | Change |
|------|--------|
| `src/components/client-detail/ClientDashboardTab.tsx` | Change `h: 3` to `h: 2` for `advisor-accounts` and `outstanding-docs` |
| Database | Delete stale `client-dashboard` layout row |

