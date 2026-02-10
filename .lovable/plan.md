

## Today Tab: Auto-Scroll, Growth Opportunities & Compact Layout

### Overview
Three changes to the mobile Today tab:
1. Replace the 3 stat boxes (Due Today, Overdue, Meetings) with growth opportunities linked to today's scheduled meetings
2. Keep the greeting and "Today's Schedule" header static (non-scrolling)
3. Auto-scroll the schedule list to the current/next upcoming meeting on load

---

### Changes (single file: `src/components/mobile/MobileTodayTab.tsx`)

#### 1. Replace Stat Cards with Growth Opportunities

Remove the `grid grid-cols-3` stat cards section (lines 142-147) and replace with a compact horizontal-scrolling row of growth opportunity cards derived from today's meetings:

- Import `getRegionalOpportunities` from `@/data/regionalData`
- Match today's meeting client names against regional opportunities
- Display as a horizontally scrollable row of compact cards showing:
  - Client name (from the meeting)
  - Opportunity type badge (Upsell, Cross-sell, Migration, Platform) with colour coding
  - Potential revenue value
  - Suggested action (truncated)
- Each card is compact: ~140px wide, fitting 2.5 cards on screen to hint at scrolling
- If no opportunities match today's meetings, show a single "No opportunities" placeholder card

#### 2. Sticky Header with Scrollable Content

Restructure the component layout:
- **Static top section** (no scroll): Greeting (day name + date) and "Today's Schedule" header with calendar picker -- stays pinned at top
- **Scrollable content below**: Schedule list, growth opportunities cards, and tasks section all scroll together beneath the static header
- Use `flex flex-col h-full` on the outer container with `overflow-y-auto` on the scrollable portion

#### 3. Auto-Scroll to Current Meeting

- Add a `useRef` for the schedule list container
- Add a `useEffect` that runs after events load: find the first "in-progress" or "upcoming" event, and call `scrollIntoView({ behavior: "smooth", block: "nearest" })` on its DOM element
- Each event button gets a `ref` callback that stores refs by event ID
- If an event is "in-progress", scroll to it; otherwise scroll to the first "upcoming" event

#### 4. Remove StatCard Component

The `StatCard` helper function (lines 295-302) is no longer needed and will be removed.

---

### Layout Structure

```text
+----------------------------------+
| Friday              [static]     |
| 10 February 2026    [static]     |
|                                  |
| TODAY'S SCHEDULE     [cal icon]  |
|----------------------------------|  <-- scroll boundary
| [Growth Opp 1] [Growth Opp 2] > |  <-- horizontal scroll
|                                  |
| 09:00 Meeting - Johan v/d Merwe |
| 10:30 Review - Thandi Nkosi     |  <-- auto-scrolled to current
| 14:00 Call - Pieter du Plessis  |
|                                  |
| OPEN TASKS (12)      [filter]   |
| Task 1...                        |
| Task 2...                        |
+----------------------------------+
```

### Opportunity Card Design

Each card is a compact rounded box:
- Background: `bg-card border border-border`
- Width: `min-w-[140px]` in a `flex overflow-x-auto gap-2` container
- Opportunity type shown as a tiny coloured badge: teal for upsell, blue for migration, orange for cross-sell, purple for platform
- Revenue in bold, suggested action in 1-line truncated text

### Files Summary

| File | Action |
|------|--------|
| `src/components/mobile/MobileTodayTab.tsx` | Update -- replace stats with growth opportunities, add sticky header, auto-scroll to current meeting |

