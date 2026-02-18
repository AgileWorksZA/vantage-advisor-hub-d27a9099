
## Right-Align Numbers on Products Tab

Align numeric columns (Premium, Value) to the right and keep text/date columns (Product, Adviser, Role, Frequency, Value updated, Inactive, Linked) left-aligned.

### Changes in `src/components/client-detail/ClientProductsTab.tsx`

**Table Headers (lines 113, 115):**
- Add `text-right` to "Premium" and "Value" `TableHead` elements

**Table Cells (lines 127, 129):**
- Add `text-right` to the "Premium" and "Value" `TableCell` elements

All other columns (Product, Adviser, Role, Frequency, Value updated, Inactive, Linked) remain left-aligned as they contain text strings or dates.
