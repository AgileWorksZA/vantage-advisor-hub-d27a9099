

# Auto-Seed TLH Data and Link Client Clicks to TLH Execution Screen

## Overview

Two changes:
1. **Auto-seed**: Remove the manual "Seed TLH Data" button. Instead, automatically trigger the seeding edge function when the TLH hook detects no database records exist.
2. **Client click -> TLH screen**: When clicking a client name in the "Tax Loss Harvesting" opportunities section on the AI Assistant page, open the TLH Dashboard (the full execution screen with fund switching, before/after comparisons, trade history, etc.) instead of navigating to the client detail page.

---

## Change 1: Auto-Seed Demo Data

### File: `src/hooks/useTLHData.ts`

- After the existing `useEffect` that fetches DB opportunities, add a second `useEffect` that checks: if the fetch completed, no DB data was found, and seeding hasn't been attempted yet, automatically call the `seed-tlh-clients` edge function.
- Add a `hasAttemptedSeed` state flag to prevent repeated seed attempts.
- Remove the `isSeeding` and `seedTLHData` exports (no longer needed externally).

### File: `src/components/tax-loss-harvesting/TLHDashboard.tsx`

- Remove the "Seed TLH Data" button from the header.
- Remove the `isSeeded`, `isSeeding`, and `seedTLHData` destructured values from `useTLHData()`.
- Show a subtle loading indicator in the header while auto-seeding is in progress (e.g., a small spinner with "Syncing data...").

---

## Change 2: Client Click Opens TLH Execution Screen

### File: `src/components/ai-assistant/NewOpportunityRow.tsx`

- Pass the `opportunity.type` down to `ClientOpportunityList` as a new `opportunityType` prop.

### File: `src/components/ai-assistant/ClientOpportunityList.tsx`

- Accept a new `opportunityType` prop.
- Import `TLHDashboard` from the tax-loss-harvesting components.
- Add local state: `tlhDashboardOpen` (boolean).
- Update `handleClientClick`: 
  - If `opportunityType === "tax-loss-harvesting"`, set `tlhDashboardOpen = true` (opens the TLH execution screen).
  - Otherwise, keep existing behavior (navigate to client detail with UUID validation, or show toast for demo clients).
- Render the `TLHDashboard` dialog at the bottom of the component, controlled by `tlhDashboardOpen` state.

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/hooks/useTLHData.ts` | Modify | Add auto-seed logic that triggers when no DB data is found; add `hasAttemptedSeed` guard |
| `src/components/tax-loss-harvesting/TLHDashboard.tsx` | Modify | Remove manual "Seed TLH Data" button; show auto-sync indicator instead |
| `src/components/ai-assistant/NewOpportunityRow.tsx` | Modify | Pass `opportunityType` prop to `ClientOpportunityList` |
| `src/components/ai-assistant/ClientOpportunityList.tsx` | Modify | Accept `opportunityType`; open TLH Dashboard for TLH clients instead of navigating to client detail |

---

## How It Will Work

1. User navigates to the AI Assistant page.
2. The `useTLHData` hook initializes, queries the database for TLH opportunities.
3. If no records exist, the hook automatically calls the `seed-tlh-clients` edge function in the background, then refreshes the data.
4. In the "New Opportunities" section, user expands "Tax Loss Harvesting (TLH)".
5. Clicking any client name (e.g., "John Smith") opens the full TLH Dashboard dialog -- the same execution screen with fund comparisons, switch actions, trade history, and metrics.
6. For non-TLH opportunity types (Legacy Migration, Fee Optimization, Contributions), clicking a client still navigates to their CRM profile as before.

