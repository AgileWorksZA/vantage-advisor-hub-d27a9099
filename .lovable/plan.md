

## Fix Navigation to Root Landing Page "/"

### Problem
The `AppModeContext` persists the app mode ("web", "adviser", or "client") in `localStorage`. When `mode` is "adviser" or "client", the `AppContent` component in `App.tsx` renders the mobile/client shell **instead of** the `BrowserRouter` routes. This means the "/" landing page is completely inaccessible once a user switches to adviser or client mode.

### Solution
Update `AppContent` in `src/App.tsx` to check the current URL. If the path is exactly "/", always render the standard web routes (the `BrowserRouter`) regardless of the stored mode. This ensures the marketing/landing page at "/" is always reachable.

### Changes

**Edit: `src/App.tsx`**

- At the top of `AppContent`, read `window.location.pathname`
- If the pathname is exactly `"/"`, skip the adviser/client mode rendering and fall through to the `BrowserRouter` with all routes
- The adviser and client mode blocks remain unchanged for all other paths

### Technical Detail

```text
Before (simplified):
  if mode === "adviser" -> render MobileApp
  if mode === "client"  -> render ClientApp
  else                  -> render BrowserRouter

After:
  isRootPath = window.location.pathname === "/"
  if mode === "adviser" AND NOT isRootPath -> render MobileApp
  if mode === "client"  AND NOT isRootPath -> render ClientApp
  else                                    -> render BrowserRouter
```

This is a two-line change -- add one variable and add `&& !isRootPath` to both mode conditionals.

