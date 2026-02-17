

## Auto-Reflow Widgets to Fill Left-to-Right, Top-to-Bottom

### Problem
When the screen width changes (or widgets are hidden), widgets keep their saved x/y positions, leaving gaps. The current code only clamps positions but doesn't re-pack widgets into a dense left-to-right, top-to-bottom flow.

### Solution
Replace the simple `adjustedLayout` clamping logic with a full reflow algorithm that re-assigns x/y positions sequentially, packing widgets densely into rows based on the current column count.

### Single File Change: `src/components/widgets/DraggableWidgetGrid.tsx`

**Replace lines 89-94** (the `adjustedLayout` logic) with a reflow function:

```typescript
// Reflow: pack widgets left-to-right, top-to-bottom
const reflowLayout = (items: WidgetLayout[], cols: number): WidgetLayout[] => {
  // Sort by original position (top-to-bottom, left-to-right) to preserve order
  const sorted = [...items].sort((a, b) => a.y !== b.y ? a.y - b.y : a.x - b.x);
  
  // Track the height filled in each column
  const colHeights = new Array(cols).fill(0);
  
  return sorted.map(item => {
    const w = Math.min(item.w, cols);
    
    // Find the first column position where this widget fits
    let bestCol = 0;
    let bestY = Infinity;
    
    for (let col = 0; col <= cols - w; col++) {
      // The widget spans columns col..col+w-1
      // It must start at the max height of those columns
      const startY = Math.max(...colHeights.slice(col, col + w));
      if (startY < bestY) {
        bestY = startY;
        bestCol = col;
      }
    }
    
    // Place widget
    const placed = { ...item, x: bestCol, y: bestY, w };
    
    // Update column heights
    for (let c = bestCol; c < bestCol + w; c++) {
      colHeights[c] = bestY + item.h;
    }
    
    return placed;
  });
};

const adjustedLayout = reflowLayout(layout, visibleCols);
```

This algorithm:
- Sorts widgets by their current position to maintain relative order
- Greedily places each widget at the earliest available row, leftmost column
- Handles widgets of different widths correctly
- Runs on every render when `visibleCols` changes, so expanding the screen automatically pulls widgets up from lower rows
- After drag-stop, the saved layout gets reflowed on next render, preventing gaps

No other files need changes.
