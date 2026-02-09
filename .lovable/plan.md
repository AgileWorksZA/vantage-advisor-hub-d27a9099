

## Move Gear Icon to Align with Widget Grid Right Edge

### Problem
The gear icon currently sits at the far right of the page (due to `justify-between` on the full-width heading row), but it should align with the right edge of the widget grid -- specifically lining up with the close/X buttons on the far-right widget cards.

### Solution

In `src/pages/Dashboard.tsx`, constrain the heading row's max-width to match the widget grid's width. The grid renders 3 standard widgets at 350px each with 16px margins between them, giving a total width of `3*350 + 2*16 = 1082px`. Setting `max-w-[1082px]` on the heading `div` will align the gear icon with the right edge of the rightmost widget.

### Changes

**`src/pages/Dashboard.tsx`** (line ~251):
- Add `max-w-[1082px]` to the heading wrapper `div` so the gear icon aligns with the grid's right edge

### Files Changed
- `src/pages/Dashboard.tsx` (1 file, 1 line change)
