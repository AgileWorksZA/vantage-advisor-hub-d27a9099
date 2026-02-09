

## Fix Onboarding Widget to Match Other Widget Sizes

### Problem
The onboarding progress widget's card content overflows its grid cell (w:3, h:3 = 350x360px), making it appear larger than the other widgets.

### Solution
Add `overflow-hidden` to the Card element so it clips to the grid cell boundary, and tighten the internal spacing to ensure all 5 rows fit within the 360px height.

### Changes

**`src/components/dashboard/OnboardingProgressWidget.tsx`**

1. Add `overflow-hidden` to the Card: `<Card className="h-full overflow-hidden">`
2. Reduce row padding from `py-2` to `py-1.5` on both header cells and body rows
3. Reduce CardContent bottom padding from `pb-4` to `pb-2`

These spacing tweaks will ensure the header + 5 data rows fit comfortably within the 360px grid cell height, matching the visual density of other widgets like Provider View and Top 5 Accounts.

### Files Changed
- `src/components/dashboard/OnboardingProgressWidget.tsx` (3 small edits)
