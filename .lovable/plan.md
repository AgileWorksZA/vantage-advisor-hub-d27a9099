
# Implement Consistent Top Bar Across All Pages

## Overview
Create a shared header component that includes all the dashboard's interactive elements (AdvisorFilter, NotificationDropdown, RegionSelector, and UserMenu) and apply it consistently across all pages. This ensures a unified user experience with the same functionality available everywhere.

## Current State Analysis

The Dashboard page has a fully functional header with:
- **AdvisorFilter**: Interactive multi-select filter with hoverable circular avatars
- **NotificationDropdown**: Grouped notifications with dismiss functionality
- **RegionSelector**: Flag-based country/region picker
- **UserMenu**: Circular avatar dropdown with account settings and sign out

Other pages (Clients, Email, Calendar, Tasks, Insights, Practice, ClientDetail, CommandCenter) have a simplified header with:
- Static hardcoded advisor avatars (non-interactive)
- Static Bell icon with hardcoded count
- Text-based username with separate LogOut button

---

## Implementation Plan

### Step 1: Create a Reusable AppHeader Component

Create `src/components/layout/AppHeader.tsx` that encapsulates all header elements:
- Search input (with configurable placeholder)
- AdvisorFilter component
- NotificationDropdown component
- RegionSelector component (with state management passed via props)
- UserMenu component

```text
+------------------------------------------------------------------+
|  [Search...]              [Advisors] [Bell] [Flag] [Avatar Menu] |
+------------------------------------------------------------------+
```

### Step 2: Update Each Page

For each page, replace the current inline header with the new `AppHeader` component. The pages to update are:

1. **Clients.tsx** - Replace static avatars, Bell, and LogOut with AppHeader
2. **Email.tsx** - Replace static avatars, Bell, and LogOut with AppHeader
3. **Calendar.tsx** - Replace static avatars, Bell, and LogOut with AppHeader
4. **Tasks.tsx** - Replace static avatars, Bell, and LogOut with AppHeader
5. **Insights.tsx** - Replace static avatars, Bell, and LogOut with AppHeader
6. **Practice.tsx** - Replace static avatars, Bell, and LogOut with AppHeader
7. **ClientDetail.tsx** - Replace static avatars, Bell, and LogOut with AppHeader
8. **CommandCenter.tsx** - Add the full header components (currently has minimal header)
9. **Dashboard.tsx** - Refactor to use the shared AppHeader component

### Step 3: Region State Management

Since RegionSelector requires state for the selected region, we have two options:
- **Option A**: Keep region state local to Dashboard only (region selection only affects Dashboard)
- **Option B**: Lift region state to a global context (region selection affects all pages)

For this implementation, we will use **Option A** (local state) as the current architecture keeps region-specific data localized to the Dashboard. Pages that don't need region-specific data will show the RegionSelector as a visual element with a default region.

---

## Technical Details

### New Component: AppHeader.tsx

```typescript
interface AppHeaderProps {
  searchPlaceholder?: string;
  userName: string;
  userEmail?: string;
  onSignOut: () => void;
  selectedRegion?: string;
  onRegionChange?: (region: string) => void;
}
```

This component will:
- Import and render AdvisorFilter, NotificationDropdown, RegionSelector, and UserMenu
- Accept props for customization (search placeholder, user info, region callbacks)
- Provide sensible defaults for optional props

### Changes Per Page

Each page will:
1. Remove inline header JSX containing static avatars and Bell icon
2. Import and use the new AppHeader component
3. Pass the required props (userName, userEmail, onSignOut)
4. For Dashboard specifically, pass region state and callback

---

## Files to Create
- `src/components/layout/AppHeader.tsx` - New shared header component

## Files to Modify
- `src/pages/Dashboard.tsx` - Refactor to use AppHeader
- `src/pages/Clients.tsx` - Replace header with AppHeader
- `src/pages/Email.tsx` - Replace header with AppHeader
- `src/pages/Calendar.tsx` - Replace header with AppHeader
- `src/pages/Tasks.tsx` - Replace header with AppHeader
- `src/pages/Insights.tsx` - Replace header with AppHeader
- `src/pages/Practice.tsx` - Replace header with AppHeader
- `src/pages/ClientDetail.tsx` - Replace header with AppHeader
- `src/pages/CommandCenter.tsx` - Add full header components

---

## Expected Outcome

After implementation:
- All pages will have identical top bar functionality
- Users can filter by advisors from any page
- Notifications are accessible everywhere
- Region selection is available on all pages
- User menu with sign out is consistent across the app
- The sticky header behavior (already implemented) will be preserved
