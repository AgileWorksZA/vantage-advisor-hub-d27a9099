

## Enhanced Client Workflows Tab

### Overview
Transform the current simple table-based Client Workflows Tab into a full-featured workflows interface mirroring the main Workflows section, with Dashboard, Kanban, and Overview views -- all scoped to the current client. Advice workflows will be constrained to four types: Onboarding, New Product, Annual Reviews, and Portfolio Switches.

### Changes

#### 1. Redesign ClientWorkflowsTab with View Tabs
Replace the current two-panel table layout with a tabbed interface offering:
- **Dashboard** -- Summary cards (Total Open, Due Today, Overdue, Completed) and charts (by Status, Type, Priority) using ECharts, matching the main Workflows Dashboard style
- **Kanban** -- Draggable board with columns (Not Started, In Progress, Pending Client, Completed, Cancelled), reusing the existing `KanbanCard` component pattern with drag-and-drop status updates
- **Overview** -- Filterable, paginated table of all client workflows with search, status/priority filters

A "+ New Workflow" button in the header opens a creation dialog.

#### 2. Advice Workflows Panel
Below the main workflows section, keep a dedicated "Advice Workflows" card with:
- A "Create Advice Workflow" button that offers only four types: **Onboarding**, **New Product**, **Annual Reviews**, **Portfolio Switches**
- Table showing existing advice workflows with columns: #, Name (type), Current Step, Status, Adviser, Date
- Status badges color-coded by state

#### 3. Data Integration
- The existing `useClientWorkflows` hook already fetches from the `workflows` and `advice_workflows` tables scoped to `client_id`
- Extend the hook to support status updates (for Kanban drag-and-drop) via a new `updateWorkflowStatus` method
- For Dashboard charts, compute stats client-side from the fetched workflows array
- The `workflows` table already has `status`, `service_area`, `current_step`, `start_date`, `end_date` columns

#### 4. Create Advice Workflow Dialog
A simple dialog with a dropdown/radio selector limited to:
- Onboarding
- New Product
- Annual Reviews
- Portfolio Switches

On submit, inserts into the `advice_workflows` table with the selected type as the name.

### Technical Details

**Files to edit:**
- `src/components/client-detail/ClientWorkflowsTab.tsx` -- Complete redesign with Dashboard/Kanban/Overview views
- `src/hooks/useClientWorkflows.ts` -- Add `updateWorkflowStatus` method for Kanban drag-and-drop

**Files to create:**
- `src/components/client-detail/workflows/ClientWorkflowKanban.tsx` -- Kanban board component reusing KanbanCard patterns
- `src/components/client-detail/workflows/ClientWorkflowDashboard.tsx` -- Dashboard with stat cards and ECharts
- `src/components/client-detail/workflows/CreateClientWorkflowDialog.tsx` -- New workflow creation dialog
- `src/components/client-detail/workflows/CreateAdviceWorkflowDialog.tsx` -- Advice workflow creation limited to 4 types

**Reused patterns from main Workflows section:**
- KanbanCard layout (priority bar, task number, drag handle)
- Dashboard stat cards (Total Open, Due Today, Overdue, Completed)
- ECharts donut/bar charts for status and type breakdowns
- TaskTable column structure adapted to workflow fields (Name, Service, Status, Adviser, Start/End Date)

**Advice workflow types enforced in UI:**
```typescript
const ADVICE_WORKFLOW_TYPES = [
  "Onboarding",
  "New Product",
  "Annual Reviews",
  "Portfolio Switches",
] as const;
```

