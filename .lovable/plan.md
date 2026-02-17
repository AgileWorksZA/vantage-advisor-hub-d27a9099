

## Improve AUM by Product Widget

### Changes to `src/pages/Dashboard.tsx`

**1. Enlarge the pie chart**
- Increase the chart container from `h-32` (128px) to `h-44` (176px) and update the EChartsWrapper height to 176
- Increase the pie radius from `['45%', '75%']` to `['50%', '80%']` to fill the larger space
- Reduce margins between sections (e.g., `mb-2` to `mb-1` on total AUM, `mt-3` to `mt-1` on period toggle)

**2. Add sparkline and growth % next to Total AUM**
- Replace the plain total AUM line with a row layout: `[Total AUM value] [sparkline SVG] [growth badge]`
- The sparkline will be a tiny inline SVG polyline (~60px wide, 20px tall) showing a 6-point trend (static demo data representing monthly AUM progression)
- The growth badge shows the overall portfolio growth for the selected period (sum/average of product growths), colored green/red with an arrow icon
- The sparkline line color matches the growth direction (emerald for positive, red for negative)

### Technical Details

| Aspect | Detail |
|--------|--------|
| File | `src/pages/Dashboard.tsx` (lines 408-489) |
| Chart height | 128px to 176px |
| Pie radius | `['45%','75%']` to `['50%','80%']` |
| Sparkline | Inline SVG polyline, 6 static data points, ~60x20px |
| Growth calc | Weighted average of product growth values for selected period |

