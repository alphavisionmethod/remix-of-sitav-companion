
-- Recovery jobs table for admin support operations
CREATE TABLE public.recovery_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  progress INTEGER NOT NULL DEFAULT 0,
  parameters JSONB DEFAULT '{}',
  result JSONB DEFAULT NULL,
  error TEXT DEFAULT NULL,
  error_stack TEXT DEFAULT NULL,
  is_dry_run BOOLEAN NOT NULL DEFAULT true,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.recovery_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recovery jobs"
  ON public.recovery_jobs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to recovery_jobs"
  ON public.recovery_jobs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_recovery_jobs_user ON public.recovery_jobs(user_id);
CREATE INDEX idx_recovery_jobs_status ON public.recovery_jobs(status);
