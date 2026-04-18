-- ════════════════════════════════════════════════════════════════
-- Phase 8 — Continuous Assurance, External API, Knowledge Federation
-- L3 hard ceiling enforced via clamp_assurance_action_autonomy
-- ════════════════════════════════════════════════════════════════

-- ── 8A: Continuous Assurance & Chaos ──────────────────────────

CREATE TABLE public.internal_agent_chaos_drills (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  drill_key       TEXT NOT NULL,
  target_system   TEXT NOT NULL,
  scenario        TEXT NOT NULL,
  blast_radius    INTEGER NOT NULL DEFAULT 1 CHECK (blast_radius BETWEEN 1 AND 5),
  schedule_cron   TEXT,
  status          TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','running','passed','failed','cancelled')),
  last_run_at     TIMESTAMPTZ,
  last_outcome   JSONB DEFAULT '{}'::jsonb,
  enabled         BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.internal_agent_chaos_drills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_select_chaos" ON public.internal_agent_chaos_drills FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_chaos" ON public.internal_agent_chaos_drills FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update_chaos" ON public.internal_agent_chaos_drills FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "owner_delete_chaos" ON public.internal_agent_chaos_drills FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.internal_agent_assurance_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  period_start    TIMESTAMPTZ NOT NULL,
  period_end      TIMESTAMPTZ NOT NULL,
  assurance_score NUMERIC NOT NULL DEFAULT 0 CHECK (assurance_score BETWEEN 0 AND 1),
  breach_count    INTEGER NOT NULL DEFAULT 0,
  drill_count     INTEGER NOT NULL DEFAULT 0,
  evidence_refs   JSONB NOT NULL DEFAULT '[]'::jsonb,
  summary         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.internal_agent_assurance_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_select_assurance" ON public.internal_agent_assurance_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_assurance" ON public.internal_agent_assurance_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.internal_agent_auto_rollback_events (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL,
  triggered_by        TEXT NOT NULL DEFAULT 'slo_breach',
  slo_snapshot_id     UUID,
  applied_autonomy    INTEGER NOT NULL DEFAULT 0 CHECK (applied_autonomy BETWEEN 0 AND 3),
  rollback_target     TEXT NOT NULL,
  reason              TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'executed' CHECK (status IN ('executed','failed','dry_run')),
  receipt_payload     JSONB DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.internal_agent_auto_rollback_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_select_rollback" ON public.internal_agent_auto_rollback_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_rollback" ON public.internal_agent_auto_rollback_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ── 8B: External Workforce API + Webhooks ─────────────────────

CREATE TABLE public.external_workforce_api_keys (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  tenant_id       TEXT NOT NULL,
  key_id          TEXT NOT NULL UNIQUE,
  secret_hash     TEXT NOT NULL,
  scope           TEXT NOT NULL DEFAULT 'read_only' CHECK (scope IN ('read_only')),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','revoked')),
  last_used_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at      TIMESTAMPTZ
);
ALTER TABLE public.external_workforce_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_select_apikey" ON public.external_workforce_api_keys FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_apikey" ON public.external_workforce_api_keys FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update_apikey" ON public.external_workforce_api_keys FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.external_workforce_subscriptions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL,
  tenant_id         TEXT NOT NULL,
  event_types       TEXT[] NOT NULL DEFAULT '{}',
  callback_url      TEXT NOT NULL,
  signing_secret_hash TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','revoked')),
  failure_count     INTEGER NOT NULL DEFAULT 0,
  last_delivered_at TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.external_workforce_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_select_sub" ON public.external_workforce_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_sub" ON public.external_workforce_subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner_update_sub" ON public.external_workforce_subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "owner_delete_sub" ON public.external_workforce_subscriptions FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.external_workforce_webhook_deliveries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL,
  subscription_id   UUID NOT NULL REFERENCES public.external_workforce_subscriptions(id) ON DELETE CASCADE,
  event_type        TEXT NOT NULL,
  payload_hash      TEXT NOT NULL,
  http_status       INTEGER,
  retry_count       INTEGER NOT NULL DEFAULT 0,
  signed_with_key   TEXT,
  delivered_at      TIMESTAMPTZ,
  error_message     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.external_workforce_webhook_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_select_delivery" ON public.external_workforce_webhook_deliveries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_delivery" ON public.external_workforce_webhook_deliveries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ── 8C: Cross-Tenant Knowledge Federation ─────────────────────

CREATE TABLE public.tenant_federation_optins (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL,
  tenant_id         TEXT NOT NULL UNIQUE,
  opt_in_version    TEXT NOT NULL,
  scope             TEXT NOT NULL DEFAULT 'aggregate_patterns' CHECK (scope IN ('aggregate_patterns')),
  opted_in_by       UUID NOT NULL,
  opted_in_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_federation_optins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_select_optin" ON public.tenant_federation_optins FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_optin" ON public.tenant_federation_optins FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id AND auth.uid() = opted_in_by);
CREATE POLICY "owner_update_optin" ON public.tenant_federation_optins FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.federated_knowledge_shares (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL,
  source_tenant_id  TEXT NOT NULL,
  pattern_hash      TEXT NOT NULL,
  pattern_kind      TEXT NOT NULL,
  dp_epsilon        NUMERIC NOT NULL CHECK (dp_epsilon > 0 AND dp_epsilon <= 1.0),
  redaction_level   TEXT NOT NULL DEFAULT 'aggregate' CHECK (redaction_level IN ('aggregate','anonymized')),
  payload           JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.federated_knowledge_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_select_share" ON public.federated_knowledge_shares FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_share" ON public.federated_knowledge_shares FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.federated_pattern_aggregates (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID NOT NULL,
  pattern_key              TEXT NOT NULL,
  frequency_band           TEXT NOT NULL CHECK (frequency_band IN ('low','medium','high')),
  confidence_band          TEXT NOT NULL CHECK (confidence_band IN ('low','medium','high')),
  contributing_tenant_count INTEGER NOT NULL DEFAULT 0,
  window_start             TIMESTAMPTZ NOT NULL,
  window_end               TIMESTAMPTZ NOT NULL,
  payload                  JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.federated_pattern_aggregates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner_select_agg" ON public.federated_pattern_aggregates FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "owner_insert_agg" ON public.federated_pattern_aggregates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ── Supporting functions ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.clamp_assurance_action_autonomy(p_requested_level INTEGER)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT LEAST(GREATEST(COALESCE(p_requested_level, 0), 0), 3);
$$;

CREATE OR REPLACE FUNCTION public.dp_noise_clamp(p_epsilon NUMERIC)
RETURNS NUMERIC
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT LEAST(GREATEST(COALESCE(p_epsilon, 0.1), 0.01), 1.0);
$$;

CREATE OR REPLACE FUNCTION public.federation_optin_required()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.tenant_federation_optins
    WHERE tenant_id = NEW.source_tenant_id
      AND revoked_at IS NULL
  ) THEN
    RAISE EXCEPTION 'federation_optin_required: tenant % has not opted in', NEW.source_tenant_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_federation_optin_required
BEFORE INSERT ON public.federated_knowledge_shares
FOR EACH ROW EXECUTE FUNCTION public.federation_optin_required();

-- updated_at triggers (reuse global helper if present)
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_chaos_touch BEFORE UPDATE ON public.internal_agent_chaos_drills
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_subs_touch BEFORE UPDATE ON public.external_workforce_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_chaos_user ON public.internal_agent_chaos_drills (user_id, status);
CREATE INDEX idx_assurance_user ON public.internal_agent_assurance_reports (user_id, period_end DESC);
CREATE INDEX idx_rollback_user ON public.internal_agent_auto_rollback_events (user_id, created_at DESC);
CREATE INDEX idx_apikey_tenant ON public.external_workforce_api_keys (tenant_id, status);
CREATE INDEX idx_subs_tenant ON public.external_workforce_subscriptions (tenant_id, status);
CREATE INDEX idx_deliveries_sub ON public.external_workforce_webhook_deliveries (subscription_id, created_at DESC);
CREATE INDEX idx_optins_tenant ON public.tenant_federation_optins (tenant_id) WHERE revoked_at IS NULL;
CREATE INDEX idx_shares_tenant ON public.federated_knowledge_shares (source_tenant_id, created_at DESC);
CREATE INDEX idx_aggregates_pattern ON public.federated_pattern_aggregates (pattern_key, window_end DESC);