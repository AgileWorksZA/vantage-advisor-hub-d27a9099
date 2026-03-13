

## Seed Meeting Recordings with AI Content

Currently, `seed-calendar-events` creates calendar events for all clients, but no `meeting_recordings` are seeded. The Meetings tab's Outcomes and Follow-ups steps rely on `meeting_recordings` data (transcription, `ai_summary`, `ai_action_items`) which is empty for all clients.

### New Edge Function: `seed-meeting-recordings`

Creates a new `supabase/functions/seed-meeting-recordings/index.ts` that:

1. Fetches all **past** calendar events (status = 'Completed') for the authenticated user
2. Deletes any existing seeded meeting recordings for those events (idempotent)
3. For each past event, generates a realistic `meeting_recordings` row with:

**Transcription** — A multi-speaker transcript with timestamps, e.g.:
```
[00:00] Advisor: Good morning, let's review your portfolio...
[02:15] Client: I've been thinking about retirement planning...
```
Templates vary by event type (Meeting, Portfolio Review, Annual Review, Client Call, Compliance Review).

**AI Summary** (`ai_summary` JSON):
- `summary`: 2-3 sentence meeting summary
- `key_topics`: 3-5 relevant topics
- `decisions_made`: 1-3 decisions
- `client_facts`: retirement goals, risk tolerance, life events
- `follow_up_date`: 2-4 weeks from event date
- `tagged_actions`: linked to client's existing tasks
- `tagged_opportunities`: linked to client's existing opportunities

**AI Action Items** (`ai_action_items` JSON array):
- 2-4 action items per meeting with title, description, priority, suggested_due_date, task_type, source_quote

**Key Outcomes** seeded via the transcript content so the Outcomes step's keyword matching (`matchTranscript`) can auto-tick items.

4. Sets `transcription_status: 'completed'`, realistic `duration_seconds` (20-60 min), `recording_started_at`/`recording_ended_at` matching the event times.

### Template System

Jurisdiction-aware content templates (ZA: FICA/RA, AU: Super, CA: RRSP, GB: ISA/SIPP, US: 401k/IRA) ensure realistic regional terminology in transcripts and action items.

Event-type-specific templates:
- **Portfolio Review**: Performance discussion, rebalancing, drift analysis
- **Annual Review**: Life changes, goal updates, beneficiary review
- **Compliance Review**: FICA/KYC, document expiry, regulatory updates
- **Meeting/Client Call**: General advisory, product discussions, planning

### Config & Integration

- Add `[functions.seed-meeting-recordings]` with `verify_jwt = false` to `supabase/config.toml`
- Add the function to the Administration seed sequence so it runs after `seed-calendar-events`

### Files

| File | Action |
|------|--------|
| `supabase/functions/seed-meeting-recordings/index.ts` | Create — new seeding edge function |
| `supabase/config.toml` | Add function config entry |
| `src/components/administration/system/SystemSettingsSection.tsx` | Add to seed sequence |

