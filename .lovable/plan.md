

## Add Jurisdiction and Advisor Settings to Mobile Settings

### What This Does
Adds two new sections to the mobile Settings screen so you can pick your jurisdiction (country) and select which advisors' data to view -- exactly like the flag icon and advisor pills in the web header, but designed for the mobile layout.

### Design

**Jurisdiction Selector**
- A list of country flags with names (South Africa, Australia, Canada, United Kingdom, United States)
- The currently selected jurisdiction shows a checkmark
- Tapping a different country switches the region for the entire app
- If the account is restricted to a specific jurisdiction, the selector is shown but disabled with an explanatory note

**Advisor Filter**
- Shown below the jurisdiction selector
- Lists all advisors for the current jurisdiction with checkboxes
- A "Toggle All" option at the top
- Selecting/deselecting advisors updates the global filter, affecting all data across the app

Both sections use the existing `RegionContext` so changes here immediately affect Dashboard, Clients, Tasks, Calendar, and all other modules.

---

### Technical Details

**File Modified:** `src/components/mobile/MobileSettingsMenu.tsx`

1. Import `useRegion` from `@/contexts/RegionContext` and `regions` from `@/components/dashboard/RegionSelector`
2. Import `Globe, Users, Check` from lucide-react
3. Add a "Jurisdiction" section between the User Info block and the existing menu items:
   - Render each region as a row with flag image, country name, and a Check icon for the selected one
   - On tap, call `setSelectedRegion(code)` from context
   - If `isJurisdictionRestricted`, show rows as non-interactive with a small "(restricted)" note
4. Add an "Advisors" section below Jurisdiction:
   - Pull `regionalData.advisors`, `selectedAdvisors`, `setSelectedAdvisors` from context
   - Render a "Select All" toggle row
   - Render each advisor as a row with their initials badge and full name, with a Check icon when selected
   - Tapping toggles that advisor in/out of the selection

**No new files or database changes required** -- this purely extends the existing mobile UI using the already-available RegionContext.

| File | Action |
|------|--------|
| `src/components/mobile/MobileSettingsMenu.tsx` | Add jurisdiction and advisor sections |

