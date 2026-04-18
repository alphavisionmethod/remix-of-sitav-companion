-- ═══════════════════════════════════════════════════════════════
-- PHASE 7 — Production Hardening + Owner Copilots + Multi-Tenant Federation
-- L3 hard ceiling enforced for tenant-facing autonomous actions.
-- ═══════════════════════════════════════════════════════════════

-- ── 7A. Production hardening + observability ──

CREATE TABLE IF NOT EXISTS public.internal_agent_slo_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  tenant_id       UUID NULL,
  window_start    TIMESTAMPTZ NOT NULL,
  window_end      TIMESTAMPTZ NOT NULL,
  agent_id        TEXT NULL,
  council         TEXT NULL,
  success_rate    NUMERIC(5,4) NOT NULL DEFAULT 0,
  p50_latency_ms  INTEGER NOT NULL DEFAULT 0,
  p95_latency_ms  INTEGER NOT NULL DEFAULT 0,
  escalation_rate NUMERIC(5,4) NOT NULL DEFAULT 0,
  cost_cents      INTEGER NOT NULL DEFAULT 0,
  action_count    INTEGER NOT NULL DEFAULT 0,
  slo_status      TEXT NOT NULL DEFAULT 'ok' CHECK (slo_status IN ('ok','warn','breach')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_iaslo_user_time ON public.internal_agent_slo_snapshots(user_id, window_end DESC);
ALTER TABLE public.internal_agent_slo_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iaslo admins read" ON public.internal_agent_slo_snapshots
  FOR SELECT TO authenticated
  USING (public.has_admin_permission(auth.uid(),'audit.view') OR auth.uid() = user_id);
CREATE POLICY "iaslo service insert" ON public.internal_agent_slo_snapshots
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.internal_agent_anomaly_signals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  tenant_id       UUID NULL,
  detected_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  signal_kind     TEXT NOT NULL CHECK (signal_kind IN
                    ('cost_spike','error_burst','reflection_loop','council_deadlock','drift_alert','canary_fail')),
  severity        TEXT NOT NULL DEFAULT 'warn' CHECK (severity IN ('info','warn','crit')),
  agent_id        TEXT NULL,
  council         TEXT NULL,
  metric_payload  JSONB NOT NULL DEFAULT '{}'::jsonb,
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','ack','resolved','suppressed')),
  acknowledged_by UUID NULL,
  acknowledged_at TIMESTAMPTZ NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_iaas_user_status ON public.internal_agent_anomaly_signals(user_id, status, detected_at DESC);
ALTER TABLE public.internal_agent_anomaly_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iaas read" ON public.internal_agent_anomaly_signals
  FOR SELECT TO authenticated
  USING (public.has_admin_permission(auth.uid(),'audit.view') OR auth.uid() = user_id);
CREATE POLICY "iaas insert self" ON public.internal_agent_anomaly_signals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "iaas update admins" ON public.internal_agent_anomaly_signals
  FOR UPDATE TO authenticated
  USING (public.has_admin_permission(auth.uid(),'audit.view'));

CREATE TABLE IF NOT EXISTS public.internal_agent_drift_findings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  tenant_id       UUID NULL,
  detector_key    TEXT NOT NULL,
  expected        JSONB NOT NULL DEFAULT '{}'::jsonb,
  observed        JSONB NOT NULL DEFAULT '{}'::jsonb,
  drift_score     NUMERIC(5,4) NOT NULL DEFAULT 0,
  severity        TEXT NOT NULL DEFAULT 'warn' CHECK (severity IN ('info','warn','crit')),
  status          TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','ack','resolved')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_iadf_user_status ON public.internal_agent_drift_findings(user_id, status, created_at DESC);
ALTER TABLE public.internal_agent_drift_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iadf read" ON public.internal_agent_drift_findings
  FOR SELECT TO authenticated
  USING (public.has_admin_permission(auth.uid(),'audit.view') OR auth.uid() = user_id);
CREATE POLICY "iadf insert" ON public.internal_agent_drift_findings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.internal_agent_canary_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  golden_path_id  TEXT NOT NULL,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at     TIMESTAMPTZ NULL,
  status          TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running','pass','fail','skip')),
  expected        JSONB NOT NULL DEFAULT '{}'::jsonb,
  observed        JSONB NOT NULL DEFAULT '{}'::jsonb,
  failure_reason  TEXT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_iacr_user_path_time ON public.internal_agent_canary_runs(user_id, golden_path_id, started_at DESC);
ALTER TABLE public.internal_agent_canary_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iacr read" ON public.internal_agent_canary_runs
  FOR SELECT TO authenticated
  USING (public.has_admin_permission(auth.uid(),'audit.view') OR auth.uid() = user_id);
CREATE POLICY "iacr insert" ON public.internal_agent_canary_runs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ── 7B. Owner-facing copilot BFF surface ──

CREATE TABLE IF NOT EXISTS public.owner_copilot_briefings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_owner_id   UUID NOT NULL,
  tenant_id         UUID NULL,
  topic             TEXT NOT NULL,
  summary           TEXT NOT NULL,
  body              TEXT NOT NULL,
  source_kind       TEXT NOT NULL DEFAULT 'workforce_signal' CHECK (source_kind IN
                      ('workforce_signal','recommendation','cost_proposal','consensus','self_heal')),
  source_ref        UUID NULL,
  confidence        NUMERIC(5,4) NOT NULL DEFAULT 0,
  evidence          JSONB NOT NULL DEFAULT '[]'::jsonb,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','seen','acted','dismissed')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ocb_owner_status ON public.owner_copilot_briefings(tenant_owner_id, status, created_at DESC);
ALTER TABLE public.owner_copilot_briefings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ocb owner read" ON public.owner_copilot_briefings
  FOR SELECT TO authenticated
  USING (auth.uid() = tenant_owner_id OR public.has_admin_permission(auth.uid(),'audit.view'));
CREATE POLICY "ocb service insert" ON public.owner_copilot_briefings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = tenant_owner_id OR public.has_admin_permission(auth.uid(),'audit.view'));
CREATE POLICY "ocb owner update status" ON public.owner_copilot_briefings
  FOR UPDATE TO authenticated
  USING (auth.uid() = tenant_owner_id);

CREATE TABLE IF NOT EXISTS public.owner_copilot_handoffs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  briefing_id       UUID NOT NULL REFERENCES public.owner_copilot_briefings(id) ON DELETE CASCADE,
  tenant_owner_id   UUID NOT NULL,
  decision          TEXT NOT NULL CHECK (decision IN ('approved','declined','more_info')),
  rationale         TEXT NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_och_briefing ON public.owner_copilot_handoffs(briefing_id);
ALTER TABLE public.owner_copilot_handoffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "och read" ON public.owner_copilot_handoffs
  FOR SELECT TO authenticated
  USING (auth.uid() = tenant_owner_id OR public.has_admin_permission(auth.uid(),'audit.view'));

-- ── 7C. Multi-tenant federation ──

CREATE TABLE IF NOT EXISTS public.internal_agent_tenant_scopes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  tenant_id       UUID NOT NULL,
  agent_id        TEXT NOT NULL,
  enabled         BOOLEAN NOT NULL DEFAULT true,
  trust_rung      INTEGER NOT NULL DEFAULT 0 CHECK (trust_rung BETWEEN 0 AND 3),
  notes           TEXT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, agent_id)
);
ALTER TABLE public.internal_agent_tenant_scopes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iats read" ON public.internal_agent_tenant_scopes
  FOR SELECT TO authenticated
  USING (public.has_admin_permission(auth.uid(),'audit.view') OR auth.uid() = user_id);
CREATE POLICY "iats admin write" ON public.internal_agent_tenant_scopes
  FOR ALL TO authenticated
  USING (public.has_admin_permission(auth.uid(),'flags.rollout'))
  WITH CHECK (public.has_admin_permission(auth.uid(),'flags.rollout'));

CREATE TABLE IF NOT EXISTS public.internal_agent_tenant_quotas (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  tenant_id       UUID NOT NULL UNIQUE,
  daily_cents_cap INTEGER NOT NULL DEFAULT 1000,
  weekly_cents_cap INTEGER NOT NULL DEFAULT 5000,
  max_actions_per_hour INTEGER NOT NULL DEFAULT 30,
  consumed_cents_today INTEGER NOT NULL DEFAULT 0,
  consumed_actions_hour INTEGER NOT NULL DEFAULT 0,
  hour_window_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('hour', now()),
  day_window_start TIMESTAMPTZ NOT NULL DEFAULT date_trunc('day', now()),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.internal_agent_tenant_quotas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iatq read" ON public.internal_agent_tenant_quotas
  FOR SELECT TO authenticated
  USING (public.has_admin_permission(auth.uid(),'audit.view') OR auth.uid() = user_id);
CREATE POLICY "iatq admin write" ON public.internal_agent_tenant_quotas
  FOR ALL TO authenticated
  USING (public.has_admin_permission(auth.uid(),'flags.rollout'))
  WITH CHECK (public.has_admin_permission(auth.uid(),'flags.rollout'));

CREATE TABLE IF NOT EXISTS public.internal_agent_tenant_kill_switches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  tenant_id       UUID NOT NULL,
  switch_key      TEXT NOT NULL,
  active          BOOLEAN NOT NULL DEFAULT false,
  justification   TEXT NOT NULL CHECK (length(justification) >= 20),
  activated_by    UUID NULL,
  activated_at    TIMESTAMPTZ NULL,
  expires_at      TIMESTAMPTZ NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, switch_key)
);
ALTER TABLE public.internal_agent_tenant_kill_switches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "iatks read" ON public.internal_agent_tenant_kill_switches
  FOR SELECT TO authenticated
  USING (public.has_admin_permission(auth.uid(),'audit.view') OR auth.uid() = user_id);
CREATE POLICY "iatks admin write" ON public.internal_agent_tenant_kill_switches
  FOR ALL TO authenticated
  USING (public.has_admin_permission(auth.uid(),'maintenance.emergency'))
  WITH CHECK (public.has_admin_permission(auth.uid(),'maintenance.emergency'));

-- ── Safety RPCs ──

-- Hard-clamp tenant-facing autonomy to L3.
CREATE OR REPLACE FUNCTION public.clamp_tenant_action_autonomy(
  p_requested_level INTEGER
) RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Phase 7 Hard rule: tenant-facing actions are capped at L3.
  RETURN LEAST(GREATEST(COALESCE(p_requested_level, 0), 0), 3);
END;
$$;

-- Owner copilot handoff writer (only the briefing's owner may record).
CREATE OR REPLACE FUNCTION public.record_owner_copilot_handoff(
  p_briefing_id UUID,
  p_decision TEXT,
  p_rationale TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner UUID;
  v_id UUID;
BEGIN
  IF p_decision NOT IN ('approved','declined','more_info') THEN
    RAISE EXCEPTION 'invalid decision';
  END IF;

  SELECT tenant_owner_id INTO v_owner
  FROM public.owner_copilot_briefings
  WHERE id = p_briefing_id;

  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'briefing not found';
  END IF;

  IF v_owner <> auth.uid() THEN
    RAISE EXCEPTION 'only the briefing owner may record a handoff';
  END IF;

  INSERT INTO public.owner_copilot_handoffs(briefing_id, tenant_owner_id, decision, rationale)
  VALUES (p_briefing_id, v_owner, p_decision, p_rationale)
  RETURNING id INTO v_id;

  UPDATE public.owner_copilot_briefings
     SET status = CASE WHEN p_decision = 'approved' THEN 'acted'
                       WHEN p_decision = 'declined' THEN 'dismissed'
                       ELSE 'seen' END,
         updated_at = now()
   WHERE id = p_briefing_id;

  RETURN v_id;
END;
$$;
