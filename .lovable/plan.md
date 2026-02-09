

## Fix Vantage Logo Aspect Ratio

### Problem
Removing `object-contain` in the previous change caused the logo's aspect ratio to distort. The `object-contain` class is needed to ensure the image scales proportionally.

### Solution
Add `object-contain` back to the logo's class list while keeping the `h-[80px]`, `w-auto`, and `overflow-visible` changes that allow it to render larger than the sidebar width.

Update across all 14 files:

```tsx
// Before
className="h-[80px] w-auto -rotate-90 origin-center"

// After
className="h-[80px] w-auto object-contain -rotate-90 origin-center"
```

### Files to Update
1. `src/components/layout/AppLayout.tsx`
2. `src/pages/Dashboard.tsx`
3. `src/pages/Clients.tsx`
4. `src/pages/Portfolio.tsx`
5. `src/pages/Email.tsx`
6. `src/pages/EmailView.tsx`
7. `src/pages/Calendar.tsx`
8. `src/pages/Tasks.tsx`
9. `src/pages/Insights.tsx`
10. `src/pages/Practice.tsx`
11. `src/pages/ClientDetail.tsx`
12. `src/pages/AccountSettings.tsx`
13. `src/pages/Administration.tsx`
14. `src/pages/ComposeEmail.tsx`

Single class addition per file, no other changes needed.
