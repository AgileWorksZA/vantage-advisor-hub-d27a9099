
# Full-Featured Ticketing System for Tasks

## Executive Summary

This plan transforms the Tasks page into a comprehensive, enterprise-grade ticketing system with all data stored in the database. The implementation adds missing commercial ticketing features, creates proper database relationships, and builds a modern dashboard with analytics.

## Current State Analysis

### Issues Found

| Issue | Impact |
|-------|--------|
| Tasks page uses hardcoded data from `regionalData.ts` | Data not persistent, not user-specific |
| Limited task fields in database | Missing SLA, follow-up date, tags, watchers |
| No multi-client support | Cannot link task to multiple clients |
| No task-document relationship with type | Cannot specify document type on upload |
| No task-communication linking | Communications not auto-attached |
| Task types hardcoded as ENUM | Not admin-configurable |
| No pinning capability | Cannot prioritize important tasks |
| No dashboard view | Goes straight to table, no analytics |

## Database Schema Changes

### 1. Extend `tasks` Table

Add new columns for commercial ticketing features:

| Column | Type | Description |
|--------|------|-------------|
| `task_number` | serial | Auto-incrementing ticket number (e.g., TASK-00001) |
| `sla_deadline` | date | SLA breach deadline |
| `follow_up_date` | date | Next follow-up reminder |
| `is_pinned` | boolean | Pin to top of list |
| `resolution` | text | Resolution notes when completed |
| `resolution_category` | text | How was it resolved |
| `internal_notes` | jsonb | Private notes (staff only) |
| `tags` | text[] | Searchable tags |
| `watchers` | uuid[] | Users watching this task |
| `source` | text | Origin of task (Manual, Email, AI, etc.) |
| `source_reference` | text | Reference ID from source |
| `first_response_at` | timestamptz | Time of first response (for SLA) |
| `last_activity_at` | timestamptz | Most recent activity |
| `estimated_hours` | numeric | Time estimate |
| `actual_hours` | numeric | Time spent |
| `category` | text | Task category |
| `subcategory` | text | Task subcategory |

### 2. New Junction Table: `task_clients`

Links multiple clients to a single task (many-to-many).

```text
task_clients
├── id (uuid, PK)
├── user_id (uuid, FK)
├── task_id (uuid, FK → tasks)
├── client_id (uuid, FK → clients)
├── role (text) - Primary, Related, CC
├── created_at (timestamptz)
```

### 3. New Junction Table: `task_documents`

Links documents to tasks with type specification.

```text
task_documents
├── id (uuid, PK)
├── user_id (uuid, FK)
├── task_id (uuid, FK → tasks)
├── document_id (uuid, FK → documents)
├── document_type (text) - The type user selects on upload
├── notes (text) - Optional notes about this document
├── uploaded_at (timestamptz)
├── uploaded_by (uuid)
```

### 4. New Junction Table: `task_communications`

Links communications/messages to tasks.

```text
task_communications
├── id (uuid, PK)
├── user_id (uuid, FK)
├── task_id (uuid, FK → tasks)
├── communication_id (uuid, FK → communications)
├── created_at (timestamptz)
```

### 5. New Table: `task_history`

Audit log for task changes.

```text
task_history
├── id (uuid, PK)
├── user_id (uuid, FK)
├── task_id (uuid, FK → tasks)
├── action (text) - Created, Updated, StatusChanged, etc.
├── field_name (text) - Which field changed
├── old_value (text)
├── new_value (text)
├── changed_by (uuid)
├── changed_at (timestamptz)
```

### 6. Extend `admin_general_lists` for Task Types

Add new list_types:
- `task_types` - All available task types (admin-configurable)
- `task_categories` - Task categories
- `task_resolution_types` - Resolution categories
- `task_sources` - Task origin types

### 7. Migrate Existing ENUMs to Text

Convert `task_type`, `task_status`, `task_priority` from ENUMs to TEXT for flexibility, with validation via admin lists.

## Database Indexes for Performance

Add indexes to support thousands of tasks:

```text
-- Performance indexes for large-scale operations
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status) WHERE NOT is_deleted;
CREATE INDEX idx_tasks_user_due_date ON tasks(user_id, due_date) WHERE NOT is_deleted;
CREATE INDEX idx_tasks_is_pinned ON tasks(user_id, is_pinned) WHERE is_pinned = true;
CREATE INDEX idx_tasks_task_number ON tasks(user_id, task_number);
CREATE INDEX idx_tasks_sla_deadline ON tasks(user_id, sla_deadline) WHERE status NOT IN ('Completed', 'Cancelled');
CREATE INDEX idx_task_clients_task ON task_clients(task_id);
CREATE INDEX idx_task_clients_client ON task_clients(client_id);
CREATE INDEX idx_task_documents_task ON task_documents(task_id);
CREATE INDEX idx_task_communications_task ON task_communications(task_id);
CREATE INDEX idx_task_history_task ON task_history(task_id);
```

## Frontend Architecture

### New Page Structure: `/tasks`

```text
/tasks (Tasks Page)
├── View Toggle: [Dashboard] / [Detail List]
│
├── Dashboard View (Default landing)
│   ├── Stats Cards Row
│   │   ├── Total Open Tasks
│   │   ├── Due Today
│   │   ├── Overdue
│   │   └── Completed This Week
│   │
│   ├── Charts Row
│   │   ├── Tasks by Status (Pie Chart)
│   │   ├── Tasks by Type (Bar Chart)
│   │   ├── SLA Performance (Gauge)
│   │   └── Tasks Trend (Line Chart - 30 days)
│   │
│   ├── Recent Activity
│   │   └── Timeline of recent task changes
│   │
│   └── [Go to Detail →] Button
│
└── Detail View
    ├── Filter Bar
    │   ├── Search (title, client, task number)
    │   ├── Task Type (multi-select from admin_general_lists)
    │   ├── Status (multi-select)
    │   ├── Priority (multi-select)
    │   ├── Due Date (date picker)
    │   └── Clear Filters
    │
    ├── Actions Bar
    │   ├── [+ New Task]
    │   ├── Bulk Actions (when rows selected)
    │   └── Export
    │
    └── Tasks Table
        ├── Columns: Pin, Client(s), Type, Title, Due, Follow-up, Status, SLA, Assigned, Task#
        ├── Pinned tasks always at top
        ├── Row click → Task Detail Sheet
        └── Pagination (15 per page)
```

### New Component: `TaskDetailSheet.tsx`

Full-screen sheet for viewing/editing a task.

```text
TaskDetailSheet
├── Header
│   ├── Task Number (TASK-00001)
│   ├── Title (editable)
│   ├── Status Badge (with dropdown to change)
│   ├── Pin Toggle
│   └── Actions: [Send Message] [Delete]
│
├── Tabs
│   ├── Details Tab
│   │   ├── Client(s) - Multi-select from clients table
│   │   ├── Task Type (from admin_general_lists)
│   │   ├── Category/Subcategory
│   │   ├── Priority
│   │   ├── Due Date
│   │   ├── Follow-up Date
│   │   ├── SLA Deadline
│   │   ├── Assigned To (from team_members)
│   │   ├── Watchers
│   │   ├── Tags
│   │   ├── Source
│   │   └── Description (rich text)
│   │
│   ├── Activity Tab
│   │   ├── Add Note Form
│   │   ├── Timeline (notes + history combined)
│   │   └── Internal notes toggle
│   │
│   ├── Documents Tab
│   │   ├── [Upload Document] with type selector
│   │   ├── Documents Table
│   │   └── Document type from admin_document_templates
│   │
│   ├── Communications Tab
│   │   ├── [Compose Message] → Opens compose screen
│   │   ├── Linked Communications List
│   │   └── Auto-links when sent from task
│   │
│   └── Time Tracking Tab
│       ├── Estimated vs Actual hours
│       └── Time entries log
│
└── Footer
    ├── Created: date by user
    ├── Last Updated: date
    └── Resolution (when completed)
```

### New Component: `TaskDashboard.tsx`

Dashboard with charts using ECharts (already installed).

Charts to display:
- Tasks by Status (Donut chart)
- Tasks by Type (Horizontal bar)
- Tasks by Priority (Stacked bar)
- SLA Compliance (Gauge - % on time)
- Tasks Created vs Completed (Line - 30 day trend)
- Overdue by Assignee (Bar chart)

### Communication Integration

When user clicks "Send Message" from a task:
1. Navigate to `/compose-email?task_id=xxx`
2. Pre-populate client(s) from task
3. On send, auto-create `task_communications` record
4. Auto-add note to task: "Email sent: [subject]"

## Files to Create

| File | Purpose |
|------|---------|
| `src/pages/Tasks.tsx` | Complete rewrite - remove hardcoded data |
| `src/components/tasks/TaskDashboard.tsx` | Dashboard with charts |
| `src/components/tasks/TaskDetailSheet.tsx` | Full task edit sheet |
| `src/components/tasks/TaskTable.tsx` | Data table component |
| `src/components/tasks/TaskFilters.tsx` | Filter bar component |
| `src/components/tasks/TaskClientSelector.tsx` | Multi-client picker |
| `src/components/tasks/TaskDocumentUpload.tsx` | Document upload with type |
| `src/components/tasks/TaskCommunications.tsx` | Communications list |
| `src/components/tasks/TaskTimeline.tsx` | Activity timeline |
| `src/hooks/useTasks.ts` | Complete rewrite with new schema |
| `src/hooks/useTaskClients.ts` | Manage task-client links |
| `src/hooks/useTaskDocuments.ts` | Manage task documents |
| `src/hooks/useTaskCommunications.ts` | Manage task communications |
| `src/hooks/useTaskHistory.ts` | Fetch task audit log |
| `src/hooks/useTaskTypes.ts` | Fetch task types from admin lists |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/ComposeEmail.tsx` | Accept task_id param, auto-link on send |
| `src/components/administration/notes-tasks/NotesTasksSection.tsx` | Add task types management |
| `src/components/administration/AdminLayout.tsx` | Ensure Notes & Tasks section includes task types |

## Database Migration Summary

```sql
-- 1. Extend tasks table with new columns
-- 2. Create task_clients junction table
-- 3. Create task_documents junction table  
-- 4. Create task_communications junction table
-- 5. Create task_history audit table
-- 6. Add performance indexes
-- 7. Seed default task types into admin_general_lists
-- 8. Add triggers for updated_at and history tracking
```

## Edge Function: `seed-admin-task-data`

Seeds default task types, categories, and resolution types into `admin_general_lists`:

Task Types (23 items matching current UI):
- Access Request, Annuity review, Claim, Client onboarding, Client review, Compliance, Compliance alert, Consent request, Contact request, Contract changes, Document request, Estate administration, Fee change, Intermediary appointment, Leads, MIS form, New business, Other, Personal detail change, Planning hub, Referral Task, Risk rating, Transaction Transfer

Task Categories:
- Client Service, Compliance, Operations, Sales, Administration

Resolution Types:
- Resolved, Closed - No Action, Transferred, Duplicate, Client Request

Task Sources:
- Manual, Email, Phone Call, AI Generated, Client Portal, System

## Key Features Summary

| Feature | Implementation |
|---------|----------------|
| Multi-client linking | `task_clients` junction table, client picker in UI |
| Document upload with type | `task_documents` table, type selector from admin templates |
| Launch communication from task | "Send Message" button → compose screen with task_id |
| Auto-store message against task | `task_communications` created on send |
| Pin task to top | `is_pinned` column, pinned tasks sorted first |
| Dashboard with graphs | ECharts-based dashboard as default view |
| Notes under all linked clients | Query `task_clients` to show task on each client's record |
| Admin-configurable types | Task types from `admin_general_lists` instead of ENUMs |
| SLA tracking | `sla_deadline` with visual indicators |
| Audit history | `task_history` table with all changes |

## Data Flow for Notes Visibility

When a task is linked to multiple clients:
1. Task is created with entry in `task_clients` for each client
2. On client detail page → Notes/Tasks tab:
   - Query: `SELECT * FROM tasks WHERE id IN (SELECT task_id FROM task_clients WHERE client_id = ?)`
   - Shows the task under all linked clients
3. Notes added to task appear on all linked client records

## Performance Considerations

- Indexes on all foreign keys and common query patterns
- Pagination on all list views (15 items default)
- Partial indexes for active records (WHERE NOT is_deleted)
- JSONB for flexible notes storage
- Task number uses sequence for fast auto-increment

## RLS Policies

All new tables follow the existing pattern:
```sql
CREATE POLICY "Users can [action] their own [table]"
ON [table] FOR [action]
USING/WITH CHECK (auth.uid() = user_id);
```

## Implementation Order

1. Database migration (schema changes, tables, indexes, RLS)
2. Seed edge function for default task types
3. New hooks (useTasks, useTaskClients, useTaskDocuments, etc.)
4. Task components (TaskDashboard, TaskDetailSheet, TaskTable)
5. Rewrite Tasks page to use new components
6. Update ComposeEmail for task integration
7. Update administration section for task type management
8. Testing and validation
