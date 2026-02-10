

## Default to First Advisor on Jurisdiction Change (Mobile)

### Problem
When changing jurisdiction in mobile settings, the fallback selects all advisors for the new region. Since mobile only supports single-select, this causes an inconsistent state where no single advisor appears selected in the dropdown.

### Solution
Modify `src/contexts/MobileRegionProvider.tsx` to always default to a single advisor (the first one listed) when switching jurisdictions, rather than restoring all advisors.

### Changes

**File: `src/contexts/MobileRegionProvider.tsx`**

1. Update `getAdvisorsForRegion` to return only the first advisor as default instead of all advisors:
   - Change the fallback `return allInitials` to `return [allInitials[0]]` (line 36)
   - When restoring from saved state, also ensure only a single advisor is returned: change `if (valid.length > 0) return valid` to `return [valid[0]]` (line 34)

2. Update the initial state (line 48-50) to also enforce single-select on first load — the same function change handles this automatically.

| File | Action |
|------|--------|
| `src/contexts/MobileRegionProvider.tsx` | Enforce single-advisor default in `getAdvisorsForRegion` |

