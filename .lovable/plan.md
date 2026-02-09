

## Current Portfolio: Consolidated View with Expandable Product Holdings

### Changes to `src/components/client-detail/ClientPerformanceTab.tsx`

**1. Reduce MultiSelect width**
- Wrap the `MultiSelect` in a container with `max-w-[220px]` so it doesn't stretch full-width across the card header.

**2. Add "Expand by Product" toggle (Switch/Slider)**
- Add a `Switch` component (from `src/components/ui/switch.tsx`) next to the product selector, labeled "Expand by Product".
- New state: `expandByProduct` initialized to `false`.
- Place the switch and MultiSelect on the same row using flexbox.

**3. Consolidated view (default, expandByProduct = false)**
- Instead of grouping funds under product headers, merge all `productFunds` across selected products into a single flat list.
- If the same fund name appears under multiple products, combine their allocations and values.
- Recalculate allocation percentages relative to the total value of all selected products.
- No product header rows shown -- just a clean list of unique fund names with Alloc% and Value columns, plus the Total row.

**4. Expanded view (expandByProduct = true)**
- Show the current grouped layout: product header rows (bg-muted/30) with indented fund rows beneath each product.
- This is the existing behavior, kept as-is.

### Layout of the Card Header

```
Current Portfolio
[Products ▼ (220px)]  [toggle icon] Expand by Product
```

The MultiSelect stays at `max-w-[220px]`, the Switch sits to its right with a small label. Both are on the same line below the card title.

### Technical Details

- Import `Switch` from `@/components/ui/switch` and `Label` from `@/components/ui/label`
- Consolidation logic: `useMemo` that groups `productFunds` by `fundName`, sums `value`, then recalculates `allocation` as percentage of total -- only used when `expandByProduct === false`
- The consolidated funds array feeds into the same table structure but without the product header rows
- No changes to `performanceComparisonData.ts`

