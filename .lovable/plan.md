

## Auto-Position Widgets Left-to-Right, Top-to-Bottom

### Problem
Widgets currently use horizontal compaction, which can leave gaps in rows and allows widgets to form isolated rows/columns when dragged. The desired behavior is: widgets should always fill from left to right, starting at the top row, packing as tightly as possible without changing widget sizes or showing partial widgets.

### Solution
A single change in the shared `DraggableWidgetGrid` component: switch `compactType` from `"horizontal"` to `"vertical"`.

In react-grid-layout, `compactType="vertical"` means:
- Widgets are compacted **upward** to fill vertical gaps
- Within each row, items flow **left to right**
- After a drag, all widgets re-compact so no empty rows or floating positions remain

This applies to both the Adviser Dashboard, Client Dashboard, and Insights page since they all share the same grid component.

### File Change

| File | Change |
|------|--------|
| `src/components/widgets/DraggableWidgetGrid.tsx` | Line 115: Change `compactType="horizontal"` to `compactType="vertical"` |

No other files need to change -- the grid component is shared by all dashboards.
