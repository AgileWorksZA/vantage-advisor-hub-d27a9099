

## Enhance Mobile Schedule with Meeting Status Indicators and Fix Icon Clickability

### Overview
Three changes to the Mobile Today tab:
1. Highlight the currently in-progress meeting with a teal/accent border and subtle "In Progress" badge
2. Grey out past meetings while keeping them clickable
3. Fix the calendar and filter icon buttons so they reliably trigger their popovers (add explicit `type="button"` and ensure z-index/pointer-events are correct)

### Changes

**File: `src/components/mobile/MobileTodayTab.tsx`**

#### 1. Meeting time-awareness logic

Add a helper function to determine each event's temporal status relative to "now":

```text
function getEventTimeStatus(event):
  now = new Date()
  if now >= event.startTime AND now <= event.endTime:  return "in-progress"
  if now > event.endTime:                               return "past"
  return "upcoming"
```

This uses the advisor's timezone context via `useUserSettings` and `getActiveTimezone` from the existing timezone utility to ensure the comparison is timezone-aware. If the user has a configured timezone, event times are compared accordingly.

#### 2. Visual treatment per status

Apply conditional classes to each event card:

| Status | Visual Treatment |
|--------|-----------------|
| **In Progress** | Teal left border accent (thicker, 3px), teal-tinted background, pulsing "LIVE" dot badge, bold title |
| **Past** | Reduced opacity (opacity-60), muted text colors, slight grey tint on background |
| **Upcoming** | Current default styling (no change) |

All states remain fully clickable and navigate to the meeting screen.

#### 3. Fix icon button clickability

Both the calendar icon (schedule section) and filter icon (tasks section) buttons will be updated:
- Add `type="button"` attribute to prevent any form-submission interference
- Ensure `z-index` is adequate relative to the scroll container
- Add `cursor-pointer` class for visual feedback

### Technical Details

**Timezone-aware comparison:**
- Import `useUserSettings` and `getActiveTimezone` from existing utilities
- Import `useRegion` to get the region code
- Compute the active timezone and use `convertToTimezone` to shift "now" for accurate comparison against event times stored in UTC

**Event card class logic (pseudo-code):**
```text
const status = getEventTimeStatus(event);

const cardClasses = cn(
  "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
  status === "in-progress" && "bg-[hsl(180,70%,45%)]/5 border-[hsl(180,70%,45%)]/30 border ring-1 ring-[hsl(180,70%,45%)]/20",
  status === "past" && "bg-card/60 border border-border opacity-60",
  status === "upcoming" && "bg-card border border-border hover:bg-accent/50"
);
```

**"LIVE" indicator for in-progress meetings:**
A small pulsing teal dot with "Live" text replaces the event type badge when the meeting is currently active.

| File | Action |
|------|--------|
| `src/components/mobile/MobileTodayTab.tsx` | Add time-status logic, conditional card styling, fix button attributes |

