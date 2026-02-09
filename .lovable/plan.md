

## Fix: "american" Incorrectly Matching "CA" (Canada) Jurisdiction

### Root Cause

In `mapNationalityToJurisdiction` (line 229 of `regional360ViewData.ts`), the check order causes a false match:

```
Line 229: if (lower.includes("canadian") || lower.includes("ca")) return "CA";
Line 231: if (lower.includes("american") || ...) return "US";
```

The substring `"ca"` exists inside `"american"` (ameri**ca**n), so the Canadian check matches first and returns `"CA"`. This causes all American clients to display `C$` instead of `$`.

### Fix

**File: `src/data/regional360ViewData.ts`** (line 229)

Replace the loose `lower.includes("ca")` checks with exact word boundaries or more specific substrings. The same issue could theoretically affect other short codes. The fix:

- Change `lower.includes("ca")` to a check that won't false-match, e.g. exact equality `lower === "ca"` or remove short-code matching from nationality (it's meant for full words like "Canadian")
- Similarly audit `lower.includes("za")`, `lower.includes("au")`, `lower.includes("gb")` for false matches (these are safe since no other nationality contains those substrings, but using exact equality is more defensive)

Updated line 227-231:
```typescript
if (lower.includes("south african") || lower === "za") return "ZA";
if (lower.includes("australian") || lower === "au") return "AU";
if (lower.includes("canadian") || lower === "ca") return "CA";
if (lower.includes("british") || lower.includes("english") || lower.includes("scottish") || lower.includes("welsh") || lower === "uk" || lower === "gb") return "GB";
if (lower.includes("american") || lower.includes("us citizen") || lower === "usa" || lower === "us" || lower.includes("united states")) return "US";
```

Key change: All short jurisdiction codes (`za`, `au`, `ca`, `gb`, `uk`, `usa`, `us`) now use strict equality (`===`) instead of `includes()`, preventing substring false matches.

This is a one-file, 5-line change. No database modifications needed.
