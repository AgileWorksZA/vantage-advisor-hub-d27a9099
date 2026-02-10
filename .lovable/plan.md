

## Always Inherit Web Jurisdiction on Mobile Open

### Problem
Currently, the mobile view checks for a mobile-specific saved region first, which means it can show a stale jurisdiction even when the user has since changed the web view's region. The mobile view should always mirror the web view's active jurisdiction when opened.

### Changes

**File: `src/contexts/MobileRegionProvider.tsx`**

1. Change the initial `selectedRegion` state (line 42-44) to always read the web key first, ignoring the mobile-specific key:
   ```
   // Before
   return localStorage.getItem(MOBILE_REGION_KEY) 
     || localStorage.getItem("vantage-selected-region") 
     || "ZA";

   // After
   return localStorage.getItem("vantage-selected-region") || "ZA";
   ```

2. The initial `selectedAdvisors` state (lines 49-51) already calls `getAdvisorsForRegion` which defaults to the first advisor, so it will automatically pick the correct advisor for the inherited region.

3. Optionally remove the `MOBILE_REGION_KEY` constant and the `localStorage.setItem(MOBILE_REGION_KEY, ...)` call in `setSelectedRegion` (line 63) since mobile-specific region persistence is no longer needed -- every open inherits from web. The advisor map storage (`MOBILE_ADVISORS_KEY`) can remain for restoring the last-used advisor per region during a single mobile session.

| File | Action |
|------|--------|
| `src/contexts/MobileRegionProvider.tsx` | Always read web region key; remove mobile region persistence |

