

## Link Teams to Selected Advisors in Task Analytics

### Problem
The "By User" table in Task Analytics shows all teams regardless of which advisors are selected in the top bar. Additionally, some team members appear in an "ungrouped" section outside of any team.

### Solution
Add an `advisor_initials` column to the `team_members` table to directly link each team (via its Financial Adviser) to a regional advisor. Then filter the displayed teams based on the advisors selected in the header filter.

### Changes

**1. Database Migration** -- Add `advisor_initials` column to `team_members`
```sql
ALTER TABLE team_members ADD COLUMN advisor_initials TEXT;
```

**2. Update seed function** (`supabase/functions/seed-team-members/index.ts`)
- Add `advisorInitials` to the seed data structure for each team, mapping each team's Financial Adviser to the corresponding regional advisor initials
- For example in ZA: Jordaan Financial Planning maps to "JB", Mostert Advisory to "SM", Van der Merwe Wealth to "PN", Naidoo Financial Services to "LV", Pretorius Practice to "DG"
- Populate the `advisor_initials` column on insert for all team members in each team (so every member in a team shares the same advisor_initials value)
- Apply same mapping for AU, CA, GB, US regions

**3. Update `useTeamMembers.ts`**
- Add `advisor_initials: string | null` to the `TeamMember` interface

**4. Update `TaskAnalyticsTab.tsx`**
- Import `selectedAdvisors` from `useRegion()`
- Build a set of advisor_initials that are currently selected in the top bar
- Filter `jurisdictionMembers` to only include members whose `advisor_initials` is in the selected set
- This automatically filters the teams shown (since teams are built from `jurisdictionMembers`)
- Remove the "ungrouped" rendering block -- all members will be in a team via the seed data; any truly unmatched rows are hidden

### Data Flow

```text
Advisor Filter (top bar)
  --> selectedAdvisors: ["JB", "SM"]
  --> team_members with advisor_initials = "JB" or "SM"
  --> Teams: "Jordaan Financial Planning", "Mostert Advisory"
  --> Only those teams + their members appear in the table
```

### Steps
1. Run migration to add `advisor_initials` column
2. Update seed function with initials mapping for all 25 teams (5 per region)
3. Deploy and run seed function to populate data
4. Update TypeScript interface in `useTeamMembers.ts`
5. Update filtering logic in `TaskAnalyticsTab.tsx` to filter by selected advisors and remove ungrouped section
