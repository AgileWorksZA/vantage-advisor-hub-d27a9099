

## Seed Calendar Events for All Advisors Across Jurisdictions

### Overview
Create a new backend function `seed-calendar-events` that populates 20 meetings/calls per advisor per day across all 25 advisors (5 jurisdictions x 5 advisors) for 30 days starting today. Events will be linked to randomly selected clients belonging to each advisor. This generates approximately **15,000 calendar events** (25 advisors x 20 events/day x 30 days).

### New File: `supabase/functions/seed-calendar-events/index.ts`

The edge function will:

1. **Authenticate** the calling user and use their `user_id` for all inserted events
2. **Query existing clients** grouped by advisor name
3. **Delete existing seeded events** (to make the function idempotent) by removing events in the target date range before re-inserting
4. **Generate 20 events per advisor per day** for 30 days (today through today + 29):
   - Randomly select from client-linked event types: `Meeting`, `Annual Review`, `Portfolio Review`, `Compliance Review`, `Client Call`
   - Schedule events between 7:00 AM and 9:00 PM in the advisor's jurisdiction timezone
   - Duration: 30-90 minutes (randomized)
   - Assign a random client from that advisor's book
   - Set timezone per the jurisdiction default (e.g., `Africa/Johannesburg` for ZA, `Australia/Sydney` for AU)
   - Set appropriate color values matching existing scheme
   - Past events (before now) get status `Completed`; future events get `Scheduled`
   - Generate realistic meeting titles (e.g., "Portfolio Review - Sarah Mitchell", "Annual Review - James Chen")
   - Set location to a mix of "Office", "Zoom", "Client Premises", or null

5. **Insert in batches** of 100 for performance

### Configuration

Add to `supabase/config.toml`:
```toml
[functions.seed-calendar-events]
verify_jwt = false
```

### Data Generation Details

**Timezone mapping (reuse from existing code):**
| Jurisdiction | Timezone |
|-------------|----------|
| ZA | Africa/Johannesburg |
| AU | Australia/Sydney |
| CA | America/Toronto |
| GB | Europe/London |
| US | America/New_York |

**Event type distribution and colors:**
| Type | Weight | Color |
|------|--------|-------|
| Meeting | 35% | hsl(180,70%,45%) (teal) |
| Client Call | 25% | hsl(171,70%,45%) (teal-400) |
| Portfolio Review | 15% | hsl(270,60%,60%) (purple-400) |
| Annual Review | 15% | hsl(270,70%,55%) (purple-500) |
| Compliance Review | 10% | hsl(38,90%,55%) (amber-500) |

**Time slot generation:** Events are spread across 7 AM - 9 PM (14 hours) with 20 events per day. A simple approach: divide the day into 20 roughly equal slots with small random offsets to avoid perfect alignment.

### Frontend Trigger

Add a "Seed Calendar" button to the existing seeding UI or call the function from the Administration page, following the same pattern used by `seed-demo-clients`.

### Files Summary

| File | Action |
|------|--------|
| `supabase/functions/seed-calendar-events/index.ts` | Create -- edge function to seed events |
| `supabase/config.toml` | Update -- add function config |
| Frontend trigger (Administration or existing seed UI) | Update -- add button to invoke the function |

