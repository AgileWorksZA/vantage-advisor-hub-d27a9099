

## Add "Seed All Production Data" Button

### Overview
Add a comprehensive "Seed All Data" button to the System Settings section of Administration. When clicked on the published (live) site, it will sequentially call all 14 seed edge functions in dependency order, populating the production database with all demo data including households, tasks, documents, relationships, and communications.

### Location
The button will be added alongside the existing "Seed Calendar Events" and "Seed Open Tasks" buttons in `src/components/administration/system/SystemSettingsSection.tsx`.

### Behavior
- A single "Seed All Production Data" button with a Database icon
- On click, it sequentially invokes all 14 seed functions in the correct dependency order
- Shows a progress indicator with the name of the currently running function
- Displays a toast after each function completes (success or error)
- Shows a final summary toast when all functions finish
- Individual seed buttons remain for targeted re-seeding

### Execution Order (dependency-safe)
1. `seed-team-members` -- advisors first
2. `seed-demo-clients` -- clients need advisors
3. `seed-providers-data` -- product providers
4. `seed-instruments-data` -- financial instruments
5. `seed-admin-reference-data` -- lookup/reference data
6. `seed-demo-relationships` -- relationships + households (needs clients)
7. `seed-demo-communications` -- communications (needs clients)
8. `seed-us-communications` -- US-specific comms
9. `seed-whatsapp-enhanced` -- WhatsApp messages
10. `seed-calendar-events` -- calendar events
11. `seed-demo-tasks` -- tasks (needs clients + team)
12. `seed-open-tasks` -- open tasks
13. `seed-onboarding-tasks` -- onboarding tasks
14. `seed-tlh-clients` -- tax-loss harvesting

### Technical Details

**File modified:** `src/components/administration/system/SystemSettingsSection.tsx`

- Add state: `seedingAll` (boolean) and `seedProgress` (string for current function name)
- Add a helper function that takes the auth token, calls each function sequentially via `fetch`, and updates progress
- Add a "Seed All Production Data" button styled as a primary/destructive variant to indicate it's a significant operation
- Each function call uses `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/{function-name}` with `POST` and the user's Bearer token -- same pattern as the existing calendar/tasks seed buttons
- On the published site, these calls automatically target the production database

### UI
- Button group with the existing two buttons plus the new "Seed All" button
- While seeding, the button shows a spinner and the current step (e.g., "Seeding team members... (1/14)")
- A toast fires for each completed step
- Final summary toast shows total counts

