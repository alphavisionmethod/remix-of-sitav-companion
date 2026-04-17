-- ═══════════════════════════════════════════════════════════════
-- C-015 — AI Budget Enforcement at Runtime
-- ═══════════════════════════════════════════════════════════════

-- 1) ai_usage_ledger -------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_usage_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  capability_key text NOT NULL,
  mode text NOT NULL DEFAULT 'real',
  request_class text,
  status text NOT NULL DEFAULT 'success',
  prompt_tokens integer DEFAULT 0,
  completion_tokens integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  estimated_cost_usd numeric(12,6) DEFAULT 0,
  latency_ms integer,
  error_code text,
  error_summary text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '365 days')
);
ALTER TABLE public.ai_usage_ledger ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_ai_usage_ledger_user_created
  ON public.ai_usage_ledger (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_ledger_expires
  ON public.ai_usage_ledger (expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_ledger_capability
  ON public.ai_usage_ledger (user_id, capability_key, created_at DESC);

DROP POLICY IF EXISTS "ai_usage_ledger_owner_select" ON public.ai_usage_ledger;
CREATE POLICY "ai_usage_ledger_owner_select" ON public.ai_usage_ledger
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "ai_usage_ledger_service_insert" ON public.ai_usage_ledger;
CREATE POLICY "ai_usage_ledger_service_insert" ON public.ai_usage_ledger
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 2) ai_receipt_records ---------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_receipt_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  capability_key text NOT NULL,
  mode text NOT NULL DEFAULT 'real',
  decision_class text NOT NULL DEFAULT 'success',
  degraded_reason text,
  usage_ledger_id uuid REFERENCES public.ai_usage_ledger(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '365 days')
);
ALTER TABLE public.ai_receipt_records ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_ai_receipt_records_user_created
  ON public.ai_receipt_records (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_receipt_records_expires
  ON public.ai_receipt_records (expires_at);

DROP POLICY IF EXISTS "ai_receipt_records_owner_select" ON public.ai_receipt_records;
CREATE POLICY "ai_receipt_records_owner_select" ON public.ai_receipt_records
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "ai_receipt_records_service_insert" ON public.ai_receipt_records;
CREATE POLICY "ai_receipt_records_service_insert" ON public.ai_receipt_records
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 3) ai_fallback_events ---------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_fallback_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  capability_key text NOT NULL,
  fallback_reason text NOT NULL,
  result_state text NOT NULL DEFAULT 'fallback_success',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '180 days')
);
ALTER TABLE public.ai_fallback_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_ai_fallback_events_user_created
  ON public.ai_fallback_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_fallback_events_expires
  ON public.ai_fallback_events (expires_at);

DROP POLICY IF EXISTS "ai_fallback_events_owner_select" ON public.ai_fallback_events;
CREATE POLICY "ai_fallback_events_owner_select" ON public.ai_fallback_events
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "ai_fallback_events_service_insert" ON public.ai_fallback_events;
CREATE POLICY "ai_fallback_events_service_insert" ON public.ai_fallback_events
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 4) ai_budget_alerts -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.ai_budget_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  scope_type text NOT NULL DEFAULT 'user',
  scope_ref text,
  threshold_percent numeric(6,2),
  observed_cost_usd numeric(12,6),
  period_class text NOT NULL DEFAULT 'daily',
  alert_state text NOT NULL DEFAULT 'warning',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '180 days')
);
ALTER TABLE public.ai_budget_alerts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_ai_budget_alerts_user_created
  ON public.ai_budget_alerts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_budget_alerts_expires
  ON public.ai_budget_alerts (expires_at);

DROP POLICY IF EXISTS "ai_budget_alerts_owner_select" ON public.ai_budget_alerts;
CREATE POLICY "ai_budget_alerts_owner_select" ON public.ai_budget_alerts
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "ai_budget_alerts_service_insert" ON public.ai_budget_alerts;
CREATE POLICY "ai_budget_alerts_service_insert" ON public.ai_budget_alerts
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 5) check_ai_budget_policies RPC -----------------------------------
CREATE OR REPLACE FUNCTION public.check_ai_budget_policies(
  p_user_id uuid,
  p_capability_key text,
  p_estimated_cost_usd numeric
) RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role_key text;
  v_class_key text;
  v_class record;
  v_calls_last_hour int;
  v_cost_last_24h numeric := 0;
  v_daily_envelope_cents numeric;
  v_pct numeric := 0;
  v_should_block boolean := false;
  v_should_downgrade boolean := false;
  v_premium_blocked boolean := false;
  v_reason text := 'ok';
  v_alert_state text := 'ok';
  v_fallback_model text := NULL;
  v_estimated_cost_cents numeric := COALESCE(p_estimated_cost_usd, 0) * 100;
BEGIN
  -- Resolve role + budget class for this capability
  SELECT role_key, budget_class_key
    INTO v_role_key, v_class_key
  FROM public.ai_workforce_role_task_permissions
  WHERE user_id = p_user_id
    AND (task_key = p_capability_key OR p_capability_key LIKE role_key || '.%')
  ORDER BY (task_key = p_capability_key) DESC
  LIMIT 1;

  IF v_class_key IS NULL THEN
    -- Try a default class for the user
    SELECT class_key INTO v_class_key
    FROM public.ai_workforce_budget_classes
    WHERE user_id = p_user_id
    ORDER BY priority_order ASC
    LIMIT 1;
  END IF;

  IF v_class_key IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'should_block', false,
      'should_downgrade', false,
      'reason', 'no_policy',
      'policy_key', NULL,
      'pct', 0,
      'alert_state', 'ok',
      'premium_blocked', false,
      'fallback_model_id', NULL
    );
  END IF;

  SELECT * INTO v_class
  FROM public.ai_workforce_budget_classes
  WHERE user_id = p_user_id AND class_key = v_class_key
  LIMIT 1;

  IF v_class IS NULL THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'should_block', false,
      'should_downgrade', false,
      'reason', 'no_class',
      'policy_key', v_class_key,
      'pct', 0,
      'alert_state', 'ok',
      'premium_blocked', false,
      'fallback_model_id', NULL
    );
  END IF;

  -- Per-call cost cap
  IF v_class.max_cost_cents_per_call IS NOT NULL
     AND v_estimated_cost_cents > v_class.max_cost_cents_per_call THEN
    v_should_block := true;
    v_reason := 'per_call_cost_exceeded';
  END IF;

  -- Hourly call cap (count invocations for the same role in last hour)
  IF NOT v_should_block AND v_class.max_calls_per_hour IS NOT NULL THEN
    SELECT COUNT(*) INTO v_calls_last_hour
    FROM public.ai_workforce_invocations
    WHERE user_id = p_user_id
      AND created_at >= now() - interval '1 hour'
      AND (v_role_key IS NULL OR role_key = v_role_key);

    IF v_calls_last_hour >= v_class.max_calls_per_hour THEN
      v_should_block := true;
      v_reason := 'hourly_call_limit_exceeded';
    END IF;
  END IF;

  -- Daily envelope = max_cost_cents_per_call * max_calls_per_hour * 24 (rough)
  IF NOT v_should_block
     AND v_class.max_cost_cents_per_call IS NOT NULL
     AND v_class.max_calls_per_hour IS NOT NULL THEN
    v_daily_envelope_cents := v_class.max_cost_cents_per_call::numeric * v_class.max_calls_per_hour::numeric * 24;

    SELECT COALESCE(SUM(cost_cents), 0) INTO v_cost_last_24h
    FROM public.ai_workforce_invocations
    WHERE user_id = p_user_id
      AND created_at >= now() - interval '24 hours';

    IF v_daily_envelope_cents > 0 THEN
      v_pct := ROUND((v_cost_last_24h / v_daily_envelope_cents) * 100, 2);
    END IF;

    IF v_pct >= 85 THEN
      v_alert_state := 'critical';
    ELSIF v_pct >= 60 THEN
      v_alert_state := 'warning';
    END IF;

    IF v_pct >= 80 THEN
      v_should_downgrade := true;
      -- pick lowest-cost allowed model for fallback if defined
      IF v_class.allowed_models IS NOT NULL
         AND jsonb_typeof(v_class.allowed_models) = 'array'
         AND jsonb_array_length(v_class.allowed_models) > 0 THEN
        v_fallback_model := v_class.allowed_models ->> 0;
      ELSE
        v_fallback_model := 'google/gemini-2.5-flash-lite';
      END IF;
      IF v_reason = 'ok' THEN v_reason := 'daily_threshold_downgrade'; END IF;
    END IF;
  END IF;

  -- Premium block: non-premium class trying to invoke premium synthesis
  IF v_class.class_key NOT ILIKE '%premium%'
     AND p_capability_key ILIKE '%premium%' THEN
    v_premium_blocked := true;
    IF v_reason = 'ok' THEN v_reason := 'premium_blocked'; END IF;
  END IF;

  RETURN jsonb_build_object(
    'allowed', NOT v_should_block,
    'should_block', v_should_block,
    'should_downgrade', v_should_downgrade,
    'reason', v_reason,
    'policy_key', v_class_key,
    'pct', v_pct,
    'alert_state', v_alert_state,
    'premium_blocked', v_premium_blocked,
    'fallback_model_id', v_fallback_model
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_ai_budget_policies(uuid, text, numeric) TO authenticated, service_role;

-- 6) Default budget classes seeder ---------------------------------
CREATE OR REPLACE FUNCTION public.seed_default_budget_classes(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ai_workforce_budget_classes
    (user_id, class_key, display_name, description, priority_order,
     max_tokens_per_call, max_cost_cents_per_call, max_calls_per_hour, allowed_models)
  VALUES
    (_user_id, 'utility', 'Utility', 'Cheap, high-volume utility tasks', 1,
     2000, 5, 60,
     '["google/gemini-2.5-flash-lite"]'::jsonb),
    (_user_id, 'balanced', 'Balanced', 'Default balanced reasoning', 2,
     8000, 25, 30,
     '["google/gemini-3-flash-preview","google/gemini-2.5-flash"]'::jsonb),
    (_user_id, 'premium', 'Premium', 'Deep reasoning / premium synthesis', 3,
     16000, 100, 10,
     '["google/gemini-2.5-pro","openai/gpt-5"]'::jsonb)
  ON CONFLICT DO NOTHING;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'seed_default_budget_classes failed for %: %', _user_id, SQLERRM;
END;
$$;

-- 7) Auth user trigger --------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user_budget_classes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.seed_default_budget_classes(NEW.id);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user_budget_classes failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_budget ON auth.users;
CREATE TRIGGER on_auth_user_created_budget
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_budget_classes();

-- 8) One-time backfill for existing users with AI activity ---------
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT DISTINCT user_id
    FROM public.ai_workforce_invocations
    WHERE user_id IS NOT NULL
      AND user_id NOT IN (SELECT DISTINCT user_id FROM public.ai_workforce_budget_classes)
  LOOP
    PERFORM public.seed_default_budget_classes(r.user_id);
  END LOOP;
END $$;