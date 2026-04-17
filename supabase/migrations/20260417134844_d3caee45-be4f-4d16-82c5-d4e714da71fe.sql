-- ═══════════════════════════════════════════════════════════════
-- Phase 28 — Runbook Operationalization Closure
-- ═══════════════════════════════════════════════════════════════

-- 1) Drill results table
CREATE TABLE IF NOT EXISTS public.runbook_drill_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  runbook_id text NOT NULL,
  user_id uuid,
  executed_at timestamptz NOT NULL DEFAULT now(),
  mode text NOT NULL DEFAULT 'dry-run',
  passed boolean NOT NULL DEFAULT false,
  step_outcomes jsonb NOT NULL DEFAULT '[]'::jsonb,
  duration_ms integer,
  triggered_by text NOT NULL DEFAULT 'manual',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT runbook_drill_mode_check CHECK (mode IN ('dry-run', 'live')),
  CONSTRAINT runbook_drill_trigger_check CHECK (triggered_by IN ('manual', 'scheduled', 'incident', 'ci'))
);

CREATE INDEX IF NOT EXISTS idx_runbook_drill_results_runbook_id
  ON public.runbook_drill_results(runbook_id);
CREATE INDEX IF NOT EXISTS idx_runbook_drill_results_executed_at
  ON public.runbook_drill_results(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_runbook_drill_results_runbook_executed
  ON public.runbook_drill_results(runbook_id, executed_at DESC);

ALTER TABLE public.runbook_drill_results ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view drill results (drills are operational truth, not user data)
CREATE POLICY "Authenticated users can view drill results"
  ON public.runbook_drill_results
  FOR SELECT
  TO authenticated
  USING (true);

-- Admins can insert/update/delete drill results
CREATE POLICY "Admins can manage drill results"
  ON public.runbook_drill_results
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Service role unrestricted (edge function inserts)
CREATE POLICY "Service role can insert drill results"
  ON public.runbook_drill_results
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 2) Extend incidents with runbook linkage
ALTER TABLE public.incidents
  ADD COLUMN IF NOT EXISTS runbook_ids text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS primary_runbook_id text;

CREATE INDEX IF NOT EXISTS idx_incidents_primary_runbook
  ON public.incidents(primary_runbook_id) WHERE primary_runbook_id IS NOT NULL;