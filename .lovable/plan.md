

## Default to Web View After Login

### Problem
When a user logs in via the `/auth` page, two issues arise:
1. If the stored app mode is "adviser" or "client", the `/auth` route itself gets intercepted by the mobile/client shell and never renders the login form
2. After successful login, the user navigates to `/dashboard` but may see the mobile/client shell instead of the web dashboard

### Solution (two changes)

**1. Bypass mode shell for `/auth` route (`src/App.tsx`)**
- Expand the `isRootPath` check to also include `/auth`, `/signup`, and `/signup-confirmation` paths
- Rename to something like `isWebOnlyPath` for clarity
- This ensures auth-related pages always render through the standard BrowserRouter

```text
Before:  const isRootPath = window.location.pathname === "/"
After:   const isWebOnlyPath = ["/", "/auth", "/signup", "/signup-confirmation"].includes(window.location.pathname)
```

Update both mode conditionals to use `!isWebOnlyPath` instead of `!isRootPath`.

**2. Reset mode to "web" on successful login (`src/pages/Auth.tsx`)**
- Import `useAppMode` from the AppModeContext
- In the `onAuthStateChange` callback (and `getSession` check), call `setMode("web")` before navigating to `/dashboard`
- This ensures post-login always lands in the web view regardless of previously stored mode

### Files to Edit
- `src/App.tsx` -- expand path bypass list (1 line change)
- `src/pages/Auth.tsx` -- import `useAppMode`, call `setMode("web")` on login success (3 lines added)

