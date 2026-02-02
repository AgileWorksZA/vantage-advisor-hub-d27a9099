-- Create transcription status enum
CREATE TYPE transcription_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Create meeting_recordings table
CREATE TABLE public.meeting_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  calendar_event_id UUID REFERENCES public.calendar_events(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  recording_url TEXT,
  duration_seconds INTEGER,
  transcription TEXT,
  transcription_status transcription_status NOT NULL DEFAULT 'pending',
  ai_summary JSONB DEFAULT '{}'::jsonb,
  ai_action_items JSONB DEFAULT '[]'::jsonb,
  recording_started_at TIMESTAMP WITH TIME ZONE,
  recording_ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.meeting_recordings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own meeting_recordings"
ON public.meeting_recordings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meeting_recordings"
ON public.meeting_recordings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meeting_recordings"
ON public.meeting_recordings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meeting_recordings"
ON public.meeting_recordings
FOR DELETE
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_meeting_recordings_user_id ON public.meeting_recordings(user_id);
CREATE INDEX idx_meeting_recordings_client_id ON public.meeting_recordings(client_id);
CREATE INDEX idx_meeting_recordings_calendar_event_id ON public.meeting_recordings(calendar_event_id);
CREATE INDEX idx_meeting_recordings_transcription_status ON public.meeting_recordings(transcription_status);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_meeting_recordings_updated_at
BEFORE UPDATE ON public.meeting_recordings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for meeting recordings
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('meeting-recordings', 'meeting-recordings', false, 104857600);

-- Storage policies for meeting-recordings bucket
CREATE POLICY "Users can upload their own recordings"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'meeting-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own recordings"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'meeting-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own recordings"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'meeting-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own recordings"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'meeting-recordings' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);