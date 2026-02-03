

# Consolidate Expanded Details into Single Row with Reduced Spacing

## Problem

The current implementation creates a separate `TableRow` for each detail item (Non-vested, Retirement, Savings, Vested), which adds unnecessary vertical space. The user wants all details in a single row with reduced spacing, aligned to the correct columns.

## Solution

Revert to a single `TableRow` for all details, but use proper column alignment with empty cells. Display all detail items in a compact vertical list within the "Investment product" column, with their amounts in the "Investment amount" column.

## Changes Required

### File: `src/components/client-detail/Client360ViewTab.tsx`

**Update lines 170-182**

Replace the multiple row structure with a single row containing aligned columns:

```tsx
{isExpanded && product.details && (
  <TableRow key={`${product.number}-details`} className="bg-muted/20 border-b border-border/50">
    <TableCell></TableCell>
    <TableCell className="text-sm text-muted-foreground py-1">
      <div className="space-y-0.5">
        {product.details.map((detail, i) => (
          <div key={i}>{detail.label}</div>
        ))}
      </div>
    </TableCell>
    <TableCell></TableCell>
    <TableCell className="text-sm py-1">
      <div className="space-y-0.5">
        {product.details.map((detail, i) => (
          <div key={i}>{detail.amount}</div>
        ))}
      </div>
    </TableCell>
    <TableCell colSpan={5}></TableCell>
  </TableRow>
)}
```

This approach:
- Uses a **single row** for all details
- Reduces spacing with `py-1` padding and `space-y-0.5` between items
- Keeps labels aligned with "Investment product" column (column 2)
- Keeps amounts aligned with "Investment amount" column (column 4)
- Removes any action elements from these informational items

## Summary

| Location | Change |
|----------|--------|
| Lines 170-182 | Replace multiple `TableRow` elements with a single row containing compact, vertically-stacked labels and amounts in their respective columns |

