
# AI Meeting Notetaker Implementation Plan

## Overview

This plan adds Zocks-like AI notetaker functionality to the advisor portal, enabling meeting recordings, AI-powered transcriptions, automated note generation, and action item extraction that can be converted into CRM tasks. The feature will integrate with the existing Calendar and Client Detail pages.

---

## Key Features

1. **Meeting Recording & Transcription**
   - Record audio during meetings (via browser microphone)
   - AI-powered speech-to-text transcription using ElevenLabs STT
   - Store recordings securely in file storage

2. **AI Meeting Notes Generation**
   - Automatically generate structured meeting summaries
   - Extract key discussion topics, decisions, and client facts
   - Identify client life events and priorities

3. **Action Item Extraction**
   - AI identifies actionable items from the conversation
   - One-click conversion to CRM tasks linked to the client
   - Pre-populated with extracted details from the transcription

4. **Client Profile Integration**
   - New "Meetings" tab in Client Detail showing all recorded meetings
   - View transcriptions, notes, and extracted data per meeting
   - Quick-create tasks from any meeting

---

## Visual Structure

### Calendar Event Detail Panel (Enhanced)

```text
+--------------------------------------------------+
| Meeting: Annual Review - John Smith              |
|--------------------------------------------------|
| [Record] [Stop] [Transcribe]    Status: Recording|
|                                                  |
| 00:02:34 ●                                       |
|--------------------------------------------------|
| Transcription                                    |
| "John mentioned he's planning to retire in 2027"|
| "Discussed 529 plan for daughter's college..."  |
|--------------------------------------------------|
| AI Generated Notes                               |
| - Client retiring in 2 years                     |
| - Child going to college next year               |
| - Interested in 529 education savings            |
|--------------------------------------------------|
| Suggested Actions                    [Create All]|
| [ ] Set up 529 account for daughter        [+]   |
| [ ] Review retirement projections          [+]   |
| [ ] Send college planning resources        [+]   |
+--------------------------------------------------+
```

### Client Detail - Meetings Tab

```text
+--------------------------------------------------+
| Meetings                     [Search] [Filter]   |
|--------------------------------------------------|
| Date        | Title              | Duration | AI |
|-------------|--------------------| ---------|----| 
| 02 Feb 2026 | Annual Review      | 45 min   | ✓ |
| 15 Jan 2026 | Portfolio Review   | 30 min   | ✓ |
| 10 Dec 2025 | Initial Meeting    | 60 min   | ✓ |
|--------------------------------------------------|
| Click to view transcription and notes            |
+--------------------------------------------------+
```

---

## Implementation Steps

### Step 1: Database Schema for Meeting Recordings

Create a `meeting_recordings` table to store recordings and transcriptions:

**Table: `meeting_recordings`**
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Owner (advisor) |
| calendar_event_id | UUID | Link to calendar_events (nullable) |
| client_id | UUID | Associated client (nullable) |
| title | text | Meeting title |
| recording_url | text | URL to audio file in storage |
| duration_seconds | integer | Recording duration |
| transcription | text | Full transcription text |
| transcription_status | enum | pending, processing, completed, failed |
| ai_summary | JSONB | Structured AI-generated summary |
| ai_action_items | JSONB | Extracted action items |
| recording_started_at | timestamptz | When recording started |
| recording_ended_at | timestamptz | When recording ended |
| created_at, updated_at | timestamptz | Audit timestamps |
| is_deleted, deleted_at | boolean, timestamptz | Soft delete |

**Indexes:** user_id, client_id, calendar_event_id, transcription_status

**RLS Policies:** Users can only access their own recordings

### Step 2: Create Storage Bucket for Audio Files

Set up a Supabase Storage bucket `meeting-recordings` with:
- Authenticated uploads only
- RLS policies for user-specific access
- Max file size appropriate for audio (100MB)

### Step 3: Connect ElevenLabs for Speech-to-Text

Use the ElevenLabs connector for realtime transcription:
- Connect ElevenLabs API via standard connector
- Implement edge function `transcribe-meeting` for batch processing
- Support both realtime transcription during meeting and batch post-upload

### Step 4: Create AI Processing Edge Function

**File: `supabase/functions/process-meeting/index.ts`**

Uses Lovable AI (Gemini) to:
- Generate structured meeting summary from transcription
- Extract key topics, decisions, and client facts
- Identify action items with priority and due date suggestions
- Format output as structured JSON for the frontend

### Step 5: Create Meeting Recording Hook

**File: `src/hooks/useMeetingRecordings.ts`**

Provides:
- Start/stop recording (MediaRecorder API)
- Upload recording to storage
- Fetch recordings for event/client
- Trigger transcription processing
- Create tasks from action items

### Step 6: Enhance Calendar Event Sheet

**File: `src/pages/Calendar.tsx` (modifications)**

Add to event detail Sheet:
- Recording controls (Start/Stop buttons)
- Live recording timer and status indicator
- Transcription display panel
- AI-generated notes section
- Action items list with "Create Task" buttons

### Step 7: Create Client Meetings Tab

**File: `src/components/client-detail/ClientMeetingsTab.tsx`**

Features:
- List of all recorded meetings for the client
- Expandable rows showing transcription and notes
- Search and filter by date/title
- Quick-create tasks from any meeting
- Audio playback capability

### Step 8: Update Client Detail Page

**File: `src/pages/ClientDetail.tsx`**

Add new "Meetings" tab to the tab navigation.

---

## Technical Details

### Recording Implementation

Using the browser's MediaRecorder API:
```text
1. Request microphone permission
2. Create MediaRecorder with audio/webm format
3. Collect audio chunks during recording
4. On stop, create Blob and upload to Supabase Storage
5. Create database record with recording metadata
```

### AI Summary Structure (JSONB)

```text
{
  "summary": "Brief overview of the meeting...",
  "key_topics": ["Retirement planning", "529 education savings", ...],
  "decisions_made": ["Will proceed with 529 account", ...],
  "client_facts": {
    "retirement_date": "2027",
    "children": [{ "name": "Sarah", "event": "college next year" }],
    "life_events": ["Job change", "Home purchase planned"]
  },
  "follow_up_date": "2026-03-15"
}
```

### Action Items Structure (JSONB)

```text
[
  {
    "title": "Set up 529 account for Sarah",
    "description": "Client requested education savings account...",
    "priority": "High",
    "suggested_due_date": "2026-02-15",
    "task_type": "Follow-up",
    "source_quote": "Let's set up the 529 account"
  },
  ...
]
```

### Create Task from Action Item

When user clicks [+] on an action item:
1. Open pre-filled task creation dialog
2. Title, description, priority auto-populated from AI
3. Client automatically linked
4. User can edit before saving
5. Task created using existing `useTasks` hook

---

## Files to Create

| File | Purpose |
|------|---------|
| `supabase/functions/transcribe-meeting/index.ts` | ElevenLabs transcription wrapper |
| `supabase/functions/process-meeting/index.ts` | Lovable AI meeting analysis |
| `src/hooks/useMeetingRecordings.ts` | Recording and transcription hook |
| `src/components/calendar/MeetingRecorder.tsx` | Recording UI component |
| `src/components/calendar/TranscriptionPanel.tsx` | Transcription display |
| `src/components/calendar/ActionItemsList.tsx` | Action items with task creation |
| `src/components/client-detail/ClientMeetingsTab.tsx` | Meetings list for client |

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/Calendar.tsx` | Add recording UI to event sheet |
| `src/pages/ClientDetail.tsx` | Add Meetings tab |
| `supabase/config.toml` | Add edge function configurations |

## Database Migration

Creates:
- `transcription_status_enum` - Status enum for transcription
- `meeting_recordings` table with all fields
- Storage bucket `meeting-recordings`
- Indexes for performance
- RLS policies for security

---

## Connector Requirements

**ElevenLabs** (for Speech-to-Text)
- Will be connected via the connectors system
- Provides `ELEVENLABS_API_KEY` for transcription

**Lovable AI** (already available)
- Uses `LOVABLE_API_KEY` (pre-configured)
- For meeting analysis and action extraction

---

## User Flow

1. **During Meeting**
   - Advisor opens calendar event
   - Clicks "Start Recording"
   - Conducts meeting normally
   - Clicks "Stop Recording"

2. **Post-Meeting Processing**
   - Audio uploaded to storage
   - Transcription generated (30-60 seconds)
   - AI analysis produces summary and actions
   - Results appear in event detail panel

3. **Action Item Conversion**
   - Advisor reviews suggested actions
   - Clicks [+] to create CRM task
   - Task pre-filled from transcription context
   - Task saved and linked to client

4. **Client Profile Access**
   - All meetings visible in client's Meetings tab
   - Full transcription and notes accessible
   - Historical meeting context available

---

## Summary

This implementation brings Zocks-like AI notetaker capabilities to the advisor portal, automating the capture and processing of client meetings. Advisors can focus on their clients while the system handles note-taking, summarization, and action item extraction. The deep integration with the existing Calendar and CRM ensures seamless workflow without context switching.
