
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
