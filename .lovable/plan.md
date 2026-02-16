

## Align Client Dashboard Widgets with Adviser Dashboard

### Problem
The two new widgets (`advisor-accounts` and `outstanding-docs`) on the Client Dashboard use `h: 2` (240px), while every widget on the Adviser Dashboard uses `h: 3` (360px). This creates inconsistent card sizes across dashboards. Font sizes in the table widgets also need minor alignment with the Adviser Dashboard's table styling conventions.

### Changes

**1. `src/components/client-detail/ClientDashboardTab.tsx`**

- Change `advisor-accounts` height from `h: 2` back to `h: 3` to match all other widgets on both dashboards
- Change `outstanding-docs` height from `h: 2` back to `h: 3`
- Align table cell font sizes from `text-sm` to match the Adviser Dashboard pattern (plain table with `text-sm` wrapper, `text-xs` headers with `font-normal`, `py-2` row padding instead of `py-1.5`)

Updated layout entries:
```
{ i: 'advisor-accounts', x: 6, y: 6, w: 3, h: 3 }
{ i: 'outstanding-docs', x: 0, y: 9, w: 3, h: 3 }
```

Table styling adjustments (to match Adviser Dashboard conventions):
- Table headers: keep `text-xs`, add `font-normal` (matches `Provider View` / `Top 5 Accounts`)
- Table cells: keep `text-sm`, change `py-1.5` to `py-2` (matches adviser table row padding)
- Use `px-4 pb-4` on `CardContent` instead of `p-0` (matches adviser widget card content padding)

**2. Database cleanup**

Delete stale `client-dashboard` layout row so the corrected `h: 3` defaults take effect. The auto-heal `needsHeightMigration` logic will prevent this recurring.

### Files

| File | Change |
|------|--------|
| `src/components/client-detail/ClientDashboardTab.tsx` | Restore `h: 3` for both new widgets; align table font sizes and padding |
| Database | Delete stale `client-dashboard` layout row |

