

## Remove "Switch to Model Portfolio" Button, Reduce Height, and Rename "Model" to "TAMP" for US

### Changes

#### 1. `src/components/dashboard/PortfolioAnalysisWidget.tsx`

- **Remove the "Switch to Model Portfolio" button** (lines 235-241): Delete the entire `animated-border-button` div at the bottom of the widget
- **Remove unused `BarChart3` import** from lucide-react (line 4)
- **Accept a `region` prop** to know when US is selected
- **Rename "Model" to "TAMP" when region is US**: Apply throughout the widget in these locations:
  - Chart legend (line 172): "Model" becomes "TAMP"
  - Fee comparison label (line 187): "Model" becomes "TAMP"
  - Asset allocation legend (line 230): "Model" becomes "TAMP"
  - Hover tooltip text (line 146): "Model:" becomes "TAMP:"

#### 2. `src/pages/Dashboard.tsx`

- **Reduce grid height** back to `h: 3` (line 67) to match other widgets
- **Pass region prop** to `PortfolioAnalysisWidget` (line 761): `<PortfolioAnalysisWidget region={selectedRegion} />`

### Technical Details

The component will accept an optional `region` prop typed as `string`. A simple conditional `const modelLabel = region === 'US' ? 'TAMP' : 'Model'` will be used to swap the label everywhere "Model" appears in the widget.

| File | Changes |
|------|---------|
| `src/components/dashboard/PortfolioAnalysisWidget.tsx` | Remove button, add region prop, conditionally rename Model to TAMP |
| `src/pages/Dashboard.tsx` | Change `h: 6` to `h: 3`, pass `region` prop |

