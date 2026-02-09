

# Update MultiSelect Button Label to "Client types (all)" / "Client types (N)"

## Overview
Update the MultiSelect component's trigger button to show "Client types" as the title, with "(all)" when all options are selected and a count in brackets like "(3)" when fewer than all are selected.

## Changes

### File: `src/components/ui/multi-select.tsx`

Update the button label logic inside the `PopoverTrigger` to use a dynamic title that shows:
- The placeholder text (e.g. "Client types") followed by "(all)" when all options are selected
- The placeholder text followed by "(N)" when fewer than all are selected (where N is the count)
- Just the placeholder when nothing is selected

Replace the current display logic (lines 59-76) which shows badges or "N selected" with a simpler text-based approach:

```typescript
{selected.length === 0 ? (
  <span className="text-muted-foreground">{placeholder}</span>
) : selected.length === options.length ? (
  <span>{placeholder} (all)</span>
) : (
  <span>{placeholder} ({selected.length})</span>
)}
```

This removes the inline badge display from the trigger button itself (the removable tags below the filter already serve that purpose).

### File: `src/pages/Clients.tsx`

Update the `placeholder` prop on the `MultiSelect` from `"Person type"` to `"Client types"` (line 442):

```typescript
<MultiSelect
  options={clientTypeOptions}
  selected={selectedClientTypes}
  onChange={setSelectedClientTypes}
  placeholder="Client types"
  className="w-48"
/>
```

## Technical Notes
- The `MultiSelect` component change is generic -- it will display "(all)" or "(N)" for any usage of the component, using the placeholder as the label prefix
- The `Badge` import in `multi-select.tsx` can be removed since badges will no longer render inside the trigger button
- The `handleClear` function and its `X` import can be cleaned up from the component since inline badge clearing is removed from the trigger (the `X` import is still needed for the popover items if used, but in this case it was only for trigger badges)
