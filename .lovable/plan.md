

## Enhance Follow-Ups Step: Task Progress, Due Dates, Linked Outcomes + Audit Trail

### Overview
Upgrade the Outstanding Tasks section in the Follow-Ups step to show richer task cards with progress indicators, due dates, and linked key outcomes. When tapping a task, display a full detail view with an audit trail of all activities and relevant quotes from the meeting recording.

---

### Changes by File

#### 1. `src/components/mobile/MobileMeetingScreen.tsx`
- Pass `keyOutcomes` and recording transcription data to `FollowUpsStep` as new props
- Pass extra context (transcription, keyOutcomes) through the `detailView.data` object when navigating to the task detail view so `MobileContextDetailView` can render the audit trail and quotes

#### 2. `src/components/mobile/meeting-steps/FollowUpsStep.tsx`
**New props:** `keyOutcomes: KeyOutcome[]`, `transcription: string | null`

**Enhanced task cards** (replacing lines 86-98) with:
- **Progress indicator**: A small `Progress` bar (from the existing `ui/progress` component) based on task status mapping: Not Started = 0%, In Progress = 50%, Completed = 100%
- **Due date**: Shown below the title with red/overdue styling when past due
- **Linked outcome**: Match each task title against keyOutcomes using keyword overlap; if matched, show the outcome text with its origin badge (Prep/During Meeting/Post-Meeting)

When tapping a task, pass the transcription and keyOutcomes into `detailView.data` so the detail view can use them:
```text
onTagClick({ type: "task", id: t.id, data: { ...t, transcription, keyOutcomes } })
```

**Updated task card layout:**
```text
+----------------------------------------------+
| [======50%===    ] In Progress         [>]   |
| Task Title Here                              |
| Due: 15 Feb 2026                   [Overdue] |
| Outcome: "Discuss investment..."     [Prep]  |
+----------------------------------------------+
```

#### 3. `src/components/mobile/meeting-steps/MobileContextDetailView.tsx`
**Major overhaul of the `TaskDetail` component** (lines 87-101) to include three new sections:

**a) Linked Outcome**
- If the task matches a keyOutcome (passed via `data.keyOutcomes`), display it with completion checkbox and origin badge
- Uses the same origin colour scheme: Prep (blue), During Meeting (teal), Post-Meeting (amber)

**b) Recording Quotes**
- Reuse the `matchTranscript` logic from OutcomesStep to search the transcription (passed via `data.transcription`) for keywords from the task title
- Display matched snippets with estimated timestamps in expandable cards
- Each quote shows a clock icon with the timestamp badge

**c) Audit Trail**
- Use the existing `useTaskHistory` hook to fetch task history entries on mount
- Display a vertical timeline of all changes: status updates, field changes, assignments, creation
- Each entry shows an action icon, description of the change (old value to new value), and a formatted timestamp
- Loading state with spinner while fetching

**Updated TaskDetail layout:**
```text
+------------------------------------------+
| Task Title                               |
| Type: Follow-up  |  Priority: High       |
| Status: In Progress  |  Due: 15 Feb 2026 |
| [====50%====        ] progress bar       |
| [Overdue badge if applicable]            |
+------------------------------------------+
| LINKED OUTCOME                           |
| [x] "Discuss investment..." [Prep]       |
+------------------------------------------+
| RECORDING QUOTES                         |
| [at 08:12] "...discussed the portfolio   |
|   rebalancing strategy..."               |
| [at 14:45] "...agreed to follow up on    |
|   the tax implications..."               |
+------------------------------------------+
| AUDIT TRAIL                              |
| * Status changed: Not Started ->         |
|   In Progress  (10 Feb 14:30)            |
| * Priority changed: Medium -> High       |
|   (09 Feb 11:15)                         |
| * Task created (08 Feb 09:00)            |
+------------------------------------------+
```

#### 4. Extract `matchTranscript` utility

Move the `matchTranscript` function from `OutcomesStep.tsx` into a small shared utility file (e.g. `src/lib/transcript-utils.ts`) so both OutcomesStep and MobileContextDetailView can import it without duplication.

---

### Data Flow

```text
MobileMeetingScreen
  |-- keyOutcomes (state)
  |-- recordings (from useMeetingRecordings via FollowUpsStep)
  |
  +-> FollowUpsStep
  |     |-- keyOutcomes (prop) for matching tasks to outcomes
  |     |-- transcription (prop) from recording
  |     |-- onTagClick -> sets detailView, includes transcription
  |     |   + keyOutcomes in detailView.data
  |
  +-> MobileContextDetailView
        |-- TaskDetail (enhanced)
              |-- useTaskHistory(taskId) fetches audit trail
              |-- data.transcription for recording quotes
              |-- data.keyOutcomes for linked outcome display
```

### Technical Notes

- The `useTaskHistory` hook already exists and queries the `task_history` table
- The `matchTranscript` function performs keyword-based search with snippet extraction and estimated timestamps
- The `Progress` UI component from `src/components/ui/progress.tsx` provides the visual progress bar
- The `DetailView` type's `data` field is typed as `any`, so extra context can be passed without type changes
- Status-to-progress mapping: Not Started = 0%, In Progress = 50%, Completed = 100%, Cancelled = 0%

### Files Summary

| File | Action |
|------|--------|
| `src/lib/transcript-utils.ts` | Create -- extract shared `matchTranscript` function |
| `src/components/mobile/meeting-steps/FollowUpsStep.tsx` | Update -- enhanced task cards with progress bar, due date, linked outcome |
| `src/components/mobile/MobileMeetingScreen.tsx` | Update -- pass keyOutcomes to FollowUpsStep |
| `src/components/mobile/meeting-steps/MobileContextDetailView.tsx` | Update -- overhaul TaskDetail with audit trail, recording quotes, linked outcome |
| `src/components/mobile/meeting-steps/OutcomesStep.tsx` | Update -- import matchTranscript from shared utility |
