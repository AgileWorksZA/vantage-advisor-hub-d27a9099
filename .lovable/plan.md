
# Remove 3-Dot Button and Scroll Bar from Recent Activity

## Overview

Remove the 3-dot menu button (MoreVertical icon) and the ScrollArea wrapper from the Recent Activity card on the client summary tab.

---

## File to Modify

| File | Changes |
|------|---------|
| `src/components/client-detail/ClientSummaryTab.tsx` | Remove MoreVertical button and ScrollArea component |

---

## Change Details

### 1. Remove the 3-dot button (lines 227-229)

Current code:
```tsx
<div className="flex items-center justify-between">
  <CardTitle className="text-lg">Recent Activity</CardTitle>
  <Button variant="ghost" size="icon" className="h-8 w-8">
    <MoreVertical className="w-4 h-4" />
  </Button>
</div>
```

Change to:
```tsx
<CardTitle className="text-lg">Recent Activity</CardTitle>
```

### 2. Remove ScrollArea wrapper (lines 233-257)

Current code:
```tsx
<ScrollArea className="h-[300px] pr-4">
  <div className="space-y-0">
    {/* activity items */}
  </div>
</ScrollArea>
```

Change to:
```tsx
<div className="space-y-0">
  {/* activity items */}
</div>
```

### 3. Clean up unused imports

Remove from imports:
- `MoreVertical` from lucide-react (line 20)
- `ScrollArea` from @/components/ui/scroll-area (line 12)

---

## Result

- The Recent Activity card header will show only the title without the 3-dot menu button
- The activity list will display without a scroll container, showing all 5 items naturally
- Cleaner appearance with no scrollbar visible
