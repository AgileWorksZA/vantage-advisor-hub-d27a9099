

# Rename Projects to Opportunities and Add New Opportunities Section

## Overview

This plan transforms the "Projects" section into an "Opportunities" section with a new "New" status filter that displays AI-discovered opportunities in a table format. The existing Active/Completed projects will become "Active"/"Completed" opportunities. New opportunities will be scannable from client/portfolio data and displayed with expansion capability similar to active opportunities.

## Key Changes

1. **Rename "Projects" to "Opportunities"** throughout the page
2. **Add "New" status filter** alongside Active, Completed, On Hold
3. **Create sample opportunities table** showing opportunity types with aggregated data
4. **Expandable new opportunity rows** revealing detailed client lists
5. **Client list view** showing individual client details when clicking into an opportunity

## Visual Layout

```text
+------------------------------------------------------------------+
| OPPORTUNITIES                                         [+ New Opp] |
+------------------------------------------------------------------+
| Type: [All] [Growth] [De-risking] [Migration] [Consolidation]    |
| Status: [NEW] [Active] [Completed] [On Hold]                     |
+------------------------------------------------------------------+

When "NEW" is selected:
+------------------------------------------------------------------+
| TYPE              | QUANTUM         | CLIENTS   | [>]            |
+------------------------------------------------------------------+
| Tax Loss Harvest. | R 245,000       | 12        | [v] (expand)   |
| Legacy Fund Migr. | R 180,000       | 8         | [>]            |
+------------------------------------------------------------------+

When expanded:
+------------------------------------------------------------------+
| Tax Loss Harvesting (TLH)                           R 245,000    |
| "off-view" legacy funds dragging performance/risk   12 clients   |
+------------------------------------------------------------------+
| > Client Details:                                                |
| +---------------------------------------------------------+      |
| | John Smith  | R 45,000 | 2 funds below benchmark       |      |
| | Mary Jones  | R 32,000 | 3 legacy funds identified     |      |
| | ...                                                      |      |
| +---------------------------------------------------------+      |
+------------------------------------------------------------------+

When "ACTIVE" is selected (existing behavior):
Shows current ProjectCard components (now called OpportunityCard)
```

## Technical Approach

### 1. Create Sample New Opportunities Data

Create a data structure for "new" (unactioned) opportunities that aggregates by opportunity type:

```typescript
interface NewOpportunityType {
  id: string;
  type: string;
  name: string;
  description: string;
  totalValue: number;
  clientCount: number;
  clients: Array<{
    id: string;
    name: string;
    value: number;
    detail: string;
  }>;
}
```

Sample data to include:
- **Tax Loss Harvesting (TLH)**: "off-view" legacy funds dragging performance or increasing risk
- **Legacy Fund Migration**: Underperforming external funds ready for migration
- **Fee Optimization**: High-fee products that could be consolidated
- **Contribution Opportunities**: Clients with contribution room available

### 2. Rename ProjectsList to OpportunitiesList

**File: `src/components/ai-assistant/ProjectsList.tsx`**

- Rename component to `OpportunitiesList`
- Update header from "Projects" to "Opportunities"
- Update button from "New Project" to "New Opportunity"
- Add "New" to the status filters

### 3. Create NewOpportunityRow Component

**File: `src/components/ai-assistant/NewOpportunityRow.tsx`** (new file)

A collapsible table row component that:
- Shows opportunity type, total quantum, client count
- Expands to show detailed description and client list
- Uses similar styling to ProjectCard but in table format

### 4. Create NewOpportunitiesTable Component

**File: `src/components/ai-assistant/NewOpportunitiesTable.tsx`** (new file)

A table displaying aggregated new opportunities with:
- Columns: Type, Quantum, Clients, Expand chevron
- Each row is expandable
- Sample data for TLH, Legacy Funds, etc.

### 5. Create ClientOpportunityList Component

**File: `src/components/ai-assistant/ClientOpportunityList.tsx`** (new file)

Displays when an opportunity row is expanded:
- List of clients affected by this opportunity type
- Individual client value and opportunity details
- Click to navigate to client detail

### 6. Update AIAssistant.tsx

- Import new components
- Rename all "project" references to "opportunity" in variable names/handlers where appropriate for the New section
- Add state for tracking expanded new opportunities
- Conditionally render NewOpportunitiesTable when status is "New"

### 7. Update Related Components

- `ProjectCard.tsx` remains for Active/Completed opportunities (existing behavior)
- Update empty state messages to reference "opportunities"

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/ai-assistant/ProjectsList.tsx` | Modify | Rename to Opportunities, add New status filter |
| `src/components/ai-assistant/NewOpportunitiesTable.tsx` | Create | Table for new/unactioned opportunities |
| `src/components/ai-assistant/NewOpportunityRow.tsx` | Create | Expandable row component |
| `src/components/ai-assistant/ClientOpportunityList.tsx` | Create | Client list within expanded row |
| `src/data/sampleNewOpportunities.ts` | Create | Sample data for TLH, legacy funds, etc. |
| `src/pages/AIAssistant.tsx` | Modify | Update imports, add state for new opportunities |

## Sample Data Structure

```typescript
// src/data/sampleNewOpportunities.ts
export const sampleNewOpportunities = [
  {
    id: "tlh-001",
    type: "tax-loss-harvesting",
    name: "Tax Loss Harvesting (TLH)",
    description: '"off-view" legacy funds that are dragging performance or increasing risk.',
    totalValue: 245000,
    clientCount: 12,
    clients: [
      { id: "c1", name: "John Smith", value: 45000, detail: "2 funds below benchmark by 15%+" },
      { id: "c2", name: "Mary Jones", value: 32000, detail: "3 legacy funds with unrealized losses" },
      // ... more clients
    ]
  },
  {
    id: "legacy-001",
    type: "legacy-migration",
    name: "Legacy Fund Migration",
    description: 'External platform funds underperforming house view by significant margin.',
    totalValue: 180000,
    clientCount: 8,
    clients: [...]
  },
  {
    id: "fee-opt-001",
    type: "fee-optimization",
    name: "Fee Optimization",
    description: 'High-fee products that could be replaced with lower-cost alternatives.',
    totalValue: 120000,
    clientCount: 6,
    clients: [...]
  }
];
```

## UI Details

### New Status Button Styling
- "New" status filter uses a distinct color (e.g., amber/yellow) to indicate pending action
- Badge shows count of new opportunity types

### Expandable Row Animation
- Smooth accordion-style expansion
- Chevron rotates on expand/collapse
- Client list fades in when expanded

### Client Row Actions
- Clicking client name navigates to `/clients/{id}`
- Quick action buttons: Add to Active Opportunity, Dismiss

## Dependencies
- Uses existing Collapsible component from Radix UI
- Uses existing Table components for structured display
- Leverages existing color theming patterns

