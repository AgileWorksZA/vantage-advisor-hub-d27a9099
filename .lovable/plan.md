

# Insights Page: Pie Chart Enhancement & Widget Height Alignment

## Overview
Three changes to improve the visual consistency and interactivity of the Insights page:
1. Increase the size of the Monthly Commission pie chart
2. Add pie slice separation effect on mouse hover
3. Reduce the Commission Snapshot widget height to align with other widgets

---

## Changes Summary

### 1. Increase Pie Chart Size

**Current State:**
- Chart container: `h-48` (192px)
- EChartsWrapper height: 192px
- Pie radius: `['50%', '80%']` (inner to outer)

**Proposed Change:**
- Increase container to `h-64` (256px)
- Increase EChartsWrapper height to 256px
- Adjust pie radius to `['45%', '85%']` for better proportions at larger size

---

### 2. Add Pie Slice Separation on Hover

**Current Emphasis Configuration:**
```typescript
emphasis: {
  itemStyle: {
    shadowBlur: 20,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
  },
  scale: true,
  scaleSize: 10,
}
```

**Proposed Enhancement:**
Add `selectedMode: 'single'` and configure emphasis to "explode" the hovered slice outward:

```typescript
series: [{
  type: 'pie',
  radius: ['45%', '85%'],
  center: ['50%', '50%'],
  selectedMode: 'single',        // Allow single selection
  selectedOffset: 12,            // Distance to move selected slice
  data: monthlyCommissionData.map(d => ({
    name: d.name,
    value: d.value,
    itemStyle: { color: d.color },
  })),
  label: { show: false },
  emphasis: {
    itemStyle: {
      shadowBlur: 20,
      shadowColor: 'rgba(0, 0, 0, 0.3)',
    },
    scale: true,
    scaleSize: 12,               // Increase scale on hover
  },
  animationType: 'scale',
  animationEasing: 'elasticOut',
}]
```

The `selectedOffset` property creates the visual separation when a slice is selected/hovered.

---

### 3. Reduce Commission Snapshot Widget Height

**Current State:**
- Line 596: `<Card className="col-span-3 row-span-2">`
- The `row-span-2` makes the widget span 2 rows, making it significantly taller than adjacent widgets

**Proposed Change:**
- Remove `row-span-2` class to make it a single-row widget
- This will align its height with the other cards in the same row (Commission by Type, Commission Earned, Monthly Commission)

The Commission Snapshot widget contains 5 info items which will fit comfortably in a single-row card.

---

## Files to Modify

### `src/pages/Insights.tsx`

| Line | Current | Change |
|------|---------|--------|
| 309 | `radius: ['50%', '80%']` | `radius: ['45%', '85%']` |
| 307-328 | Pie series config | Add `selectedMode` and `selectedOffset` |
| 572 | `<div className="h-48 ...">` | `<div className="h-64 ...">` |
| 573-576 | `height={192}` | `height={256}` |
| 596 | `col-span-3 row-span-2` | `col-span-3` (remove row-span-2) |

---

## Visual Comparison

### Pie Chart Before vs After

| Property | Before | After |
|----------|--------|-------|
| Container height | 192px | 256px |
| Inner radius | 50% | 45% |
| Outer radius | 80% | 85% |
| Hover scale | 10px | 12px |
| Slice separation | None | 12px offset on hover |

### Commission Snapshot Before vs After

| Property | Before | After |
|----------|--------|-------|
| Row span | 2 rows | 1 row |
| Height | ~2x other cards | Same as other cards |

---

## Technical Details

### ECharts Pie Separation Behavior

ECharts provides two ways to separate pie slices:
1. **`selectedOffset`**: Moves the slice away from center when selected
2. **`emphasis.scale`**: Scales the slice larger on hover

Combining both creates a pronounced visual effect where:
- On hover, the slice scales up slightly (scaleSize: 12)
- On click/select, the slice moves outward (selectedOffset: 12)

For hover-only separation without requiring click, we can use the emphasis configuration with the scale property, which is already partially implemented. The `selectedOffset` provides additional separation when users interact.

