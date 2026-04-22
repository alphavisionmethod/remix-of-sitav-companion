
CREATE TABLE public.portrait_load_failures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  domain text NOT NULL,
  advisor_id text,
  url text NOT NULL,
  error_type text NOT NULL DEFAULT 'load_error',
  retry_count integer NOT NULL DEFAULT 0,
  status_code integer,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.portrait_load_failures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own failures"
  ON public.portrait_load_failures FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own failures"
  ON public.portrait_load_failures FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_portrait_failures_created ON public.portrait_load_failures (created_at DESC);
CREATE INDEX idx_portrait_failures_domain ON public.portrait_load_failures (domain);
