

## Move Jurisdiction & Advisor Selection to Account Settings

### Overview

Remove the jurisdiction and advisor selection sections from the mobile Settings menu and add them as a new "User Setup" section in the Account Settings page, accessible from both web and mobile.

### Changes

**File: `src/pages/AccountSettings.tsx`**

1. Add a new settings section entry in the `settingsSections` array:
   ```
   { id: "setup", label: "User Setup", icon: Globe }
   ```
   Position it as the first item so it's prominent.

2. Import `regions` from `@/components/dashboard/RegionSelector` and additional icons (`Check`, `Users` -- already has `Users` imported as icon).

3. Pull `selectedRegion`, `setSelectedRegion`, `regionalData`, `selectedAdvisors`, `setSelectedAdvisors`, `isJurisdictionRestricted` from `useRegion()` (already partially imported).

4. Add a new `activeSection === "setup"` block rendering:
   - **Jurisdiction Card**: Lists the 5 regions with flag images and checkmarks, calls `setSelectedRegion` on tap. Disabled with a note when `isJurisdictionRestricted`.
   - **Advisor Filter Card**: Lists advisors for the current region with initials badges. Includes a "Select All / Deselect All" toggle. Tapping toggles individual advisors via `setSelectedAdvisors`.

**File: `src/components/mobile/MobileSettingsMenu.tsx`**

5. Remove the Jurisdiction Selector section (the `border-b` block with Globe icon and region list).
6. Remove the Advisor Filter section (the `border-b` block with Users icon and advisor list).
7. Remove now-unused imports: `Globe`, `Users`, `Check`, `regions` from RegionSelector, and the `useRegion` destructured properties that are no longer used locally (`regionalData`, `selectedAdvisors`, `setSelectedAdvisors`, `isJurisdictionRestricted`). Keep `selectedRegion` and `setSelectedRegion` only if still used elsewhere in the file (they are not after removal), so clean those too.

### Summary

| File | Action |
|------|--------|
| `src/pages/AccountSettings.tsx` | Add "User Setup" section with jurisdiction & advisor selectors |
| `src/components/mobile/MobileSettingsMenu.tsx` | Remove jurisdiction & advisor sections and unused imports |

