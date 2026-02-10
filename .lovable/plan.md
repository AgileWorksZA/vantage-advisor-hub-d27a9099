

## Move Jurisdiction & Advisor Settings to Mobile-Only with Scoped Context

### Overview

Remove the "User Setup" section from the web Account Settings page and add jurisdiction/advisor selection back into the mobile Settings menu. Crucially, changes made in mobile settings will only affect the mobile tabs (Today, Clients, Tasks, Insights, AI) -- they won't alter the web view's region or advisor filters.

### How It Works

The mobile app will get its own independent `RegionContext` provider that wraps all mobile content. This means when `useRegion()` is called inside any mobile tab or settings screen, it reads/writes mobile-specific state (stored under separate localStorage keys). The web app's global region and advisor selections remain untouched.

### Changes

| File | Action |
|------|--------|
| `src/contexts/RegionContext.tsx` | Export the raw `RegionContext` so it can be re-provided |
| `src/contexts/MobileRegionProvider.tsx` | **New file** -- a lightweight provider that supplies mobile-scoped region/advisor state using the same `RegionContext`, with its own localStorage keys (`vantage-mobile-region`, `vantage-mobile-advisor-selections`) |
| `src/components/mobile/MobileApp.tsx` | Wrap entire component tree with `MobileRegionProvider` |
| `src/components/mobile/MobileSettingsMenu.tsx` | Add back jurisdiction selector (flags + checkmarks) and advisor multi-select filter, styled for mobile layout |
| `src/pages/AccountSettings.tsx` | Remove the "User Setup" section (id `"setup"`) from `settingsSections` array, remove the `activeSection === "setup"` rendering block, and clean up unused imports |

### Technical Details

**MobileRegionProvider** (`src/contexts/MobileRegionProvider.tsx`):
- Provides the same `RegionContextType` interface as the global provider
- Uses independent localStorage keys so mobile and web don't interfere
- Includes all derived values: `regionalData`, `filteredRegionalData`, `currencySymbol`, `formatCurrency`, `opportunities`
- Reuses helper functions (`getRegionalData`, `getFilteredRegionalData`, `getRegionalOpportunities`) from `regionalData.ts`
- Defaults to "ZA" with all advisors selected, same as the global provider

**MobileSettingsMenu** additions:
- Jurisdiction section: flag icons with country names, checkmark on selected, calls `setSelectedRegion` from context
- Advisor section: initials badges with full names, "Select All / Deselect All" toggle, checkmarks on selected advisors
- Both sections appear between the user info block and the existing menu items (Dark Mode, AI, etc.)
- Respects `isJurisdictionRestricted` by disabling jurisdiction rows when restricted

**Scoping guarantee**: Since React uses the nearest context provider, all `useRegion()` calls inside `MobileApp` will resolve to the mobile provider. The web app's `RegionProvider` at the app root remains unaffected.
