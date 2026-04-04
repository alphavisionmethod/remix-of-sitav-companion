CREATE TABLE IF NOT EXISTS public.metrics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  domain text NOT NULL,
  metric_name text NOT NULL,
  metric_type text NOT NULL DEFAULT 'gauge',
  value numeric NOT NULL DEFAULT 0,
  tags jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.metrics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own metrics" ON public.metrics_snapshots
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_metrics_snapshots_domain ON public.metrics_snapshots(domain);
CREATE INDEX IF NOT EXISTS idx_metrics_snapshots_name ON public.metrics_snapshots(metric_name);
CREATE INDEX IF NOT EXISTS idx_metrics_snapshots_recorded ON public.metrics_snapshots(recorded_at DESC);