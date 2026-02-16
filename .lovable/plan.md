

## Create Client Dashboard Tab

### Overview
Add a new "Dashboard" tab as the default landing tab for the client detail page, positioned to the left of "Summary". It provides a client-focused overview similar to the Advisor Dashboard, with widgets for asset allocation, valuation changes, geographic diversification, household members, and contract selection.

### New Tab Position
```text
Dashboard | Summary | 360 View | Performance | Meetings | Relationships | ...
```

The default active tab changes from "summary" to "dashboard".

### Widget Layout (3-column card grid)
```text
Row 1:
[Asset Allocation]         [Change in Valuation]      [Geographic Diversification]

Row 2:
[Household Members]        [Selected Contracts]        [Product Summary]

Row 3:
[Income vs Expenses]       [Risk Cover Summary]        [Key Dates & Milestones]
```

### Widget Details

1. **Asset Allocation** -- Horizontal bar chart showing asset class breakdown (Equities, Fixed Income, Cash, Property, International) derived from the client's 360 View product data. "View analysis" link navigates to the Performance tab.

2. **Change in Account Valuation** -- Summary card showing: starting value, deposits/withdrawals, investment returns, and ending value. Data generated deterministically from client UUID (same pattern as 360 View). "View performance" link navigates to Performance tab.

3. **Geographic Diversification** -- Donut or horizontal bar chart showing domestic vs international split derived from product names/types. "View diversification" link navigates to 360 View tab.

4. **Household Members** -- Lists current household members from `useClientRelationships`. Includes an "Add member" button that opens the existing AddFamilyMemberDialog. Links navigate to member profiles.

5. **Selected Contracts** -- Multi-select list of the client's on-platform and external products (from 360 View data). Users can tick/untick contracts to mark which are "applicable" (state local to the tab). Displays product name, provider, and value.

6. **Product Summary** -- Pie chart of product values grouped by category (On-Platform, External, Cash, Risk, Medical, Short-Term) using ECharts.

7. **Income vs Expenses** -- Simple bar chart or summary card using deterministic seed data for monthly income and expenses.

8. **Risk Cover Summary** -- Table card listing active risk/insurance products with policy type and status from 360 View data.

9. **Key Dates & Milestones** -- Upcoming review dates, policy renewal dates, birthday, and next meeting derived from existing client data.

### Technical Changes

**1. New file: `src/components/client-detail/ClientDashboardTab.tsx`**
- Props: `client`, `clientId`, `onTabChange`
- Uses `generateClient360Data` to derive product/asset data
- Uses `useClientRelationships` for household members
- Uses `EChartsWrapper` for charts (consistent with rest of app)
- Renders a 3-column CSS grid of Card widgets
- Local state for "selected contracts" checkboxes
- Imports existing `AddFamilyMemberDialog` for the "Add member" flow
- Deterministic value generation (seeded from clientId hash) for valuation changes, income/expenses

**2. Edit: `src/pages/ClientDetail.tsx`**
- Import `ClientDashboardTab`
- Change `useState("summary")` to `useState("dashboard")`
- Add `{ value: "dashboard", label: "Dashboard" }` as first entry in tabs array
- Add `<TabsContent value="dashboard">` rendering `ClientDashboardTab`

### Data Strategy
All widget data is derived from existing sources (no new database tables needed):
- Asset allocation and product data: `generateClient360Data()` (already used in 360 View and Summary)
- Household members: `useClientRelationships()` (already used in ClientDetail)
- Valuation change numbers: deterministic generation from client UUID (same seeding pattern used throughout the app)
- Key dates: from the `client` object fields (date_of_birth, review dates) and 360 View product dates

### Files
| File | Action |
|------|--------|
| `src/components/client-detail/ClientDashboardTab.tsx` | Create |
| `src/pages/ClientDetail.tsx` | Edit (add tab, change default) |

