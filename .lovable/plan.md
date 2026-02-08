
# Allow Jurisdiction Change on Any Screen with Navigation Warnings

## Overview

Three interconnected changes:

1. Make the **Region Selector** work on every page (currently only functional on Dashboard)
2. **Remember advisor selections per jurisdiction** so switching back restores previous choices
3. **Show warning dialogs** when changing jurisdiction or advisor selection while on a sub-page (e.g., client detail, email view, compose email)

---

## Current State

- The `RegionSelector` component receives `selectedRegion` and `onRegionChange` as **props** from each page
- **Only the Dashboard** passes these props -- all other pages (Clients, Email, Tasks, Calendar, etc.) use the `AppHeader` defaults (`selectedRegion="ZA"`, `onRegionChange={() => {}}`)
- This means the region selector is **non-functional** on every page except Dashboard
- The `AdvisorFilter` already works everywhere because it reads directly from `useRegion()` context
- Advisor selections are stored as a single flat array in localStorage -- switching jurisdiction resets all advisors to "all"

---

## Part 1: Region Selector Uses Context Directly

**File: `src/components/dashboard/RegionSelector.tsx`**

- Remove the `selectedRegion` and `onRegionChange` props
- Import and use `useRegion()` context directly (same pattern as `AdvisorFilter`)
- Add `useLocation()` from react-router-dom to detect the current page
- Before changing region, check if the user is on a non-landing sub-page -- if so, show a warning dialog before proceeding

**File: `src/components/layout/AppHeader.tsx`**

- Remove `selectedRegion` and `onRegionChange` props from the interface
- Remove these props from the `RegionSelector` usage (it now self-manages via context)

**File: `src/pages/Dashboard.tsx`**

- Remove `selectedRegion` and `onRegionChange` props from the `AppHeader` usage (no longer needed)

---

## Part 2: Remember Advisor Selection Per Jurisdiction

**File: `src/contexts/RegionContext.tsx`**

Change the advisor persistence strategy:

- **Before**: Single localStorage key `vantage-selected-advisors` storing a flat array like `["JB", "SM"]`
- **After**: Single localStorage key `vantage-selected-advisors-map` storing a per-jurisdiction map:
  ```text
  { "ZA": ["JB", "SM"], "AU": ["JM", "AT"], "CA": ["PT", "ML"], ... }
  ```
- When switching jurisdictions, save the current advisor selection under the old jurisdiction key, then restore the saved selection for the new jurisdiction (or default to all advisors if none saved)
- On initialization, read the map and extract the correct advisor list for the current region

---

## Part 3: Navigation Warning Dialogs

### 3a. Define "Landing Pages" vs "Sub-Pages"

Landing pages are the 8 left nav bar destinations (no warning needed):
- `/dashboard`, `/clients`, `/portfolio`, `/email`, `/calendar`, `/tasks`, `/insights`, `/practice`

Sub-pages (warning required):
- `/clients/:clientId` -- parent: `/clients`
- `/email/view/:id` -- parent: `/email`
- `/email/compose` -- parent: `/email`
- `/command-center` -- parent: `/dashboard`
- `/administration/*` -- parent: `/dashboard`
- `/ai-assistant` -- parent: `/dashboard`

### 3b. New Component: `NavigationWarningDialog`

**File: `src/components/layout/NavigationWarningDialog.tsx`** (new)

A reusable AlertDialog that displays:
- Title: "Leave this page?"
- Message: "Changing your [jurisdiction/advisor selection] will discard any unsaved changes on this page. You will be returned to [landing page name]."
- Two buttons: "Cancel" and "Continue"

### 3c. Region Selector Warning Integration

**File: `src/components/dashboard/RegionSelector.tsx`**

- When the user clicks a different jurisdiction:
  1. Check current route via `useLocation()`
  2. If on a landing page: change immediately (no warning)
  3. If on a sub-page: open the `NavigationWarningDialog`
     - On "Continue": apply the region change and navigate to the parent landing page
     - On "Cancel": close the dialog, no change

### 3d. Advisor Filter Warning Integration

**File: `src/components/dashboard/AdvisorFilter.tsx`**

- When the user **deselects** an advisor while on a client detail page (`/clients/:clientId`):
  1. Determine the client's advisor (from the client data or URL context)
  2. If the advisor being deselected owns the currently viewed client, show the `NavigationWarningDialog`
     - On "Continue": apply the advisor deselection and navigate to `/clients`
     - On "Cancel": close the dialog, keep the advisor selected
- The check is performed using a new context value: `currentClientAdvisor` set by the `ClientDetail` page via a shared ref or context update
- Alternatively, a simpler approach: show the warning whenever **any** advisor is deselected while on a sub-page (not just the current client's advisor), since deselecting advisors on a client page always risks losing context

**Simplified rule**: If on any non-landing page and the user deselects an advisor (or toggles "All" off), show the warning. This is consistent with the jurisdiction behavior and avoids complex client-advisor ownership lookups in the filter component.

---

## Part 4: Context Enhancement for Sub-Page Detection

**File: `src/hooks/useNavigationWarning.ts`** (new)

A custom hook that provides:
- `isLandingPage`: boolean -- is the current route a landing page?
- `parentLandingPage`: string -- the path to navigate to if leaving (e.g., `/clients` for `/clients/:id`)
- `parentLandingLabel`: string -- human-readable name (e.g., "Clients" for `/clients`)

This hook is used by both `RegionSelector` and `AdvisorFilter` to determine whether to show warnings.

---

## Files Summary

| File | Action |
|------|--------|
| `src/hooks/useNavigationWarning.ts` | New -- hook to detect sub-pages and resolve parent landing pages |
| `src/components/layout/NavigationWarningDialog.tsx` | New -- reusable warning dialog component |
| `src/components/dashboard/RegionSelector.tsx` | Rewrite to use context directly; add warning logic for sub-pages |
| `src/components/dashboard/AdvisorFilter.tsx` | Add warning logic when deselecting advisors on sub-pages |
| `src/contexts/RegionContext.tsx` | Change advisor storage to per-jurisdiction map |
| `src/components/layout/AppHeader.tsx` | Remove `selectedRegion` and `onRegionChange` props |
| `src/pages/Dashboard.tsx` | Remove `selectedRegion` and `onRegionChange` from AppHeader usage |

---

## Technical Details

### Navigation Warning Hook Logic

```text
Landing pages (exact match):
  /dashboard, /clients, /portfolio, /email, /calendar, /tasks, /insights, /practice

Parent resolution:
  /clients/:id     -> /clients  (label: "Clients")
  /email/view/:id  -> /email    (label: "Messages")
  /email/compose   -> /email    (label: "Messages")
  /command-center  -> /dashboard (label: "Dashboard")
  /administration* -> /dashboard (label: "Dashboard")
  /ai-assistant    -> /dashboard (label: "Dashboard")
  (any other)      -> /dashboard (label: "Dashboard")
```

### Per-Jurisdiction Advisor Storage Format

```text
Key: "vantage-advisor-selections"
Value: {
  "ZA": ["JB", "SM", "LN"],
  "AU": ["JM", "AT"],
  "CA": ["PT", "ML", "SK"],
  "GB": ["WS", "EJ", "AB"],
  "US": ["MJ", "SR", "DP"]
}
```

When switching from ZA to AU:
1. Save current ZA selection to the map
2. Look up AU entry in the map
3. If found, restore those advisors
4. If not found, default to all AU advisors

### Warning Dialog Message Examples

**Jurisdiction change:**
"Switching jurisdiction will discard any unsaved changes on this page. You will be returned to the Clients list."

**Advisor deselection:**
"Changing your advisor selection will discard any unsaved changes on this page. You will be returned to the Clients list."
