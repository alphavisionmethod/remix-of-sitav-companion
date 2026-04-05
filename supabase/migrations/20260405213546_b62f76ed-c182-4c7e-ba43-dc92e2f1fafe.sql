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