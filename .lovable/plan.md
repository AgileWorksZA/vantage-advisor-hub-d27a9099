

## Replace Widget Picker with Dropdown Menu (Show/Hide + Drag Reorder)

### Overview

Replace the current bottom-sheet `ClientHomeWidgetPicker` with a dropdown menu that appears when the sliders icon is clicked. The dropdown will show all widgets with toggle switches (show/hide) and support drag-and-drop reordering of the widget list.

### Changes

**Edit: `src/components/client-app/ClientHomeTab.tsx`**

- Remove `ClientHomeWidgetPicker` import and usage
- Replace `showPicker` boolean state with controlled state for the dropdown (or just use Popover open state)
- Add `widgetOrder` state (string array of widget IDs) persisted to `localStorage` alongside visibility
- Render widgets in `widgetOrder` order instead of hardcoded order
- Replace the `SlidersHorizontal` button with a `DropdownMenu` (or `Popover`) trigger
- Inside the dropdown content, render a list of widgets with:
  - A drag handle (grip icon) on the left
  - Widget label in the middle
  - Toggle switch on the right
- Implement drag-and-drop reordering using native HTML5 drag events (`onDragStart`, `onDragOver`, `onDrop`) within the dropdown list -- no extra library needed
- Persist both `visibleWidgets` and `widgetOrder` to `localStorage`

**Delete/deprecate: `src/components/client-app/ClientHomeWidgetPicker.tsx`**

- No longer needed; the dropdown replaces it entirely

### Technical Details

**Widget order state:**
```
const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
  const saved = localStorage.getItem(`client-home-widget-order-${clientId}`);
  return saved ? JSON.parse(saved) : ALL_WIDGETS.map(w => w.id);
});
```

**Dropdown structure (using Popover for flexibility):**
- Popover trigger: the existing sliders icon button
- Popover content: "Customise Home" heading, then a list of draggable rows
- Each row: `GripVertical` icon (drag handle) | widget label | `Switch` toggle
- Rows are draggable via HTML5 drag-and-drop (`draggable="true"`)
- On drop, reorder the `widgetOrder` array and persist to `localStorage`

**Widget rendering order:**
- Instead of checking `isVisible(id)` in hardcoded order, iterate `widgetOrder.filter(id => visibleWidgets.includes(id))` and render each widget via a lookup/switch

**Drag-and-drop implementation (inline, no library):**
- Track `dragIndex` in local state
- `onDragStart`: set `dragIndex`
- `onDragOver`: `e.preventDefault()` to allow drop
- `onDrop`: splice the dragged item to the new position, update state and localStorage

