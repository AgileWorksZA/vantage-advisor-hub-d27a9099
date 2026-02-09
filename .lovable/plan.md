

# Fix Settings Menu: Full-Screen View Instead of Popover

## Problem
The settings gear button does nothing when tapped. This is because the `Popover` component renders via a React portal at the document body level, which places it **outside** the constrained phone frame container (393x852px with `overflow-hidden`). The popover content is technically there but invisible -- it renders behind the phone frame or off-screen.

## Solution
Replace the popover-based settings menu with a **full-screen settings view** that renders inside the mobile app's content area (within the phone frame). When the user taps the gear icon, the entire main area slides to a settings screen. A back arrow at the top lets the user return to whatever tab they were on.

## What You Will See
- Tapping the gear icon shows a full-screen settings page inside the phone frame
- A back button (left arrow) in the top-left corner returns you to the previous tab
- The settings screen matches the reference image: avatar with initial, user name, email, Web/Mobile toggle, Account Settings, Dark Mode toggle, AI Assistant toggle, and Sign Out
- The bottom tab bar is hidden while settings is open for a clean full-screen feel

## Technical Changes

### 1. Refactor `MobileSettingsMenu.tsx` to `MobileSettingsScreen.tsx`
- Remove the `Popover` wrapper entirely
- Convert to a full-screen component that receives an `onBack` callback prop
- Layout: header bar with back arrow and "Settings" title, then the settings content (avatar, toggles, sign out) taking the full screen
- Keep all existing logic (theme toggle, AI toggle, sign out, account settings, mode switch)

### 2. Update `MobileApp.tsx`
- Add a `showSettings` boolean state
- When `showSettings` is true, render the settings screen instead of the tab content
- The header gear icon sets `showSettings = true`
- The settings screen's back button sets `showSettings = false`
- Hide the bottom tab bar when settings is visible
- The gear icon in the header becomes a simple button that toggles this state (no popover needed)

### Files Modified
- `src/components/mobile/MobileSettingsMenu.tsx` -- rewritten as a full-screen settings view
- `src/components/mobile/MobileApp.tsx` -- add settings state management and conditional rendering
