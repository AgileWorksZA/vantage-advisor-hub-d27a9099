

# Show Backdrop Blur Only When Expanded

## Problem

Currently, the backdrop blur overlay appears whenever the chat is opened (both compact popup and expanded modal). It should only appear when the chat is in **expanded mode**.

## Change

**File: `src/components/ai-assistant/GlobalAIChat.tsx`** -- Line 118

Change the condition from `isChatOpen` to `isExpanded` so the blur overlay only renders when the user clicks the expand button, not when they simply open the compact chat popup.

**Before:**
```
{isChatOpen && (
```

**After:**
```
{isExpanded && (
```

This is a single-line change. The compact chat popup will float over the page without dimming/blurring the background, while the expanded modal view will still get the full backdrop blur effect.

