

# Resize TLH Dashboard Popup with Persistent Rounded Corners

## Problem

The TLH Dashboard dialog currently covers ~95% of the viewport width and ~92% of the viewport height. The rounded corners from `sm:rounded-lg` (set by the base `DialogContent` component) get visually clipped when the scrollbar appears because `overflow-y-auto` is applied directly to the `DialogContent` element.

## Solution

Two changes in a single file:

### 1. Reduce dialog size to 80% coverage

Update the `DialogContent` className to use 80% viewport dimensions:
- `max-w-[95vw]` changes to `max-w-[80vw]`
- `max-h-[92vh]` changes to `max-h-[80vh]`
- `w-[1400px]` is kept as the preferred width but now capped at 80vw

### 2. Move scroll to an inner container

Move `overflow-y-auto` off the `DialogContent` and onto an inner wrapper `div`. This keeps the outer container with `overflow-hidden` and `rounded-lg`, so the rounded corners always render cleanly -- the scrollbar lives inside the rounded boundary rather than on the boundary itself.

**Before:**
```
DialogContent (rounded-lg + overflow-y-auto)  <-- scrollbar clips corners
  content...
```

**After:**
```
DialogContent (rounded-lg + overflow-hidden)  <-- corners always clean
  inner div (overflow-y-auto + max-h-[80vh])  <-- scrollbar inside
    content...
```

## File Change

**`src/components/tax-loss-harvesting/TLHDashboard.tsx`** (line 204)

- Change `DialogContent` className from `max-w-[95vw] w-[1400px] max-h-[92vh] overflow-y-auto p-0 gap-0` to `max-w-[80vw] w-[1400px] max-h-[80vh] overflow-hidden p-0 gap-0`
- Wrap all children of `DialogContent` in a `<div className="overflow-y-auto max-h-[80vh] rounded-lg">` so scrolling happens inside with corners preserved

One file, minimal structural change.
