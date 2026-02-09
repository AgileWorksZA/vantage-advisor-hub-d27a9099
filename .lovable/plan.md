

## Fix Task Filters and Add Saved Views

### Problem Analysis
The "Failed to load tasks" error occurs because the `useTaskTypes` hook returns `code` values (e.g., "001", "002") from `admin_general_lists`, but the database `tasks` table uses PostgreSQL enums with human-readable values (e.g., "Not Started", "In Progress"). When filtering, the query sends `code: "002"` but the enum expects `"In Progress"`, causing a `22P02` invalid enum error.

### Changes Overview

#### 1. Fix Filter Value Mismatch (useTaskTypes hook)
**File: `src/hooks/useTaskTypes.ts`**

The `useTaskTypes` hook maps `code` as the option value. Since the database enums use the `name` values (e.g., "Not Started", "In Progress", "Follow-up"), change the mapping to use `name` as both the `code` and display value. This ensures filter values match the actual enum values in the database.

Alternatively, use hardcoded fallback values that match the actual enums since the admin_general_lists data is mismatched. The hook already has fallback values -- we'll make the primary mapping use `name` instead of `code`.

#### 2. Default "All Tasks" View to Show All Items
**File: `src/pages/Tasks.tsx`**

When the user lands on the "All Tasks" detail view without URL parameters, initialize filters as `{}` (empty/no filters) so all tasks load. The current behavior already does this, but we need to ensure the MultiSelect dropdowns display "(all)" when nothing is selected -- which the current `MultiSelect` component already handles.

No change needed here since empty filters `{}` already means "show all".

#### 3. Combine Date Range into Single Popover
**File: `src/components/tasks/TaskFilters.tsx`**

Replace the two separate "Due from" and "Due to" calendar popovers with a single "Due Date" popover that contains two inline calendars side by side (From and To), or a simpler approach: use `react-day-picker`'s `mode="range"` to select a date range in one calendar.

The project already has `react-day-picker` installed (used by the Calendar component). We'll create a single "Due Date" button that opens a popover with a range calendar.

#### 4. Add "Save Filter" Button
**Files:**
- **New migration**: Create a `saved_task_filters` table
- **File: `src/components/tasks/TaskFilters.tsx`**: Add "Save Filter" button inline with "Filtered by:" row
- **New file: `src/hooks/useSavedTaskFilters.ts`**: Hook for CRUD on saved filters
- **File: `src/components/tasks/TaskFilters.tsx`**: Add a dropdown/dialog to name and save the current filter, and a way to load saved filters

### Technical Details

#### Database Migration
```sql
CREATE TABLE public.saved_task_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.saved_task_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own saved filters"
  ON public.saved_task_filters
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### Fix in useTaskTypes.ts
Change the option mapping from using `code` to using `name`:
```typescript
const option: TaskTypeOption = {
  code: item.name,  // Use name instead of code to match DB enums
  name: item.name,
  ...
};
```

#### Date Range Calendar
Replace the two date pickers with a single popover using `react-day-picker` range mode:
```tsx
<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline">
      <CalendarIcon className="mr-2 h-4 w-4" />
      {hasDateRange ? `${formatDate(from)} - ${formatDate(to)}` : "Due Date"}
    </Button>
  </PopoverTrigger>
  <PopoverContent>
    <Calendar
      mode="range"
      selected={{ from: dateFrom, to: dateTo }}
      onSelect={(range) => {
        onFiltersChange({
          ...filters,
          dueDateFrom: range?.from?.toISOString().split("T")[0],
          dueDateTo: range?.to?.toISOString().split("T")[0],
        });
      }}
    />
  </PopoverContent>
</Popover>
```

#### Save Filter UI
In the "Filtered by:" row, add a "Save Filter" button that opens a small dialog/popover to name the filter. Also add a "Saved Filters" dropdown next to the search bar to load previously saved views.

### Files Changed
| File | Action |
|------|--------|
| `src/hooks/useTaskTypes.ts` | Modify - use `name` instead of `code` for option values |
| `src/components/tasks/TaskFilters.tsx` | Modify - combine date range, add save filter button, add saved filters dropdown |
| `src/hooks/useSavedTaskFilters.ts` | Create - hook for saved filter CRUD |
| `src/components/ui/calendar.tsx` | Modify - ensure range mode support |
| Database migration | Create `saved_task_filters` table with RLS |

