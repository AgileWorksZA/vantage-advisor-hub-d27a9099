
# Remove Glow from AI Button on All Screens

## Problem

The AI orb button has multiple glow effects: outer gradient rings (hover-triggered and static), the `orb-glow` CSS class applying a large `box-shadow`, inner light/glow layers, and a `drop-shadow` on the text. These need to be removed for a cleaner appearance.

## Changes

### 1. Remove outer glow rings from AIOrb component

**File: `src/components/ai-assistant/AIOrb.tsx`**

- Remove the three outer hover-animated glow ring divs (lines 16-21) that appear when chat is closed
- Remove the three static glow ring divs (lines 28-31) that appear when chat is open
- Remove the `orb-glow` class from the core orb div (line 37)
- Remove the "Inner light" div (`bg-gradient-to-t from-transparent to-white/30`, line 43)
- Remove the "Central glow" div (`bg-white/20 blur-sm`, line 46)
- Remove `drop-shadow-lg` from the AI text span (line 50)

The core orb keeps its gradient background (`from-violet-600 via-purple-600 to-cyan-500`) so it remains a visible, colored button -- just without any glow or luminance effects.

### 2. Remove the orb-glow CSS class

**File: `src/index.css`** (lines 176-182)

- Remove the `.orb-glow` class definition entirely since it is no longer referenced

## Result

The AI button will be a clean, flat gradient circle with "AI" text, no box-shadow glow, no outer rings, and no inner light effects. The hover scale-up animation and click behavior remain unchanged.
