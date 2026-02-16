

## Refocus Client Dashboard on Next Best Actions

### Overview
Transform the Client Dashboard tab to be opportunity-focused, replace the "Household Members" and "Selected Contracts" widget cards with multi-select dropdowns in the top toolbar area, and wire the Household badge in the ribbon to show the "Manage related entity" dropdown.

### Changes

**1. `src/components/client-detail/ClientDashboardTab.tsx` -- Major rewrite**

**Top toolbar area** (replaces the widget grid's first row):
- Add a toolbar row with two multi-select dropdowns:
  - **Contracts** dropdown (replaces the Selected Contracts widget) -- multi-select list of client products (on-platform, external, cash, risk) using the existing `MultiSelect` component
  - **Household Members** dropdown (replaces the Household Members widget) -- multi-select of family members/businesses from `useClientRelationships`, with an "Add member" option at the bottom

**Remove these widgets:**
- "Household Members" card (widget 4) -- replaced by dropdown
- "Selected Contracts" card (widget 5) -- replaced by dropdown

**Refocus remaining widgets on Next Best Action / opportunities:**
- Keep: Asset Allocation, Change in Valuation, Geographic Diversification (Row 1)
- Replace Product Summary with: **Opportunity Breakdown** -- pie chart of opportunity types (Growth, Cross-sell, Migration, Platform, Tax Loss, etc.) with counts and values
- Replace Income vs Expenses with: **Top Opportunities** -- list of highest-value next best action items (reusing the `buildGapOpportunitiesForProducts` logic from OpportunitiesTab) with type badges, opportunity sizes, and suggested actions
- Replace Risk Cover Summary with: **Action Priority** -- grouped list showing Urgent/Important/Routine opportunities with color-coded priority indicators
- Keep Key Dates & Milestones (relevant for triggering actions)
- Add: **Opportunity Value Summary** -- total pipeline value, count by type, average confidence score

**2. `src/components/client-detail/ClientRibbon.tsx` -- Wire Household badge**

- When clicking the purple Household badge, instead of navigating to the Relationships tab, show the "Manage related entity" dropdown inline (the same dropdown that already exists in the ribbon's top-right)
- Implementation: Convert the Household badge click to toggle a state that opens a Popover or reuses the existing DropdownMenu with the related entities list

**3. `src/pages/ClientDetail.tsx` -- No structural changes needed**

The ribbon already receives `relatedEntities` and `onTabChange`. The Dashboard tab already receives `onTabChange`. No tab changes needed.

### Widget Layout After Changes

```text
Toolbar:
[Contracts multi-select v]  [Household Members multi-select v]

Row 1:
[Asset Allocation]          [Change in Valuation]       [Geographic Diversification]

Row 2:
[Top Opportunities]         [Opportunity Breakdown]      [Opportunity Value Summary]

Row 3:
[Action Priority]           [Key Dates & Milestones]
```

### Technical Details

- **MultiSelect** component already exists at `src/components/ui/multi-select.tsx` -- reuse for both dropdowns
- **Opportunity data** reuses the `buildGapOpportunitiesForProducts` function from `OpportunitiesTab.tsx` to derive opportunities from 360 View products
- **Household badge popover**: Use `Popover` from radix to show related entities list on badge click, with navigation links to each member's profile
- Charts use `EChartsWrapper` consistent with the rest of the app
- The "Personal financial report" Select and "Manage related entity" Button remain in the ribbon (unchanged)

### Files

| File | Action |
|------|--------|
| `src/components/client-detail/ClientDashboardTab.tsx` | Major edit -- remove 2 widget cards, add toolbar dropdowns, replace 3 widgets with opportunity-focused ones |
| `src/components/client-detail/ClientRibbon.tsx` | Edit -- wire Household badge to show related entity popover |

