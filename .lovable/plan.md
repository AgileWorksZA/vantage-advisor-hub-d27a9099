
## Fix Date Overflow in Task Filter Date Picker

### Problem
The "Due by" date picker button has a fixed width of `w-[150px]`, which is too narrow to display a fully formatted date like "February 3rd, 2026" (the `PPP` format). The text overflows or gets clipped.

### Solution
Widen the button from `w-[150px]` to `w-[200px]` so the full date string fits comfortably.

### Changes

**`src/components/tasks/TaskFilters.tsx`**

- Change the date picker button width from `w-[150px]` to `w-[200px]`

### Files Changed
- `src/components/tasks/TaskFilters.tsx` (1 line change)
