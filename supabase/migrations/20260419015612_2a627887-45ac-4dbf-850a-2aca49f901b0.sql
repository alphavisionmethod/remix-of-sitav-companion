-- ═══════════════════════════════════════════════════════
-- AI Runtime Truth Closure — Phase 1 Schema
-- ═══════════════════════════════════════════════════════

-- Table 1: nightly run results
CREATE TABLE IF NOT EXISTS public.ai_runtime_nightly_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id TEXT NOT NULL UNIQUE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('pass','fail','degraded','running')),
  -- Per-sub-check booleans
  provider_calls_ok BOOLEAN NOT NULL DEFAULT false,
  receipts_verified BOOLEAN NOT NULL DEFAULT false,
  ledger_verified BOOLEAN NOT NULL DEFAULT false,
  fallback_verified BOOLEAN NOT NULL DEFAULT false,
  budget_enforced BOOLEAN NOT NULL DEFAULT false,
  -- Failure context
  failure_class TEXT,
  failure_detail TEXT,
  -- Cost & evidence
  total_invocations INT NOT NULL DEFAULT 0,
  estimated_cost_usd NUMERIC(10,6) NOT NULL DEFAULT 0,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  triggered_by TEXT NOT NULL DEFAULT 'cron',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_runtime_nightly_runs_started_at
  ON public.ai_runtime_nightly_runs (started_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_runtime_nightly_runs_status
  ON public.ai_runtime_nightly_runs (status, started_at DESC);

ALTER TABLE public.ai_runtime_nightly_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read nightly runs"
  ON public.ai_runtime_nightly_runs
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Service role bypasses RLS automatically; no insert policy needed for clients.

-- Table 2: streak singleton
CREATE TABLE IF NOT EXISTS public.ai_runtime_streak_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  singleton_key TEXT NOT NULL UNIQUE DEFAULT 'global',
  current_streak_days INT NOT NULL DEFAULT 0,
  longest_streak_days INT NOT NULL DEFAULT 0,
  streak_started_at TIMESTAMPTZ,
  last_pass_at TIMESTAMPTZ,
  last_fail_at TIMESTAMPTZ,
  last_failure_class TEXT,
  last_run_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_runtime_streak_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read streak state"
  ON public.ai_runtime_streak_state
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

INSERT INTO public.ai_runtime_streak_state (singleton_key, current_streak_days)
VALUES ('global', 0)
ON CONFLICT (singleton_key) DO NOTHING;

-- Table 3: failure alerts
CREATE TABLE IF NOT EXISTS public.ai_runtime_failure_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES public.ai_runtime_nightly_runs(run_id) ON DELETE CASCADE,
  failure_class TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'high' CHECK (severity IN ('low','medium','high','critical')),
  summary TEXT NOT NULL,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  acknowledged_at TIMESTAMPTZ,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledgment_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_runtime_failure_alerts_unack
  ON public.ai_runtime_failure_alerts (created_at DESC)
  WHERE acknowledged_at IS NULL;

ALTER TABLE public.ai_runtime_failure_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read failure alerts"
  ON public.ai_runtime_failure_alerts
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can acknowledge failure alerts"
  ON public.ai_runtime_failure_alerts
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Trigger function: recompute streak + auto-create alert on failure
CREATE OR REPLACE FUNCTION public.handle_ai_runtime_nightly_run_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_state record;
  v_new_streak int;
BEGIN
  IF NEW.status = 'running' THEN
    RETURN NEW;
  END IF;

  SELECT * INTO v_state FROM public.ai_runtime_streak_state WHERE singleton_key = 'global';

  IF NEW.status = 'pass' THEN
    v_new_streak := COALESCE(v_state.current_streak_days, 0) + 1;
    UPDATE public.ai_runtime_streak_state
    SET current_streak_days = v_new_streak,
        longest_streak_days = GREATEST(longest_streak_days, v_new_streak),
        streak_started_at = COALESCE(streak_started_at, NEW.started_at),
        last_pass_at = NEW.completed_at,
        last_run_id = NEW.run_id,
        updated_at = now()
    WHERE singleton_key = 'global';
  ELSE
    -- fail or degraded → reset streak + create alert
    UPDATE public.ai_runtime_streak_state
    SET current_streak_days = 0,
        streak_started_at = NULL,
        last_fail_at = NEW.completed_at,
        last_failure_class = NEW.failure_class,
        last_run_id = NEW.run_id,
        updated_at = now()
    WHERE singleton_key = 'global';

    INSERT INTO public.ai_runtime_failure_alerts (
      run_id, failure_class, severity, summary, evidence
    ) VALUES (
      NEW.run_id,
      COALESCE(NEW.failure_class, 'unknown'),
      CASE WHEN NEW.status = 'fail' THEN 'high' ELSE 'medium' END,
      COALESCE(NEW.failure_detail, format('Nightly run %s ended with status %s', NEW.run_id, NEW.status)),
      NEW.evidence
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ai_runtime_nightly_run_insert ON public.ai_runtime_nightly_runs;
CREATE TRIGGER trg_ai_runtime_nightly_run_insert
  AFTER INSERT ON public.ai_runtime_nightly_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_ai_runtime_nightly_run_insert();

-- Admin RPC: acknowledge a failure alert
CREATE OR REPLACE FUNCTION public.acknowledge_ai_runtime_failure_alert(_alert_id UUID, _notes TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
BEGIN
  IF v_uid IS NULL OR NOT public.has_role(v_uid, 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;

  UPDATE public.ai_runtime_failure_alerts
  SET acknowledged_at = now(),
      acknowledged_by = v_uid,
      acknowledgment_notes = _notes
  WHERE id = _alert_id AND acknowledged_at IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'alert_not_found_or_already_acknowledged');
  END IF;

  RETURN jsonb_build_object('ok', true, 'alert_id', _alert_id, 'acknowledged_by', v_uid);
END;
$$;

-- Read RPC: streak summary (admin-gated)
CREATE OR REPLACE FUNCTION public.get_ai_runtime_streak_summary()
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_state record;
  v_recent jsonb;
  v_unack_count int;
  v_classification text;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO v_state FROM public.ai_runtime_streak_state WHERE singleton_key = 'global';

  SELECT count(*) INTO v_unack_count
    FROM public.ai_runtime_failure_alerts
    WHERE acknowledged_at IS NULL;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'run_id', run_id,
    'status', status,
    'started_at', started_at,
    'failure_class', failure_class,
    'provider_calls_ok', provider_calls_ok,
    'receipts_verified', receipts_verified,
    'ledger_verified', ledger_verified,
    'fallback_verified', fallback_verified,
    'budget_enforced', budget_enforced
  ) ORDER BY started_at DESC), '[]'::jsonb)
  INTO v_recent
  FROM (
    SELECT * FROM public.ai_runtime_nightly_runs
    WHERE started_at >= now() - interval '30 days'
    ORDER BY started_at DESC
    LIMIT 30
  ) t;

  v_classification := CASE
    WHEN v_unack_count > 0 THEN 'red'
    WHEN COALESCE(v_state.current_streak_days, 0) >= 7 THEN 'green'
    WHEN COALESCE(v_state.current_streak_days, 0) >= 3 THEN 'yellow'
    ELSE 'building'
  END;

  RETURN jsonb_build_object(
    'current_streak_days', COALESCE(v_state.current_streak_days, 0),
    'longest_streak_days', COALESCE(v_state.longest_streak_days, 0),
    'streak_started_at', v_state.streak_started_at,
    'last_pass_at', v_state.last_pass_at,
    'last_fail_at', v_state.last_fail_at,
    'last_failure_class', v_state.last_failure_class,
    'last_run_id', v_state.last_run_id,
    'unacknowledged_failures', v_unack_count,
    'classification', v_classification,
    'recent_runs', v_recent,
    'generated_at', now()
  );
END;
$$;
