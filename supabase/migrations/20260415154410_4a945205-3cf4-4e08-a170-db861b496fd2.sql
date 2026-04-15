
-- ═══════════════════════════════════════════════════════════════
-- OS Commands — full 11-state lifecycle machine
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.os_commands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  command_type TEXT NOT NULL DEFAULT 'structured',
  command_text TEXT,
  structured_command JSONB DEFAULT '{}'::jsonb,
  target_device_id TEXT,
  target_device_ids TEXT[] DEFAULT '{}',
  origin TEXT NOT NULL DEFAULT 'mobile_app',
  safety_mode TEXT NOT NULL DEFAULT 'standard',
  simulation_first BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'created',
  plan_json JSONB,
  approval_state TEXT DEFAULT 'none',
  approval_requested_at TIMESTAMPTZ,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  verification_state TEXT DEFAULT 'none',
  verified_at TIMESTAMPTZ,
  rollback_available BOOLEAN NOT NULL DEFAULT false,
  rollback_payload JSONB,
  correlation_id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  actor_user_id UUID,
  result JSONB,
  error_message TEXT,
  dispatched_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.os_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own commands" ON public.os_commands FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own commands" ON public.os_commands FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own commands" ON public.os_commands FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own commands" ON public.os_commands FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_os_commands_user_status ON public.os_commands(user_id, status);
CREATE INDEX idx_os_commands_correlation ON public.os_commands(correlation_id);
CREATE INDEX idx_os_commands_target_device ON public.os_commands(target_device_id);

CREATE TRIGGER update_os_commands_updated_at
  BEFORE UPDATE ON public.os_commands
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- OS Command Events — state transition log
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.os_command_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  command_id UUID NOT NULL REFERENCES public.os_commands(id) ON DELETE CASCADE,
  from_state TEXT,
  to_state TEXT NOT NULL,
  actor TEXT,
  reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  correlation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.os_command_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own command events" ON public.os_command_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own command events" ON public.os_command_events FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_os_command_events_command ON public.os_command_events(command_id);
CREATE INDEX idx_os_command_events_correlation ON public.os_command_events(correlation_id);

-- ═══════════════════════════════════════════════════════════════
-- OS Policies — policy definitions with scope and conditions
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.os_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  policy_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  scope TEXT NOT NULL DEFAULT 'global',
  scope_ref TEXT,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  priority INTEGER NOT NULL DEFAULT 100,
  enabled BOOLEAN NOT NULL DEFAULT true,
  domain TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.os_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own policies" ON public.os_policies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own policies" ON public.os_policies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own policies" ON public.os_policies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own policies" ON public.os_policies FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_os_policies_user_domain ON public.os_policies(user_id, domain);
CREATE INDEX idx_os_policies_key ON public.os_policies(policy_key);

CREATE TRIGGER update_os_policies_updated_at
  BEFORE UPDATE ON public.os_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- Managed Apps — app registry with trust and health
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE public.managed_apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  app_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL DEFAULT '0.0.0',
  trust_level TEXT NOT NULL DEFAULT 'untrusted',
  health_status TEXT NOT NULL DEFAULT 'unknown',
  install_source TEXT NOT NULL DEFAULT 'manual',
  install_state TEXT NOT NULL DEFAULT 'installed',
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  config JSONB DEFAULT '{}'::jsonb,
  crash_count INTEGER NOT NULL DEFAULT 0,
  last_crash_at TIMESTAMPTZ,
  last_health_check_at TIMESTAMPTZ,
  domain TEXT NOT NULL DEFAULT 'general',
  device_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.managed_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own managed apps" ON public.managed_apps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own managed apps" ON public.managed_apps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own managed apps" ON public.managed_apps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own managed apps" ON public.managed_apps FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_managed_apps_user_device ON public.managed_apps(user_id, device_id);
CREATE INDEX idx_managed_apps_key ON public.managed_apps(app_key);

CREATE TRIGGER update_managed_apps_updated_at
  BEFORE UPDATE ON public.managed_apps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for command lifecycle
ALTER PUBLICATION supabase_realtime ADD TABLE public.os_commands;
ALTER PUBLICATION supabase_realtime ADD TABLE public.os_command_events;
