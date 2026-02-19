

## Improve Widget Spacing, Heights & Remove Scrollbars

### Changes

#### 1. Reduce widget heights back to standard (`h: 3`)

**File: `src/components/client-detail/ClientDashboardTab.tsx`**

Update `defaultClientDashboardLayout` (lines 56-59):
- `outstanding-docs`: h: 4 -> h: 3
- `client-portfolio`: h: 4 -> h: 3
- `household-overview`: h: 4 -> h: 3, y: 13 -> y: 12
- `onboarding-kyc`: h: 4 -> h: 3, y: 13 -> y: 12

#### 2. Remove scrollbars and add "Show More" buttons

Replace `max-h-[...] overflow-auto` containers with truncated lists + a "Show More" button pattern across these widgets:

**Outstanding Documents** (lines 1012):
- Remove `max-h-[260px] overflow-auto` from the docs container
- Show only the first 3 documents by default
- Add state `showAllDocs` (boolean)
- When collapsed, render a "Show More (N more)" button at the bottom
- When expanded, show all + a "Show Less" button

**Client Portfolio** (line 1090):
- Remove `max-h-[140px] overflow-auto` from the products list
- Show only the first 3 products by default
- Add state `showAllPortfolio`
- Show "Show More" / "Show Less" toggle

**Household Overview** (line 1148):
- Remove `max-h-[140px] overflow-auto` from the members list
- Show only the first 3 members by default
- Add state `showAllHousehold`
- Show "Show More" / "Show Less" toggle

#### 3. Tighten spacing in all four widgets

- Reduce `space-y-3` to `space-y-2` in CardContent for: client-portfolio, household-overview, onboarding-kyc
- Reduce padding in onboarding KYC grid from `p-3` to `p-2`
- Reduce `gap-y-2` to `gap-y-1.5` in onboarding grid
- Reduce `space-y-2` to `space-y-1.5` in onboarding checks list

### Implementation Details

Three new state variables at the component level:
```typescript
const [showAllDocs, setShowAllDocs] = useState(false);
const [showAllPortfolio, setShowAllPortfolio] = useState(false);
const [showAllHousehold, setShowAllHousehold] = useState(false);
```

The "Show More" button pattern (used identically in all three):
```tsx
const VISIBLE_COUNT = 3;
const items = showAll ? allItems : allItems.slice(0, VISIBLE_COUNT);
// ... render items ...
{allItems.length > VISIBLE_COUNT && (
  <Button variant="link" className="p-0 h-auto text-xs" onClick={() => setShowAll(!showAll)}>
    {showAll ? "Show less" : `Show ${allItems.length - VISIBLE_COUNT} more`}
  </Button>
)}
```

### Files to Edit
- `src/components/client-detail/ClientDashboardTab.tsx` -- layout heights, spacing, scrollbar removal, show-more buttons

