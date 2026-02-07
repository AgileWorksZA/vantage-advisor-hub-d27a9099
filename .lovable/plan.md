

# Replace Tracking Error Chart with Exact Replica of Reference Band Visualization

## Overview

Replace the current `TrackingErrorBand` component (which has an ECharts timeline chart and a Radix Slider) with a pure CSS horizontal band visualization that exactly matches the reference image. The visualization shows a widening confidence cone from left to right, a horizontal center line, a vertical marker at the current tracking error position, and tick marks at 0%, 2%, 4%, 6%, >8%.

## Reference Image Analysis

```text
+-----------------------------------------------------------+
| Tracking error (i)                              1.32%     |
|                                                           |
|   |                                                       |
|   |------============================================     |
|   |                                                       |
|  0%       2%        4%        6%          > 8%            |
+-----------------------------------------------------------+
```

Key visual elements:
- A horizontal center line spanning the full width
- A light blue/lavender band that starts very narrow on the left (near 0%) and fans outward (widens) toward the right (>8%) -- like a cone or trumpet shape
- A vertical black marker line at the current tracking error position
- The band color is a soft blue/lavender (not teal)
- Tick labels: 0%, 2%, 4%, 6%, > 8%

## Changes

### 1. Rewrite `TrackingErrorBand.tsx`

Strip out all ECharts and Slider logic. Build a pure CSS/HTML visualization:

- Remove imports: `ReactEChartsCore`, `Slider`, `useState`, `useMemo`
- Simplify props to just `value: number` (the tracking error as a decimal, e.g., 0.0132 for 1.32%)
- The max scale is 8% (values above clip to end)
- Draw the widening band using an SVG polygon or CSS clip-path:
  - A horizontal center line
  - The band starts with ~0px height at x=0 and fans out to ~24px height at x=100%
  - Fill with a soft lavender/blue color (e.g., `hsla(220, 60%, 75%, 0.4)`)
- A vertical black marker line positioned at `(value * 100 / 0.08) * 100%`
- Tick labels at fixed positions: 0%, 2%, 4%, 6%, > 8%

### 2. Update `TLHDashboard.tsx`

- Remove the `timeline` prop from `TrackingErrorBand` (line 431)
- The header already shows the percentage value and the info tooltip -- keep that unchanged
- Just pass `value={metrics.trackingError}`

### 3. Update ZA jurisdiction tracking error in `tlhDemoData.ts`

The ZA jurisdiction has `trackingError: 0.032` (3.2%) which exceeds 3%. Change to `0.028` (2.8%).

All per-client tracking errors are already under 3% -- no changes needed there.

### 4. Remove `trackingErrorTimeline` from data

Since the timeline chart is being removed:
- Remove the `trackingErrorTimeline` field from `TLHClientMetrics` interface
- Remove the `generateTimeline` function
- Simplify `getClientTLHMetrics` to not generate timeline data
- The `TLHClientMetrics` interface can just equal `TLHDashboardMetrics` (no extension needed)

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/tax-loss-harvesting/TrackingErrorBand.tsx` | Rewrite | Replace ECharts chart + slider with pure CSS/SVG widening band matching reference image exactly |
| `src/components/tax-loss-harvesting/TLHDashboard.tsx` | Modify | Remove `timeline` prop from TrackingErrorBand usage (line 431) |
| `src/data/tlhDemoData.ts` | Modify | Fix ZA tracking error to 2.8%; remove `TLHClientMetrics` interface extension, `generateTimeline` function, and timeline references |

## Technical Details

**Band SVG approach** (most precise match to the image):
- Use an inline SVG with a polygon for the widening band
- The polygon vertices create a cone shape: narrow at x=0, widening to full height at x=width
- Center line is a simple horizontal line element
- Marker is a vertical line positioned with CSS `left` percentage
- Tick marks are positioned with absolute positioning

**Color palette** (matching reference):
- Band fill: `hsla(220, 70%, 80%, 0.35)` (soft lavender blue)
- Center line: `#9ca3af` (gray-400)
- Marker line: `#1f2937` (gray-800, near black)
- Tick labels: `#9ca3af` (gray-400)

