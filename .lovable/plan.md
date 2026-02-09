

## Fix: US Client Showing C$ Instead of $ on Performance Tab

### Root Cause

The **Performance tab** (`ClientPerformanceTab.tsx`) imports `currencySymbol` from the global `useRegion()` context (line 64), which reflects the **advisor's currently selected region** (e.g., Canada), not the **client's nationality**. So when an advisor has Canada selected but views a US client, the tab displays "C$" instead of "$".

The **360 View tab** does not have this bug because it correctly uses `clientData.currencySymbol` from `generateClient360Data`.

### Fix

**File: `src/components/client-detail/ClientPerformanceTab.tsx`**

- Stop using `currencySymbol` from `useRegion()` for display purposes
- Instead, derive the correct currency symbol from the client's jurisdiction using the existing `regional360ViewData` config
- The `data360` object already contains the correct `currencySymbol` (set by `generateClient360Data` based on nationality)
- Replace all usages of the RegionContext `currencySymbol` with `data360.currencySymbol`

This is a code-only fix. No database changes are needed -- the nationality data ("American") and country_of_issue ("United States") are already correct in the database.

### Specific Change

Line 64 currently reads:
```
const { selectedRegion, currencySymbol } = useRegion();
```

Change to:
```
const { selectedRegion } = useRegion();
```

Then use `data360.currencySymbol` everywhere `currencySymbol` was previously used in the component (approximately 10+ occurrences for fund values, fee tables, etc.).
