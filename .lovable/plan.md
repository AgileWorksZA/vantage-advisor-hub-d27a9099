
# Reduce Vertical Whitespace on Client Summary Page

## Overview
Tighten the vertical spacing across all cards on the Client Summary tab to show more information on screen without scrolling. This affects the grid gaps, card headers, content padding, and individual row spacing.

## Changes (single file: `src/components/client-detail/ClientSummaryTab.tsx`)

### 1. Grid and column gaps
- Outer grid: `gap-6` to `gap-4`
- Left column stack: `space-y-6` to `space-y-4`
- Right column stack: `space-y-6` to `space-y-4`

### 2. Card headers
- All five `CardHeader` components: `pb-4` to `pb-2`

### 3. Detail row spacing
- General details and Contact details `space-y-3` containers: reduce to `space-y-1`
- Individual detail rows `py-1`: reduce to `py-0.5`

### 4. Recent Activity section
- "Show more" divider: `pt-2 mt-2` reduced to `pt-1 mt-1`

## Result
All five cards (General details, Contact details, Current Advisor, Recent Activity, Outstanding documents) will have tighter internal spacing, and the gaps between cards will be smaller. This should allow most or all content to be visible without scrolling on a standard desktop screen.
