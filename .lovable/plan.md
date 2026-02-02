

# Chart Library Migration: Recharts to ECharts

## Overview
Migrate from Recharts to Apache ECharts (via `echarts-for-react`) to enable:
- See-through/transparent effects with glassmorphism styling
- Enhanced interactivity (zoom, pan, data brushing, 3D effects)
- Dark mode support with theme switching
- Cross-platform compatibility (React/Lovable and Mendix)

---

## Why ECharts?

| Feature | Recharts (Current) | ECharts (Proposed) |
|---------|-------------------|-------------------|
| Transparency/Glass effects | Limited (SVG-based) | Full support via canvas |
| Interactivity | Basic hover/click | Zoom, pan, brush, dataZoom |
| Dark mode | Manual color override | Built-in theme support |
| 3D Charts | Not supported | Supported via echarts-gl |
| Animations | Basic transitions | Rich animation library |
| Mendix Support | No official widget | Official Mendix widget available |
| Bundle size | ~200KB | Modular (tree-shakeable) |

---

## Files Affected

### Files to Create
1. `src/components/ui/echarts-wrapper.tsx` - Reusable ECharts component with theme support
2. `src/lib/echarts-themes.ts` - Custom light/dark themes matching the app's design system

### Files to Modify
1. `src/pages/Dashboard.tsx` - PieChart for product distribution
2. `src/pages/Insights.tsx` - BarChart, PieChart, AreaChart for commissions
3. `src/components/command-center/CommissionNudge.tsx` - Sparkline chart
4. `src/components/HeroPortfolioCard.tsx` - SVG charts (evaluate migration)

---

## Implementation Plan

### Phase 1: Setup and Core Components

**1. Install Dependencies**
```bash
npm install echarts echarts-for-react
```

**2. Create ECharts Wrapper Component**

A reusable wrapper that:
- Automatically switches between light/dark themes using `next-themes`
- Applies glassmorphism styling to chart containers
- Handles responsive sizing
- Provides common configuration defaults

```typescript
// src/components/ui/echarts-wrapper.tsx
interface EChartsWrapperProps {
  option: EChartsOption;
  height?: string | number;
  className?: string;
  transparent?: boolean; // Enable glass effect
  loading?: boolean;
}
```

**3. Create Custom Themes**

Define themes that match the app's design system:

Light Theme:
- Background: transparent (for glass effect)
- Text: hsl(222.2 84% 4.9%)
- Grid lines: hsl(214.3 31.8% 91.4%)
- Brand colors: orange, peach, blue, deep-blue

Dark Theme:
- Background: transparent
- Text: hsl(210 40% 98%)
- Grid lines: hsl(217.2 32.6% 17.5%)
- Same brand colors with adjusted opacity

---

### Phase 2: Migrate Charts

**Dashboard.tsx - Product Distribution Pie Chart**

Current (Recharts):
```tsx
<PieChart>
  <Pie data={regionalData.products} innerRadius={40} outerRadius={70} />
  <Tooltip />
</PieChart>
```

New (ECharts):
```tsx
<EChartsWrapper
  transparent
  height={192}
  option={{
    series: [{
      type: 'pie',
      radius: ['40%', '70%'],
      data: regionalData.products.map(p => ({
        name: p.name,
        value: p.value,
        itemStyle: { color: p.color }
      })),
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      },
      label: { show: false },
      animationType: 'scale',
      animationEasing: 'elasticOut'
    }],
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' }
    }
  }}
/>
```

**Insights.tsx - Commission Charts**

Bar Chart with Glass Effect:
- Transparent background
- Gradient bars
- Hover glow effects
- Data zoom for larger datasets

Area Chart with Gradient Fill:
- Transparent gradient fills (0.3 to 0 opacity)
- Smooth animations
- Interactive legend

Pie/Donut Chart:
- Rose animation on hover
- Glass tooltip with blur
- Percentage labels on hover

---

### Phase 3: Enhanced Interactivity

Add these interactive features:

1. **DataZoom**: Allow users to zoom into specific date ranges on commission summary chart
2. **Brush Selection**: Select data ranges for comparison
3. **Tooltip Linking**: Hover on one chart highlights related data in others
4. **Animation on Scroll**: Charts animate when scrolled into view
5. **Click to Drill-Down**: Click on pie segments to see details

---

### Phase 4: Glassmorphism Styling

Apply consistent glass effects to all charts:

```css
.echarts-glass-container {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.dark .echarts-glass-container {
  background: rgba(15, 23, 42, 0.6);
  border-color: rgba(255, 255, 255, 0.1);
}
```

ECharts options for transparency:
```typescript
{
  backgroundColor: 'transparent',
  grid: {
    backgroundColor: 'transparent'
  },
  series: [{
    itemStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: 'rgba(var(--brand-blue), 0.8)' },
        { offset: 1, color: 'rgba(var(--brand-blue), 0.2)' }
      ])
    }
  }]
}
```

---

## Technical Details

### Theme Switching Logic

```typescript
// src/components/ui/echarts-wrapper.tsx
import { useTheme } from 'next-themes';
import * as echarts from 'echarts/core';
import ReactECharts from 'echarts-for-react';
import { lightTheme, darkTheme } from '@/lib/echarts-themes';

// Register themes once
echarts.registerTheme('vantage-light', lightTheme);
echarts.registerTheme('vantage-dark', darkTheme);

export function EChartsWrapper({ option, transparent, ...props }: EChartsWrapperProps) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === 'dark' ? 'vantage-dark' : 'vantage-light';
  
  return (
    <div className={cn(
      transparent && 'echarts-glass-container',
      props.className
    )}>
      <ReactECharts
        theme={theme}
        option={{
          backgroundColor: 'transparent',
          ...option
        }}
        {...props}
      />
    </div>
  );
}
```

### Tree-Shaking for Bundle Size

Import only what we need:
```typescript
import * as echarts from 'echarts/core';
import { BarChart, PieChart, LineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart, PieChart, LineChart,
  GridComponent, TooltipComponent, LegendComponent,
  CanvasRenderer
]);
```

### Mendix Compatibility

ECharts is available as an official Mendix widget in the Marketplace (Apache e-charts). The same chart configurations can be used in both:

- **Lovable/React**: Use `echarts-for-react` wrapper
- **Mendix**: Use the Apache e-charts widget with identical option objects

The chart options are pure JavaScript objects that work in both environments, making it easy to share visualization logic between platforms.

---

## Migration Checklist

- [ ] Install echarts and echarts-for-react packages
- [ ] Create EChartsWrapper component with theme support
- [ ] Define custom light/dark themes
- [ ] Add glassmorphism CSS classes
- [ ] Migrate Dashboard.tsx PieChart
- [ ] Migrate Insights.tsx BarCharts
- [ ] Migrate Insights.tsx PieChart
- [ ] Migrate Insights.tsx AreaChart
- [ ] Update CommissionNudge sparkline
- [ ] Add interactive features (zoom, brush)
- [ ] Test dark mode switching
- [ ] Test animations and transitions
- [ ] Verify responsive behavior
- [ ] Keep Recharts temporarily for HeroPortfolioCard (custom SVG animations)

---

## HeroPortfolioCard Consideration

The `HeroPortfolioCard.tsx` uses custom SVG charts with complex animations (left-to-right line drawing, synchronized value counters). These are tightly integrated with the card's interaction model.

**Recommendation**: Keep the existing SVG implementation for now, as:
1. The animations are highly customized
2. They're deeply integrated with the card state
3. They work well with the current design

These can be migrated to ECharts in a future phase if needed.

---

## Expected Outcome

After migration:
1. All major charts use ECharts with transparent/glass effects
2. Dark mode switches chart themes automatically
3. Enhanced interactivity with zoom, pan, and brush
4. Consistent styling with the app's design system
5. Chart configurations exportable for Mendix reuse
6. Smaller bundle size via tree-shaking

