
CREATE TABLE public.user_jurisdictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  jurisdiction_code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, jurisdiction_code)
);

ALTER TABLE public.user_jurisdictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jurisdictions"
  ON public.user_jurisdictions FOR SELECT
  USING (auth.uid() = user_id);
