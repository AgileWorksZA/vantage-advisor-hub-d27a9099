

# Remove Action Columns and Conditionally Show Language Column

## Overview
Clean up the clients table by removing the "+" and "Delete" action columns entirely, and making the "Language" column visible only when the South Africa (ZA) jurisdiction is selected.

## Changes

### File: `src/pages/Clients.tsx`

1. **Remove unused imports**: Remove `Plus` and `Trash2` from lucide-react imports since they will no longer be used in the table.

2. **Remove delete-related state and handlers**: Remove `deleteDialogOpen`, `clientToDelete`, `handleDeleteClick`, `confirmDelete`, and the delete confirmation `AlertDialog` component -- all of which become unnecessary.

3. **Remove the actions column header**: Delete the empty `<TableHead>` that serves as the header for the "+" and delete buttons (line 519).

4. **Remove the actions column cells**: Delete the `<TableCell>` containing the Plus and Trash2 icon buttons from each row (lines 560-574).

5. **Conditionally render the Language column**: Destructure `selectedRegion` from the `useRegion()` hook (it is already called on line 106). Then wrap both the Language `<TableHead>` (line 517) and Language `<TableCell>` (line 558) in a conditional check: `{selectedRegion === "ZA" && ...}`.

6. **Remove the Delete Confirmation AlertDialog**: Remove the entire `AlertDialog` block (lines 626-644) since delete functionality is being removed.

7. **Clean up AlertDialog imports**: Remove `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogContent`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogHeader`, `AlertDialogTitle` imports if no longer used elsewhere in the file.

## Technical Details

### Region detection
The `useRegion()` hook already provides `selectedRegion` (values: "ZA", "AU", "CA", "GB", "US"). The component already calls this hook, so we just need to add `selectedRegion` to the destructured values:

```typescript
const { regionalData, selectedAdvisors, selectedRegion } = useRegion();
```

### Language column conditional rendering
```typescript
// Header
{selectedRegion === "ZA" && (
  <TableHead className="text-xs font-normal text-muted-foreground">Language</TableHead>
)}

// Cell
{selectedRegion === "ZA" && (
  <TableCell className="text-sm">{client.language}</TableCell>
)}
```

### Items removed
- The `+` button in each row (no functionality was attached to it)
- The delete/trash button in each row along with its confirmation dialog
- Related state variables and event handlers (`deleteDialogOpen`, `clientToDelete`, `handleDeleteClick`, `confirmDelete`)
- Unused imports (`Plus`, `Trash2`, AlertDialog sub-components)
- The `deleteClient` destructuring from `useClients()` hook

