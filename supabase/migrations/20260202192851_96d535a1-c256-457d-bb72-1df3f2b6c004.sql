-- Create table for storing user widget layouts
CREATE TABLE public.user_widget_layouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  page_id TEXT NOT NULL,
  layout JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, page_id)
);

-- Enable RLS
ALTER TABLE public.user_widget_layouts ENABLE ROW LEVEL SECURITY;

-- Users can view their own layouts
CREATE POLICY "Users can view their own layouts" 
ON public.user_widget_layouts 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own layouts
CREATE POLICY "Users can create their own layouts" 
ON public.user_widget_layouts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own layouts
CREATE POLICY "Users can update their own layouts" 
ON public.user_widget_layouts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own layouts
CREATE POLICY "Users can delete their own layouts" 
ON public.user_widget_layouts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for auto-updating updated_at
CREATE TRIGGER update_user_widget_layouts_updated_at
  BEFORE UPDATE ON public.user_widget_layouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();