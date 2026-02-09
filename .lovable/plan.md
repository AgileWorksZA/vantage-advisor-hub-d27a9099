

# Fix Corporate Actions Widget Size

## Problem
The "Upcoming Corporate Actions" widget is set to `w: 3` (350px wide), the same as other widgets. However, it has 6 columns of data (CAID, Investment code, Event type, Affected accounts, Ex date, menu icon), making it too cramped at that width. The reference screenshot shows this as a wider widget.

## Solution
Change the corporate-actions widget to span `w: 6` (two standard widget widths = 700px) so the table columns have room to breathe. This also better matches the reference design. Additionally, add `overflow-hidden` to the card content to prevent any content from breaking the grid cell boundaries.

## Technical Changes

### `src/pages/Dashboard.tsx`
- Update `defaultDashboardLayout`: change `corporate-actions` from `w: 3` to `w: 6` to span two columns
- Reposition it to `x: 3, y: 3` so it sits next to "Birthdays" on the second row, filling the remaining space

Layout becomes:
```
Row 0: provider-view (0,0 w:3) | aum-product (3,0 w:3) | top-accounts (6,0 w:3)
Row 1: birthdays (0,3 w:3)     | corporate-actions (3,3 w:6)
       clients-value (0,6 w:3) |
```

### `src/hooks/useWidgetLayout.ts`
- No changes needed -- the existing auto-heal logic will detect the width mismatch between saved layout (`w:3`) and new default (`w:6`) and reset to defaults automatically.

### One file changed
- `src/pages/Dashboard.tsx` -- update one line in `defaultDashboardLayout`
