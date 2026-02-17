

## Redesign "Client Opportunities" Widget with Segment Table

### Overview
Rename the widget to "Client Opportunities" and replace the per-client listing with a matrix table (like the Account Onboarding Progress widget). Rows are AUM segments, columns are priority statuses (Urgent, Important, Routine). Each cell shows client count and total opportunity value.

### Table Layout

```text
Segment        | Urgent       | Important    | Routine
---------------|--------------|--------------|-------------
0 - 1M         | 3 / R 45k    | 5 / R 20k   | 2 / -
1M - 5M        | 2 / R 320k   | 4 / R 180k  | 1 / R 10k
> 5M           | 1 / R 1.2M   | 2 / R 500k  | 3 / R 80k
```

Each cell displays a clickable count and value. Clicking navigates to `/opportunities/:priority` (existing page).

### Changes

**File: `src/hooks/useClientOpportunityCategories.ts`**

1. Add a `segment` field to `ClientCategoryItem` based on total portfolio value (sum of all product values from `generateClient360Data`):
   - `"0-1m"` if portfolio < 1,000,000
   - `"1m-5m"` if portfolio >= 1M and < 5M
   - `"gt5m"` if portfolio >= 5M
2. Export a new type `Segment = "0-1m" | "1m-5m" | "gt5m"`
3. Add a new return shape: `matrix` - a nested object `Record<Segment, Record<Priority, { count: number; value: number }>>` computed alongside the existing categories
4. Keep existing `categories` return for backward compatibility (used by OpportunityAction page)

**File: `src/components/dashboard/ClientOpportunityStatusWidget.tsx`**

1. Rename title from "Client Opportunity Status" to "Client Opportunities"
2. Replace the current section-based layout with a table matching the onboarding widget pattern:
   - Row headers: "0 - 1M", "1M - 5M", "> 5M"
   - Column headers: "Urgent" (with red dot), "Important" (with amber dot), "Routine" (with green dot)
   - Each cell shows count (clickable, navigates to `/opportunities/:priority`) and formatted value below it
   - Zero counts show "0" in muted text, non-zero counts are clickable primary-colored text
3. Use the same `<table>` HTML structure as `OnboardingProgressWidget` for visual consistency

### Technical Details

| File | Action |
|------|--------|
| `src/hooks/useClientOpportunityCategories.ts` | Edit - add segment computation and matrix return |
| `src/components/dashboard/ClientOpportunityStatusWidget.tsx` | Edit - rename, replace layout with segment table |

No new files, routes, or database changes needed. The existing `/opportunities/:priority` route handles navigation.
