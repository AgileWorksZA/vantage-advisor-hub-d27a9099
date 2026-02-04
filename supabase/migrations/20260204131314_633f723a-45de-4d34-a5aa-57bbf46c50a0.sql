-- Create email_settings table for user email configuration
CREATE TABLE public.email_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('gmail', 'microsoft', 'imap')),
  email_address TEXT NOT NULL,
  fetch_mode TEXT NOT NULL DEFAULT 'task_pool' CHECK (fetch_mode IN ('inbox', 'task_pool')),
  oauth_token TEXT,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint - one active setting per user
CREATE UNIQUE INDEX email_settings_user_active_idx ON public.email_settings (user_id) WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_settings
CREATE POLICY "Users can view their own email settings"
ON public.email_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email settings"
ON public.email_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email settings"
ON public.email_settings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email settings"
ON public.email_settings FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_email_settings_updated_at
BEFORE UPDATE ON public.email_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create email_clients junction table for multiple clients per email
CREATE TABLE public.email_clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID NOT NULL REFERENCES public.emails(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email_id, client_id)
);

-- Enable RLS
ALTER TABLE public.email_clients ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_clients
CREATE POLICY "Users can view their own email_clients"
ON public.email_clients FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email_clients"
ON public.email_clients FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email_clients"
ON public.email_clients FOR DELETE
USING (auth.uid() = user_id);