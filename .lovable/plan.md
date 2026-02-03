

# Add Typewriter Effect to Subtitle (Chained Animation)

## Overview

Add a second typewriter animation to the subtitle "Discover and track opportunities in your client base" that begins only after the main greeting ("Good Evening, Emile") finishes typing.

## Technical Approach

### 1. Add New State Variables

Add state to track the subtitle animation:
- `displayedSubtitle`: The subtitle text currently shown (starts empty)
- `isSubtitleTypingComplete`: Whether the subtitle animation has finished

### 2. Chain the Animations

Create a new `useEffect` that watches `isTypingComplete`. When the greeting finishes typing (`isTypingComplete` becomes `true`), start typing the subtitle character by character.

### 3. Update the JSX

Replace the static subtitle with the animated version, including a cursor that appears during typing.

## Implementation Details

### State Changes (around line 96-98)
```typescript
const [userName, setUserName] = useState("");
const [displayedGreeting, setDisplayedGreeting] = useState("");
const [isTypingComplete, setIsTypingComplete] = useState(false);
const [displayedSubtitle, setDisplayedSubtitle] = useState("");
const [isSubtitleTypingComplete, setIsSubtitleTypingComplete] = useState(false);
```

### New Subtitle Typewriter Effect (after line 182)
```typescript
// Typewriter effect for subtitle (starts after greeting completes)
useEffect(() => {
  if (!isTypingComplete) {
    setDisplayedSubtitle("");
    setIsSubtitleTypingComplete(false);
    return;
  }
  
  const fullSubtitle = "Discover and track opportunities in your client base";
  
  let currentIndex = 0;
  const interval = setInterval(() => {
    if (currentIndex <= fullSubtitle.length) {
      setDisplayedSubtitle(fullSubtitle.slice(0, currentIndex));
      currentIndex++;
    } else {
      setIsSubtitleTypingComplete(true);
      clearInterval(interval);
    }
  }, 30); // Slightly faster than greeting (30ms vs 50ms)
  
  return () => clearInterval(interval);
}, [isTypingComplete]);
```

### JSX Update (line 581)
```tsx
<p className="text-white/50 text-sm">
  {displayedSubtitle}
  {isTypingComplete && !isSubtitleTypingComplete && (
    <span className="animate-pulse ml-0.5">|</span>
  )}
</p>
```

## Animation Flow

```text
1. Page loads → Greeting starts typing ("G", "Go", "Goo"...)
2. Greeting completes → Cursor disappears from greeting
3. Subtitle starts typing → Cursor appears on subtitle
4. Subtitle completes → Cursor disappears entirely
```

## Summary of Changes

| File | Location | Change |
|------|----------|--------|
| `src/pages/AIAssistant.tsx` | Line 98 | Add `displayedSubtitle` and `isSubtitleTypingComplete` state |
| `src/pages/AIAssistant.tsx` | After line 182 | Add new `useEffect` for subtitle typewriter animation |
| `src/pages/AIAssistant.tsx` | Line 581 | Update subtitle JSX to use `displayedSubtitle` with cursor |

## Animation Timing

- **Greeting speed**: 50ms per character (existing)
- **Subtitle speed**: 30ms per character (slightly faster for variety)
- **Cursor**: Blinking `|` moves from greeting to subtitle, then disappears

