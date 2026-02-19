

## Fix New Widget Sizing: Merge Missing Widgets into Saved Layouts

### Problem
Users who already have a saved dashboard layout in the database are missing the new widgets (`client-portfolio`, `household-overview`, `onboarding-kyc`) in their saved layout. When react-grid-layout encounters children without layout entries, it assigns them minimal default sizes (w:1, h:1), causing them to render as tiny cards.

### Root Cause
The `useWidgetLayout` hook loads saved layouts from the database and uses them as-is. It has auto-heal logic for invalid widths and foreign widgets, but no logic to **add missing widgets** from the default layout when new widgets are introduced.

### Solution

**File: `src/hooks/useWidgetLayout.ts`**

Add a migration step after loading the saved layout that detects any widget IDs present in `defaultLayout` but missing from the saved layout. Append those missing widgets to the saved layout and persist the merged result.

```text
Logic flow:
1. Load saved layout from DB
2. Find widget IDs in defaultLayout that are NOT in savedLayout
3. If any are missing, append their default layout entries to the saved layout
4. Save the merged layout back to DB
5. Set the merged layout as state
```

This runs alongside the existing auto-heal checks (invalid widths, foreign widgets, height migration). The merge happens once -- after the first load the saved layout will contain all widgets, so subsequent loads are clean.

### Technical Detail

In the `fetchLayout` function, after validating the saved layout, add:

```typescript
// Check for new widgets missing from saved layout
const savedIds = new Set(savedLayout.map(item => item.i));
const missingWidgets = defaultLayout.filter(item => !savedIds.has(item.i));

if (missingWidgets.length > 0) {
  const mergedLayout = [...savedLayout, ...missingWidgets];
  setLayout(mergedLayout);
  // persist merged layout
  await supabase.from('user_widget_layouts').upsert({...});
} else {
  setLayout(savedLayout);
}
```

This is placed after the existing `isInvalidLayout` / `hasForeignWidgets` / `needsHeightMigration` checks, in the final `else` branch where the saved layout is considered valid.

### Files to Edit
- `src/hooks/useWidgetLayout.ts` -- add missing-widget merge logic

