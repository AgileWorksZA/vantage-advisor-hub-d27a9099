

## Reformat All Mobile Notifications to Fit Mobile Screen

### Problem
Several mobile components use the standard `useToast` / `toast()` system (from shadcn), which renders toast notifications at the viewport level -- outside the 393x852 phone frame. Only `MobileNotificationBanner` correctly positions notifications inside the mobile container above the bottom navigation bar.

### Solution
Replace all `useToast` / `toast()` calls across mobile components with the existing `showMobileNotification()` helper, which dispatches events to `MobileNotificationBanner`. This banner already:
- Positions notifications above the bottom nav bar (`absolute bottom-16`)
- Shows status icons (CheckCircle2 for success, AlertTriangle for warning, XCircle for error)
- Auto-dismisses after 4 seconds
- Supports up to 3 stacked notifications

### Files to Update

| File | Current Usage | Replacement |
|------|--------------|-------------|
| `src/components/mobile/MobileVoiceMemo.tsx` | `toast({ title: "Task created" })` | `showMobileNotification("success", "Task created", action.text)` |
| `src/components/mobile/MobileMeetingScreen.tsx` | `toast({ title: "Task created" })` | `showMobileNotification("success", "Task created", title)` |
| `src/components/mobile/meeting-steps/FollowUpsStep.tsx` | `toast({ title: "Task resolved" })` | `showMobileNotification("success", "Task resolved", taskTitle)` |
| `src/components/mobile/meeting-steps/MobileComposeMessageSheet.tsx` | `toast({ title: "Message sent" })` and `toast({ title: "Failed to send", variant: "destructive" })` | `showMobileNotification("success", "Message sent", ...)` and `showMobileNotification("error", "Failed to send")` |
| `src/components/mobile/meeting-steps/RescheduleDialog.tsx` | `toast({ title: "Meeting rescheduled" })` | `showMobileNotification("success", "Meeting rescheduled", ...)` |
| `src/components/mobile/meeting-steps/ScheduleFollowUpPanel.tsx` | `toast({ title: "Select at least one task", variant: "destructive" })` | `showMobileNotification("error", "Select at least one task")` |

### Changes Per File

For each file:
1. Remove the `import { useToast } from "@/hooks/use-toast"` import
2. Add `import { showMobileNotification } from "./MobileNotificationBanner"` (adjusting path as needed for nested files: `"../MobileNotificationBanner"`)
3. Remove the `const { toast } = useToast()` line
4. Replace each `toast({ title, description, variant })` call:
   - `variant: "destructive"` maps to `showMobileNotification("error", title, description)`
   - All other calls map to `showMobileNotification("success", title, description)`

### No Changes Needed
- `MobileNotificationBanner.tsx` -- already correctly implemented with icons and positioning
- `MobileApp.tsx` -- already renders `MobileNotificationBanner` in the correct location

