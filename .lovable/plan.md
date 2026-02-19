

## Revamp Practice Personnel List with Database-Driven, Region-Aware Team Members

### Overview

Replace the hardcoded South African personnel list on the Practice page with a dynamic, database-driven view. The page will show an adviser dropdown filtered by the current jurisdiction, and display team members linked to the selected adviser. All PSG references will be replaced with Vantage branding.

### Changes

#### 1. Replace hardcoded `personnelData` with database-sourced team members

The Practice page currently uses a static `personnelData` array with 6 South African entries. This will be replaced with a query to the `team_members` table, filtered by:
- The current jurisdiction (from `RegionContext`)
- The selected adviser (from a new dropdown)

#### 2. Add adviser dropdown filter

At the top of the Personnel List, add a `Select` dropdown populated with primary advisers from the `team_members` table for the current jurisdiction. When an adviser is selected, only their team members (matching `team_name`) are displayed. The first adviser is auto-selected on load or jurisdiction change.

#### 3. Replace all PSG references

Across the affected files, replace:
- `psg.co.za` email domains with `vantage.co`
- `"PSG Wealth Tygervalley"`, `"PSG Support Team"` with Vantage equivalents
- `"PSG Securities"` section heading and username label
- `"myPSG"` portal references with `"myVantage"`
- `"Planning your wealth with PSG"` with `"Planning your wealth with Vantage"`
- `"PSG Balanced"` fund reference with a generic alternative
- `"PSG Wealth Building Fund"` product reference
- `"PSL Compliance team"` with `"Compliance team"`

#### 4. Make Profile tab jurisdiction-aware

The ProfileTab currently shows SA-specific fields (SA ID number `7905245013084`, phone prefix `27`, address with Province/Western Cape/South Africa). These will adapt based on the selected team member's jurisdiction using helpers from `jurisdiction-utils.ts`.

### Technical Details

**File: `src/pages/Practice.tsx`**

1. Remove the hardcoded `personnelData` array (lines 29-36)
2. Import `useRegion` from `@/contexts/RegionContext` and `useTeamMembers` from `@/hooks/useTeamMembers`
3. Add state for `selectedAdvisorTeam` (string, the team_name of the selected primary adviser)
4. In `PersonnelList`:
   - Filter `teamMembers` by current `selectedRegion` jurisdiction
   - Extract unique primary advisers (where `is_primary_adviser === true`) for the dropdown
   - Add a `Select` dropdown above the table to pick an adviser
   - Display only members whose `team_name` matches the selected adviser's team
   - Auto-select first adviser when jurisdiction changes
5. Update the personnel table columns to show: Name, Role, Email, Team, Status (Active)
6. When clicking a team member, pass their data (including jurisdiction) to `PersonnelSettings`
7. Replace all `psg.co.za` emails with `vantage.co`
8. Replace `"myPSG"` with `"myVantage"` in the Preferences tab
9. Replace `"PSG Securities"` section with `"Trading Platform"` in the Integrations tab
10. Replace `"Planning your wealth with PSG"` with `"Planning your wealth with Vantage"` in the Referrals tab
11. Update the ProfileTab to use jurisdiction-aware ID labels and placeholder data

**File: `src/components/practice/TeamsTab.tsx`**

1. Replace hardcoded `initialTeamsData` with database-driven data from `useTeamMembers`
2. Accept a `jurisdiction` and `advisorTeamName` prop to filter displayed teams
3. Replace PSG team names: `"PSG Wealth Tygervalley"` -> `"Vantage Wealth Tygervalley"`, `"PSG Support Team"` -> `"Vantage Support Team"`

**File: `src/components/practice/ActivityLogTabEnhanced.tsx`**

- Replace `"PSG Securities Ltd Local"` with `"Vantage Securities Local"`
- Replace `"PSG Wealth Building Fund"` with `"Vantage Growth Fund"`

**File: `src/components/client-detail/ClientRecentActivityTab.tsx`**

- Replace `"PSG Wealth Building Fund"` with `"Vantage Growth Fund"`

**File: `src/components/client-detail/ClientNotesTab.tsx`**

- Replace `"Visible on myPSG"` column header with `"Visible on Portal"`

**File: `src/hooks/useClientNotes.ts`**

- Rename `visibleMyPSG` property to `visiblePortal`

**File: `src/components/command-center/PortfolioDriftNudge.tsx`**

- Replace `"PSG Balanced"` with `"Vantage Balanced"`

### Files to Edit
- `src/pages/Practice.tsx` -- major refactor: database-driven, adviser dropdown, PSG removal
- `src/components/practice/TeamsTab.tsx` -- database-driven, remove PSG names
- `src/components/practice/ActivityLogTabEnhanced.tsx` -- replace PSG references
- `src/components/client-detail/ClientRecentActivityTab.tsx` -- replace PSG reference
- `src/components/client-detail/ClientNotesTab.tsx` -- replace myPSG column label
- `src/hooks/useClientNotes.ts` -- rename visibleMyPSG field
- `src/components/command-center/PortfolioDriftNudge.tsx` -- replace PSG fund name

