

## Show Loading State in Widgets Instead of Layout Rearrangement

### Problem
When the dashboard loads, widgets initially render in their default grid positions with full content, then abruptly rearrange to the user's saved layout once it loads from the database. This causes a jarring visual "swap" effect.

### Solution
Instead of rendering widget content during layout loading, show skeleton placeholders inside each widget card. The grid will use the default layout positions (which is fine since they'll just be grey loading cards), and once the saved layout loads, the skeletons are replaced with real content already in the correct positions.

### Changes

**1. `src/pages/Dashboard.tsx` -- Add loading skeletons to adviser dashboard**

- When `layoutLoading` is true, render each visible widget card with its header (title + drag handle) but replace the `CardContent` with a `Skeleton` placeholder
- This keeps the grid structure stable while clearly indicating data is loading
- Once `layoutLoading` is false, render the normal widget content

**2. `src/components/client-detail/ClientDashboardTab.tsx` -- Add loading skeletons to client dashboard**

- Same pattern: when `layoutLoading` is true, render skeleton cards instead of full widget content
- Each skeleton card matches the widget card structure (CardHeader with title, CardContent with Skeleton block)

### Technical Approach

Both dashboards will use the same pattern. Each widget render block changes from:

```text
{isWidgetVisible('widget-id') && <div key="widget-id">
  <Card>
    <CardHeader>...</CardHeader>
    <CardContent>...full content...</CardContent>
  </Card>
</div>}
```

to:

```text
{isWidgetVisible('widget-id') && <div key="widget-id">
  <Card>
    <CardHeader>...title + drag handle...</CardHeader>
    <CardContent>
      {layoutLoading ? (
        <Skeleton className="w-full h-full min-h-[200px]" />
      ) : (
        ...full content...
      )}
    </CardContent>
  </Card>
</div>}
```

The `Skeleton` component from `src/components/ui/skeleton.tsx` is already available in the project.

### Files

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Import Skeleton, wrap each widget's CardContent in a layoutLoading check |
| `src/components/client-detail/ClientDashboardTab.tsx` | Import Skeleton, wrap each widget's CardContent in a layoutLoading check |
