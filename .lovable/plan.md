

## Move Gear Icon Inline with Heading and Remove Gap

### Problem
The settings gear icon sits on its own row below the "Advisor Dashboard" heading, creating wasted vertical space. The user wants the gear to appear on the same line as the heading (right-aligned), and the widgets to move up to eliminate the gap.

### Changes

**1. `src/pages/Dashboard.tsx` (line ~295-308, ~324)**
- Remove the standalone heading `div` wrapper
- Move the heading into a flex row that also contains the gear icon (pulled out of the grid's toolbar prop)
- Pass `toolbar={undefined}` or remove the toolbar prop from `DraggableWidgetGrid`
- Structure becomes:
```
<div className="flex items-center justify-between mb-2">
  <h1>Advisor Dashboard <AI badge/></h1>
  <WidgetSettingsDialog ... />
</div>
<DraggableWidgetGrid layout={...} onLayoutChange={...}>
```

**2. `src/components/widgets/DraggableWidgetGrid.tsx` (lines 124-128)**
- Remove the toolbar rendering block (the `div` with `flex justify-end mb-2`) since the toolbar will now be rendered externally by the Dashboard page
- Remove the `toolbar` prop from the component interface

### Result
The gear icon appears right-aligned on the same line as "Advisor Dashboard", and widgets sit directly below with minimal spacing.
