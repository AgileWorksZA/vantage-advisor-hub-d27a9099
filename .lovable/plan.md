

## Enhance Notification Dropdown

### Changes

**1. Settings gear icon in dropdown header** (`NotificationDropdown.tsx`)
- Add a `Settings` (gear) icon button next to "Clear All" in the header bar
- Clicking it navigates to `/account-settings` with the notifications section pre-selected (via query param `?section=notifications`)

**2. Notification settings dialog** (`NotificationDropdown.tsx`)
- The gear links to the existing Account Settings > Notifications section which already has toggles for Task Reminders, Calendar Reminders, Client Updates, Compliance Alerts
- Update `AccountSettings.tsx` to read `?section=notifications` from URL and auto-select that section on mount

**3. Task notifications link to task detail** (`NotificationDropdown.tsx`)
- Add `taskId` field to notification data
- For task-type notifications, clicking navigates to `/tasks` (the tasks page where `TaskDetailSheet` can be opened)
- Use `useNavigate` to route on click

**4. Opportunity/type tags on notifications** (`NotificationDropdown.tsx`)
- Add optional `opportunityTag` field to the `Notification` interface (e.g. "Switch", "Quote", "Onboarding", "Review", "Failed Instruction")
- Render a small colored `Badge` next to the title showing the tag
- Use consistent color mapping matching existing opportunity tag patterns

**5. "Show more" footer** (`NotificationDropdown.tsx`)
- Add a sticky footer at bottom of the dropdown showing `Show more (X)` where X is total notification count
- Clicking navigates to a new `/notifications` route

**6. Full Notifications page** (`src/pages/Notifications.tsx`)
- New page showing all notifications in a full-width list grouped by date
- Same styling as dropdown but expanded
- Add route in `App.tsx`

### Files to create/edit

| File | Action |
|------|--------|
| `src/components/dashboard/NotificationDropdown.tsx` | Add gear icon, tags, task linking, show more footer |
| `src/pages/AccountSettings.tsx` | Read `?section=` query param to auto-select section |
| `src/pages/Notifications.tsx` | New full notifications page |
| `src/App.tsx` | Add `/notifications` route |

