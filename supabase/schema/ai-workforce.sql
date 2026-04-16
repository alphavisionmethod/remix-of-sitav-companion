-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Synthesized schema for: ai-workforce
-- AUTO-GENERATED from supabase/migrations/. DO NOT EDIT.
-- Regenerate via: npx tsx scripts/db/generate/synthesize-domain-schemas.ts
-- Source migrations: 6
-- Last generated: 2026-04-16T21:35:49.933Z
-- ═══════════════════════════════════════════════════════════════

-- ── 20260406144716_3bf512e5-c3a8-45e0-95d1-10771fc0d9d3.sql ──
-- Extend existing launch_gates
ALTER TABLE public.launch_gates
  ADD COLUMN IF NOT EXISTS feature_key TEXT,
  ADD COLUMN IF NOT EXISTS feature_name TEXT,
  ADD COLUMN IF NOT EXISTS domain TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS honesty_class TEXT DEFAULT 'scaffold',
  ADD COLUMN IF NOT EXISTS has_real_backend BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_real_data BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_real_auth BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_tests BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_error_handling BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS demo_available BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS gate_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS blockers TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS evidence JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scaffold';

-- AI Workforce Role Registry
CREATE TABLE public.ai_workforce_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  prompt_family TEXT,
  default_model_tier TEXT NOT NULL DEFAULT 'economy',
  budget_class TEXT NOT NULL DEFAULT 'economy_admin',
  max_autonomy TEXT NOT NULL DEFAULT 'L2-draft',
  approval_required BOOLEAN NOT NULL DEFAULT true,
  launch_stage TEXT NOT NULL DEFAULT 'scaffold',
  is_active BOOLEAN NOT NULL DEFAULT true,
  cost_per_invocation_cents NUMERIC DEFAULT 0,
  total_invocations INTEGER DEFAULT 0,
  total_cost_cents NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role_key)
);
ALTER TABLE public.ai_workforce_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own workforce roles" ON public.ai_workforce_roles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_workforce_roles_updated_at BEFORE UPDATE ON public.ai_workforce_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI Workforce Task Types
CREATE TABLE public.ai_workforce_task_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  routing_class TEXT NOT NULL DEFAULT 'economy',
  budget_class TEXT NOT NULL DEFAULT 'economy_admin',
  output_schema JSONB,
  approval_required BOOLEAN NOT NULL DEFAULT false,
  max_cost_cents NUMERIC DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_key)
);
ALTER TABLE public.ai_workforce_task_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own task types" ON public.ai_workforce_task_types FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_workforce_task_types_updated_at BEFORE UPDATE ON public.ai_workforce_task_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI Workforce Invocations
CREATE TABLE public.ai_workforce_invocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_key TEXT NOT NULL,
  task_type TEXT NOT NULL,
  capability_key TEXT,
  input_summary TEXT,
  output_summary TEXT,
  output_data JSONB,
  provider_used TEXT,
  model_used TEXT,
  budget_class TEXT,
  mode TEXT NOT NULL DEFAULT 'real',
  status TEXT NOT NULL DEFAULT 'pending',
  cost_cents NUMERIC DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  latency_ms INTEGER,
  fallback_occurred BOOLEAN DEFAULT false,
  receipt_id TEXT,
  error_message TEXT,
  human_approved BOOLEAN,
  approved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.ai_workforce_invocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own invocations" ON public.ai_workforce_invocations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own invocations" ON public.ai_workforce_invocations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own invocations" ON public.ai_workforce_invocations FOR UPDATE USING (auth.uid() = user_id);

-- AI Workforce Recommendations
CREATE TABLE public.ai_workforce_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invocation_id UUID REFERENCES public.ai_workforce_invocations(id),
  role_key TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  severity TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  description TEXT,
  evidence JSONB DEFAULT '[]',
  action_proposed TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  accepted_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  deferred_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own recommendations" ON public.ai_workforce_recommendations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_workforce_recommendations_updated_at BEFORE UPDATE ON public.ai_workforce_recommendations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI Workforce Approval Queue
CREATE TABLE public.ai_workforce_approval_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invocation_id UUID REFERENCES public.ai_workforce_invocations(id),
  role_key TEXT NOT NULL,
  action_type TEXT NOT NULL,
  risk_tier TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  evidence JSONB DEFAULT '{}',
  proposed_changes JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by UUID,
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);
ALTER TABLE public.ai_workforce_approval_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own approval queue" ON public.ai_workforce_approval_queue FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- AI Workforce Cached Outputs
CREATE TABLE public.ai_workforce_cached_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cache_key TEXT NOT NULL,
  role_key TEXT NOT NULL,
  task_type TEXT NOT NULL,
  output_data JSONB NOT NULL,
  cost_cents NUMERIC DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, cache_key)
);
ALTER TABLE public.ai_workforce_cached_outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cached outputs" ON public.ai_workforce_cached_outputs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Connector OAuth Flows
CREATE TABLE public.connector_oauth_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connector_key TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  flow_type TEXT NOT NULL DEFAULT 'authorization_code',
  status TEXT NOT NULL DEFAULT 'pending',
  scopes_requested TEXT[] DEFAULT '{}',
  scopes_granted TEXT[] DEFAULT '{}',
  authorization_url TEXT,
  callback_received BOOLEAN DEFAULT false,
  token_obtained BOOLEAN DEFAULT false,
  token_expires_at TIMESTAMPTZ,
  last_refresh_at TIMESTAMPTZ,
  refresh_count INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.connector_oauth_flows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own oauth flows" ON public.connector_oauth_flows FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_connector_oauth_flows_updated_at BEFORE UPDATE ON public.connector_oauth_flows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Connector Sync Jobs
CREATE TABLE public.connector_sync_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connector_key TEXT NOT NULL,
  sync_type TEXT NOT NULL DEFAULT 'full',
  status TEXT NOT NULL DEFAULT 'pending',
  schedule_cron TEXT,
  last_sync_at TIMESTAMPTZ,
  next_sync_at TIMESTAMPTZ,
  records_synced INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  conflict_resolution TEXT NOT NULL DEFAULT 'server_wins',
  error_message TEXT,
  duration_ms INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.connector_sync_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sync jobs" ON public.connector_sync_jobs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_connector_sync_jobs_updated_at BEFORE UPDATE ON public.connector_sync_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Launch Gate Checks
CREATE TABLE public.launch_gate_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gate_id UUID NOT NULL REFERENCES public.launch_gates(id) ON DELETE CASCADE,
  check_name TEXT NOT NULL,
  check_type TEXT NOT NULL DEFAULT 'manual',
  passed BOOLEAN NOT NULL DEFAULT false,
  evidence TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_by TEXT DEFAULT 'system'
);
ALTER TABLE public.launch_gate_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own gate checks" ON public.launch_gate_checks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Domain Runtime Status
CREATE TABLE public.domain_runtime_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_key TEXT NOT NULL,
  domain_name TEXT NOT NULL,
  runtime_class TEXT NOT NULL DEFAULT 'scaffold',
  has_real_data BOOLEAN DEFAULT false,
  has_real_service BOOLEAN DEFAULT false,
  has_db_tables BOOLEAN DEFAULT false,
  has_rls_policies BOOLEAN DEFAULT false,
  has_edge_functions BOOLEAN DEFAULT false,
  demo_provider_exists BOOLEAN DEFAULT false,
  empty_state_handled BOOLEAN DEFAULT false,
  truth_score INTEGER DEFAULT 0,
  last_verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain_key)
);
ALTER TABLE public.domain_runtime_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own domain status" ON public.domain_runtime_status FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_domain_runtime_status_updated_at BEFORE UPDATE ON public.domain_runtime_status FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Surface Portability Registry
CREATE TABLE public.surface_portability_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  capability_key TEXT NOT NULL,
  capability_name TEXT NOT NULL,
  web_ready BOOLEAN DEFAULT false,
  mobile_ready BOOLEAN DEFAULT false,
  desktop_ready BOOLEAN DEFAULT false,
  watch_ready BOOLEAN DEFAULT false,
  tablet_ready BOOLEAN DEFAULT false,
  response_envelope_neutral BOOLEAN DEFAULT false,
  surface_adapter_exists BOOLEAN DEFAULT false,
  portability_score INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, capability_key)
);
ALTER TABLE public.surface_portability_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own portability" ON public.surface_portability_registry FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_surface_portability_registry_updated_at BEFORE UPDATE ON public.surface_portability_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260406153510_b4c9ed06-a93a-45ef-abaa-b16133391b2d.sql ──
-- Add missing columns to ai_workforce_approval_queue for Part 4 spec
ALTER TABLE public.ai_workforce_approval_queue
  ADD COLUMN IF NOT EXISTS severity text DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS impacted_domain text,
  ADD COLUMN IF NOT EXISTS recommendation_type text DEFAULT 'recommendation',
  ADD COLUMN IF NOT EXISTS estimated_impact text,
  ADD COLUMN IF NOT EXISTS budget_impact text,
  ADD COLUMN IF NOT EXISTS launch_impact text,
  ADD COLUMN IF NOT EXISTS originating_receipt_id text,
  ADD COLUMN IF NOT EXISTS proposed_action_summary text,
  ADD COLUMN IF NOT EXISTS evidence_summary text,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz,
  ADD COLUMN IF NOT EXISTS reviewer_notes text;

-- ── 20260406154942_1cbbbc55-e772-4411-aa5f-a1a49cbff043.sql ──
-- ============================================================
-- PART 1: Enhance existing tables
-- ============================================================

ALTER TABLE public.ai_workforce_roles
  ADD COLUMN IF NOT EXISTS domain_family text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS fallback_budget_class text,
  ADD COLUMN IF NOT EXISTS default_routing_class text NOT NULL DEFAULT 'balanced_assistant',
  ADD COLUMN IF NOT EXISTS autonomy_level text NOT NULL DEFAULT 'recommend_only',
  ADD COLUMN IF NOT EXISTS approval_requirement_class text NOT NULL DEFAULT 'recommended',
  ADD COLUMN IF NOT EXISTS launch_honesty_class text NOT NULL DEFAULT 'internal_only',
  ADD COLUMN IF NOT EXISTS supports_demo_mode boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_wf_roles_domain ON public.ai_workforce_roles(domain_family);

ALTER TABLE public.ai_workforce_task_types
  ADD COLUMN IF NOT EXISTS task_family text NOT NULL DEFAULT 'summarize',
  ADD COLUMN IF NOT EXISTS structured_output_required boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS requires_human_review_for_proposals boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS allows_cached_output boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS supports_scope_diffing boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS launch_stage text NOT NULL DEFAULT 'internal';

CREATE INDEX IF NOT EXISTS idx_wf_tasks_family ON public.ai_workforce_task_types(task_family);

ALTER TABLE public.ai_workforce_invocations
  ADD COLUMN IF NOT EXISTS scope_type text NOT NULL DEFAULT 'system',
  ADD COLUMN IF NOT EXISTS scope_ref text,
  ADD COLUMN IF NOT EXISTS scope_payload jsonb NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS requested_budget_posture text NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS resolved_routing_class text,
  ADD COLUMN IF NOT EXISTS used_cached_output boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cached_output_ref uuid,
  ADD COLUMN IF NOT EXISTS ai_usage_ledger_id uuid,
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS invoked_by_user_id uuid;

CREATE INDEX IF NOT EXISTS idx_wf_inv_scope ON public.ai_workforce_invocations(scope_type);
CREATE INDEX IF NOT EXISTS idx_wf_inv_invoker ON public.ai_workforce_invocations(invoked_by_user_id);

ALTER TABLE public.ai_workforce_recommendations
  ADD COLUMN IF NOT EXISTS output_id uuid,
  ADD COLUMN IF NOT EXISTS recommendation_type text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS risk_tier text NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS estimated_impact text,
  ADD COLUMN IF NOT EXISTS estimated_effort text,
  ADD COLUMN IF NOT EXISTS budget_impact_class text,
  ADD COLUMN IF NOT EXISTS launch_impact_class text,
  ADD COLUMN IF NOT EXISTS evidence_refs jsonb NOT NULL DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS linked_approval_queue_item_id uuid,
  ADD COLUMN IF NOT EXISTS linked_remediation_program_id uuid;

CREATE INDEX IF NOT EXISTS idx_wf_rec_type ON public.ai_workforce_recommendations(recommendation_type);
CREATE INDEX IF NOT EXISTS idx_wf_rec_risk ON public.ai_workforce_recommendations(risk_tier);

ALTER TABLE public.ai_workforce_approval_queue
  ADD COLUMN IF NOT EXISTS recommendation_id uuid,
  ADD COLUMN IF NOT EXISTS summary text,
  ADD COLUMN IF NOT EXISTS budget_impact_class text,
  ADD COLUMN IF NOT EXISTS launch_impact_class text,
  ADD COLUMN IF NOT EXISTS evidence_refs jsonb NOT NULL DEFAULT '[]';

-- ============================================================
-- PART 2: Create missing tables
-- ============================================================

CREATE TABLE IF NOT EXISTS public.ai_workforce_role_task_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid NOT NULL REFERENCES public.ai_workforce_roles(id) ON DELETE CASCADE,
  task_id uuid NOT NULL REFERENCES public.ai_workforce_task_types(id) ON DELETE CASCADE,
  allowed boolean NOT NULL DEFAULT true,
  preferred_budget_class text,
  preferred_routing_class text,
  requires_approval_override boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(role_id, task_id)
);
ALTER TABLE public.ai_workforce_role_task_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own role-task perms" ON public.ai_workforce_role_task_permissions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.ai_workforce_budget_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  budget_class_key text NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL,
  priority_order integer NOT NULL DEFAULT 0,
  premium_allowed boolean NOT NULL DEFAULT false,
  default_max_request_cost_usd numeric(12,4),
  default_daily_budget_usd numeric(12,4),
  default_weekly_budget_usd numeric(12,4),
  default_monthly_budget_usd numeric(12,4),
  fallback_budget_class_key text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, budget_class_key)
);
ALTER TABLE public.ai_workforce_budget_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own budget classes" ON public.ai_workforce_budget_classes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_wf_budget_classes_ts BEFORE UPDATE ON public.ai_workforce_budget_classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.ai_workforce_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  invocation_id uuid NOT NULL REFERENCES public.ai_workforce_invocations(id) ON DELETE CASCADE,
  output_type text NOT NULL DEFAULT 'summary',
  title text,
  summary_text text,
  structured_payload jsonb NOT NULL DEFAULT '{}',
  confidence_class text,
  launch_honesty_class text,
  contains_recommendations boolean NOT NULL DEFAULT false,
  contains_proposed_actions boolean NOT NULL DEFAULT false,
  contains_sensitive_suggestions boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own outputs" ON public.ai_workforce_outputs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_wf_outputs_inv ON public.ai_workforce_outputs(invocation_id);
CREATE INDEX idx_wf_outputs_type ON public.ai_workforce_outputs(output_type);

CREATE TABLE IF NOT EXISTS public.ai_workforce_recommendation_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recommendation_id uuid NOT NULL REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE,
  score_overall numeric(5,2) NOT NULL DEFAULT 0,
  score_accuracy numeric(5,2),
  score_usefulness numeric(5,2),
  score_actionability numeric(5,2),
  score_evidence_quality numeric(5,2),
  score_cost_efficiency numeric(5,2),
  score_launch_honesty_alignment numeric(5,2),
  review_method text NOT NULL DEFAULT 'auto_heuristic',
  reviewed_by_user_id uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_recommendation_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own rec scores" ON public.ai_workforce_recommendation_scores FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_wf_rec_scores_rec ON public.ai_workforce_recommendation_scores(recommendation_id);
CREATE INDEX idx_wf_rec_scores_overall ON public.ai_workforce_recommendation_scores(score_overall);

CREATE TABLE IF NOT EXISTS public.ai_workforce_role_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid NOT NULL REFERENCES public.ai_workforce_roles(id) ON DELETE CASCADE,
  health_state text NOT NULL DEFAULT 'healthy',
  health_reason text,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  last_used_at timestamptz,
  fallback_rate_24h numeric(5,2),
  avg_cost_24h numeric(12,4),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_role_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own role health" ON public.ai_workforce_role_health FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_wf_role_health_role ON public.ai_workforce_role_health(role_id);
CREATE INDEX idx_wf_role_health_state ON public.ai_workforce_role_health(health_state);
CREATE TRIGGER update_wf_role_health_ts BEFORE UPDATE ON public.ai_workforce_role_health FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.ai_workforce_launch_honesty (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid REFERENCES public.ai_workforce_roles(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.ai_workforce_task_types(id) ON DELETE CASCADE,
  launch_honesty_class text NOT NULL DEFAULT 'internal_only',
  public_claim_allowed boolean NOT NULL DEFAULT false,
  notes text,
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_launch_honesty ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own launch honesty" ON public.ai_workforce_launch_honesty FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- PART 3: Views
-- ============================================================

CREATE OR REPLACE VIEW public.v_ai_workforce_role_summary AS
SELECT
  r.id, r.user_id, r.role_key, r.display_name, r.domain_family,
  r.budget_class, r.autonomy_level, r.launch_honesty_class, r.is_active,
  rh.health_state, rh.last_used_at, rh.avg_cost_24h, rh.fallback_rate_24h,
  r.total_invocations, r.total_cost_cents
FROM public.ai_workforce_roles r
LEFT JOIN public.ai_workforce_role_health rh ON rh.role_id = r.id;

CREATE OR REPLACE VIEW public.v_ai_workforce_recent_activity AS
SELECT
  i.id, i.user_id, i.role_key, i.task_type, i.status, i.mode,
  i.budget_class, i.cost_cents, i.tokens_used, i.latency_ms,
  i.fallback_occurred, i.created_at, i.completed_at,
  i.scope_type, i.scope_ref, i.used_cached_output,
  r.display_name as role_display_name
FROM public.ai_workforce_invocations i
LEFT JOIN public.ai_workforce_roles r ON r.role_key = i.role_key AND r.user_id = i.user_id;

CREATE OR REPLACE VIEW public.v_ai_workforce_recommendation_summary AS
SELECT
  rec.id, rec.user_id, rec.title, rec.severity, rec.status,
  rec.recommendation_type, rec.risk_tier, rec.domain,
  rec.estimated_impact, rec.budget_impact_class, rec.launch_impact_class,
  rec.created_at, rec.updated_at,
  rs.score_overall, rs.score_accuracy, rs.score_usefulness,
  rs.score_actionability, rs.review_method,
  rec.linked_approval_queue_item_id
FROM public.ai_workforce_recommendations rec
LEFT JOIN public.ai_workforce_recommendation_scores rs ON rs.recommendation_id = rec.id;

CREATE OR REPLACE VIEW public.v_ai_workforce_queue_summary AS
SELECT
  aq.id, aq.user_id, aq.title, aq.summary, aq.risk_tier,
  aq.severity, aq.status, aq.impacted_domain,
  aq.budget_impact_class, aq.launch_impact_class,
  aq.created_at, aq.resolved_at,
  aq.recommendation_id, aq.invocation_id,
  rec.recommendation_type, rec.role_key as rec_role_key,
  i.role_key as inv_role_key, i.task_type as inv_task_type
FROM public.ai_workforce_approval_queue aq
LEFT JOIN public.ai_workforce_recommendations rec ON rec.id = aq.recommendation_id
LEFT JOIN public.ai_workforce_invocations i ON i.id = aq.invocation_id;

-- ── 20260413001411_29194fdb-420c-4977-806c-2aee4b966aa8.sql ──
-- ============================================================
-- SITA OS — Consolidated Recommendation-to-Execution Migration
-- 20 tables + 4 views, correct dependency order
-- ============================================================

-- Ensure updated_at trigger function exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ============================================================
-- TIER 1 — No dependencies
-- ============================================================

-- 1. ai_workforce_roles
CREATE TABLE IF NOT EXISTS public.ai_workforce_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  council text NOT NULL DEFAULT 'general',
  mission text,
  special_ability text,
  max_autonomy_level integer NOT NULL DEFAULT 2,
  allowed_tools jsonb NOT NULL DEFAULT '[]',
  forbidden_tools jsonb NOT NULL DEFAULT '[]',
  memory_scope text NOT NULL DEFAULT 'session',
  trigger_conditions jsonb NOT NULL DEFAULT '[]',
  escalation_targets jsonb NOT NULL DEFAULT '[]',
  kpis jsonb NOT NULL DEFAULT '[]',
  cost_budget_cents integer NOT NULL DEFAULT 100,
  maturity text NOT NULL DEFAULT 'scaffold',
  status text NOT NULL DEFAULT 'active',
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_roles" ON public.ai_workforce_roles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_roles_role_key ON public.ai_workforce_roles(role_key);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_roles_council ON public.ai_workforce_roles(council);
DROP TRIGGER IF EXISTS update_ai_workforce_roles_updated_at ON public.ai_workforce_roles;
CREATE TRIGGER update_ai_workforce_roles_updated_at BEFORE UPDATE ON public.ai_workforce_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. ai_workforce_task_types
CREATE TABLE IF NOT EXISTS public.ai_workforce_task_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text,
  council text NOT NULL DEFAULT 'general',
  input_schema jsonb NOT NULL DEFAULT '{}',
  output_schema jsonb NOT NULL DEFAULT '{}',
  default_model text,
  max_tokens integer NOT NULL DEFAULT 4000,
  temperature numeric(3,2) NOT NULL DEFAULT 0.7,
  requires_approval boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_task_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_task_types" ON public.ai_workforce_task_types FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_task_types_task_key ON public.ai_workforce_task_types(task_key);
DROP TRIGGER IF EXISTS update_ai_workforce_task_types_updated_at ON public.ai_workforce_task_types;
CREATE TRIGGER update_ai_workforce_task_types_updated_at BEFORE UPDATE ON public.ai_workforce_task_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. ai_workforce_budget_classes
CREATE TABLE IF NOT EXISTS public.ai_workforce_budget_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  priority_order integer NOT NULL DEFAULT 0,
  max_tokens_per_call integer NOT NULL DEFAULT 4000,
  max_cost_cents_per_call integer NOT NULL DEFAULT 50,
  max_calls_per_hour integer NOT NULL DEFAULT 10,
  allowed_models jsonb NOT NULL DEFAULT '[]',
  description text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_budget_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_budget_classes" ON public.ai_workforce_budget_classes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP TRIGGER IF EXISTS update_ai_workforce_budget_classes_updated_at ON public.ai_workforce_budget_classes;
CREATE TRIGGER update_ai_workforce_budget_classes_updated_at BEFORE UPDATE ON public.ai_workforce_budget_classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. flagship_loops
CREATE TABLE IF NOT EXISTS public.flagship_loops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loop_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  primary_persona text NOT NULL DEFAULT 'user',
  launch_importance text NOT NULL DEFAULT 'important_to_launch',
  status text NOT NULL DEFAULT 'active',
  core_routes jsonb NOT NULL DEFAULT '[]',
  core_journeys jsonb NOT NULL DEFAULT '[]',
  primary_services jsonb NOT NULL DEFAULT '[]',
  owner_team text,
  ux_quality_target text NOT NULL DEFAULT 'premium',
  proof_required boolean NOT NULL DEFAULT true,
  launch_honesty_class text NOT NULL DEFAULT 'needs_proof',
  proof_status text NOT NULL DEFAULT 'not_started',
  blocker_count integer NOT NULL DEFAULT 0,
  demo_vs_real text NOT NULL DEFAULT 'demo',
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.flagship_loops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own flagship_loops" ON public.flagship_loops FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_flagship_loops_loop_key ON public.flagship_loops(loop_key);
CREATE INDEX IF NOT EXISTS idx_flagship_loops_status ON public.flagship_loops(status);
DROP TRIGGER IF EXISTS update_flagship_loops_updated_at ON public.flagship_loops;
CREATE TRIGGER update_flagship_loops_updated_at BEFORE UPDATE ON public.flagship_loops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. remediation_programs
CREATE TABLE IF NOT EXISTS public.remediation_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  focus_area text NOT NULL DEFAULT 'general',
  program_status text NOT NULL DEFAULT 'active',
  flagship_loop_key text,
  owner_team text,
  owner_user_id uuid,
  start_at timestamptz,
  target_at timestamptz,
  completed_at timestamptz,
  launch_impact_class text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.remediation_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own remediation_programs" ON public.remediation_programs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_remediation_programs_program_key ON public.remediation_programs(program_key);
CREATE INDEX IF NOT EXISTS idx_remediation_programs_focus_area ON public.remediation_programs(focus_area);
CREATE INDEX IF NOT EXISTS idx_remediation_programs_status ON public.remediation_programs(program_status);
CREATE INDEX IF NOT EXISTS idx_remediation_programs_flagship ON public.remediation_programs(flagship_loop_key);
DROP TRIGGER IF EXISTS update_remediation_programs_updated_at ON public.remediation_programs;
CREATE TRIGGER update_remediation_programs_updated_at BEFORE UPDATE ON public.remediation_programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- TIER 2 — Depends on Tier 1
-- ============================================================

-- 6. ai_workforce_invocations
CREATE TABLE IF NOT EXISTS public.ai_workforce_invocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text NOT NULL,
  task_key text NOT NULL,
  scope_type text,
  scope_ref text,
  scope_payload jsonb NOT NULL DEFAULT '{}',
  budget_posture text NOT NULL DEFAULT 'normal',
  mode text NOT NULL DEFAULT 'standard',
  status text NOT NULL DEFAULT 'pending',
  model_used text,
  tokens_in integer,
  tokens_out integer,
  cost_cents numeric(10,4),
  duration_ms integer,
  error_message text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_invocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_invocations" ON public.ai_workforce_invocations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_invocations_role ON public.ai_workforce_invocations(role_key);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_invocations_task ON public.ai_workforce_invocations(task_key);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_invocations_status ON public.ai_workforce_invocations(status);
DROP TRIGGER IF EXISTS update_ai_workforce_invocations_updated_at ON public.ai_workforce_invocations;
CREATE TRIGGER update_ai_workforce_invocations_updated_at BEFORE UPDATE ON public.ai_workforce_invocations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. ai_workforce_recommendations
CREATE TABLE IF NOT EXISTS public.ai_workforce_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invocation_id uuid REFERENCES public.ai_workforce_invocations(id) ON DELETE SET NULL,
  role_key text NOT NULL,
  task_key text,
  domain text NOT NULL DEFAULT 'general',
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}',
  evidence jsonb NOT NULL DEFAULT '[]',
  severity text NOT NULL DEFAULT 'info',
  confidence numeric(5,2) NOT NULL DEFAULT 0.5,
  status text NOT NULL DEFAULT 'new',
  lifecycle_status text NOT NULL DEFAULT 'new',
  approval_decision_at timestamptz,
  approved_by_user_id uuid,
  rejected_by_user_id uuid,
  deferred_reason text,
  execution_required boolean NOT NULL DEFAULT false,
  execution_priority text,
  flagship_loop_key text,
  customer_journey_impact_key text,
  launch_blocker_impact_class text,
  outcome_verification_required boolean NOT NULL DEFAULT false,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_recommendations" ON public.ai_workforce_recommendations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_rec_status ON public.ai_workforce_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_rec_lifecycle ON public.ai_workforce_recommendations(lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_rec_role ON public.ai_workforce_recommendations(role_key);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_rec_domain ON public.ai_workforce_recommendations(domain);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_rec_exec ON public.ai_workforce_recommendations(execution_required);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_rec_flagship ON public.ai_workforce_recommendations(flagship_loop_key);
DROP TRIGGER IF EXISTS update_ai_workforce_recommendations_updated_at ON public.ai_workforce_recommendations;
CREATE TRIGGER update_ai_workforce_recommendations_updated_at BEFORE UPDATE ON public.ai_workforce_recommendations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. ai_workforce_approval_queue
CREATE TABLE IF NOT EXISTS public.ai_workforce_approval_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id uuid REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE,
  title text NOT NULL,
  summary text NOT NULL DEFAULT '',
  priority text NOT NULL DEFAULT 'normal',
  status text NOT NULL DEFAULT 'pending',
  reviewer_user_id uuid,
  reviewer_comments text,
  evidence_links jsonb NOT NULL DEFAULT '[]',
  cost_implications text,
  launch_implications text,
  remediation_binding_id uuid,
  decision_at timestamptz,
  escalated boolean NOT NULL DEFAULT false,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_approval_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_approval_queue" ON public.ai_workforce_approval_queue FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_approval_queue_status ON public.ai_workforce_approval_queue(status);
CREATE INDEX IF NOT EXISTS idx_approval_queue_rec ON public.ai_workforce_approval_queue(recommendation_id);
DROP TRIGGER IF EXISTS update_ai_workforce_approval_queue_updated_at ON public.ai_workforce_approval_queue;
CREATE TRIGGER update_ai_workforce_approval_queue_updated_at BEFORE UPDATE ON public.ai_workforce_approval_queue FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. ai_workforce_cached_outputs
CREATE TABLE IF NOT EXISTS public.ai_workforce_cached_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key text NOT NULL,
  role_key text NOT NULL,
  task_key text NOT NULL,
  output jsonb NOT NULL DEFAULT '{}',
  model_used text,
  tokens_used integer,
  cost_cents numeric(10,4),
  expires_at timestamptz,
  hit_count integer NOT NULL DEFAULT 0,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_cached_outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_cached_outputs" ON public.ai_workforce_cached_outputs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_cached_outputs_cache_key ON public.ai_workforce_cached_outputs(cache_key);
DROP TRIGGER IF EXISTS update_ai_workforce_cached_outputs_updated_at ON public.ai_workforce_cached_outputs;
CREATE TRIGGER update_ai_workforce_cached_outputs_updated_at BEFORE UPDATE ON public.ai_workforce_cached_outputs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. remediation_tasks
CREATE TABLE IF NOT EXISTS public.remediation_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES public.remediation_programs(id) ON DELETE SET NULL,
  task_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL DEFAULT '',
  task_status text NOT NULL DEFAULT 'new',
  execution_type text NOT NULL DEFAULT 'frontend',
  owner_team text,
  owner_user_id uuid,
  related_route_key text,
  related_service_key text,
  related_customer_journey_key text,
  related_flagship_loop_key text,
  due_at timestamptz,
  completed_at timestamptz,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.remediation_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own remediation_tasks" ON public.remediation_tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_remediation_tasks_key ON public.remediation_tasks(task_key);
CREATE INDEX IF NOT EXISTS idx_remediation_tasks_program ON public.remediation_tasks(program_id);
CREATE INDEX IF NOT EXISTS idx_remediation_tasks_status ON public.remediation_tasks(task_status);
CREATE INDEX IF NOT EXISTS idx_remediation_tasks_route ON public.remediation_tasks(related_route_key);
CREATE INDEX IF NOT EXISTS idx_remediation_tasks_service ON public.remediation_tasks(related_service_key);
CREATE INDEX IF NOT EXISTS idx_remediation_tasks_journey ON public.remediation_tasks(related_customer_journey_key);
DROP TRIGGER IF EXISTS update_remediation_tasks_updated_at ON public.remediation_tasks;
CREATE TRIGGER update_remediation_tasks_updated_at BEFORE UPDATE ON public.remediation_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- TIER 3 — Depends on Tier 2
-- ============================================================

-- 11. ai_workforce_outputs
CREATE TABLE IF NOT EXISTS public.ai_workforce_outputs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invocation_id uuid REFERENCES public.ai_workforce_invocations(id) ON DELETE CASCADE NOT NULL,
  output_type text NOT NULL DEFAULT 'text',
  content jsonb NOT NULL DEFAULT '{}',
  quality_score numeric(5,2),
  flagged boolean NOT NULL DEFAULT false,
  flag_reason text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_outputs" ON public.ai_workforce_outputs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_ai_workforce_outputs_invocation ON public.ai_workforce_outputs(invocation_id);

-- 12. ai_workforce_recommendation_scores
CREATE TABLE IF NOT EXISTS public.ai_workforce_recommendation_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id uuid REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE NOT NULL,
  score_overall numeric(5,2) NOT NULL DEFAULT 0,
  score_accuracy numeric(5,2),
  score_usefulness numeric(5,2),
  score_actionability numeric(5,2),
  score_evidence_quality numeric(5,2),
  score_cost_efficiency numeric(5,2),
  score_launch_honesty_alignment numeric(5,2),
  score_execution_success_likelihood numeric(5,2),
  score_realized_outcome_value numeric(5,2),
  review_method text NOT NULL DEFAULT 'human',
  reviewed_by_user_id uuid,
  notes text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_recommendation_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_recommendation_scores" ON public.ai_workforce_recommendation_scores FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_rec_scores_rec ON public.ai_workforce_recommendation_scores(recommendation_id);

-- 13. ai_workforce_role_task_permissions
CREATE TABLE IF NOT EXISTS public.ai_workforce_role_task_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text NOT NULL,
  task_key text NOT NULL,
  permission_level text NOT NULL DEFAULT 'allowed',
  max_autonomy integer NOT NULL DEFAULT 2,
  requires_approval boolean NOT NULL DEFAULT true,
  budget_class_key text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(role_key, task_key, user_id)
);
ALTER TABLE public.ai_workforce_role_task_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_role_task_permissions" ON public.ai_workforce_role_task_permissions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 14. ai_workforce_role_health
CREATE TABLE IF NOT EXISTS public.ai_workforce_role_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text NOT NULL,
  health_status text NOT NULL DEFAULT 'healthy',
  total_invocations integer NOT NULL DEFAULT 0,
  successful_invocations integer NOT NULL DEFAULT 0,
  failed_invocations integer NOT NULL DEFAULT 0,
  avg_latency_ms integer,
  avg_cost_cents numeric(10,4),
  avg_quality_score numeric(5,2),
  last_invocation_at timestamptz,
  last_error text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_role_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_role_health" ON public.ai_workforce_role_health FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_role_health_role ON public.ai_workforce_role_health(role_key);
DROP TRIGGER IF EXISTS update_ai_workforce_role_health_updated_at ON public.ai_workforce_role_health;
CREATE TRIGGER update_ai_workforce_role_health_updated_at BEFORE UPDATE ON public.ai_workforce_role_health FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 15. ai_workforce_launch_honesty
CREATE TABLE IF NOT EXISTS public.ai_workforce_launch_honesty (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key text NOT NULL,
  launch_claim text NOT NULL DEFAULT '',
  actual_status text NOT NULL DEFAULT 'scaffold',
  honesty_score numeric(5,2) NOT NULL DEFAULT 0,
  evidence jsonb NOT NULL DEFAULT '[]',
  last_audit_at timestamptz,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_workforce_launch_honesty ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_workforce_launch_honesty" ON public.ai_workforce_launch_honesty FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_launch_honesty_role ON public.ai_workforce_launch_honesty(role_key);
DROP TRIGGER IF EXISTS update_ai_workforce_launch_honesty_updated_at ON public.ai_workforce_launch_honesty;
CREATE TRIGGER update_ai_workforce_launch_honesty_updated_at BEFORE UPDATE ON public.ai_workforce_launch_honesty FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 16. recommendation_execution_bindings
CREATE TABLE IF NOT EXISTS public.recommendation_execution_bindings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id uuid REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE NOT NULL,
  approval_queue_item_id uuid REFERENCES public.ai_workforce_approval_queue(id) ON DELETE SET NULL,
  binding_type text NOT NULL DEFAULT 'remediation_task',
  binding_status text NOT NULL DEFAULT 'bound',
  linked_program_id uuid REFERENCES public.remediation_programs(id) ON DELETE SET NULL,
  linked_task_id uuid REFERENCES public.remediation_tasks(id) ON DELETE SET NULL,
  owner_team text,
  owner_user_id uuid,
  due_at timestamptz,
  completed_at timestamptz,
  notes text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.recommendation_execution_bindings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own recommendation_execution_bindings" ON public.recommendation_execution_bindings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_exec_bindings_rec ON public.recommendation_execution_bindings(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_exec_bindings_status ON public.recommendation_execution_bindings(binding_status);
CREATE INDEX IF NOT EXISTS idx_exec_bindings_type ON public.recommendation_execution_bindings(binding_type);
CREATE INDEX IF NOT EXISTS idx_exec_bindings_team ON public.recommendation_execution_bindings(owner_team);
DROP TRIGGER IF EXISTS update_recommendation_execution_bindings_updated_at ON public.recommendation_execution_bindings;
CREATE TRIGGER update_recommendation_execution_bindings_updated_at BEFORE UPDATE ON public.recommendation_execution_bindings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 17. outcome_verifications (legacy compatibility)
CREATE TABLE IF NOT EXISTS public.outcome_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id uuid REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE NOT NULL,
  verification_type text NOT NULL DEFAULT 'manual',
  expected_outcome text NOT NULL DEFAULT '',
  actual_outcome text,
  status text NOT NULL DEFAULT 'pending',
  verified_by_user_id uuid,
  verified_at timestamptz,
  notes text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.outcome_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own outcome_verifications" ON public.outcome_verifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_outcome_verifications_rec ON public.outcome_verifications(recommendation_id);
DROP TRIGGER IF EXISTS update_outcome_verifications_updated_at ON public.outcome_verifications;
CREATE TRIGGER update_outcome_verifications_updated_at BEFORE UPDATE ON public.outcome_verifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- TIER 4 — Depends on Tier 3
-- ============================================================

-- 18. recommendation_execution_events
CREATE TABLE IF NOT EXISTS public.recommendation_execution_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  binding_id uuid REFERENCES public.recommendation_execution_bindings(id) ON DELETE CASCADE NOT NULL,
  event_type text NOT NULL,
  summary text NOT NULL DEFAULT '',
  details jsonb NOT NULL DEFAULT '{}',
  created_by_user_id uuid,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.recommendation_execution_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own recommendation_execution_events" ON public.recommendation_execution_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_exec_events_binding ON public.recommendation_execution_events(binding_id);
CREATE INDEX IF NOT EXISTS idx_exec_events_type ON public.recommendation_execution_events(event_type);

-- 19. recommendation_outcome_verifications
CREATE TABLE IF NOT EXISTS public.recommendation_outcome_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id uuid REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE NOT NULL,
  binding_id uuid REFERENCES public.recommendation_execution_bindings(id) ON DELETE SET NULL,
  verification_method text NOT NULL DEFAULT 'manual_review',
  expected_improvement text NOT NULL DEFAULT '',
  actual_improvement text,
  verification_status text NOT NULL DEFAULT 'pending',
  customer_journey_delta text,
  launch_truth_delta text,
  notes text,
  verified_by_user_id uuid,
  verified_at timestamptz,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.recommendation_outcome_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own recommendation_outcome_verifications" ON public.recommendation_outcome_verifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_outcome_ver_rec ON public.recommendation_outcome_verifications(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_outcome_ver_status ON public.recommendation_outcome_verifications(verification_status);

-- 20. recommendation_learning_signals
CREATE TABLE IF NOT EXISTS public.recommendation_learning_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recommendation_id uuid REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE NOT NULL,
  signal_type text NOT NULL,
  signal_strength numeric(5,2) NOT NULL DEFAULT 0,
  signal_source text NOT NULL DEFAULT 'human_review',
  notes text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.recommendation_learning_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own recommendation_learning_signals" ON public.recommendation_learning_signals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_learning_signals_rec ON public.recommendation_learning_signals(recommendation_id);
CREATE INDEX IF NOT EXISTS idx_learning_signals_type ON public.recommendation_learning_signals(signal_type);

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW public.v_recommendation_closure_summary AS
SELECT
  r.id AS recommendation_id,
  r.title,
  r.role_key,
  r.domain,
  r.lifecycle_status,
  r.flagship_loop_key,
  r.execution_required,
  r.outcome_verification_required,
  COALESCE(s.avg_score, 0) AS avg_score,
  aq.status AS approval_status,
  eb.binding_status,
  eb.binding_type,
  rp.display_name AS program_name,
  ov.verification_status AS outcome_status,
  r.user_id,
  r.created_at
FROM public.ai_workforce_recommendations r
LEFT JOIN LATERAL (
  SELECT AVG(score_overall) AS avg_score
  FROM public.ai_workforce_recommendation_scores
  WHERE recommendation_id = r.id
) s ON true
LEFT JOIN public.ai_workforce_approval_queue aq ON aq.recommendation_id = r.id
LEFT JOIN public.recommendation_execution_bindings eb ON eb.recommendation_id = r.id
LEFT JOIN public.remediation_programs rp ON rp.id = eb.linked_program_id
LEFT JOIN public.recommendation_outcome_verifications ov ON ov.recommendation_id = r.id;

CREATE OR REPLACE VIEW public.v_remediation_program_summary AS
SELECT
  rp.id AS program_id,
  rp.program_key,
  rp.display_name,
  rp.focus_area,
  rp.program_status,
  rp.flagship_loop_key,
  rp.owner_team,
  rp.launch_impact_class,
  COALESCE(t.total_tasks, 0) AS total_tasks,
  COALESCE(t.done_tasks, 0) AS done_tasks,
  COALESCE(t.blocked_tasks, 0) AS blocked_tasks,
  COALESCE(b.linked_recs, 0) AS linked_recommendations,
  rp.user_id,
  rp.created_at
FROM public.remediation_programs rp
LEFT JOIN LATERAL (
  SELECT
    COUNT(*) AS total_tasks,
    COUNT(*) FILTER (WHERE task_status = 'done') AS done_tasks,
    COUNT(*) FILTER (WHERE task_status = 'blocked') AS blocked_tasks
  FROM public.remediation_tasks
  WHERE program_id = rp.id
) t ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS linked_recs
  FROM public.recommendation_execution_bindings
  WHERE linked_program_id = rp.id
) b ON true;

CREATE OR REPLACE VIEW public.v_recommendation_execution_pipeline AS
SELECT
  lifecycle_status AS stage,
  COUNT(*) AS count,
  user_id
FROM public.ai_workforce_recommendations
GROUP BY lifecycle_status, user_id;

CREATE OR REPLACE VIEW public.v_outcome_verification_summary AS
SELECT
  r.domain,
  r.role_key,
  r.flagship_loop_key,
  ov.verification_status,
  ov.verification_method,
  COUNT(*) AS count,
  r.user_id
FROM public.recommendation_outcome_verifications ov
JOIN public.ai_workforce_recommendations r ON r.id = ov.recommendation_id
GROUP BY r.domain, r.role_key, r.flagship_loop_key, ov.verification_status, ov.verification_method, r.user_id;

-- ── 20260413113021_7af60c5f-80a1-47e6-a76a-de77cfe32d4b.sql ──
-- AI inference receipts (proves BLK-001, BLK-003, BLK-005)
CREATE TABLE public.ai_inference_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  model TEXT NOT NULL,
  capability_id TEXT,
  prompt_family TEXT,
  input_tokens INT DEFAULT 0,
  output_tokens INT DEFAULT 0,
  latency_ms INT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.ai_inference_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own ai_inference_receipts" ON public.ai_inference_receipts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own ai_inference_receipts" ON public.ai_inference_receipts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Connector OAuth flows (proves BLK-002)
CREATE TABLE public.connector_oauth_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  status TEXT DEFAULT 'initiated',
  scopes TEXT[],
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.connector_oauth_flows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own connector_oauth_flows" ON public.connector_oauth_flows
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own connector_oauth_flows" ON public.connector_oauth_flows
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Notification delivery receipts (proves BLK-004)
CREATE TABLE public.notification_delivery_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_id UUID,
  channel TEXT DEFAULT 'web_push',
  status TEXT DEFAULT 'pending',
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notification_delivery_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notification_delivery_receipts" ON public.notification_delivery_receipts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own notification_delivery_receipts" ON public.notification_delivery_receipts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Connector sync runs (proves BLK-006)
CREATE TABLE public.connector_sync_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  connector TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  records_synced INT DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.connector_sync_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own connector_sync_runs" ON public.connector_sync_runs
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own connector_sync_runs" ON public.connector_sync_runs
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ── 20260413113118_147fab0d-71ee-4740-ac63-1edc02e21b46.sql ──
-- Add missing columns to ai_inference_receipts
ALTER TABLE public.ai_inference_receipts
  ADD COLUMN IF NOT EXISTS provider TEXT,
  ADD COLUMN IF NOT EXISTS cost_estimate_cents INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS route_reason TEXT,
  ADD COLUMN IF NOT EXISTS verification_outcome TEXT;

-- Add missing columns to notification_delivery_receipts
ALTER TABLE public.notification_delivery_receipts
  ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'web',
  ADD COLUMN IF NOT EXISTS failure_reason TEXT,
  ADD COLUMN IF NOT EXISTS latency_ms INT,
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;
