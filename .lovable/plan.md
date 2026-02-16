
## Add Kanban Board Tab to Tasks

### Overview
Add a new "Kanban" tab alongside Dashboard, Analytics, and Overview. The board will display tasks as draggable cards organized into status columns, with full filtering support and drag-and-drop to update task status.

### Kanban Best Practices Applied
- **WIP Limits**: Display a visual count per column with a configurable soft limit (color warning when exceeded)
- **Swimlanes**: Optional grouping by assignee or priority for team visibility
- **Card Design**: Show key info at a glance -- title, priority badge, due date, client name, assignee avatar/initials
- **Visual Cues**: Overdue cards highlighted, priority color-coded left border, pinned indicator
- **Column Order**: Follows natural workflow: Not Started -> In Progress -> Pending Client -> Completed -> Cancelled
- **Drag-and-Drop**: Native HTML5 drag-and-drop (no extra dependency) to move cards between columns, updating status via the existing `updateTask` function

### New Files

**1. `src/components/tasks/TaskKanbanBoard.tsx`**
- Main board component receiving `tasks`, `onTaskClick`, `onUpdateTask` props
- Defines column order and renders `KanbanColumn` for each status
- Implements HTML5 drag-and-drop handlers (`onDragStart`, `onDragOver`, `onDrop`)
- On drop: calls `updateTask(taskId, { status: newStatus })` and optimistically reorders
- Includes a toolbar row with a group-by toggle (None / Assignee / Priority)
- Each column header shows task count and a color indicator

**2. `src/components/tasks/KanbanCard.tsx`**
- Compact card component for a single task
- Displays: title, priority badge (color-coded left border), due date, client name, assignee initials
- Overdue indicator (red border/text) when due_date < today and status is not Completed/Cancelled
- Pinned icon if `is_pinned`
- `draggable="true"` with `onDragStart` setting task ID in dataTransfer
- Click handler opens TaskDetailSheet

### Changes to Existing Files

**3. `src/pages/Tasks.tsx`**
- Extend `view` type to `"dashboard" | "analytics" | "detail" | "kanban"`
- Add Kanban button in the tab bar (using `Columns3` icon from lucide-react)
- Add kanban view rendering in the main content area, passing `filteredTasks` (with filters applied) and using the same `TaskFiltersComponent`
- Wire `handleTaskClick` and `updateTask` to the board

### Technical Details

- **No new dependencies**: Uses native HTML5 Drag and Drop API, keeping the bundle lean
- **Filtering**: The Kanban view reuses the existing `TaskFiltersComponent` and `filteredTasks` from the page, so all existing filters (status, priority, type, date range, search, SLA) work on the board
- **Advisor filtering**: Inherits the global advisor filter via `advisorFilteredTasks`
- **Column definitions**: Statuses are sourced from the existing `useTaskTypes` hook for consistency
- **Responsive**: Columns scroll horizontally on smaller screens with `overflow-x-auto`
- **Optimistic update**: Card moves visually on drop, then `updateTask` persists to the database; on failure the board refreshes from server state via `refetch`

### Column Layout

```text
+---------------+---------------+------------------+---------------+---------------+
| Not Started   | In Progress   | Pending Client   | Completed     | Cancelled     |
| (12)          | (8)           | (3)              | (24)          | (2)           |
+---------------+---------------+------------------+---------------+---------------+
| [Card]        | [Card]        | [Card]           | [Card]        | [Card]        |
| [Card]        | [Card]        |                  | [Card]        |               |
| [Card]        |               |                  | [Card]        |               |
+---------------+---------------+------------------+---------------+---------------+
```

### Card Layout

```text
+--+-------------------------------+
|P | Task Title                  * |
|R | Client: John Smith            |
|I | Due: 15 Feb 2026     [AB]     |
+--+-------------------------------+
 ^                          ^
 Priority bar          Assignee initials
```
