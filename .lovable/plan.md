

## Make Adviser and Client App Screens Responsive for Mobile

### Problem

Both the Adviser App and Client App are currently rendered inside a fixed `393x852px` phone-shaped frame with rounded corners and a ring border. This looks great on desktop as a "phone preview", but on an actual mobile device the fixed dimensions don't fill the screen properly.

### Solution

Make the rendering adaptive:
- **On desktop** (viewport wider than 768px): Keep the current phone-frame presentation (393x852px with rounded corners, ring border, dark background)
- **On mobile** (viewport 768px or narrower): Render the app full-screen with no frame, no rounded corners, no ring -- just the app filling the entire viewport

This uses the existing `useIsMobile` hook from `src/hooks/use-mobile.tsx`.

### Technical Details

**File: `src/App.tsx`**

1. Import `useIsMobile` from `@/hooks/use-mobile`
2. For both `mode === "adviser"` and `mode === "client"` blocks:
   - When `isMobile` is true: render the app component directly inside a simple `fixed inset-0` container with no phone frame styling
   - When `isMobile` is false: keep the existing phone-frame wrapper (393x852, rounded corners, ring, dark background)

The change is confined to the wrapper divs only -- `MobileApp`, `ClientApp`, and the splash screens remain unchanged.

### Files to Edit
- `src/App.tsx`
