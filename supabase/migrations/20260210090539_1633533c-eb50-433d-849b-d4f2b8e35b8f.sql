
-- Add team_name and jurisdiction to team_members
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS team_name text;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS jurisdiction text;

-- Add assigned_to_name to tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assigned_to_name text;
