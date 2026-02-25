

## Show Real Adviser Name in Client Messages Tab

### Overview
Replace the hardcoded "Your Adviser" label in the Client App Messages tab with the actual primary adviser name from the last selected jurisdiction's regional data.

### Changes

**Edit: `src/components/client-app/ClientApp.tsx`**

- Import `useMemo` from React and `getRegionalData` from `@/data/regionalData`
- Read the selected region from `localStorage` (key `vantage-selected-region`, default `"ZA"`) to get the current jurisdiction
- Derive the primary adviser name: `getRegionalData(region).advisors[0].name`
- Pass `advisorName` prop to `ClientMessagesTab`:
  ```
  <ClientMessagesTab clientName={clientName} advisorName={adviserName} />
  ```

### Technical Details

The region is already persisted in localStorage by `RegionContext`. We read it directly rather than importing the context (to avoid adding a provider dependency to the Client App shell). The first advisor in each region's `advisors` array serves as the primary adviser.

Only two lines change in `ClientApp.tsx`:
1. Add import for `useMemo` and `getRegionalData`
2. Derive `adviserName` from regional data
3. Pass it to the `ClientMessagesTab` component (line 82)

No changes needed to `ClientMessagesTab.tsx` since it already accepts an optional `advisorName` prop with a default fallback.

