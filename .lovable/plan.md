

## Filter Mobile Tab Data by Selected Advisor

### Problem
All mobile tabs (Today, Clients, Tasks, Insights) display unfiltered data from the database, ignoring the selected advisor. Only data linked to clients of the selected advisor should be shown; unrelated dummy/demo data should be excluded.

### Approach
Apply the same advisor-based filtering pattern used in the web view pages (Clients.tsx, Tasks.tsx, Calendar.tsx) to each mobile tab component. Each tab will import `useRegion()` to access `selectedAdvisors` and `regionalData`, map initials to full advisor names, and filter the fetched data accordingly.

### Changes

**1. MobileClientsTab.tsx**
- Import `useRegion` from `RegionContext`
- Derive `selectedAdvisorNames` from `selectedAdvisors` + `regionalData.advisors`
- Filter the `clients` list so only clients whose `advisor` field matches a selected advisor name are shown

**2. MobileTodayTab.tsx**
- Import `useRegion` and `useClients`
- Derive `selectedAdvisorNames`
- Filter calendar events: keep non-client events, filter client-linked events by `clientAdvisor`
- Filter tasks: keep practice tasks, filter client-linked tasks by matching the task's `clientName` against the filtered client list (since `useTasks` doesn't expose `client_advisor` directly, filter by checking if the task's associated client belongs to the selected advisor)

**3. MobileTasksTab.tsx**
- Import `useRegion` and derive `selectedAdvisorNames`
- The `useTasks` hook doesn't expose `client_advisor`. Two options:
  - Option A: Also fetch clients via `useClients`, build a set of advisor-filtered client names, and filter tasks by matching `clientName`
  - Option B: Enhance `useTasks` to include `client_advisor` (similar to how `useTasksEnhanced` does it)
- Use Option A to avoid modifying the shared hook, keeping changes localized to mobile components

**4. MobileInsightsTab.tsx**
- Import `useRegion` and derive `selectedAdvisorNames`
- Filter both clients and tasks by advisor before computing metrics
- All metric cards and task distribution will reflect only the selected advisor's data

**5. MobileAITab.tsx**
- No changes needed -- this tab uses hardcoded AI chat responses with no real data

### Technical Details

The filtering pattern (reused from web pages):

```text
// Derive full advisor names from initials
const selectedAdvisorNames = regionalData.advisors
  .filter(a => selectedAdvisors.includes(a.initials))
  .map(a => a.name);

// For clients: filter by client.advisor field
clients.filter(c => selectedAdvisorNames.includes(c.advisor));

// For tasks (without client_advisor): filter by client membership
// Build a Set of advisor-filtered client names, then match task.clientName

// For events: keep non-client events, filter client events by clientAdvisor
events.filter(e => !e.clientId || selectedAdvisorNames.includes(e.clientAdvisor));
```

| File | Action |
|------|--------|
| `src/components/mobile/MobileClientsTab.tsx` | Add advisor filtering to client list |
| `src/components/mobile/MobileTodayTab.tsx` | Add advisor filtering to events and tasks |
| `src/components/mobile/MobileTasksTab.tsx` | Add advisor filtering to task list |
| `src/components/mobile/MobileInsightsTab.tsx` | Add advisor filtering to metrics computation |

