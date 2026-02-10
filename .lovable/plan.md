

## Update AI Badge to Pill/Button Style

### Overview

Change the circular AI badge before "Optimise" to a rounded pill shape with a lighter purple/blue background, matching the reference image style.

### Changes

**File: `src/components/client-detail/next-best-action/OpportunitiesTab.tsx`**

On line 81, replace the current circular badge:
```tsx
<span className="inline-flex items-center justify-center w-4 h-4 text-[8px] font-bold bg-gradient-to-br from-[hsl(200,80%,50%)] to-[hsl(260,70%,55%)] text-white rounded-full mr-1">AI</span>
```

With a pill-shaped badge matching the uploaded reference:
```tsx
<span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold bg-[hsl(230,80%,85%)] text-[hsl(230,70%,50%)] rounded-md mr-1">AI</span>
```

Key differences:
- `rounded-md` instead of `rounded-full` for pill shape
- `px-1.5 py-0.5` padding instead of fixed `w-4 h-4`
- Light purple background (`hsl(230,80%,85%)`) with darker purple text (`hsl(230,70%,50%)`) instead of gradient with white text

| File | Action |
|------|--------|
| `src/components/client-detail/next-best-action/OpportunitiesTab.tsx` | Modify - change AI badge from circle to pill style |

