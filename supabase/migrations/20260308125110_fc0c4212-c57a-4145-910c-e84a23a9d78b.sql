ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS notification_sound_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notification_push_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS notification_critical_only_sound boolean NOT NULL DEFAULT false;