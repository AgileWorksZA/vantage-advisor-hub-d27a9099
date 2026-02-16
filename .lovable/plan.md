

## Fix Corrupted Advisor Dashboard Layout

### Root Cause
When both dashboards previously shared `pageId: 'dashboard'`, the client dashboard wrote its widget IDs (`asset-allocation`, `valuation-change`, etc.) into the same DB row. After the `pageId` split, the advisor dashboard loads this stale layout. The auto-heal mechanism only checks width mismatches for widget IDs that exist in **both** the saved and default layouts -- since the client widget IDs don't exist in the advisor default layout, the check passes and the corrupted layout is used as-is.

React-grid-layout then places the advisor dashboard's children (which have keys like `provider-view`) without matching layout entries, causing them to stack/overlap at position (0,0).

### Changes

**1. `src/hooks/useWidgetLayout.ts` -- Improve auto-heal logic**

Add a check: if the saved layout contains widget IDs that are **not present** in the default layout (i.e., foreign widgets from another page), treat the layout as invalid and reset to defaults. This prevents any future cross-contamination.

Specifically, after the existing `isInvalidLayout` check, add:

```typescript
// Check if saved layout contains widget IDs not in the default layout
const hasForeignWidgets = savedLayout.some(item => !defaultLayoutMap.has(item.i));
```

Then include `hasForeignWidgets` in the condition that triggers auto-heal (reset to defaults and persist).

**2. Database cleanup (one-time)**

Delete the corrupted row for user `fa9f27f6-b772-4edb-b95f-5331c7636e2d` with `page_id = 'dashboard'` so it gets recreated with the correct default layout on next load. (This will be done via a migration or manual SQL.)

### Technical Detail

| File | Change |
|------|--------|
| `src/hooks/useWidgetLayout.ts` | Add `hasForeignWidgets` check to auto-heal logic so unrecognized widget IDs trigger a layout reset |
| Database | Delete the corrupted `user_widget_layouts` row |

