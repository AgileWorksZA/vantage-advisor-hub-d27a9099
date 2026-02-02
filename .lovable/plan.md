
# Close Chat Panel on Outside Click

## Overview
Add functionality to close the chat panel when clicking outside of it by implementing a backdrop overlay.

---

## Solution

Add a semi-transparent backdrop that appears when the chat panel is open. Clicking on the backdrop will close the panel.

---

## Changes

### File: `src/components/ai-assistant/ChatPanel.tsx`

**Add backdrop overlay:**

Wrap the existing panel with a container that includes:
1. A backdrop div that covers the full screen (behind the panel)
2. The backdrop captures clicks and calls `onClose`
3. The panel itself stops click propagation to prevent closing when clicking inside

**Implementation:**

```typescript
return (
  <>
    {/* Backdrop - closes panel when clicked */}
    {isOpen && (
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
    )}
    
    {/* Chat Panel */}
    <div
      className={cn(
        "fixed top-0 right-0 h-full w-[25vw] min-w-[320px] max-w-[400px] glass-panel border-l border-white/10 z-50",
        "transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* ... existing panel content ... */}
    </div>
  </>
);
```

---

## Technical Details

- **Backdrop z-index**: `z-40` (below the panel's `z-50`)
- **Panel z-index**: `z-50` (above the backdrop)
- **Stop propagation**: Added to the panel to prevent clicks inside from bubbling to the backdrop
- **Transparent backdrop**: No visible background, just captures clicks
- **Conditional rendering**: Backdrop only renders when panel is open

---

## Expected Outcome

1. Clicking anywhere outside the chat panel closes it
2. Clicking inside the chat panel (messages, input, buttons) does NOT close it
3. The orb resumes pulsating when the panel closes
4. Smooth transition as panel slides out
