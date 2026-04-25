-- Phase 4: AI Orchestration & Explainability Spine

-- ─────────────────────────────────────────────────────────────
-- Table: ai_invocation_plans
-- One row per call routed through the central ai-orchestrator.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_invocation_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id  UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  workspace_id    UUID,
  module_id       TEXT,
  mode            TEXT NOT NULL DEFAULT 'chat'
                  CHECK (mode IN ('chat','simulation','action','voice','recap','tool')),
  capability_key  TEXT,
  model_choice    TEXT,
  context_sources JSONB NOT NULL DEFAULT '{}'::jsonb,
  assumptions     JSONB NOT NULL DEFAULT '[]'::jsonb,
  confidence_target NUMERIC,
  confidence_observed NUMERIC,
  authority_check JSONB NOT NULL DEFAULT '{}'::jsonb,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','planning','executing','completed','blocked','failed')),
  blocked_reason  TEXT,
  receipt_id      UUID,
  inference_receipt_id UUID,
  latency_ms      INTEGER,
  prompt_tokens   INTEGER,
  completion_tokens INTEGER,
  total_tokens    INTEGER,
  estimated_cost_usd NUMERIC,
  error_code      TEXT,
  error_message   TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days')
);

CREATE INDEX IF NOT EXISTS idx_ai_inv_plans_user_created
  ON public.ai_invocation_plans (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_inv_plans_correlation
  ON public.ai_invocation_plans (correlation_id);
CREATE INDEX IF NOT EXISTS idx_ai_inv_plans_workspace_module
  ON public.ai_invocation_plans (workspace_id, module_id);
CREATE INDEX IF NOT EXISTS idx_ai_inv_plans_status
  ON public.ai_invocation_plans (status) WHERE status IN ('pending','planning','executing');

ALTER TABLE public.ai_invocation_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own invocation plans"
  ON public.ai_invocation_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own invocation plans"
  ON public.ai_invocation_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role manages invocation plans"
  ON public.ai_invocation_plans FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins view all invocation plans"
  ON public.ai_invocation_plans FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- ─────────────────────────────────────────────────────────────
-- Table: ai_explainability_traces
-- Per-source contribution rows for one invocation.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_explainability_traces (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invocation_id   UUID NOT NULL REFERENCES public.ai_invocation_plans(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL,
  source_type     TEXT NOT NULL
                  CHECK (source_type IN ('memory','file','advisor','policy','workspace','module','tool','prompt','prior_receipt','live_data','user_input','system')),
  source_id       TEXT,
  source_label    TEXT,
  weight          NUMERIC NOT NULL DEFAULT 1.0,
  role            TEXT NOT NULL DEFAULT 'context'
                  CHECK (role IN ('context','grounding','constraint','citation','tool_input','tool_output','signal')),
  excerpt         TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days')
);

CREATE INDEX IF NOT EXISTS idx_ai_expl_traces_invocation
  ON public.ai_explainability_traces (invocation_id);
CREATE INDEX IF NOT EXISTS idx_ai_expl_traces_user
  ON public.ai_explainability_traces (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_expl_traces_source
  ON public.ai_explainability_traces (source_type, source_id);

ALTER TABLE public.ai_explainability_traces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own traces"
  ON public.ai_explainability_traces FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own traces"
  ON public.ai_explainability_traces FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role manages traces"
  ON public.ai_explainability_traces FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins view all traces"
  ON public.ai_explainability_traces FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));