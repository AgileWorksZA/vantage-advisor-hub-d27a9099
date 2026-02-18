

## Move Expander Button to Left of Edit Button

Currently in the On-Platform Products table, the button order in the actions cell is: **Edit (pencil) > More (three dots) > Expand (chevron)**. The expander button needs to move to the left of the edit button.

### Change

**File:** `src/components/client-detail/Client360ViewTab.tsx` (lines 220-251)

Reorder the buttons inside the `flex` container so the expand/collapse chevron button appears first, followed by the edit (pencil) button, then the dropdown menu.

**Current order:**
1. Pencil (edit)
2. MoreVertical (dropdown)
3. ChevronDown/Up (expand) -- conditional

**New order:**
1. ChevronDown/Up (expand) -- conditional
2. Pencil (edit)
3. MoreVertical (dropdown)

This is the only expander instance in the file (On-Platform Products table). No other tables have expandable rows, so this single change covers all cases.
