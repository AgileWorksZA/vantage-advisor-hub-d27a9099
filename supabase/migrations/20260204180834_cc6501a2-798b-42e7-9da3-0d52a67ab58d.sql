-- Create junction table for linking emails to tasks
CREATE TABLE email_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  email_id UUID NOT NULL REFERENCES emails(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  is_linked BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(email_id, task_id)
);

-- Enable Row Level Security
ALTER TABLE email_tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own email_tasks
CREATE POLICY "Users can manage their own email_tasks"
  ON email_tasks FOR ALL USING (auth.uid() = user_id);

-- Create index for efficient lookups
CREATE INDEX idx_email_tasks_email_id ON email_tasks(email_id);
CREATE INDEX idx_email_tasks_task_id ON email_tasks(task_id);
CREATE INDEX idx_email_tasks_user_id ON email_tasks(user_id);

-- Create updated_at trigger
CREATE TRIGGER update_email_tasks_updated_at
  BEFORE UPDATE ON email_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();