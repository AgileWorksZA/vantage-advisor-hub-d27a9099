

## Align Gear Icon Horizontally with the Flag

### Problem
The gear icon currently sits at the far right of the content area. The flag icon in the header has the UserMenu avatar (36px) and a gap (16px) to its right, placing it roughly 52px inward from the right edge. The gear needs to shift right-ward to match the flag's horizontal position.

### Solution
Add `pr-[52px]` to the heading wrapper div. This accounts for the avatar width (h-9 = 36px) plus the gap-4 (16px) in the header's right-side items, aligning the gear icon directly beneath the flag.

### Change
**`src/pages/Dashboard.tsx`** (line 251):
- Add `pr-[52px]` to the heading div

```tsx
// Before
<div className="flex items-center justify-between mb-6">

// After
<div className="flex items-center justify-between mb-6 pr-[52px]">
```

### Files Changed
- `src/pages/Dashboard.tsx` (1 line)

