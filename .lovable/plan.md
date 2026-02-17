

## Remove Asset Allocation Legend to Fit Widget

### Problem
The "Current" / "TAMP" (or "Model") legend at the bottom of the Asset Allocation section is pushing the widget content beyond its box height.

### Solution
Delete the legend block (lines 228-237) -- the colored dots next to each asset class row already make the distinction clear, and the "current% / model%" numbers are shown inline.

### File

| File | Change |
|------|--------|
| `src/components/dashboard/PortfolioAnalysisWidget.tsx` | Remove lines 228-237 (the `flex justify-center gap-3 mt-1` div containing the Current/Model legend) |

