

# Reduce Top Padding on Card Headers

## Overview
Each card's `CardHeader` currently inherits `p-6` (24px) from the base component and only overrides the bottom with `pb-2` (8px). The top padding remains at 24px, creating a visual imbalance. This change reduces the top padding to match the bottom.

## Change (single file: `src/components/client-detail/ClientSummaryTab.tsx`)

All five `CardHeader` instances will be updated from `pb-2` to `py-2`, which sets both top and bottom padding to 8px while keeping the default horizontal padding (`px-6`) from the base `p-6`.

Affected cards:
- General details (line 147)
- Contact details (line 176)
- Current Advisor and Accounts (line 203)
- Recent Activity (line 237)
- Outstanding documents (line 282)

## Technical Detail
The base `CardHeader` applies `p-6`. Tailwind Merge resolves `p-6 py-2` by keeping `px-6` from `p-6` and applying `py-2` for vertical padding, resulting in `padding: 0.5rem 1.5rem`.

