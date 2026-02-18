

## Add Currency and Right-Align Numbers in Risk Product Tables

### 1. Add currency prefix to Total Premium input field (AddRiskProductForm)

In `src/components/client-detail/AddRiskProductForm.tsx`, wrap the Total Premium input (line 166) with a currency prefix indicator (e.g., "R" shown as a left addon or prefix text inside the input group).

### 2. Right-align Payment Amount columns across all tables

Apply `text-right` to both the `TableHead` and `TableCell` for payment/currency columns in these files:

| File | Column | Lines (approx) |
|------|--------|-----------------|
| `src/components/client-detail/Client360ViewTab.tsx` | "Payment Amount" header + cell | 528, 542 |
| `src/components/client-detail/AstuteRequestView.tsx` | "Payment amount" header + cell | 379, 391 |
| `src/components/client-detail/AddRiskProductForm.tsx` | "Cover Amount" and "Premium Amount" display values (in the detail view section) | 256, 260 |

### Technical details

**Client360ViewTab.tsx:**
- Line 528: Add `text-right` to `Payment Amount` TableHead
- Line 542: Add `text-right` to the paymentAmount TableCell

**AstuteRequestView.tsx:**
- Line 379: Add `text-right` to `Payment amount` TableHead
- Line 391: Add `text-right` to the paymentAmount TableCell

**AddRiskProductForm.tsx:**
- Line 163-168: Add a "R" currency prefix to the Total Premium input field using an input group pattern (a `span` with "R" before the input inside a flex container)
- Lines 256, 260: Right-align the Cover Amount and Premium Amount display values in the detail view

