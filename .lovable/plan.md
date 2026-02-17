

## Add Urgency Categorization to Opportunities Tab and Dynamic Status Dot

### Overview
Apply the same Urgent / Important / Routine segmentation (used in the Action Priority dashboard widget) to each of the three sub-tabs under "Opportunities": Opportunities, Outstanding, and Recent Activity. Additionally, make the client avatar status dot in the ribbon dynamically reflect the highest urgency level.

### Part 1: Extract Priority Assignment Logic

**New file: `src/lib/opportunity-priority.ts`**

Create a shared utility that assigns a priority ("urgent" | "important" | "routine") to each opportunity/gap and outstanding item. This reuses the same rules already in `ClientDashboardTab`:

- **Opportunities**: Tax Loss and Cross-sell = urgent; Platform, Idle Cash, New Business = important; Upsell, Migration, Bank Scrape = routine
- **Outstanding tasks**: High priority or overdue = urgent; Medium priority = important; Low priority or no priority = routine
- **Outstanding documents**: Expired = urgent; Expiring soon = important; other = routine
- **Recent Activity**: all items default to routine (informational)

Also export a helper `getHighestUrgency(opportunities, outstandingTasks, outstandingDocs)` that returns `"urgent" | "important" | "routine" | "green"` for the status dot color.

### Part 2: Update OpportunitiesTab

**File: `src/components/client-detail/next-best-action/OpportunitiesTab.tsx`**

- Import the priority utility
- Group opportunities and gaps into three segments: Urgent, Important, Routine
- Render each segment with the same visual treatment as the Action Priority widget:
  - Section header with colored icon (red triangle for Urgent, amber clock for Important, green check for Routine) + count badge
  - Items listed under each section with colored dot prefix
- Preserve existing badges (Growth, Cross-sell, etc.) and currency values within each item

### Part 3: Update OutstandingTab

**File: `src/components/client-detail/next-best-action/OutstandingTab.tsx`**

- Import the priority utility
- Group tasks and documents into Urgent / Important / Routine segments
- Same section header pattern with icons and count badges
- Tasks: overdue or High priority = Urgent, Medium = Important, Low = Routine
- Documents: Expired = Urgent, Expiring = Important

### Part 4: Update RecentActivityTab

**File: `src/components/client-detail/next-best-action/RecentActivityTab.tsx`**

- All recent activity items are informational, so group them all under "Routine"
- Add the green Routine section header for consistency

### Part 5: Dynamic Status Dot on Client Ribbon

**File: `src/components/client-detail/ClientRibbon.tsx`**

- Add a new optional prop: `statusDotColor?: "red" | "orange" | "green"`
- Replace the hardcoded `bg-emerald-500` dot with a dynamic class:
  - `"red"` = `bg-red-500`
  - `"orange"` = `bg-orange-500`  
  - `"green"` (default) = `bg-emerald-500`

**File: `src/pages/ClientDetail.tsx`**

- Compute the highest urgency level using the same product/opportunity data already available in `ClientSummaryTab`
- Generate the 360 view products + gap opportunities at the `ClientDetail` level (or pass computed status up)
- Pass the resulting `statusDotColor` to `ClientRibbon`

To keep this clean, the simplest approach: replicate the lightweight gap-detection logic in `ClientDetail` using `generateClient360Data` and the priority utility, then pass the color down.

### Part 6: Update ClientDashboardTab

**File: `src/components/client-detail/ClientDashboardTab.tsx`**

- Refactor the inline priority assignment to use the shared `opportunity-priority.ts` utility (removing duplication)

### Files Changed

| File | Action |
|------|--------|
| `src/lib/opportunity-priority.ts` | **New** - shared priority assignment utility |
| `src/components/client-detail/next-best-action/OpportunitiesTab.tsx` | **Edit** - group items by urgency with section headers |
| `src/components/client-detail/next-best-action/OutstandingTab.tsx` | **Edit** - group items by urgency with section headers |
| `src/components/client-detail/next-best-action/RecentActivityTab.tsx` | **Edit** - add routine section header |
| `src/components/client-detail/ClientRibbon.tsx` | **Edit** - dynamic status dot color prop |
| `src/pages/ClientDetail.tsx` | **Edit** - compute urgency, pass to ribbon |
| `src/components/client-detail/ClientDashboardTab.tsx` | **Edit** - use shared utility |

No database or backend changes required. All logic is client-side using existing demo data.
