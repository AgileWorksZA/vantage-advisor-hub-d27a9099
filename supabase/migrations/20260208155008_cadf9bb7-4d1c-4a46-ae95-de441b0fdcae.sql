
-- Extend user_settings with timezone, display, notification, and preference columns
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT NULL;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS display_name TEXT DEFAULT NULL;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT TRUE;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS notification_task_reminders BOOLEAN DEFAULT TRUE;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS notification_calendar_reminders BOOLEAN DEFAULT TRUE;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS notification_client_updates BOOLEAN DEFAULT TRUE;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS notification_compliance_alerts BOOLEAN DEFAULT TRUE;
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS date_format TEXT DEFAULT 'dd/MM/yyyy';
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS time_format TEXT DEFAULT '24h';
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS default_calendar_view TEXT DEFAULT 'month';

-- Add timezone column to calendar_events for per-event timezone override
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT NULL;
