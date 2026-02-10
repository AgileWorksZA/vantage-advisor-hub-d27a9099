
-- Create advisor-portraits storage bucket (public)
INSERT INTO storage.buckets (id, name, public) VALUES ('advisor-portraits', 'advisor-portraits', true);

-- Allow public read access to advisor portraits
CREATE POLICY "Advisor portraits are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'advisor-portraits');

-- Allow authenticated users to upload portraits
CREATE POLICY "Authenticated users can upload advisor portraits"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'advisor-portraits' AND auth.uid() IS NOT NULL);

-- Create advisor_posts table
CREATE TABLE public.advisor_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  advisor_initials TEXT NOT NULL,
  advisor_name TEXT NOT NULL,
  jurisdiction TEXT NOT NULL DEFAULT 'ZA',
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'text',
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own posts"
ON public.advisor_posts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own posts"
ON public.advisor_posts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
ON public.advisor_posts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
ON public.advisor_posts FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_advisor_posts_updated_at
BEFORE UPDATE ON public.advisor_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
