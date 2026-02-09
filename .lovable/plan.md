

## Allow User to Set Calendar Timezone with Persistence

### Problem
The timezone indicator in the calendar header is currently read-only, showing only the abbreviation (e.g., "SAST"). Users cannot change their timezone, and event times are always displayed in the browser's local time.

### Solution
Replace the static timezone badge with a dropdown selector containing all major world timezones. When the user selects a timezone, event times will be displayed in that timezone, and the selection will be persisted to the `user_settings.timezone` column so it's remembered across sessions and page navigations.

### Changes

**1. Expand timezone list (`src/lib/timezone-utils.ts`)**
- Add all major world timezones (~30-40 entries covering all continents) to the `COMMON_TIMEZONES` array
- Add a helper function `convertToTimezone(date: Date, timezone: string): Date` that shifts a UTC date to display in the target timezone
- Group timezones by region (Americas, Europe, Africa, Asia/Pacific) for easier browsing

**2. Update Calendar page (`src/pages/Calendar.tsx`)**
- Replace the static timezone badge (lines 533-536) with a `Select` dropdown using the expanded `COMMON_TIMEZONES` list
- Add local state `displayTimezone` initialized from `userSettings?.timezone` or the region default
- On timezone change: call `upsertSettings.mutate({ timezone: newValue })` to persist, and update local state immediately
- Apply timezone conversion to all displayed event times: wrap `event.startTime` and `event.endTime` through the conversion helper before rendering in month/week/day views and the upcoming events sidebar
- Pass the display timezone to `WeekView` and `DayView` components

**3. Update WeekView (`src/components/calendar/WeekView.tsx`)**
- Accept a `displayTimezone` prop
- Apply timezone offset to event start/end times for positioning and display

**4. Update DayView (`src/components/calendar/DayView.tsx`)**
- Accept a `displayTimezone` prop
- Apply timezone offset to event start/end times for positioning and display

### Timezone Conversion Approach
Since events are stored as UTC ISO strings in the database, we'll use `Intl.DateTimeFormat` to calculate the UTC offset for the target timezone and shift the Date objects accordingly. This gives accurate display without needing a heavy library like `date-fns-tz`.

### Timezone List (major zones to include)
Americas: New York, Chicago, Denver, Los Angeles, Anchorage, Honolulu, Toronto, Vancouver, Mexico City, Sao Paulo, Buenos Aires  
Europe: London, Paris, Berlin, Madrid, Rome, Amsterdam, Stockholm, Helsinki, Athens, Moscow  
Africa: Johannesburg, Cairo, Lagos, Nairobi  
Asia/Pacific: Dubai, Mumbai, Kolkata, Singapore, Hong Kong, Tokyo, Seoul, Shanghai, Sydney, Melbourne, Auckland, Fiji

### Persistence
- Uses existing `user_settings.timezone` column (already in the schema)
- Uses existing `useUserSettings` hook with `upsertSettings` mutation
- On first load: falls back to jurisdiction default, then UTC
- On change: immediately updates local state + saves to database
