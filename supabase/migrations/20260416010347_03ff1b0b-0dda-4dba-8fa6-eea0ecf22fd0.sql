
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Core Backend Truth Layer: 11 Missing Tables
-- ═══════════════════════════════════════════════════════════════

-- 1. command_steps
CREATE TABLE public.command_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  command_id UUID NOT NULL REFERENCES public.os_commands(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL DEFAULT 0,
  action TEXT NOT NULL,
  target TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result JSONB DEFAULT '{}'::jsonb,
  error_message TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.command_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own command_steps" ON public.command_steps FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_command_steps_command_id ON public.command_steps(command_id);
CREATE INDEX idx_command_steps_user_id ON public.command_steps(user_id);

-- 2. device_attestations
CREATE TABLE public.device_attestations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES public.cloud_devices(id) ON DELETE CASCADE,
  attestation_type TEXT NOT NULL DEFAULT 'boot-integrity',
  status TEXT NOT NULL DEFAULT 'pending',
  evidence JSONB DEFAULT '{}'::jsonb,
  key_fingerprint TEXT,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.device_attestations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own device_attestations" ON public.device_attestations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_device_attestations_device_id ON public.device_attestations(device_id);
CREATE INDEX idx_device_attestations_user_id ON public.device_attestations(user_id);

-- 3. approval_decisions
CREATE TABLE public.approval_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID NOT NULL,
  request_type TEXT NOT NULL DEFAULT 'approval_queue',
  decision TEXT NOT NULL DEFAULT 'pending',
  actor_user_id UUID,
  rationale TEXT,
  conditions JSONB DEFAULT '{}'::jsonb,
  decided_at TIMESTAMPTZ,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.approval_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own approval_decisions" ON public.approval_decisions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_approval_decisions_request_id ON public.approval_decisions(request_id);
CREATE INDEX idx_approval_decisions_user_id ON public.approval_decisions(user_id);

-- 4. timeline_events
CREATE TABLE public.timeline_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  actor_type TEXT NOT NULL DEFAULT 'system',
  actor_id TEXT,
  subject_type TEXT,
  subject_id TEXT,
  action TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  receipt_id UUID,
  domain TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own timeline_events" ON public.timeline_events FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_timeline_events_user_id ON public.timeline_events(user_id);
CREATE INDEX idx_timeline_events_domain ON public.timeline_events(domain);
CREATE INDEX idx_timeline_events_created_at ON public.timeline_events(created_at DESC);

-- 5. graph_edges
CREATE TABLE public.graph_edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_node_type TEXT NOT NULL,
  source_node_id TEXT NOT NULL,
  target_node_type TEXT NOT NULL,
  target_node_id TEXT NOT NULL,
  edge_type TEXT NOT NULL,
  weight NUMERIC DEFAULT 1.0,
  metadata JSONB DEFAULT '{}'::jsonb,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.graph_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own graph_edges" ON public.graph_edges FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_graph_edges_source ON public.graph_edges(source_node_type, source_node_id);
CREATE INDEX idx_graph_edges_target ON public.graph_edges(target_node_type, target_node_id);
CREATE INDEX idx_graph_edges_user_id ON public.graph_edges(user_id);
CREATE TRIGGER update_graph_edges_updated_at BEFORE UPDATE ON public.graph_edges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. simulations
CREATE TABLE public.simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scenario_type TEXT NOT NULL,
  title TEXT NOT NULL,
  input_payload JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  result_artifacts JSONB DEFAULT '[]'::jsonb,
  model_used TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own simulations" ON public.simulations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_simulations_user_id ON public.simulations(user_id);

-- 7. incidents
CREATE TABLE public.incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  affected_services JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'open',
  owner_user_id UUID,
  remediation_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own incidents" ON public.incidents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_incidents_user_id ON public.incidents(user_id);
CREATE INDEX idx_incidents_status ON public.incidents(status);
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. connector_tokens
CREATE TABLE public.connector_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  connector_id UUID,
  provider TEXT NOT NULL,
  token_type TEXT NOT NULL DEFAULT 'access',
  encrypted_token_ref TEXT NOT NULL,
  scopes TEXT[] DEFAULT '{}',
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  last_refreshed_at TIMESTAMPTZ,
  rotation_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.connector_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connector_tokens" ON public.connector_tokens FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_connector_tokens_user_id ON public.connector_tokens(user_id);
CREATE INDEX idx_connector_tokens_provider ON public.connector_tokens(provider);

-- 9. vapid_keys (admin-only)
CREATE TABLE public.vapid_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  public_key TEXT NOT NULL,
  private_key_ref TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  activated_at TIMESTAMPTZ DEFAULT now(),
  rotated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vapid_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage vapid_keys" ON public.vapid_keys FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 10. biometric_credentials
CREATE TABLE public.biometric_credentials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  credential_id TEXT NOT NULL UNIQUE,
  credential_type TEXT NOT NULL DEFAULT 'webauthn',
  public_key TEXT NOT NULL,
  device_id UUID,
  display_name TEXT,
  sign_count INTEGER NOT NULL DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.biometric_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own biometric_credentials" ON public.biometric_credentials FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_biometric_credentials_user_id ON public.biometric_credentials(user_id);

-- 11. runtime_agents
CREATE TABLE public.runtime_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_type TEXT NOT NULL DEFAULT 'desktop',
  hostname TEXT,
  version TEXT,
  capabilities JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'offline',
  last_heartbeat_at TIMESTAMPTZ,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.runtime_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own runtime_agents" ON public.runtime_agents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_runtime_agents_user_id ON public.runtime_agents(user_id);
CREATE INDEX idx_runtime_agents_status ON public.runtime_agents(status);
CREATE TRIGGER update_runtime_agents_updated_at BEFORE UPDATE ON public.runtime_agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
