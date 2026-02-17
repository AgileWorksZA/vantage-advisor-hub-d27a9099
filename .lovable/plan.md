

## Realistic Client Status Mix and Dashboard Opportunity Widget

### Part 1: Create Varied Client Product Profiles

**File: `src/data/regional360ViewData.ts`**

The current data generation gives every client high investment values (50k-1.5M per product), 2-4 external providers, and always a cash account. This means nearly every client triggers Tax Loss (urgent), Platform (important), and Idle Cash (important) gaps, making them all red.

Modify `generateClient360Data` to introduce a "profile tier" based on the seeded random, creating three distinct client archetypes:

| Tier | Proportion | On-Platform | External | Cash | Result |
|------|-----------|-------------|----------|------|--------|
| Full Portfolio | ~35% | 2-3 products, 200k-1.5M each | 2-4 providers | Yes | RED (Tax Loss + Platform) |
| Moderate | ~35% | 1-2 products, 30k-150k each | 1-2 providers | Yes | ORANGE (Idle Cash, maybe Platform) |
| Simple | ~30% | 1 product, 20k-80k | 0-1 external | No cash account | GREEN (routine gaps only) |

Changes to the generation logic:
- After creating the seeded random, draw a `tierRoll` value
- If tierRoll < 0.35: "full" tier (current behavior, high amounts)
- If tierRoll < 0.70: "moderate" tier (lower amounts 30k-150k, only 1-2 external products)
- Else: "simple" tier (very low amounts 20k-80k, 0-1 external, skip cash account)

This produces a realistic mix across all jurisdictions since the tier is derived from the client UUID seed.

### Part 2: Dashboard Widget - Client Opportunity Status

**New file: `src/components/dashboard/ClientOpportunityStatusWidget.tsx`**

Create a widget component that:
1. Uses `useClients` to fetch all clients for the current user
2. For each client, runs `generateClient360Data` and `buildGapOpportunities` (same logic as the Clients page)
3. Computes each client's urgency category and sums opportunity values per category
4. Displays three rows with colored dots, counts, and total opportunity value:

```
  Urgent     [red dot]     8 clients    $245,000
  Important  [orange dot]  12 clients   $180,000
  Routine    [green dot]   10 clients   -
```

The widget follows the same card pattern as other dashboard widgets (GripVertical handle, X close button, table layout).

**File: `src/pages/Dashboard.tsx`**

- Add the new widget to `defaultDashboardLayout` and `DASHBOARD_WIDGETS`
- Register it with id `'client-opportunity-status'` and label `'Client Opportunity Status'`
- Render the widget inside the `DraggableWidgetGrid`

### Files Changed

| File | Action |
|------|--------|
| `src/data/regional360ViewData.ts` | Edit - add profile tier logic for varied amounts/providers/cash |
| `src/components/dashboard/ClientOpportunityStatusWidget.tsx` | New - dashboard widget showing client counts by urgency |
| `src/pages/Dashboard.tsx` | Edit - register and render new widget |

No database or backend changes. All logic is client-side using existing demo data and shared priority utilities.

