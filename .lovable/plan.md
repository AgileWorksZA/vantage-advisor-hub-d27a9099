

## Fix Voice Memo FAB & Notifications to Stay Within Mobile Screen Boundaries

### Problem
The mobile app is rendered inside a fixed-size container (`393x852px` with `overflow-hidden` and `rounded-[40px]`) in `App.tsx`. However, the voice memo FAB and its overlays use CSS `fixed` positioning, which positions elements relative to the **browser viewport** -- not the mobile container. This causes them to appear outside the phone frame.

Similarly, toast notifications (sonner) render at the viewport level and overflow the mobile container.

### Solution

#### 1. `src/components/mobile/MobileVoiceMemo.tsx` -- Switch from `fixed` to `absolute` positioning

The parent container in `MobileApp.tsx` already has `relative` on its root div. Change all `fixed` classes to `absolute` so they position within the mobile container:

- **Idle FAB** (line 254): Change `fixed bottom-[4.5rem] right-4 z-20` to `absolute bottom-[4.5rem] right-4 z-20` -- this places the mic button above the bottom nav bar (which is `h-14` = 3.5rem, so `4.5rem` sits just above the AI tab icon on the right)
- **Recording overlay** (line 145): Change `fixed inset-0 z-50` to `absolute inset-0 z-50`
- **Done overlay** (line 184): Change `fixed inset-0 z-50` to `absolute inset-0 z-50`

#### 2. `src/components/mobile/MobileApp.tsx` -- Add mobile-scoped toast notifications

Replace the header bell icon with a proper mobile notification system that renders **inside** the mobile container:

- Create a notification toast/banner component that shows above the bottom nav bar using `absolute` positioning
- Notifications appear as compact banners with status icons:
  - Success/Done: green check icon
  - Warning: amber warning icon  
  - Error: red alert icon
- Auto-dismiss after 4 seconds with manual dismiss option
- Stack up to 3 visible notifications at once
- Position: `absolute bottom-16 left-3 right-3 z-30` (above the nav bar, within the container)

Add a `MobileNotificationBanner` inline component (or section in the JSX) that renders active notification toasts as small cards inside the mobile frame, rather than relying on sonner's viewport-level toasts.

#### 3. `src/components/mobile/MobileApp.tsx` -- Ensure settings screen also uses `relative`

The settings branch div (line 69) already has `relative`, so no change needed there. The voice memo `absolute` positioning will work correctly in both branches.

---

### Files Summary

| File | Action |
|------|--------|
| `src/components/mobile/MobileVoiceMemo.tsx` | Update -- change `fixed` to `absolute` on FAB, recording overlay, and done overlay |
| `src/components/mobile/MobileApp.tsx` | Update -- add mobile-scoped notification banners positioned above nav bar with status icons |

### Technical Notes
- The mobile container div has `relative` and `overflow-hidden`, so `absolute` positioning will be clipped to the phone frame
- The bottom nav is `h-14` (3.5rem) with `sticky bottom-0`, so the FAB at `bottom-[4.5rem]` sits just above it, aligned to the right near the AI tab
- Recording and done overlays use `absolute inset-0` to fill the entire mobile container without escaping it
- Mobile notification banners use a local state array with auto-dismiss timers, independent of sonner toasts
