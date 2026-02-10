

## Replace AI Badges with Dashboard-Style Gradient Pills

### Overview

Update both AI badges (next to "Next Best Action" heading and before "Optimise" button) to match the Adviser Dashboard style: a gradient pill from violet-500 to cyan-500 with white text, rounded-full, but non-clickable (no hover/cursor/animate-pulse effects).

### Changes

**File: `src/components/client-detail/ClientSummaryTab.tsx`**

Replace the circular gradient badge next to "Next Best Action" (line 153):
```tsx
// FROM:
<span className="inline-flex items-center justify-center w-5 h-5 text-[9px] font-bold bg-gradient-to-br from-[hsl(200,80%,50%)] to-[hsl(260,70%,55%)] text-white rounded-full">AI</span>

// TO:
<span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-full">AI</span>
```

**File: `src/components/client-detail/next-best-action/OpportunitiesTab.tsx`**

Replace the pill badge before "Optimise" (line 84):
```tsx
// FROM:
<span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold bg-[hsl(230,80%,85%)] text-[hsl(230,70%,50%)] rounded-md mr-1">AI</span>

// TO:
<span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-full mr-1">AI</span>
```

Both use the same styling as the Dashboard button but without `animate-pulse`, `hover:scale-110`, `cursor-pointer`, or `onClick` -- making them purely decorative labels.

| File | Action |
|------|--------|
| `src/components/client-detail/ClientSummaryTab.tsx` | Update AI badge styling |
| `src/components/client-detail/next-best-action/OpportunitiesTab.tsx` | Update AI badge styling |

