

# Enhance AI-Driven Opportunity Discovery from Client Database

## Current vs Desired Workflow

```text
CURRENT STATE:
┌─────────────────────────────────────────────────────────┐
│ Static Mock Data → Display Cards → User Clicks "Add"   │
│ (regionalData.ts)   (one at a time)  → Manual Dialog   │
└─────────────────────────────────────────────────────────┘

DESIRED STATE:
┌─────────────────────────────────────────────────────────┐
│ Scan Client DB → AI Identifies → Present with Checkboxes│
│ (client_products)   Opportunities   → Multi-Select     │
│                                      → Add to Project   │
└─────────────────────────────────────────────────────────┘
```

---

## Solution Overview

Transform the opportunity discovery from static mock data to dynamic client database analysis:

1. **Create a new hook** that scans the client database and identifies opportunities based on configurable criteria
2. **Enhance OpportunityCard** to include a selection checkbox
3. **Add multi-select functionality** to the opportunity cards section with a bulk "Add to Project" action
4. **Auto-create tasks** when opportunities are added to projects

---

## Detailed Changes

### 1. Create New Hook: `useAIOpportunities.ts`

A new hook that scans the client database and identifies opportunities automatically:

```typescript
// src/hooks/useAIOpportunities.ts

interface AIOpportunity {
  clientId: string;
  clientName: string;
  currentValue: number;
  opportunityType: "upsell" | "cross-sell" | "migration" | "platform";
  potentialRevenue: number;
  confidence: number;
  reasoning: string;
  suggestedAction: string;
}
```

**Opportunity Detection Rules:**
- **Upsell (Growth)**: Clients with portfolio > threshold but room for additional contributions
- **Cross-Sell**: Clients with only investment products (no protection/insurance)
- **Migration**: Clients with products on external/competitor platforms
- **Platform Consolidation**: Clients with products spread across multiple providers

### 2. Update AIAssistant Page

Replace static `opportunities` from `useRegion()` with dynamic `useAIOpportunities()`:

**Changes to `src/pages/AIAssistant.tsx`:**
- Import new `useAIOpportunities` hook
- Add `selectedOpportunities` state (Set of clientIds)
- Replace `displayedOpportunities` with filtered results from the new hook
- Add "Add Selected to Project" button when items are selected
- Pass selection handlers to OpportunityCard

### 3. Enhance OpportunityCard with Selection

**Changes to `src/components/ai-assistant/OpportunityCard.tsx`:**

Add optional checkbox mode:
```typescript
interface OpportunityCardProps {
  opportunity: ClientOpportunity;
  index: number;
  formatCurrency: (value: number) => string;
  // New optional props for selection mode
  selectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (clientId: string) => void;
}
```

When `selectable=true`:
- Show checkbox in top-left corner
- Highlight card when selected
- Click anywhere on card toggles selection

### 4. Add Bulk Selection UI

**New section in AIAssistant when opportunities are displayed:**

```text
┌──────────────────────────────────────────────────────────┐
│ [✓] Select All (5 opportunities)        [Add to Project] │
├──────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐  ┌─────────────────────┐        │
│ │ [✓] John Smith      │  │ [ ] Sarah Johnson   │        │
│ │     Upsell +R50,000 │  │     Cross-sell      │        │
│ └─────────────────────┘  └─────────────────────┘        │
│ ┌─────────────────────┐  ┌─────────────────────┐        │
│ │ [✓] Mike Davis      │  │ [ ] Lisa Brown      │        │
│ │     Migration       │  │     Platform        │        │
│ └─────────────────────┘  └─────────────────────┘        │
├──────────────────────────────────────────────────────────┤
│ Total Selected: 2 opportunities • Value: R85,000        │
└──────────────────────────────────────────────────────────┘
```

### 5. Add Project Selection Dialog

When "Add to Project" is clicked with selected opportunities:

**New or Modified `AddSelectedToProjectDialog.tsx`:**
- Show list of existing projects to choose from
- Option to create a new project
- Preview: which opportunities will be added, total value
- Confirm button adds opportunities and creates tasks

---

## Files to Create

| File | Description |
|------|-------------|
| `src/hooks/useAIOpportunities.ts` | Scans client DB, identifies opportunities based on rules |
| `src/components/ai-assistant/OpportunitySelectionBar.tsx` | Bar showing selection count, total value, action buttons |
| `src/components/ai-assistant/AddSelectedToProjectDialog.tsx` | Dialog for choosing project and confirming additions |

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/AIAssistant.tsx` | Use new hook, add selection state, bulk actions |
| `src/components/ai-assistant/OpportunityCard.tsx` | Add checkbox, selectable mode, selected styling |
| `src/components/ai-assistant/InsightOrbit.tsx` | Pass through counts from new hook |

---

## Opportunity Detection Logic

The `useAIOpportunities` hook will analyze client data to identify opportunities:

```typescript
// Opportunity identification rules
const rules = {
  upsell: {
    // Clients with high portfolio value but not maxed out
    condition: (client) => client.totalValue > 500000 && client.contributionRoom > 0,
    multiplier: 0.05, // 5% of current value
    reasoning: "Portfolio expansion opportunity",
  },
  crossSell: {
    // Clients with investments but no insurance products
    condition: (client) => client.hasInvestments && !client.hasInsurance,
    multiplier: 0.03,
    reasoning: "Insurance gap identified",
  },
  migration: {
    // Clients with external platform products
    condition: (client) => client.externalProducts > 0,
    multiplier: 0.03,
    reasoning: "External portfolio can be consolidated",
  },
  platform: {
    // Clients with products on multiple providers
    condition: (client) => client.providerCount > 2,
    multiplier: 0.04,
    reasoning: "Multi-platform consolidation opportunity",
  },
};
```

---

## Data Flow

```text
User Flow:
1. Page loads → AI scans client database
2. AI identifies opportunities grouped by type
3. Click category → Shows opportunities with checkboxes
4. Check opportunities to select → Running total updates
5. Click "Add to Project" → Choose/create project
6. Confirm →
   a. For each opportunity: INSERT into project_opportunities
   b. For each opportunity: INSERT into project_tasks
   c. UPDATE project.target_revenue
7. Toast success → Opportunities now tracked in project
```

---

## Technical Considerations

### Database Queries

The hook will need to:
1. Fetch clients with their products: `clients` + `client_products`
2. Aggregate by provider to detect multi-platform
3. Identify product types to detect cross-sell gaps
4. Calculate opportunity values based on multipliers

### Performance

- Cache opportunity analysis results
- Only re-scan when client data changes
- Use React Query for efficient caching

### Fallback

- If no real clients exist, show message encouraging data import
- Demo mode could show sample opportunities

