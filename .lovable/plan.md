

## Fix Double Scrollbars on Kanban Board

### Problem
When grouping by Assignee or Priority, two nested scrollable containers cause double scrollbars:
1. The outer board wrapper has `overflow-y-auto` (line 126)
2. Each column has its own `ScrollArea` with `max-h-[calc(100vh-320px)]` (line 166)

These two scroll contexts compete, creating an awkward double-scrollbar experience.

### Solution
Remove the per-column `ScrollArea` and `max-h` constraint. Let columns grow naturally to fit their content, and rely solely on the outer board wrapper's `overflow-y-auto` for scrolling the entire board.

### Changes

**`src/components/tasks/TaskKanbanBoard.tsx`**

1. Remove the `ScrollArea` import (line 6) since it will no longer be used
2. Replace the `<ScrollArea className="flex-1 max-h-[calc(100vh-320px)]">` wrapper (line 166) with a plain `<div className="flex-1 overflow-hidden">` -- this keeps the column layout intact without introducing its own scrollbar
3. The outer `overflow-y-auto` container (line 126) remains the single scroll context

One file, two small edits.

