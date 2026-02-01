
# Plan: Add Persistent Sidebar Navigation to Tasks Page

## Overview
The Tasks page currently opens without the left sidebar menu, making navigation inconsistent with other pages like Dashboard and Clients. This plan adds the persistent sidebar navigation and includes task-specific menu items to help users filter and navigate different task categories.

## Current State
- Dashboard, Clients, and CommandCenter pages all have a consistent sidebar with navigation items
- Tasks page has a standalone header with a back button instead of the sidebar
- Users lose the ability to navigate to other sections when on the Tasks page

## Proposed Changes

### 1. Add Sidebar Navigation Structure
Match the existing sidebar pattern from Dashboard/Clients pages:
- Teal sidebar with icon-based navigation (Dash, Clients, Email, Tasks, Insights, Practice)
- Tasks item will be highlighted as active when on the Tasks page
- Plus icon at top for Practice Overview access

### 2. Add Task-Specific Sidebar Section
Below the main navigation, add a secondary section with task filters:
- **All Tasks** - Show all tasks (default view)
- **My Tasks** - Filter to current user's assigned tasks
- **Urgent** - Show only urgent tasks
- **Overdue** - Show only overdue tasks
- **By Type** - Expandable section with task type filters:
  - Client Complaints
  - Follow-ups
  - Annual Reviews
  - Portfolio Reviews
  - Compliance
  - Onboarding
  - Document Requests

### 3. Update Page Layout
- Remove the standalone header with back button
- Use the same header pattern as Dashboard/Clients (search bar, team avatars, notifications, user info)
- Move the "Tasks Dashboard" title into the main content area
- Keep the stats cards, filters, and task sections as-is

### 4. Visual Layout
```text
+------------------+------------------------------------------+
|  + (Practice)    |  [Search...]          [Avatars] [Bell]   |
+------------------+------------------------------------------+
|  Dash            |                                          |
|  Clients         |  Tasks Dashboard                         |
|  Email           |  Manage and track your practice tasks    |
|  Tasks (active)  |                                          |
|  Insights        |  [Stats Cards Row]                       |
|  Practice        |                                          |
+------------------+  [Filters Bar]                           |
|  TASK FILTERS    |                                          |
|  All Tasks       |  [Urgent Tasks Section]                  |
|  My Tasks        |                                          |
|  Urgent          |  [Normal Tasks Section]                  |
|  Overdue         |                                          |
|  By Type  v      |                                          |
|    - Complaints  |                                          |
|    - Follow-ups  |                                          |
|    - Reviews     |                                          |
+------------------+------------------------------------------+
```

---

## Technical Details

### File to Modify
- `src/pages/Tasks.tsx`

### Implementation Steps

1. **Add imports** for missing icons (LayoutDashboard, Users, Mail, LineChart, Building2, Plus, LogOut)

2. **Add sidebar items array** matching the Dashboard/Clients pattern:
```typescript
const sidebarItems = [
  { icon: LayoutDashboard, label: "Dash", path: "/dashboard" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Mail, label: "Email", path: "/email" },
  { icon: ListTodo, label: "Tasks", path: "/tasks" },
  { icon: LineChart, label: "Insights", path: "/insights" },
  { icon: Building2, label: "Practice", path: "/practice" },
];
```

3. **Add task filter items** for the secondary sidebar section:
```typescript
const taskFilterItems = [
  { label: "All Tasks", filter: "all" },
  { label: "My Tasks", filter: "my" },
  { label: "Urgent", filter: "urgent" },
  { label: "Overdue", filter: "overdue" },
];
```

4. **Replace the header** with the consistent header pattern (search, avatars, notifications, sign-out)

5. **Update the main layout structure** to use the sidebar + main content flex layout

6. **Add sidebar click handlers** to update task filters when task-specific items are clicked

7. **Add authentication check** similar to Dashboard/Clients to ensure user is logged in

### State Changes
- Add new state: `sidebarFilter` to track which sidebar filter is active
- Integrate sidebar filter with existing filter logic

### Styling
- Use the same teal color for sidebar: `bg-[hsl(180,25%,25%)]`
- Active item style: `bg-white/10 text-white`
- Inactive item style: `text-white/60 hover:bg-white/5 hover:text-white/80`
- Task filters section uses a separator and slightly smaller text
