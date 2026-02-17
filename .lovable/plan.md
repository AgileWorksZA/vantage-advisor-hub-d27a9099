

## Fix Adviser Dashboard Layout Swap

### Root Cause

The `useWidgetLayout` hook sets `loading: false` immediately when `userId` is `undefined`. On the adviser dashboard, `user` starts as `null` (auth hasn't resolved yet), so the hook finishes "loading" instantly with the default layout. Once auth resolves and `userId` becomes available, the hook re-fetches the saved layout, causing the visible swap.

The client dashboard doesn't have this problem because the user is already authenticated by the time that component mounts.

### Solution

Two changes to eliminate the race:

**1. `src/hooks/useWidgetLayout.ts` -- Keep loading=true when userId is undefined**

Change the `!userId` branch to keep `loading` as `true` instead of setting it to `false`. This way, the hook signals "still loading" until it actually has a userId to query with, preventing premature rendering.

```
if (!userId) {
  // Don't set loading to false -- we're still waiting for auth
  return;
}
```

**2. `src/pages/Dashboard.tsx` -- Gate on auth loading too**

Add the auth `loading` state to the skeleton condition so the skeleton grid shows while either auth or layout is loading:

```
{(loading || layoutLoading) ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    ...skeleton cards...
  </div>
) : (
  <DraggableWidgetGrid ...>
```

This ensures the skeleton grid is displayed until both the user session AND the saved layout are fully resolved.

### Files

| File | Change |
|------|--------|
| `src/hooks/useWidgetLayout.ts` | Remove `setLoading(false)` when `userId` is undefined |
| `src/pages/Dashboard.tsx` | Change condition to `loading \|\| layoutLoading` |

