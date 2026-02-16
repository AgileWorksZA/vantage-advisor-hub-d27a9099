

## Improve Kanban Board Responsiveness, Task Name Wrapping, and Task Numbers

### Changes

**1. `src/components/tasks/TaskKanbanBoard.tsx`** -- Make columns fluid

- Change columns from fixed `min-w-[240px] w-[240px] shrink-0` to flexible `flex-1 min-w-[200px]` so they expand/contract with available screen width
- The `overflow-x-auto` on the parent ensures columns still scroll horizontally when the screen is too narrow to fit all five at min-width

**2. `src/components/tasks/KanbanCard.tsx`** -- Wrap title to 2 lines with ellipsis, add task number

- Replace `truncate` (single-line) on the title with `line-clamp-2` (Tailwind's multi-line clamp) so names wrap to a second line and get "..." if they exceed two lines
- Add the task number as a small monospace label (e.g., `#1042`) displayed above or inline before the title, styled in `text-muted-foreground` for visual hierarchy

### Technical Details

**Column sizing (TaskKanbanBoard.tsx, line 143)**:
- From: `min-w-[240px] w-[240px] shrink-0`
- To: `flex-1 min-w-[200px]`

**Title wrapping (KanbanCard.tsx, line 56)**:
- From: `<span className="text-sm font-medium leading-tight truncate">`
- To: `<span className="text-sm font-medium leading-tight line-clamp-2">`

**Task number (KanbanCard.tsx, around line 55)**:
- Add a small `#task_number` badge/label before the title row, e.g.:
  ```
  <span className="text-[10px] font-mono text-muted-foreground">#1042</span>
  ```

Two files, three small edits.
