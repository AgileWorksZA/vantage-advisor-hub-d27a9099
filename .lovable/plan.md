

## Make Notification Dropdown Items Clickable with Task Navigation + Limit to 5

### Changes — `src/components/dashboard/NotificationDropdown.tsx`

1. **Navigate to task detail on click**: Update `handleNotificationClick` so that clicking a task notification navigates to `/tasks?taskId={task_id}` instead of just `/tasks`. This allows the Tasks page to auto-open the TaskDetailSheet showing the timeline.

2. **Limit dropdown to 5 notifications**: Instead of showing all notifications in the dropdown, take only the first 5 (already sorted by date desc from the hook). Show a "Show more" link for the rest.

3. **Remove `line-clamp-2`** from notification description so text isn't cut off. Replace with full visibility of title and description.

4. **Widen popover** slightly (from `w-80` to `w-96`) to give more room for notification text.

### Changes — `src/pages/Tasks.tsx`

1. **Read `taskId` from URL query params** on mount. If present, find the matching task and auto-open `TaskDetailSheet` with the "activity" tab selected so the timeline is immediately visible.

### Changes — `src/pages/Notifications.tsx`

1. **Same navigation pattern**: Update `handleNotificationClick` to navigate to `/tasks?taskId={task_id}` for task notifications.

### Summary

| File | Change |
|------|--------|
| `NotificationDropdown.tsx` | Limit to 5 items, remove text truncation, navigate with taskId param |
| `Tasks.tsx` | Read taskId query param, auto-open TaskDetailSheet on activity tab |
| `Notifications.tsx` | Navigate with taskId param for task notifications |

