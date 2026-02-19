

## Remove Last Scrollbar & Add Show More to Top Opportunities Widget

### Problem
The Top Opportunities widget still has `max-h-[220px] overflow-auto` (line 782), which produces a scrollbar. All other list widgets have already been converted to the "Show More" pattern.

### Changes

**File: `src/components/client-detail/ClientDashboardTab.tsx`**

1. **Add state variable** `showAllOpportunities` (boolean, default false) alongside the existing show-all states (~line 134).

2. **Remove scrollbar** from the Top Opportunities container (line 782):
   - Remove `max-h-[220px] overflow-auto` from the div's className.

3. **Truncate list & add toggle** (lines 783-801):
   - Replace `opportunities.slice(0, 5)` with a conditional: show first 3 when collapsed, show all (up to 5) when expanded.
   - After the list div, add the standard "Show More / Show Less" button:
     ```tsx
     {opportunities.slice(0, 5).length > 3 && (
       <Button variant="link" className="p-0 h-auto text-xs"
         onClick={() => setShowAllOpportunities(!showAllOpportunities)}>
         {showAllOpportunities ? "Show less" : `Show ${Math.min(opportunities.length, 5) - 3} more`}
       </Button>
     )}
     ```

This follows the exact same pattern already used for Outstanding Documents, Client Portfolio, and Household Overview widgets.

### Files to Edit
- `src/components/client-detail/ClientDashboardTab.tsx` -- add state, remove overflow, add show-more toggle
