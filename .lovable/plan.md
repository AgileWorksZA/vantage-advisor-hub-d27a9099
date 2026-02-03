
# Remove Blank Columns from On-Platform Investment Products Table

## Problem Identified

After the chevron-related changes, the expanded details row has unnecessary empty table cells creating blank columns. Additionally, there's a duplicate MoreVertical (ellipsis) button in the action column.

## Changes Required

### File: `src/components/client-detail/Client360ViewTab.tsx`

**1. Remove empty TableCells from expanded details row (lines 173-175)**

Currently the expanded row has:
```tsx
<TableCell></TableCell>  {/* Empty - causes blank column */}
<TableCell></TableCell>  {/* Empty - causes blank column */}
<TableCell colSpan={7}>  {/* Content here */}
```

Change to span the full width:
```tsx
<TableCell colSpan={9}>  {/* Span all 9 columns */}
```

**2. Remove duplicate MoreVertical button (lines 166-168)**

The action buttons currently show:
- Pencil (Edit)
- MoreVertical (ellipsis) - first one
- ChevronDown/Up (if expandable)
- MoreVertical (ellipsis) - **duplicate, remove this**

Remove the second MoreVertical button to clean up the actions column.

## Summary of Edits

| Location | Change |
|----------|--------|
| Lines 166-168 | Remove duplicate `<Button>` with `MoreVertical` icon |
| Lines 173-176 | Replace two empty `TableCell` + `colSpan={7}` with single `colSpan={9}` |
