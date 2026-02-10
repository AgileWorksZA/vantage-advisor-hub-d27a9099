

## Make Calendar Items Clickable with AI Meeting Prep Notes

### Overview

Add clickable calendar events to the client detail page that open a dedicated Meeting Prep dialog/sheet. When clicked, AI generates a structured meeting prep note with clickable tags that navigate the user to the linked activity (task, document, note, communication).

---

### Changes

**1. New Component: `src/components/client-detail/MeetingPrepSheet.tsx`**

A Sheet (side panel) that opens when a calendar event is clicked. Contains:

- **Event header**: title, date/time, event type badge
- **AI-generated meeting prep note** using the existing `MeetingPrepPanel` component (which already renders client summary, outstanding actions, and revenue opportunities from `useClientMeetingPrep`)
- **Clickable tags** on each item:
  - Tasks: clicking navigates to `/tasks` with the task selected (or opens task detail sheet inline)
  - Documents: clicking switches to the Documents tab on the client detail page
  - Notes: clicking switches to the Notes tab
  - Communications: clicking switches to the Communication tab
  - Opportunities: clicking switches to the 360 View tab
- Tags are styled as small teal pill buttons with the activity type icon

**2. New Hook: `src/hooks/useClientCalendarEvents.ts`**

- Fetches upcoming and recent calendar events for a specific client from `calendar_events` table
- Returns events sorted by start_time
- Used by the client detail page to show events in the Next Best Action panel

**3. Modify: `src/components/client-detail/ClientSummaryTab.tsx`**

- Add a "Meetings" section within or near the Next Best Action card (or as a 4th tab)
- Alternatively, make existing items in Opportunities/Outstanding tabs link-aware
- Add state for `selectedMeetingEvent` and `meetingPrepOpen`
- Render `MeetingPrepSheet` when an event is clicked

**4. Modify: `src/components/client-detail/next-best-action/RecentActivityTab.tsx`**

- Replace static demo data with real calendar events fetched via `useClientCalendarEvents`
- Each calendar event row becomes clickable, opening the `MeetingPrepSheet`
- Non-calendar activity items (notes, documents, etc.) remain but become clickable too, navigating to the relevant client detail tab

**5. Modify: `src/components/calendar/MeetingPrepPanel.tsx`**

- Make each item (note, task, document, opportunity, communication) render as a clickable element
- Accept an optional `onNavigate` callback prop: `(type: 'task' | 'note' | 'document' | 'communication' | 'opportunity', id: string) => void`
- When provided, each item renders as a button/link with a subtle hover effect and an external-link or arrow icon
- Tags appear as small colored pills: Tasks (blue), Documents (purple), Notes (green), Communications (teal), Opportunities (emerald)

**6. Modify: `src/pages/ClientDetail.tsx`**

- Accept navigation from the MeetingPrepSheet to switch tabs programmatically
- The `onNavigate` callback from MeetingPrepPanel calls `setActiveTab('notes')`, `setActiveTab('documents')`, etc.
- For tasks, navigate to `/tasks` or open the task detail sheet

---

### Technical Details

- `useClientCalendarEvents` queries: `supabase.from('calendar_events').select('*').eq('client_id', clientId).eq('is_deleted', false).order('start_time', { ascending: false }).limit(10)`
- The MeetingPrepSheet reuses the existing `MeetingPrepPanel` component, wrapping it in a Sheet with the event metadata header
- Tab switching uses a callback pattern: `ClientSummaryTab` receives an `onTabChange` prop from `ClientDetail`, which calls `setActiveTab`
- Clickable tags use `react-router-dom`'s `useNavigate` for cross-page navigation (e.g., tasks) and prop callbacks for same-page tab switching
- The RecentActivityTab transitions from static demo data to real data: calendar events from the hook plus recent client_notes, documents, and communications from `useClientMeetingPrep`

### Files

| File | Action |
|------|--------|
| `src/components/client-detail/MeetingPrepSheet.tsx` | Create |
| `src/hooks/useClientCalendarEvents.ts` | Create |
| `src/components/client-detail/ClientSummaryTab.tsx` | Modify - add meeting prep sheet trigger |
| `src/components/client-detail/next-best-action/RecentActivityTab.tsx` | Modify - real data, clickable items |
| `src/components/calendar/MeetingPrepPanel.tsx` | Modify - add clickable tags with onNavigate |
| `src/pages/ClientDetail.tsx` | Modify - expose tab switching callback |

No database changes required. All data sources already exist.
