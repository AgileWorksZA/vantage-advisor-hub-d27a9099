

## Rearrange Kanban Filter Ribbon Layout

### Goal
Move the Due Date picker inline with the Type/Category dropdowns, and place the Group by toggle below the search bar.

### Current Layout (single row)
```text
[Search........................] [Status] [Priority] [Type] [Category] [Due Date]  | Group: [None] [Assignee] [Priority]
```

### New Layout (two rows)
```text
Row 1: [Status] [Priority] [Type] [Category] [Due Date]
Row 2: [Search.............................] [Group: None | Assignee | Priority]
```

### Changes

**1. `src/components/tasks/TaskFilters.tsx`**
- Split the single flex-wrap row into two rows inside the bordered container
- Row 1: Saved Views (if any), Status, Priority, Type, Category, Due Date -- all the dropdown filters together
- Row 2: Search bar (flex-1) -- takes the full width of the second row
- Accept optional `rightSlot` prop (ReactNode) to allow Tasks.tsx to inject the Group by buttons on the search row

**2. `src/pages/Tasks.tsx`**
- Pass the Group by toggle buttons as a `rightSlot` prop to TaskFiltersComponent, so they render inline on the search row (right-aligned)
- Remove the separate Group by div from the kanban wrapper

### Technical Detail

**TaskFilters.tsx** -- restructure the JSX inside the bordered container:
```
<div className="space-y-2">
  <div className="space-y-2 px-3 py-2 bg-muted/30 rounded-lg border">
    {/* Row 1: filter dropdowns */}
    <div className="flex flex-wrap items-center gap-2">
      [Saved Views] [Status] [Priority] [Type] [Category] [Due Date]
    </div>
    {/* Row 2: search + right slot */}
    <div className="flex items-center gap-2">
      <form className="flex-1 min-w-[200px]">...</form>
      {rightSlot}
    </div>
  </div>
  {/* Filter tags row (unchanged) */}
</div>
```

**Tasks.tsx (lines 275-286)** -- pass Group by as rightSlot and remove the wrapper div:
```
<TaskFiltersComponent
  filters={filters}
  onFiltersChange={setFilters}
  rightSlot={
    <div className="flex items-center gap-1 shrink-0">
      <span className="text-xs ...">Group:</span>
      {buttons...}
    </div>
  }
/>
```

Two files, layout restructure only.
