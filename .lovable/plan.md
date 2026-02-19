

## Align Settings Gear with Contracts Dropdown Row

### Change
Move the WidgetSettingsDialog (gear icon) from its own separate row into the same row as the Contracts and Household dropdowns, pushed to the right side.

### Technical Detail

**File:** `src/components/client-detail/ClientDashboardTab.tsx`

1. Remove the separate `<div className="flex justify-end mb-2">` wrapper around `WidgetSettingsDialog` (lines 394-397).
2. Move the `WidgetSettingsDialog` component inside the toolbar div (line 374), after the "Add Member" button.
3. Add `ml-auto` to the `WidgetSettingsDialog` (or wrap it in a `<div className="ml-auto">`) so it aligns to the right end of the row.

The toolbar row will then contain: Contracts dropdown | Household dropdown | Add Member button | (spacer) | Gear icon.

