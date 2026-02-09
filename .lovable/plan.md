
## Align Gear Icon with the Flag in the Top Bar

### Problem
The gear icon is currently constrained to `max-w-[1082px] pr-4`, which positions it aligned with the widget grid. The user wants it aligned with the flag icon (RegionSelector) in the AppHeader instead, which sits at the far right of the page with `px-6` padding.

### Solution
Remove the `max-w-[1082px] pr-4` constraints from the heading wrapper so it spans the full width of the content area. Since the main content already has `p-6` padding (matching the header's `px-6`), the gear icon pushed to the right via `justify-between` will naturally align with the flag icon above it.

### Change
**`src/pages/Dashboard.tsx`** (line 251):
- Change `max-w-[1082px] pr-4` back to no width constraint, so the div spans the full content width

### Files Changed
- `src/pages/Dashboard.tsx` (1 line)
