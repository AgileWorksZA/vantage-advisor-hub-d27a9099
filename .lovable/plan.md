
# Fix Type Filter and Add Client Selection to Projects

## Issues Identified

### Issue 1: Type Filter Not Working
The `ProjectsList` component initializes `typeFilter` state from `activeFilter` prop only once on mount. When the prop changes (e.g., user clicks a category), the filter doesn't update because `useState(activeFilter)` only uses the initial value.

### Issue 2: No Client Selection in Project Cards
When expanding a project, there's no way to view or add clients. The user wants:
- Click "Clients" to see a list of available clients with opportunity values
- Select clients to add to the project
- Auto-sum selected client values to project totals
- Auto-create tasks for each selected client

---

## Solution

### Fix 1: Sync Type Filter with Active Category

**File: `src/components/ai-assistant/ProjectsList.tsx`**

Add a `useEffect` hook to sync the `typeFilter` state with the `activeFilter` prop when it changes:

```tsx
useEffect(() => {
  setTypeFilter(activeFilter);
}, [activeFilter]);
```

---

### Fix 2: Add Client Selection Dialog

#### 2a. Create New Component: `ClientSelectionDialog.tsx`

A new dialog component that:
- Fetches clients from the database with their product values
- Shows a searchable/filterable list with checkboxes
- Displays each client's potential opportunity value
- Allows multi-selection
- Shows a running total of selected clients' values
- On confirm: adds selected clients as opportunities and creates tasks

```
src/components/ai-assistant/ClientSelectionDialog.tsx
```

**Key features:**
- Uses `useClients` hook to fetch client data
- Joins with `client_products` to calculate total values
- Shows client name, current value, and opportunity potential
- Checkbox selection with running total
- "Add to Project" button that:
  - Creates `project_opportunities` entries for each client
  - Creates `project_tasks` entries for each client
  - Updates project's `target_revenue`

---

#### 2b. Update ProjectCard to Show "Add Clients" Button

**File: `src/components/ai-assistant/ProjectCard.tsx`**

In the expanded content section, add a "Clients" section header with "Add Clients" button that opens the new dialog:

```tsx
{/* Clients Section */}
<div>
  <div className="flex items-center justify-between mb-2">
    <h4 className="text-white/70 text-sm font-medium">Clients</h4>
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.stopPropagation();
        onAddClients(); // New prop
      }}
    >
      + Add Clients
    </Button>
  </div>
  {opportunities.length > 0 ? (
    // Existing opportunities list with selection checkboxes
  ) : (
    <p>No clients added yet. Add clients to start tracking opportunities.</p>
  )}
</div>
```

---

#### 2c. Create Custom Hook for Client Values

**File: `src/hooks/useClientOpportunityValues.ts`**

A new hook that:
- Fetches clients with their aggregated product values
- Calculates opportunity potential based on project type
- Returns searchable/filterable client list

```typescript
export interface ClientWithValue {
  id: string;
  name: string;
  currentValue: number;
  opportunityValue: number; // Calculated based on project type
}

export const useClientOpportunityValues = (projectType: string) => {
  // Fetch clients + product values
  // Calculate opportunity potential (e.g., 5% of current value for upsell)
  return { clients, isLoading };
};
```

---

#### 2d. Update Widget Totals

When clients are added to a project, the `project_opportunities` table is updated. The existing `useProjectOpportunities` hook already aggregates this data. The totals will automatically reflect in:

- **OpportunityMetrics** hero dashboard (total opportunity value)
- **ProjectCard** progress bars (target vs realized revenue)
- **PracticeValueIndicator** in header

---

## Data Flow

```
User Flow:
1. Expand project card → See "Clients" section
2. Click "+ Add Clients" → Opens ClientSelectionDialog
3. Browse/search clients → See name + current value + opportunity value
4. Check boxes to select → Running total updates
5. Click "Add to Project" →
   a. For each client: INSERT into project_opportunities
   b. For each client: INSERT into project_tasks (e.g., "Contact {name}")
   c. UPDATE project.target_revenue += sum(opportunity_values)
6. Dialog closes → Project card refreshes → Shows new clients/tasks
```

---

## Files to Create

| File | Description |
|------|-------------|
| `src/components/ai-assistant/ClientSelectionDialog.tsx` | Multi-select client picker with value display |
| `src/hooks/useClientOpportunityValues.ts` | Fetch clients with calculated opportunity values |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ai-assistant/ProjectsList.tsx` | Add `useEffect` to sync `typeFilter` with `activeFilter` |
| `src/components/ai-assistant/ProjectCard.tsx` | Add "Clients" section, "Add Clients" button, `onAddClients` prop |
| `src/pages/AIAssistant.tsx` | Add state/handlers for client selection dialog |

---

## Technical Details

### Opportunity Value Calculation

Based on project type, calculate potential revenue as a percentage of client's current portfolio value:

```typescript
const opportunityMultipliers = {
  growth: 0.05,      // 5% upsell potential
  derisking: 0.02,   // 2% fee from risk management
  migration: 0.03,   // 3% from platform migration
  consolidation: 0.04, // 4% from consolidation
};
```

### Task Auto-Creation

When a client is added to a project, automatically create a task:

```typescript
{
  project_id: projectId,
  client_id: clientId,
  title: `Contact ${clientName} - ${projectType}`,
  task_type: "Action",
  priority: "Medium",
  status: "Not Started",
  due_date: addDays(new Date(), 7),
  sla_deadline: addDays(new Date(), project.sla_days),
}
```
