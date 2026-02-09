

## Fix: Currency Symbol Flash (R -> C$ -> $) on Initial Load

### Root Cause

`Client360ViewTab` has its own `useClientDetail(clientId)` hook call (line 21). While the client data is being fetched asynchronously, `client` is `null`, so:

- `mapNationalityToJurisdiction(null, null)` returns `"ZA"` (the hardcoded default)
- `generateClient360Data(clientId, null, null)` produces data with `currencySymbol: "R"`
- The component renders with "R" for a brief moment
- Once the fetch completes, it re-renders with the correct "$"

For `ClientPerformanceTab`, the parent (`ClientDetail.tsx`) passes `client.nationality` and `client.country_of_issue` as props, but during the loading phase these are from the parent's own async fetch, so a similar flash can occur.

### Fix

**File: `src/components/client-detail/Client360ViewTab.tsx`**
- Use the `loading` state from `useClientDetail` 
- Return the "Loading client data..." message when `loading` is `true` OR `client` is `null` (not just when `clientData` is null)
- This prevents the component from generating and rendering ZA-defaulted data before the real client record arrives

**File: `src/components/client-detail/ClientPerformanceTab.tsx`**
- Add a guard: if `nationality` is null/undefined AND `countryOfIssue` is null/undefined, show a loading/skeleton state instead of falling back to the region context
- This prevents the brief flash of the wrong region's currency

### Technical Details

In `Client360ViewTab.tsx`, change:
```tsx
const { client } = useClientDetail(clientId || "");
```
to:
```tsx
const { client, loading } = useClientDetail(clientId || "");
```

Then update the early return guard from:
```tsx
if (!clientData) {
  return <div>Loading client data...</div>;
}
```
to:
```tsx
if (loading || !client || !clientData) {
  return <div>Loading client data...</div>;
}
```

In `ClientPerformanceTab.tsx`, add a guard near the top:
```tsx
if (!nationality && !countryOfIssue) {
  return <div>Loading...</div>;
}
```

This ensures no currency symbols render until the actual client jurisdiction is known.

