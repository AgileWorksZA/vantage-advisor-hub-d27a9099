

## Auto-Calculate Fund Amount from Percentage

### What Changes
When you type a percentage value in a fund allocation row, the **amount** field will automatically be set to `lumpSumAmount * percentage / 100` (for lump-sum rows) or `recurringAmount * percentage / 100` (for recurring rows).

### Technical Detail

**File:** `src/components/client-detail/QuoteWizardDialog.tsx`

Modify the `updateFundRow` function (line 134) so that when the `field` being updated is `"percentage"`, it also computes and sets the `amount` on that row:

```typescript
const updateFundRow = (target: "lumpsum" | "recurring", id: string, field: keyof FundRow, value: string) => {
  const updater = (rows: FundRow[]) => rows.map(r => {
    if (r.id !== id) return r;
    const updated = { ...r, [field]: value };
    if (field === "percentage") {
      const baseAmount = target === "lumpsum"
        ? parseFloat(lumpSumAmount.replace(/[^0-9.]/g, "")) || 0
        : parseFloat(recurringAmount.replace(/[^0-9.]/g, "")) || 0;
      const pct = parseFloat(value) || 0;
      updated.amount = (baseAmount * pct / 100).toFixed(2);
    }
    return updated;
  });
  if (target === "lumpsum") {
    setLumpSumFunds(updater(lumpSumFunds));
  } else {
    setRecurringFunds(updater(recurringFunds));
  }
};
```

- Parses the lump-sum (or recurring) amount, stripping non-numeric characters
- Multiplies by the entered percentage divided by 100
- Formats the result to 2 decimal places
- Only triggers when the percentage field is edited; direct amount edits remain manual

