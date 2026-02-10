

## Rename "Recent Activity" to "Next Best Action" with Tabbed Sub-Sections

### Overview

Replace the current "Recent Activity" card on the client Summary tab with a "Next Best Action" card containing three tabs: Opportunities (default), Outstanding, and Recent Activity. Each tab header shows an item count badge. Data for Opportunities and Outstanding is fetched from the database using the existing `useClientMeetingPrep` hook.

---

### Changes

**File: `src/components/client-detail/ClientSummaryTab.tsx`**

1. **Imports**: Add `Tabs, TabsList, TabsTrigger, TabsContent` from `@/components/ui/tabs`, `Badge` from `@/components/ui/badge`, `useClientMeetingPrep` hook, and additional icons (`TrendingUp`, `AlertCircle`, `Clock`, `Shield`, `FileWarning`, `RefreshCw`).

2. **Rename card title** from "Recent Activity" to "Next Best Action".

3. **Add `useClientMeetingPrep(clientId)` call** inside the component to fetch opportunities, tasks, and documents.

4. **Replace the card body** with three tabs:

   **Tab 1 - Opportunities (default)**
   - Shows AI-identified revenue opportunities from `data.opportunities` (from `project_opportunities` table).
   - Falls back to gap-analysis heuristics using `data.products` when no DB opportunities exist (same logic as MeetingPrepPanel):
     - Has investments but no insurance -> "Cross-sell insurance"
     - Multiple providers -> "Consolidate to preferred platform"
     - High-value portfolio -> "Drive additional contributions"
   - Each item shows: opportunity type badge, description/reasoning, potential revenue formatted as currency, and suggested action.
   - Compact layout matching existing activity item density (text-xs, py-1.5).
   - Tab label: `Opportunities (N)` where N = count of items.

   **Tab 2 - Outstanding**
   - Shows compliance tasks, outstanding documents, onboarding tasks, and overdue reviews from `data.tasks` and `data.documents`.
   - Tasks are categorized: Compliance (task_type includes "Compliance"), Reviews (task_type includes "Review"), Onboarding (task_type includes "Onboarding").
   - Documents with status Pending/Expired are shown with expiry info.
   - Each item shows: category icon, title, due date (with overdue indicator in red), priority badge.
   - Tab label: `Outstanding (N)` where N = tasks.length + documents.length.

   **Tab 3 - Recent Activity**
   - Contains exactly the current activity list (the 8 demo `recentActivities` items with icons and timestamps).
   - Tab label: `Recent Activity (8)` (static count from demo data).

5. **"Show more" link** remains at the bottom, outside the tabs.

### Technical Details

- The `useClientMeetingPrep` hook already fetches tasks (open, non-completed/cancelled), documents (Pending/Expired), opportunities, and products -- everything needed.
- The Tabs component uses Radix UI tabs already available in the project.
- Opportunity type styling reuses the same color scheme as the AI Assistant page (emerald for upsell, cyan for cross-sell, violet for migration, orange for platform).
- Currency formatting uses `Intl.NumberFormat` with the appropriate locale.
- The card keeps the same compact `py-2` header and condensed spacing as other Summary tab cards.

### Files Modified

| File | Change |
|------|--------|
| `src/components/client-detail/ClientSummaryTab.tsx` | Rename card, add tabs with three sub-sections, integrate `useClientMeetingPrep` hook |

No new files needed. No database changes.

