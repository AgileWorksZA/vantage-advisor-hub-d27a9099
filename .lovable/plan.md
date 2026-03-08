

## Show Task Count in Header & Seed Linked Tasks

### Changes

**1. TaskLinkingSection.tsx — Show count in header**
Update line 87 from `Task linking` to `Task linking ({linkedTasks.length})` to match the AI-Identified Opportunities pattern.

**2. TaskLinkingSection.tsx — Match reference image styling**
Update the table to show "Task number" as e.g. `Transaction-198945` format (matching the image), and display the "Client" column with full name format like `Wegner, E (Emile)`. The header buttons should be inline with the title (already the case). Pagination should show first/prev/next/last buttons with "1 to 4 of 4" text (close to current, minor tweak).

**3. Seed edge function — Link existing tasks to emails**
Create `supabase/functions/seed-email-tasks/index.ts` that:
- Fetches existing emails and tasks for the authenticated user
- Creates `email_tasks` rows linking a handful of tasks to various emails
- Uses task types like Switch, Quote, Failed Instruction to match the reference image

### Files to create/edit
| File | Action |
|------|--------|
| `src/components/email/TaskLinkingSection.tsx` | Add count to header label |
| `supabase/functions/seed-email-tasks/index.ts` | New seed function to link tasks to emails |

