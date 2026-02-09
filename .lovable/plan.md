
# Shift Splash Screen Content Downward

## Overview
Move the loading bar, logo, and tagline group lower on the splash screen. The loading bar should sit approximately where the tagline currently is (below center), with the logo and tagline flowing beneath it.

## Current Layout
The content group is vertically centered (`justify-center`) in the screen. This places the loading bar near the center point, with the logo and tagline below it.

## Change
The outer container currently uses `justify-center` which vertically centers the content group. To push the group downward so the loading bar sits lower (roughly where the tagline currently is), we will:

- Replace `justify-center` with `justify-end` on the outer container and add bottom padding (`pb-48` or similar) to position the group in the lower portion of the screen -- OR more precisely:
- Keep `justify-center` but add a top margin (`mt-24` or `mt-32`) to the content group to shift it down from center, so the loading bar lands approximately where the tagline currently sits.

The second approach is cleaner since it preserves the centered layout feel while nudging everything down. A `mt-24` (6rem / 96px) shift should place the loading bar roughly where the tagline is now (the tagline is about 80-100px below center currently given the gap and margins).

## Technical Details

### File: `src/components/mobile/MobileSplashScreen.tsx`
- Add `mt-24` to the content group div (line 23) to shift the entire block (loading bar + logo + tagline) downward
- This keeps all three elements in the same relative order and spacing, just positioned lower on the screen
