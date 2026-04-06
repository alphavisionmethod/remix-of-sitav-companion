
-- Add critical threshold to budget policies
ALTER TABLE public.ai_budget_policies
  ADD COLUMN IF NOT EXISTS critical_threshold_percent numeric(5,2) NOT NULL DEFAULT 95.00;

-- ── Budget policy check function ───────────────────────────────
CREATE OR REPLACE FUNCTION public.check_ai_budget_policies(
  p_user_id uuid,
  p_capability_key text,
  p_estimated_cost_usd numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_policy record;
  v_daily_spend numeric;
  v_weekly_spend numeric;
  v_monthly_spend numeric;
  v_daily_requests integer;
  v_pct numeric;
  v_result jsonb := jsonb_build_object('allowed', true, 'reason', 'no_policy', 'should_downgrade', false, 'should_block', false);
BEGIN
  -- Get daily spend from usage ledger
  SELECT COALESCE(SUM(estimated_cost_usd), 0), COUNT(*)
  INTO v_daily_spend, v_daily_requests
  FROM public.ai_usage_ledger
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('day', now());

  -- Get weekly spend
  SELECT COALESCE(SUM(estimated_cost_usd), 0)
  INTO v_weekly_spend
  FROM public.ai_usage_ledger
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('week', now());

  -- Get monthly spend
  SELECT COALESCE(SUM(estimated_cost_usd), 0)
  INTO v_monthly_spend
  FROM public.ai_usage_ledger
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', now());

  -- Check all applicable active policies (most specific first)
  FOR v_policy IN
    SELECT * FROM public.ai_budget_policies
    WHERE is_active = true
      AND (
        (scope_type = 'global')
        OR (scope_type = 'user' AND scope_ref = p_user_id::text)
        OR (scope_type = 'capability' AND scope_ref = p_capability_key)
      )
    ORDER BY
      CASE scope_type
        WHEN 'capability' THEN 1
        WHEN 'user' THEN 2
        WHEN 'workspace' THEN 3
        WHEN 'global' THEN 4
        ELSE 5
      END
  LOOP
    -- Check max request cost
    IF v_policy.max_request_cost_usd IS NOT NULL AND p_estimated_cost_usd > v_policy.max_request_cost_usd THEN
      IF v_policy.block_on_exceeded THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'max_request_cost_exceeded', 'policy_key', v_policy.policy_key, 'should_downgrade', v_policy.fallback_on_exceeded, 'should_block', true);
      END IF;
      IF v_policy.fallback_on_exceeded THEN
        RETURN jsonb_build_object('allowed', true, 'reason', 'max_request_cost_exceeded_fallback', 'policy_key', v_policy.policy_key, 'should_downgrade', true, 'should_block', false, 'fallback_model_id', v_policy.fallback_model_id);
      END IF;
    END IF;

    -- Check daily budget
    IF v_policy.daily_budget_usd IS NOT NULL THEN
      v_pct := ((v_daily_spend + p_estimated_cost_usd) / v_policy.daily_budget_usd) * 100;
      IF v_pct >= 100 THEN
        IF v_policy.block_on_exceeded THEN
          RETURN jsonb_build_object('allowed', false, 'reason', 'daily_budget_exceeded', 'policy_key', v_policy.policy_key, 'should_downgrade', false, 'should_block', true, 'pct', v_pct);
        END IF;
        IF v_policy.fallback_on_exceeded THEN
          RETURN jsonb_build_object('allowed', true, 'reason', 'daily_budget_exceeded_fallback', 'policy_key', v_policy.policy_key, 'should_downgrade', true, 'should_block', false, 'fallback_model_id', v_policy.fallback_model_id, 'pct', v_pct);
        END IF;
      END IF;
      IF v_pct >= v_policy.critical_threshold_percent THEN
        v_result := jsonb_build_object('allowed', true, 'reason', 'approaching_daily_critical', 'policy_key', v_policy.policy_key, 'should_downgrade', false, 'should_block', false, 'pct', v_pct, 'alert_state', 'critical');
      ELSIF v_pct >= v_policy.alert_threshold_percent THEN
        v_result := jsonb_build_object('allowed', true, 'reason', 'approaching_daily_warning', 'policy_key', v_policy.policy_key, 'should_downgrade', false, 'should_block', false, 'pct', v_pct, 'alert_state', 'warning');
      END IF;
    END IF;

    -- Check max daily requests
    IF v_policy.max_daily_requests IS NOT NULL AND v_daily_requests >= v_policy.max_daily_requests THEN
      IF v_policy.block_on_exceeded THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'max_daily_requests_exceeded', 'policy_key', v_policy.policy_key, 'should_downgrade', false, 'should_block', true);
      END IF;
      IF v_policy.fallback_on_exceeded THEN
        RETURN jsonb_build_object('allowed', true, 'reason', 'max_daily_requests_fallback', 'policy_key', v_policy.policy_key, 'should_downgrade', true, 'should_block', false, 'fallback_model_id', v_policy.fallback_model_id);
      END IF;
    END IF;

    -- Check premium not allowed
    IF NOT v_policy.premium_allowed THEN
      v_result := jsonb_set(v_result, '{premium_blocked}', 'true'::jsonb);
      v_result := jsonb_set(v_result, '{premium_blocked_policy}', to_jsonb(v_policy.policy_key));
    END IF;
  END LOOP;

  RETURN v_result;
END;
$$;

-- ── Aggregate daily spend view function ────────────────────────
CREATE OR REPLACE FUNCTION public.aggregate_ai_daily_spend(p_user_id uuid)
RETURNS TABLE(
  spend_date date,
  capability_key text,
  request_count bigint,
  total_cost_usd numeric,
  total_tokens bigint,
  avg_latency_ms numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (created_at AT TIME ZONE 'UTC')::date AS spend_date,
    capability_key,
    COUNT(*) AS request_count,
    COALESCE(SUM(estimated_cost_usd), 0) AS total_cost_usd,
    COALESCE(SUM(total_tokens), 0) AS total_tokens,
    COALESCE(AVG(latency_ms), 0) AS avg_latency_ms
  FROM public.ai_usage_ledger
  WHERE user_id = p_user_id
    AND created_at >= now() - interval '30 days'
  GROUP BY spend_date, capability_key
  ORDER BY spend_date DESC, total_cost_usd DESC;
$$;
