

# Align Expanded Details with Table Columns

## Problem

The expanded row content (Non-vested, Retirement, Savings, Vested with their amounts) is currently using a simple flex layout with fixed widths. It needs to align with:
- **Labels** → "Investment product" column (column 2)
- **Amounts** → "Investment amount" column (column 4)

## Solution

Instead of using a single `colSpan={9}` cell with a flex layout, use individual `TableCell` elements to match the table's column structure:

| Column | Content |
|--------|---------|
| 1 (Investment house) | Empty |
| 2 (Investment product) | Detail label (Non-vested, etc.) |
| 3 (Investment number) | Empty |
| 4 (Investment amount) | Detail amount |
| 5-9 | Empty (colSpan for remaining columns) |

## Changes Required

### File: `src/components/client-detail/Client360ViewTab.tsx`

**Update the expanded details row (lines 170-182)**

Replace the current single-cell structure with multiple cells matching column positions:

```tsx
{isExpanded && product.details && (
  <>
    {product.details.map((detail, i) => (
      <TableRow key={`${product.number}-detail-${i}`} className="bg-muted/20 border-b border-border/50">
        <TableCell></TableCell>
        <TableCell className="text-sm text-muted-foreground">{detail.label}</TableCell>
        <TableCell></TableCell>
        <TableCell className="text-sm">{detail.amount}</TableCell>
        <TableCell colSpan={5}></TableCell>
      </TableRow>
    ))}
  </>
)}
```

This creates a separate row for each detail item, with the label in column 2 (aligning with "Investment product") and the amount in column 4 (aligning with "Investment amount").

## Summary

| Location | Change |
|----------|--------|
| Lines 170-182 | Replace single `colSpan={9}` cell with proper column-aligned structure using multiple `TableCell` elements |

