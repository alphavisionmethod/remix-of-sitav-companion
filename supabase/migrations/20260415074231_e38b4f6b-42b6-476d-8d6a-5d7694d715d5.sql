
-- ═══════════════════════════════════════════════════════════════
-- Part 2: Production-Grade Platform Glue Tables
-- ═══════════════════════════════════════════════════════════════

-- 1. Domain Ownership Registry
CREATE TABLE public.domain_ownership_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  owning_service TEXT NOT NULL,
  plane TEXT NOT NULL DEFAULT 'shared-core',
  team TEXT NOT NULL DEFAULT 'platform',
  description TEXT DEFAULT '',
  dependencies JSONB DEFAULT '[]'::jsonb,
  api_surface JSONB DEFAULT '{"internal": [], "public": []}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.domain_ownership_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view domain ownership" ON public.domain_ownership_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage domain ownership" ON public.domain_ownership_registry FOR ALL TO authenticated USING (public.has_admin_permission(auth.uid(), 'platform.admin')) WITH CHECK (public.has_admin_permission(auth.uid(), 'platform.admin'));
CREATE TRIGGER update_domain_ownership_updated_at BEFORE UPDATE ON public.domain_ownership_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Service Identity Registry
CREATE TABLE public.service_identity_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  plane TEXT NOT NULL DEFAULT 'shared-core',
  scopes TEXT[] NOT NULL DEFAULT '{}',
  trust_level TEXT NOT NULL DEFAULT 'standard',
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_authenticated_at TIMESTAMPTZ,
  token_ttl_seconds INTEGER NOT NULL DEFAULT 3600,
  allowed_targets TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.service_identity_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view service identities" ON public.service_identity_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage service identities" ON public.service_identity_registry FOR ALL TO authenticated USING (public.has_admin_permission(auth.uid(), 'platform.admin')) WITH CHECK (public.has_admin_permission(auth.uid(), 'platform.admin'));
CREATE TRIGGER update_service_identity_updated_at BEFORE UPDATE ON public.service_identity_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Admin Safety Actions
CREATE TABLE public.admin_safety_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  risk_level TEXT NOT NULL DEFAULT 'medium',
  requires_dry_run BOOLEAN NOT NULL DEFAULT false,
  requires_confirmation BOOLEAN NOT NULL DEFAULT true,
  requires_dual_approval BOOLEAN NOT NULL DEFAULT false,
  requires_justification BOOLEAN NOT NULL DEFAULT true,
  cooldown_seconds INTEGER NOT NULL DEFAULT 0,
  impact_summary_template TEXT DEFAULT '',
  required_permission TEXT NOT NULL,
  plane TEXT NOT NULL DEFAULT 'control',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_safety_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view safety actions" ON public.admin_safety_actions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage safety actions" ON public.admin_safety_actions FOR ALL TO authenticated USING (public.has_admin_permission(auth.uid(), 'platform.admin')) WITH CHECK (public.has_admin_permission(auth.uid(), 'platform.admin'));
CREATE TRIGGER update_admin_safety_updated_at BEFORE UPDATE ON public.admin_safety_actions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Admin Action Confirmations
CREATE TABLE public.admin_action_confirmations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_key TEXT NOT NULL,
  actor_user_id UUID NOT NULL,
  justification TEXT NOT NULL DEFAULT '',
  dry_run_result JSONB,
  impact_summary TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  params JSONB DEFAULT '{}'::jsonb,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  rejected_by UUID,
  rejected_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  cooldown_expires_at TIMESTAMPTZ,
  correlation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_action_confirmations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view confirmations" ON public.admin_action_confirmations FOR SELECT TO authenticated USING (public.has_admin_permission(auth.uid(), 'security.audit'));
CREATE POLICY "Admins can create confirmations" ON public.admin_action_confirmations FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_user_id);
CREATE POLICY "Admins can update confirmations" ON public.admin_action_confirmations FOR UPDATE TO authenticated USING (public.has_admin_permission(auth.uid(), 'security.audit'));
CREATE TRIGGER update_admin_confirmations_updated_at BEFORE UPDATE ON public.admin_action_confirmations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Support Cases
CREATE TABLE public.support_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'normal',
  status TEXT NOT NULL DEFAULT 'open',
  assigned_to UUID,
  escalated_to_role TEXT,
  correlation_id TEXT,
  diagnostic_package JSONB,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  self_repair_attempted BOOLEAN NOT NULL DEFAULT false,
  self_repair_result TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.support_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own support cases" ON public.support_cases FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create support cases" ON public.support_cases FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cases" ON public.support_cases FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Support agents can view all cases" ON public.support_cases FOR SELECT TO authenticated USING (public.has_admin_permission(auth.uid(), 'support.cases'));
CREATE POLICY "Support agents can update all cases" ON public.support_cases FOR UPDATE TO authenticated USING (public.has_admin_permission(auth.uid(), 'support.cases'));
CREATE TRIGGER update_support_cases_updated_at BEFORE UPDATE ON public.support_cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Support Case Events
CREATE TABLE public.support_case_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  case_id UUID NOT NULL REFERENCES public.support_cases(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL DEFAULT 'comment',
  actor_user_id UUID NOT NULL,
  content TEXT DEFAULT '',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.support_case_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own case events" ON public.support_case_events FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.support_cases sc WHERE sc.id = case_id AND sc.user_id = auth.uid())
);
CREATE POLICY "Users can add events to own cases" ON public.support_case_events FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = actor_user_id AND EXISTS (SELECT 1 FROM public.support_cases sc WHERE sc.id = case_id AND sc.user_id = auth.uid())
);
CREATE POLICY "Support agents can view all case events" ON public.support_case_events FOR SELECT TO authenticated USING (public.has_admin_permission(auth.uid(), 'support.cases'));
CREATE POLICY "Support agents can add events" ON public.support_case_events FOR INSERT TO authenticated WITH CHECK (public.has_admin_permission(auth.uid(), 'support.cases'));

-- 7. Client Capability Matrix
CREATE TABLE public.client_capability_matrix (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_type TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'web',
  min_version TEXT DEFAULT '1.0.0',
  current_version TEXT DEFAULT '1.0.0',
  supported_features TEXT[] NOT NULL DEFAULT '{}',
  unsupported_features TEXT[] DEFAULT '{}',
  capabilities JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.client_capability_matrix ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view client capabilities" ON public.client_capability_matrix FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage client capabilities" ON public.client_capability_matrix FOR ALL TO authenticated USING (public.has_admin_permission(auth.uid(), 'platform.admin')) WITH CHECK (public.has_admin_permission(auth.uid(), 'platform.admin'));
CREATE TRIGGER update_client_capability_updated_at BEFORE UPDATE ON public.client_capability_matrix FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Config Change History
CREATE TABLE public.config_change_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_scope TEXT NOT NULL,
  config_key TEXT NOT NULL,
  previous_value JSONB,
  new_value JSONB NOT NULL,
  diff JSONB,
  actor_user_id UUID NOT NULL,
  justification TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'applied',
  rollback_of UUID REFERENCES public.config_change_history(id),
  approval_required BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.config_change_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view config history" ON public.config_change_history FOR SELECT TO authenticated USING (public.has_admin_permission(auth.uid(), 'security.audit'));
CREATE POLICY "Admins can insert config changes" ON public.config_change_history FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_user_id);

-- 9. Platform Notifications (multi-plane routing)
CREATE TABLE public.platform_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  audience TEXT NOT NULL DEFAULT 'user',
  target_user_id UUID,
  title TEXT NOT NULL,
  body TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'info',
  severity TEXT NOT NULL DEFAULT 'info',
  source_service TEXT DEFAULT '',
  source_event_type TEXT DEFAULT '',
  correlation_id TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  dismissed BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.platform_notifications FOR SELECT TO authenticated USING (audience = 'user' AND target_user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.platform_notifications FOR UPDATE TO authenticated USING (audience = 'user' AND target_user_id = auth.uid());
CREATE POLICY "Admins can view admin notifications" ON public.platform_notifications FOR SELECT TO authenticated USING (audience = 'admin' AND public.has_admin_permission(auth.uid(), 'security.audit'));
CREATE POLICY "Support can view support notifications" ON public.platform_notifications FOR SELECT TO authenticated USING (audience = 'support' AND public.has_admin_permission(auth.uid(), 'support.cases'));
CREATE POLICY "System can insert notifications" ON public.platform_notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE INDEX idx_platform_notifications_audience ON public.platform_notifications(audience, target_user_id);
CREATE INDEX idx_platform_notifications_created ON public.platform_notifications(created_at DESC);

-- 10. Read Model Snapshots
CREATE TABLE public.read_model_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model_type TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  subject_type TEXT NOT NULL DEFAULT 'user',
  snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  freshness_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ttl_seconds INTEGER NOT NULL DEFAULT 300,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(model_type, subject_id)
);
ALTER TABLE public.read_model_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view read model snapshots" ON public.read_model_snapshots FOR SELECT TO authenticated USING (public.has_admin_permission(auth.uid(), 'security.audit'));
CREATE POLICY "System can manage read model snapshots" ON public.read_model_snapshots FOR ALL TO authenticated USING (public.has_admin_permission(auth.uid(), 'platform.admin')) WITH CHECK (public.has_admin_permission(auth.uid(), 'platform.admin'));
CREATE TRIGGER update_read_model_updated_at BEFORE UPDATE ON public.read_model_snapshots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 11. Release Compatibility Matrix
CREATE TABLE public.release_compatibility_matrix (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_type TEXT NOT NULL,
  client_version TEXT NOT NULL,
  api_version TEXT NOT NULL DEFAULT 'v1',
  backend_version TEXT NOT NULL DEFAULT '1.0.0',
  compatibility TEXT NOT NULL DEFAULT 'compatible',
  breaking_changes TEXT[] DEFAULT '{}',
  migration_required BOOLEAN NOT NULL DEFAULT false,
  rollout_stage TEXT NOT NULL DEFAULT 'canary',
  rollout_percentage INTEGER NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_type, client_version, api_version)
);
ALTER TABLE public.release_compatibility_matrix ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view release compat" ON public.release_compatibility_matrix FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage release compat" ON public.release_compatibility_matrix FOR ALL TO authenticated USING (public.has_admin_permission(auth.uid(), 'platform.admin')) WITH CHECK (public.has_admin_permission(auth.uid(), 'platform.admin'));
CREATE TRIGGER update_release_compat_updated_at BEFORE UPDATE ON public.release_compatibility_matrix FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
