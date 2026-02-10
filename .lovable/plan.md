

## Follow-Up Enhancements: Scheduling, Messaging, Voice Memos

### Overview
This plan adds five major capabilities to the Follow-Ups step and the broader mobile app:
1. Expandable "Suggested Follow-up" with task selection, date/time, and meeting type -- creates a calendar event on accept
2. "Unaddressed Tasks" section prompting the adviser to resolve or schedule follow-ups
3. "Send Message" option that opens a compose screen pre-populated with follow-up items, linked to the client
4. Reply notification via the bell icon, linking back to the message
5. Global voice memo recorder on all mobile screens for quick instruction capture

---

### 1. Expandable Suggested Follow-Up with Scheduling

**File: `src/components/mobile/meeting-steps/FollowUpsStep.tsx`**

Replace the current static "Suggested Follow-up" card (lines 77-92) with an expandable section:

- Tapping the card toggles an expanded panel below it
- **Expanded panel contents:**
  - Task checklist: all outstanding tasks listed with checkboxes (pre-selected based on AI action items). Adviser can select/unselect and add custom tasks via an input
  - Date picker and time selector for the follow-up meeting
  - Meeting type toggle: "In-person", "Online", "Call" (three pill buttons)
  - "Schedule Follow-up" confirm button
- On confirm: call `useCalendarEvents().createEvent()` with the selected date, time, type (mapped to location/description), and linked client ID
- Show a success toast and mark the included tasks as "Scheduled for follow-up" visually
- Track which tasks have been included in a follow-up (local state `scheduledTaskIds`)

**New component: `src/components/mobile/meeting-steps/ScheduleFollowUpPanel.tsx`**
- Receives: tasks list, keyOutcomes, clientId, clientName
- Manages: selectedTaskIds, date, time, meetingType state
- Calls: `createEvent` from `useCalendarEvents` hook
- Returns: the created event details

---

### 2. Unaddressed Tasks Section

**File: `src/components/mobile/meeting-steps/FollowUpsStep.tsx`**

Add a new section below "Outstanding Tasks" showing tasks not included in any follow-up:

- Filter tasks where ID is not in `scheduledTaskIds`
- Display with amber/warning styling: "These tasks have not been included in a follow-up"
- Each task shows two action buttons:
  - "Resolve" -- marks task as completed (toast confirmation)
  - "Add to Follow-up" -- scrolls to and expands the scheduling panel, pre-selects this task

---

### 3. Message Compose with Pre-populated Follow-Up Items

**File: `src/components/mobile/meeting-steps/FollowUpsStep.tsx`**

Add a "Send Follow-up Message" button (envelope icon) in the follow-up section:

- Opens a new `MobileComposeMessageSheet.tsx` as a full-screen overlay
- Pre-populates:
  - **To**: Client (using clientId from the meeting event)
  - **Subject**: "Follow-up: [Meeting Title] - [Date]"
  - **Body**: AI-generated HTML listing the follow-up items (tasks selected + outcomes) in a structured format
- Channel selector (Email/WhatsApp/SMS) at the top
- Send button calls `useCommunicationCampaigns().createCampaign()` with status "Sent"

**New component: `src/components/mobile/meeting-steps/MobileComposeMessageSheet.tsx`**
- Simplified mobile-first compose screen (not the full desktop ComposeMessageDialog)
- Props: clientId, clientName, subject, bodyHtml, defaultChannel
- Uses existing `RichTextEditor` component for body editing
- On send: creates campaign record + shows confirmation on the follow-up screen

**File: `src/components/mobile/meeting-steps/FollowUpsStep.tsx`**
- After a message is sent, show a "Message Sent" indicator on relevant tasks
- Display: envelope icon + timestamp of when the message was sent
- Tasks remain shown as "Open" but with the sent badge

---

### 4. Reply Notification

**File: `src/components/mobile/MobileApp.tsx`**

- When a message is sent from the follow-up screen, store a reference (campaign ID + client ID) in component state
- Simulate an incoming reply notification after a short delay (for demo purposes, since real inbound requires webhook integration)
- Add the notification to the bell icon's notification list with type "communication"
- On notification click: navigate to the communication/message detail view

**File: `src/components/dashboard/NotificationDropdown.tsx`**
- Add support for a `link` field in notifications that, when clicked, navigates to the relevant message view
- The mobile version will use the same notification data structure

---

### 5. Global Voice Memo Recorder

**New component: `src/components/mobile/MobileVoiceMemo.tsx`**

A floating action button (FAB) at the bottom-right of all mobile screens (above the tab bar):

- **Idle state**: Microphone icon FAB (small, teal accent)
- **Recording state**: Pulsing red dot, timer, stop button
- **Post-recording state**: Full-screen overlay showing:
  - Transcribed text (using browser SpeechRecognition API for instant on-device transcription)
  - AI-suggested actions extracted from the transcription (pattern matching for "schedule", "call", "email", "task", "remind" keywords)
  - Each suggested action has a "Create Task" or "Dismiss" button
  - "Done" button to close

**Implementation details:**
- Uses browser `webkitSpeechRecognition` / `SpeechRecognition` API for real-time on-device transcription (no server round-trip needed)
- Falls back to `useMeetingRecordings` transcription if Speech API unavailable
- Suggested actions use client-side keyword extraction (no AI API call needed)
- The FAB is rendered in `MobileApp.tsx` outside of tab content, positioned with `fixed bottom-16 right-4 z-20`

**File: `src/components/mobile/MobileApp.tsx`**
- Import and render `MobileVoiceMemo` component between `<main>` and `<nav>` so it appears on every tab

---

### Data Flow

```text
FollowUpsStep
  |-- ScheduleFollowUpPanel
  |     |-- useCalendarEvents().createEvent() -> calendar_events table
  |     |-- scheduledTaskIds (local state)
  |
  |-- MobileComposeMessageSheet
  |     |-- useCommunicationCampaigns().createCampaign() -> communication_campaigns table
  |     |-- sentMessageInfo (local state for badge display)
  |
  |-- Unaddressed Tasks
        |-- filtered by !scheduledTaskIds.includes(id)

MobileApp
  |-- MobileVoiceMemo (FAB, always visible)
  |     |-- SpeechRecognition API (on-device)
  |     |-- Keyword extraction -> suggested actions
  |
  |-- NotificationDropdown / Bell
        |-- notifications state (add reply notification on message send)
```

---

### Files Summary

| File | Action |
|------|--------|
| `src/components/mobile/meeting-steps/ScheduleFollowUpPanel.tsx` | Create -- expandable panel with task selection, date/time picker, meeting type |
| `src/components/mobile/meeting-steps/MobileComposeMessageSheet.tsx` | Create -- mobile-first compose screen with pre-populated follow-up content |
| `src/components/mobile/MobileVoiceMemo.tsx` | Create -- floating voice memo recorder with transcription and action suggestions |
| `src/components/mobile/meeting-steps/FollowUpsStep.tsx` | Update -- expandable follow-up, unaddressed tasks section, message sent badges |
| `src/components/mobile/MobileMeetingScreen.tsx` | Update -- pass additional props for scheduling and messaging |
| `src/components/mobile/MobileApp.tsx` | Update -- add MobileVoiceMemo FAB to all screens |
| `src/components/dashboard/NotificationDropdown.tsx` | Update -- support navigation on notification click via link field |

### Technical Notes

- No new database tables needed; all features use existing `calendar_events` and `communication_campaigns` tables
- Voice memo uses the Web Speech API (`SpeechRecognition`) which works in Chrome/Edge mobile browsers; a graceful fallback message is shown in unsupported browsers
- The compose screen reuses the existing `RichTextEditor` and `CommunicationTypeSelector` components
- Meeting type ("In-person", "Online", "Call") maps to the existing `event_type` field on `calendar_events`
- Task "scheduled for follow-up" status is tracked in local component state for this iteration

