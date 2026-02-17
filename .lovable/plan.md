

## Restyle Client Opportunity Status Widget and Add Clickable Navigation

### Overview
Restyle the dashboard's "Client Opportunity Status" widget to match the "Action Priority" widget pattern (section headers with icons, bullet items with descriptions and values). Make each category clickable to navigate to a new page listing all clients in that category with their opportunities for actioning.

### Part 1: Restyle the Widget

**File: `src/components/dashboard/ClientOpportunityStatusWidget.tsx`**

Replace the current table layout with the Action Priority visual pattern:
- Three collapsible sections: Urgent (red triangle icon), Important (amber clock icon), Routine (green check icon)
- Each section header shows the count badge on the right
- Under each section, list individual clients with a colored dot, truncated client name, and their total opportunity value
- Limit display to top 3-5 clients per section to fit widget height
- Make the entire section header row clickable (cursor-pointer, hover effect)

The data computation stays the same but is enriched to track per-client details (name + value) within each category.

### Part 2: Create Opportunity Action Page

**New file: `src/pages/OpportunityAction.tsx`**

A new page at `/opportunities/:category` (where category is "urgent", "important", or "routine") that:
- Shows a header with the category name and colored icon
- Lists all clients in that category in a table with columns: Client Name, Status Dot, Opportunities (comma-separated types), Total Opportunity Value
- Each client row is clickable, navigating to `/clients/:clientId?tab=opportunities`
- Includes a "Back to Dashboard" button
- Uses the same `getClientCategory` logic from the widget (extracted to a shared utility)

### Part 3: Extract Shared Logic

**New file: `src/hooks/useClientOpportunityCategories.ts`**

Extract the client categorization logic currently in `ClientOpportunityStatusWidget` into a reusable hook:
- Returns `{ urgent: ClientCategoryItem[], important: ClientCategoryItem[], routine: ClientCategoryItem[] }`
- Each item includes: `clientId`, `clientName`, `opportunities` (gap list), `totalValue`
- Used by both the dashboard widget and the new action page

### Part 4: Add Route

**File: `src/App.tsx`**

- Add route: `/opportunities/:category` pointing to `OpportunityAction` page

### Part 5: Widget Click Behavior

When clicking on a category header in the widget:
- Navigate to `/opportunities/urgent`, `/opportunities/important`, or `/opportunities/routine`
- The action page loads all clients for that category with full opportunity details

### Files Changed

| File | Action |
|------|--------|
| `src/hooks/useClientOpportunityCategories.ts` | New - shared hook for client categorization |
| `src/components/dashboard/ClientOpportunityStatusWidget.tsx` | Edit - restyle to match Action Priority pattern, add click navigation |
| `src/pages/OpportunityAction.tsx` | New - opportunity action page per category |
| `src/App.tsx` | Edit - add route for opportunity action page |

No database or backend changes required.
