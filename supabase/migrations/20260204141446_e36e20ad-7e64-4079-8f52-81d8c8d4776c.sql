-- Create email_attachments table
CREATE TABLE public.email_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_id UUID NOT NULL REFERENCES public.emails(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  content_type TEXT DEFAULT 'application/pdf',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create direct_message_attachments table
CREATE TABLE public.direct_message_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES public.direct_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER DEFAULT 0,
  content_type TEXT DEFAULT 'application/pdf',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.email_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.direct_message_attachments ENABLE ROW LEVEL SECURITY;

-- RLS policies for email_attachments
CREATE POLICY "Users can view their own email attachments"
ON public.email_attachments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email attachments"
ON public.email_attachments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email attachments"
ON public.email_attachments
FOR DELETE
USING (auth.uid() = user_id);

-- RLS policies for direct_message_attachments
CREATE POLICY "Users can view their own message attachments"
ON public.direct_message_attachments
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own message attachments"
ON public.direct_message_attachments
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own message attachments"
ON public.direct_message_attachments
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_email_attachments_email_id ON public.email_attachments(email_id);
CREATE INDEX idx_email_attachments_user_id ON public.email_attachments(user_id);
CREATE INDEX idx_direct_message_attachments_message_id ON public.direct_message_attachments(message_id);
CREATE INDEX idx_direct_message_attachments_user_id ON public.direct_message_attachments(user_id);