

## Add Opportunity Status Summary Tiles to Next Best Action

### Overview
Add 3 compact summary tiles at the top of the Next Best Action card (above the tabs) showing opportunity counts and total potential value grouped by status: **Identified**, **In Progress**, and **Completed**. Each tile shows the count + total potential revenue benefit if action is taken.

### Design
Three side-by-side mini-cards in a horizontal row, each with:
- Status label + icon
- Count of opportunities in that status
- Total potential revenue (formatted with jurisdiction currency)
- Subtle color coding: Blue (Identified), Amber (In Progress), Green (Completed)

### Data Logic
Since opportunities don't currently have a persistent `status` field tracked in the DB, we'll derive demo data deterministically from existing opportunities:
- **Identified**: All gap-detected opportunities + scan results (status = "identified") -- these are new/unactioned
- **In Progress**: A deterministic subset of the existing `PrepOpportunity` items (seeded by index, e.g. every 3rd opportunity)
- **Completed**: Another deterministic subset (e.g. every 5th opportunity), representing already-actioned items with realized value

The tiles will recalculate when household view toggles or new scan results arrive.

### Changes

**1. `src/components/client-detail/next-best-action/OpportunitySummaryTiles.tsx` (NEW)**

Create a new component with:
- Props: `opportunities: PrepOpportunity[]`, `gapOpportunities: GapOpportunity[]`, `jurisdiction?: string`
- Three tiles in a `grid grid-cols-3 gap-2` layout
- Each tile: small `div` with rounded border, icon, count, and currency-formatted total value
- Icons: `Lightbulb` (Identified), `Clock` (In Progress), `CheckCircle2` (Completed)
- Reuse the `currencyMap` + `formatCurrency` pattern from OpportunitiesTab

**2. `src/components/client-detail/ClientSummaryTab.tsx`**

- Import the new `OpportunitySummaryTiles` component
- Render it inside the `CardContent`, above the `<Tabs>` component
- Pass `activeOpps`, gap opportunities (derived from `activeProducts`), and `clientJurisdiction`
- To get gap counts, export `buildGapOpportunities` from `OpportunitiesTab.tsx` and call it here

**3. `src/components/client-detail/next-best-action/OpportunitiesTab.tsx`**

- Export `buildGapOpportunities` function (currently private) and the `GapOpportunity` interface so `ClientSummaryTab` can use them for tile calculations

### Visual Layout

```text
+--------------------------------------------------+
| Next Best Action          [Household] [Optimize]  |
+--------------------------------------------------+
| [Identified: 5]   [In Progress: 3]  [Completed: 2]|
| R125,000 benefit   R85,000 benefit   R42,000 done |
+--------------------------------------------------+
| [Opportunities (10)] [Outstanding (4)] [Recent (5)]|
| ...tab content...                                  |
+--------------------------------------------------+
```

### Files

| File | Change |
|------|--------|
| `src/components/client-detail/next-best-action/OpportunitySummaryTiles.tsx` | New component -- 3 status tiles |
| `src/components/client-detail/ClientSummaryTab.tsx` | Import + render tiles above tabs |
| `src/components/client-detail/next-best-action/OpportunitiesTab.tsx` | Export `buildGapOpportunities` and `GapOpportunity` |
