

## Add Task Table to Tasks Dashboard

### Overview

Transform the Tasks Dashboard to display tasks in a data table format matching the reference screenshot, with regional filtering capabilities. The table will show columns: Client, Task Type, Title, Due date, Followup date, Status, Last comment, Advisor, Task number, Assignee, and Menu. The stat cards at the top will become clickable filters, and the page will respond to jurisdiction and advisor selection changes.

---

## Data Structure

### New Task Data Interface

Add task data to the regional data file that aligns with client information:

| Field | Type | Description |
|-------|------|-------------|
| id | string | Task number (e.g., "Onboard-81443") |
| clientName | string | Client name from regional data |
| taskType | string | Client Onboarding, Claim, Transfer, Annuity review, Quote, etc. |
| title | string | Descriptive task title |
| dueDate | string | Due date (DD/MM/YYYY format) |
| followupDate | string | Follow-up date |
| status | string | In Progress, Not Started, Completed |
| lastComment | string | Optional last comment |
| advisorInitials | string | Links to regional advisor |
| advisorName | string | Full advisor name |
| assigneeName | string | Person assigned to task |

### Sample Task Types (per region)
- Client Onboarding
- Claim
- Transfer
- Annuity review
- Quote
- Additional Contribution
- Switch
- New Business

---

## Implementation

### File 1: `src/data/regionalData.ts`

Add new interfaces and task data:

```typescript
export interface TaskData {
  id: string;
  clientName: string;
  taskType: string;
  title: string;
  dueDate: string;
  followupDate: string;
  status: "In Progress" | "Not Started" | "Completed";
  lastComment?: string;
  advisorInitials: string;
  advisorName: string;
  assigneeName: string;
  isUrgent?: boolean;
  isOverdue?: boolean;
}
```

Add `tasks: TaskData[]` to the `RegionalData` interface and populate with 15-20 tasks per jurisdiction using:
- Client names that match existing regional clients
- Advisors from the regional advisor list
- Due dates in 2025 format matching the screenshot
- Task numbers with prefixes like "Onboard-", "CRM-", "Task-", "Transaction-"

### File 2: Update `getFilteredRegionalData()` in `src/data/regionalData.ts`

Filter tasks by selected advisors:

```typescript
const filteredTasks = baseData.tasks.filter(
  task => selectedAdvisors.includes(task.advisorInitials)
);

return {
  ...baseData,
  // ... existing fields
  tasks: filteredTasks,
};
```

### File 3: `src/pages/Tasks.tsx`

#### 1. Import RegionContext

```typescript
import { useRegion } from "@/contexts/RegionContext";
```

#### 2. Add State for Card Filters

```typescript
const [cardFilter, setCardFilter] = useState<string | null>(null);
```

#### 3. Make Stat Cards Clickable

Transform each stat card to toggle filters:
- Total Tasks: Show all open tasks
- Urgent Tasks: Filter by `isUrgent === true`
- Overdue: Filter by `isOverdue === true`
- Completed Today: Filter by status "Completed"

#### 4. Replace Card Grid with Data Table

Remove the current card-based task display and add a table structure:

```typescript
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Client</TableHead>
      <TableHead>Task Type</TableHead>
      <TableHead>Title</TableHead>
      <TableHead>Due date</TableHead>
      <TableHead>Followup date</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Last comment</TableHead>
      <TableHead>Advisor</TableHead>
      <TableHead>Task number</TableHead>
      <TableHead>Assignee</TableHead>
      <TableHead></TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {filteredTasks.map(task => (
      <TableRow key={task.id}>
        <TableCell className="text-primary">{task.clientName}</TableCell>
        <TableCell>{task.taskType}</TableCell>
        <TableCell className="max-w-[180px] truncate">{task.title}</TableCell>
        <TableCell>
          <Badge variant="outline" className={getDueDateStyle(task.dueDate)}>
            {task.dueDate}
          </Badge>
        </TableCell>
        <TableCell>{task.followupDate}</TableCell>
        <TableCell>
          <span className={getStatusStyle(task.status)}>{task.status}</span>
        </TableCell>
        <TableCell className="text-muted-foreground">{task.lastComment}</TableCell>
        <TableCell>{task.advisorName}</TableCell>
        <TableCell>{task.id}</TableCell>
        <TableCell>{task.assigneeName}</TableCell>
        <TableCell>
          <DropdownMenu>...</DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

#### 5. Add Date Styling

Match the screenshot's date styling with pink/red background for past dates:

```typescript
const getDueDateStyle = (dateStr: string) => {
  const date = parseDate(dateStr);
  if (date < new Date()) {
    return "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400";
  }
  return "";
};
```

#### 6. Filter Logic with RegionContext

```typescript
const { filteredRegionalData } = useRegion();

const displayedTasks = useMemo(() => {
  let tasks = filteredRegionalData.tasks;
  
  // Apply card filter
  if (cardFilter === 'urgent') {
    tasks = tasks.filter(t => t.isUrgent);
  } else if (cardFilter === 'overdue') {
    tasks = tasks.filter(t => t.isOverdue);
  } else if (cardFilter === 'completed') {
    tasks = tasks.filter(t => t.status === 'Completed');
  }
  
  return tasks;
}, [filteredRegionalData.tasks, cardFilter]);
```

---

## Sample Data (South Africa)

| Client | Task Type | Title | Due date | Followup date | Status | Advisor | Task number | Assignee |
|--------|-----------|-------|----------|---------------|--------|---------|-------------|----------|
| Van Niekerk, Marthinus | Client onboarding | Client onboarding | 21/05/2025 | 19/05/2025 | In Progress | Johan Botha | Onboard-81443 | Johan Botha |
| Venter, Isabella | Claim | Claim vir huis | 04/08/2025 | 21/08/2025 | Not Started | Johan Botha | CRM-95294 | Johan Botha |
| Joubert, Francois | Transfer | Transfer to Ninety One | 15/08/2025 | 13/08/2025 | In Progress | Sarah Mostert | Task-95188 | Sarah Mostert |
| Le Roux, Werner | Annuity review | Annual review | 01/09/2025 | 18/09/2025 | Not Started | Pieter Naudé | CRM-96774 | Pieter Naudé |

Each jurisdiction will have 15-20 similar task entries using their culturally appropriate client names and advisors.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/data/regionalData.ts` | Add `TaskData` interface, add `tasks` array to each jurisdiction, update `getFilteredRegionalData()` |
| `src/pages/Tasks.tsx` | Import RegionContext, add clickable stat cards, replace card grid with data table, filter by region/advisor |

---

## Result

- Tasks page displays a professional data table matching the reference screenshot
- Stat cards at the top are clickable to filter the table
- Table updates automatically when jurisdiction is changed via the region selector
- Table updates automatically when advisor filter is changed
- Client names use culturally appropriate names for each region
- Due dates styled with pink/red for overdue items
- Status column styled with color-coded text
- Menu column with three-dot dropdown for actions

