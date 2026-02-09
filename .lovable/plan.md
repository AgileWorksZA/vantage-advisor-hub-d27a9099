

## Performance Tab Enhancements: Product Selector, Fund-level Data, and Fee Highlighting

### 1. Current Portfolio: Show Mutual Funds per Product with Multi-Select

Currently the "Current Portfolio" card shows on-platform products (e.g., "TFSA", "Non-Registered Account") with their allocation and value. This needs to change:

**Add a multi-select dropdown** below the "Current Portfolio" card title that lists all the client's on-platform products from the 360 view data. By default, all products are selected.

**Show mutual fund breakdowns** for each selected product. The 360 view data already has an `expandable` flag and `details` array on some products -- we will ensure every product generates 2-5 fund-level detail lines (e.g., "Vanguard Balanced Fund", "Allan Gray Equity"). These fund-level lines become the rows in the Current Portfolio table.

**Add a Total row** at the bottom of the table showing summed allocation (100%) and total value.

**File**: `src/data/performanceComparisonData.ts`
- Add a new function `generateProductFunds(products, seed)` that takes on-platform products and generates 2-5 mutual fund names per product with amounts and allocations
- Fund names are jurisdiction-aware (e.g., ZA: "Allan Gray Equity Fund", US: "Vanguard 500 Index Fund")

**File**: `src/components/client-detail/ClientPerformanceTab.tsx`
- Add state: `selectedProducts: string[]` initialized with all product names
- Add a multi-select dropdown (using checkboxes in a popover, consistent with other multi-selects in the app) below the "Current Portfolio" heading
- Filter and flatten `data360.onPlatformProducts` by `selectedProducts` to get fund-level rows
- Show fund rows grouped under product name headers in the table
- Add a bold "Total" row at the bottom

### 2. Fee Highlighting: Compare Values Between Current and Comparison

In both the "Current Portfolio Fees & EAC" and "Comparison Portfolio Fees & EAC" cards, highlight cells where the comparison value is higher (worse) than the current value.

**Logic**:
- For each fee row, match by index position (both tables have same row count when comparison exists)
- For fee table cells: if `comparisonFees[i].investmentMgmtFee > currentFees[i].investmentMgmtFee`, highlight the comparison cell in light red/pink (`bg-red-50 text-red-700`); if lower, highlight in light green (`bg-green-50 text-green-700`)
- Same for adminFee, advisorFee, otherFee, totalCost
- For EAC table: compare each year column (year1, year3, year5, year10) between current and comparison rows of the same category
- Weighted average row also gets highlighting
- Highlighting only appears when comparison data exists

**File**: `src/components/client-detail/ClientPerformanceTab.tsx`
- Modify `FeeTable` to accept an optional `comparisonFees` prop and a `mode` ("current" | "comparison") prop
- Modify `EACTable` to accept an optional `comparisonEAC` prop and a `mode` prop
- Add conditional `className` on each `TableCell` based on comparison

### Technical Details

**Multi-select for products**: Use a `Popover` with checkbox items (consistent with the `MultiSelect` component pattern already in the project at `src/components/ui/multi-select.tsx`). Each item shows the product name with a checkbox. "Select All" / "Deselect All" toggle at top.

**Fund generation in `performanceComparisonData.ts`**:
```
generateProductFunds(products, jurisdiction, seed):
  For each product:
    Generate 2-5 fund names from a jurisdiction-specific list
    Distribute the product's value across funds using seeded random
    Return flat array of { productName, fundName, allocation, value }
```

Jurisdiction-specific fund name pools:
- ZA: Allan Gray Equity, Coronation Balanced, Nedgroup Investments Core, Prescient Income, etc.
- AU: Magellan Global, Vanguard Diversified, BetaShares, Platinum International, etc.
- CA: Mawer Balanced, RBC Select, TD e-Series, Fidelity NorthStar, etc.
- GB: Fundsmith Equity, Baillie Gifford, Vanguard LifeStrategy, Jupiter Income, etc.
- US: Vanguard 500 Index, Fidelity Contrafund, T. Rowe Price, PIMCO Income, etc.

**Highlighting classes**:
- Higher (worse) in comparison: `bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400`
- Lower (better) in comparison: `bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400`
- Applied per-cell, not per-row

**Files changed**:
- `src/data/performanceComparisonData.ts` (add `generateProductFunds` function and fund name pools)
- `src/components/client-detail/ClientPerformanceTab.tsx` (product multi-select, fund-level current portfolio, total row, fee highlighting)

