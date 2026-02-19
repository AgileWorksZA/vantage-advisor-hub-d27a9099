

## Simplify Client Workflows Tab

Remove the Kanban view and Dashboard/Kanban/Overview tab switcher. Combine the dashboard stat cards with the overview table into a single, unified screen.

### Changes

**File: `src/components/client-detail/ClientWorkflowsTab.tsx`**

1. Remove the `Tabs`/`TabsList`/`TabsTrigger` view switcher and the `activeView` state
2. Remove the Kanban view block (`activeView === "kanban"`) and the `ClientWorkflowKanban` import
3. Remove the full Dashboard view block (`activeView === "dashboard"`) and the `ClientWorkflowDashboard` import
4. Remove the `Kanban` icon import from lucide
5. Extract just the stat cards row (Total Open, Due Today, Overdue, Completed) from `ClientWorkflowDashboard` and render them inline at the top -- reusing the same stats computation logic directly in this component
6. Below the stat cards, render the existing overview table (search, status filter, paginated table) exactly as-is
7. Below that, keep the Advice Workflows card unchanged
8. The "New Workflow" button stays in the header row (no longer next to tabs, just top-right)

**Result layout:**
```
[New Workflow button right-aligned]
[Total Open] [Due Today] [Overdue] [Completed]   <-- stat cards
[Search... | Status filter]                        <-- overview filters
[Workflows table with pagination]                  <-- overview table
[Advice Workflows card]                            <-- unchanged
```

### Technical Details

- Import `ListTodo`, `Clock`, `AlertTriangle`, `CheckCircle2` from lucide for the stat card icons
- Copy the `stats` computation logic (useMemo) from `ClientWorkflowDashboard` into `ClientWorkflowsTab` -- counts for open, dueToday, overdue, completed using `isBefore`, `startOfDay`, `format` from date-fns
- Render 4 stat `Card` components in a `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4` grid matching the existing dashboard style
- No changes needed to hooks or other files

