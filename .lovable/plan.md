

## Fix: 360 View Showing C$ Instead of $ for US Client

### Investigation Summary

The database confirms "White, Emily" has `nationality: "American"` and `country_of_issue: "United States"`. The `Client360ViewTab` code correctly uses `client?.nationality` to generate data via `generateClient360Data`. The `mapNationalityToJurisdiction("American")` function correctly returns `"US"` which maps to `currencySymbol: "$"`.

However, to make this more robust, the fix will add `country_of_issue` as a secondary fallback for jurisdiction mapping, so if nationality fails for any reason, the country field can still resolve the correct currency.

### Changes

**File: `src/data/regional360ViewData.ts`**
- Update `mapNationalityToJurisdiction` to accept an optional second parameter `countryOfIssue`
- If `nationality` is null/unmatched, try mapping from `countryOfIssue` (e.g., "United States" maps to "US", "Canada" maps to "CA")
- Only fall back to "ZA" if both fields fail

**File: `src/components/client-detail/Client360ViewTab.tsx`**
- Pass `client?.country_of_issue` as the second argument to both `mapNationalityToJurisdiction` and `generateClient360Data`
- Update the `useMemo` dependency array to include `client?.country_of_issue`

**File: `src/components/client-detail/ClientPerformanceTab.tsx`**
- Same change: pass `country_of_issue` as fallback to the jurisdiction/data generation calls

### Technical Detail

Updated function signature:
```
mapNationalityToJurisdiction(nationality: string | null, countryOfIssue?: string | null): string
```

Country-of-issue mapping additions:
- "south africa" -> "ZA"
- "australia" -> "AU"  
- "canada" -> "CA"
- "united kingdom" -> "GB"
- "united states" -> "US"

`generateClient360Data` signature updated to:
```
generateClient360Data(clientId: string, nationality: string | null, countryOfIssue?: string | null)
```

This is a code-only fix. No database changes needed.
