

## Meeting Screen: Redesigned Header & Reschedule Dialog

### Overview
Two changes to the mobile meeting screen:
1. Reorganise the header so date/time appears above the title with a calendar icon
2. Add a reschedule button (top-right) that opens a full-featured reschedule dialog

---

### 1. Header Redesign (`MobileMeetingScreen.tsx`)

Current layout:
```
[<-] Meeting Title           [Event Type]
     Client Name  HH:mm-HH:mm
```

New layout:
```
[<-] Thu, 10 Feb 2026 | 09:00-10:00  [Reschedule icon]
     Meeting Title
     Client Name        [Event Type]
```

Changes:
- Move the date + time line above the title, with a `CalendarDays` icon prefix
- Format: `format(startTime, "EEE, d MMM yyyy")` + pipe + `HH:mm - HH:mm`
- Title becomes second line (same `text-base font-semibold`)
- Client name + event type badge on third line
- Add a `CalendarClock` (or `RefreshCw`) icon button in the top-right corner to open the reschedule dialog

### 2. Reschedule Dialog (new component or inline)

A dialog/sheet triggered by the reschedule icon containing:

| Field | Type | Required |
|-------|------|----------|
| Meeting Subject | Text input (pre-filled with event title) | Yes |
| Date | Date picker (Shadcn Calendar in Popover) | Yes |
| Start Time | Time select/input | Yes |
| End Time | Time select/input | Yes |
| Invitees | Text input showing current attendees, editable | No |
| Location | Text input (pre-filled if exists) | No |
| Meeting Type | Select dropdown of event types | No |
| Note / Reason | Textarea for reschedule reason | No |
| Confirm button | "Confirm Reschedule" button | - |

- Pre-populated with current event data
- On confirm: show a toast "Meeting rescheduled" (demo-only, no backend update needed for now)
- Uses existing Shadcn Dialog, Calendar, Popover, Input, Textarea, Select, Button components

### 3. Imports Needed

- Add `CalendarDays`, `CalendarClock` from lucide-react
- Import `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogFooter` from UI
- Import `Calendar`, `Popover`, `PopoverTrigger`, `PopoverContent` for date picker
- Import `Input`, `Textarea`, `Select`, `Button`, `Label`

---

### Files Summary

| File | Action |
|------|--------|
| `src/components/mobile/MobileMeetingScreen.tsx` | Update header layout, add reschedule icon + dialog with date/time/subject/invitees/note fields |

### Technical Notes
- The `CalendarEvent` interface already has `attendees`, `location`, `eventType`, `description` fields to pre-populate the form
- Date picker follows the Shadcn pattern with `pointer-events-auto` on the Calendar for dialog compatibility
- Time inputs use simple `<Input type="time" />` for native mobile time pickers
- All form state is local (`useState`); confirm action shows a toast only (no DB write in this iteration)
