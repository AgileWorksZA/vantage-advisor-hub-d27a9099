

## Add 4-Step Meeting Workflow to Client Meetings Tab (Web)

Replace the current recordings-only table in `ClientMeetingsTab.tsx` with a two-panel layout: a list of upcoming/recent calendar events on the left, and a 4-step meeting workflow panel on the right (Prep → Meet → Outcomes → Follow-ups) — mirroring the mobile adviser app experience.

### Architecture

```text
┌─────────────────────────────────────────────────────┐
│  ClientMeetingsTab                                  │
│  ┌──────────────────┬──────────────────────────────┐│
│  │ Meeting List     │  Meeting Workflow Panel       ││
│  │                  │                               ││
│  │ ● Meeting 1  ◄──│  [1 Prep] [2 Meet] [3 Out] [4]││
│  │ ○ Meeting 2     │  ─────────────────────────────││
│  │ ○ Meeting 3     │  Step content (reuses mobile  ││
│  │                  │  step logic adapted for web)  ││
│  │ ── Recordings ──│                               ││
│  │ ▸ Recording 1   │                               ││
│  └──────────────────┴──────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### Changes

**`src/components/client-detail/ClientMeetingsTab.tsx`** — Full rewrite

1. **Left panel — Meeting list**: Fetch calendar events via `useClientCalendarEvents`. Show upcoming and past meetings as clickable cards with date, time, type badge, and time-aware status (Upcoming/Live/Past). Below the events, keep a collapsible "Recordings" section with the existing recordings table.

2. **Right panel — Meeting workflow**: When a meeting is selected, show:
   - A horizontal 4-step progress bar (adapted from `MeetingProgressBar` for web — slightly larger styling)
   - Step content panels reusing the same data hooks (`useClientMeetingPrep`) and rendering the same sections as the mobile steps:
     - **Prep**: AI prep note, outstanding actions (tasks/documents), recommended actions, key outcomes
     - **Meet**: Elapsed timer, quick notes, talking points, key outcomes (collapsible)
     - **Outcomes**: Key outcomes checklist with origin badges, AI summary if recording exists
     - **Follow-ups**: Suggested follow-up scheduling, outstanding tasks, opportunities

3. **Step components**: Create new web-adapted versions in `src/components/client-detail/meeting-steps/` that render the same content as mobile but with web-appropriate layout (wider cards, side-by-side where appropriate). They'll import the same hooks and types.

### New Files

| File | Purpose |
|------|---------|
| `src/components/client-detail/meeting-steps/WebMeetingProgressBar.tsx` | Horizontal stepper for web (wider, no mobile constraints) |
| `src/components/client-detail/meeting-steps/WebPrepStep.tsx` | Prep step — AI note, outstanding actions, outcomes |
| `src/components/client-detail/meeting-steps/WebMeetStep.tsx` | Live meeting — timer, notes, talking points |
| `src/components/client-detail/meeting-steps/WebOutcomesStep.tsx` | Outcomes checklist with transcript matching |
| `src/components/client-detail/meeting-steps/WebFollowUpsStep.tsx` | Follow-up scheduling, tasks, opportunities |

### Modified Files

| File | Change |
|------|--------|
| `src/components/client-detail/ClientMeetingsTab.tsx` | Replace recordings table with split-panel layout: event list + workflow panel |

### Data Flow

- Calendar events: `useClientCalendarEvents(clientId)` — already exists
- Prep data: `useClientMeetingPrep(clientId)` — already exists
- Recordings: `useMeetingRecordings(eventId, clientId)` — already exists
- Key outcomes: Local state managed in `ClientMeetingsTab`, passed down to steps (same pattern as `MobileMeetingScreen`)

### Key Outcome State

Same `KeyOutcome` interface from `MobileMeetingScreen.tsx` will be extracted to a shared types file or re-exported. Outcomes are seeded from prep data (opportunities, overdue tasks, expiring docs) and flow through all 4 steps.

