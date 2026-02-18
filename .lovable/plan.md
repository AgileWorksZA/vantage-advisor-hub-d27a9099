

## Portfolio Sub-tabs: Remove ESG, Add AI Badge, Build Holdings/Companies/Asset Class Tables

### 1. Remove "ESG Impact" sub-tab

Remove the ESG entry from the `SUB_TABS` array in `ClientPortfolioTab.tsx` and remove it from the placeholder rendering list.

### 2. Add AI gradient badge to "Comparison" tab

Add the same AI gradient badge used on the main client tabs (Opportunities, Meetings, Communication) to the "Comparison" sub-tab trigger. This uses the existing pattern:
```
<span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-full ml-1.5">AI</span>
```

### 3. Add Household/Contracts filter bar to Holdings, Companies, and Asset Class tabs

Above each table, render a filter bar matching the reference image with:
- **Contracts** multi-select (using the existing `MultiSelect` component) -- populated from client's on-platform, external, cash, and risk products
- **Household Members** multi-select -- populated from family members and businesses via `useClientRelationships`
- **Add Member** button that opens the existing `AddFamilyMemberDialog`

The component will need to accept `clientId` to fetch relationships, and the contract/member data will be derived from `clientData` and relationships (same pattern as `ClientDashboardTab`).

### 4. Build data tables for Holdings, Companies, and Asset Class

Each tab gets a styled table similar to the Change in Valuation widget (rows with sparklines and percentage badges):

**Holdings tab** -- Individual fund/instrument rows:
| Holding Name | ISIN/Code | Units | Price | Value | Sparkline | Change % |

**Companies tab** -- Grouped by investment house/provider:
| Company | Products | AUM | Weight % | Sparkline | Change % |

**Asset Class tab** -- Grouped by asset category:
| Asset Class | Value | Weight % | Sparkline | Change % |

All tables use:
- The same sparkline SVG pattern (48x16px polyline) from the Change in Valuation widget
- Color-coded percentage badges (emerald for positive, red for negative)
- Deterministic data generated via the existing `seededRandom` function
- Period selector (6M, 1Y, 3Y, 5Y) consistent with the valuation widget
- Responsive layout with horizontal scroll on smaller screens

### Technical details

**File: `src/components/client-detail/ClientPortfolioTab.tsx`**

1. Import `MultiSelect` from `@/components/ui/multi-select`, `useClientRelationships` hook, and `AddFamilyMemberDialog`
2. Remove `{ value: "esg", label: "ESG impact" }` from `SUB_TABS`
3. Remove `"esg"` from the placeholder sub-tabs array
4. Add conditional AI badge rendering in the TabsTrigger for the "comparison" tab
5. Add state for `selectedContracts`, `selectedMembers`, `holdingsPeriod`, and `addMemberOpen`
6. Generate deterministic holdings, companies, and asset class data via `useMemo` + `seededRandom`
7. Build three new `TabsContent` sections replacing the placeholders for "holdings", "companies", and "asset-class"
8. Each section includes:
   - Filter bar with Contracts multi-select, Household Members multi-select, and Add Member button
   - Data table with sparklines and percentage badges
   - Period selector buttons in the card header

| File | Action |
|------|--------|
| `src/components/client-detail/ClientPortfolioTab.tsx` | Edit -- remove ESG, add AI badge, build 3 table tabs with filters |

