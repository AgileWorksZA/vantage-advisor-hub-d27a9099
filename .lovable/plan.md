

## Make 30% of Clients Show as Green (Routine) Status

### Problem
Currently, all clients generate urgent and/or important opportunity gaps based on their product mix, so very few (if any) clients appear as green/routine status in the Client Opportunities widget and the Clients list.

### Solution
Add a deterministic "green client" check using the existing `seededRandom` pattern. For ~30% of clients (based on a hash of their client ID), filter out all urgent and important opportunity types from `buildGapOpportunities`, leaving only routine gaps (Upsell, Migration, Bank Scrape). This ensures these clients consistently appear as green across the entire application.

### How It Works
- A new exported utility function `isGreenClient(clientId: string): boolean` will use the same seeded random approach (hash of clientId) to deterministically return `true` for ~30% of client IDs
- This function will be called inside `buildGapOpportunitiesForProducts` (or at the call sites) to filter out urgent/important gap types
- Because the check is deterministic and based on client ID, the same clients will always be green regardless of where the check runs

### Changes

**File: `src/components/client-detail/next-best-action/OpportunitiesTab.tsx`**

- Add and export `isGreenClient(clientId: string): boolean` utility using a simple hash (same pattern as `seededRandom` in regional360ViewData)
- Returns `true` when hash-derived value < 0.3 (30% of clients)
- Modify `buildGapOpportunitiesForProducts` to accept an optional `clientId` parameter
- When `clientId` is provided and `isGreenClient(clientId)` is true, filter the generated gaps to only include routine types (Upsell, Migration, Bank Scrape)
- Update `buildGapOpportunities` signature to pass `clientId` through

**File: `src/hooks/useClientOpportunityCategories.ts`**

- Pass `client.id` to `buildGapOpportunities` in `categorizeClient`

**File: `src/pages/Clients.tsx`**

- Pass `client.id` to `buildGapOpportunities` in `getClientDotClass`

**File: `src/pages/ClientDetail.tsx`**

- Pass `clientId` to `buildGapOpportunities` in the status dot color computation

**File: `src/components/client-detail/ClientSummaryTab.tsx`**

- Pass `clientId` to `buildGapOpportunities` call

### Result
- ~30% of clients across all jurisdictions will show only routine (green) opportunities
- The selection is consistent and deterministic per client ID
- All views (dashboard widget, clients list, client detail) will reflect the same green status

| File | Action |
|------|--------|
| `src/components/client-detail/next-best-action/OpportunitiesTab.tsx` | Edit - add `isGreenClient`, update gap builder to filter |
| `src/hooks/useClientOpportunityCategories.ts` | Edit - pass clientId to buildGapOpportunities |
| `src/pages/Clients.tsx` | Edit - pass clientId to buildGapOpportunities |
| `src/pages/ClientDetail.tsx` | Edit - pass clientId to buildGapOpportunities |
| `src/components/client-detail/ClientSummaryTab.tsx` | Edit - pass clientId to buildGapOpportunities |

