

# Convert Profile Type Filters to Multi-Select with Tags

## Overview
Transform the single-select filter tabs (Lead, Prospect, Client, Shared Clients, Incomplete Profile, Deceased) into a multi-select dropdown matching the style of the existing "Client types" dropdown. Display removable tags below when filters are active, and only show "Reset Filters" inline with those tags when any tags are visible.

## Changes

### File: `src/pages/Clients.tsx`

**1. Replace single-select state with multi-select state**
- Change `activeFilter` (single string) to `selectedProfileFilters` (string array), defaulting to all options selected.

**2. Create profile filter options array**
- Replace `filterTabs` with a `profileFilterOptions` array in the same `{ value, label }` format as `clientTypeOptions`:
  ```
  Lead, Prospect, Client, Shared Clients, Incomplete Profile, Deceased
  ```

**3. Replace the filter tabs row (lines 370-393)**
- Remove the row of single-select buttons.
- Add a new `MultiSelect` dropdown (same component used for Client types) for profile filters, placed next to the existing "Client types" dropdown in the row with "Reports" button (lines 441-456).

**4. Add profile filter tags below client type tags**
- Below the existing client type filter tags section, add a similar tags row for profile filters -- showing removable Badge tags when not all profile filters are selected.

**5. Move "Reset Filters" to be inline with tags**
- Remove the standalone "Reset Filters" link (lines 414-433).
- Only show "Reset Filters" when any filter tags are visible (either client type or profile type tags are showing).
- Display it inline at the end of the tags row(s).
- Keep the "Include inactive clients" switch in a separate row.

**6. Update filtering logic (lines 197-246)**
- Replace the single `activeFilter` comparisons (lines 224-228) with multi-select logic: check if `client.profileType` is included in `selectedProfileFilters` (when not all are selected).
- Handle "Shared Clients", "Incomplete Profile", and "Deceased" as special filters that check different client fields.

## Layout After Changes

```text
[+ Add Profile button right-aligned]

[Include inactive clients toggle]

RECENTLY VIEWED / SEARCH RESULTS    [Reports] [Profile status v] [Client types v]

Filtered by: [Lead x] [Client x] [Individual x] [Trust x]  Reset Filters
```

- The "Filtered by:" row with tags and "Reset Filters" only appears when at least one filter is not fully selected (i.e., some tags to show).
- Both profile and client type tags appear in the same row.

