

## Redirect Client App Profile Avatar to Settings (More Tab)

### Problem
In the Client App header, tapping the user profile avatar (showing initials like "CA") triggers `handleChangeClient()`, which opens the client picker/search screen. The user wants this button to navigate to the "More" tab instead, which already contains Switch Client, Switch to Web, and Switch to Adviser App options.

### Changes

**Edit: `src/components/client-app/ClientApp.tsx`**

- Line 120: Change the `onClick` handler on the profile avatar button from `handleChangeClient` to `() => setActiveTab("more")`
- This navigates to the existing "More" tab which includes:
  - Dark Mode toggle
  - Switch Client button
  - Switch to Web button
  - Switch to Adviser App button
  - Sign Out button

This is a single-line change. The "More" tab already provides a "Switch Client" button that calls `handleChangeClient`, so the client search functionality remains accessible from there.

