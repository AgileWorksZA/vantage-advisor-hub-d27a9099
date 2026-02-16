

## Compact Kanban Ribbon and Fix Outer Scrollbar

### Problem
The Kanban view has two separate horizontal bars (the filter ribbon and the "Group by" toolbar) taking up excessive vertical space. Additionally, the page layout creates a double/outer scrollbar because the kanban view wrapper inside `<main className="flex-1 overflow-y-auto">` uses `h-full` which conflicts with the scrollable main area.

### Changes

**1. `src/components/tasks/TaskKanbanBoard.tsx`** -- Merge Group-by into filters area and remove the separate toolbar

- Remove the standalone "Group by" toolbar `div` (lines 97-123)
- Move the group-by buttons into a prop or render them inline at the start of the board, but the cleaner approach is to move them up into the filter area
- Actually, the simplest fix: move the group-by toggle buttons out of `TaskKanbanBoard` and into the kanban section of `Tasks.tsx`, placed inline next to the `TaskFiltersComponent` on the same row

**2. `src/components/tasks/TaskFilters.tsx`** -- Make the filter bar more compact for Kanban

- Reduce padding from `p-4` to `px-3 py-2` on the filter container
- Reduce gap from `gap-3` to `gap-2`
- This tightens the ribbon without losing functionality

**3. `src/pages/Tasks.tsx`** -- Fix the scroll context for Kanban view

- The kanban view currently sits inside `<main className="flex-1 overflow-y-auto">` with an inner `<div className="flex flex-col h-full">`. This creates conflicting scroll areas
- Change the kanban branch so it properly fills the available space: remove the extra wrapper div and let `TaskKanbanBoard` handle its own flex layout within `main`
- Move the group-by buttons into the filter/ribbon area so there is one single compact strip containing: search, filters, and group-by toggles
- The group-by state will be lifted to `Tasks.tsx` and passed as props

**4. `src/components/tasks/TaskKanbanBoard.tsx`** -- Accept `groupBy` as a prop

- Change `groupBy` from internal state to a prop so the parent controls it alongside the filter strip
- Remove the toolbar div entirely from the board component
- The board component focuses purely on rendering columns and handling drag-drop

### Layout After Fix

```text
[Tab Bar: Dashboard | Analytics | Kanban | Overview]          [+ New Task]
[Search...] [Status v] [Priority v] [Type v] [Due Date]  | Group: [None] [Assignee] [Priority]
+---------------+---------------+------------------+---------------+---------------+
| Not Started   | In Progress   | Pending Client   | Completed     | Cancelled     |
```

One compact ribbon, no double scrollbar.

### Technical Detail

- `Tasks.tsx`: Add `kanbanGroupBy` state, render the group-by buttons in the same `px-6 pt-4` div as `TaskFiltersComponent`, pass `groupBy` prop to `TaskKanbanBoard`
- `TaskKanbanBoard.tsx`: Remove `useState` for `groupBy`, accept it as a prop, delete the toolbar div
- `TaskFilters.tsx`: Reduce padding (`p-4` to `px-3 py-2`) and gap (`gap-3` to `gap-2`)
- The `main` overflow-y-auto handles all scrolling; the kanban board's outer div changes from `h-full` to `flex-1 min-h-0` to prevent overflow escape

