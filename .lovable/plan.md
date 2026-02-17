

## Rename "Tasks" to "Workflows" Across the Module

This plan updates all user-visible references from "Tasks"/"Task" to "Workflows"/"Workflow" in the sidebar, page header, tab buttons, dashboard, analytics, kanban, overview, and the create dialog. Internal variable names, component filenames, and database columns remain unchanged.

### Changes by File

| File | Line(s) | Change |
|------|---------|--------|
| **src/pages/Tasks.tsx** | 41 | Sidebar label: `"Tasks"` to `"Workflows"` |
| **src/pages/Tasks.tsx** | 246 | Search placeholder: `"Search tasks..."` to `"Search workflows..."` |
| **src/pages/Tasks.tsx** | 264 | Button text: `New Task` to `New Workflow` |
| **src/pages/Tasks.tsx** | 299 | Pagination text: `"of {n} tasks"` to `"of {n} workflows"` |
| **src/components/layout/AppLayout.tsx** | 25 | Sidebar label: `"Tasks"` to `"Workflows"` |
| **src/components/tasks/TaskDashboard.tsx** | 240 | Page heading: `"Tasks Dashboard"` to `"Workflows Dashboard"` |
| **src/components/tasks/TaskDashboard.tsx** | 241 | Subheading: `"task performance"` to `"workflow performance"` |
| **src/components/tasks/TaskDashboard.tsx** | 349 | Card title: `"Tasks by Status"` to `"Workflows by Status"` |
| **src/components/tasks/TaskDashboard.tsx** | 358 | Card title: `"Tasks by Type"` to `"Workflows by Type"` |
| **src/components/tasks/TaskDashboard.tsx** | 367 | Card title: `"Tasks by Priority"` to `"Workflows by Priority"` |
| **src/components/tasks/TaskAnalyticsTab.tsx** | 524 | Group label: `"Task Type"` to `"Workflow Type"` |
| **src/components/tasks/TaskAnalyticsTab.tsx** | 580 | Tab trigger: `"By Task Type"` to `"By Workflow Type"` |
| **src/components/tasks/TaskAnalyticsTab.tsx** | 712 | Card title: `"Task Analytics"` / `"By Task Type"` to `"Workflow Analytics"` / `"By Workflow Type"` |
| **src/components/tasks/TaskAnalyticsTab.tsx** | 806-812 | Section heading: `"Task Type Standards"` to `"Workflow Type Standards"` |
| **src/components/tasks/TaskAnalyticsTab.tsx** | 825 | Table header: `"Task Type"` to `"Workflow Type"` |
| **src/components/tasks/TaskKanbanBoard.tsx** | 138 | Empty state: `"No tasks"` to `"No workflows"` |
| **src/components/tasks/TaskTable.tsx** | 116 | Empty state: `"No tasks found..."` to `"No workflows found..."` |
| **src/components/tasks/CreateTaskDialog.tsx** | 141 | Dialog title: `"Create New Task"` to `"Create New Workflow"` |
| **src/components/tasks/CreateTaskDialog.tsx** | 152 | Placeholder: `"Task title..."` to `"Workflow title..."` |
| **src/components/tasks/CreateTaskDialog.tsx** | 163 | Placeholder: `"Task description..."` to `"Workflow description..."` |
| **src/components/tasks/CreateTaskDialog.tsx** | ~325 | Submit button: `"Create Task"` to `"Create Workflow"` |

### What stays the same

- All component filenames, variable names, database columns, and internal identifiers remain as-is (no refactor of code internals)
- The URL route stays `/tasks`
- The `currentPage="tasks"` prop for GlobalAIChat is unchanged

