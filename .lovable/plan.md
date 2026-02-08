
# Align Tasks, Calendar, and Messages to Advisor/Jurisdiction Filters

## Current State

After verifying the database and all screen implementations:

- **Data is solid**: 553 active clients across 25 advisors (5 per jurisdiction, 20+ each), all with ID numbers, emails, and phone numbers populated.
- **Dashboard**: Already aligned -- uses `filteredRegionalData` from RegionContext for all widgets.
- **Clients**: Already aligned -- filters by `selectedAdvisorNames` from RegionContext (lines 278-282).
- **Calendar**: NOT aligned -- `useCalendarEvents` only filters by `user_id`, ignores advisor/jurisdiction.
- **Email/Messages**: NOT aligned -- `useEmails` fetches all emails regardless of advisor/jurisdiction.
- **Tasks**: NOT aligned -- `useTasksEnhanced` fetches all 500 tasks regardless of advisor/jurisdiction. Tasks are linked to clients via `client_id`, and those clients have advisors, but no filtering is applied.
- **1 client** (Jennifer Kim, US/Jennifer Williams) is missing an `id_number` -- needs a fix in the seed function or a direct database update.

## Changes Required

### 1. Fix missing ID number for Jennifer Kim (database)

Run a direct SQL update to set `id_number` for the single remaining client missing it.

### 2. Add advisor/jurisdiction filtering to Tasks page

**File: `src/pages/Tasks.tsx`**

- Import `useRegion` and `useClients`
- Get `selectedAdvisors` and `regionalData` from RegionContext
- Map selected advisor initials to full names
- Filter the `tasks` array client-side: for each task with a `client_id`, check if that client's advisor is in the selected advisors list
- Tasks without a `client_id` (practice tasks) will remain visible regardless of filter

**File: `src/hooks/useTasksEnhanced.ts`**

- Extend the Supabase query to also fetch the client's `advisor` field via the join
- Add `client_advisor` to the `EnhancedTask` interface so the page can filter on it

### 3. Add advisor/jurisdiction filtering to Calendar page

**File: `src/pages/Calendar.tsx`**

- Import `useRegion`
- Get `selectedAdvisors` and `regionalData` from RegionContext
- Map selected advisor initials to full names
- Filter `events` client-side: for events with a `clientId`, look up the client's advisor; for events without a client (personal/team), keep them visible

**File: `src/hooks/useCalendarEvents.ts`**

- Extend the Supabase query to also fetch the client's `advisor` field
- Add `clientAdvisor` to the `CalendarEvent` interface

### 4. Add advisor/jurisdiction filtering to Email page

**File: `src/pages/Email.tsx`**

- Import `useRegion`
- Get `selectedAdvisors` and `regionalData` from RegionContext
- Map selected advisor initials to full names
- Filter emails client-side by matching the sender's email against the client database, then checking if that client's advisor is in the selected list
- Emails not matched to any client remain visible

**File: `src/hooks/useEmails.ts`**

- Extend client matching to also include the advisor field
- Return advisor information in `EmailListItem` so the page can filter

### 5. Ensure RegionSelector and AdvisorFilter are connected on all pages

Currently the `AppHeader` renders the `RegionSelector` and `AdvisorFilter` on every page. The `RegionSelector` receives `selectedRegion` and `onRegionChange` as props but the Calendar, Tasks, and Email pages don't pass them through -- they rely on defaults. However, since `AdvisorFilter` reads directly from `useRegion()` context, and `RegionSelector` also has access via context, the header components are already globally connected.

No changes needed to the header components -- they already work through the context.

## Files Summary

| File | Action |
|------|--------|
| `src/hooks/useTasksEnhanced.ts` | Add `client_advisor` to query join and interface |
| `src/pages/Tasks.tsx` | Import `useRegion`, filter tasks by selected advisors |
| `src/hooks/useCalendarEvents.ts` | Add `clientAdvisor` to query join and interface |
| `src/pages/Calendar.tsx` | Import `useRegion`, filter events by selected advisors |
| `src/hooks/useEmails.ts` | Add advisor info to client matching |
| `src/pages/Email.tsx` | Import `useRegion`, filter emails by selected advisors |
| Database | Fix 1 missing `id_number` for Jennifer Kim |

## Expected Result

After implementation, switching the jurisdiction selector (e.g., from ZA to AU) or toggling advisors in the filter will instantly update:
- **Dashboard** -- already works
- **Clients** -- already works
- **Tasks** -- will show only tasks linked to clients of the selected advisors
- **Calendar** -- will show only events linked to clients of the selected advisors (plus personal/team events)
- **Messages** -- will show only emails matched to clients of the selected advisors (plus unmatched emails)
