
# Constrain Mobile View to Phone-Sized Container

## Overview
Instead of the mobile splash screen and app filling the entire desktop browser window, they will be displayed inside a phone-shaped container centered on the screen, mimicking an iPhone 17 Pro form factor (393 x 852 pixels). The desktop background behind the phone will show a subtle dark gradient.

## What You Will See
- A phone-shaped frame (rounded corners, subtle border/shadow) centered on the desktop screen
- The splash screen and all mobile tabs render inside this frame at realistic phone dimensions
- The surrounding area shows a neutral dark background
- The "Web" button still switches back to the full desktop CRM

## Technical Details

### Dimensions
- **Width**: 393px (iPhone 17 Pro logical width)
- **Height**: 852px (iPhone 17 Pro logical height)
- Phone frame has rounded corners (40px radius), a subtle border, and shadow to give a device-like appearance

### Changes

#### 1. `src/App.tsx`
Wrap the mobile splash and mobile app in a new phone-frame container div:

```text
When mode === "mobile":
  Render a full-screen dark backdrop div (fixed inset-0)
    Inside it, center a phone-frame div:
      - w-[393px] h-[852px]
      - rounded-[40px], overflow-hidden
      - ring/shadow for device outline effect
    Inside the phone-frame, render either MobileSplashScreen or MobileApp
```

#### 2. `src/components/mobile/MobileSplashScreen.tsx`
- Change `fixed inset-0` to relative positioning so it fills the phone container instead of the viewport
- Use `w-full h-full` instead of `fixed inset-0`
- The "powered by Vantage" section changes from `absolute bottom-12` to a flex-based layout within the container

#### 3. `src/components/mobile/MobileApp.tsx`
- Change `fixed inset-0` to relative positioning (`w-full h-full`) so it fills the phone container
- The header and bottom nav remain sticky within the phone frame
- Content scrolls within the phone-sized area

### No Other Files Affected
The individual tab components (MobileTodayTab, MobileClientsTab, etc.) don't use fixed positioning -- they render inside the MobileApp's scrollable main area, so they automatically adapt to the constrained size.
