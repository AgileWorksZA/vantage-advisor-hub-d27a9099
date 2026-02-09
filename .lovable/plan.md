

## Match Onboarding Widget Styling to Birthdays Widget

### Problem
The onboarding progress widget doesn't visually match the birthdays widget despite having the same grid dimensions (w:3, h:3). The styles diverge in several places.

### Solution
Align the onboarding widget's internal styling to exactly match the birthdays widget pattern:

**File: `src/components/dashboard/OnboardingProgressWidget.tsx`**

1. Remove `overflow-hidden` from the Card (birthdays uses just `h-full`)
2. Change `CardContent` padding from `px-4 pb-2` to `px-4 pb-4` (match birthdays)
3. Change table font from `text-xs` back to `text-sm` (match birthdays)
4. Change header padding from `pb-1.5` to `pb-2` (match birthdays)
5. Keep row padding at `py-1.5` (already matches birthdays)

These changes make the internal structure identical to the birthdays widget:
- `Card className="h-full"`
- `CardContent className="px-4 pb-4"`
- `table className="w-full text-sm"`
- Header cells: `pb-2`
- Body cells: `py-1.5`

### Files Changed
- `src/components/dashboard/OnboardingProgressWidget.tsx` (revert to match birthdays pattern)
