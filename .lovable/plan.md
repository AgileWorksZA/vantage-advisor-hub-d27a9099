

# Partially Revert AI Button -- Remove Outer Glow Only, Keep 3D Effect

## Problem

The last change removed all visual effects from the AI orb, making it completely flat. The user wants to keep the 3D depth (inner light, central glow, text shadow) but remove only the outer faded glow rings and the `orb-glow` box-shadow.

## What to restore

**File: `src/components/ai-assistant/AIOrb.tsx`**

Bring back these three elements that were removed in the last edit:

1. **Inner light layer** -- `<div className="absolute inset-2 rounded-full bg-gradient-to-t from-transparent to-white/30" />` -- this gives the orb a lit-from-above 3D look
2. **Central glow layer** -- `<div className="absolute inset-4 rounded-full bg-white/20 blur-sm" />` -- adds depth to the center
3. **Text drop-shadow** -- restore `drop-shadow-lg` on the "AI" text span for legibility and depth

## What stays removed (not restored)

- The three outer hover-animated glow ring divs (ping, pulse, spin-slow)
- The three static glow ring divs shown when chat is open
- The `orb-glow` class on the core orb div
- The `.orb-glow` CSS class in `src/index.css`

## Resulting structure

```text
<div class="relative w-24 h-24 group">
  <div class="absolute inset-4 rounded-full bg-gradient-to-br ... cursor-pointer" onClick>
    <div class="absolute inset-2 ... to-white/30" />        <-- inner light (restored)
    <div class="absolute inset-4 ... bg-white/20 blur-sm" /> <-- central glow (restored)
    <div class="absolute inset-0 flex items-center justify-center">
      <span class="text-white font-bold text-lg drop-shadow-lg">AI</span>  <-- shadow restored
    </div>
  </div>
  {isProcessing && <ParticleField />}
</div>
```

## Files

| File | Action |
|------|--------|
| `src/components/ai-assistant/AIOrb.tsx` | Modify -- restore inner light, central glow, and text drop-shadow |

No changes needed to `src/index.css` -- the `.orb-glow` class stays removed.

