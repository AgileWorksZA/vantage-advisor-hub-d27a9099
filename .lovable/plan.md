

## Align Advisor Dashboard with Client Dashboard Effects

### Goal
Apply the same visual enhancements (taller widgets, increased row height, hover shadows) that were added to the Client Dashboard to the Advisor Dashboard for a consistent look.

### Changes

#### 1. Increase widget heights for chart/table widgets

**File: `src/pages/Dashboard.tsx`**

Update `defaultDashboardLayout` to give the top row (data-heavy widgets with charts and tables) more vertical space:

```
Row 0: provider-view (h:4), aum-product (h:4), top-accounts (h:4)
Row 1: birthdays (h:3, y:4), clients-value (h:3, y:4), corporate-actions (h:3, y:4)
Row 2: onboarding-progress (h:3, y:7), client-opportunity-status (h:3, y:7), portfolio-analysis (h:3, y:7)
```

The top row widgets (Provider View, AUM by Product, Top 5 Accounts) contain tables/charts that benefit from extra height. The bottom two rows (birthdays, corporate actions, onboarding, etc.) stay compact at h:3.

#### 2. Increase grid row height

**File: `src/pages/Dashboard.tsx`**

Pass `rowHeight={130}` to the `DraggableWidgetGrid` component (matching the Client Dashboard).

#### 3. Add hover interaction to all widget cards

**File: `src/pages/Dashboard.tsx`**

Update all 7 inline `Card className="h-full"` occurrences to `Card className="h-full transition-shadow hover:shadow-md"`.

**Files: `src/components/dashboard/OnboardingProgressWidget.tsx`, `ClientOpportunityStatusWidget.tsx`, `PortfolioAnalysisWidget.tsx`**

Update the `Card className="h-full"` in each sub-widget component to include `transition-shadow hover:shadow-md`.

Note: The grid margin (`GRID_MARGIN = 20`) was already updated in the previous change to `DraggableWidgetGrid.tsx`, so no change needed there.

### Summary of visual impact
- Top-row widgets (Provider View, AUM by Product, Top Accounts) become taller and more prominent
- Wider vertical spacing between all rows for a cleaner feel
- Hover shadow on all widgets adds interactivity cues
- Consistent look between Advisor and Client dashboards

### Files to Edit
- `src/pages/Dashboard.tsx` -- layout heights, rowHeight prop, hover classes on 7 inline Cards
- `src/components/dashboard/OnboardingProgressWidget.tsx` -- hover class
- `src/components/dashboard/ClientOpportunityStatusWidget.tsx` -- hover class
- `src/components/dashboard/PortfolioAnalysisWidget.tsx` -- hover class
