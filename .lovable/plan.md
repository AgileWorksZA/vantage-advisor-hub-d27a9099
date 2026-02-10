

## Voice Memo FAB: Settings Screen Visibility + Toggle Control

### Overview
Add the voice memo floating mic button to the Settings screen and provide a toggle in Settings to show/hide it across all mobile screens. The FAB is visible by default everywhere until the user hides it.

---

### Changes by File

#### 1. `src/components/mobile/MobileSettingsMenu.tsx`

Add a new menu item with a `Mic` icon and `Switch` toggle for "Voice Memo Button", following the same pattern as the Dark Mode and AI Assistant toggles:

- Read initial value from `localStorage` key `vantage-voice-memo-visible` (default: `true` if not set)
- On toggle: update localStorage and dispatch a `CustomEvent("voice-memo-toggle")` so `MobileApp` reacts in real-time
- Place between the "AI Assistant" and "Sign Out" menu items
- Import `Mic` from `lucide-react`

#### 2. `src/components/mobile/MobileApp.tsx`

- Add state `voiceMemoVisible` initialised from `localStorage` key `vantage-voice-memo-visible` (default `true`)
- Listen for the `voice-memo-toggle` custom event to update state in real-time
- Conditionally render `<MobileVoiceMemo />` only when `voiceMemoVisible` is `true`
- Also render `<MobileVoiceMemo />` inside the Settings branch so the FAB appears on the settings screen too (also gated by `voiceMemoVisible`)

#### 3. `src/components/mobile/MobileVoiceMemo.tsx`

No changes needed -- the component remains as-is; visibility is controlled by the parent.

---

### localStorage Key

| Key | Default | Values |
|-----|---------|--------|
| `vantage-voice-memo-visible` | `"true"` (shown) | `"true"` / `"false"` |

### Event Flow

```text
MobileSettingsMenu
  |-- Toggle switch clicked
  |-- localStorage updated
  |-- CustomEvent("voice-memo-toggle", { detail: { visible } }) dispatched
  |
MobileApp
  |-- Listens for "voice-memo-toggle" event
  |-- Updates voiceMemoVisible state
  |-- Conditionally renders <MobileVoiceMemo /> on all screens including Settings
```

### Files Summary

| File | Action |
|------|--------|
| `src/components/mobile/MobileSettingsMenu.tsx` | Update -- add Voice Memo toggle with Mic icon and Switch |
| `src/components/mobile/MobileApp.tsx` | Update -- add visibility state, event listener, conditional rendering on settings + main screens |
