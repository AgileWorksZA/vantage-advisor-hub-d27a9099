

## Replace Portfolio "Coming Soon" with Practice-Level Rebalancing Comparison Tool

### What will change

The Portfolio landing page (`/portfolio`) will be transformed from a placeholder into a full practice-level portfolio rebalancing tool. It will show **AI-suggested rebalancing groups** -- clusters of client portfolios with similar fund compositions that could benefit from a coordinated fund switch. Each group shows impacted metrics (portfolios, contracts, clients, AUM) and can be expanded into the same side-by-side comparison panes used in the client-level Comparison tab.

### User Experience

1. **Summary tiles at top** -- Total AUM, Portfolios, Clients, and Rebalancing Opportunities (kept from existing cards but with live mock data)
2. **Rebalancing Groups table** -- A list of AI-suggested rebalancing groups, each row showing:
   - Group name (e.g., "High-Fee Equity Cluster", "Underperforming Balanced Mix")
   - AI rationale badge (e.g., "Fee Reduction", "Performance Uplift")
   - Number of portfolios, contracts, and clients impacted
   - Total AUM impacted
   - Estimated fee saving or return improvement
   - Expand/collapse arrow
3. **Expanded comparison pane** -- When a group is expanded, it shows the same two-column layout from `ClientPerformanceTab`:
   - **Current Portfolio** (aggregated from the group's clients) with fund breakdown table
   - **Comparison Portfolio** with fund search, auto-balance, allocation editing
   - Below: Fee & EAC comparison, performance bar/line charts, top 10 holdings, asset allocation pies

### Technical Details

**New file: `src/data/practiceRebalancingData.ts`**
- Helper to generate 4-6 mock rebalancing groups using seeded random based on jurisdiction
- Each group contains: group name, rationale, list of mock client names, number of portfolios/contracts, total AUM, a pre-built "current portfolio" fund list (reusing `generateProductFunds` patterns)
- Impact metrics calculated from these groups

**New file: `src/components/portfolio/RebalancingGroupRow.tsx`**
- Collapsible row component for each rebalancing group
- Shows summary metrics in the collapsed state
- When expanded, renders a self-contained comparison pane (extracted/adapted from `ClientPerformanceTab` comparison logic)

**New file: `src/components/portfolio/PracticeComparisonPane.tsx`**
- Extracted and adapted version of the comparison UI from `ClientPerformanceTab`
- Accepts a `currentPortfolio` prop (the group's aggregated fund list) instead of deriving from a single client
- Includes: fund search, auto-balance, fee tables, EAC tables, performance charts, holdings bars, asset allocation pies
- Reuses all helpers from `performanceComparisonData.ts` (generateFees, generateEAC, etc.)

**Edited file: `src/pages/Portfolio.tsx`**
- Remove the "Coming Soon" card and static placeholder cards
- Import and render summary tiles with aggregated mock data from all groups
- Render a `RebalancingGroupRow` for each generated group
- Keep existing sidebar, header, and GlobalAIChat structure

### Files to Create
- `src/data/practiceRebalancingData.ts`
- `src/components/portfolio/RebalancingGroupRow.tsx`
- `src/components/portfolio/PracticeComparisonPane.tsx`

### Files to Edit
- `src/pages/Portfolio.tsx`

