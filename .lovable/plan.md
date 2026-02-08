

# Redesign AI Chatbot to Match Reference Design

## Overview

Redesign the global AI chatbot (currently a dark glassmorphism sidebar panel triggered by an orb) to match the Lovable CustomerHub chatbot design. The new design features:

- A **simple circular chat bubble button** (dark circle with speech bubble icon) in the bottom-right corner
- A **popup chat widget** (not a full-height sidebar) that appears above the button
- A **blurred backdrop** overlay on the background when the chat is expanded
- **Light/dark mode** support using the app's theme system
- A **"Docs" link** in the header that opens a Vantage help page
- **Two display modes**: compact popup and expanded/maximised view
- **Message timestamps** on each message
- **Avatar icons** next to assistant messages
- **Suggested prompts** displayed as pill buttons below messages

---

## Design Analysis (from reference images)

### Trigger Button
- Simple dark circle (~48-56px), no gradient orb
- Contains a white speech/chat bubble icon (like `MessageCircle` from Lucide)
- No particles, no "AI" text, no 3D effects

### Chat Widget (Compact Mode)
- Appears as a floating card/popup anchored to the bottom-right
- Approximate size: ~400px wide, ~550px tall
- Rounded corners with subtle border and shadow
- **Header**: Logo/avatar + "Vantage AI Assistant" + "Powered by Vantage AI" subtitle + Docs link (external icon) + expand button + close (X) button
- **Messages area**: Scrollable with assistant and user bubbles
  - Assistant messages: left-aligned, light gray background (light mode) / dark bg (dark mode), with small Vantage logo avatar
  - User messages: right-aligned, dark/black background with white text
  - Each message shows a timestamp (e.g., "3:58 PM")
- **Suggested prompts**: Displayed as bordered pill buttons below the last message (not centered/wrapped, but in a vertical list or horizontal row)
- **Input area**: Bottom bar with text input and send button (circular dark button with paper plane icon)

### Chat Widget (Expanded Mode)
- Expands to a larger centered overlay (modal-like, ~700px wide, ~80vh tall)
- Background is blurred
- Same layout, just bigger

### Background Blur
- When the chat is open (either mode), the page behind gets a subtle blur overlay

### Dark Mode
- Header and background adapt to dark theme
- Message bubbles use appropriate contrast
- Input field uses dark background
- Borders become subtle white/gray

---

## Changes

### 1. Replace `AIOrb.tsx` with a simple chat bubble button

**File: `src/components/ai-assistant/AIOrb.tsx`**

Complete redesign:
- Replace the gradient orb with a clean circular button (~14 wide/height in Tailwind, i.e., 56px)
- Dark background (`bg-foreground` for theme support) with white `MessageCircle` icon
- Subtle shadow for depth
- Hover scale effect
- No particles, no "AI" text
- `ParticleField` import removed (component can stay but won't be used)

### 2. Redesign `ChatPanel.tsx` as a popup widget with two modes

**File: `src/components/ai-assistant/ChatPanel.tsx`**

Major redesign:

**Layout:**
- Change from full-height right sidebar to a floating popup card
- Compact mode: positioned `fixed bottom-24 right-6`, width ~400px, max-height ~550px
- Expanded mode: centered on screen, width ~700px, height ~80vh
- Rounded-2xl corners, shadow-2xl, proper border

**Header:**
- Left: Vantage logo (small, from `src/assets/vantage-logo.png`) + "Vantage AI Assistant" title + "Powered by Vantage AI" subtitle
- Right: "Docs" link (ExternalLink icon + text, opens `/help` or a designated help URL), expand/collapse toggle button (Maximize2/Minimize2 icons), close button (X)

**Messages:**
- Each assistant message gets a small Vantage logo avatar to the left
- Each message shows a timestamp (formatted as "h:mm a" using date-fns)
- User messages: `bg-foreground text-background` (adapts to theme -- dark bubble in light mode, light bubble in dark mode)
- Assistant messages: `bg-muted` with `text-foreground` (adapts to theme)
- Typing indicator keeps the bouncing dots style

**Suggested prompts:**
- Displayed below messages as bordered pill buttons
- Always visible (not just when messages are empty)
- In compact mode: vertical stack; in expanded mode: horizontal row

**Input area:**
- Clean input field with rounded corners and border
- Send button: circular, dark themed (`bg-foreground text-background`)
- Placeholder: "Ask me anything about Vantage..."

**Theme support:**
- Use semantic Tailwind classes (`bg-background`, `bg-foreground`, `text-foreground`, `bg-muted`, `border-border`) instead of hardcoded dark colors
- This automatically adapts to light/dark mode

### 3. Update `GlobalAIChat.tsx` for backdrop blur and state management

**File: `src/components/ai-assistant/GlobalAIChat.tsx`**

- Add `isExpanded` state (boolean) for compact vs expanded mode
- Pass `isExpanded` and `onToggleExpand` to ChatPanel
- When `isChatOpen` is true, render a full-screen backdrop overlay with `backdrop-blur-sm bg-black/20` (light mode) / `bg-black/40` (dark mode)
- Backdrop click closes the chat
- Move the chat button position logic here (bottom-6 right-6, same as now)

### 4. Add a Vantage Help/Docs page

**File: `src/pages/Help.tsx`** (new)

A simple help page for Vantage users with:
- Standard page header (consistent with other legal pages like Disclaimer, Terms)
- Sections covering:
  - Getting Started
  - Dashboard overview
  - Client Management
  - Portfolio Management
  - Communication tools
  - Calendar and Tasks
  - AI Assistant usage
  - Account Settings
  - Contact Support link
- The "Docs" link in the chatbot header will navigate to `/help`

### 5. Register the Help route

**File: `src/App.tsx`**

- Import Help page
- Add `<Route path="/help" element={<Help />} />`

### 6. Add message timestamps

**File: `src/components/ai-assistant/GlobalAIChat.tsx`**

- Extend the `Message` interface to include `timestamp: Date`
- Set `timestamp: new Date()` when creating user and assistant messages

**File: `src/components/ai-assistant/ChatPanel.tsx`**

- Format and display timestamp below each message bubble using `format(message.timestamp, "h:mm a")` from date-fns

---

## Files Summary

| File | Action |
|------|--------|
| `src/components/ai-assistant/AIOrb.tsx` | Redesign as simple chat bubble button |
| `src/components/ai-assistant/ChatPanel.tsx` | Full redesign as popup widget with compact/expanded modes, theme support, Docs link, timestamps, avatars |
| `src/components/ai-assistant/GlobalAIChat.tsx` | Add expanded state, backdrop blur overlay, timestamp support |
| `src/pages/Help.tsx` | **New** -- Vantage help/docs page |
| `src/App.tsx` | Add `/help` route |

---

## Technical Details

### Theme-Aware Color Mapping

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| Chat widget background | `bg-background` (white) | `bg-background` (dark) |
| Widget border | `border-border` | `border-border` |
| User message bubble | `bg-foreground text-background` (black on white text) | `bg-foreground text-background` (light on dark text) |
| Assistant message bubble | `bg-muted text-foreground` (gray) | `bg-muted text-foreground` |
| Input field | `bg-background border-border` | `bg-muted border-border` |
| Send button | `bg-foreground text-background` | `bg-foreground text-background` |
| Header text | `text-foreground` | `text-foreground` |
| Subtitle text | `text-muted-foreground` | `text-muted-foreground` |

### Chat Widget Positioning

Compact mode:
```text
fixed bottom-24 right-6
w-[400px] max-h-[550px]
rounded-2xl shadow-2xl
```

Expanded mode:
```text
fixed inset-0 flex items-center justify-center
inner card: w-[700px] h-[80vh] max-w-[90vw]
rounded-2xl shadow-2xl
```

### Backdrop Blur

```text
fixed inset-0 z-40
bg-black/20 backdrop-blur-sm (light)
dark:bg-black/40 dark:backdrop-blur-sm
transition-opacity duration-300
```

### Docs Link Behavior

The "Docs" link in the chat header opens `/help` in a new tab using `window.open('/help', '_blank')`, keeping the chat open. The link displays as an icon + "Docs" text, styled as a subtle button.

### Message Timestamp Format

Using date-fns `format(timestamp, "h:mm a")` which produces output like "3:58 PM".

