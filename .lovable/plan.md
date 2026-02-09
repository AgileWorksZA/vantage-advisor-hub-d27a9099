

# Reorder Mobile Splash Screen Elements

## Overview
Rearrange the splash screen layout so the loading bar appears first (at the top of the centered group), followed by the AdvisorFirst logo, then the tagline.

## Current Order
1. AdvisorFirst logo
2. Loading bar
3. Tagline ("Your Advice Companion")

## New Order
1. Loading bar
2. AdvisorFirst logo
3. Tagline ("Your Advice Companion")

(The "Powered by Vantage" footer stays at the bottom, unchanged.)

## Technical Details

### File: `src/components/mobile/MobileSplashScreen.tsx`

Reorder the three child blocks inside the centered `div` (lines 24-55):

- Move the **loading bar** block (lines 42-50) to the top, before the AdvisorFirst logo
- Keep the **AdvisorFirst logo** block (lines 24-40) in the middle
- Keep the **tagline** block (lines 52-55) at the bottom

The `mt-8` spacing on the loading bar will be removed (since it's now at the top), and a small margin-top will be added to the logo instead to maintain visual spacing between the elements.

