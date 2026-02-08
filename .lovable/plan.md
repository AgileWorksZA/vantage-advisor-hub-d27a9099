
# Fix Client Search Autocomplete and Add Advisor/Jurisdiction Filtering

## Problem
The client search autocomplete dropdown (used in the top bar and email compose To/CC/BCC fields) is currently broken and does not filter results by the selected advisors or jurisdiction. Every search shows ALL clients from the database regardless of which advisors are selected in the top bar filter or which jurisdiction is active.

## Root Cause
The `ClientAutocompleteDropdown` and `InlineClientSearch` components both call `useClients()` directly, which fetches all clients from the database without any region or advisor filtering. The Clients page applies filtering separately using `useRegion()` context, but the autocomplete components never received this logic.

## Solution
Add advisor-based filtering to the `ClientAutocompleteDropdown` component so that only clients belonging to the currently selected advisors (within the active jurisdiction) appear in search results. This single change will propagate to all places the dropdown is used: the global header search bar, the email compose To/CC/BCC fields, and the ComposeToField component.

## Changes

### 1. `src/components/clients/ClientAutocompleteDropdown.tsx`
- Import `useRegion` from `RegionContext`
- Derive the list of selected advisor full names from `regionalData.advisors` and `selectedAdvisors`
- Add a filter step in the `filteredClients` memo that excludes clients whose `advisor` field does not match any selected advisor name
- This ensures every instance of `ClientAutocompleteDropdown` (header, To, CC, BCC) automatically respects the global filter

### 2. `src/components/email/InlineClientSearch.tsx`
- Import `useRegion` from `RegionContext`
- Derive selected advisor names the same way
- Add a filter step in the `filteredClients` memo to exclude clients not assigned to a selected advisor
- This ensures the "Link Client" popover in email compose also respects the filter

## Technical Details

### Filtering Logic (applied in both components)
```text
1. Get regionalData.advisors and selectedAdvisors from useRegion()
2. Map selectedAdvisors (initials) to full names via regionalData.advisors
3. In the filter:
   - If selectedAdvisorNames has entries, exclude clients where
     client.advisor is missing OR not in selectedAdvisorNames
   - This matches the exact pattern used on the Clients page (lines 276-282)
```

### Scope of Impact
- **Global header search bar** (AppHeader) -- uses ClientAutocompleteDropdown
- **Email Compose "To" field** (ComposeEmail) -- uses ClientAutocompleteDropdown
- **Email Compose "CC" field** (ComposeEmail) -- uses ClientAutocompleteDropdown
- **Email Compose "BCC" field** (ComposeEmail) -- uses ClientAutocompleteDropdown
- **ComposeToField component** (ComposeMessageDialog) -- uses ClientAutocompleteDropdown
- **InlineClientSearch** (email client linking popover) -- uses useClients directly

### No API/Database Changes Required
The filtering is done client-side using the existing `advisor` field on `ClientListItem`, matching the pattern already established on the Clients page.
