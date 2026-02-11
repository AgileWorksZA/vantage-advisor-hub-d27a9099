

## Dynamic Quote Title with Contract Number

### Overview
When an advisor selects a product in the Quote wizard, the title updates from "QUOTE" to include the product name and an auto-generated contract number, e.g. **QUOTE - Tax Free Plan (202602115087)**.

### Contract Number Format
Generate a deterministic-looking contract number using the pattern: `YYYYMMDD` + 4 random digits.
- Example: `202602115087` (date: 2026-02-11, random: 5087)
- Generated once when a product is selected, regenerated if the product changes.

### Changes

**`src/components/client-detail/QuoteWizardDialog.tsx`** (single file)

1. **Add a helper function** to generate the contract number:
```text
function generateContractNumber(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000).toString();
  return datePart + randomPart;
}
```

2. **Add `contractNumber` state**, initialized as empty string. When `selectedProduct` changes (via a wrapper around `setSelectedProduct`), generate a new contract number.

3. **Update the title** (line 40) and sidebar title (line 79) to show:
   - If no product selected: `QUOTE`
   - If product selected: `QUOTE - {productName} ({contractNumber})`

### Technical Details

| Line | Current | Updated |
|------|---------|---------|
| 28 | `selectedProduct` state only | Add `contractNumber` state |
| 58 | `onValueChange={setSelectedProduct}` | Wrap to also generate contract number |
| 40 | `"Quote"` heading | Dynamic: `Quote - Product (Number)` or just `Quote` |
| 79 | `"Quote"` sidebar heading | Same dynamic title |

No other files are affected.
