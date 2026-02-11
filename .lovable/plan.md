

## Keep Existing Opportunities and Tag New Ones

### Problem
Currently in `OpportunitiesTab.tsx`, line 135 uses an either/or approach: if there are `PrepOpportunity` items (from scans), gap opportunities are skipped entirely. This means scanning replaces the original gap-based opportunities instead of adding to them.

### Solution
Merge both lists: always build gap opportunities from products, then prepend scan-generated opportunities at the top with a "New" tag.

### Changes

#### `src/components/client-detail/next-best-action/OpportunitiesTab.tsx`

1. **Always build gaps**: Remove the conditional on line 135. Always call `buildGapOpportunities(products, householdView)` regardless of whether `opportunities` (scan results) exist.

2. **Render a single merged list**: Instead of two separate render paths (lines 146-176 for scan items, lines 179-206 for gaps), combine into one list:
   - Scan-generated opportunities at the top, each with a "New" badge
   - Gap opportunities below

3. **Add "New" tag**: Add a small green/blue badge reading "New" next to scan-generated opportunity badges:
   ```
   <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] px-1 py-0">New</Badge>
   ```

4. **Update `getOpportunitiesCount`**: Count should be scan opportunities + gap opportunities combined.

#### `src/components/client-detail/ClientSummaryTab.tsx`

- No changes needed -- scan opportunities are already accumulated via `setScanOpportunities(prev => [...prev, ...newOpps])`.

### Technical Summary

| File | Change |
|------|--------|
| `OpportunitiesTab.tsx` | Always build gaps; merge scan + gap lists; add "New" tag to scan items; single render path |

