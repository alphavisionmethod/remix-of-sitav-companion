
-- ─── Tenant roles ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tenant_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('tenant_admin','tenant_member','tenant_viewer')),
  granted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.tenant_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see their own tenant roles" ON public.tenant_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "admins manage tenant roles" ON public.tenant_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(),'admin'::public.app_role));

CREATE OR REPLACE FUNCTION public.is_tenant_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.tenant_roles WHERE user_id = _user_id AND role = 'tenant_admin')
      OR public.has_role(_user_id, 'admin'::public.app_role)
$$;

-- ─── DP epsilon ledger ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tenant_dp_epsilon_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  capability_key text NOT NULL,
  epsilon_spent numeric NOT NULL CHECK (epsilon_spent > 0),
  period_start timestamptz NOT NULL DEFAULT date_trunc('day', now()),
  request_ref text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dp_eps_user_period ON public.tenant_dp_epsilon_ledger(user_id, period_start);
ALTER TABLE public.tenant_dp_epsilon_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see their own epsilon spend" ON public.tenant_dp_epsilon_ledger
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.record_dp_epsilon_spend(
  _capability_key text, _epsilon numeric, _request_ref text DEFAULT NULL,
  _max_per_day numeric DEFAULT 5.0
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_spent numeric;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  IF _epsilon <= 0 OR _epsilon > 1.0 THEN RAISE EXCEPTION 'epsilon must be in (0,1.0]'; END IF;
  SELECT COALESCE(SUM(epsilon_spent),0) INTO v_spent
    FROM public.tenant_dp_epsilon_ledger
    WHERE user_id = v_uid AND period_start = date_trunc('day', now());
  IF v_spent + _epsilon > _max_per_day THEN
    RAISE EXCEPTION 'epsilon budget exceeded: spent=% requested=% max=%', v_spent, _epsilon, _max_per_day;
  END IF;
  INSERT INTO public.tenant_dp_epsilon_ledger(user_id, capability_key, epsilon_spent, request_ref)
  VALUES (v_uid, _capability_key, _epsilon, _request_ref);
  RETURN jsonb_build_object('ok', true, 'spent_today', v_spent + _epsilon, 'remaining', _max_per_day - v_spent - _epsilon);
END;
$$;

-- ─── Webhook retry queue ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.webhook_retry_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subscription_id uuid,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  attempt_count integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 5,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  last_error text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','succeeded','failed','dlq')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_webhook_retry_next ON public.webhook_retry_queue(status, next_attempt_at);
ALTER TABLE public.webhook_retry_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users see their own retries" ON public.webhook_retry_queue
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ─── Tenant kill switches ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tenant_kill_switches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  switch_key text NOT NULL CHECK (switch_key IN ('federation','external_api','webhooks','ai_actions','quotas_pause')),
  enabled boolean NOT NULL DEFAULT false,
  justification text,
  enabled_at timestamptz,
  disabled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, switch_key)
);
ALTER TABLE public.tenant_kill_switches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenants manage their own kill switches" ON public.tenant_kill_switches
  FOR ALL TO authenticated
  USING (user_id = auth.uid() AND public.is_tenant_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() AND public.is_tenant_admin(auth.uid()));

-- ─── Compliance evidence collector allowlist ────────────────────
CREATE TABLE IF NOT EXISTS public.compliance_evidence_collectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collector_key text NOT NULL UNIQUE,
  display_name text NOT NULL,
  framework text NOT NULL CHECK (framework IN ('SOC2','ISO27001','GDPR','HIPAA','GENERAL')),
  control_id text,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.compliance_evidence_collectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read collectors" ON public.compliance_evidence_collectors
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'::public.app_role));

INSERT INTO public.compliance_evidence_collectors(collector_key, display_name, framework, control_id, description) VALUES
  ('rls_coverage','Row-Level Security coverage','SOC2','CC6.1','Counts tables with RLS enabled vs total'),
  ('mfa_enrollment_stats','MFA enrollment statistics','SOC2','CC6.6','% of admins with MFA enabled'),
  ('backup_recency','Backup recency','SOC2','A1.2','Hours since last successful backup'),
  ('key_rotation_age','Key rotation age','SOC2','CC6.1','Days since signing keys were last rotated'),
  ('audit_log_integrity','Audit log integrity','SOC2','CC7.2','HMAC chain validation result'),
  ('dr_drill_recency','DR drill recency','ISO27001','A.17.1.3','Days since last successful DR drill'),
  ('access_review_recency','Access review recency','ISO27001','A.9.2.5','Days since last admin access review'),
  ('data_retention_policy','Data retention enforcement','GDPR','Art.5','TTL job last-run status'),
  ('incident_response_drill','Incident-response drill','SOC2','CC7.4','Days since last simulated incident'),
  ('vulnerability_scan','Vulnerability scan recency','SOC2','CC7.1','Days since last npm audit'),
  ('encryption_at_rest','Encryption at rest','SOC2','CC6.7','DB + storage encryption status'),
  ('change_management','Change management trail','SOC2','CC8.1','Migrations applied with reviewer trail')
ON CONFLICT (collector_key) DO NOTHING;
