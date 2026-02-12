
## Differentiate Group vs Individual Rows + Add Expand/Collapse All

### Changes (single file: `src/components/tasks/TaskAnalyticsTab.tsx`)

### 1. Visual Differentiation

**Team Group Rows** (currently `bg-muted/30` with `font-semibold`):
- Stronger background: `bg-primary/10 dark:bg-primary/20`
- Left border accent: `border-l-4 border-l-primary`
- Slightly larger text and uppercase team name
- Bold numeric values

**Individual Rows** (currently only indented with `pl-4`):
- Keep lighter background with zebra striping
- Increase left indent to `pl-8` for clearer hierarchy
- Normal font weight, slightly smaller text (`text-sm`)
- Add a subtle left border: `border-l-4 border-l-transparent` to maintain alignment

### 2. Expand All / Collapse All Controls

**Approach**: Lift the open/closed state out of `TeamGroupRow` into the parent `TaskAnalyticsTab` component.

- Add state: `expandedTeams` as a `Set<string>` (initialized with all team names)
- Pass `open` and `onToggle` props down to `TeamGroupRow` instead of it managing its own state
- Add two small icon buttons in the `CardHeader` next to the title (only visible in "By User" view):
  - `ChevronsDownUp` icon button -- "Collapse All"
  - `ChevronsUpDown` icon button -- "Expand All"
- "Expand All" sets `expandedTeams` to contain all team names
- "Collapse All" clears the set

### Summary of Edits

| Location | Change |
|---|---|
| `TeamGroupRow` component (~line 327) | Accept `open` and `onToggle` props instead of local state; update styling with stronger bg, left border accent |
| `AnalyticsDataRow` component (~line 270) | Increase indent, ensure lighter styling for contrast |
| `TaskAnalyticsTab` component (~line 354) | Add `expandedTeams` state; pass props to `TeamGroupRow` |
| Card header (~line 659) | Add Expand All / Collapse All icon buttons (visible only in "By User" sub-view) |
