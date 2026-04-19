
-- Connector Truth Closure: streak + nightly run tables (additive, RLS admin-read)

CREATE TABLE IF NOT EXISTS public.connector_refresh_streak_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL UNIQUE,
  current_streak_days INTEGER NOT NULL DEFAULT 0,
  longest_streak_days INTEGER NOT NULL DEFAULT 0,
  last_pass_at TIMESTAMPTZ,
  last_fail_at TIMESTAMPTZ,
  last_failure_class TEXT,
  streak_started_at TIMESTAMPTZ,
  total_runs_7d INTEGER NOT NULL DEFAULT 0,
  successful_runs_7d INTEGER NOT NULL DEFAULT 0,
  last_run_id TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.connector_refresh_streak_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read connector streak state"
  ON public.connector_refresh_streak_state FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Service role manages connector streak state"
  ON public.connector_refresh_streak_state FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TABLE IF NOT EXISTS public.connector_refresh_nightly_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id TEXT NOT NULL UNIQUE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running','pass','fail','degraded')),
  providers_passed TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  providers_failed TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  providers_reauth_required TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  expiry_pressure_passed BOOLEAN NOT NULL DEFAULT false,
  state_consistency_passed BOOLEAN NOT NULL DEFAULT false,
  failure_summary TEXT,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  triggered_by TEXT NOT NULL DEFAULT 'pg_cron',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_connector_nightly_runs_started ON public.connector_refresh_nightly_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_connector_nightly_runs_status ON public.connector_refresh_nightly_runs(status);

ALTER TABLE public.connector_refresh_nightly_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read connector nightly runs"
  ON public.connector_refresh_nightly_runs FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Service role manages connector nightly runs"
  ON public.connector_refresh_nightly_runs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Streak recompute trigger
CREATE OR REPLACE FUNCTION public.recompute_connector_refresh_streak()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_provider TEXT;
  v_passed BOOLEAN;
  v_state RECORD;
  v_total_7d INT;
  v_success_7d INT;
BEGIN
  IF NEW.status = 'running' THEN
    RETURN NEW;
  END IF;

  FOREACH v_provider IN ARRAY ARRAY['google','microsoft','slack']
  LOOP
    v_passed := v_provider = ANY(NEW.providers_passed);

    SELECT count(*), count(*) FILTER (WHERE v_provider = ANY(providers_passed))
      INTO v_total_7d, v_success_7d
    FROM public.connector_refresh_nightly_runs
    WHERE started_at >= now() - interval '7 days'
      AND status <> 'running';

    SELECT * INTO v_state FROM public.connector_refresh_streak_state WHERE provider = v_provider;

    IF v_state IS NULL THEN
      INSERT INTO public.connector_refresh_streak_state (provider) VALUES (v_provider);
      SELECT * INTO v_state FROM public.connector_refresh_streak_state WHERE provider = v_provider;
    END IF;

    IF v_passed THEN
      UPDATE public.connector_refresh_streak_state
        SET current_streak_days = current_streak_days + 1,
            longest_streak_days = GREATEST(longest_streak_days, current_streak_days + 1),
            last_pass_at = NEW.completed_at,
            streak_started_at = COALESCE(streak_started_at, NEW.completed_at),
            total_runs_7d = v_total_7d,
            successful_runs_7d = v_success_7d,
            last_run_id = NEW.run_id,
            updated_at = now()
        WHERE provider = v_provider;
    ELSE
      UPDATE public.connector_refresh_streak_state
        SET current_streak_days = 0,
            last_fail_at = NEW.completed_at,
            last_failure_class = COALESCE(NEW.failure_summary, 'unknown'),
            streak_started_at = NULL,
            total_runs_7d = v_total_7d,
            successful_runs_7d = v_success_7d,
            last_run_id = NEW.run_id,
            updated_at = now()
        WHERE provider = v_provider;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_recompute_connector_refresh_streak ON public.connector_refresh_nightly_runs;
CREATE TRIGGER trg_recompute_connector_refresh_streak
  AFTER INSERT OR UPDATE OF status ON public.connector_refresh_nightly_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.recompute_connector_refresh_streak();

-- Admin-only structured summary RPC
CREATE OR REPLACE FUNCTION public.get_connector_refresh_streak_summary()
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_streaks JSONB;
  v_recent JSONB;
  v_reauth_count INT;
  v_classification TEXT;
  v_min_streak INT;
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'admin role required' USING ERRCODE = '42501';
  END IF;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'provider', provider,
    'current_streak_days', current_streak_days,
    'longest_streak_days', longest_streak_days,
    'last_pass_at', last_pass_at,
    'last_fail_at', last_fail_at,
    'last_failure_class', last_failure_class,
    'streak_started_at', streak_started_at,
    'total_runs_7d', total_runs_7d,
    'successful_runs_7d', successful_runs_7d,
    'last_run_id', last_run_id
  ) ORDER BY provider), '[]'::jsonb)
  INTO v_streaks FROM public.connector_refresh_streak_state;

  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'run_id', run_id,
    'started_at', started_at,
    'completed_at', completed_at,
    'status', status,
    'providers_passed', providers_passed,
    'providers_failed', providers_failed,
    'expiry_pressure_passed', expiry_pressure_passed,
    'state_consistency_passed', state_consistency_passed,
    'failure_summary', failure_summary
  ) ORDER BY started_at DESC), '[]'::jsonb)
  INTO v_recent
  FROM (
    SELECT * FROM public.connector_refresh_nightly_runs
    WHERE started_at >= now() - interval '14 days'
    ORDER BY started_at DESC LIMIT 14
  ) t;

  SELECT COUNT(*) INTO v_reauth_count
  FROM public.oauth_refresh_probe_results
  WHERE reauth_required = true
    AND probe_finished_at >= now() - interval '24 hours';

  SELECT COALESCE(MIN(current_streak_days), 0) INTO v_min_streak
  FROM public.connector_refresh_streak_state
  WHERE provider IN ('google','microsoft','slack');

  v_classification := CASE
    WHEN v_reauth_count > 0 THEN 'red'
    WHEN v_min_streak >= 7 THEN 'green'
    WHEN v_min_streak >= 1 THEN 'yellow'
    ELSE 'building'
  END;

  RETURN jsonb_build_object(
    'streaks', v_streaks,
    'recent_runs', v_recent,
    'reauth_required_count_24h', v_reauth_count,
    'min_streak_days', v_min_streak,
    'classification', v_classification,
    'generated_at', now()
  );
END;
$$;

-- Seed singleton rows
INSERT INTO public.connector_refresh_streak_state (provider) VALUES ('google'), ('microsoft'), ('slack')
ON CONFLICT (provider) DO NOTHING;
