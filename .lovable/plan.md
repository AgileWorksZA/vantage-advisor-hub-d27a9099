

## Revert Client Dashboard Widget Heights to Standard

### What will change

Restore all client dashboard widgets to the standard `h: 3` height (matching the advisor dashboard) and revert `rowHeight` from `130` back to `120`.

### Technical details

**File: `src/components/client-detail/ClientDashboardTab.tsx`**

1. Update `defaultClientDashboardLayout` (lines 45-59):
   - Row 0: `h: 4` -> `h: 3` for portfolio-overview, valuation-change, geo-diversification
   - Row 1: `h: 4` -> `h: 3`, `y: 4` -> `y: 3` for family-tree, top-opportunities, opp-breakdown
   - Row 2: `y: 8` -> `y: 6` for opp-value-summary, action-priority, key-dates
   - Row 3: `y: 11` -> `y: 9` for advisor-accounts, outstanding-docs, client-portfolio
   - Row 4: `y: 14` -> `y: 12` for household-overview, onboarding-kyc

2. Revert `rowHeight` (line 604):
   - Change `rowHeight={130}` back to `rowHeight={120}` (or remove the prop to use the default)

The hover effects (`transition-shadow hover:shadow-md`) and 20px grid margin will remain unchanged, keeping the interactive feel consistent with the advisor dashboard.

