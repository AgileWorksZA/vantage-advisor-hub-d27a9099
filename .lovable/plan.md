

## Enable Clickable Task Title and Client Name in Task Linking Accordion

### Changes

**1. `src/hooks/useEmailTasks.ts` — Add `task_id` and `client_id` to the query and transform**
- Add `id` and `client_id` to the tasks select query
- Pass `task_id` and `client_id` through in the transformed result

**2. `src/components/email/TaskLinkingSection.tsx` — Make title and client clickable**
- Add `task_id` and `client_id` to the `LinkedTask` interface
- Import `useNavigate` from `react-router-dom`
- Wrap the task title cell content in a clickable link/button that navigates to the tasks page (or opens task detail)
- Wrap the client name cell content in a clickable link/button that navigates to `/client/{client_id}`
- Style both with `cursor-pointer text-primary hover:underline`

### Files to edit
| File | Action |
|------|--------|
| `src/hooks/useEmailTasks.ts` | Add `task_id`, `client_id` to query & transform |
| `src/components/email/TaskLinkingSection.tsx` | Add navigation on title/client click |

