

## Make Household Badge Navigate to Relationships Tab

### Overview
Click the purple "Household" badge (e.g., "The Brown Household") to switch to the Relationships tab instead of opening a popover. Remove "Relationships" from the visible tab strip, but keep the tab content so it renders when selected.

### Changes

**1. `src/components/client-detail/ClientRibbon.tsx` -- Replace Popover with click handler**

- Remove the `Popover`, `PopoverTrigger`, `PopoverContent` wrapping the household badge
- Make the household badge a simple clickable element that calls `onTabChange?.("relationships")` on click
- Remove unused Popover imports

**2. `src/pages/ClientDetail.tsx` -- Remove "Relationships" from tab strip**

- Remove `{ value: "relationships", label: "Relationships" }` from the tabs array rendered in `TabsList`
- Keep the `<TabsContent value="relationships">` block so the content still renders when the tab is activated programmatically via the badge click

### Files

| File | Change |
|------|--------|
| `src/components/client-detail/ClientRibbon.tsx` | Replace Popover with `onTabChange("relationships")` click |
| `src/pages/ClientDetail.tsx` | Remove "Relationships" from visible tab strip |

