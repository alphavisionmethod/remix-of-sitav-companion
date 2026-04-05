
-- ============================================================
-- 1. UNIQUE INDEXES FOR DEDUPLICATION
-- ============================================================

-- Prevent duplicate token usage logs on retries
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_token_usage_dedup 
ON public.ai_token_usage (user_id, advisor_id, session_id, created_at)
WHERE session_id IS NOT NULL;

-- Prevent duplicate advisor memories
CREATE UNIQUE INDEX IF NOT EXISTS idx_advisor_memories_dedup
ON public.advisor_memories (advisor_id, user_id, memory_type, md5(content));

-- ============================================================
-- 2. PERFORMANCE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_ai_token_usage_user_created ON public.ai_token_usage (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON public.audit_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_queue_user_status ON public.notifications_queue (user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_signals_agent_processed ON public.agent_signals (agent_id, processed, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_advisor_performance_user_advisor ON public.advisor_performance (user_id, advisor_id, period);
CREATE INDEX IF NOT EXISTS idx_events_user_created ON public.events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_user_status ON public.incidents (user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approval_queue_user_status ON public.approval_queue (user_id, status, created_at DESC);

-- ============================================================
-- 3. ATOMIC BUDGET UPDATE RPC
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_ai_budget_usage(
  p_user_id uuid,
  p_tokens integer,
  p_cost numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_budget record;
  v_result jsonb;
BEGIN
  SELECT * INTO v_budget
  FROM public.user_ai_budgets
  WHERE user_id = p_user_id AND period = 'monthly'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', true, 'reason', 'no_budget_set');
  END IF;

  IF v_budget.hard_limit AND (v_budget.used_cost_cents + p_cost) > v_budget.limit_cost_cents THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'budget_exceeded', 'used', v_budget.used_cost_cents, 'limit', v_budget.limit_cost_cents);
  END IF;

  UPDATE public.user_ai_budgets
  SET used_tokens = used_tokens + p_tokens,
      used_cost_cents = used_cost_cents + p_cost,
      updated_at = now()
  WHERE id = v_budget.id;

  RETURN jsonb_build_object(
    'allowed', true,
    'used_tokens', v_budget.used_tokens + p_tokens,
    'used_cost_cents', v_budget.used_cost_cents + p_cost,
    'auto_downgrade', v_budget.auto_downgrade_model
  );
END;
$$;

-- ============================================================
-- 4. CLEANUP EXPIRED SIGNALS
-- ============================================================

CREATE OR REPLACE FUNCTION public.cleanup_expired_signals()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  DELETE FROM public.agent_signals
  WHERE processed = false
    AND created_at < now() - interval '1 hour'
    AND signal_type LIKE 'os_command:%';
  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Also mark old unprocessed signals as expired
  UPDATE public.agent_signals
  SET processed = true, processed_at = now()
  WHERE processed = false
    AND created_at < now() - interval '24 hours';

  RETURN v_count;
END;
$$;

-- ============================================================
-- 5. NOTIFICATION DEDUP TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_notification_dedup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.notifications_queue
    WHERE user_id = NEW.user_id
      AND category = NEW.category
      AND title = NEW.title
      AND created_at > now() - interval '5 minutes'
  ) THEN
    RETURN NULL; -- suppress duplicate
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notification_dedup
BEFORE INSERT ON public.notifications_queue
FOR EACH ROW
EXECUTE FUNCTION public.check_notification_dedup();

-- ============================================================
-- 6. ADMIN RLS FOR AUDIT LOGS (admins need to see all)
-- ============================================================

CREATE POLICY "Admins view all audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin insert for audit logs (edge functions use service role, but just in case)
CREATE POLICY "Admins insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin view all advisor memories for cross-user analytics
CREATE POLICY "Admins view all advisor memories"
ON public.advisor_memories
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
