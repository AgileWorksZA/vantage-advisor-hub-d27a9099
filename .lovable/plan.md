

# Move "Include Inactive Clients" Toggle Inline with Search

## Overview
Relocate the "Include inactive clients" switch from its current position (separate row above the client list header) to be inline with the AppHeader search bar, aligned to the far right.

## Change

### File: `src/pages/Clients.tsx`

1. **Remove the switch from its current location** (lines 373-380): Remove the Switch + label from the top row, leaving only the "+ Add Profile" button in that row (right-aligned).

2. **Add the switch to the AppHeader row**: Move the "Include inactive clients" Switch into the AppHeader's right-side area. Since AppHeader is a shared component, the cleanest approach is to place the switch in a wrapper row that contains the AppHeader search output. However, looking at the architecture, the AppHeader is a self-contained component.

   **Better approach**: Place the switch in a new inline container that sits on the same visual line as the search bar, immediately after the AppHeader. This can be done by:
   - Removing the switch from lines 374-380
   - Making the "+ Add Profile" button row right-aligned only (`justify-end`)
   - Adding the switch as a `rightContent` or similar prop to AppHeader, OR positioning it absolutely/as an overlay aligned to the right of the search row.

   **Simplest approach**: Since AppHeader accepts no slot props for extra content, we'll pass the switch as additional right-side content. Looking at AppHeader, it likely has a fixed layout. The cleanest solution is to add the toggle to the same row as the section header (line 391-417) on the far right, or pass it to AppHeader.

   **Final approach**: Move the switch into the header actions row (lines 391-417) at the far right, after the MultiSelect dropdowns. This keeps it on the same visual line as the search and filters.

### Specific Edits

**Lines 373-387** - Remove the Switch from this row, keep only the button:
```tsx
<div className="flex items-center justify-end mb-4">
  <Button ...>+ Add Profile</Button>
</div>
```

**Lines 395-417** - Add the Switch after the MultiSelect dropdowns:
```tsx
<div className="flex items-center gap-2">
  <Button variant="outline" ...>Reports</Button>
  <MultiSelect ... placeholder="Profile status" />
  <MultiSelect ... placeholder="Client types" />
  <div className="flex items-center gap-2 ml-2">
    <Switch checked={includeInactive} onCheckedChange={setIncludeInactive} />
    <span className="text-sm text-muted-foreground whitespace-nowrap">Include inactive clients</span>
  </div>
</div>
```

This places the toggle on the same line as the search results header and filter dropdowns, pushed to the far right.
