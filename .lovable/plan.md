

## Add Pagination, Filter Row, and Expanded Task Data

### Overview

Add a filter row above the tasks table with search, task type multi-selector, status dropdown, and date picker. Implement pagination with 15 tasks per page and expand task data to support 3 pages (45+ tasks per jurisdiction). All filters work together and integrate with existing regional/advisor filtering.

---

## Part 1: Expand Task Data

### File: `src/data/regionalData.ts`

Update the `TaskData` interface status type to include new statuses:

```typescript
export interface TaskData {
  id: string;
  clientName: string;
  taskType: string;
  title: string;
  dueDate: string;
  followupDate: string;
  status: "In Progress" | "Not Started" | "Completed" | "Overdue" | "Cancelled";
  lastComment?: string;
  advisorInitials: string;
  advisorName: string;
  assigneeName: string;
  isUrgent?: boolean;
  isOverdue?: boolean;
}
```

Expand each jurisdiction's `tasks` array from 15 to 45 entries using:
- The full list of task types provided
- All status options
- Client names from existing regional data
- Distributed across advisors

### Task Types to Use:
- Access Request
- Annuity review
- Claim
- Client onboarding
- Client review
- Compliance
- Compliance alert
- Consent request
- Contact request
- Contract changes
- Document request
- Estate administration
- Fee change
- Intermediary appointment
- Leads
- MIS form
- New business
- Other
- Personal detail change
- Planning hub
- Referral Task
- Risk rating
- Transaction Transfer

---

## Part 2: Create MultiSelect Component

### New File: `src/components/ui/multi-select.tsx`

Create a reusable multi-select component with search functionality:

```typescript
import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleClear = (e: React.MouseEvent, value: string) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== value));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between min-w-[180px]", className)}
        >
          {selected.length === 0 ? (
            <span className="text-muted-foreground">{placeholder}</span>
          ) : (
            <div className="flex gap-1 flex-wrap">
              {selected.length <= 2 ? (
                selected.map((value) => (
                  <Badge key={value} variant="secondary" className="text-xs">
                    {options.find((o) => o.value === value)?.label}
                    <X
                      className="ml-1 h-3 w-3 cursor-pointer"
                      onClick={(e) => handleClear(e, value)}
                    />
                  </Badge>
                ))
              ) : (
                <span>{selected.length} selected</span>
              )}
            </div>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0 bg-popover z-50">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selected.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

---

## Part 3: Update Tasks Page

### File: `src/pages/Tasks.tsx`

#### 1. Add New Imports

```typescript
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { format } from "date-fns";
```

#### 2. Add Filter State Variables

```typescript
const [tableSearchQuery, setTableSearchQuery] = useState("");
const [selectedTaskTypes, setSelectedTaskTypes] = useState<string[]>([]);
const [selectedStatus, setSelectedStatus] = useState<string>("all");
const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
const [currentPage, setCurrentPage] = useState(1);
const ITEMS_PER_PAGE = 15;
```

#### 3. Define Filter Options

```typescript
const taskTypeOptions = [
  { value: "Access Request", label: "Access Request" },
  { value: "Annuity review", label: "Annuity review" },
  { value: "Claim", label: "Claim" },
  { value: "Client onboarding", label: "Client onboarding" },
  { value: "Client review", label: "Client review" },
  { value: "Compliance", label: "Compliance" },
  { value: "Compliance alert", label: "Compliance alert" },
  { value: "Consent request", label: "Consent request" },
  { value: "Contact request", label: "Contact request" },
  { value: "Contract changes", label: "Contract changes" },
  { value: "Document request", label: "Document request" },
  { value: "Estate administration", label: "Estate administration" },
  { value: "Fee change", label: "Fee change" },
  { value: "Intermediary appointment", label: "Intermediary appointment" },
  { value: "Leads", label: "Leads" },
  { value: "MIS form", label: "MIS form" },
  { value: "New business", label: "New business" },
  { value: "Other", label: "Other" },
  { value: "Personal detail change", label: "Personal detail change" },
  { value: "Planning hub", label: "Planning hub" },
  { value: "Referral Task", label: "Referral Task" },
  { value: "Risk rating", label: "Risk rating" },
  { value: "Transaction Transfer", label: "Transaction Transfer" },
];

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "In Progress", label: "In Progress" },
  { value: "Completed", label: "Completed" },
  { value: "Overdue", label: "Overdue" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Not Started", label: "Not Started" },
];
```

#### 4. Update Filter Logic

```typescript
const displayedTasks = useMemo(() => {
  let tasks = filteredRegionalData.tasks || [];
  
  // Apply card filter (existing)
  if (cardFilter === 'urgent') {
    tasks = tasks.filter(t => t.isUrgent && t.status !== "Completed");
  } else if (cardFilter === 'overdue') {
    tasks = tasks.filter(t => t.isOverdue && t.status !== "Completed");
  } else if (cardFilter === 'completed') {
    tasks = tasks.filter(t => t.status === "Completed");
  } else if (cardFilter === 'total' || cardFilter === null) {
    tasks = tasks.filter(t => t.status !== "Completed");
  }
  
  // Apply table search filter
  if (tableSearchQuery) {
    const query = tableSearchQuery.toLowerCase();
    tasks = tasks.filter(t => 
      t.clientName.toLowerCase().includes(query) ||
      t.title.toLowerCase().includes(query) ||
      t.taskType.toLowerCase().includes(query) ||
      t.id.toLowerCase().includes(query)
    );
  }
  
  // Apply task type filter
  if (selectedTaskTypes.length > 0) {
    tasks = tasks.filter(t => selectedTaskTypes.includes(t.taskType));
  }
  
  // Apply status filter
  if (selectedStatus !== "all") {
    tasks = tasks.filter(t => t.status === selectedStatus);
  }
  
  // Apply date filter (filter by due date)
  if (selectedDate) {
    const dateStr = format(selectedDate, "dd/MM/yyyy");
    tasks = tasks.filter(t => t.dueDate === dateStr);
  }
  
  return tasks;
}, [filteredRegionalData.tasks, cardFilter, tableSearchQuery, selectedTaskTypes, selectedStatus, selectedDate]);

// Paginated tasks
const paginatedTasks = useMemo(() => {
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  return displayedTasks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
}, [displayedTasks, currentPage]);

const totalPages = Math.ceil(displayedTasks.length / ITEMS_PER_PAGE);

// Reset to page 1 when filters change
useEffect(() => {
  setCurrentPage(1);
}, [filteredRegionalData.tasks, cardFilter, tableSearchQuery, selectedTaskTypes, selectedStatus, selectedDate]);
```

#### 5. Add Filter Row (Above Table)

```jsx
{/* Filter Row */}
<div className="flex flex-wrap gap-3 mb-4 items-center">
  {/* Search */}
  <div className="relative">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder="Search tasks..."
      value={tableSearchQuery}
      onChange={(e) => setTableSearchQuery(e.target.value)}
      className="pl-9 w-[200px]"
    />
  </div>
  
  {/* Task Type Multi-Select */}
  <MultiSelect
    options={taskTypeOptions}
    selected={selectedTaskTypes}
    onChange={setSelectedTaskTypes}
    placeholder="Task Type"
    className="w-[180px]"
  />
  
  {/* Status Dropdown */}
  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
    <SelectTrigger className="w-[150px]">
      <SelectValue placeholder="Status" />
    </SelectTrigger>
    <SelectContent className="bg-popover z-50">
      {statusOptions.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  
  {/* Date Picker */}
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline" className="w-[150px] justify-start text-left font-normal">
        <CalendarIcon className="mr-2 h-4 w-4" />
        {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "Due Date"}
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0 bg-popover z-50" align="start">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        initialFocus
        className="pointer-events-auto"
      />
    </PopoverContent>
  </Popover>
  
  {/* Clear Filters */}
  {(tableSearchQuery || selectedTaskTypes.length > 0 || selectedStatus !== "all" || selectedDate) && (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        setTableSearchQuery("");
        setSelectedTaskTypes([]);
        setSelectedStatus("all");
        setSelectedDate(undefined);
      }}
    >
      <X className="h-4 w-4 mr-1" />
      Clear
    </Button>
  )}
</div>
```

#### 6. Add Pagination Below Table

```jsx
{/* Pagination */}
{totalPages > 1 && (
  <div className="flex items-center justify-between mt-4 px-2">
    <p className="text-sm text-muted-foreground">
      Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, displayedTasks.length)} of {displayedTasks.length} tasks
    </p>
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <PaginationItem key={page}>
            <PaginationLink
              onClick={() => setCurrentPage(page)}
              isActive={currentPage === page}
              className="cursor-pointer"
            >
              {page}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
)}
```

#### 7. Update Table to Use Paginated Data

Change `displayedTasks.map` to `paginatedTasks.map` in the table body.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/data/regionalData.ts` | Update status type, expand tasks array to 45 entries per jurisdiction |
| `src/components/ui/multi-select.tsx` | New file - reusable multi-select with search |
| `src/pages/Tasks.tsx` | Add filter row, pagination, new state variables, updated filter logic |

---

## Visual Layout

```text
+------------------------------------------------------------------+
|  [Search input]  [Task Type ▼]  [Status ▼]  [Due Date 📅]  [Clear] |
+------------------------------------------------------------------+
| Client | Task Type | Title | Due date | ... | Assignee | Menu    |
+------------------------------------------------------------------+
| ... table rows (15 per page) ...                                  |
+------------------------------------------------------------------+
| Showing 1 to 15 of 45 tasks    [< Previous] [1] [2] [3] [Next >] |
+------------------------------------------------------------------+
```

---

## Technical Notes

- Task Type uses multi-select with search for filtering multiple types at once
- Status uses single-select dropdown
- Date picker filters by exact due date match
- All filters work together (AND logic)
- Pagination resets to page 1 when any filter changes
- 15 items per page = 3 pages for 45 tasks
- Clear button appears when any filter is active

