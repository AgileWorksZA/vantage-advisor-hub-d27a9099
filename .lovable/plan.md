
# Add Task Statuses Tab and Link to Task Dropdowns

## Overview

This implementation adds a "Task Statuses" tab to the Notes & Tasks administration screen, populates it with default statuses, and ensures both Task Status and Priorities dropdowns in the Task screens are properly linked to the database values.

## Current State Analysis

### Identified Issues

| Issue | Details |
|-------|---------|
| Tab ID mismatch | AdminLayout uses `"subjects"` but NotesTasksSection checks for `"note-subjects"` |
| Missing Task Statuses tab | No tab for managing task statuses in admin |
| Priority list_type mismatch | Database has `priorities`, useTaskTypes looks for `task_priorities` |
| No task_statuses data | Missing `task_statuses` entries in `admin_general_lists` |

### Current Tab Configuration

```text
AdminLayout.tsx tabs:
├── subjects → Should map to admin_note_subjects table
├── task-types → maps to list_type: task_types
├── priorities → maps to list_type: priorities
```

### useTaskTypes Hook Expectations

The hook fetches from `admin_general_lists` with these list_types:
- `task_statuses` - for status dropdown
- `task_priorities` - for priority dropdown (or `priorities`)
- `task_types` - for type dropdown

## Implementation Plan

### 1. Update AdminLayout.tsx

Add the new "Task Statuses" tab and fix the tab ID for Note Subjects:

```typescript
tabs: [
  { id: "note-subjects", label: "Note Subjects" },  // Fix ID
  { id: "task-types", label: "Task Types" },
  { id: "task-statuses", label: "Task Statuses" },  // NEW
  { id: "priorities", label: "Priorities" },
]
```

### 2. Update NotesTasksSection.tsx

Extend the `tabToListType` mapping:

```typescript
const tabToListType: Record<string, string> = {
  "task-types": "task_types",
  "task-statuses": "task_statuses",  // NEW
  "priorities": "priorities",
};
```

### 3. Update useTaskTypes.ts

Modify the hook to also look for `priorities` list_type (in addition to `task_priorities`) for backward compatibility:

```typescript
// In the query
.in("list_type", [
  "task_types", 
  "task_categories", 
  "task_resolution_types", 
  "task_sources", 
  "task_statuses", 
  "task_priorities",
  "priorities"  // Add for compatibility
])

// In the switch statement
case "task_priorities":
case "priorities":
  priorities.push(option);
  break;
```

### 4. Seed Default Task Statuses

Insert default task statuses into `admin_general_lists`:

| Code | Name | Display Order |
|------|------|---------------|
| Open | Open | 1 |
| In Progress | In Progress | 2 |
| Closed | Closed | 3 |

This will be done via database insert.

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/administration/AdminLayout.tsx` | Add task-statuses tab, fix note-subjects ID |
| `src/components/administration/notes-tasks/NotesTasksSection.tsx` | Add task-statuses to tabToListType mapping |
| `src/hooks/useTaskTypes.ts` | Support both `priorities` and `task_priorities` list_types |

## Database Changes

Insert default task statuses (via SQL insert, not migration since this is data not schema):

```sql
INSERT INTO admin_general_lists (user_id, list_type, code, name, display_order, is_active)
SELECT 
  auth.uid(),
  'task_statuses',
  code,
  name,
  display_order,
  true
FROM (VALUES 
  ('Open', 'Open', 1),
  ('In Progress', 'In Progress', 2),
  ('Closed', 'Closed', 3)
) AS v(code, name, display_order)
ON CONFLICT DO NOTHING;
```

Note: Since this is user-scoped data, each user will need to seed their own statuses. We can add this to the existing seed edge function or handle it in the UI.

## UI Flow After Implementation

```text
Notes & Tasks Section
├── Note Subjects tab → admin_note_subjects table
├── Task Types tab → admin_general_lists (list_type: task_types)
├── Task Statuses tab → admin_general_lists (list_type: task_statuses)  [NEW]
└── Priorities tab → admin_general_lists (list_type: priorities)
```

## Data Flow for Task Dropdowns

```text
Task Create/Edit Screens
├── Status Dropdown → useTaskTypes().taskStatuses → admin_general_lists (list_type: task_statuses)
├── Priority Dropdown → useTaskTypes().taskPriorities → admin_general_lists (list_type: priorities)
└── Type Dropdown → useTaskTypes().taskTypes → admin_general_lists (list_type: task_types)
```

## Expected Behavior

| Action | Result |
|--------|--------|
| Navigate to Notes & Tasks | Shows 4 tabs including new "Task Statuses" |
| Click Task Statuses tab | Shows table with Open, In Progress, Closed |
| Add new status | Appears in Task dropdown immediately |
| Edit/delete status | Reflected in Task dropdown |
| Open Task Detail Sheet | Status dropdown shows database values |
| Open Create Task Dialog | Status dropdown shows database values |
| Open Task Filters | Status filter shows database values |

## Fallback Behavior

If no statuses exist in the database, the `useTaskTypes` hook falls back to hardcoded defaults:
- Not Started
- In Progress  
- Pending Client
- Completed
- Cancelled

This ensures the UI still works while the user sets up their admin data.
