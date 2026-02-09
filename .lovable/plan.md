

# Mobile App UI Improvements

## Overview
Three changes to the mobile companion app:
1. Move the splash screen text ("Your Advice Companion") to below the loading bar
2. Replace the "Web" button in the mobile header with a Settings gear icon
3. Tapping the Settings gear opens a popover menu matching the web UserMenu (avatar, user info, Web/Mobile toggle, Account Settings, Dark Mode toggle, AI Assistant toggle, Sign Out)

## Changes

### 1. Splash Screen Layout (`src/components/mobile/MobileSplashScreen.tsx`)

Move the tagline text ("Your Advice Companion") from its current position (above the loading bar) to below the loading bar. The order will become:
- AdvisorFirst logo text
- Loading bar
- "Your Advice Companion" tagline (moved below)
- "Powered by Vantage" at the bottom

### 2. Mobile Header Settings Button (`src/components/mobile/MobileApp.tsx`)

- Remove the "Web" outline button with the Monitor icon from the header
- Replace it with a Settings (gear) icon button in the same top-right position
- The Bell notification icon stays as-is
- Add a settings popover/sheet that opens when the gear is tapped

### 3. Mobile Settings Menu (new component: `src/components/mobile/MobileSettingsMenu.tsx`)

Create a new component that replicates the web UserMenu functionality in a mobile-friendly format. It will use a Popover (same as web) triggered by the gear icon and include:

- **User Info Header**: Purple avatar circle with initial, user name, email, and Web/Mobile toggle pills
- **Account Settings**: Button row (navigates to account settings -- in mobile context, switches to web mode to show settings page)
- **Dark Mode**: Toggle row with Sun/Moon icon and Switch component (uses `next-themes` useTheme)
- **AI Assistant**: Toggle row with Sparkles icon and Switch component (uses localStorage event pattern)
- **Sign Out**: Button row that calls `supabase.auth.signOut()`

The component will:
- Fetch the current user from Supabase auth (`supabase.auth.getUser()`) to display name and email
- Use the same `useTheme` hook from `next-themes` for dark mode toggling
- Use the same `useAppMode` context for Web/Mobile switching
- Use the same localStorage event pattern (`ai-chat-toggle`) for AI Assistant toggling

### 4. Dark Mode Support for Mobile

Dark mode already works across the entire app via the `ThemeProvider` wrapping the root `App` component with `attribute="class"`. Since the mobile components use Tailwind's semantic color classes (`bg-background`, `text-foreground`, `border-border`, etc.), dark mode will automatically apply when the theme is toggled. The splash screen uses hardcoded gradient colors which are intentionally dark-themed and won't need changes.

## Technical Details

### MobileSplashScreen.tsx Changes
```text
Before:
  Logo -> Tagline -> Loading bar -> Powered by

After:
  Logo -> Loading bar -> Tagline -> Powered by
```

Simply reorder the JSX -- move the tagline paragraph below the loading bar div.

### MobileApp.tsx Changes
- Remove `Monitor` import, add `Settings` import from lucide-react
- Remove the "Web" Button
- Add the new `MobileSettingsMenu` component in its place
- The component handles its own popover state and auth

### MobileSettingsMenu.tsx (New File)
- Uses Popover from `@/components/ui/popover` for the dropdown
- Triggered by a gear icon button (`Settings` from lucide-react)
- Fetches user via `supabase.auth.getUser()` on mount
- Reads profile display name from the `profiles` table (or falls back to email)
- Contains the same menu items as the web UserMenu
- The "Account Settings" option switches to web mode (since account settings is a full web page)
- Sign Out calls `supabase.auth.signOut()` and switches to web mode (which will redirect to auth page)

### Backwards Compatibility
- All existing users (including nico@advizorstack.com) get the same mobile settings experience
- Dark mode toggle works for both web and mobile since it uses the shared ThemeProvider
- No changes to the web UserMenu component

