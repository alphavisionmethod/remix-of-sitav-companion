
-- Simulation run configs
CREATE TABLE public.alert_simulation_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  interval_ms INTEGER NOT NULL DEFAULT 1000,
  burst_size INTEGER NOT NULL DEFAULT 5,
  severity TEXT NOT NULL DEFAULT 'medium',
  suppression_window_ms INTEGER NOT NULL DEFAULT 10000,
  event_count INTEGER NOT NULL DEFAULT 0,
  dedup_count INTEGER NOT NULL DEFAULT 0,
  suppress_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.alert_simulation_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own simulation runs"
  ON public.alert_simulation_runs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own simulation runs"
  ON public.alert_simulation_runs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own simulation runs"
  ON public.alert_simulation_runs FOR DELETE
  USING (auth.uid() = user_id);

-- Link dedup log entries to a simulation run
ALTER TABLE public.alert_dedup_log
  ADD COLUMN simulation_run_id UUID REFERENCES public.alert_simulation_runs(id) ON DELETE SET NULL;
