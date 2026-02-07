

# Fix Close Button Overlapping Account Balance

## Problem

The dialog's built-in X (close) button is absolutely positioned at `right-4 top-4` inside the `DialogContent`. The TLH Dashboard header has the "Account Balance" text aligned to the right in the same area, causing the X button to visually overlap the heading.

## Solution

Add right padding to the header's right-aligned block (the "Account Balance" section) so it clears the X button. The X button sits at `right-4` (16px) and is 16px wide (h-4 w-4), so the right-side content needs roughly 32-36px of extra right margin/padding to avoid collision.

## Change

**File: `src/components/tax-loss-harvesting/TLHDashboard.tsx`** (line 183)

Update the right-aligned div from:
```tsx
<div className="text-right">
```
to:
```tsx
<div className="text-right pr-6">
```

This adds 24px of right padding (`pr-6`) to push the "Account Balance" heading, balance value, and total earnings line away from the X button, giving them comfortable spacing.

Only one line changes in one file -- a single class addition.

