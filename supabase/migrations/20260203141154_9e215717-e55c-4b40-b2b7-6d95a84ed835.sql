-- Create user_settings table for email signatures and preferences
CREATE TABLE public.user_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  email_signature TEXT NULL,
  default_from_primary_adviser BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint on user_id (one settings row per user)
CREATE UNIQUE INDEX user_settings_user_id_unique ON public.user_settings(user_id);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_settings
CREATE POLICY "Users can view their own user_settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own user_settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own user_settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own user_settings" ON public.user_settings FOR DELETE USING (auth.uid() = user_id);

-- Create team_members table for send on behalf functionality
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NULL,
  is_primary_adviser BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for team_members
CREATE POLICY "Users can view their own team_members" ON public.team_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own team_members" ON public.team_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own team_members" ON public.team_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own team_members" ON public.team_members FOR DELETE USING (auth.uid() = user_id);

-- Create communication_campaigns table
CREATE TABLE public.communication_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  channel TEXT NOT NULL DEFAULT 'Email',
  campaign_type TEXT NOT NULL DEFAULT 'Single',
  description TEXT NULL,
  from_team_member_id UUID NULL REFERENCES public.team_members(id),
  from_primary_adviser BOOLEAN NOT NULL DEFAULT false,
  subject TEXT NULL,
  body_html TEXT NULL,
  body_text TEXT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NULL,
  importance TEXT NOT NULL DEFAULT 'Normal',
  request_read_receipt BOOLEAN NOT NULL DEFAULT false,
  is_newsletter BOOLEAN NOT NULL DEFAULT false,
  allow_duplicates BOOLEAN NOT NULL DEFAULT false,
  auto_note_completion BOOLEAN NOT NULL DEFAULT true,
  recipient_filter JSONB NOT NULL DEFAULT '{}'::jsonb,
  recipient_client_ids UUID[] NOT NULL DEFAULT '{}',
  attachment_types TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'Draft',
  sent_at TIMESTAMP WITH TIME ZONE NULL,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- Enable RLS
ALTER TABLE public.communication_campaigns ENABLE ROW LEVEL SECURITY;

-- RLS policies for communication_campaigns
CREATE POLICY "Users can view their own communication_campaigns" ON public.communication_campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own communication_campaigns" ON public.communication_campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own communication_campaigns" ON public.communication_campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own communication_campaigns" ON public.communication_campaigns FOR DELETE USING (auth.uid() = user_id);

-- Create campaign_attachments table
CREATE TABLE public.campaign_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign_id UUID NOT NULL REFERENCES public.communication_campaigns(id) ON DELETE CASCADE,
  attachment_type TEXT NOT NULL,
  file_path TEXT NULL,
  file_name TEXT NULL,
  file_size INTEGER NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaign_attachments ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaign_attachments
CREATE POLICY "Users can view their own campaign_attachments" ON public.campaign_attachments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own campaign_attachments" ON public.campaign_attachments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own campaign_attachments" ON public.campaign_attachments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own campaign_attachments" ON public.campaign_attachments FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for campaign attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('campaign-attachments', 'campaign-attachments', false);

-- Storage policies for campaign-attachments bucket
CREATE POLICY "Users can view their own campaign attachments" ON storage.objects FOR SELECT USING (bucket_id = 'campaign-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload their own campaign attachments" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'campaign-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own campaign attachments" ON storage.objects FOR UPDATE USING (bucket_id = 'campaign-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own campaign attachments" ON storage.objects FOR DELETE USING (bucket_id = 'campaign-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add update triggers
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_communication_campaigns_updated_at BEFORE UPDATE ON public.communication_campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();