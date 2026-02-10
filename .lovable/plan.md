

## Add AI Badge to "Next Best Action" and "Optimise" Button

### Overview

Add the same animated AI gradient badge used on the Dashboard title next to "Next Best Action", and add an "Optimise" button in the Opportunities tab empty state that triggers a scan of client data to identify opportunities.

### Changes

**1. File: `src/components/client-detail/ClientSummaryTab.tsx`**

Add the AI gradient pill badge (matching the Dashboard pattern) next to the "Next Best Action" title text:

```text
Next Best Action [AI pill]          [Household toggle]
```

The badge matches the existing Dashboard pattern:
- `bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-full animate-pulse`
- Small "AI" text, positioned inline after the title

**2. File: `src/components/client-detail/next-best-action/OpportunitiesTab.tsx`**

- Accept a new `onOptimise` callback prop
- When no opportunities are found (empty state), render an "Optimise" button above the "No opportunities identified yet." message
- The button triggers the `onOptimise` callback which will run the gap analysis / opportunity scan using existing client product data
- After scanning, the component displays any discovered gap opportunities (cross-sell, platform consolidation, upsell)
- Button styled with teal color to match the app's visual identity
- Add a loading state while "scanning"

**3. File: `src/components/client-detail/ClientSummaryTab.tsx`**

- Add an `onOptimise` handler that triggers a simulated scan (short delay) then forces the gap analysis to run by passing a flag
- The OpportunitiesTab already has `buildGapOpportunities` logic -- the Optimise button will set a state flag `hasScanned` that forces gap analysis to run even when `opportunities.length === 0` and `products` might be empty
- Pass `onOptimise` and `hasScanned` props to `OpportunitiesTab`

### Layout

Empty state before scan:
```text
        [Optimise]
No opportunities identified yet.
```

After clicking Optimise, a brief spinner shows, then gap opportunities appear based on the client's product data.

### Technical Details

- The AI badge is a simple inline `<span>` element with gradient background, identical to Dashboard line 288-296
- The Optimise button uses `Button` component with variant "outline" and teal styling
- `OpportunitiesTab` gains props: `onOptimise?: () => void` and `hasScanned?: boolean`
- When `hasScanned` is true and no DB opportunities exist, `buildGapOpportunities` runs against products regardless
- A `useState` in `ClientSummaryTab` tracks `hasScanned` (default false), set to true when Optimise completes
- No database changes needed -- gap analysis uses existing client_products data already fetched by `useClientMeetingPrep`

### Files

| File | Action |
|------|--------|
| `src/components/client-detail/ClientSummaryTab.tsx` | Modify - add AI badge, optimise handler |
| `src/components/client-detail/next-best-action/OpportunitiesTab.tsx` | Modify - add Optimise button, accept new props |
