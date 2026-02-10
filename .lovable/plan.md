

## Add AI Badge Before "Optimise" Button

### Overview

Add the same circular AI badge icon that appears next to "Next Best Action" in front of the "Optimise" button text inside the OpportunitiesTab empty state.

### Changes

**File: `src/components/client-detail/next-best-action/OpportunitiesTab.tsx`**

- Replace the `Zap` icon before "Optimise" with the same circular gradient AI badge used in the card header
- The badge uses: `bg-gradient-to-br from-[hsl(200,80%,50%)] to-[hsl(260,70%,55%)]` with white "AI" text, `w-5 h-5` circle

### Technical Detail

In the Button contents (around line 80), replace:
```tsx
<Zap className="h-3.5 w-3.5 mr-1.5" />
```
with:
```tsx
<span className="inline-flex items-center justify-center w-4 h-4 text-[8px] font-bold bg-gradient-to-br from-[hsl(200,80%,50%)] to-[hsl(260,70%,55%)] text-white rounded-full mr-1">AI</span>
```

Only the icon swap; no other changes needed.

| File | Action |
|------|--------|
| `src/components/client-detail/next-best-action/OpportunitiesTab.tsx` | Modify - swap Zap icon for AI badge |

