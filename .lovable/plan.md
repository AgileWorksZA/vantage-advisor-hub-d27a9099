

## Wire Up X Close Buttons on All Dashboard Widgets

### Problem
The X buttons on adviser dashboard widgets exist but have no click handler -- clicking them does nothing. Client dashboard widgets don't have X buttons at all. Both need to hide the widget when clicked.

### Solution

#### 1. Adviser Dashboard -- `src/pages/Dashboard.tsx`

Add `onClick={() => handleToggleWidget('widget-id', false)}` to each inline widget's X button:
- `provider-view` (line 338)
- `top-accounts` (line 405)
- `aum-product` (line 482)
- `birthdays` (line 585)
- `clients-value` (line 639)
- `corporate-actions` (line 717)

#### 2. Standalone Adviser Widgets -- add `onClose` prop

These three widgets render their own Card with X button, so they need a callback prop:

- **`OnboardingProgressWidget`**: Add `onClose?: () => void` prop, wire X button's onClick
- **`ClientOpportunityStatusWidget`**: Add `onClose?: () => void` prop, wire X button's onClick
- **`PortfolioAnalysisWidget`**: Add `onClose?: () => void` prop, wire X button's onClick

Then in `Dashboard.tsx`, pass `onClose={() => handleToggleWidget('widget-id', false)}` to each.

#### 3. Client Dashboard -- `src/components/client-detail/ClientDashboardTab.tsx`

Add an X close button to every widget's CardHeader (10 widgets total):
- `asset-allocation`, `valuation-change`, `geo-diversification`
- `top-opportunities`, `opp-breakdown`, `opp-value-summary`
- `action-priority`, `key-dates`, `advisor-accounts`, `outstanding-docs`

Each X button calls `handleToggleWidget('widget-id', false)` which already exists in this component.

Import `X` from lucide-react in ClientDashboardTab.

### Pattern

Every widget header will follow this consistent pattern:
```
<CardHeader className="widget-drag-handle flex flex-row items-center justify-between py-3 px-4 cursor-move">
  <div className="flex items-center gap-2">
    <GripVertical ... />
    <CardTitle ...>Title</CardTitle>
  </div>
  <Button variant="ghost" size="icon" className="h-6 w-6"
    onClick={() => handleToggleWidget('widget-id', false)}>
    <X className="w-4 h-4" />
  </Button>
</CardHeader>
```

Users can re-show hidden widgets via the existing Settings gear toggle.

### Files

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Add onClick to 6 inline X buttons; pass onClose to 3 standalone widgets |
| `src/components/dashboard/OnboardingProgressWidget.tsx` | Add onClose prop, wire X button |
| `src/components/dashboard/ClientOpportunityStatusWidget.tsx` | Add onClose prop, wire X button |
| `src/components/dashboard/PortfolioAnalysisWidget.tsx` | Add onClose prop, wire X button |
| `src/components/client-detail/ClientDashboardTab.tsx` | Import X, add X close button to all 10 widgets |

