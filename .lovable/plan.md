

## Align Gear Icon Center with Flag Icon Center

### Problem
The current `pr-[52px]` puts the gear icon's center at ~68px from the right edge, while the flag icon's center sits at ~70px. They are close but not perfectly aligned.

### Calculation
- **Header right side** (gap-4 = 16px between items):
  - UserMenu avatar: 36px wide, center at 18px from right
  - Gap: 16px
  - Flag (RegionSelector): 36px wide, center at 36 + 16 + 18 = 70px from right
- **Gear icon**: 32px wide, center = pr + 16px
  - To align center at 70px: pr = 70 - 16 = 54px

### Change
**`src/pages/Dashboard.tsx`** (line 251):
- Change `pr-[52px]` to `pr-[54px]`

### Files Changed
- `src/pages/Dashboard.tsx` (1 line)

