
# Fix Task Detail Sheet Message Button 404 Error

## Problem

The "Message" button on the Task Detail Sheet navigates to the wrong URL, causing a 404 error.

| Current Route | Correct Route |
|--------------|---------------|
| `/compose-email?task_id=...` | `/email/compose?task_id=...` |

## Root Cause

In `src/components/tasks/TaskDetailSheet.tsx`, line 132 shows:

```typescript
const handleSendMessage = () => {
  const clientIds = taskClients.map((c) => c.client_id).join(",");
  navigate(`/compose-email?task_id=${task.id}&clients=${clientIds}`);
};
```

This route does not exist. Looking at `src/App.tsx`, the correct route is:

```typescript
<Route path="/email/compose" element={<ComposeEmail />} />
```

## Fix

Update the navigation path from `/compose-email` to `/email/compose`:

```typescript
const handleSendMessage = () => {
  const clientIds = taskClients.map((c) => c.client_id).join(",");
  navigate(`/email/compose?task_id=${task.id}&clients=${clientIds}`);
};
```

## File to Modify

| File | Change |
|------|--------|
| `src/components/tasks/TaskDetailSheet.tsx` | Line 132: Change `/compose-email` to `/email/compose` |

## Expected Behavior

After the fix:
1. Click "Message" button on Task Detail Sheet
2. Navigate to `/email/compose` with task_id and client IDs as query parameters
3. Email compose screen loads correctly with task context
