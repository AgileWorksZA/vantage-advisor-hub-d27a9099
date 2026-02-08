

# Replace Vantage Logo with Uploaded Icon in Chat Avatars

## Overview

Replace the current Vantage logo used in the AI chat panel's circular avatars with the uploaded icon. Since the icon is **white on a transparent background**, it needs a dark/contrasting circular background to remain visible in both light and dark modes.

## Changes

### 1. Copy the uploaded icon to project assets

Copy `user-uploads://image-75.png` to `src/assets/ai-chat-icon.png` so it can be imported as an ES6 module in the component.

### 2. Update `ChatPanel.tsx` to use the new icon

**File: `src/components/ai-assistant/ChatPanel.tsx`**

- Replace the `vantageLogo` import with the new `ai-chat-icon.png` asset
- Update all 4 `<img>` avatar instances (header, welcome message, assistant messages, typing indicator)
- Change the avatar circle styling to use a **dark background** that works in both modes:
  - Use `bg-foreground` (dark in light mode, light in dark mode) with the icon rendered using CSS `invert` or `filter` to ensure contrast
  - Alternatively, use a fixed dark background (`bg-slate-800 dark:bg-slate-700`) so the white icon is always visible
  - The recommended approach: Use `bg-foreground` for the circle and apply `dark:invert` on the image so it stays visible against both background colours

**Specific styling per avatar:**

- **Header avatar** (line 148-152): Change from `bg-background` to `bg-foreground` and add padding for the icon
- **Welcome message avatar** (line 200-204): Change from `bg-muted` to `bg-foreground`  
- **Assistant message avatars** (line 241-245): Change from `bg-muted` to `bg-foreground`
- **Typing indicator avatar** (line 272-276): Change from `bg-muted` to `bg-foreground`

### Avatar Styling Detail

Since the icon is white on transparent:
- **Light mode**: `bg-foreground` renders as dark background, white icon is naturally visible
- **Dark mode**: `bg-foreground` renders as light/white background, so the icon needs `dark:invert` to turn dark and remain visible against the light circle

Final class for each avatar circle:
```
w-7 h-7 rounded-full object-contain bg-foreground p-1.5 flex-shrink-0
```

And the `<img>` tag gets an additional `dark:invert` class so the white icon inverts to dark in dark mode (where bg-foreground is light).

## Files Summary

| File | Action |
|------|--------|
| `src/assets/ai-chat-icon.png` | **New** -- copy uploaded icon |
| `src/components/ai-assistant/ChatPanel.tsx` | Update import and all 4 avatar instances with new icon and theme-safe styling |

No other files need changes. The icon is only used inside `ChatPanel.tsx`.

