

# Add Typewriter Effect to AI Assistant Greeting

## Overview

Update the greeting in the AI Assistant header to:
1. Not show "Adviser" as a fallback while loading - display an empty string instead
2. Add a typewriter animation that types out the full greeting text character by character

## Technical Approach

### 1. Update Initial State and Loading Logic

**File: `src/pages/AIAssistant.tsx`**

- Change the initial `userName` state from `"Adviser"` to an empty string `""`
- This ensures no placeholder text is shown while the profile is loading

### 2. Create Typewriter Effect State

Add new state variables to manage the typewriter animation:
- `displayedGreeting`: The text currently shown on screen (starts empty)
- `fullGreeting`: The complete greeting text to type out
- `isTypingGreeting`: Whether the typewriter is currently animating

### 3. Implement Typewriter Animation

Create a `useEffect` that:
- Constructs the full greeting string when `userName` changes (e.g., "Good Evening, Emile")
- Only shows "Good Evening" (without comma/name) if userName is still empty
- Types out the greeting one character at a time with a short delay (e.g., 50ms per character)
- Uses `setInterval` to progressively reveal each character

### 4. Update the JSX

Replace the current greeting display:
```tsx
// Before
<h1 className="text-xl font-semibold text-gradient-ai">
  {getGreeting(timeOfDay)}, {userName}
</h1>

// After  
<h1 className="text-xl font-semibold text-gradient-ai">
  {displayedGreeting}
  <span className="animate-pulse">|</span> {/* Optional: blinking cursor */}
</h1>
```

## Implementation Details

### State Changes (around line 97)
```typescript
const [userName, setUserName] = useState("");  // Changed from "Adviser"
const [displayedGreeting, setDisplayedGreeting] = useState("");
const [isTypingComplete, setIsTypingComplete] = useState(false);
```

### Typewriter Effect Hook (new useEffect after line 149)
```typescript
useEffect(() => {
  // Build the full greeting
  const greeting = getGreeting(timeOfDay);
  const fullText = userName ? `${greeting}, ${userName}` : greeting;
  
  // Reset and start typing
  setDisplayedGreeting("");
  setIsTypingComplete(false);
  
  let currentIndex = 0;
  const interval = setInterval(() => {
    if (currentIndex <= fullText.length) {
      setDisplayedGreeting(fullText.slice(0, currentIndex));
      currentIndex++;
    } else {
      setIsTypingComplete(true);
      clearInterval(interval);
    }
  }, 50); // 50ms per character
  
  return () => clearInterval(interval);
}, [userName, timeOfDay]);
```

### JSX Update (line 553-555)
```tsx
<h1 className="text-xl font-semibold text-gradient-ai">
  {displayedGreeting}
  {!isTypingComplete && <span className="animate-pulse ml-0.5">|</span>}
</h1>
```

## Summary of Changes

| File | Change |
|------|--------|
| `src/pages/AIAssistant.tsx` (line 97) | Change `userName` initial state from `"Adviser"` to `""` |
| `src/pages/AIAssistant.tsx` (new state) | Add `displayedGreeting` and `isTypingComplete` state variables |
| `src/pages/AIAssistant.tsx` (new effect) | Add typewriter animation `useEffect` |
| `src/pages/AIAssistant.tsx` (line 553-555) | Update greeting JSX to use `displayedGreeting` with optional blinking cursor |

## Animation Details

- **Speed**: 50ms per character (adjustable)
- **Cursor**: Optional blinking `|` character that disappears when typing completes
- **Re-trigger**: Animation restarts if `userName` or `timeOfDay` changes

