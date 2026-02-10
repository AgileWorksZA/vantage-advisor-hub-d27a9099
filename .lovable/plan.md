

## Seed Open Tasks for All Advisors

### Overview
Create a new edge function `seed-open-tasks` that generates 3-5 open tasks per advisor across all jurisdictions. These tasks will have "Not Started" or "In Progress" status with due dates near today, ensuring they appear in the mobile "Open Tasks" section.

### New File: `supabase/functions/seed-open-tasks/index.ts`

The function will:

1. **Authenticate** the calling user
2. **Fetch team members** grouped by jurisdiction to get all advisor names
3. **Fetch clients** and group by advisor name
4. **Generate 3-5 tasks per advisor** with:
   - Status: randomly "Not Started" or "In Progress" (never Completed/Cancelled so they show as open)
   - Priority: mix of Medium, High, and Urgent
   - Due dates: today through next 7 days (keeps them visible and relevant)
   - Task types: varied from the existing enum (Follow-up, Portfolio Review, Annual Review, etc.)
   - Linked to a random client from that advisor's book
   - `assigned_to_name` set to the advisor's name
5. **Insert in a single batch** (small dataset, ~75-125 tasks total for 25 advisors)
6. **Create task_clients links** for each task

### Configuration

Add to `supabase/config.toml`:
```
[functions.seed-open-tasks]
verify_jwt = false
```

### Frontend Trigger

Add a "Seed Open Tasks" button in `SystemSettingsSection.tsx` following the same pattern as the existing seed buttons.

### Task Templates (subset for open tasks)

| Type | Example Title |
|------|--------------|
| Follow-up | "Follow up on pending client documentation" |
| Portfolio Review | "Quarterly investment review meeting" |
| Annual Review | "Annual portfolio performance review" |
| Compliance | "KYC documentation update" |
| Document Request | "Request tax certificate" |

### Files Summary

| File | Action |
|------|--------|
| `supabase/functions/seed-open-tasks/index.ts` | Create -- edge function |
| `supabase/config.toml` | Update -- add function config |
| `src/components/administration/system/SystemSettingsSection.tsx` | Update -- add trigger button |

