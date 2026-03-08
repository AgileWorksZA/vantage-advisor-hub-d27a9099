

## Auto-Identify Opportunities & Compact Email View Layout

### Changes

**1. Auto-trigger opportunity detection on email load (`src/pages/EmailView.tsx`)**
- Use `detectOpportunityTypes` from `src/lib/opportunity-detection.ts` to instantly detect opportunities from the email subject + body when the email loads (no button click needed)
- Populate `aiOpportunities` state via a `useMemo` that maps detected types into `IdentifiedOpportunity` objects with auto-generated descriptions
- Keep the "Guess Task" button for the heavier AI edge-function matching, but show the lightweight keyword-detected opportunities immediately
- Auto-run the edge function `guess-email-tasks` once on load (via `useEffect`) so AI insights appear without user action

**2. Reduce vertical spacing throughout the top sections (`src/pages/EmailView.tsx`)**
- Change outer container from `space-y-4` to `space-y-2`
- Change inner padding from `p-6` to `p-4`
- Reduce metadata section padding from `p-4` to `p-3` and inner spacing from `space-y-3` to `space-y-2`
- Use smaller input heights in From/To fields (`h-8`)
- Reduce action bar button sizes
- Reduce subject font from `text-xl` to `text-lg`
- Move AI Insights Panel and Task Linking to start collapsed by default (they expand on content)

**3. Show inline opportunity tags in metadata area (`src/pages/EmailView.tsx`)**
- Add a row in the metadata section showing detected opportunity badges (using `OpportunityTagBadge` from the existing component) right below the Clients row, so they're visible without scrolling

### Files to Edit
| File | Change |
|------|--------|
| `src/pages/EmailView.tsx` | Auto-detect opportunities on load, auto-run guess-task, compact spacing, inline opportunity tags |
| `src/components/email/AIInsightsPanel.tsx` | Default to collapsed when auto-populated (user can expand) |

