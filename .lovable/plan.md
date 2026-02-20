

## Reinstate Rounded Corners on Phone Frames

### Change

Update `src/App.tsx` to change `rounded-none` back to `rounded-[40px]` on the desktop phone-frame wrapper divs for both the Adviser App and Client App modes.

### Technical Details

**File: `src/App.tsx`**
- Line 57: Change `rounded-none` to `rounded-[40px]` (adviser mode desktop frame)
- Line 74: Change `rounded-none` to `rounded-[40px]` (client mode desktop frame)

No other files affected.

