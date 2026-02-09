

# Fix Vantage Logo Size -- Actual 15% Increase

## Problem
The logo was already `h-[46px]` across all files before the previous change was applied, so no visible increase occurred. The change was a no-op.

## Solution
Increase the logo height from `h-[46px]` to `h-[53px]` (46 * 1.15 = 52.9, rounded to 53px). This applies a true 15% increase from the current size.

## Files to Update (14 files)

Every file containing the Vantage logo in the sidebar needs `h-[46px]` changed to `h-[53px]`:

1. `src/pages/Dashboard.tsx`
2. `src/pages/Clients.tsx`
3. `src/pages/Portfolio.tsx`
4. `src/pages/Email.tsx`
5. `src/pages/EmailView.tsx`
6. `src/pages/Calendar.tsx`
7. `src/pages/Tasks.tsx`
8. `src/pages/Insights.tsx`
9. `src/pages/Practice.tsx`
10. `src/pages/ClientDetail.tsx`
11. `src/pages/AccountSettings.tsx`
12. `src/pages/Administration.tsx`
13. `src/pages/ComposeEmail.tsx`
14. `src/components/layout/AppLayout.tsx`

Each change is a single class update: `h-[46px]` to `h-[53px]`. The `object-contain` class preserves aspect ratio automatically. The mobile splash screen logo (`MobileSplashScreen.tsx`) is excluded as it uses a different size/style.
