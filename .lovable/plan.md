

## Calendar Improvements: Locations, Event Detail Editing, and Overlap Prevention

### 1. Seed Zoom/Google Maps links into Location field

**File**: New temporary edge function `supabase/functions/seed-calendar-locations/index.ts`

Update all existing calendar events to have a location field populated:
- ~50% of events get a Zoom link (e.g., `https://zoom.us/j/{random-id}`)
- ~50% get a Google Maps link (e.g., `https://maps.google.com/?q=Office+Name+City`)
- Vary the locations by jurisdiction (e.g., ZA events get Johannesburg/Cape Town offices, US events get New York/Chicago offices, etc.)

Deploy, invoke on Test and Production, then clean up.

### 2. Make Event Detail Sheet editable (same fields as Create dialog)

**File**: `src/pages/Calendar.tsx`

Currently, clicking an existing event opens a read-only `Sheet` (lines 717-817) showing title, time, location, client, description, and meeting recorder. The Create dialog (lines 820-997) has editable fields for title, event type, start/end date+time, timezone, client, location, description, and all-day checkbox.

Changes:
- Add edit mode state (`isEditingEvent`) and a mutable `editEvent` state object
- Add an "Edit" button in the event detail sheet that switches to edit mode
- In edit mode, render the same form fields as the Create dialog (title, event type, start/end date+time, timezone, client selector, location, description, all-day checkbox)
- Add "Save" and "Cancel" buttons that call `updateEvent()` or revert
- Keep the read-only view as default, with the Edit button toggling to the form

### 3. Fix overlapping events in Week and Day views

**Files**: `src/components/calendar/WeekView.tsx`, `src/components/calendar/DayView.tsx`

Currently, all events are positioned with `left-1 right-1` (WeekView) or `left-2 right-2` (DayView), so overlapping time slots stack on top of each other.

Add overlap detection logic:
- For each day's timed events, sort by start time, then detect groups of overlapping events (events whose time ranges intersect)
- Within an overlap group of N events, assign each event an index (0 to N-1)
- Set each event's `left` and `width` to divide the column equally: `left = (index / N) * 100%`, `width = (1 / N) * 100%` (with small padding)
- This is the standard calendar column-splitting approach used by Google Calendar and Outlook

### Technical Details

**Overlap detection algorithm** (shared helper or inline in each view):
```text
1. Sort day events by startTime
2. Initialize overlap groups = []
3. For each event:
   a. If it overlaps with the current group's time range, add to group
   b. Otherwise, start a new group
4. For each group of size N, assign index 0..N-1
5. Return map of eventId -> { index, total }
```

**WeekView changes** (lines 141-172):
- Add `computeOverlapLayout(dayEvents)` call per day
- Change event button style from `left-1 right-1` to computed `left` + `width` with small padding

**DayView changes** (lines 162-195):
- Same overlap layout computation
- Change event button style from `left-2 right-2` to computed `left` + `width`

**Event Detail Sheet** (lines 717-817):
- Add `isEditingEvent` boolean state and `editEvent` partial state
- When Edit clicked: populate `editEvent` from `selectedEvent`
- Render form fields matching Create dialog
- Save button calls `updateEvent(selectedEvent.id, editEvent)` then exits edit mode
- Cancel button reverts to read-only view

**Seed locations function**:
- Query all calendar_events, update location field in batches
- Use jurisdiction-appropriate office addresses or Zoom links
- Temporary function, deleted after use

### Files Changed
- `supabase/functions/seed-calendar-locations/index.ts` (temporary, create then delete)
- `supabase/config.toml` (temporary edit for verify_jwt, then revert)
- `src/pages/Calendar.tsx` (add edit mode to event detail sheet)
- `src/components/calendar/WeekView.tsx` (overlap layout)
- `src/components/calendar/DayView.tsx` (overlap layout)
