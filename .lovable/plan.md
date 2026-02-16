

## Rename Tab, Move Tiles Above Heading, Make Tiles Clickable Filters

### Overview
Three changes:
1. Rename the "Next Best Action" tab label to "Opportunities" and add the AI badge next to it
2. Move the 3 summary tiles above the card heading (outside the card, above the "Next Best Action" title)
3. Make the tiles clickable -- "Identified" is selected by default and shows the current opportunities list. Clicking "In Progress" or "Completed" filters the content below to show only items matching that status.

### Changes

**1. `src/pages/ClientDetail.tsx` -- Rename tab label**

- Change `{ value: "summary", label: "Next Best Action" }` to `{ value: "summary", label: "Opportunities" }`
- Add the AI gradient badge inline next to "Opportunities" in the tab trigger label

**2. `src/components/client-detail/next-best-action/OpportunitySummaryTiles.tsx` -- Make tiles clickable**

- Add props: `selectedStatus: string` and `onStatusChange: (status: string) => void`
- Each tile becomes a clickable button with a visual "selected" ring/outline state
- The three statuses are: `"identified"`, `"in-progress"`, `"completed"`
- Export the `inProgress` and `completed` filtering logic so the parent can use it to derive filtered opportunity lists
- Add a helper export `getStatusFilteredData` that returns the filtered opportunities for each status

**3. `src/components/client-detail/ClientSummaryTab.tsx` -- Restructure layout**

- Add `selectedStatus` state, default `"identified"`
- Move `<OpportunitySummaryTiles>` above the `<Card>` component (outside the card, before the heading)
- Pass `selectedStatus` and `onStatusChange` to tiles
- When status is `"identified"`: show current content (gap opportunities + scan results via OpportunitiesTab, Outstanding, Recent Activity tabs)
- When status is `"in-progress"`: replace the tabs area with a simple list of in-progress opportunities (every 3rd prep opportunity, same logic as tiles)
- When status is `"completed"`: replace the tabs area with a simple list of completed opportunities (every 5th non-overlapping, same logic as tiles)
- The card title stays as "Next Best Action" with Household toggle and Optimize button
- Remove the Optimize button from the card header since it moves to the tab label area (AI badge on tab)

### Technical Details

**Tile selection state flow:**
- `selectedStatus` state in `ClientSummaryTab` controls which tile is highlighted and what content renders
- "Identified" shows the full existing tabs (Opportunities, Outstanding, Recent Activity)
- "In Progress" shows a filtered list of opportunities with status indicators and action buttons
- "Completed" shows a filtered list with completion indicators and realized values

**In Progress / Completed list rendering:**
- Reuse the same opportunity row styling from `OpportunitiesTab` for visual consistency
- Each row shows: opportunity type, reasoning, potential revenue, and a status badge
- In Progress items show an amber "In Progress" badge
- Completed items show a green "Completed" badge with a checkmark

### Files

| File | Change |
|------|--------|
| `src/pages/ClientDetail.tsx` | Rename tab label to "Opportunities" + AI badge |
| `src/components/client-detail/next-best-action/OpportunitySummaryTiles.tsx` | Add clickable selection state, export filter helpers |
| `src/components/client-detail/ClientSummaryTab.tsx` | Move tiles above card, add status filtering, render status-specific content |

