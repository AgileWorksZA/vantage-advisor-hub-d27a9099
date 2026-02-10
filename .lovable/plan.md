

## Add Household View Toggle to Next Best Action

### Overview

Add a toggle switch to the "Next Best Action" card header that enables a "Household View". When toggled on, data from all clients sharing the same `household_group` is fetched and displayed, with an additional "Client" column showing which household member each item relates to.

### Changes

**New Hook: `src/hooks/useHouseholdMeetingPrep.ts`**

- Accepts the current client's `household_group` string and `clientId`
- When enabled, queries `clients` table for all clients with the same `household_group`
- Calls `useClientMeetingPrep`-style queries for each household member in parallel
- Returns aggregated opportunities, tasks, documents, and products, each enriched with a `clientName` field
- Returns a loading state

**File: `src/components/client-detail/ClientSummaryTab.tsx`**

- Add a `Switch` component (from `@/components/ui/switch`) and a `Users` icon in the card header, positioned to the right of the "Next Best Action" title
- Add `useState` for `householdView` (boolean, default false)
- Only show the toggle if `client.household_group` exists
- When `householdView` is true, use data from the household hook instead of the single-client `useClientMeetingPrep`
- Pass a `householdView` prop down to the three tab components
- Update tab counts to reflect aggregated data

**File: `src/components/client-detail/next-best-action/OpportunitiesTab.tsx`**

- Add optional `householdView` prop
- When `householdView` is true, show a "Client" label next to each opportunity item (compact, as a small text tag after the type badge)
- Opportunities and gap analysis items gain an optional `clientName` field

**File: `src/components/client-detail/next-best-action/OutstandingTab.tsx`**

- Add optional `householdView` prop
- When `householdView` is true, show client name next to each task/document item (small text label inline with the category)

**File: `src/components/client-detail/next-best-action/RecentActivityTab.tsx`**

- Add optional `householdView` prop (for future use; current data is demo-static so no client column added yet, but the prop is accepted for consistency)

### Layout Detail

The card header will look like:

```text
Next Best Action          [Users icon] Household [toggle]
```

The toggle uses the existing `Switch` component, sized small (`scale-75`), with a "Household" label in `text-xs`.

### Technical Details

- The household hook queries `clients` where `household_group = ?` and `household_group IS NOT NULL`
- For each household client, it runs the same parallel queries as `useClientMeetingPrep` (notes, tasks, documents, opportunities, products)
- Results are merged with `clientName` (formatted as "FirstName S.") added to each item
- The hook is only called when the toggle is enabled (lazy fetch)
- Gap analysis in OpportunitiesTab runs per-client within the household, so each client's gaps are identified separately with their name attached

### Files

| File | Action |
|------|--------|
| `src/hooks/useHouseholdMeetingPrep.ts` | Create |
| `src/components/client-detail/ClientSummaryTab.tsx` | Modify |
| `src/components/client-detail/next-best-action/OpportunitiesTab.tsx` | Modify |
| `src/components/client-detail/next-best-action/OutstandingTab.tsx` | Modify |
| `src/components/client-detail/next-best-action/RecentActivityTab.tsx` | Modify |

