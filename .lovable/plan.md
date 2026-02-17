

## Fix Portfolio Widget Size and Rename to "Portfolio Overview"

### Problem
The Portfolio Analysis widget has a grid height of `h: 3` (360px), which is too small for its content (performance chart, fee comparison, asset allocation, and switch button). The content overflows or gets clipped. Additionally, the title needs changing from "Portfolio Analysis" to "Portfolio Overview".

### Changes

#### 1. `src/pages/Dashboard.tsx`
- **Line 67**: Change grid layout height from `h: 3` to `h: 6` (720px) so all content fits without overflow
- **Line 79**: Update widget label from `'Portfolio Analysis'` to `'Portfolio Overview'`

#### 2. `src/components/dashboard/PortfolioAnalysisWidget.tsx`
- **Line 84**: Change the CardTitle text from `"Portfolio Analysis"` to `"Portfolio Overview"`

### Files

| File | Change |
|------|--------|
| `src/pages/Dashboard.tsx` | Update grid height `h: 3` to `h: 6`, rename label |
| `src/components/dashboard/PortfolioAnalysisWidget.tsx` | Rename title text |

