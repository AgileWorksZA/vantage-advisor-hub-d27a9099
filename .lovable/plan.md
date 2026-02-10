

## Default Mobile Region to Web's Current Jurisdiction

### Problem
When entering mobile mode, the jurisdiction defaults to "ZA" instead of matching whichever jurisdiction is currently active in the web view.

### Solution
Update `MobileRegionProvider.tsx` so that on first load (when no mobile-specific region has been saved), it reads the web view's localStorage key (`vantage-selected-region`) as the fallback instead of hardcoding `"ZA"`.

### Changes

**File: `src/contexts/MobileRegionProvider.tsx`**

- Line 43: Change the fallback from `"ZA"` to reading the web region key first:
  ```
  // Before
  return localStorage.getItem(MOBILE_REGION_KEY) || "ZA";

  // After
  return localStorage.getItem(MOBILE_REGION_KEY) 
    || localStorage.getItem("vantage-selected-region") 
    || "ZA";
  ```

This means:
1. If mobile has its own saved region, use that
2. Otherwise, inherit whatever the web view currently has selected
3. Fall back to "ZA" only if neither exists

The advisor default already works correctly -- `getAdvisorsForRegion` picks the first advisor for whatever region is resolved, so no other changes are needed.

| File | Action |
|------|--------|
| `src/contexts/MobileRegionProvider.tsx` | Read web region key as fallback on line 43 |
