

## Seed Production Database via Edge Functions

### Overview
Call all deployed seed edge functions to populate the production database with demo data. The functions will be called in dependency order since some functions rely on data from others.

### Execution Order

The functions need to be called in this sequence due to data dependencies:

1. **seed-team-members** - Creates advisors (needed by clients and tasks)
2. **seed-demo-clients** - Creates demo clients linked to advisors
3. **seed-providers-data** - Seeds product providers
4. **seed-instruments-data** - Seeds financial instruments
5. **seed-admin-reference-data** - Seeds admin reference/lookup data
6. **seed-demo-relationships** - Creates client relationships (needs clients)
7. **seed-demo-communications** - Seeds communications (needs clients)
8. **seed-us-communications** - Seeds US-specific communications
9. **seed-whatsapp-enhanced** - Seeds WhatsApp messages (needs clients)
10. **seed-calendar-events** - Seeds calendar events (needs clients)
11. **seed-demo-tasks** - Seeds tasks (needs clients + team members)
12. **seed-open-tasks** - Seeds open tasks (needs clients + team members)
13. **seed-onboarding-tasks** - Seeds onboarding tasks (needs clients)
14. **seed-tlh-clients** - Seeds tax-loss harvesting client data

### Method
Each function will be called via HTTP POST using the deployed edge function endpoints. The currently logged-in user's auth token will be included automatically.

### Notes
- Functions that already detect sufficient data will skip seeding (built-in idempotency in some functions)
- All 14 seed functions will be invoked sequentially to respect dependencies
- Results will be reported after each call

