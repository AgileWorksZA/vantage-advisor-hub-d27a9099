

# Recently Viewed Clients with Dynamic Section Headers

## Overview
Create a `client_views` database table to track when clients are viewed, record views from the client detail page, and display recently viewed clients (filtered by selected advisors) as the default view on the Clients tab. The section header changes dynamically:
- **RECENTLY VIEWED** -- default state, no search active
- **SEARCH RESULTS** -- when a search query is entered

The "YOUR CLIENTS" heading is removed entirely.

## Changes

### 1. Database Migration: Create `client_views` table

Create a new table to store client view timestamps per user:

```sql
CREATE TABLE public.client_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups by user, ordered by recency
CREATE INDEX idx_client_views_user_recent ON public.client_views (user_id, viewed_at DESC);

-- Unique constraint to allow upsert (one row per user+client, updated on re-view)
CREATE UNIQUE INDEX idx_client_views_user_client ON public.client_views (user_id, client_id);

-- Enable RLS
ALTER TABLE public.client_views ENABLE ROW LEVEL SECURITY;

-- Users can only see/manage their own views
CREATE POLICY "Users can view own client views" ON public.client_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client views" ON public.client_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client views" ON public.client_views
  FOR UPDATE USING (auth.uid() = user_id);
```

### 2. New Hook: `src/hooks/useRecentlyViewedClients.ts`

Create a hook that:
- Fetches the most recently viewed client IDs for the current user (limited to ~20)
- Provides a `recordView(clientId)` function that upserts a row in `client_views`
- Returns `{ recentClientIds, recordView, loading }`

The upsert uses the unique constraint on `(user_id, client_id)` to update `viewed_at` on repeated views:

```typescript
const { data, error } = await supabase
  .from('client_views')
  .upsert(
    { user_id: userId, client_id: clientId, viewed_at: new Date().toISOString() },
    { onConflict: 'user_id,client_id' }
  );
```

Fetching recent views:
```typescript
const { data } = await supabase
  .from('client_views')
  .select('client_id, viewed_at')
  .eq('user_id', userId)
  .order('viewed_at', { ascending: false })
  .limit(20);
```

### 3. Update ClientDetail Page: Record view on load

**File: `src/pages/ClientDetail.tsx`**

- Import and use `useRecentlyViewedClients`
- Call `recordView(clientId)` in a `useEffect` when the client is successfully loaded
- This ensures every client profile visit is tracked

```typescript
const { recordView } = useRecentlyViewedClients();

useEffect(() => {
  if (client && clientId) {
    recordView(clientId);
  }
}, [client, clientId]);
```

### 4. Update Clients Page: Dynamic heading and recently viewed display

**File: `src/pages/Clients.tsx`**

**a) Import the new hook and fetch recent views:**
```typescript
const { recentClientIds, loading: recentLoading } = useRecentlyViewedClients();
```

**b) Change the section heading logic:**

Replace the current heading (line 427-429):
```typescript
<h2 className="text-[hsl(180,70%,45%)] font-medium">
  {searchQuery ? "SEARCH RESULTS" : "RECENTLY VIEWED"}
</h2>
```

- No search active: show "RECENTLY VIEWED"
- Search active: show "SEARCH RESULTS"

**c) Filter/sort logic:**

When no search is active and no dashboard filter is applied, filter `filteredClients` to only show clients whose IDs appear in `recentClientIds`, and sort them by recency (the order returned from the hook). When a search query is entered, show the full filtered results as today.

```typescript
const displayClients = useMemo(() => {
  if (searchQuery || filterSource) {
    return filteredClients;
  }
  // No search: show only recently viewed, in recency order
  if (recentClientIds.length === 0) return [];
  return recentClientIds
    .map(id => filteredClients.find(c => c.id === id))
    .filter(Boolean);
}, [filteredClients, recentClientIds, searchQuery, filterSource]);
```

Use `displayClients` instead of `filteredClients` in the table rendering and pagination count.

**d) Empty state for no recent views:**

When there are no recently viewed clients (new user or cleared data), show a friendly message:
```
"No recently viewed clients. Search for a client or click a profile to get started."
```

### 5. Advisor filtering integration

The recently viewed list respects the advisor filter naturally because `filteredClients` already filters by selected advisors. The `displayClients` derivation maps `recentClientIds` against `filteredClients`, so only clients belonging to selected advisors will appear -- this works across all jurisdictions.

## Technical Notes

- The `client_views` table uses a unique index on `(user_id, client_id)` to support upsert, keeping only the latest view timestamp per client per user
- RLS ensures users can only see and manage their own view history
- The hook fetches on mount and refetches when the user changes
- The recency order is preserved from the database query and maintained in the display list
- All existing filters (client type, profile type, inactive toggle, advisor filter) continue to work -- they just apply on top of the recently viewed subset when no search is active
- Dashboard widget filters (birthdays, top accounts) bypass the recently viewed logic and show full results as before

