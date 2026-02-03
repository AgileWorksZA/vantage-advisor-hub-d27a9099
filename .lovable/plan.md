
# Fix Scrollbar Position & AI Chat Button Floating

## Issues

1. **Scrollbar position**: Currently the scrollbar appears on the `<main>` element which has `max-w-7xl mx-auto`, causing it to appear in the middle of the screen rather than at the far right edge.

2. **AI Chat button z-index**: The AI Orb button needs to stay visible above all scrolling content.

---

## Solution

### 1. Move Scrollbar to Far Right Edge

**Current structure:**
```
<div h-screen overflow-hidden>           ← No scroll
  <header>...</header>                   ← Fixed height
  <main max-w-7xl mx-auto overflow-y-auto> ← Scroll here (centered, scrollbar in middle)
    ...content...
  </main>
</div>
```

**Fixed structure:**
```
<div h-screen overflow-y-auto>           ← Scroll on root (scrollbar at far right)
  <header>...</header>                   ← Fixed via sticky
  <main max-w-7xl mx-auto>               ← No scroll, just content container
    ...content...
  </main>
</div>
```

### 2. Ensure AI Orb Floats Above Content

The AI Orb already has `fixed` positioning with `z-40`. Increase to `z-50` to ensure it stays above all content including modals/dialogs.

---

## Changes

### src/pages/AIAssistant.tsx

| Line | Current | Change |
|------|---------|--------|
| 378 | `h-screen ... overflow-hidden flex flex-col` | Change to `min-h-screen overflow-y-auto` |
| 389 | `header ... flex-shrink-0` | Add `sticky top-0 z-20 backdrop-blur-sm bg-black/20` for fixed header |
| 419 | `main ... overflow-y-auto flex-1` | Remove `overflow-y-auto flex-1`, keep other classes |
| 486 | `z-40` | Change to `z-50` for higher stacking |

**Result:**
- Root div scrolls → scrollbar appears at far right edge of viewport
- Header stays fixed at top while scrolling
- AI Orb floats above everything with `z-50`
