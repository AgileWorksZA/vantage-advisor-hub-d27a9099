

## Fix "Clients by Age Group" Widget -- Proper Sizing

### Problem
With `h: 4` (480px), the 8 age-group rows + table header + card header still overflow the card boundary. The content is visibly rendering outside the widget box.

### Approach
Increase the widget height to `h: 5` (600px) so all 8 age-group rows fit comfortably without scrollbars or overflow. The Card and CardContent will keep standard styling (no overflow/scroll classes).

### Technical Changes

**File: `src/pages/Dashboard.tsx`**

1. Update height in `defaultDashboardLayout`:
```
// Before
{ i: 'age-groups', x: 3, y: 6, w: 3, h: 4 }

// After
{ i: 'age-groups', x: 3, y: 6, w: 3, h: 5 }
```

2. No other changes needed -- the Card and CardContent already use standard classes (`h-full` and `px-4 pb-4`).

### Why h: 5
- Each row is roughly 36px (py-1.5 + border)
- 8 data rows = ~288px
- Table header = ~24px
- Card header = ~48px
- Card padding = ~16px
- Total needed: ~376px minimum, but with comfortable spacing ~450-500px
- `h: 5` = 5 x 120px = 600px, which provides enough room for all content with comfortable spacing
- The auto-heal logic in `useWidgetLayout.ts` will automatically migrate saved user layouts

