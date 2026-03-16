
## Add Client-Targeted Meeting Seeding

### What I found
The project already has three separate backend seeders that power this meetings workflow:
- `seed-calendar-events` for the meeting list
- `seed-meeting-prep-data` for Prep step data
- `seed-meeting-recordings` for Meet/Outcomes data

Right now they seed broadly for the signed-in advisor’s full dataset, not a single client’s meetings screen. The client Meetings tab itself reads from:
- `calendar_events`
- prep-related tables via `useClientMeetingPrep`
- `meeting_recordings`

### Recommended implementation
Create a new admin-only seeding flow that targets one client and seeds the entire meetings workflow end-to-end for that client.

### Build plan

#### 1. Add a dedicated backend function
Create a new backend function such as `seed-client-meetings`.

It should:
- require authentication
- accept a `clientId`
- validate the client belongs to the signed-in user
- delete/replace previously seeded meeting workflow data only for that client
- create:
  - calendar events for the Meetings list
  - prep data used in Prep step
  - meeting recordings/transcripts/action items used in Meet and Outcomes
  - AI prep notes on the seeded events

This is better than calling the three existing global seeders because those currently operate at user-wide scope and would over-seed unrelated clients.

#### 2. Reuse existing seeding patterns
Use the same jurisdiction-aware logic already present in:
- `seed-calendar-events`
- `seed-meeting-prep-data`
- `seed-meeting-recordings`

But narrow it to:
- one client
- a smaller, realistic number of meetings
- matching event-to-recording relationships

Suggested output for one client:
- 5–8 meetings across past/upcoming dates
- prep records aligned to the client jurisdiction
- recordings only for completed/past meetings
- transcripts and action items linked to the correct event

#### 3. Add admin UI control
Extend `SystemSettingsSection.tsx` with a new admin action for client-specific meeting seeding.

Recommended UI:
- input for Client ID
- optional “Current client” helper using the route/client context if available later
- single button: “Seed Client Meetings”
- loading state + success/error toast

This keeps the trigger admin-only, matching your preference.

#### 4. Keep current global seeders intact
Do not remove existing seeders. They still support full environment/demo seeding.

Instead:
- keep global seeders for bulk population
- add the new targeted seeder for debugging/demoing a specific client meetings screen

### Files to add/change
| File | Change |
|------|--------|
| `supabase/functions/seed-client-meetings/index.ts` | New targeted seeder for one client’s full meetings workflow |
| `supabase/config.toml` | Register the new function |
| `src/components/administration/system/SystemSettingsSection.tsx` | Add admin UI to trigger client-specific meeting seeding |

### Technical notes
- No database schema change should be needed.
- The function should be idempotent per client so repeated runs refresh only that client’s seeded meetings data.
- It should seed linked records in the right order: calendar events first, then prep data, then recordings tied to past events.
- Since `ClientMeetingsTab` already reads live backend data, no client-screen code changes should be necessary unless you want a quick refresh affordance later.

### Result
After this change, an admin can seed the complete Meetings experience for a single client from the administration area, and that client’s Meetings tab will immediately have realistic data across:
- meeting list
- prep context
- AI prep note
- transcript/outcomes/follow-up workflow

### Suggested follow-up
After implementation, I’d also recommend adding a small admin “open seeded client” shortcut or a route-aware helper so you don’t have to manually copy/paste client IDs when preparing a specific meetings screen.
