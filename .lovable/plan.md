

## Add Voice-to-Adviser Chat in Client App

### Overview

Add a microphone FAB (floating action button) to the Client App that opens a full-screen voice chat interface. The client speaks, speech is transcribed to text and displayed as chat bubbles, and contextual action suggestions appear at the bottom based on what was said. Tapping an action either delivers a canned response or offers to message the adviser.

### User Flow

1. Client sees a microphone FAB above the bottom tab bar (visible on all tabs)
2. Tapping it opens a full-screen chat view with a back arrow header ("Talk to Adviser")
3. A mic button at the bottom starts browser SpeechRecognition
4. Transcribed text appears as client chat bubbles in real time
5. When recording stops, the system analyses the transcript and shows suggested action chips at the bottom (e.g. "Check portfolio performance", "Schedule a meeting", "Message adviser about risk cover")
6. Tapping a suggestion either:
   - Shows an inline AI-style response (for informational queries)
   - Opens a pre-filled message to send to the adviser (for actionable items)

### Technical Details

**New file: `src/components/client-app/ClientVoiceChat.tsx`**

A full-screen component with:
- **Header**: Back arrow + "Talk to Adviser" title
- **Chat area**: ScrollArea showing transcribed speech as client bubbles and system/adviser responses as left-aligned bubbles
- **Suggested actions bar**: Horizontal scrollable chips at the bottom, generated from keyword matching in the transcript (reusing the `extractActions` pattern from `MobileVoiceMemo.tsx` but with client-relevant keywords like "portfolio", "meeting", "risk", "retirement", "tax", "statement")
- **Input area**: Large centered mic button that toggles recording on/off. Uses browser `SpeechRecognition` API (same pattern as `MobileVoiceMemo.tsx`)
- **Action handling**:
  - Informational actions (e.g. "Check portfolio") show a simulated adviser response in the chat
  - Communication actions (e.g. "Message adviser") switch to the Messages tab with a pre-filled draft

Action keyword mapping (client-context):
- "portfolio", "performance", "returns" -> "portfolio" type -> Shows summary response
- "meeting", "schedule", "appointment" -> "meeting" type -> Offers to message adviser
- "risk", "cover", "insurance" -> "insurance" type -> Shows info + message option
- "statement", "document", "report" -> "document" type -> Offers to check documents
- "tax", "retirement", "planning" -> "planning" type -> Offers to message adviser

**Edit: `src/components/client-app/ClientApp.tsx`**

- Import `ClientVoiceChat`
- Add `showVoiceChat` state (boolean, default false)
- Add a mic FAB button positioned `absolute bottom-[4.5rem] right-4 z-20` (same pattern as adviser app's `MobileVoiceMemo`)
- When `showVoiceChat` is true, render `ClientVoiceChat` as a full-screen overlay
- Pass a callback so voice chat can switch to Messages tab with a draft message (via `setActiveTab("messages")`)

### Files to Create
- `src/components/client-app/ClientVoiceChat.tsx`

### Files to Edit
- `src/components/client-app/ClientApp.tsx` (add FAB + voice chat state)

