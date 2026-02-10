

## Enhance Mobile Today Tab with Date Picker, Task Filters, and Task Detail View

### 1. Date Picker for Schedule Section

**File: `src/components/mobile/MobileTodayTab.tsx`**

Add a calendar icon button next to the "Today's Schedule" heading that opens a date picker popover using the existing `Calendar` and `Popover` components.

- Add `selectedDate` state (defaults to today)
- Replace the hardcoded `today` reference in `useCalendarEvents(selectedDate, "day")` so events reload for the chosen date
- Update the section heading to show "Today's Schedule" when the selected date is today, otherwise show the formatted date (e.g., "Schedule for 12 Feb 2025")
- Update the greeting section to reflect the selected date
- Update the "No meetings scheduled" empty state text to reflect the selected date
- The Calendar component inside the Popover allows month/year navigation out of the box via react-day-picker
- Add `pointer-events-auto` to the Calendar className for popover interactivity
- Filter events by the selected date using `isSameDay` instead of `isToday`

### 2. Task Status Filter

**File: `src/components/mobile/MobileTodayTab.tsx`**

Add a filter icon (from lucide-react) next to the "Open Tasks" heading that opens a dropdown/popover with status options.

- Add `taskStatusFilter` state defaulting to `"open"`
- Filter options: "Open" (default -- excludes Completed/Cancelled), "All", "Completed", "In Progress", "Not Started", "Pending Client"
- Update the task list filtering logic based on the selected status
- Update the heading to show the count for the filtered set
- Use a Popover with a list of radio-style options for the filter

### 3. Task Detail View

**File: `src/components/mobile/MobileTodayTab.tsx`**

Create a new component `MobileTaskDetailView.tsx` that renders when a task row is tapped.

**New File: `src/components/mobile/MobileTaskDetailView.tsx`**

A full-screen mobile view showing:
- Back button header with task title
- Status badge and priority badge
- Client name
- Task type
- Due date (with overdue indicator if applicable)
- Description (if available)
- Assigned to
- Created date
- Action buttons: "Mark Complete" toggle

Wire up task row clicks in MobileTodayTab to set a `selectedTask` state, rendering the detail view when set.

### Technical Details

**Date picker pattern (using existing shadcn components):**
```text
<Popover>
  <PopoverTrigger>
    <CalendarIcon />
  </PopoverTrigger>
  <PopoverContent>
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={setSelectedDate}
      className="pointer-events-auto"
    />
  </PopoverContent>
</Popover>
```

**Task status filter pattern:**
```text
const statusOptions = ["open", "all", "completed", "in-progress", "not-started", "pending-client"];

// Filter logic
switch (taskStatusFilter) {
  case "open": exclude Completed + Cancelled
  case "all": show everything
  case "completed": only Completed
  case "in-progress": only In Progress
  // etc.
}
```

| File | Action |
|------|--------|
| `src/components/mobile/MobileTodayTab.tsx` | Add date picker, task status filter, task tap handler |
| `src/components/mobile/MobileTaskDetailView.tsx` | Create - full-screen task detail view |
