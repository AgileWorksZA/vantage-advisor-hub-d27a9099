
-- Add standard_execution_minutes column to tasks
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS standard_execution_minutes integer;

-- Create task_type_standards reference table
CREATE TABLE IF NOT EXISTS public.task_type_standards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  task_type text NOT NULL,
  standard_execution_minutes integer NOT NULL DEFAULT 60,
  sla_hours integer NOT NULL DEFAULT 48,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add unique constraint per user per task type
ALTER TABLE public.task_type_standards ADD CONSTRAINT task_type_standards_user_type_unique UNIQUE (user_id, task_type);

-- Enable RLS
ALTER TABLE public.task_type_standards ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own task type standards"
  ON public.task_type_standards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task type standards"
  ON public.task_type_standards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own task type standards"
  ON public.task_type_standards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own task type standards"
  ON public.task_type_standards FOR DELETE
  USING (auth.uid() = user_id);
