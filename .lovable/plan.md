

## Align Action Buttons Across All Rows

### Problem
When a row in the On-Platform Products table doesn't have an expandable chevron, the edit (pencil) and dropdown (three dots) buttons shift left, misaligning with rows that do have the expander.

### Solution

**File:** `src/components/client-detail/Client360ViewTab.tsx` (line 221-234)

Replace the conditional rendering of the expander button with an always-present block: render the chevron button when `product.expandable` is true, otherwise render an invisible placeholder `div` of the same size (`h-8 w-8`) to reserve the space.

**Current:**
```tsx
{product.expandable && (
  <Button ...>chevron</Button>
)}
```

**New:**
```tsx
{product.expandable ? (
  <Button ...>chevron</Button>
) : (
  <div className="h-8 w-8" />
)}
```

This single change ensures the edit and dropdown buttons stay vertically aligned across all rows.
