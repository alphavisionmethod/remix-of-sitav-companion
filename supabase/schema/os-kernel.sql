-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Synthesized schema for: os-kernel
-- AUTO-GENERATED from supabase/migrations/. DO NOT EDIT.
-- Regenerate via: npx tsx scripts/db/generate/synthesize-domain-schemas.ts
-- Source migrations: 5
-- Last generated: 2026-04-16T21:35:49.932Z
-- ═══════════════════════════════════════════════════════════════

-- ── 20260405213546_b62f76ed-c182-4c7e-ba43-dc92e2f1fafe.sql ──
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Phase 3: Core OS Persistence Substrate
-- ═══════════════════════════════════════════════════════════════

-- ── 1. os_event_log — Durable EventBus ─────────────────────────

CREATE TABLE public.os_event_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'unknown',
  correlation_id TEXT,
  causation_id TEXT,
  tenant_id TEXT,
  actor_id TEXT,
  domain TEXT,
  metadata JSONB,
  status TEXT NOT NULL DEFAULT 'processed' CHECK (status IN ('pending','processed','failed','dead_letter','replayed')),
  retry_count INTEGER NOT NULL DEFAULT 0,
  idempotency_key TEXT,
  consumers_processed TEXT[] NOT NULL DEFAULT '{}',
  replay_eligible BOOLEAN NOT NULL DEFAULT true,
  retention_class TEXT NOT NULL DEFAULT 'operational',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_os_event_log_user_topic ON public.os_event_log(user_id, topic);
CREATE INDEX idx_os_event_log_correlation ON public.os_event_log(correlation_id) WHERE correlation_id IS NOT NULL;
CREATE INDEX idx_os_event_log_domain ON public.os_event_log(user_id, domain) WHERE domain IS NOT NULL;
CREATE INDEX idx_os_event_log_status ON public.os_event_log(status) WHERE status != 'processed';
CREATE UNIQUE INDEX idx_os_event_log_idempotency ON public.os_event_log(user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;

ALTER TABLE public.os_event_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events" ON public.os_event_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events" ON public.os_event_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own events" ON public.os_event_log FOR DELETE USING (auth.uid() = user_id);


-- ── 2. os_memory_scoped — Scoped Durable Memory ───────────────

CREATE TABLE public.os_memory_scoped (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  memory_scope TEXT NOT NULL DEFAULT 'private' CHECK (memory_scope IN ('private','workspace','household','domain','operator','agent','system','session','decision')),
  privacy_tier TEXT NOT NULL DEFAULT 'internal' CHECK (privacy_tier IN ('public','internal','confidential','restricted')),
  confidence NUMERIC(4,3) NOT NULL DEFAULT 1.000,
  source TEXT NOT NULL DEFAULT 'user',
  entity_id TEXT,
  entity_type TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  domain TEXT,
  retention_class TEXT NOT NULL DEFAULT 'operational',
  provenance JSONB,
  superseded_by UUID REFERENCES public.os_memory_scoped(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_os_memory_user_key ON public.os_memory_scoped(user_id, key);
CREATE INDEX idx_os_memory_scope ON public.os_memory_scoped(user_id, memory_scope);
CREATE INDEX idx_os_memory_entity ON public.os_memory_scoped(entity_id) WHERE entity_id IS NOT NULL;
CREATE INDEX idx_os_memory_domain ON public.os_memory_scoped(user_id, domain) WHERE domain IS NOT NULL;
CREATE INDEX idx_os_memory_active ON public.os_memory_scoped(user_id) WHERE superseded_by IS NULL;

ALTER TABLE public.os_memory_scoped ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memory" ON public.os_memory_scoped FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memory" ON public.os_memory_scoped FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memory" ON public.os_memory_scoped FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memory" ON public.os_memory_scoped FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_os_memory_updated_at
  BEFORE UPDATE ON public.os_memory_scoped
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ── 3. os_policy_evaluations — Policy Decision Ledger ──────────

CREATE TABLE public.os_policy_evaluations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rule_id TEXT NOT NULL,
  rule_name TEXT NOT NULL,
  effect TEXT NOT NULL CHECK (effect IN ('allow','deny','require-approval','require-dual-approval','require-simulation')),
  context_snapshot JSONB NOT NULL DEFAULT '{}',
  matched_conditions JSONB NOT NULL DEFAULT '[]',
  reason TEXT NOT NULL,
  domain TEXT,
  capability_id TEXT,
  risk_tier TEXT,
  action_target TEXT,
  actor_id TEXT,
  evaluation_time_ms NUMERIC(8,2),
  confidence NUMERIC(4,3),
  evaluated_rules_count INTEGER NOT NULL DEFAULT 0,
  linked_action_id UUID,
  linked_receipt_id UUID,
  linked_approval_id UUID,
  is_simulation BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_os_policy_user ON public.os_policy_evaluations(user_id);
CREATE INDEX idx_os_policy_effect ON public.os_policy_evaluations(user_id, effect);
CREATE INDEX idx_os_policy_domain ON public.os_policy_evaluations(user_id, domain) WHERE domain IS NOT NULL;
CREATE INDEX idx_os_policy_action ON public.os_policy_evaluations(linked_action_id) WHERE linked_action_id IS NOT NULL;

ALTER TABLE public.os_policy_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own evaluations" ON public.os_policy_evaluations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own evaluations" ON public.os_policy_evaluations FOR INSERT WITH CHECK (auth.uid() = user_id);


-- ── 4. os_action_lineage — Canonical Action Lifecycle ──────────

CREATE TABLE public.os_action_lineage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  workflow_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  action_type TEXT,
  current_state TEXT NOT NULL DEFAULT 'detected' CHECK (current_state IN ('detected','proposed','drafted','simulated','approval_requested','approved','rejected','queued','executing','partially_completed','completed','verified','failed','rolled_back','escalated','archived')),
  state_history JSONB NOT NULL DEFAULT '[]',
  assigned_advisor TEXT,
  entity_scope JSONB NOT NULL DEFAULT '{}',
  rollback_eligible BOOLEAN NOT NULL DEFAULT false,
  replayable BOOLEAN NOT NULL DEFAULT true,
  blocking_reasons TEXT[] NOT NULL DEFAULT '{}',
  depends_on TEXT[] NOT NULL DEFAULT '{}',
  confidence_score NUMERIC(4,3) NOT NULL DEFAULT 1.000,
  proof_ids TEXT[] NOT NULL DEFAULT '{}',
  linked_event_ids UUID[] NOT NULL DEFAULT '{}',
  linked_memory_ids UUID[] NOT NULL DEFAULT '{}',
  linked_policy_ids UUID[] NOT NULL DEFAULT '{}',
  linked_receipt_ids UUID[] NOT NULL DEFAULT '{}',
  initiating_surface TEXT,
  stuck_since TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_os_action_user ON public.os_action_lineage(user_id);
CREATE INDEX idx_os_action_state ON public.os_action_lineage(user_id, current_state);
CREATE INDEX idx_os_action_domain ON public.os_action_lineage(user_id, domain);
CREATE INDEX idx_os_action_workflow ON public.os_action_lineage(workflow_id);
CREATE INDEX idx_os_action_active ON public.os_action_lineage(user_id) WHERE current_state NOT IN ('verified','archived');

ALTER TABLE public.os_action_lineage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own actions" ON public.os_action_lineage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own actions" ON public.os_action_lineage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own actions" ON public.os_action_lineage FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_os_action_updated_at
  BEFORE UPDATE ON public.os_action_lineage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260405224507_355779f2-b5a6-4ab0-a77d-0da0c917ecf8.sql ──
-- Universal service state persistence table
CREATE TABLE public.os_service_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_id TEXT NOT NULL,
  state_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT os_service_state_user_service_unique UNIQUE (user_id, service_id)
);

-- Index for fast lookups
CREATE INDEX idx_os_service_state_user_service ON public.os_service_state (user_id, service_id);

-- Enable RLS
ALTER TABLE public.os_service_state ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own service state"
  ON public.os_service_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own service state"
  ON public.os_service_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service state"
  ON public.os_service_state FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own service state"
  ON public.os_service_state FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update timestamp trigger
CREATE TRIGGER update_os_service_state_updated_at
  BEFORE UPDATE ON public.os_service_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260410154400_0cdc98d7-9364-4512-8765-9e68c3ac153d.sql ──
ALTER TABLE public.os_action_lineage
ADD COLUMN IF NOT EXISTS linked_projection_ids text[] DEFAULT '{}';

-- ── 20260414200526_8005942e-01d8-45a0-ad0c-18959ec9b368.sql ──
-- OS Security Foundation: 10 tables with RLS

-- 1. os_user_accounts
CREATE TABLE public.os_user_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'active',
  password_hash_ref TEXT,
  profile_ref TEXT,
  enrolled_methods TEXT[] NOT NULL DEFAULT '{}',
  failed_attempts INT NOT NULL DEFAULT 0,
  lockout_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.os_user_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own os_user_accounts" ON public.os_user_accounts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_os_user_accounts_updated_at BEFORE UPDATE ON public.os_user_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. os_auth_methods
CREATE TABLE public.os_auth_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  method_type TEXT NOT NULL DEFAULT 'password',
  enabled BOOLEAN NOT NULL DEFAULT true,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  policy_flags JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.os_auth_methods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own os_auth_methods" ON public.os_auth_methods FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_os_auth_methods_updated_at BEFORE UPDATE ON public.os_auth_methods FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. os_sessions
CREATE TABLE public.os_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'standard',
  state TEXT NOT NULL DEFAULT 'active',
  locked BOOLEAN NOT NULL DEFAULT false,
  auth_fresh_until TIMESTAMPTZ,
  display_id TEXT DEFAULT ':0',
  seat_id TEXT DEFAULT 'seat0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.os_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own os_sessions" ON public.os_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_os_sessions_updated_at BEFORE UPDATE ON public.os_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. os_capabilities
CREATE TABLE public.os_capabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  capability_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  sensitivity_level TEXT NOT NULL DEFAULT 'low',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.os_capabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own os_capabilities" ON public.os_capabilities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. os_role_capabilities
CREATE TABLE public.os_role_capabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  capability_id TEXT NOT NULL,
  default_allowed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.os_role_capabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own os_role_capabilities" ON public.os_role_capabilities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. os_service_identities
CREATE TABLE public.os_service_identities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  service_uid TEXT NOT NULL,
  privileged BOOLEAN NOT NULL DEFAULT false,
  allowed_actions TEXT[] DEFAULT '{}',
  secret_scope TEXT[] DEFAULT '{}',
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.os_service_identities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own os_service_identities" ON public.os_service_identities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. os_secrets_metadata
CREATE TABLE public.os_secrets_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  secret_id TEXT NOT NULL,
  owner_scope TEXT NOT NULL DEFAULT 'user',
  secret_type TEXT NOT NULL,
  keyring_id TEXT NOT NULL,
  label TEXT DEFAULT '',
  exportable BOOLEAN NOT NULL DEFAULT false,
  hardware_backed BOOLEAN NOT NULL DEFAULT false,
  access_policy_id TEXT,
  version INT NOT NULL DEFAULT 1,
  revoked BOOLEAN NOT NULL DEFAULT false,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.os_secrets_metadata ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own os_secrets_metadata" ON public.os_secrets_metadata FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_os_secrets_metadata_updated_at BEFORE UPDATE ON public.os_secrets_metadata FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. os_keyrings
CREATE TABLE public.os_keyrings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  keyring_id TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'user',
  protection_class TEXT NOT NULL DEFAULT 'standard',
  hardware_backed BOOLEAN NOT NULL DEFAULT false,
  secret_count INT NOT NULL DEFAULT 0,
  rotated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.os_keyrings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own os_keyrings" ON public.os_keyrings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. os_elevation_tokens
CREATE TABLE public.os_elevation_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  action TEXT NOT NULL,
  target_service TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  single_use BOOLEAN NOT NULL DEFAULT true,
  nonce TEXT,
  signature TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.os_elevation_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own os_elevation_tokens" ON public.os_elevation_tokens FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 10. os_audit_events
CREATE TABLE public.os_audit_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_id TEXT NOT NULL,
  actor_session_id TEXT,
  actor_service TEXT,
  action TEXT NOT NULL,
  resource TEXT,
  decision TEXT NOT NULL DEFAULT 'allowed',
  reason TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  correlation_id TEXT,
  auth_method TEXT,
  metadata JSONB DEFAULT '{}',
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.os_audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own os_audit_events" ON public.os_audit_events FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_os_audit_events_severity ON public.os_audit_events(severity);
CREATE INDEX idx_os_audit_events_action ON public.os_audit_events(action);
CREATE INDEX idx_os_audit_events_ts ON public.os_audit_events(ts DESC);

-- ── 20260415154410_4a945205-3cf4-4e08-a170-db861b496fd2.sql ──
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
