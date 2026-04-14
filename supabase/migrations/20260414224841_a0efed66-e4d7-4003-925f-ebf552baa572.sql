
-- ═══════════════════════════════════════════════════════════════
-- Ecosystem Orchestrator: 8 tables for distributed OS coordination
-- ═══════════════════════════════════════════════════════════════

-- 1. ecosystem_commands
CREATE TABLE public.ecosystem_commands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  input TEXT NOT NULL,
  intent TEXT,
  scope TEXT DEFAULT 'device_local',
  risk_class TEXT DEFAULT 'low',
  target_layers TEXT[] DEFAULT '{}',
  approval_required BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'submitted',
  result_summary TEXT,
  correlation_id UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.ecosystem_commands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ecosystem_commands" ON public.ecosystem_commands FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ecosystem_commands_updated_at BEFORE UPDATE ON public.ecosystem_commands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. command_routing_decisions
CREATE TABLE public.command_routing_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  command_id UUID REFERENCES public.ecosystem_commands(id) ON DELETE CASCADE,
  route_layers TEXT[] DEFAULT '{}',
  approval_flow TEXT DEFAULT 'none',
  guarantee_checks_json JSONB DEFAULT '[]',
  rationale TEXT,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.command_routing_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own command_routing_decisions" ON public.command_routing_decisions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_command_routing_decisions_updated_at BEFORE UPDATE ON public.command_routing_decisions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. dual_authority_challenges
CREATE TABLE public.dual_authority_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  command_id UUID REFERENCES public.ecosystem_commands(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  risk_level TEXT DEFAULT 'high',
  challenge_token UUID DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending',
  response TEXT,
  responded_at TIMESTAMPTZ,
  explanation TEXT,
  consequences JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dual_authority_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own dual_authority_challenges" ON public.dual_authority_challenges FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_dual_authority_challenges_updated_at BEFORE UPDATE ON public.dual_authority_challenges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. system_guarantees
CREATE TABLE public.system_guarantees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  command_id UUID REFERENCES public.ecosystem_commands(id) ON DELETE CASCADE,
  guarantee_type TEXT NOT NULL,
  status TEXT DEFAULT 'unverified',
  explanation TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.system_guarantees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own system_guarantees" ON public.system_guarantees FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_system_guarantees_updated_at BEFORE UPDATE ON public.system_guarantees FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. command_memory
CREATE TABLE public.command_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  command_id UUID,
  intent TEXT NOT NULL,
  context_json JSONB DEFAULT '{}',
  risk TEXT DEFAULT 'low',
  outcome TEXT DEFAULT 'success',
  user_preferences_json JSONB DEFAULT '{}',
  duration_ms INTEGER DEFAULT 0,
  learned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  pattern_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.command_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own command_memory" ON public.command_memory FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_command_memory_updated_at BEFORE UPDATE ON public.command_memory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. ecosystem_events
CREATE TABLE public.ecosystem_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  correlation_id UUID,
  source_layer TEXT NOT NULL,
  payload_json JSONB DEFAULT '{}',
  emitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ecosystem_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ecosystem_events" ON public.ecosystem_events FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. layer_health_snapshots
CREATE TABLE public.layer_health_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  layer TEXT NOT NULL,
  services_total INTEGER DEFAULT 0,
  services_healthy INTEGER DEFAULT 0,
  services_degraded INTEGER DEFAULT 0,
  health_score NUMERIC DEFAULT 100,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.layer_health_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own layer_health_snapshots" ON public.layer_health_snapshots FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. ecosystem_contracts
CREATE TABLE public.ecosystem_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_name TEXT NOT NULL,
  os_ownership TEXT,
  cloud_ownership TEXT,
  app_ownership TEXT,
  failure_behavior TEXT,
  approval_required BOOLEAN DEFAULT false,
  rollback_exists BOOLEAN DEFAULT false,
  events TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ecosystem_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ecosystem_contracts" ON public.ecosystem_contracts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ecosystem_contracts_updated_at BEFORE UPDATE ON public.ecosystem_contracts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_ecosystem_commands_user_status ON public.ecosystem_commands(user_id, status);
CREATE INDEX idx_ecosystem_events_user_type ON public.ecosystem_events(user_id, event_type);
CREATE INDEX idx_command_memory_user_intent ON public.command_memory(user_id, intent);
CREATE INDEX idx_dual_authority_user_status ON public.dual_authority_challenges(user_id, status);
