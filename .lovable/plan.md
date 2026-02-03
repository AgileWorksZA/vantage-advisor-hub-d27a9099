
# Filter Clients by Region and Selected Advisors

## Overview

Currently, the Clients page shows all clients regardless of the selected region and advisors. This plan implements filtering so that only clients whose assigned advisor matches the selected advisors in the top bar are visible.

## Problem

The user selects a jurisdiction (e.g., South Africa) and specific advisors (e.g., Johan Botha, Sarah Mostert) in the header. However, the clients list shows all clients from all regions instead of filtering to only show clients belonging to those selected advisors.

## Solution

Add advisor filtering to the `useClients` hook and/or the Clients page by:
1. Consuming the `RegionContext` to get the selected advisors and regional advisor data
2. Filtering the fetched clients to only show those whose `advisor` field matches the names of selected advisors

## Technical Approach

### 1. Update Clients Page to Use Region Context

**File: `src/pages/Clients.tsx`**

Import and use the `useRegion` hook to access:
- `regionalData.advisors` - The list of advisors for the current region
- `selectedAdvisors` - The initials of currently selected advisors

```typescript
import { useRegion } from "@/contexts/RegionContext";

// Inside Clients component
const { regionalData, selectedAdvisors } = useRegion();
```

### 2. Create Advisor Name Mapping

Map selected advisor initials to their full names for filtering:

```typescript
// Get the full names of selected advisors
const selectedAdvisorNames = useMemo(() => {
  return regionalData.advisors
    .filter(advisor => selectedAdvisors.includes(advisor.initials))
    .map(advisor => advisor.name);
}, [regionalData.advisors, selectedAdvisors]);
```

### 3. Add Advisor Filtering to Client Filter Logic

Update the `filteredClients` computation to include advisor filtering:

```typescript
const filteredClients = clients.filter((client) => {
  // Filter by selected advisors (region-based)
  if (selectedAdvisorNames.length > 0) {
    // If no advisor matches, hide the client
    if (!client.advisor || !selectedAdvisorNames.includes(client.advisor)) {
      return false;
    }
  }
  
  // ... existing filter logic continues
});
```

### 4. Handle Edge Cases

- **No advisors selected**: If the user deselects all advisors, show no clients (or show empty state)
- **Clients with no advisor**: Clients without an assigned advisor won't match and will be hidden (correct behavior)
- **Mixed region clients**: Only clients assigned to advisors in the current region will appear

## Visual Flow

```text
User Flow:
1. User selects "South Africa" in region selector
   → Regional advisors: JB, SM, PN, LV, DG
   
2. User selects Johan Botha (JB) and Sarah Mostert (SM) in advisor filter
   → selectedAdvisors: ["JB", "SM"]
   → selectedAdvisorNames: ["Johan Botha", "Sarah Mostert"]
   
3. Clients list filters:
   → Only shows clients where advisor = "Johan Botha" OR advisor = "Sarah Mostert"
   → Clients from other regions or with other advisors are hidden
```

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/Clients.tsx` | **Modify** | Import `useRegion`, add advisor filtering logic |

## Implementation Details

### Filter Logic Addition

The filtering will be added to the existing `filteredClients` computation (around line 243):

```typescript
// Filter clients based on active filter, search query, dashboard widget filter, AND selected advisors
const filteredClients = clients.filter((client) => {
  // NEW: Filter by selected advisors from region context
  if (selectedAdvisorNames.length > 0) {
    if (!client.advisor || !selectedAdvisorNames.includes(client.advisor)) {
      return false;
    }
  }
  
  // EXISTING: Dashboard widget filter
  if (filteredNames.length > 0) {
    // ... existing logic
  }
  
  // EXISTING: Profile type filter
  if (!filterSource) {
    // ... existing logic
  }
  
  // EXISTING: Inactive state filter
  if (!includeInactive && client.profileState === "Inactive") return false;
  
  // EXISTING: Search query filter
  if (searchQuery) {
    // ... existing logic
  }
  
  return true;
});
```

### Dependency Updates

The `useMemo` for `selectedAdvisorNames` will need these dependencies:
- `regionalData.advisors` - Changes when region changes
- `selectedAdvisors` - Changes when user toggles advisors

## Expected Behavior After Implementation

| Scenario | Expected Result |
|----------|----------------|
| ZA selected, all advisors selected | Shows only clients with ZA advisors (Johan Botha, Sarah Mostert, etc.) |
| ZA selected, only JB selected | Shows only clients assigned to "Johan Botha" |
| AU selected, all advisors selected | Shows only clients with AU advisors (James Mitchell, Sarah Thompson, etc.) |
| No advisors selected | Shows no clients (empty state) |
| Client has no advisor | Client is hidden from list |

## Notes

- The `clients` table already has an `advisor` column with full names
- The regional data provides the mapping between initials and full names
- This approach is reactive - changing the advisor filter immediately updates the client list
