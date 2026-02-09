

# Align Mobile Settings Styling with Web UserMenu

## Overview
Update the mobile settings page user info section to match the web settings popover styling exactly -- same avatar colors, email color, and spacing.

## Differences to Fix

| Element | Mobile (current) | Web (target) |
|---------|-----------------|--------------|
| Avatar background | `bg-primary` | `bg-purple-500` |
| Avatar text color | `text-primary-foreground` | `text-white` |
| Email text color | `text-primary mt-0.5` | `text-purple-500` (no mt-0.5) |
| User info padding | `py-6` | `py-4` |
| Web/Mobile toggle margin | `mt-4` | `mt-3` |

## Technical Details

### File: `src/components/mobile/MobileSettingsMenu.tsx`

Four small changes in the user info section (lines 93-127):

1. **Line 93**: Change `py-6` to `py-4` on the user info container
2. **Line 94**: Change avatar from `bg-primary text-primary-foreground` to `bg-purple-500 text-white`
3. **Line 99**: Change email from `text-primary mt-0.5` to `text-purple-500` (remove mt-0.5)
4. **Line 102**: Change toggle margin from `mt-4` to `mt-3`
