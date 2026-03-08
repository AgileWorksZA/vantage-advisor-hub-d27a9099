

## Add Notification Sound & Browser Push + Settings Controls

### Overview
Add notification sound playback and browser push notification support for critical alerts. Extend the user settings with new preference columns and add corresponding UI controls to the Notifications preferences section.

### 1. Database Migration — Add new columns to `user_settings`

```sql
ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS notification_sound_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notification_push_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notification_critical_only_sound boolean NOT NULL DEFAULT false;
```

### 2. Update `src/hooks/useUserSettings.ts`
- Add `notification_sound_enabled`, `notification_push_enabled`, `notification_critical_only_sound` to the `UserSettings` interface

### 3. Update `src/hooks/useNotifications.ts`
- Import and read user settings from `useUserSettings`
- On new realtime notification arrival:
  - Play a notification sound (using `Audio` API with a bundled chime) if `notification_sound_enabled` is true (and if `critical_only_sound`, only for compliance/task types)
  - Show a browser push notification (via `Notification` API) if `notification_push_enabled` is true and permission is granted
- Add a `requestPushPermission()` helper that calls `Notification.requestPermission()`

### 4. Add notification sound asset
- Create `public/sounds/notification.mp3` — use a short chime tone (generate a simple base64-encoded beep inline as a data URI to avoid needing an actual file)

### 5. Update `src/pages/AccountSettings.tsx` — Notifications section
Add three new toggles after the existing notification toggles:

- **Notification Sound** — "Play a sound when new notifications arrive"
  - Toggle: `notification_sound_enabled`
- **Critical Alerts Only** — "Only play sound for compliance and urgent alerts" (disabled if sound is off)
  - Toggle: `notification_critical_only_sound`
- **Browser Push Notifications** — "Show desktop notifications for new alerts"
  - Toggle: `notification_push_enabled`
  - On enable: call `Notification.requestPermission()`, if denied show a toast explaining how to enable in browser settings

Wire these into the existing `handleSaveNotifications` function.

### 6. Update local state & sync
Add the three new state variables in `AccountSettings.tsx`, sync them from `settings` on load, and include in `handleSaveNotifications`.

### Files to edit

| File | Action |
|------|--------|
| Database migration | Add 3 columns to `user_settings` |
| `src/hooks/useUserSettings.ts` | Extend interface |
| `src/hooks/useNotifications.ts` | Add sound + push logic on realtime events |
| `src/pages/AccountSettings.tsx` | Add 3 new toggles to notifications section |

