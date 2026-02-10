

## Combine Date/Time into Clickable Reschedule Button

### Overview
Merge the date/time line and the reschedule icon into a single tappable box in the top-right of the header. Clicking it opens the reschedule dialog.

### Current Layout
```text
[<-] [CalendarDays] Thu, 10 Feb 2026 | 09:00-10:00   [CalendarClock]
     Meeting Title
     Client Name   [Event Type]
```

### New Layout
```text
[<-] Meeting Title
     Client Name   [Event Type]        [ CalendarDays  Thu, 10 Feb ]
                                        [    09:00 - 10:00         ]
```

The date/time box:
- Positioned top-right where the reschedule icon currently sits
- Styled as a compact tappable card: `rounded-lg border border-border bg-muted/50 px-2.5 py-1.5`
- Contains: calendar icon + date on first line, time range on second line
- Entire box is a `button` that triggers `setRescheduleOpen(true)`
- Remove the standalone `CalendarClock` icon button
- Remove the standalone date/time line from the left side

### Changes

**File: `src/components/mobile/MobileMeetingScreen.tsx`**

In the sticky header section (around lines 109-127):

1. Remove the date/time line with `CalendarDays` icon from below the back button
2. Remove the `CalendarClock` button from the right side
3. Restructure the header so the left side has: title (first line), client name + badge (second line)
4. Add a clickable date/time box on the right side that opens the reschedule dialog:

```text
<button onClick={() => setRescheduleOpen(true)} 
        className="shrink-0 rounded-lg border bg-muted/50 px-2.5 py-1.5 text-right">
  <div className="flex items-center gap-1 text-xs text-muted-foreground">
    <CalendarDays className="h-3 w-3" />
    <span>{format(startTime, "EEE, d MMM")}</span>
  </div>
  <div className="text-xs font-medium text-foreground">
    {format(startTime, "HH:mm")} - {format(endTime, "HH:mm")}
  </div>
</button>
```

### Files Summary

| File | Action |
|------|--------|
| `src/components/mobile/MobileMeetingScreen.tsx` | Restructure header: merge date/time into clickable box on right, remove separate reschedule icon |

