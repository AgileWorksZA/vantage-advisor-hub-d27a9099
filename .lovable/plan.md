

# Fix Vantage Logo Size - Container Constraint Issue

## Problem
The logo has `h-[53px]` applied, but the sidebar is only `w-16` (64px) wide. The logo's parent `<div className="mb-2">` inherits this 64px width. With `object-contain`, the image scales down to fit within its container while preserving aspect ratio. Since the image is rotated 90 degrees, the constraints interact in a way that prevents the logo from actually rendering larger.

## Solution
Instead of only setting height, explicitly set both dimensions and allow overflow from the container. The approach:

1. **Remove `object-contain`** (which constrains the image to its container)
2. **Use fixed width and height** that represent a 15% increase from the original visual size
3. **Allow the rotated image to overflow** its container by adding `overflow-visible` to the parent div

Specifically, change the logo `img` class from:
```
h-[53px] object-contain -rotate-90 origin-center
```
to:
```
h-[80px] w-auto -rotate-90 origin-center
```

And add `overflow-visible` to the parent wrapper div.

This ensures the image is not constrained by the 64px sidebar width after rotation. The `h-[80px]` gives a noticeable visual increase (the previous `h-[53px]` was being capped by container constraints).

## Files to Update (14 files)

All sidebar logo instances need both the wrapper div and img class updated:

1. `src/pages/Dashboard.tsx`
2. `src/pages/Clients.tsx`
3. `src/pages/Portfolio.tsx`
4. `src/pages/Email.tsx`
5. `src/pages/EmailView.tsx`
6. `src/pages/Calendar.tsx`
7. `src/pages/Tasks.tsx`
8. `src/pages/Insights.tsx`
9. `src/pages/Practice.tsx`
10. `src/pages/ClientDetail.tsx`
11. `src/pages/AccountSettings.tsx`
12. `src/pages/Administration.tsx`
13. `src/pages/ComposeEmail.tsx`
14. `src/components/layout/AppLayout.tsx`

Each change updates:
- Parent div: `className="mb-2"` to `className="mb-2 overflow-visible"`
- Image: `className="h-[53px] object-contain -rotate-90 origin-center"` to `className="h-[80px] w-auto -rotate-90 origin-center"`

