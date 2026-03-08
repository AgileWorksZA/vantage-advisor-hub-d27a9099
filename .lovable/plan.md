

## Real-Time Persistent Notification System

### Overview
Create a `notifications` table in the database, a shared hook (`useNotifications`) that fetches and subscribes to real-time changes, a seed function to populate initial data, and update both the dropdown and full-page components to use live data instead of hardcoded arrays.

### 1. Database Migration — Create `notifications` table

```sql
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  description text,
  is_read boolean NOT NULL DEFAULT false,
  is_dismissed boolean NOT NULL DEFAULT false,
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  opportunity_tag text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notifications"
  ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

### 2. New Hook — `src/hooks/useNotifications.ts`
- Fetch notifications where `is_dismissed = false`, ordered by `created_at desc`
- Subscribe to realtime `postgres_changes` on the `notifications` table filtered by user_id
- Expose: `notifications`, `unreadCount`, `markAsRead(id)`, `dismiss(id)`, `markAllRead()`, `clearAll()`
- Each mutation calls supabase update/delete and optimistically updates local state

### 3. Seed Function — `supabase/functions/seed-notifications/index.ts`
- Insert the same 9 sample notifications (matching current hardcoded data) for the authenticated user
- Register in `supabase/config.toml`

### 4. Update `NotificationDropdown.tsx`
- Replace `useState(initialNotifications)` with `useNotifications()`
- Wire dismiss/clear/markRead to the hook's mutation functions
- Remove hardcoded `initialNotifications` array

### 5. Update `Notifications.tsx` (full page)
- Replace `useState(allNotifications)` with `useNotifications()`
- Wire all actions (dismiss, clear all, mark all read) to hook mutations
- Remove hardcoded `allNotifications` array

### Files to create/edit

| File | Action |
|------|--------|
| Database migration | Create `notifications` table with RLS + realtime |
| `src/hooks/useNotifications.ts` | New shared hook with realtime subscription |
| `supabase/functions/seed-notifications/index.ts` | New seed function |
| `supabase/config.toml` | Register seed function |
| `src/components/dashboard/NotificationDropdown.tsx` | Use hook instead of hardcoded data |
| `src/pages/Notifications.tsx` | Use hook instead of hardcoded data |

