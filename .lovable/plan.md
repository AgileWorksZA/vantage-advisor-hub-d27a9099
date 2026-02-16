

## Add Tasks Tab to Client Detail

### Overview
Add a "Tasks" tab after the "Meetings" tab in the client detail view, showing all tasks assigned to or related to the current client.

### Changes

**1. `src/components/client-detail/ClientTasksTab.tsx` (NEW)**

Create a new component that:
- Accepts `clientId` as a prop
- Fetches tasks from the `tasks` table filtered by `client_id = clientId`
- Displays tasks in a compact table with columns: Task #, Title, Type, Priority, Status, Due Date, Assigned To
- Includes color-coded priority badges and status badges consistent with the main Tasks module
- Shows overdue highlighting (red text) for past-due items
- Links each task row to open the `TaskDetailSheet` for full details
- Includes a "Create Task" button that opens the `CreateTaskDialog` pre-filled with the current client
- Shows an empty state message when no tasks exist

**2. `src/pages/ClientDetail.tsx`**

- Import `ClientTasksTab`
- Add `{ value: "tasks", label: "Tasks" }` to the tabs array after "meetings"
- Add corresponding `<TabsContent value="tasks">` rendering `<ClientTasksTab clientId={clientId!} />`

### Technical Details

The component will query the `tasks` table directly filtered by `client_id`, reusing the existing `Task` interface from `useTasks.ts`. It will join `team_members` for the assigned-to name display. The table styling will match the compact density used elsewhere in the client detail tabs (small text, tight padding).

### Files

| File | Change |
|------|--------|
| `src/components/client-detail/ClientTasksTab.tsx` | New component - task list filtered by client |
| `src/pages/ClientDetail.tsx` | Add Tasks tab + TabsContent |

