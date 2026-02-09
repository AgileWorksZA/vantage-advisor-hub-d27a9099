

## Align Gear Icon with Widget Close (X) Buttons

### Problem
The gear icon sits at the absolute right edge of the 1082px container, but the X buttons on widget cards are inset by `px-4` (16px) due to the card's internal padding. This misalignment makes them look off.

### Solution
Add `pr-4` (16px right padding) to the heading container so the gear icon shifts inward to match the horizontal position of the X buttons inside the widget cards.

### Change
**`src/pages/Dashboard.tsx`** (line 251):
- Change: `max-w-[1082px]` to `max-w-[1082px] pr-4`

### Files Changed
- `src/pages/Dashboard.tsx` (1 line)

