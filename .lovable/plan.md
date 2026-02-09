

## Seed Calendar Events for All Advisors

### Overview
Create a temporary edge function `seed-calendar-events` that populates calendar events for all 3 existing users, covering all 25 advisors across 5 jurisdictions. Events will span the current month and next month, with at least 2 events per day per advisor, linked to real clients from the database.

### Approach

The function will:
1. Query all clients grouped by `user_id` and `advisor`
2. For each user+advisor combination, generate 2-3 calendar events per weekday over a 30-day window (today minus 7 days through today plus 23 days)
3. Randomly assign event types (Meeting, Annual Review, Portfolio Review, Compliance Review, Client Call) and link each to a client belonging to that advisor
4. Set realistic time slots (9am-5pm) with appropriate durations (30-60 min) and timezone based on jurisdiction
5. Insert all events in bulk

### Event Details
- **Types**: Meeting, Annual Review, Portfolio Review, Compliance Review, Client Call (client-facing types)
- **Times**: Business hours, varying start times to avoid overlap
- **Durations**: 30-60 minutes depending on type
- **Colors**: Match existing color scheme (teal for meetings, purple for reviews, amber for compliance, etc.)
- **Status**: Past events = "Completed", future events = "Scheduled"
- **Titles**: Contextual (e.g., "Annual Review - {ClientName}", "Portfolio Review with {ClientName}")

### Steps

1. Create `supabase/functions/seed-calendar-events/index.ts`
2. Add config entry in `supabase/config.toml` with `verify_jwt = false`
3. Deploy and invoke against Test
4. Invoke against Production
5. Clean up: delete function and revert config

### Technical Details

- Jurisdiction timezone mapping: ZA=Africa/Johannesburg, AU=Australia/Sydney, CA=America/Toronto, GB=Europe/London, US=America/New_York
- ~2-3 events per weekday x ~16 weekdays x 25 advisors x 3 users = significant volume; will batch inserts
- Each event linked to a real `client_id` from the clients table
- Weekends get fewer/no events for realism
- `created_by` set to the owning `user_id`

### Files Changed
- `supabase/functions/seed-calendar-events/index.ts` (temporary)
- `supabase/config.toml` (temporary edit, then revert)
