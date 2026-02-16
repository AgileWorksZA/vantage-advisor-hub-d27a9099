

## Fix Client Dashboard Widget Sizing

### Problem
Two issues are causing the widget sizing mismatch with the Advisor Dashboard:

1. **Layout persistence collision**: Both the Advisor Dashboard and Client Dashboard use `pageId: 'dashboard'` in `useWidgetLayout`, so they share the same saved layout row in the database. A layout saved on one page corrupts the other.

2. **Card styling mismatch**: Client Dashboard cards use `className="border-0 shadow-sm h-full"` instead of the Advisor Dashboard's standard `className="h-full"`.

### Changes

**1. `src/hooks/useWidgetLayout.ts`**
- Expand the `pageId` union type from `'dashboard' | 'insights'` to `'dashboard' | 'insights' | 'client-dashboard'`

**2. `src/components/client-detail/ClientDashboardTab.tsx`**
- Change `pageId` from `'dashboard'` to `'client-dashboard'` so it gets its own persisted layout
- Change all Card classNames from `"border-0 shadow-sm h-full"` to `"h-full"` to match Advisor Dashboard styling exactly
- Add the `X` close button to each widget card header (matching Advisor Dashboard pattern)

### Technical Detail

The `useWidgetLayout` hook stores layout per `(user_id, page_id)` in the `user_widget_layouts` table. By giving the client dashboard its own `page_id`, the two dashboards will no longer interfere with each other.

| File | Change |
|------|--------|
| `src/hooks/useWidgetLayout.ts` | Add `'client-dashboard'` to pageId union |
| `src/components/client-detail/ClientDashboardTab.tsx` | Fix pageId, card styling, add close buttons |

