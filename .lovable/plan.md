

## Right-Align Currency Columns in Product Tables

Add `text-right` alignment to all currency value columns across the five product tables in the Products tab, ensuring consistent number formatting.

### Changes

**File:** `src/components/client-detail/Client360ViewTab.tsx`

Apply `text-right` to both `TableHead` and `TableCell` for every currency column:

| Table | Columns to right-align |
|-------|----------------------|
| On-Platform Products | Investment amount, Income, Recurring contribution |
| External Products | Amount, Income, Contribution |
| Platform Cash | Investment Amount |
| Short Term | Total Premium |
| Risk Products | Payment Amount (already done) |

For cells containing a FrequencyTag, update the `inline-flex` span to use `justify-end` (already done for Risk Products, needs adding to the other tables).

### Specific edits

1. **On-Platform Products table (headers ~lines 193-195):** Add `text-right` to Investment amount, Income, Recurring contribution headers
2. **On-Platform Products table (cells ~lines 210-216):** Add `text-right` to those cells; add `justify-end` to the FrequencyTag spans
3. **External Products table (headers ~lines 316-318):** Add `text-right` to Amount, Income, Contribution headers
4. **External Products table (cells ~lines 330-335):** Same pattern
5. **Platform Cash table (header ~line 381):** Add `text-right` to Investment Amount header
6. **Platform Cash table (cell ~line 394):** Add `text-right` to Investment Amount cell
7. **Short Term table (header ~line 481):** Add `text-right` to Total Premium header
8. **Short Term table (cell ~lines 494-495):** Add `text-right` and `justify-end` to the FrequencyTag span

No new files or dependencies needed -- purely CSS class additions to existing elements.
