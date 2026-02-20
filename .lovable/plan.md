

## Remove Settings Gear from Client App Header

### Overview
Remove the gear/settings icon button from the top-right header area of the Client App. This is a simple UI cleanup.

### Changes

**Edit: `src/components/client-app/ClientApp.tsx`**

- Remove the `Settings` icon from the `lucide-react` import (if not used elsewhere)
- Remove the `showSettings` state and the settings screen render block
- Remove the Settings `Button` from the header's action buttons area
- Remove the `ClientSettingsMenu` import (no longer needed)

The notification bell, avatar/client-switcher button, and all other header elements remain unchanged.

### Technical Details

1. Remove the `Settings` import from lucide-react (line 2)
2. Remove `showSettings` state declaration (line 43)
3. Remove the settings screen conditional block (lines 68-73) that renders `ClientSettingsMenu`
4. Remove the settings gear `Button` in the header (lines 100-102)
5. Remove the `ClientSettingsMenu` import (line 10)

