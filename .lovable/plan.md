
## Mobile Meeting Screen with 4-Step Progress Workflow

### Overview
When a user taps any item under "Today's Schedule" in the mobile Today tab, a full-screen meeting detail view opens with a time-stamped progress bar showing 4 steps: **Prep**, **Meet**, **Outcomes**, and **Follow-ups**. The default active step is determined by the meeting's current state relative to the current time.

### Meeting Step Logic
- **Before meeting start time** -- default to **Prep**
- **During meeting window** (between start and end time) -- default to **Meet**
- **After meeting end time** -- default to **Outcomes**
- **If outcomes have been reviewed** -- default to **Follow-ups**

### New Files to Create

#### 1. `src/components/mobile/MobileMeetingScreen.tsx`
Main container with:
- Back button header showing meeting title
- Client name and time range
- Horizontal 4-step progress bar with timestamps (colored active/completed steps, muted future steps)
- Renders the active step's content below the progress bar

#### 2. `src/components/mobile/meeting-steps/MeetingProgressBar.tsx`
Reusable progress bar component:
- 4 circular step indicators connected by lines
- Each step shows its label and the relevant timestamp (e.g., "Prep" with "T-30min", "Meet" with the start time)
- Completed steps: teal filled circle with checkmark
- Active step: teal ring with pulse animation
- Future steps: muted outline

#### 3. `src/components/mobile/meeting-steps/PrepStep.tsx`
AI-generated prep note outlining:
- **Previous Engagements**: Recent notes and communications fetched via `useClientMeetingPrep`, each rendered with clickable tags (e.g., `[Note]`, `[Email]`, `[Call]`) that navigate to a detail view
- **Transactions**: Active products with current values, tagged with `[Product]` badges
- **Opportunities for Growth**: Revenue opportunities with `[Opportunity]` tags
- **Outstanding Actions**: Open tasks and documents with `[Task]` / `[Document]` tags
- **Recommended Actions** section at the bottom with "Convert to Task" buttons

#### 4. `src/components/mobile/meeting-steps/MeetStep.tsx`
During-meeting view:
- Meeting timer showing elapsed time
- Quick-note input field for live jotting
- Key talking points derived from prep data (displayed as tags)
- "Record Meeting" button (links to existing recording infrastructure)
- Recommended actions bar at the bottom

#### 5. `src/components/mobile/meeting-steps/OutcomesStep.tsx`
Post-meeting outcomes:
- AI summary section (if recording/transcription exists, shown from `useMeetingRecordings`)
- Decisions made list with tags
- Key topics as badge tags
- Client facts/insights
- Each item has a "Convert to Task" action button

#### 6. `src/components/mobile/meeting-steps/FollowUpsStep.tsx`
Follow-up management:
- Action items list with priority badges and "Create Task" buttons
- Tagged outstanding actions with status update buttons
- Tagged opportunities with "Create Follow-up" buttons
- Suggested follow-up date
- Summary of all tasks created from this meeting

#### 7. `src/components/mobile/meeting-steps/MobileContextDetailView.tsx`
Mobile detail views for context items when tags are tapped:
- **Note detail**: Subject, date, priority, interaction type, full content
- **Communication detail**: Subject, channel, date, preview
- **Task detail**: Title, type, priority, status, due date, description
- **Document detail**: Name, status, expiry date, category
- **Product detail**: Name, category, current value, status
- **Opportunity detail**: Type, potential revenue, confidence, suggested action, reasoning

Each detail view has a back button and a "Convert to Task" action where applicable.

### Changes to Existing Files

#### `src/components/mobile/MobileTodayTab.tsx`
- Add `onClick` handler to each schedule item that sets a `selectedEvent` state
- When an event is selected, render `MobileMeetingScreen` instead of the Today tab content
- Pass the event data and a `onBack` callback

### Data Flow
- **Prep step** uses the existing `useClientMeetingPrep(clientId)` hook to fetch notes, communications, tasks, documents, opportunities, and products
- **Meet step** shows prep-derived talking points and a timer
- **Outcomes step** uses `useMeetingRecordings` filtered by the event to show AI summaries
- **Follow-ups step** reuses the `ActionItemsList` pattern for task creation from action items

### Technical Details

**Progress bar step detection:**
```text
function getActiveStep(event):
  now = new Date()
  if now < event.startTime:  return "prep"
  if now <= event.endTime:   return "meet"
  if no outcomes reviewed:   return "outcomes"
  return "follow-ups"
```

**Tag navigation pattern:**
```text
// Each tag is a clickable Badge that sets a detail view state
<Badge onClick={() => setDetailView({ type: "note", id: note.id })}>
  Note
</Badge>

// When detailView is set, render MobileContextDetailView
// with a back button to return to the step
```

**Recommended actions pattern (used across all steps):**
```text
// Each step surfaces contextual recommended actions
// e.g., Prep: "Review expiring documents", "Discuss consolidation opportunity"
// Actions have a "+" button to convert into a task via useTasks().createTask()
```

| File | Action |
|------|--------|
| `src/components/mobile/MobileMeetingScreen.tsx` | Create - main meeting container |
| `src/components/mobile/meeting-steps/MeetingProgressBar.tsx` | Create - 4-step progress bar |
| `src/components/mobile/meeting-steps/PrepStep.tsx` | Create - AI prep note with tagged context |
| `src/components/mobile/meeting-steps/MeetStep.tsx` | Create - live meeting view |
| `src/components/mobile/meeting-steps/OutcomesStep.tsx` | Create - post-meeting outcomes |
| `src/components/mobile/meeting-steps/FollowUpsStep.tsx` | Create - follow-up management |
| `src/components/mobile/meeting-steps/MobileContextDetailView.tsx` | Create - detail views for tagged items |
| `src/components/mobile/MobileTodayTab.tsx` | Modify - add event tap navigation |
