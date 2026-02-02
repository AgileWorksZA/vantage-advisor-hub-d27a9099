
# Keep Original Aspect Ratio for VANTAGE Logo

## Overview
Update the VANTAGE logo styling to ensure the original aspect ratio is preserved while maintaining the 2.5x size increase.

---

## Current Issue
The current implementation uses `h-10 w-auto` which sets a fixed height and lets width adjust. This should technically preserve aspect ratio, but may be causing unexpected display issues.

## Solution
Change from height-constrained to a more flexible approach using `object-contain` which explicitly preserves the original aspect ratio of the image, combined with appropriate sizing.

---

## Files to Modify

1. `src/components/layout/AppLayout.tsx`
2. `src/pages/Dashboard.tsx`
3. `src/pages/Clients.tsx`
4. `src/pages/Email.tsx`
5. `src/pages/Calendar.tsx`
6. `src/pages/Tasks.tsx`
7. `src/pages/Insights.tsx`
8. `src/pages/Practice.tsx`
9. `src/pages/ClientDetail.tsx`

---

## Change Pattern

**From:**
```typescript
<img 
  src={vantageLogo} 
  alt="Vantage" 
  className="h-10 w-auto -rotate-90 origin-center"
/>
```

**To:**
```typescript
<img 
  src={vantageLogo} 
  alt="Vantage" 
  className="h-10 object-contain -rotate-90 origin-center"
/>
```

The `object-contain` class ensures the image scales to fit within its container while preserving its original aspect ratio. Combined with `h-10`, this will maintain the 2.5x size while respecting the logo's natural proportions.

---

## Expected Outcome
The VANTAGE logo will display at the larger size while maintaining its original aspect ratio exactly as designed in the source image.
