-- ═══════════════════════════════════════════════════════════════
-- Per-user AI hard ceilings + budget decision receipts
-- Phase 1A of Economic Governance closure
-- ═══════════════════════════════════════════════════════════════

-- ── Table 1: ai_user_hard_ceilings ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_user_hard_ceilings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_cost_cents_cap INTEGER NOT NULL DEFAULT 500 CHECK (daily_cost_cents_cap >= 0),
  monthly_cost_cents_cap INTEGER NOT NULL DEFAULT 5000 CHECK (monthly_cost_cents_cap >= 0),
  daily_calls_cap INTEGER NOT NULL DEFAULT 1000 CHECK (daily_calls_cap >= 0),
  degrade_to_model_id TEXT NOT NULL DEFAULT 'google/gemini-2.5-flash-lite',
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_user_hard_ceilings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ceiling"
  ON public.ai_user_hard_ceilings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all ceilings"
  ON public.ai_user_hard_ceilings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert ceilings"
  ON public.ai_user_hard_ceilings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update ceilings"
  ON public.ai_user_hard_ceilings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete ceilings"
  ON public.ai_user_hard_ceilings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER update_ai_user_hard_ceilings_updated_at
  BEFORE UPDATE ON public.ai_user_hard_ceilings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Table 2: ai_budget_decision_receipts ────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_budget_decision_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  capability_key TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('allow', 'degrade', 'block')),
  reason TEXT NOT NULL,
  pre_check_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  policy_rule TEXT NOT NULL,
  cost_estimate_cents INTEGER,
  actual_cost_cents INTEGER,
  fallback_model_id TEXT,
  daily_pct NUMERIC(5,2),
  monthly_pct NUMERIC(5,2),
  correlation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days')
);

CREATE INDEX idx_ai_budget_decision_receipts_user_created
  ON public.ai_budget_decision_receipts (user_id, created_at DESC);
CREATE INDEX idx_ai_budget_decision_receipts_decision
  ON public.ai_budget_decision_receipts (decision, created_at DESC);
CREATE INDEX idx_ai_budget_decision_receipts_expires
  ON public.ai_budget_decision_receipts (expires_at);

ALTER TABLE public.ai_budget_decision_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own decision receipts"
  ON public.ai_budget_decision_receipts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all decision receipts"
  ON public.ai_budget_decision_receipts FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Service role inserts only (no client-side inserts; only edge functions)
CREATE POLICY "Service role inserts decision receipts"
  ON public.ai_budget_decision_receipts FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_budget_decision_receipts;

-- ── Function: check_user_hard_ceiling ───────────────────────────
CREATE OR REPLACE FUNCTION public.check_user_hard_ceiling(
  p_user_id UUID,
  p_estimated_cost_cents INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ceiling RECORD;
  v_daily_spent INTEGER := 0;
  v_monthly_spent INTEGER := 0;
  v_daily_calls INTEGER := 0;
  v_daily_pct NUMERIC(5,2);
  v_monthly_pct NUMERIC(5,2);
  v_calls_pct NUMERIC(5,2);
  v_max_pct NUMERIC(5,2);
BEGIN
  -- Load ceiling (auto-default if absent)
  SELECT * INTO v_ceiling FROM public.ai_user_hard_ceilings WHERE user_id = p_user_id;
  IF v_ceiling IS NULL THEN
    -- Insert default and reload
    INSERT INTO public.ai_user_hard_ceilings (user_id) VALUES (p_user_id)
      ON CONFLICT (user_id) DO NOTHING;
    SELECT * INTO v_ceiling FROM public.ai_user_hard_ceilings WHERE user_id = p_user_id;
  END IF;

  -- Compute current spend (today)
  SELECT
    COALESCE(SUM((estimated_cost_usd * 100)::int), 0),
    COALESCE(COUNT(*), 0)
  INTO v_daily_spent, v_daily_calls
  FROM public.ai_usage_ledger
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('day', now())
    AND status NOT IN ('blocked', 'rejected');

  -- Compute current spend (this month)
  SELECT COALESCE(SUM((estimated_cost_usd * 100)::int), 0)
  INTO v_monthly_spent
  FROM public.ai_usage_ledger
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', now())
    AND status NOT IN ('blocked', 'rejected');

  -- Compute percentages (guard against div-by-zero)
  v_daily_pct := CASE WHEN v_ceiling.daily_cost_cents_cap > 0
    THEN ROUND(((v_daily_spent + p_estimated_cost_cents)::numeric / v_ceiling.daily_cost_cents_cap) * 100, 2)
    ELSE 0 END;
  v_monthly_pct := CASE WHEN v_ceiling.monthly_cost_cents_cap > 0
    THEN ROUND(((v_monthly_spent + p_estimated_cost_cents)::numeric / v_ceiling.monthly_cost_cents_cap) * 100, 2)
    ELSE 0 END;
  v_calls_pct := CASE WHEN v_ceiling.daily_calls_cap > 0
    THEN ROUND((v_daily_calls::numeric / v_ceiling.daily_calls_cap) * 100, 2)
    ELSE 0 END;

  v_max_pct := GREATEST(v_daily_pct, v_monthly_pct, v_calls_pct);

  -- HARD BLOCK: any cap exceeded
  IF v_daily_spent + p_estimated_cost_cents > v_ceiling.daily_cost_cents_cap THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'daily_cost_cap_exceeded',
      'daily_pct', v_daily_pct,
      'monthly_pct', v_monthly_pct,
      'calls_pct', v_calls_pct,
      'fallback_model_id', v_ceiling.degrade_to_model_id,
      'daily_resets_at', (date_trunc('day', now()) + interval '1 day')::text,
      'cap_cents', v_ceiling.daily_cost_cents_cap,
      'spent_cents', v_daily_spent
    );
  END IF;

  IF v_monthly_spent + p_estimated_cost_cents > v_ceiling.monthly_cost_cents_cap THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'monthly_cost_cap_exceeded',
      'daily_pct', v_daily_pct,
      'monthly_pct', v_monthly_pct,
      'calls_pct', v_calls_pct,
      'fallback_model_id', v_ceiling.degrade_to_model_id,
      'monthly_resets_at', (date_trunc('month', now()) + interval '1 month')::text,
      'cap_cents', v_ceiling.monthly_cost_cents_cap,
      'spent_cents', v_monthly_spent
    );
  END IF;

  IF v_daily_calls >= v_ceiling.daily_calls_cap THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'reason', 'daily_calls_cap_exceeded',
      'daily_pct', v_daily_pct,
      'monthly_pct', v_monthly_pct,
      'calls_pct', v_calls_pct,
      'fallback_model_id', v_ceiling.degrade_to_model_id,
      'daily_resets_at', (date_trunc('day', now()) + interval '1 day')::text,
      'cap_calls', v_ceiling.daily_calls_cap,
      'made_calls', v_daily_calls
    );
  END IF;

  -- DEGRADE: at or above 80%
  IF v_max_pct >= 80 THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'should_degrade', true,
      'reason', 'approaching_ceiling_80pct',
      'daily_pct', v_daily_pct,
      'monthly_pct', v_monthly_pct,
      'calls_pct', v_calls_pct,
      'fallback_model_id', v_ceiling.degrade_to_model_id
    );
  END IF;

  -- ALLOW
  RETURN jsonb_build_object(
    'allowed', true,
    'should_degrade', false,
    'reason', 'within_ceiling',
    'daily_pct', v_daily_pct,
    'monthly_pct', v_monthly_pct,
    'calls_pct', v_calls_pct,
    'fallback_model_id', v_ceiling.degrade_to_model_id
  );
END;
$$;

-- ── Trigger: auto-seed default ceiling on new user ──────────────
CREATE OR REPLACE FUNCTION public.handle_new_user_ceiling()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.ai_user_hard_ceilings (user_id) VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user_ceiling failed for %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_ceiling ON auth.users;
CREATE TRIGGER on_auth_user_created_ceiling
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_ceiling();

-- ── Backfill: seed ceilings for all existing users ──────────────
INSERT INTO public.ai_user_hard_ceilings (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- ── TTL cleanup function ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.purge_expired_budget_decision_receipts()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_deleted integer := 0;
BEGIN
  WITH d AS (
    DELETE FROM public.ai_budget_decision_receipts
    WHERE expires_at < now()
    RETURNING 1
  )
  SELECT count(*) INTO v_deleted FROM d;
  RETURN v_deleted;
END;
$$;