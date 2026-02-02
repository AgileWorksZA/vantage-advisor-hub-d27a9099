

# AI Assistant Screen Modifications

## Overview
Modify the AI Assistant page to:
1. Force dark mode while on this page (restore previous theme when leaving)
2. Make the AI orb smaller and position it in the bottom-right corner
3. Open a quarter-width dialog when the orb is clicked
4. Stop the pulsating animation while the dialog is open

---

## Changes Summary

### 1. Force Dark Mode on Page Entry/Exit

Use the `useTheme` hook from `next-themes` to:
- Store the current theme on component mount
- Set theme to "dark" when entering the page
- Restore the previous theme when leaving the page

```typescript
import { useTheme } from "next-themes";

// Inside component:
const { theme, setTheme } = useTheme();
const previousThemeRef = useRef<string | undefined>(undefined);

useEffect(() => {
  // Store current theme and force dark mode
  previousThemeRef.current = theme;
  setTheme("dark");
  
  // Restore previous theme on unmount
  return () => {
    if (previousThemeRef.current) {
      setTheme(previousThemeRef.current);
    }
  };
}, []);
```

---

### 2. Reposition and Resize AI Orb

**Current state:**
- Orb is centered in the main content area
- Size: `w-48 h-48` (192px)

**New state:**
- Position: Fixed bottom-right corner
- Size: `w-24 h-24` (96px) - approximately 50% smaller
- Adjust internal elements proportionally

**AIOrb.tsx changes:**
- Add `isChatOpen` prop to control animation state
- Make the orb smaller with proportional inner elements
- Conditionally apply pulsing animations based on `isChatOpen`

```typescript
interface AIOrbProps {
  isProcessing: boolean;
  isChatOpen: boolean;  // New prop
  onClick: () => void;
}

// Conditional animation classes:
className={cn(
  "absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20",
  !isChatOpen && "animate-ping"
)}
```

**AIAssistant.tsx changes:**
- Move orb to fixed position in bottom-right
- Remove from main content flow

```typescript
{/* AI Orb - Fixed bottom right */}
<div className="fixed bottom-8 right-8 z-40">
  <AIOrb 
    isProcessing={isProcessing} 
    isChatOpen={isChatOpen}
    onClick={handleOrbClick} 
  />
</div>
```

---

### 3. Quarter-Width Chat Dialog

**Current state:**
- ChatPanel is full-width on mobile, 400px on desktop
- Slides in from the right edge

**New state:**
- Width: 25vw (quarter of screen width)
- Minimum width for usability: 320px
- Maximum width: 400px

```typescript
// ChatPanel.tsx
className={cn(
  "fixed top-0 right-0 h-full w-[25vw] min-w-[320px] max-w-[400px] glass-panel border-l border-white/10 z-50",
  // ... rest of classes
)}
```

---

## Files to Modify

### 1. `src/pages/AIAssistant.tsx`
- Import `useTheme` from `next-themes`
- Add `useRef` for storing previous theme
- Add `useEffect` for theme switching on mount/unmount
- Move AIOrb to fixed bottom-right position
- Pass `isChatOpen` prop to AIOrb
- Reorganize main content layout without center orb

### 2. `src/components/ai-assistant/AIOrb.tsx`
- Add `isChatOpen` prop to interface
- Make orb smaller: `w-24 h-24` instead of `w-48 h-48`
- Adjust inner element sizes proportionally
- Conditionally apply animations only when `!isChatOpen`
- Adjust text size from `text-2xl` to `text-lg`

### 3. `src/components/ai-assistant/ChatPanel.tsx`
- Change width from `sm:w-[400px]` to `w-[25vw] min-w-[320px] max-w-[400px]`

---

## Visual Layout

```text
Before:
+--------------------------------------------------+
|  Header                                           |
+--------------------------------------------------+
|                                                   |
|                   [AI ORB]                        |
|                  (centered)                       |
|                                                   |
|              [Insight Categories]                 |
|                                                   |
|              [Opportunity Cards]                  |
|                                                   |
+--------------------------------------------------+

After:
+--------------------------------------------------+
|  Header                                           |
+--------------------------------------------------+
|                                                   |
|              [Insight Categories]                 |
|                   (centered)                      |
|                                                   |
|              [Opportunity Cards]                  |
|                                                   |
|                                        [AI ORB]  |
|                                        (fixed)   |
+--------------------------------------------------+
```

---

## Technical Details

### Theme Switching Logic
- Use `useRef` to persist the previous theme value across re-renders
- The cleanup function in `useEffect` runs when navigating away from the page
- Handle edge case where theme might be "system" by restoring it exactly

### Animation Control
The orb has three animated layers:
1. Outer ping ring: `animate-ping` (3s duration)
2. Middle pulse ring: `animate-pulse`
3. Inner spin ring: `animate-spin-slow`

All three will be conditionally applied only when `!isChatOpen`:
```typescript
{!isChatOpen && (
  <>
    <div className="absolute inset-0 rounded-full ... animate-ping" />
    <div className="absolute inset-2 rounded-full ... animate-pulse" />
    <div className="absolute inset-4 rounded-full ... animate-spin-slow" />
  </>
)}
```

### Responsive Considerations
- Quarter-width (25vw) on desktop screens
- Minimum 320px ensures usability on smaller screens
- Maximum 400px prevents excessively wide panel on ultra-wide screens

---

## Expected Outcome

1. When entering `/ai-assistant`, the page forces dark mode
2. When leaving the page, the previous theme is restored
3. The AI orb is smaller and fixed in the bottom-right corner
4. The orb pulses/animates when the chat is closed
5. Clicking the orb opens a quarter-width chat panel
6. While the chat is open, the orb stops all pulsating animations
7. Closing the chat restores the pulsating animations

