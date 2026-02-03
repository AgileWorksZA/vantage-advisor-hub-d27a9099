
# Update 360 View Tab: Expandable Rows, Totals, and Button Order

## Summary

Modify the On-Platform Investment Products table to:
1. Remove expander from top row, swap button order (expander ↔ 3-dot menu) for Retirement Annuity Fund
2. Add expandable detail content showing fund breakdown
3. Filter out rows with zero investment amounts
4. Add calculated total to section header
5. Ensure External/CCM totals match their data

---

## Detailed Changes

### 1. Data Changes

**Update `onPlatformProducts` array:**
- Only keep products with non-zero amounts (Investment Plan R 1,163.39 and Retirement Annuity R 1,393,995.66)
- Add `expandable` flag and `details` array to the Retirement Annuity entry

```typescript
const onPlatformProducts = [
  { 
    investmentHouse: "Efficient Wealth", 
    product: "Investment Plan", 
    number: "202411220002", 
    amount: "R 1,163.39", 
    amountValue: 1163.39,
    income: "R 0.00", 
    contribution: "R 0.00", 
    date: "03/02/2026", 
    advisor: "Emile Wegner",
    expandable: false 
  },
  { 
    investmentHouse: "Efficient Wealth", 
    product: "Retirement Annuity Fund", 
    number: "202601010020P", 
    amount: "R 1,393,995.66", 
    amountValue: 1393995.66,
    income: "R 0.00", 
    contribution: "R 0.00", 
    date: "03/02/2026", 
    advisor: "Emile Wegner",
    expandable: true,
    details: [
      { label: "Non-vested", amount: "R 1,225,553.09" },
      { label: "Retirement", amount: "R 46,121.18" },
      { label: "Savings", amount: "R 23,060.59" },
      { label: "Vested", amount: "R 99,260.80" }
    ]
  },
];
```

### 2. Expandable Row State

Add state to track which rows are expanded:

```typescript
const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

const toggleRowExpand = (number: string) => {
  setExpandedRows(prev => {
    const next = new Set(prev);
    if (next.has(number)) {
      next.delete(number);
    } else {
      next.add(number);
    }
    return next;
  });
};
```

### 3. Calculate Totals

```typescript
// Calculate On-Platform total
const onPlatformTotal = onPlatformProducts.reduce(
  (sum, p) => sum + p.amountValue, 0
);

// Format as "R 1,395,159.05"
const formatTotal = (value: number) => 
  `R ${value.toLocaleString("en-ZA", { minimumFractionDigits: 2 })}`;
```

### 4. Button Order Change

**For non-expandable rows (Investment Plan):**
- Show: Edit | 3-dot menu (no expander)

**For expandable rows (Retirement Annuity):**
- Show: Edit | Chevron (expander) | 3-dot menu
- Note: User wants chevron BEFORE 3-dot menu (swapped from current)

Current order: Edit → Expander → 3-dot
Requested order: Edit → Expander → 3-dot (this is actually correct, but the first row shouldn't have expander)

Looking at the screenshot, the order is: Edit (pencil) | Chevron (^) | 3-dot menu
So the swap means: move 3-dot to be LAST (after chevron)

### 5. Expandable Content Row

When expanded, show additional row with fund breakdown:

```typescript
{expandedRows.has(product.number) && product.details && (
  <TableRow className="bg-muted/20">
    <TableCell></TableCell>
    <TableCell></TableCell>
    <TableCell colSpan={7}>
      <div className="py-2 pl-4 space-y-1">
        {product.details.map((detail, i) => (
          <div key={i} className="flex gap-8 text-sm">
            <span className="w-24">{detail.label}</span>
            <span>{detail.amount}</span>
          </div>
        ))}
      </div>
    </TableCell>
  </TableRow>
)}
```

### 6. Header Total Display

Update On-Platform header to show total:

```typescript
<CardTitle className="text-base font-medium">
  On-Platform Investment Products{" "}
  <span className="text-muted-foreground font-normal">
    | {formatTotal(onPlatformTotal)}
  </span>
</CardTitle>
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/client-detail/Client360ViewTab.tsx` | Update data, add expand state, calculate totals, update table rendering |

---

## Visual Result

```text
On-Platform Investment Products | R 1,395,159.05    [+ Quote + New business]
┌─────────────────────────────────────────────────────────────────────────┐
│ Investment house │ Product    │ Number       │ Amount        │ ... │ ⚙ │
├─────────────────────────────────────────────────────────────────────────┤
│ Efficient Wealth │ Investment │ 202411220002 │ R 1,163.39    │ ... │✎ ⋮│
│ Efficient Wealth │ Retirement │ 202601010020P│ R 1,393,995.66│ ... │✎ ∧ ⋮│
│                  │            │ Non-vested   │ R 1,225,553.09│     │   │
│                  │            │ Retirement   │ R 46,121.18   │     │   │
│                  │            │ Savings      │ R 23,060.59   │     │   │
│                  │            │ Vested       │ R 99,260.80   │     │   │
└─────────────────────────────────────────────────────────────────────────┘

External Investment Products | R 843,956.45  (calculated from data)
Corporate Cash Manager | R 55,083.00  (calculated from data)
```

---

## Technical Notes

- The chevron icon rotates 180° when expanded (ChevronUp vs ChevronDown)
- Zero-amount rows are simply removed from the demo data array
- Totals are calculated dynamically from the data arrays
- The External and CCM totals already match their data; just ensure they're calculated rather than hardcoded
