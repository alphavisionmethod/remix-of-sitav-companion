
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Dual Reality / Demo Mode System Schema
-- 14 tables for governing real/demo/sandbox runtime modes
-- ═══════════════════════════════════════════════════════════════

-- 1. Reality Modes Registry
CREATE TABLE public.reality_modes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mode_key TEXT NOT NULL CHECK (mode_key IN ('real', 'demo', 'sandbox', 'dev_demo')),
  name TEXT NOT NULL,
  description TEXT,
  launch_honesty_class TEXT NOT NULL DEFAULT 'truthful',
  default_policy_profile_id UUID,
  default_analytics_profile_id UUID,
  default_ai_policy_profile_id UUID,
  side_effect_policy_id UUID,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, mode_key)
);

-- 2. Reality Mode Resolutions
CREATE TABLE public.reality_mode_resolutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tenant_id TEXT,
  workspace_id TEXT,
  session_id TEXT,
  route TEXT,
  resolved_mode TEXT NOT NULL DEFAULT 'real',
  resolution_source TEXT NOT NULL DEFAULT 'environment_default'
    CHECK (resolution_source IN ('tenant', 'feature_flag', 'demo_token', 'operator_override', 'environment_default', 'scenario_binding', 'other')),
  scenario_id UUID,
  policy_profile_id UUID,
  ai_policy_profile_id UUID,
  analytics_profile_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Demo Scenarios
CREATE TABLE public.demo_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scenario_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'investor'
    CHECK (category IN ('investor', 'founder', 'family_office', 'enterprise', 'vertical', 'internal_training', 'sales', 'other')),
  target_audience TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'active', 'archived')),
  version INTEGER NOT NULL DEFAULT 1,
  narrative_summary TEXT,
  domain_coverage TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, scenario_key)
);

-- 4. Demo Scenario Entities
CREATE TABLE public.demo_scenario_entities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scenario_id UUID REFERENCES public.demo_scenarios(id) ON DELETE CASCADE NOT NULL,
  entity_type TEXT NOT NULL
    CHECK (entity_type IN ('person', 'household', 'company', 'account', 'deal', 'asset', 'document', 'project', 'opportunity', 'notification', 'advisor', 'task', 'workflow', 'other')),
  entity_key TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  visibility_scope TEXT NOT NULL DEFAULT 'demo',
  source_ref TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Demo Scenario Relationships
CREATE TABLE public.demo_scenario_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scenario_id UUID REFERENCES public.demo_scenarios(id) ON DELETE CASCADE NOT NULL,
  from_entity_id UUID REFERENCES public.demo_scenario_entities(id) ON DELETE CASCADE NOT NULL,
  to_entity_id UUID REFERENCES public.demo_scenario_entities(id) ON DELETE CASCADE NOT NULL,
  relationship_type TEXT NOT NULL,
  visibility_scope TEXT NOT NULL DEFAULT 'demo',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Demo Scenario Artifacts
CREATE TABLE public.demo_scenario_artifacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scenario_id UUID REFERENCES public.demo_scenarios(id) ON DELETE CASCADE NOT NULL,
  artifact_type TEXT NOT NULL
    CHECK (artifact_type IN ('boardroom_packet', 'ai_summary', 'workflow_trace', 'receipt', 'notification_set', 'document_set', 'financial_snapshot', 'portfolio_snapshot', 'timeline_event_set', 'other')),
  label TEXT NOT NULL,
  artifact_ref TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  confidence_language TEXT,
  deterministic BOOLEAN NOT NULL DEFAULT true,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Mode-Aware Providers
CREATE TABLE public.mode_aware_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL,
  provider_interface_name TEXT NOT NULL,
  real_implementation_ref TEXT,
  demo_implementation_ref TEXT,
  sandbox_implementation_ref TEXT,
  current_version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain, provider_interface_name)
);

-- 8. Demo Policy Profiles
CREATE TABLE public.demo_policy_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  external_writes_allowed BOOLEAN NOT NULL DEFAULT false,
  connector_writes_allowed BOOLEAN NOT NULL DEFAULT false,
  notifications_live BOOLEAN NOT NULL DEFAULT false,
  approval_executes_live BOOLEAN NOT NULL DEFAULT false,
  billing_live BOOLEAN NOT NULL DEFAULT false,
  ai_execution_mode TEXT NOT NULL DEFAULT 'cached_only'
    CHECK (ai_execution_mode IN ('disabled', 'cached_only', 'scenario_grounded', 'limited_live', 'full_live_for_internal_only')),
  receipt_mode TEXT NOT NULL DEFAULT 'demo_receipt'
    CHECK (receipt_mode IN ('demo_receipt', 'simulated_receipt', 'real_receipt_with_demo_label')),
  analytics_mode TEXT NOT NULL DEFAULT 'separate'
    CHECK (analytics_mode IN ('separate', 'discard', 'internal_only')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Demo Actions
CREATE TABLE public.demo_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scenario_id UUID REFERENCES public.demo_scenarios(id) ON DELETE SET NULL,
  feature_id TEXT,
  action_type TEXT NOT NULL,
  actor_id TEXT,
  route TEXT,
  execution_mode TEXT NOT NULL DEFAULT 'simulated'
    CHECK (execution_mode IN ('simulated', 'preview_only', 'blocked', 'safe_internal_write', 'other')),
  receipt_id UUID,
  outcome_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Demo Receipts
CREATE TABLE public.demo_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scenario_id UUID REFERENCES public.demo_scenarios(id) ON DELETE SET NULL,
  feature_id TEXT,
  receipt_type TEXT NOT NULL,
  actor_id TEXT,
  summary TEXT,
  simulated BOOLEAN NOT NULL DEFAULT true,
  visible_to_roles TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Demo Analytics
CREATE TABLE public.demo_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scenario_id UUID REFERENCES public.demo_scenarios(id) ON DELETE SET NULL,
  event_name TEXT NOT NULL,
  route TEXT,
  actor_id TEXT,
  mode TEXT NOT NULL DEFAULT 'demo',
  session_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Mode Access Policies
CREATE TABLE public.mode_access_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mode_key TEXT NOT NULL,
  allowed_roles TEXT[] NOT NULL DEFAULT '{}',
  allowed_tenants TEXT[] NOT NULL DEFAULT '{}',
  requires_demo_token BOOLEAN NOT NULL DEFAULT false,
  requires_operator_approval BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Scenario Launch Profiles
CREATE TABLE public.scenario_launch_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  scenario_id UUID REFERENCES public.demo_scenarios(id) ON DELETE CASCADE NOT NULL,
  launch_path TEXT,
  default_landing_route TEXT,
  route_set TEXT[] NOT NULL DEFAULT '{}',
  enabled_domains TEXT[] NOT NULL DEFAULT '{}',
  hidden_domains TEXT[] NOT NULL DEFAULT '{}',
  startup_context JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Mode Truth Labels
CREATE TABLE public.mode_truth_labels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mode_key TEXT NOT NULL,
  banner_style TEXT NOT NULL DEFAULT 'subtle',
  disclosure_level TEXT NOT NULL DEFAULT 'operator_only',
  proof_label_style TEXT NOT NULL DEFAULT 'demo_badge',
  analytics_segregation_label TEXT NOT NULL DEFAULT 'demo',
  launch_claim_class TEXT NOT NULL DEFAULT 'demo_only',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, mode_key)
);

-- ── Enable RLS on all tables ─────────────────────────────────

ALTER TABLE public.reality_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reality_mode_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_scenario_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_scenario_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_scenario_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mode_aware_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_policy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demo_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mode_access_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scenario_launch_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mode_truth_labels ENABLE ROW LEVEL SECURITY;

-- ── RLS Policies ─────────────────────────────────────────────

CREATE POLICY "Users manage own reality_modes" ON public.reality_modes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own reality_mode_resolutions" ON public.reality_mode_resolutions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own demo_scenarios" ON public.demo_scenarios FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own demo_scenario_entities" ON public.demo_scenario_entities FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own demo_scenario_relationships" ON public.demo_scenario_relationships FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own demo_scenario_artifacts" ON public.demo_scenario_artifacts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own mode_aware_providers" ON public.mode_aware_providers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own demo_policy_profiles" ON public.demo_policy_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own demo_actions" ON public.demo_actions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own demo_receipts" ON public.demo_receipts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own demo_analytics" ON public.demo_analytics FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own mode_access_policies" ON public.mode_access_policies FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own scenario_launch_profiles" ON public.scenario_launch_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own mode_truth_labels" ON public.mode_truth_labels FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── Updated_at triggers ──────────────────────────────────────

CREATE TRIGGER update_reality_modes_updated_at BEFORE UPDATE ON public.reality_modes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_demo_scenarios_updated_at BEFORE UPDATE ON public.demo_scenarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mode_aware_providers_updated_at BEFORE UPDATE ON public.mode_aware_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_demo_policy_profiles_updated_at BEFORE UPDATE ON public.demo_policy_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mode_access_policies_updated_at BEFORE UPDATE ON public.mode_access_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_mode_truth_labels_updated_at BEFORE UPDATE ON public.mode_truth_labels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── Indexes ──────────────────────────────────────────────────

CREATE INDEX idx_reality_mode_resolutions_user ON public.reality_mode_resolutions(user_id, created_at DESC);
CREATE INDEX idx_demo_scenarios_user_status ON public.demo_scenarios(user_id, status);
CREATE INDEX idx_demo_scenario_entities_scenario ON public.demo_scenario_entities(scenario_id);
CREATE INDEX idx_demo_scenario_relationships_scenario ON public.demo_scenario_relationships(scenario_id);
CREATE INDEX idx_demo_scenario_artifacts_scenario ON public.demo_scenario_artifacts(scenario_id);
CREATE INDEX idx_demo_actions_scenario ON public.demo_actions(scenario_id, created_at DESC);
CREATE INDEX idx_demo_analytics_scenario ON public.demo_analytics(scenario_id, created_at DESC);
CREATE INDEX idx_scenario_launch_profiles_scenario ON public.scenario_launch_profiles(scenario_id);
