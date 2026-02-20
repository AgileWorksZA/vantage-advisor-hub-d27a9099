

## Remove Rounded Corners and Add Settings to Client App Header

### Changes

#### 1. Remove rounded corners from phone frame (App.tsx)

Both the Adviser App and Client App desktop frames currently use `rounded-[40px]`. This will be changed to `rounded-none` (no rounded corners) for both modes.

#### 2. Add Settings icon to Client App header (ClientApp.tsx)

The Client App header currently shows only a Bell icon and client avatar. A Settings gear icon will be added (matching the Adviser App pattern), which will open a settings menu. The Client App will get a simple settings menu with:
- Dark mode toggle
- Mode switcher (Web / Adviser / Client)
- Sign out option

### Technical Details

**File: `src/App.tsx`**
- Line 57: Change `rounded-[40px]` to `rounded-none` for adviser mode
- Line 74: Change `rounded-[40px]` to `rounded-none` for client mode

**File: `src/components/client-app/ClientApp.tsx`**
- Add `Settings` icon import from lucide-react
- Add `showSettings` state
- Add Settings button next to the Bell icon in the header (before the avatar)
- When settings is tapped, show a `ClientSettingsMenu` (inline component or separate file) with:
  - Dark mode toggle
  - Mode switcher (Web / Adviser / Client)
  - Change client button
  - Sign out

**New file: `src/components/client-app/ClientSettingsMenu.tsx`**
- Similar structure to `MobileSettingsMenu` but simplified for the client context
- Includes: back button header, dark mode toggle, mode switcher (Web/Adviser/Client), change client, sign out
- No jurisdiction or advisor filter (not relevant for client app)

### Files to Create
- `src/components/client-app/ClientSettingsMenu.tsx`

### Files to Edit
- `src/App.tsx` (remove rounded corners)
- `src/components/client-app/ClientApp.tsx` (add settings button and settings screen)

