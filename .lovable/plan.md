

## Align Client Opportunities Segments with "Clients by Value" Widget

### Problem
The "Client Opportunities" widget uses 3 hardcoded segments (0-1M, 1M-5M, >5M) that don't match the "Clients by Value" widget which has 5 region-specific segments (e.g. R0-R100k, R100k-R1M, R1M-R3M, R3M-R10M, >R10M for South Africa).

### Solution
Update the Client Opportunities widget and its hook to use the same segments from the regional data (`filteredRegionalData.clientsByValue`), dynamically matching the current jurisdiction's ranges.

### Changes

**File: `src/hooks/useClientOpportunityCategories.ts`**

- Replace the 3 hardcoded segments with dynamic segments derived from the regional `clientsByValue` data
- Accept segment boundaries as a parameter (extracted from the region's `clientsByValue` ranges)
- Parse the range strings to extract numeric boundaries (e.g. "R0 - R100 000" becomes 0-100000)
- Assign each client to the correct segment based on their portfolio value
- Update the matrix return shape to use the dynamic segment labels as keys

**File: `src/components/dashboard/ClientOpportunityStatusWidget.tsx`**

- Read `filteredRegionalData.clientsByValue` to get the current region's segment definitions
- Pass segment boundaries to the hook or compute the matrix using the regional segments
- Update the table rows to iterate over the region's segment ranges instead of the hardcoded 3 rows
- Each row label matches exactly what appears in the "Clients by Value" widget (e.g. "R0 - R100 000", "R100 001 - R1M", etc.)

### Technical Details

The segment matching will work by:
1. Parsing each `clientsByValue` range string to extract lower and upper numeric bounds
2. For each client, computing their total portfolio value from `generateClient360Data`
3. Placing each client into the segment whose bounds contain their portfolio value
4. Building the matrix with segment range labels as row keys

| File | Action |
|------|--------|
| `src/hooks/useClientOpportunityCategories.ts` | Edit - use dynamic region-based segments |
| `src/components/dashboard/ClientOpportunityStatusWidget.tsx` | Edit - read regional segments, update table rows |
