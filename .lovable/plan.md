

## Fix "Clients by Age Group" Widget Overflow

### Problem
The widget content (header + 7-8 table rows) exceeds the 360px grid cell height, causing text to render outside the card boundary.

### Solution
**File: `src/pages/Dashboard.tsx`**

Add overflow handling to the Age Group widget so content stays within the card and scrolls if needed:

1. Add `overflow-hidden` to the Card component to clip content at the card boundary
2. Add `overflow-y-auto` and a flex layout to the CardContent so the table scrolls within the available space
3. Use a flex column layout on the Card so the content area fills remaining space after the header

These are the same patterns used by other widgets that have variable-length content.

### Specific Changes

```
// Card: add overflow-hidden and flex layout
<Card className="h-full overflow-hidden flex flex-col">

// CardContent: add flex-1, overflow-y-auto, and min-h-0
<CardContent className="px-4 pb-4 flex-1 overflow-y-auto min-h-0">
```

This ensures the card respects the grid cell boundary and the table rows scroll if they exceed the available space, matching the behavior of other same-sized widgets.

