
## Two Changes

### 1. Remove "View All Opportunities" button from Client Opportunities widget

**File:** `src/components/dashboard/ClientOpportunityStatusWidget.tsx`

Remove lines 104-112 (the `div` containing the animated border button with the TrendingUp icon and "View All Opportunities" text). Also remove the now-unused `TrendingUp` import.

### 2. Remove blank space between "Advisor Dashboard" heading and first row of widgets

**File:** `src/pages/Dashboard.tsx`

Change the heading wrapper `div` from `className="mb-6"` (line 295) to `className="mb-2"` to reduce the gap between the heading and the widget grid.

### Technical Summary

| File | Change |
|------|--------|
| `ClientOpportunityStatusWidget.tsx` | Delete lines 104-112 (button block), remove `TrendingUp` from imports |
| `Dashboard.tsx` | Line 295: `mb-6` to `mb-2` |
