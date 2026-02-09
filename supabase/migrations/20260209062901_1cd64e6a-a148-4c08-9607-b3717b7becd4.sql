
CREATE TABLE public.client_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  viewed_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast lookups by user, ordered by recency
CREATE INDEX idx_client_views_user_recent ON public.client_views (user_id, viewed_at DESC);

-- Unique constraint to allow upsert (one row per user+client, updated on re-view)
CREATE UNIQUE INDEX idx_client_views_user_client ON public.client_views (user_id, client_id);

-- Enable RLS
ALTER TABLE public.client_views ENABLE ROW LEVEL SECURITY;

-- Users can only see/manage their own views
CREATE POLICY "Users can view own client views" ON public.client_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own client views" ON public.client_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own client views" ON public.client_views
  FOR UPDATE USING (auth.uid() = user_id);
