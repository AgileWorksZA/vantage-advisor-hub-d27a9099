

## Remove Delete Buttons from Product Tables and Embed Delete in Edit Screens

### Overview
Remove all standalone Trash (delete) buttons from the product table rows across the Products tab. Delete functionality will instead be accessed from within each product's edit screen.

### Changes

**File:** `src/components/client-detail/Client360ViewTab.tsx`

**1. Remove Trash2 buttons from 5 tables:**

| Table | Line | Action |
|-------|------|--------|
| External Products | 346-348 | Remove Trash2 button |
| Platform Cash | 404-406 | Remove Trash2 button |
| Short Term | 453-455 | Remove Trash2 button |
| Risk Products | 566-568 | Remove Trash2 button |
| Medical Aid | 624-626 | Remove Trash2 button |

**2. Clean up unused import:**
- Remove `Trash2` from the lucide-react import (line 13) since it will no longer be used anywhere in the file.

Note: The On-Platform Products table does not have a Trash2 button (it uses a dropdown menu for actions), so no change is needed there.

### Technical details
- Each deletion is simply removing the 3-line `<Button>` block containing the `<Trash2>` icon
- The surrounding `flex` container and remaining buttons (Pencil, MoreVertical where present) stay unchanged
- The `Trash2` import is removed from line 13 since no other usage remains

