

## Polished Calendar Events with Hover Cards

### 1. Create a reusable EventHoverCard component

**New file**: `src/components/calendar/EventHoverCard.tsx`

A wrapper component using Radix `HoverCard` that shows full event details on mouse hover. It will display:
- Event title with colored left border matching the event type
- Event type badge
- Date and time range
- Location (as a clickable link if it contains "zoom.us" or "maps.google")
- Client name
- Description
- Status badge
- Attendees count

This single component will be used across all three views (Month, Week, Day).

### 2. Polish event styling across all views

**Month View** (`src/pages/Calendar.tsx`, lines 670-684):
- Add a colored left border (3px) instead of full background fill, with a subtle light background (`bg-opacity-15` in light mode)
- Wrap each event button in the `EventHoverCard` component
- Style: `border-l-3 border-[color] bg-[color]/10 dark:bg-[color]/20` for a cleaner, more professional look

**Week View** (`src/components/calendar/WeekView.tsx`, lines 188-214, 220-234):
- Add left border accent + slightly transparent background instead of solid color fill
- Wrap timed and all-day event buttons in `EventHoverCard`
- Add `border border-[color]/30` for a defined box edge

**Day View** (`src/components/calendar/DayView.tsx`, lines 141-151, 208-237):
- Same border-left accent approach with transparent fill
- Wrap event buttons in `EventHoverCard`
- Add subtle `shadow-sm` and `border` for polished box appearance

### 3. Color convention mapping

Use the existing `eventTypeColors` map but apply colors as left-border accents and light background tints rather than solid fills. This creates a more professional, Outlook/Google Calendar-like appearance:

| Event Type | Border Color | Background |
|---|---|---|
| Meeting | Teal (hsl 180,70%,45%) | teal/10 |
| Annual Review | Purple-500 | purple/10 |
| Portfolio Review | Purple-400 | purple/10 |
| Compliance Review | Amber-500 | amber/10 |
| Reminder | Blue-400 | blue/10 |
| Personal | Blue-500 | blue/10 |
| Team Event | Green-500 | green/10 |
| Client Call | Teal-400 | teal/10 |

### Technical Details

**EventHoverCard component structure**:
- Uses `HoverCard` from `@radix-ui/react-hover-card` (already installed)
- `HoverCardTrigger` wraps the event button (passed as `children`)
- `HoverCardContent` renders a card with all event fields
- Props: `event: CalendarEvent` and `children: ReactNode`
- Location field renders as `<a>` if URL detected, plain text otherwise
- openDelay set to 300ms to avoid accidental triggers

**New color utility**: A mapping from event type to Tailwind border/bg classes for the accent style, defined in the EventHoverCard file or inline in each view.

**Files changed**:
- `src/components/calendar/EventHoverCard.tsx` (new)
- `src/pages/Calendar.tsx` (month view event styling + hover card wrapping)
- `src/components/calendar/WeekView.tsx` (week view styling + hover card wrapping)
- `src/components/calendar/DayView.tsx` (day view styling + hover card wrapping)

