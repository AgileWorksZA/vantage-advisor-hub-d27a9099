

## Remove AI Badges from Client Profile

Remove the violet-to-cyan gradient "AI" badges from all client profile tabs: the main tab bar (summary, meetings, communication) and the Portfolio sub-tab (comparison).

### Changes

**1. `src/pages/ClientDetail.tsx` (line ~300-302)**
- Remove the conditional rendering of the AI badge span for "summary", "meetings", and "communication" tabs

**2. `src/components/client-detail/ClientPortfolioTab.tsx` (line ~185-187)**
- Remove the AI badge span from the "comparison" sub-tab trigger

Both edits simply delete the `<span>` elements containing the gradient badge. No other logic or styling is affected.

### Files

| File | Action |
|------|--------|
| `src/pages/ClientDetail.tsx` | Edit -- remove AI badge from main tab triggers |
| `src/components/client-detail/ClientPortfolioTab.tsx` | Edit -- remove AI badge from comparison sub-tab |

