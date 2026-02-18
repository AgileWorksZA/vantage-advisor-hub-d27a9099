

## Show Nothing When Amounts Are Zero

### Overview
When amount fields (Amount, Income, Contribution, Premium, Payment Amount, etc.) display a zero value like "R 0.00" or "$0.00", show an empty cell instead.

### Solution

**File:** `src/components/client-detail/Client360ViewTab.tsx`

Add a helper function (reusing the same zero-check logic from `FrequencyTag.tsx`) near the top of the component:

```tsx
const isZeroValue = (value?: string): boolean => {
  if (!value) return true;
  const numeric = value.replace(/[^0-9.]/g, "");
  if (!numeric) return true;
  return parseFloat(numeric) === 0;
};
```

Then wrap each amount display so it renders nothing when zero. Apply to these cells across all tables:

| Table | Fields |
|-------|--------|
| On-Platform Products | amount, income, contribution (main rows + expanded details) |
| External Products | amount, income, contribution |
| Platform Cash | amount |
| Short Term | totalPremium |
| Risk Products | paymentAmount |
| Medical Aid | premium |

For simple amount cells, change from:
```tsx
<TableCell className="text-sm text-right">{product.amount}</TableCell>
```
to:
```tsx
<TableCell className="text-sm text-right">{isZeroValue(product.amount) ? "" : product.amount}</TableCell>
```

For cells with FrequencyTag, change from:
```tsx
<span className="inline-flex items-center justify-end gap-1">{product.income} <FrequencyTag ... /></span>
```
to:
```tsx
{isZeroValue(product.income) ? null : <span className="inline-flex items-center justify-end gap-1">{product.income} <FrequencyTag ... /></span>}
```

This keeps the column and alignment intact but shows a clean empty cell when the value is zero.
