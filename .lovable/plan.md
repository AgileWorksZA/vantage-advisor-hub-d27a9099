

## Fix Column Misalignment in Task Analytics "By User" Table

### Problem
The `TeamGroupRow` component wraps table rows in Radix UI `Collapsible`, `CollapsibleTrigger`, and `CollapsibleContent` components. These inject extra `<div>` elements into the DOM inside `<tbody>`, which is invalid HTML (only `<tr>` elements are valid children of `<tbody>`). This breaks the browser's table layout algorithm and causes columns to misalign.

### Solution
Replace the Radix Collapsible with a simple React state-based toggle using conditional rendering. This keeps the collapse/expand behavior without injecting non-table DOM elements.

### File Changed
**`src/components/tasks/TaskAnalyticsTab.tsx`** (lines 327-356)

Replace the `TeamGroupRow` component:

**Before (broken):**
```tsx
function TeamGroupRow({ ... }) {
  const [open, setOpen] = useState(true);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <TableRow>...</TableRow>
      </CollapsibleTrigger>
      <CollapsibleContent asChild>
        <>{children}</>
      </CollapsibleContent>
    </Collapsible>
  );
}
```

**After (fixed):**
```tsx
function TeamGroupRow({ ... }) {
  const [open, setOpen] = useState(true);
  return (
    <>
      <TableRow
        className="bg-muted/30 cursor-pointer hover:bg-muted/50 font-semibold"
        onClick={() => setOpen(!open)}
      >
        {/* same cells as before */}
      </TableRow>
      {open && children}
    </>
  );
}
```

This removes the Collapsible/CollapsibleTrigger/CollapsibleContent wrappers entirely, using a simple `onClick` handler on the header `TableRow` and conditional rendering (`{open && children}`) for the child rows. The table DOM structure stays valid (`<tbody> > <tr>`), fixing the alignment.

### Additional Cleanup
- Remove the `Collapsible`, `CollapsibleContent`, `CollapsibleTrigger` imports if no longer used elsewhere in the file (they are not used elsewhere in this file).

