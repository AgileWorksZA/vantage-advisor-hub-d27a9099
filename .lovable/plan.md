

# Calendar Timezones, Account Settings Page, and Password Change

## Overview

Three major additions:

1. **Timezone support for calendar events** -- Add a timezone field to events with per-jurisdiction defaults, and a user-configurable default timezone saved to their profile
2. **Account Settings page** -- A new dedicated page (`/account-settings`) accessible from the user menu, containing profile management, password change, timezone preferences, notification settings, and display preferences
3. **Password change** -- A secure password update section within Account Settings, allowing users to resolve the leaked password warning on the demo account

---

## Part 1: Database Migration

### 1a. Extend `user_settings` table

Add new columns to store user preferences:

```text
ALTER TABLE user_settings ADD COLUMN timezone TEXT DEFAULT NULL;
ALTER TABLE user_settings ADD COLUMN display_name TEXT DEFAULT NULL;
ALTER TABLE user_settings ADD COLUMN notification_email BOOLEAN DEFAULT TRUE;
ALTER TABLE user_settings ADD COLUMN notification_task_reminders BOOLEAN DEFAULT TRUE;
ALTER TABLE user_settings ADD COLUMN notification_calendar_reminders BOOLEAN DEFAULT TRUE;
ALTER TABLE user_settings ADD COLUMN notification_client_updates BOOLEAN DEFAULT TRUE;
ALTER TABLE user_settings ADD COLUMN notification_compliance_alerts BOOLEAN DEFAULT TRUE;
ALTER TABLE user_settings ADD COLUMN date_format TEXT DEFAULT 'dd/MM/yyyy';
ALTER TABLE user_settings ADD COLUMN time_format TEXT DEFAULT '24h';
ALTER TABLE user_settings ADD COLUMN default_calendar_view TEXT DEFAULT 'month';
```

### 1b. Add `timezone` column to `calendar_events`

```text
ALTER TABLE calendar_events ADD COLUMN timezone TEXT DEFAULT NULL;
```

This stores the timezone for each individual event (e.g., "Africa/Johannesburg"). When NULL, the event uses the user's default timezone.

No new RLS policies needed -- existing policies on both tables already scope to `auth.uid() = user_id`.

---

## Part 2: Default Timezone Per Jurisdiction

Define a mapping of region codes to IANA timezone strings:

| Region | Default Timezone |
|--------|-----------------|
| ZA | Africa/Johannesburg |
| AU | Australia/Sydney |
| CA | America/Toronto |
| GB | Europe/London |
| US | America/New_York |

**Logic**: The calendar will determine the active timezone in this priority order:
1. User's saved timezone in `user_settings.timezone` (master record, set via Account Settings)
2. If NULL, fall back to the jurisdiction's default from the mapping above

---

## Part 3: Calendar Timezone Integration

### 3a. Display timezone indicator on calendar

**File: `src/pages/Calendar.tsx`**

- Show the current timezone abbreviation (e.g., "SAST", "AEST", "EST") in the calendar header bar, next to the view mode buttons
- Add a small globe icon with the timezone label
- The displayed timezone is derived from the user's settings or the jurisdiction default
- Read `useUserSettings()` to get `settings.timezone`, fall back to region default

### 3b. Event creation dialog -- timezone selector

**File: `src/pages/Calendar.tsx`** (create event dialog)

- Add a timezone dropdown below the time fields in the "Create New Event" dialog
- Pre-populated with the user's default timezone
- User can override per-event (e.g., scheduling a meeting in a different timezone)
- Common timezones listed: Africa/Johannesburg, Australia/Sydney, America/Toronto, Europe/London, America/New_York, plus Pacific/Auckland, Asia/Singapore, America/Los_Angeles, America/Chicago

### 3c. Event detail sheet -- show timezone

**File: `src/pages/Calendar.tsx`** (event detail sheet)

- Display the event's timezone alongside the time (e.g., "9:00 AM - 10:00 AM SAST")
- If the event timezone differs from the user's default, show both for clarity

### 3d. Hook updates

**File: `src/hooks/useCalendarEvents.ts`**

- Add `timezone` field to `CalendarEvent` interface
- Include `timezone` in create/update operations
- Map `timezone` from database response

---

## Part 4: Account Settings Page

### 4a. New page: `src/pages/AccountSettings.tsx`

A dedicated page with tabs/sections:

**Profile Section**
- Display name (editable text field, saved to `user_settings.display_name`)
- Email address (read-only, from auth)
- Business name (from `profiles.business_name`)

**Security Section**
- Change Password form:
  - Current password field (not required by Supabase `updateUser` but good UX practice -- we will verify by re-authenticating)
  - New password field with validation (same rules as signup: min 8 chars, uppercase, lowercase, number)
  - Confirm new password field
  - "Update Password" button
  - Uses `supabase.auth.updateUser({ password: newPassword })`
  - Shows success/error toast

**Timezone & Regional Section**
- Default timezone selector (dropdown with common IANA timezones)
- Date format preference (dd/MM/yyyy, MM/dd/yyyy, yyyy-MM-dd)
- Time format preference (12h / 24h)
- Default calendar view (Month / Week / Day)

**Notification Preferences Section**
- Email notifications toggle (master switch)
- Task reminder notifications toggle
- Calendar reminder notifications toggle
- Client update notifications toggle
- Compliance alert notifications toggle

**Email Settings Section**
- Email signature (existing field from `user_settings.email_signature`)
- Default "From" as primary adviser toggle (existing field)

### 4b. Route registration

**File: `src/App.tsx`**

Add route: `<Route path="/account-settings" element={<AccountSettings />} />`

### 4c. Update navigation

**File: All pages with `onAccountSettings`**

Change `onAccountSettings={() => navigate("/practice")}` to `onAccountSettings={() => navigate("/account-settings")}` across all pages (Dashboard, Clients, Email, Calendar, Tasks, Insights, Portfolio, CommandCenter, ClientDetail, EmailView, ComposeEmail, Practice, Administration).

### 4d. Update `useNavigationWarning.ts`

Add `/account-settings` as a landing page (no warning needed when navigating to it).

---

## Part 5: Update `useUserSettings` Hook

**File: `src/hooks/useUserSettings.ts`**

- Expand the `UserSettings` interface to include all new columns:
  - `timezone`, `display_name`, `notification_email`, `notification_task_reminders`, `notification_calendar_reminders`, `notification_client_updates`, `notification_compliance_alerts`, `date_format`, `time_format`, `default_calendar_view`
- The existing upsert mutation already handles partial updates, so no logic changes needed

---

## Files Summary

| File | Action |
|------|--------|
| Database migration | Add columns to `user_settings` and `calendar_events` |
| `src/pages/AccountSettings.tsx` | **New** -- full account settings page with profile, security, timezone, notifications |
| `src/hooks/useUserSettings.ts` | Expand interface with new fields |
| `src/hooks/useCalendarEvents.ts` | Add `timezone` to interfaces and CRUD operations |
| `src/pages/Calendar.tsx` | Add timezone indicator in header, timezone selector in create dialog, timezone in event detail |
| `src/App.tsx` | Add `/account-settings` route |
| `src/hooks/useNavigationWarning.ts` | Add `/account-settings` as landing page |
| `src/pages/Dashboard.tsx` | Change `onAccountSettings` to navigate to `/account-settings` |
| `src/pages/Clients.tsx` | Change `onAccountSettings` navigation |
| `src/pages/Email.tsx` | Change `onAccountSettings` navigation |
| `src/pages/Calendar.tsx` | Change `onAccountSettings` navigation |
| `src/pages/Tasks.tsx` | Change `onAccountSettings` navigation |
| `src/pages/Insights.tsx` | Change `onAccountSettings` navigation |
| `src/pages/Portfolio.tsx` | Change `onAccountSettings` navigation |
| `src/pages/CommandCenter.tsx` | Change `onAccountSettings` navigation |
| `src/pages/ClientDetail.tsx` | Change `onAccountSettings` navigation |
| `src/pages/EmailView.tsx` | Change `onAccountSettings` navigation |
| `src/pages/ComposeEmail.tsx` | Change `onAccountSettings` navigation |
| `src/pages/Practice.tsx` | Change `onAccountSettings` navigation |
| `src/pages/Administration.tsx` | Change `onAccountSettings` navigation |

---

## Technical Details

### Timezone Constants

```text
REGION_DEFAULT_TIMEZONES = {
  ZA: "Africa/Johannesburg",
  AU: "Australia/Sydney",
  CA: "America/Toronto",
  GB: "Europe/London",
  US: "America/New_York"
}

COMMON_TIMEZONES = [
  "Africa/Johannesburg",
  "Australia/Sydney",
  "America/Toronto",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Pacific/Auckland",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Europe/Paris",
  "Europe/Berlin"
]
```

### Password Change Flow

1. User enters new password + confirmation
2. Client-side validation (same zod schema as Auth page)
3. Call `supabase.auth.updateUser({ password: newPassword })`
4. On success: show toast, clear form
5. On error: show error toast with message

### Timezone Display Helper

A utility function `getTimezoneAbbreviation(ianaTimezone: string)` that returns the short label (e.g., "SAST", "AEST", "EST") using `Intl.DateTimeFormat` with `timeZoneName: "short"`.

