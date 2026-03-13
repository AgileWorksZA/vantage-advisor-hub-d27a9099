

## Add AI Prep Notes to All Meetings

### What We're Building
Each meeting gets a persisted **AI Prep Note** — a natural-language briefing paragraph stored on the `calendar_events` table. The Prep step shows this note with a visible "generation" animation and a "Regenerate" button that calls an edge function to produce an updated note using Lovable AI based on the client's live data.

### Database Change

**Migration**: Add `ai_prep_note TEXT` column to `calendar_events`.

```sql
ALTER TABLE public.calendar_events ADD COLUMN ai_prep_note text;
```

### New Edge Function: `generate-prep-note`

Accepts `{ calendarEventId }`, fetches the event + client data (notes, tasks, documents, opportunities, products), calls Lovable AI (gemini-3-flash-preview) with a system prompt to produce a 3-4 sentence meeting briefing, then saves it to `calendar_events.ai_prep_note` and returns the note.

### Seed Prep Notes: Update `seed-calendar-events`

Generate a unique static prep note per event inline during seeding (no AI call needed). Templates vary by event type and jurisdiction, e.g.:

- **Portfolio Review (ZA)**: "Client's RA contributions are approaching the annual limit. Portfolio has drifted 3% from target allocation. Consider discussing offshore diversification via Regulation 28 compliant funds."
- **Annual Review (US)**: "Client's 401(k) rollover from previous employer is still pending. RMD deadline approaching in Q1. Review beneficiary designations following recent life event."

Each event gets a different combination from ~30 template fragments shuffled by event type, jurisdiction, and client name.

### UI Changes: `WebPrepStep.tsx`

Add an AI Prep Note card at the top of the prep step:
- Shows the note text in a styled card with a `Sparkles` icon
- "Regenerate Note" button with loading state that calls the edge function
- Typing animation when generating to show how the note is produced
- If no note exists yet, shows a "Generate Prep Note" button

### Files

| File | Action |
|------|--------|
| Migration | Add `ai_prep_note text` to `calendar_events` |
| `supabase/functions/generate-prep-note/index.ts` | Create — AI generation edge function |
| `supabase/config.toml` | Register new function |
| `src/components/client-detail/meeting-steps/WebPrepStep.tsx` | Add AI note card with regenerate button |
| `src/components/client-detail/ClientMeetingsTab.tsx` | Pass event ID to WebPrepStep |
| `supabase/functions/seed-calendar-events/index.ts` | Add unique `ai_prep_note` per event |

