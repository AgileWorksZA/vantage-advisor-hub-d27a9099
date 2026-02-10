

## Rearrange Client Summary Tab Layout

### Overview

Reorganize the two-column Summary tab layout by moving cards between columns and removing the Contact Details card. This applies uniformly to all clients across all jurisdictions since the layout is defined in a single component.

### New Layout

**Left Column (top to bottom):**
1. General Details (unchanged)
2. Current Advisor and Accounts (moved from right)
3. Outstanding Documents (moved from right)

**Right Column (top to bottom):**
1. Next Best Action (moved to top, stretches to fill full column height)

**Removed:**
- Contact Details card (removed entirely)

### Changes

**File: `src/components/client-detail/ClientSummaryTab.tsx`**

1. **Remove** the Contact Details card (lines 81-103).
2. **Move** "Current Advisor and Accounts" card (lines 108-140) from the right column into the left column, placed after General Details.
3. **Move** "Outstanding Documents" card (lines 184-207) from the right column into the left column, placed after Current Advisor and Accounts.
4. **Right column** now contains only the "Next Best Action" card, with a `flex flex-col` and the card set to `flex-1` so it stretches to match the left column height.

### Technical Details

The grid remains `grid-cols-1 lg:grid-cols-2 gap-4`. The right column switches from `space-y-4` to `flex flex-col` so the single Next Best Action card can use `flex-1` to expand vertically, filling the space equivalent to the three left-column cards.

No database changes. No new files. Single file modification.

