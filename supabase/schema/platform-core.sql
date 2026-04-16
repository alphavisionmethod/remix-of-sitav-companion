-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Synthesized schema for: platform-core
-- AUTO-GENERATED from supabase/migrations/. DO NOT EDIT.
-- Regenerate via: npx tsx scripts/db/generate/synthesize-domain-schemas.ts
-- Source migrations: 115
-- Last generated: 2026-04-16T21:25:36.046Z
-- ═══════════════════════════════════════════════════════════════

-- ── 20260403005944_05308bb6-19bf-4003-bcf4-9df267fd1680.sql ──
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  payee TEXT NOT NULL, amount NUMERIC(12,2) NOT NULL,
  category TEXT, due_date DATE NOT NULL, status TEXT NOT NULL DEFAULT 'upcoming',
  recurring BOOLEAN DEFAULT false, frequency TEXT, auto_pay BOOLEAN DEFAULT false,
  linked_document TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bills" ON public.bills FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON public.bills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, provider TEXT, amount NUMERIC(12,2) NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly', category TEXT,
  status TEXT NOT NULL DEFAULT 'active', last_used_at TIMESTAMPTZ,
  usage_score INTEGER DEFAULT 50, auto_renew BOOLEAN DEFAULT true,
  next_billing_date DATE, cancellation_url TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.reserves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, target_amount NUMERIC(12,2) NOT NULL,
  current_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'emergency', priority INTEGER DEFAULT 1,
  auto_contribute BOOLEAN DEFAULT false, contribution_amount NUMERIC(12,2) DEFAULT 0, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reserves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reserves" ON public.reserves FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_reserves_updated_at BEFORE UPDATE ON public.reserves FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.financial_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'uploaded', classification TEXT,
  sensitivity TEXT NOT NULL DEFAULT 'internal',
  extracted_data JSONB DEFAULT '{}'::jsonb, storage_path TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.financial_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own financial documents" ON public.financial_documents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_financial_documents_updated_at BEFORE UPDATE ON public.financial_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL, allocated NUMERIC(12,2) NOT NULL DEFAULT 0,
  spent NUMERIC(12,2) NOT NULL DEFAULT 0, period TEXT NOT NULL DEFAULT 'monthly',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own budgets" ON public.budgets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, description TEXT, category TEXT DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'medium', status TEXT NOT NULL DEFAULT 'pending',
  assigned_to TEXT, due_date DATE, estimated_minutes INTEGER,
  completed_at TIMESTAMPTZ, parent_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, title TEXT NOT NULL, provider TEXT,
  status TEXT NOT NULL DEFAULT 'pending', date TIMESTAMPTZ,
  details JSONB DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookings" ON public.bookings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.advisor_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, name TEXT NOT NULL,
  persona TEXT NOT NULL DEFAULT 'general', system_prompt TEXT,
  rules JSONB NOT NULL DEFAULT '[]'::jsonb, allowed_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  escalation_threshold NUMERIC DEFAULT 0.7, active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.advisor_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own advisor configs" ON public.advisor_configs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_advisor_configs_updated_at BEFORE UPDATE ON public.advisor_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.advisor_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  advisor_config_id UUID REFERENCES public.advisor_configs(id) ON DELETE SET NULL,
  intent TEXT NOT NULL, context JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending', correlation_id TEXT, complexity TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.advisor_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own advisor requests" ON public.advisor_requests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_advisor_requests_updated_at BEFORE UPDATE ON public.advisor_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.advisor_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_id UUID NOT NULL REFERENCES public.advisor_requests(id) ON DELETE CASCADE,
  recommendation TEXT, confidence NUMERIC DEFAULT 0, reasoning TEXT,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb, model_used TEXT,
  tokens_used INTEGER, correlation_id TEXT, latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.advisor_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own advisor responses" ON public.advisor_responses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.user_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, category TEXT NOT NULL DEFAULT 'context',
  key TEXT NOT NULL, value JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT, confidence NUMERIC DEFAULT 1.0, expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_memory_user_category_key_unique UNIQUE (user_id, category, key)
);
ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own memory" ON public.user_memory FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_user_memory_updated_at BEFORE UPDATE ON public.user_memory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general', conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb, approval_required BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own policies" ON public.policies FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON public.policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.approval_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  advisor_request_id UUID REFERENCES public.advisor_requests(id) ON DELETE SET NULL,
  action_summary TEXT NOT NULL, proposed_action JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending', decided_at TIMESTAMPTZ, decision_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.approval_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own approvals" ON public.approval_queue FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_approval_queue_updated_at BEFORE UPDATE ON public.approval_queue FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, name TEXT NOT NULL, trigger_event TEXT NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb, conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own workflows" ON public.workflows FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running', current_step INTEGER NOT NULL DEFAULT 0,
  context JSONB NOT NULL DEFAULT '{}'::jsonb, correlation_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(), completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own workflow runs" ON public.workflow_runs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_workflow_runs_updated_at BEFORE UPDATE ON public.workflow_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  run_id UUID NOT NULL REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL DEFAULT 0, action TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', input JSONB NOT NULL DEFAULT '{}'::jsonb,
  result JSONB, started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own workflow steps" ON public.workflow_steps FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, type TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'system',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb, processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ, correlation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own events" ON public.events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_events_unprocessed ON public.events(user_id, processed, created_at) WHERE processed = false;

CREATE TABLE public.proof_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_summary TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'general',
  domain TEXT DEFAULT 'system', artifact TEXT, verification TEXT DEFAULT 'pending',
  result TEXT DEFAULT 'pending', hash TEXT, correlation_id TEXT,
  advisor_request_id UUID REFERENCES public.advisor_requests(id) ON DELETE SET NULL,
  workflow_run_id UUID REFERENCES public.workflow_runs(id) ON DELETE SET NULL,
  policy_id UUID REFERENCES public.policies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.proof_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own proof records" ON public.proof_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_proof_records_updated_at BEFORE UPDATE ON public.proof_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, domain TEXT NOT NULL, entity_id TEXT,
  payload JSONB DEFAULT '{}'::jsonb, hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own receipts" ON public.receipts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.execution_envelopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  capability_id TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
  intent JSONB DEFAULT '{}'::jsonb, result JSONB, approved_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.execution_envelopes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own envelopes" ON public.execution_envelopes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.trust_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entity_type TEXT NOT NULL, entity_id TEXT NOT NULL,
  trust_level TEXT NOT NULL DEFAULT 'unknown', score NUMERIC(5,2) DEFAULT 50.0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trust_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trust state" ON public.trust_state FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL, type TEXT NOT NULL, data JSONB DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own projections" ON public.projections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, domain TEXT NOT NULL, description TEXT,
  enabled BOOLEAN DEFAULT true, risk_tier TEXT NOT NULL DEFAULT 'low'
);
ALTER TABLE public.capabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read capabilities" ON public.capabilities FOR SELECT TO authenticated USING (true);

CREATE TABLE public.connector_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, service TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb, status TEXT NOT NULL DEFAULT 'inactive',
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.connector_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connectors" ON public.connector_configs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_connector_configs_updated_at BEFORE UPDATE ON public.connector_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.connector_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connector_id TEXT NOT NULL, provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', encrypted_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.connector_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own connector credentials" ON public.connector_credentials FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own connector credentials" ON public.connector_credentials FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own connector credentials" ON public.connector_credentials FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own connector credentials" ON public.connector_credentials FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connector_id TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'success',
  records_synced INTEGER DEFAULT 0, error TEXT,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sync logs" ON public.sync_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium', status TEXT NOT NULL DEFAULT 'open',
  source TEXT NOT NULL DEFAULT 'system', affected_service TEXT, correlation_id TEXT,
  acknowledged_by TEXT, acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ, resolution_notes TEXT, timeline JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own incidents" ON public.incidents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'system',
  actor TEXT NOT NULL DEFAULT 'system', target_type TEXT, target_id TEXT,
  details JSONB DEFAULT '{}'::jsonb, severity TEXT NOT NULL DEFAULT 'info',
  correlation_id TEXT, ip_address TEXT, user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System inserts audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.device_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_name TEXT NOT NULL, device_type TEXT NOT NULL DEFAULT 'desktop',
  os TEXT, browser TEXT, ip_address TEXT,
  status TEXT NOT NULL DEFAULT 'online', last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  trust_score NUMERIC(3,2) DEFAULT 1.0, location TEXT,
  is_primary BOOLEAN DEFAULT false, metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.device_statuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own devices" ON public.device_statuses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_device_statuses_updated_at BEFORE UPDATE ON public.device_statuses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.council_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  council_type TEXT NOT NULL DEFAULT 'general', topic TEXT NOT NULL,
  summary TEXT, recommendation TEXT, confidence NUMERIC(3,2) DEFAULT 0.8,
  status TEXT NOT NULL DEFAULT 'pending', votes JSONB DEFAULT '[]'::jsonb,
  dissenting_opinions JSONB DEFAULT '[]'::jsonb, impact_assessment TEXT,
  action_items JSONB DEFAULT '[]'::jsonb, decided_at TIMESTAMPTZ, implemented_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.council_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own council decisions" ON public.council_decisions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_council_decisions_updated_at BEFORE UPDATE ON public.council_decisions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.tenant_firewall_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL, source_ip TEXT, rule_matched TEXT,
  blocked BOOLEAN DEFAULT false, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_firewall_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own firewall logs" ON public.tenant_firewall_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own firewall logs" ON public.tenant_firewall_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ── 20260403041301_bfa5d503-97c5-48e5-b8cd-edf320d43294.sql ──
-- ═══ Phase B: file_metadata table ═══
CREATE TABLE public.file_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  classification TEXT DEFAULT 'unclassified',
  extracted_data JSONB DEFAULT '{}'::jsonb,
  sensitivity TEXT NOT NULL DEFAULT 'internal',
  status TEXT NOT NULL DEFAULT 'uploaded',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.file_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own file metadata"
  ON public.file_metadata FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_file_metadata_updated_at
  BEFORE UPDATE ON public.file_metadata
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ Phase E: agent_telemetry table ═══
CREATE TABLE public.agent_telemetry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_telemetry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own agent telemetry"
  ON public.agent_telemetry FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_agent_telemetry_agent_id ON public.agent_telemetry (agent_id, recorded_at DESC);
CREATE INDEX idx_file_metadata_user ON public.file_metadata (user_id, created_at DESC);

-- Enable realtime for agent telemetry
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_telemetry;

-- ── 20260403073351_9a1110f9-6b85-4d69-b443-459ac96a5721.sql ──
-- Households table
CREATE TABLE public.households (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'family',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own households" ON public.households FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
CREATE TRIGGER update_households_updated_at BEFORE UPDATE ON public.households FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Household members table
CREATE TABLE public.household_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  user_id UUID,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage household members" ON public.household_members FOR ALL
  USING (EXISTS (SELECT 1 FROM public.households h WHERE h.id = household_id AND h.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.households h WHERE h.id = household_id AND h.owner_id = auth.uid()));

-- Household shared items table
CREATE TABLE public.household_shared_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  household_id UUID NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_id UUID NOT NULL,
  shared_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.household_shared_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage household shared items" ON public.household_shared_items FOR ALL
  USING (EXISTS (SELECT 1 FROM public.households h WHERE h.id = household_id AND h.owner_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.households h WHERE h.id = household_id AND h.owner_id = auth.uid()));

-- Advisor registry table
CREATE TABLE public.advisor_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  advisor_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  trust_threshold NUMERIC NOT NULL DEFAULT 0.7,
  explanation_style TEXT NOT NULL DEFAULT 'concise',
  memory_scope TEXT NOT NULL DEFAULT 'session',
  tool_access JSONB NOT NULL DEFAULT '[]'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.advisor_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own advisor registry" ON public.advisor_registry FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_advisor_registry_updated_at BEFORE UPDATE ON public.advisor_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260403152015_afefffbb-726c-4b99-a771-47f18d51bd65.sql ──
-- Digital twins table: stores customer health scores for revenue forecasting
CREATE TABLE public.digital_twins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  health_score INTEGER NOT NULL DEFAULT 50 CHECK (health_score >= 0 AND health_score <= 100),
  revenue_at_risk INTEGER NOT NULL DEFAULT 0,
  predicted_revenue INTEGER NOT NULL DEFAULT 0,
  churn_probability NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (churn_probability >= 0 AND churn_probability <= 1),
  last_activity TEXT DEFAULT 'unknown',
  segment TEXT NOT NULL DEFAULT 'smb' CHECK (segment IN ('enterprise', 'mid-market', 'smb')),
  trend TEXT NOT NULL DEFAULT 'stable' CHECK (trend IN ('improving', 'stable', 'declining')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.digital_twins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own digital twins"
  ON public.digital_twins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own digital twins"
  ON public.digital_twins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own digital twins"
  ON public.digital_twins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own digital twins"
  ON public.digital_twins FOR DELETE USING (auth.uid() = user_id);

-- Playbook metrics table: tracks playbook performance for forecasting
CREATE TABLE public.playbook_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  playbook_id TEXT NOT NULL,
  name TEXT NOT NULL,
  projected_lift INTEGER NOT NULL DEFAULT 0,
  confidence INTEGER NOT NULL DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
  active_customers INTEGER NOT NULL DEFAULT 0,
  avg_health_delta NUMERIC(5,1) NOT NULL DEFAULT 0.0,
  status TEXT NOT NULL DEFAULT 'moderate' CHECK (status IN ('high-impact', 'moderate', 'emerging')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.playbook_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own playbook metrics"
  ON public.playbook_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own playbook metrics"
  ON public.playbook_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own playbook metrics"
  ON public.playbook_metrics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own playbook metrics"
  ON public.playbook_metrics FOR DELETE USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_digital_twins_updated_at
  BEFORE UPDATE ON public.digital_twins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_playbook_metrics_updated_at
  BEFORE UPDATE ON public.playbook_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260403160000_agent_backend_tables.sql ──
-- Agent Backend Infrastructure Tables

CREATE TABLE IF NOT EXISTS public.agent_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  from_agent TEXT NOT NULL,
  to_agent TEXT NOT NULL,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('escalation', 'data-request', 'finding', 'alert', 'broadcast')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'processed', 'failed', 'expired')),
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '24 hours')
);

ALTER TABLE public.agent_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own agent signals" ON public.agent_signals FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_agent_signals_to ON public.agent_signals (to_agent, status, created_at DESC);
CREATE INDEX idx_agent_signals_from ON public.agent_signals (from_agent, created_at DESC);

CREATE TABLE IF NOT EXISTS public.agent_action_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  input_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence NUMERIC(4,3) NOT NULL DEFAULT 0.000 CHECK (confidence >= 0 AND confidence <= 1),
  health TEXT NOT NULL DEFAULT 'healthy' CHECK (health IN ('healthy', 'degraded', 'warning', 'critical')),
  duration_ms INTEGER NOT NULL DEFAULT 0,
  cost_tokens INTEGER NOT NULL DEFAULT 0,
  receipt_hash TEXT NOT NULL,
  parent_receipt_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_action_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own agent receipts" ON public.agent_action_receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can insert agent receipts" ON public.agent_action_receipts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_agent_receipts_agent ON public.agent_action_receipts (agent_id, created_at DESC);
CREATE INDEX idx_agent_receipts_hash ON public.agent_action_receipts (receipt_hash);

CREATE TABLE IF NOT EXISTS public.agent_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id TEXT NOT NULL,
  schedule_type TEXT NOT NULL DEFAULT 'daily' CHECK (schedule_type IN ('continuous', 'hourly', 'daily', 'on-event', 'disabled')),
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  run_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, agent_id)
);

ALTER TABLE public.agent_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own agent schedules" ON public.agent_schedules FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_agent_schedules_next ON public.agent_schedules (next_run_at, is_active) WHERE is_active = true;

ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_signals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_action_receipts;

-- ── 20260403235859_cedd7113-acfd-4308-acd5-65c6aed8ca80.sql ──
CREATE TABLE public.sita_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  correlation_id TEXT NOT NULL,
  receipt_type TEXT NOT NULL,
  capability_id TEXT,
  domain TEXT,
  payload JSONB NOT NULL DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'created',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sita_receipts_user ON public.sita_receipts(user_id);
CREATE INDEX idx_sita_receipts_correlation ON public.sita_receipts(correlation_id);
CREATE INDEX idx_sita_receipts_type ON public.sita_receipts(receipt_type);

ALTER TABLE public.sita_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own receipts"
  ON public.sita_receipts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own receipts"
  ON public.sita_receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.sita_proof_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  correlation_id TEXT NOT NULL,
  proof_type TEXT NOT NULL,
  receipt_id UUID REFERENCES public.sita_receipts(id) ON DELETE SET NULL,
  capability_id TEXT,
  evidence JSONB NOT NULL DEFAULT '{}',
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sita_proofs_user ON public.sita_proof_records(user_id);
CREATE INDEX idx_sita_proofs_correlation ON public.sita_proof_records(correlation_id);
CREATE INDEX idx_sita_proofs_receipt ON public.sita_proof_records(receipt_id);

ALTER TABLE public.sita_proof_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own proofs"
  ON public.sita_proof_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own proofs"
  ON public.sita_proof_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.sita_memory_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  privacy_tier TEXT NOT NULL DEFAULT 'internal',
  confidence NUMERIC(4,3) NOT NULL DEFAULT 1.000,
  source TEXT NOT NULL DEFAULT 'user',
  entity_id TEXT,
  entity_type TEXT,
  tags TEXT[] DEFAULT '{}',
  superseded_by UUID,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sita_memory_user ON public.sita_memory_entries(user_id);
CREATE INDEX idx_sita_memory_key ON public.sita_memory_entries(key);
CREATE INDEX idx_sita_memory_entity ON public.sita_memory_entries(entity_id);
CREATE INDEX idx_sita_memory_tags ON public.sita_memory_entries USING GIN(tags);

ALTER TABLE public.sita_memory_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memory"
  ON public.sita_memory_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own memory"
  ON public.sita_memory_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own memory"
  ON public.sita_memory_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own memory"
  ON public.sita_memory_entries FOR DELETE
  USING (auth.uid() = user_id);

CREATE TABLE public.sita_memory_forget_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL,
  key TEXT NOT NULL,
  reason TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  previous_tier TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sita_memory_forget_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own forget log"
  ON public.sita_memory_forget_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own forget log"
  ON public.sita_memory_forget_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_sita_receipts_updated_at
  BEFORE UPDATE ON public.sita_receipts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sita_memory_updated_at
  BEFORE UPDATE ON public.sita_memory_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260404151006_95bfb167-321a-4ae0-9710-19c9131cb599.sql ──
-- ═══════════════════════════════════════════════════════════════
-- Phase 2: Core domain tables for SITA OS
-- ═══════════════════════════════════════════════════════════════

-- ── customers ────────────────────────────────────────────────
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  mrr NUMERIC NOT NULL DEFAULT 0,
  health TEXT NOT NULL DEFAULT 'healthy',
  last_interaction TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customers" ON public.customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own customers" ON public.customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own customers" ON public.customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own customers" ON public.customers FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── leads ────────────────────────────────────────────────────
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  source TEXT DEFAULT 'manual',
  status TEXT NOT NULL DEFAULT 'new',
  score NUMERIC DEFAULT 0,
  value NUMERIC DEFAULT 0,
  last_touch TIMESTAMPTZ,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leads" ON public.leads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own leads" ON public.leads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own leads" ON public.leads FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own leads" ON public.leads FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── invoices ─────────────────────────────────────────────────
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  customer_id UUID REFERENCES public.customers ON DELETE SET NULL,
  invoice_number TEXT,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'draft',
  issued_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  line_items JSONB DEFAULT '[]',
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own invoices" ON public.invoices FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own invoices" ON public.invoices FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own invoices" ON public.invoices FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── events ───────────────────────────────────────────────────
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  event_type TEXT NOT NULL,
  domain TEXT,
  title TEXT NOT NULL,
  description TEXT,
  entity_id TEXT,
  entity_type TEXT,
  severity TEXT DEFAULT 'info',
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events" ON public.events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events" ON public.events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Events are append-only: no update or delete

-- ── notifications ────────────────────────────────────────────
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  category TEXT DEFAULT 'general',
  domain TEXT,
  severity TEXT DEFAULT 'info',
  action_url TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  dismissed BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
-- Notifications cannot be deleted, only dismissed

-- Enable realtime for events and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ── 20260404161056_e941f770-5e4a-4d71-9c81-da8b7c3a7d12.sql ──
-- Workflow Steps
CREATE TABLE public.workflow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  run_id uuid REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  step_index integer DEFAULT 0,
  action_type text NOT NULL DEFAULT 'execute',
  status text DEFAULT 'pending',
  input jsonb DEFAULT '{}'::jsonb,
  output jsonb DEFAULT '{}'::jsonb,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own steps" ON public.workflow_steps FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Financial Documents
CREATE TABLE public.financial_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  filename text NOT NULL,
  category text DEFAULT 'general',
  sensitivity text DEFAULT 'internal',
  status text DEFAULT 'uploaded',
  file_url text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.financial_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own fin docs" ON public.financial_documents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_financial_documents_updated_at BEFORE UPDATE ON public.financial_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── 20260404180324_trust_state_events.sql ──
create table if not exists public.trust_state_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  entity_id text not null,
  event_type text not null,
  trust_score_before numeric(5,2),
  trust_score_after numeric(5,2),
  delta numeric(5,2),
  reason text,
  source text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
alter table public.trust_state_events enable row level security;
create policy "Users can view own trust events" on public.trust_state_events for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own trust events" on public.trust_state_events for insert to authenticated with check (auth.uid() = user_id);
create index idx_trust_state_events_user on public.trust_state_events(user_id);
create index idx_trust_state_events_entity on public.trust_state_events(entity_id);

-- ── 20260404180325_encrypted_secrets.sql ──
create table if not exists public.encrypted_secrets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  key_name text not null,
  encrypted_value text not null,
  provider text,
  scope text default 'personal',
  rotation_due_at timestamptz,
  last_rotated_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, key_name)
);
alter table public.encrypted_secrets enable row level security;
create policy "Users manage own secrets" on public.encrypted_secrets for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── 20260404180327_ai_agent_tasks.sql ──
create table if not exists public.ai_agent_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  agent_id text not null,
  agent_name text not null,
  capability_id text not null,
  status text default 'pending' check (status in ('pending','running','completed','failed','cancelled')),
  input_payload jsonb default '{}'::jsonb,
  output_payload jsonb,
  error_message text,
  trust_score_at_execution numeric(5,2),
  autonomy_level text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);
alter table public.ai_agent_tasks enable row level security;
create policy "Users manage own agent tasks" on public.ai_agent_tasks for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_ai_agent_tasks_user on public.ai_agent_tasks(user_id, status);
create index idx_ai_agent_tasks_agent on public.ai_agent_tasks(agent_id);

-- ── 20260404180328_ai_cost_ledger.sql ──
create table if not exists public.ai_cost_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  agent_id text,
  model_id text not null,
  provider text not null,
  input_tokens integer default 0,
  output_tokens integer default 0,
  cost_cents integer default 0,
  capability_id text,
  correlation_id text,
  domain text,
  created_at timestamptz default now()
);
alter table public.ai_cost_ledger enable row level security;
create policy "Users view own AI costs" on public.ai_cost_ledger for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own AI costs" on public.ai_cost_ledger for insert to authenticated with check (auth.uid() = user_id);
create index idx_ai_cost_ledger_user on public.ai_cost_ledger(user_id);
create index idx_ai_cost_ledger_date on public.ai_cost_ledger(created_at);

-- ── 20260404180329_capital_allocations.sql ──
create table if not exists public.capital_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  allocation_name text not null,
  category text not null,
  amount_cents bigint not null,
  currency text default 'USD',
  status text default 'active' check (status in ('active','depleted','frozen','pending')),
  utilization_pct numeric(5,2) default 0,
  threshold_warning_pct numeric(5,2) default 80,
  threshold_critical_pct numeric(5,2) default 95,
  period_start timestamptz,
  period_end timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.capital_allocations enable row level security;
create policy "Users manage own allocations" on public.capital_allocations for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_capital_allocations_user on public.capital_allocations(user_id, status);

-- ── 20260404180330_communication_log.sql ──
create table if not exists public.communication_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  channel text not null check (channel in ('email','sms','call','chat','webhook')),
  direction text not null check (direction in ('inbound','outbound')),
  contact_name text,
  contact_identifier text,
  subject text,
  body_preview text,
  status text default 'sent' check (status in ('queued','sent','delivered','read','failed','bounced')),
  domain text,
  correlation_id text,
  metadata jsonb default '{}'::jsonb,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz default now()
);
alter table public.communication_log enable row level security;
create policy "Users manage own communications" on public.communication_log for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_communication_log_user on public.communication_log(user_id);
create index idx_communication_log_channel on public.communication_log(channel);

-- ── 20260404180331_sovereign_exports.sql ──
create table if not exists public.sovereign_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  export_type text not null check (export_type in ('full','partial','domain','receipts','memory','audit')),
  domain text,
  status text default 'pending' check (status in ('pending','processing','completed','failed','expired')),
  format text default 'json' check (format in ('json','csv','pdf','zip')),
  file_path text,
  file_size_bytes bigint,
  record_count integer default 0,
  requested_at timestamptz default now(),
  completed_at timestamptz,
  expires_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
alter table public.sovereign_exports enable row level security;
create policy "Users manage own exports" on public.sovereign_exports for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_sovereign_exports_user on public.sovereign_exports(user_id, status);

-- ── 20260404192307_ba4866f9-397d-47fb-9e0b-065f7ef8bb33.sql ──
-- 1. Trust State Events
create table if not exists public.trust_state_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  entity_id text not null,
  event_type text not null,
  trust_score_before numeric(5,2),
  trust_score_after numeric(5,2),
  delta numeric(5,2),
  reason text,
  source text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
alter table public.trust_state_events enable row level security;
create policy "Users can view own trust events" on public.trust_state_events for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own trust events" on public.trust_state_events for insert to authenticated with check (auth.uid() = user_id);
create index idx_trust_state_events_user on public.trust_state_events(user_id);
create index idx_trust_state_events_entity on public.trust_state_events(entity_id);

-- 2. Encrypted Secrets
create table if not exists public.encrypted_secrets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  key_name text not null,
  encrypted_value text not null,
  algorithm text default 'aes-256-gcm',
  iv text,
  domain text,
  expires_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, key_name)
);
alter table public.encrypted_secrets enable row level security;
create policy "Users manage own secrets" on public.encrypted_secrets for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_encrypted_secrets_user on public.encrypted_secrets(user_id);

-- 3. Notifications Queue
create table if not exists public.notifications_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  channel text not null default 'push',
  title text not null,
  body text,
  urgency text default 'normal',
  status text default 'pending',
  action_url text,
  metadata jsonb default '{}'::jsonb,
  scheduled_at timestamptz,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz default now()
);
alter table public.notifications_queue enable row level security;
create policy "Users manage own notifications" on public.notifications_queue for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_notifications_user_status on public.notifications_queue(user_id, status);

-- 4. AI Agent Tasks
create table if not exists public.ai_agent_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  agent_id text not null,
  task_type text not null,
  description text,
  status text default 'pending',
  priority text default 'normal',
  input_data jsonb default '{}'::jsonb,
  output_data jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.ai_agent_tasks enable row level security;
create policy "Users manage own agent tasks" on public.ai_agent_tasks for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_ai_agent_tasks_user on public.ai_agent_tasks(user_id, status);
create index idx_ai_agent_tasks_agent on public.ai_agent_tasks(agent_id);

-- 5. AI Cost Ledger
create table if not exists public.ai_cost_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  model_id text not null,
  provider text not null,
  operation text not null,
  tokens_in integer default 0,
  tokens_out integer default 0,
  cost_cents integer default 0,
  latency_ms integer,
  domain text,
  agent_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
alter table public.ai_cost_ledger enable row level security;
create policy "Users view own cost ledger" on public.ai_cost_ledger for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own cost entries" on public.ai_cost_ledger for insert to authenticated with check (auth.uid() = user_id);
create index idx_ai_cost_ledger_user on public.ai_cost_ledger(user_id);
create index idx_ai_cost_ledger_model on public.ai_cost_ledger(model_id);

-- 6. Capital Allocations
create table if not exists public.capital_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  allocation_name text not null,
  category text not null,
  amount_cents bigint not null,
  currency text default 'USD',
  status text default 'active',
  utilization_pct numeric(5,2) default 0,
  threshold_warning_pct numeric(5,2) default 80,
  threshold_critical_pct numeric(5,2) default 95,
  period_start timestamptz,
  period_end timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.capital_allocations enable row level security;
create policy "Users manage own allocations" on public.capital_allocations for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_capital_allocations_user on public.capital_allocations(user_id, status);

-- 7. Communication Log
create table if not exists public.communication_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  channel text not null,
  direction text not null,
  contact_name text,
  contact_identifier text,
  subject text,
  body_preview text,
  status text default 'sent',
  domain text,
  correlation_id text,
  metadata jsonb default '{}'::jsonb,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz default now()
);
alter table public.communication_log enable row level security;
create policy "Users manage own communications" on public.communication_log for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_communication_log_user on public.communication_log(user_id);
create index idx_communication_log_channel on public.communication_log(channel);

-- 8. Sovereign Exports
create table if not exists public.sovereign_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  export_type text not null,
  domain text,
  status text default 'pending',
  format text default 'json',
  file_path text,
  file_size_bytes bigint,
  record_count integer default 0,
  requested_at timestamptz default now(),
  completed_at timestamptz,
  expires_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
alter table public.sovereign_exports enable row level security;
create policy "Users manage own exports" on public.sovereign_exports for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_sovereign_exports_user on public.sovereign_exports(user_id, status);

-- 9. Setup Sessions
create table if not exists public.setup_sessions (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  device_id text not null,
  session_data jsonb not null default '{}'::jsonb,
  current_phase text not null default 'boot',
  branch_path text not null default 'personal',
  completion_pct integer not null default 0,
  interrupted boolean not null default false,
  interruption_reason text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_setup_sessions_user_id on public.setup_sessions(user_id);
alter table public.setup_sessions enable row level security;
create policy "Users can read own setup sessions" on public.setup_sessions for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own setup sessions" on public.setup_sessions for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own setup sessions" on public.setup_sessions for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own setup sessions" on public.setup_sessions for delete to authenticated using (auth.uid() = user_id);

-- ── 20260404194816_ae2d0eb0-e101-45bb-9516-d313e4b335a0.sql ──
CREATE TABLE IF NOT EXISTS public.metrics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  domain text NOT NULL,
  metric_name text NOT NULL,
  metric_type text NOT NULL DEFAULT 'gauge',
  value numeric NOT NULL DEFAULT 0,
  tags jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.metrics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own metrics" ON public.metrics_snapshots
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_metrics_snapshots_domain ON public.metrics_snapshots(domain);
CREATE INDEX IF NOT EXISTS idx_metrics_snapshots_name ON public.metrics_snapshots(metric_name);
CREATE INDEX IF NOT EXISTS idx_metrics_snapshots_recorded ON public.metrics_snapshots(recorded_at DESC);

-- ── 20260404200744_94a77883-d1f8-4dd4-82b0-a8c98c44f3e5.sql ──
ALTER PUBLICATION supabase_realtime ADD TABLE public.council_decisions;

-- ── 20260404201757_9841820c-bad6-4ae6-9d57-1a6c50c30e36.sql ──
-- Boot phase logs for trusted boot sequence audit trail
CREATE TABLE public.boot_phase_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  device_id text NOT NULL,
  session_id text NOT NULL,
  phase text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  started_at timestamptz,
  completed_at timestamptz,
  duration_ms integer,
  error text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.boot_phase_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own boot logs"
  ON public.boot_phase_logs FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Handoff packets for cross-surface continuity
CREATE TABLE public.handoff_packets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  from_surface text NOT NULL,
  to_surface text NOT NULL,
  from_advisor text,
  to_advisor text,
  domain text NOT NULL,
  context jsonb DEFAULT '{}'::jsonb,
  memory_keys text[] DEFAULT '{}'::text[],
  unresolved_items text[] DEFAULT '{}'::text[],
  priority text NOT NULL DEFAULT 'medium',
  accepted boolean NOT NULL DEFAULT false,
  accepted_at timestamptz,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.handoff_packets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own handoff packets"
  ON public.handoff_packets FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime for handoff packets
ALTER PUBLICATION supabase_realtime ADD TABLE public.handoff_packets;

-- ── 20260404232808_38fc8673-3411-40ba-a053-1dcf1083841b.sql ──
CREATE TABLE public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  payee TEXT NOT NULL, amount NUMERIC(12,2) NOT NULL,
  category TEXT, due_date DATE NOT NULL, status TEXT NOT NULL DEFAULT 'upcoming',
  recurring BOOLEAN DEFAULT false, frequency TEXT, auto_pay BOOLEAN DEFAULT false,
  linked_document TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bills" ON public.bills FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON public.bills FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, provider TEXT, amount NUMERIC(12,2) NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'monthly', category TEXT,
  status TEXT NOT NULL DEFAULT 'active', last_used_at TIMESTAMPTZ,
  usage_score INTEGER DEFAULT 50, auto_renew BOOLEAN DEFAULT true,
  next_billing_date DATE, cancellation_url TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.reserves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, target_amount NUMERIC(12,2) NOT NULL,
  current_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'emergency', priority INTEGER DEFAULT 1,
  auto_contribute BOOLEAN DEFAULT false, contribution_amount NUMERIC(12,2) DEFAULT 0, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reserves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reserves" ON public.reserves FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_reserves_updated_at BEFORE UPDATE ON public.reserves FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.financial_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'uploaded', classification TEXT,
  sensitivity TEXT NOT NULL DEFAULT 'internal',
  extracted_data JSONB DEFAULT '{}'::jsonb, storage_path TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.financial_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own financial documents" ON public.financial_documents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_financial_documents_updated_at BEFORE UPDATE ON public.financial_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL, allocated NUMERIC(12,2) NOT NULL DEFAULT 0,
  spent NUMERIC(12,2) NOT NULL DEFAULT 0, period TEXT NOT NULL DEFAULT 'monthly',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own budgets" ON public.budgets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, description TEXT, category TEXT DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'medium', status TEXT NOT NULL DEFAULT 'pending',
  assigned_to TEXT, due_date DATE, estimated_minutes INTEGER,
  completed_at TIMESTAMPTZ, parent_task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, title TEXT NOT NULL, provider TEXT,
  status TEXT NOT NULL DEFAULT 'pending', date TIMESTAMPTZ,
  details JSONB DEFAULT '{}'::jsonb, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookings" ON public.bookings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.advisor_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, name TEXT NOT NULL,
  persona TEXT NOT NULL DEFAULT 'general', system_prompt TEXT,
  rules JSONB NOT NULL DEFAULT '[]'::jsonb, allowed_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  escalation_threshold NUMERIC DEFAULT 0.7, active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.advisor_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own advisor configs" ON public.advisor_configs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_advisor_configs_updated_at BEFORE UPDATE ON public.advisor_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.advisor_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  advisor_config_id UUID REFERENCES public.advisor_configs(id) ON DELETE SET NULL,
  intent TEXT NOT NULL, context JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending', correlation_id TEXT, complexity TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.advisor_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own advisor requests" ON public.advisor_requests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_advisor_requests_updated_at BEFORE UPDATE ON public.advisor_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.advisor_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_id UUID NOT NULL REFERENCES public.advisor_requests(id) ON DELETE CASCADE,
  recommendation TEXT, confidence NUMERIC DEFAULT 0, reasoning TEXT,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb, model_used TEXT,
  tokens_used INTEGER, correlation_id TEXT, latency_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.advisor_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own advisor responses" ON public.advisor_responses FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.user_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, category TEXT NOT NULL DEFAULT 'context',
  key TEXT NOT NULL, value JSONB NOT NULL DEFAULT '{}'::jsonb,
  source TEXT, confidence NUMERIC DEFAULT 1.0, expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_memory_user_category_key_unique UNIQUE (user_id, category, key)
);
ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own memory" ON public.user_memory FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_user_memory_updated_at BEFORE UPDATE ON public.user_memory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general', conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb, approval_required BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own policies" ON public.policies FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON public.policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.approval_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  advisor_request_id UUID REFERENCES public.advisor_requests(id) ON DELETE SET NULL,
  action_summary TEXT NOT NULL, proposed_action JSONB NOT NULL DEFAULT '{}'::jsonb,
  action_type TEXT DEFAULT 'general', requested_by UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending', decided_at TIMESTAMPTZ, decision_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.approval_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own approvals" ON public.approval_queue FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_approval_queue_updated_at BEFORE UPDATE ON public.approval_queue FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, name TEXT NOT NULL, description TEXT,
  trigger_type TEXT NOT NULL DEFAULT 'manual', trigger_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb, active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own workflows" ON public.workflows FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.workflow_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'running', current_step INTEGER NOT NULL DEFAULT 0,
  context JSONB NOT NULL DEFAULT '{}'::jsonb, error TEXT, correlation_id TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(), completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own workflow runs" ON public.workflow_runs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_workflow_runs_updated_at BEFORE UPDATE ON public.workflow_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  run_id UUID NOT NULL REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL DEFAULT 0, action TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', input JSONB NOT NULL DEFAULT '{}'::jsonb,
  result JSONB, started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own workflow steps" ON public.workflow_steps FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, type TEXT NOT NULL, source TEXT NOT NULL DEFAULT 'system',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb, processed BOOLEAN NOT NULL DEFAULT false,
  processed_at TIMESTAMPTZ, correlation_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own events" ON public.events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_events_unprocessed ON public.events(user_id, processed, created_at) WHERE processed = false;

CREATE TABLE public.proof_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_summary TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'general',
  domain TEXT DEFAULT 'system', artifact TEXT, verification TEXT DEFAULT 'pending',
  result TEXT DEFAULT 'pending', hash TEXT, correlation_id TEXT,
  advisor_request_id UUID REFERENCES public.advisor_requests(id) ON DELETE SET NULL,
  workflow_run_id UUID REFERENCES public.workflow_runs(id) ON DELETE SET NULL,
  policy_id UUID REFERENCES public.policies(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.proof_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own proof records" ON public.proof_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_proof_records_updated_at BEFORE UPDATE ON public.proof_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, domain TEXT NOT NULL, entity_id TEXT,
  payload JSONB DEFAULT '{}'::jsonb, hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own receipts" ON public.receipts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.execution_envelopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  capability_id TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
  intent JSONB DEFAULT '{}'::jsonb, result JSONB, approved_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.execution_envelopes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own envelopes" ON public.execution_envelopes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.trust_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  entity_type TEXT NOT NULL, entity_id TEXT NOT NULL,
  trust_level TEXT NOT NULL DEFAULT 'unknown', score NUMERIC(5,2) DEFAULT 50.0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trust_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trust state" ON public.trust_state FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL, type TEXT NOT NULL, data JSONB DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.projections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own projections" ON public.projections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, domain TEXT NOT NULL, description TEXT,
  enabled BOOLEAN DEFAULT true, risk_tier TEXT NOT NULL DEFAULT 'low'
);
ALTER TABLE public.capabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read capabilities" ON public.capabilities FOR SELECT TO authenticated USING (true);

CREATE TABLE public.connector_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, service TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}'::jsonb, status TEXT NOT NULL DEFAULT 'inactive',
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.connector_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own connectors" ON public.connector_configs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_connector_configs_updated_at BEFORE UPDATE ON public.connector_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.connector_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connector_id TEXT NOT NULL, provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', encrypted_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.connector_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own connector credentials" ON public.connector_credentials FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own connector credentials" ON public.connector_credentials FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own connector credentials" ON public.connector_credentials FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own connector credentials" ON public.connector_credentials FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  connector_id TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'success',
  records_synced INTEGER DEFAULT 0, error TEXT,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sync logs" ON public.sync_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL, description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium', status TEXT NOT NULL DEFAULT 'open',
  source TEXT NOT NULL DEFAULT 'system', affected_service TEXT, correlation_id TEXT,
  acknowledged_by TEXT, acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ, resolution_notes TEXT, timeline JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own incidents" ON public.incidents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'system',
  actor TEXT NOT NULL DEFAULT 'system', target_type TEXT, target_id TEXT,
  details JSONB DEFAULT '{}'::jsonb, severity TEXT NOT NULL DEFAULT 'info',
  correlation_id TEXT, ip_address TEXT, user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.council_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, domain TEXT NOT NULL,
  question TEXT NOT NULL, participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  votes JSONB NOT NULL DEFAULT '[]'::jsonb, decision TEXT,
  consensus_score NUMERIC DEFAULT 0, status TEXT NOT NULL DEFAULT 'deliberating',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.council_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own council decisions" ON public.council_decisions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_council_decisions_updated_at BEFORE UPDATE ON public.council_decisions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.device_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_name TEXT NOT NULL, device_type TEXT NOT NULL DEFAULT 'unknown',
  os TEXT, last_seen TIMESTAMPTZ NOT NULL DEFAULT now(), ip_address TEXT,
  status TEXT NOT NULL DEFAULT 'online', metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.device_statuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own devices" ON public.device_statuses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_device_statuses_updated_at BEFORE UPDATE ON public.device_statuses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.tenant_firewall_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL, source_ip TEXT, target TEXT,
  rule_matched TEXT, result TEXT NOT NULL DEFAULT 'blocked',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tenant_firewall_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own firewall logs" ON public.tenant_firewall_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own firewall logs" ON public.tenant_firewall_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.notifications_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL, channel TEXT NOT NULL DEFAULT 'push',
  title TEXT NOT NULL, body TEXT,
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('low','normal','high','critical')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','delivered','read','failed')),
  action_url TEXT, metadata JSONB DEFAULT '{}'::jsonb,
  scheduled_at TIMESTAMPTZ, sent_at TIMESTAMPTZ, read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notifications_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notifications queue" ON public.notifications_queue FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_notifications_user_status ON public.notifications_queue(user_id, status);

-- ── 20260404233053_53e39b7a-32d6-4dfc-9ed0-d404f0ad6d4e.sql ──
-- 1. on_incident_created → auto-notify via notifications_queue
CREATE OR REPLACE FUNCTION public.notify_on_incident()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _urgency TEXT;
BEGIN
  _urgency := CASE NEW.severity
    WHEN 'critical' THEN 'critical'
    WHEN 'high'     THEN 'high'
    WHEN 'medium'   THEN 'normal'
    ELSE 'low'
  END;

  INSERT INTO public.notifications_queue (
    user_id, category, channel, title, body, urgency, action_url, metadata
  ) VALUES (
    NEW.user_id,
    'incident',
    'push',
    'Incident: ' || COALESCE(NEW.title, 'Untitled'),
    'Severity: ' || COALESCE(NEW.severity, 'unknown') || '. ' || COALESCE(LEFT(NEW.description, 200), ''),
    _urgency,
    '/system/incidents/' || NEW.id::TEXT,
    jsonb_build_object('incident_id', NEW.id, 'severity', NEW.severity, 'source', COALESCE(NEW.source, 'unknown'))
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_incident_created
  AFTER INSERT ON public.incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_incident();

-- 2. on_approval_status_changed → auto-notify requester
CREATE OR REPLACE FUNCTION public.notify_on_approval_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications_queue (
    user_id, category, channel, title, body, urgency, action_url, metadata
  ) VALUES (
    COALESCE(NEW.requested_by, NEW.user_id),
    'approval',
    'push',
    'Approval ' || NEW.status || ': ' || COALESCE(NEW.action_type, 'Request'),
    'Your approval request has been ' || NEW.status || '.' ||
      CASE WHEN NEW.reviewed_by IS NOT NULL THEN ' Reviewed by a team member.' ELSE '' END,
    CASE NEW.status WHEN 'approved' THEN 'normal' WHEN 'rejected' THEN 'high' ELSE 'normal' END,
    '/system/approvals/' || NEW.id::TEXT,
    jsonb_build_object('approval_id', NEW.id, 'action_type', NEW.action_type, 'new_status', NEW.status)
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_approval_status_changed
  AFTER UPDATE OF status ON public.approval_queue
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND NEW.status IS DISTINCT FROM OLD.status)
  EXECUTE FUNCTION public.notify_on_approval_change();

-- 3. on_workflow_run_failed → auto-create incident
CREATE OR REPLACE FUNCTION public.incident_on_workflow_failure()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.incidents (
    user_id, title, description, severity, source, status, metadata
  ) VALUES (
    NEW.user_id,
    'Workflow Failed: ' || COALESCE(NEW.workflow_id::TEXT, 'unknown'),
    'Workflow run ' || NEW.id::TEXT || ' failed.' ||
      CASE WHEN NEW.error IS NOT NULL THEN ' Error: ' || LEFT(NEW.error, 500) ELSE '' END,
    'high',
    'workflow_engine',
    'open',
    jsonb_build_object('workflow_run_id', NEW.id, 'workflow_id', NEW.workflow_id, 'error', NEW.error)
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_workflow_run_failed
  AFTER UPDATE OF status ON public.workflow_runs
  FOR EACH ROW
  WHEN (NEW.status = 'failed' AND OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.incident_on_workflow_failure();

-- ── 20260405000111_64806a0f-926d-4e88-aa85-7d8d5d0cc82e.sql ──
-- Remove tables from realtime publication (no IF EXISTS in this syntax)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.notifications;
  EXCEPTION WHEN undefined_object THEN
    NULL; -- table not in publication
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime DROP TABLE public.agent_telemetry;
  EXCEPTION WHEN undefined_object THEN
    NULL;
  END;
END $$;

-- ── 20260405000232_70103dd8-551b-4be7-a5b8-ff86f89975be.sql ──
-- Security fix: household_members — let members read own rows
CREATE POLICY "Members can read own membership"
  ON public.household_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Security fix: restrictive policy on user_roles INSERT
CREATE POLICY "Prevent self role grant"
  ON public.user_roles
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
  );

-- ── 20260405000514_66e7556f-0f5f-40e6-bd03-79556d0d57c2.sql ──
-- Fix: household_shared_items — members can read shared items
CREATE POLICY "Household members can read shared items"
  ON public.household_shared_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = household_shared_items.household_id
        AND hm.user_id = auth.uid()
    )
  );

-- Fix: household_tasks — assignees can read tasks assigned to them
CREATE POLICY "Assignees can read assigned tasks"
  ON public.household_tasks
  FOR SELECT
  TO authenticated
  USING (assigned_to = auth.uid());

CREATE POLICY "Assignees can update assigned tasks"
  ON public.household_tasks
  FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid());

-- Fix: household_tasks — household members can read all tasks
CREATE POLICY "Household members can read household tasks"
  ON public.household_tasks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.household_members hm
      WHERE hm.household_id = household_tasks.household_id
        AND hm.user_id = auth.uid()
    )
  );

-- ── 20260405025816_fa232507-1b33-45db-a7a0-9a530a4bc399.sql ──
-- ═══════════════════════════════════════════════════════════
-- Fix 1: connector_sync_history — restrict to authenticated
-- ═══════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Users insert own sync history" ON public.connector_sync_history;
DROP POLICY IF EXISTS "Users view own sync history" ON public.connector_sync_history;

CREATE POLICY "Authenticated users view own sync history"
  ON public.connector_sync_history FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users insert own sync history"
  ON public.connector_sync_history FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════
-- Fix 2: user_roles — prevent privilege escalation
-- Split ALL into separate INSERT/DELETE, block UPDATE entirely
-- ═══════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Prevent self role grant" ON public.user_roles;

-- Admins can grant roles to OTHER users (not themselves)
CREATE POLICY "Admins can grant roles to others"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    AND user_id != auth.uid()
  );

-- Admins can revoke roles from OTHER users (not themselves)
CREATE POLICY "Admins can revoke roles from others"
  ON public.user_roles FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    AND user_id != auth.uid()
  );

-- No UPDATE on user_roles — must delete + re-insert to change roles
-- This prevents subtle escalation via UPDATE of the role column

-- ── 20260405030039_c248ca7b-3ca1-4d75-9dc1-28d1b809337f.sql ──
-- ═══════════════════════════════════════════════════════════
-- Fix 1: user_roles — explicitly block UPDATE to prevent escalation
-- ═══════════════════════════════════════════════════════════
-- Create a restrictive policy that blocks ALL updates
CREATE POLICY "No role updates allowed"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (false)
  WITH CHECK (false);

-- ═══════════════════════════════════════════════════════════
-- Fix 2: audit_logs — remove user INSERT, only triggers write
-- ═══════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Users can insert own audit logs" ON public.audit_logs;

-- ── 20260405030147_82c464dc-98fe-4f77-9bf4-d9b98effa6b1.sql ──
-- ═══════════════════════════════════════════════════════════
-- Fix 1: user_roles — add RESTRICTIVE policy layer
-- ═══════════════════════════════════════════════════════════
CREATE POLICY "Only admins can ever insert roles"
  ON public.user_roles AS RESTRICTIVE
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- ═══════════════════════════════════════════════════════════
-- Fix 2: connector_credentials — add WITH CHECK to UPDATE
-- ═══════════════════════════════════════════════════════════
DROP POLICY IF EXISTS "Users update own connector credentials" ON public.connector_credentials;

CREATE POLICY "Users update own connector credentials"
  ON public.connector_credentials FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 20260405074401_77046b32-002a-4f91-a0f4-64855c451f8f.sql ──
-- System Update Releases
CREATE TABLE public.system_update_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'stable',
  release_notes TEXT,
  download_url TEXT,
  checksum_sha256 TEXT,
  size_bytes BIGINT,
  is_critical BOOLEAN DEFAULT false,
  min_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.system_update_releases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read releases" ON public.system_update_releases FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage releases" ON public.system_update_releases FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- System Update Devices
CREATE TABLE public.system_update_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_id TEXT NOT NULL,
  hostname TEXT,
  current_version TEXT NOT NULL DEFAULT '0.0.0',
  channel TEXT NOT NULL DEFAULT 'stable',
  hardware_profile JSONB DEFAULT '{}'::jsonb,
  last_check_at TIMESTAMPTZ,
  last_update_at TIMESTAMPTZ,
  auto_update_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, device_id)
);
ALTER TABLE public.system_update_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own devices" ON public.system_update_devices FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_system_update_devices_updated_at BEFORE UPDATE ON public.system_update_devices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- System Update Log
CREATE TABLE public.system_update_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES public.system_update_devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  from_version TEXT,
  to_version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.system_update_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own update logs" ON public.system_update_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own update logs" ON public.system_update_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own logs" ON public.system_update_log FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ── 20260405075328_ac70288d-11e1-4cc4-be57-9cd92c16eeb3.sql ──
-- AI Token Usage: logs every LLM call
CREATE TABLE public.ai_token_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  advisor_id text NOT NULL DEFAULT 'general',
  model text NOT NULL,
  provider text DEFAULT 'google',
  input_tokens integer DEFAULT 0,
  output_tokens integer DEFAULT 0,
  total_tokens integer GENERATED ALWAYS AS (input_tokens + output_tokens) STORED,
  cost_cents numeric DEFAULT 0,
  session_id text,
  domain text DEFAULT 'general',
  category text DEFAULT 'inference',
  cached boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_token_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own token usage" ON public.ai_token_usage
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own token usage" ON public.ai_token_usage
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins view all token usage" ON public.ai_token_usage
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_ai_token_usage_user ON public.ai_token_usage(user_id, created_at DESC);
CREATE INDEX idx_ai_token_usage_advisor ON public.ai_token_usage(advisor_id, created_at DESC);

-- User AI Budgets
CREATE TABLE public.user_ai_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  period text NOT NULL DEFAULT 'monthly',
  limit_tokens integer DEFAULT 1000000,
  limit_cost_cents integer DEFAULT 5000,
  used_tokens integer DEFAULT 0,
  used_cost_cents numeric DEFAULT 0,
  auto_downgrade_model boolean DEFAULT true,
  hard_limit boolean DEFAULT false,
  reset_at timestamptz DEFAULT (date_trunc('month', now()) + interval '1 month'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, period)
);

ALTER TABLE public.user_ai_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own budgets" ON public.user_ai_budgets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users update own budgets" ON public.user_ai_budgets
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own budgets" ON public.user_ai_budgets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage all budgets" ON public.user_ai_budgets
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Advisor Performance
CREATE TABLE public.advisor_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  advisor_id text NOT NULL,
  period text DEFAULT 'monthly',
  total_calls integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  total_cost_cents numeric DEFAULT 0,
  avg_satisfaction numeric DEFAULT 0,
  correction_count integer DEFAULT 0,
  self_learning_events integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.advisor_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own advisor perf" ON public.advisor_performance
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users insert own advisor perf" ON public.advisor_performance
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own advisor perf" ON public.advisor_performance
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins view all advisor perf" ON public.advisor_performance
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_advisor_perf_user ON public.advisor_performance(user_id, advisor_id);

-- System Config
CREATE TABLE public.system_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}',
  description text,
  category text DEFAULT 'general',
  updated_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read system config" ON public.system_config
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage system config" ON public.system_config
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Timestamp triggers
CREATE TRIGGER update_user_ai_budgets_updated_at BEFORE UPDATE ON public.user_ai_budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_advisor_performance_updated_at BEFORE UPDATE ON public.advisor_performance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON public.system_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260405082027_f5d8846c-9579-490c-9eab-c3956b5bf391.sql ──
-- ============================================================
-- 1. UNIQUE INDEXES FOR DEDUPLICATION
-- ============================================================

-- Prevent duplicate token usage logs on retries
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_token_usage_dedup 
ON public.ai_token_usage (user_id, advisor_id, session_id, created_at)
WHERE session_id IS NOT NULL;

-- Prevent duplicate advisor memories
CREATE UNIQUE INDEX IF NOT EXISTS idx_advisor_memories_dedup
ON public.advisor_memories (advisor_id, user_id, memory_type, md5(content));

-- ============================================================
-- 2. PERFORMANCE INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_ai_token_usage_user_created ON public.ai_token_usage (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created ON public.audit_logs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_queue_user_status ON public.notifications_queue (user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_signals_agent_processed ON public.agent_signals (agent_id, processed, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_advisor_performance_user_advisor ON public.advisor_performance (user_id, advisor_id, period);
CREATE INDEX IF NOT EXISTS idx_events_user_created ON public.events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_user_status ON public.incidents (user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approval_queue_user_status ON public.approval_queue (user_id, status, created_at DESC);

-- ============================================================
-- 3. ATOMIC BUDGET UPDATE RPC
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_ai_budget_usage(
  p_user_id uuid,
  p_tokens integer,
  p_cost numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_budget record;
  v_result jsonb;
BEGIN
  SELECT * INTO v_budget
  FROM public.user_ai_budgets
  WHERE user_id = p_user_id AND period = 'monthly'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', true, 'reason', 'no_budget_set');
  END IF;

  IF v_budget.hard_limit AND (v_budget.used_cost_cents + p_cost) > v_budget.limit_cost_cents THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'budget_exceeded', 'used', v_budget.used_cost_cents, 'limit', v_budget.limit_cost_cents);
  END IF;

  UPDATE public.user_ai_budgets
  SET used_tokens = used_tokens + p_tokens,
      used_cost_cents = used_cost_cents + p_cost,
      updated_at = now()
  WHERE id = v_budget.id;

  RETURN jsonb_build_object(
    'allowed', true,
    'used_tokens', v_budget.used_tokens + p_tokens,
    'used_cost_cents', v_budget.used_cost_cents + p_cost,
    'auto_downgrade', v_budget.auto_downgrade_model
  );
END;
$$;

-- ============================================================
-- 4. CLEANUP EXPIRED SIGNALS
-- ============================================================

CREATE OR REPLACE FUNCTION public.cleanup_expired_signals()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count integer;
BEGIN
  DELETE FROM public.agent_signals
  WHERE processed = false
    AND created_at < now() - interval '1 hour'
    AND signal_type LIKE 'os_command:%';
  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Also mark old unprocessed signals as expired
  UPDATE public.agent_signals
  SET processed = true, processed_at = now()
  WHERE processed = false
    AND created_at < now() - interval '24 hours';

  RETURN v_count;
END;
$$;

-- ============================================================
-- 5. NOTIFICATION DEDUP TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.check_notification_dedup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.notifications_queue
    WHERE user_id = NEW.user_id
      AND category = NEW.category
      AND title = NEW.title
      AND created_at > now() - interval '5 minutes'
  ) THEN
    RETURN NULL; -- suppress duplicate
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notification_dedup
BEFORE INSERT ON public.notifications_queue
FOR EACH ROW
EXECUTE FUNCTION public.check_notification_dedup();

-- ============================================================
-- 6. ADMIN RLS FOR AUDIT LOGS (admins need to see all)
-- ============================================================

CREATE POLICY "Admins view all audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Admin insert for audit logs (edge functions use service role, but just in case)
CREATE POLICY "Admins insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admin view all advisor memories for cross-user analytics
CREATE POLICY "Admins view all advisor memories"
ON public.advisor_memories
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- ── 20260405151640_65fef5db-4218-41bf-96c9-0d896272d650.sql ──
-- Investment Office Profile
CREATE TABLE public.investment_office_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  enabled boolean DEFAULT true,
  experience_level text NOT NULL DEFAULT 'beginner',
  office_mode text NOT NULL DEFAULT 'quiet_monitoring',
  default_view text DEFAULT 'boardroom',
  currency_base text DEFAULT 'USD',
  region text DEFAULT 'US',
  restricted_features text[] DEFAULT '{}',
  advisor_mode_preference text DEFAULT 'balanced',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.investment_office_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own io profile" ON public.investment_office_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_io_profiles_updated_at BEFORE UPDATE ON public.investment_office_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Connected Investment Platforms
CREATE TABLE public.connected_investment_platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform_type text NOT NULL DEFAULT 'brokerage',
  provider_name text NOT NULL,
  provider_key text,
  auth_status text NOT NULL DEFAULT 'disconnected',
  sync_status text NOT NULL DEFAULT 'never',
  last_sync_at timestamptz,
  supported_asset_classes text[] DEFAULT '{}',
  read_permissions text[] DEFAULT '{}',
  trade_permissions text[] DEFAULT '{}',
  region_restrictions text[] DEFAULT '{}',
  account_ids text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.connected_investment_platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own platforms" ON public.connected_investment_platforms FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_cip_updated_at BEFORE UPDATE ON public.connected_investment_platforms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Investment Accounts
CREATE TABLE public.investment_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid REFERENCES public.connected_investment_platforms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  account_label text NOT NULL,
  account_type text NOT NULL DEFAULT 'brokerage',
  base_currency text DEFAULT 'USD',
  available_cash numeric DEFAULT 0,
  total_value numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  sync_health text DEFAULT 'healthy',
  risk_flags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.investment_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own accounts" ON public.investment_accounts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ia_updated_at BEFORE UPDATE ON public.investment_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Asset Master
CREATE TABLE public.asset_master (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  display_name text NOT NULL,
  asset_class text NOT NULL DEFAULT 'stock',
  subtype text,
  exchange_or_venue text,
  region text,
  metadata jsonb DEFAULT '{}',
  availability_by_platform jsonb DEFAULT '[]',
  tags text[] DEFAULT '{}',
  theme_ids text[] DEFAULT '{}',
  sector_ids text[] DEFAULT '{}',
  risk_tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.asset_master ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read assets" ON public.asset_master FOR SELECT TO authenticated USING (true);
CREATE TRIGGER update_am_updated_at BEFORE UPDATE ON public.asset_master FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Asset Market Snapshots
CREATE TABLE public.asset_market_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES public.asset_master(id) ON DELETE CASCADE,
  as_of timestamptz NOT NULL DEFAULT now(),
  price numeric,
  daily_change numeric,
  weekly_change numeric,
  monthly_change numeric,
  volatility_estimate numeric,
  liquidity_estimate numeric,
  market_state text DEFAULT 'open',
  confidence numeric DEFAULT 0.8,
  source text,
  stale boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'
);
ALTER TABLE public.asset_market_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read snapshots" ON public.asset_market_snapshots FOR SELECT TO authenticated USING (true);

-- Portfolio Positions
CREATE TABLE public.portfolio_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_id uuid REFERENCES public.investment_accounts(id) ON DELETE SET NULL,
  asset_id uuid REFERENCES public.asset_master(id) ON DELETE SET NULL,
  quantity numeric DEFAULT 0,
  average_cost numeric DEFAULT 0,
  market_value numeric DEFAULT 0,
  unrealized_pnl numeric DEFAULT 0,
  realized_pnl numeric DEFAULT 0,
  allocation_pct numeric DEFAULT 0,
  purpose_bucket_id uuid,
  thesis_id uuid,
  conviction_tag text,
  risk_tags text[] DEFAULT '{}',
  opened_at timestamptz DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.portfolio_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own positions" ON public.portfolio_positions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_pp_updated_at BEFORE UPDATE ON public.portfolio_positions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Capital Purpose Buckets
CREATE TABLE public.capital_purpose_buckets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL,
  target_allocation_pct numeric DEFAULT 0,
  current_allocation_pct numeric DEFAULT 0,
  policy_limits jsonb DEFAULT '{}',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.capital_purpose_buckets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own buckets" ON public.capital_purpose_buckets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_cpb_updated_at BEFORE UPDATE ON public.capital_purpose_buckets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Investment Constitutions
CREATE TABLE public.investment_constitutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  version integer DEFAULT 1,
  max_single_position_pct numeric DEFAULT 10,
  max_speculative_sleeve_pct numeric DEFAULT 20,
  max_event_sleeve_pct numeric DEFAULT 10,
  max_platform_exposure_pct numeric DEFAULT 50,
  require_simulation_rules jsonb DEFAULT '[]',
  require_approval_rules jsonb DEFAULT '[]',
  journal_required_rules jsonb DEFAULT '[]',
  cool_down_rules jsonb DEFAULT '[]',
  override_policy jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.investment_constitutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own constitution" ON public.investment_constitutions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ic_updated_at BEFORE UPDATE ON public.investment_constitutions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Investment Watchlists
CREATE TABLE public.investment_watchlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'manual',
  asset_ids uuid[] DEFAULT '{}',
  rules jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.investment_watchlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own watchlists" ON public.investment_watchlists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_iw_updated_at BEFORE UPDATE ON public.investment_watchlists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Investment Signals
CREATE TABLE public.investment_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  asset_id uuid REFERENCES public.asset_master(id) ON DELETE SET NULL,
  signal_type text NOT NULL,
  severity text DEFAULT 'info',
  message text,
  related_advisor_ids text[] DEFAULT '{}',
  related_catalyst_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz,
  metadata jsonb DEFAULT '{}'
);
ALTER TABLE public.investment_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own signals" ON public.investment_signals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Catalyst Events
CREATE TABLE public.catalyst_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  asset_ids uuid[] DEFAULT '{}',
  theme_ids text[] DEFAULT '{}',
  catalyst_type text NOT NULL DEFAULT 'other',
  title text NOT NULL,
  scheduled_at timestamptz,
  importance text DEFAULT 'medium',
  uncertainty_level numeric DEFAULT 0.5,
  source text,
  scenario_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.catalyst_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own catalysts" ON public.catalyst_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ce_updated_at BEFORE UPDATE ON public.catalyst_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Thesis Records
CREATE TABLE public.thesis_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  related_asset_ids uuid[] DEFAULT '{}',
  related_theme_ids text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft',
  rationale text,
  assumptions jsonb DEFAULT '[]',
  catalyst_ids uuid[] DEFAULT '{}',
  risk_factors jsonb DEFAULT '[]',
  invalidation_criteria jsonb DEFAULT '[]',
  expected_horizon text,
  desired_sizing_note text,
  linked_strategy_id uuid,
  linked_decision_ids uuid[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  review_at timestamptz
);
ALTER TABLE public.thesis_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own theses" ON public.thesis_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_tr_updated_at BEFORE UPDATE ON public.thesis_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Journal Entries
CREATE TABLE public.investment_journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  thesis_id uuid REFERENCES public.thesis_records(id) ON DELETE SET NULL,
  decision_id uuid,
  entry_type text NOT NULL DEFAULT 'pre_trade',
  content text,
  emotional_tags text[] DEFAULT '{}',
  confidence_self_rating numeric,
  discipline_self_rating numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.investment_journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journal" ON public.investment_journal_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ije_updated_at BEFORE UPDATE ON public.investment_journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Strategy Records
CREATE TABLE public.investment_strategy_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  strategy_type text DEFAULT 'custom',
  horizon text,
  objective text,
  allocation_model jsonb DEFAULT '{}',
  scenario_set_id uuid,
  advisor_summary_id uuid,
  readiness_status text DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.investment_strategy_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own strategies" ON public.investment_strategy_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_isr_updated_at BEFORE UPDATE ON public.investment_strategy_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Scenario Sets
CREATE TABLE public.investment_scenario_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  owner_type text NOT NULL DEFAULT 'strategy',
  owner_id uuid,
  scenarios jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.investment_scenario_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own scenarios" ON public.investment_scenario_sets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_iss_updated_at BEFORE UPDATE ON public.investment_scenario_sets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Decision Records
CREATE TABLE public.investment_decision_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  decision_type text NOT NULL DEFAULT 'trade',
  status text NOT NULL DEFAULT 'draft',
  related_asset_ids uuid[] DEFAULT '{}',
  related_account_ids uuid[] DEFAULT '{}',
  related_thesis_id uuid REFERENCES public.thesis_records(id) ON DELETE SET NULL,
  related_strategy_id uuid REFERENCES public.investment_strategy_records(id) ON DELETE SET NULL,
  rationale_summary text,
  proposed_sizing jsonb DEFAULT '{}',
  proposed_platform text,
  readiness_score numeric,
  constitution_check_result jsonb DEFAULT '{}',
  advisor_snapshot_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  executed_at timestamptz
);
ALTER TABLE public.investment_decision_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own decisions" ON public.investment_decision_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_idr_updated_at BEFORE UPDATE ON public.investment_decision_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Execution Records
CREATE TABLE public.investment_execution_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  decision_id uuid REFERENCES public.investment_decision_records(id) ON DELETE SET NULL,
  platform_id uuid REFERENCES public.connected_investment_platforms(id) ON DELETE SET NULL,
  account_id uuid REFERENCES public.investment_accounts(id) ON DELETE SET NULL,
  execution_status text NOT NULL DEFAULT 'pending',
  quantity numeric,
  executed_value numeric,
  average_execution_price numeric,
  fee_estimate numeric,
  fee_actual numeric,
  slippage_estimate numeric,
  slippage_actual numeric,
  executed_at timestamptz,
  metadata jsonb DEFAULT '{}'
);
ALTER TABLE public.investment_execution_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own executions" ON public.investment_execution_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Investment Receipts
CREATE TABLE public.investment_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  receipt_type text NOT NULL DEFAULT 'trade_prep',
  related_decision_id uuid REFERENCES public.investment_decision_records(id) ON DELETE SET NULL,
  related_execution_id uuid REFERENCES public.investment_execution_records(id) ON DELETE SET NULL,
  related_thesis_id uuid REFERENCES public.thesis_records(id) ON DELETE SET NULL,
  advisor_snapshot_id uuid,
  summary text,
  actor text DEFAULT 'user',
  approval_state text DEFAULT 'none',
  risk_summary jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  exportable_bundle_ref text
);
ALTER TABLE public.investment_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own receipts" ON public.investment_receipts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Investment Advisor Profiles
CREATE TABLE public.investment_advisor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  advisor_type text NOT NULL,
  display_name text NOT NULL,
  description text,
  active boolean DEFAULT true,
  priority integer DEFAULT 5,
  output_style_preferences jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.investment_advisor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own advisors" ON public.investment_advisor_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_iap_updated_at BEFORE UPDATE ON public.investment_advisor_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Advisor Observations
CREATE TABLE public.investment_advisor_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  advisor_id uuid REFERENCES public.investment_advisor_profiles(id) ON DELETE CASCADE,
  owner_type text NOT NULL DEFAULT 'asset',
  owner_id uuid,
  title text,
  summary text,
  detailed_reasoning text,
  confidence_level numeric DEFAULT 0.5,
  uncertainty_level numeric DEFAULT 0.5,
  recommendation_type text DEFAULT 'observe',
  what_changed text,
  what_would_change_mind text,
  key_risks jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.investment_advisor_observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own observations" ON public.investment_advisor_observations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_iao_updated_at BEFORE UPDATE ON public.investment_advisor_observations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Advisor Debates
CREATE TABLE public.investment_advisor_debates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  owner_type text NOT NULL DEFAULT 'asset',
  owner_id uuid,
  participating_advisor_ids uuid[] DEFAULT '{}',
  alignment_summary text,
  disagreement_summary text,
  conflicting_assumptions jsonb DEFAULT '[]',
  resolution_signals jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.investment_advisor_debates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own debates" ON public.investment_advisor_debates FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_iad_updated_at BEFORE UPDATE ON public.investment_advisor_debates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Chief Synthesis Records
CREATE TABLE public.chief_synthesis_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  owner_type text NOT NULL DEFAULT 'boardroom',
  owner_id uuid,
  aligned_views jsonb DEFAULT '[]',
  divergent_views jsonb DEFAULT '[]',
  strongest_opportunity text,
  strongest_risk text,
  key_unknown text,
  recommended_next_step text,
  confidence_summary jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chief_synthesis_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own synthesis" ON public.chief_synthesis_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_csr_updated_at BEFORE UPDATE ON public.chief_synthesis_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Behavioral Signals
CREATE TABLE public.investment_behavioral_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  signal_type text NOT NULL,
  severity text DEFAULT 'medium',
  evidence_summary text,
  suggested_intervention text,
  requires_cooldown boolean DEFAULT false,
  requires_simulation boolean DEFAULT false,
  requires_approval boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
ALTER TABLE public.investment_behavioral_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own behavioral" ON public.investment_behavioral_signals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Strategy DNA Profiles
CREATE TABLE public.strategy_dna_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  traits jsonb DEFAULT '[]',
  confidence_by_trait jsonb DEFAULT '{}',
  observed_patterns jsonb DEFAULT '[]',
  notes text,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.strategy_dna_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own dna" ON public.strategy_dna_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Market Memory Events
CREATE TABLE public.market_memory_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  related_asset_ids uuid[] DEFAULT '{}',
  related_decision_id uuid,
  related_thesis_id uuid,
  related_advisor_ids uuid[] DEFAULT '{}',
  title text NOT NULL,
  summary text,
  severity text DEFAULT 'info',
  created_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz
);
ALTER TABLE public.market_memory_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own memory events" ON public.market_memory_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Time Machine Snapshots
CREATE TABLE public.time_machine_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  owner_type text NOT NULL DEFAULT 'decision',
  owner_id uuid,
  captured_at timestamptz NOT NULL DEFAULT now(),
  market_context jsonb DEFAULT '{}',
  advisor_state jsonb DEFAULT '{}',
  thesis_state jsonb DEFAULT '{}',
  portfolio_state jsonb DEFAULT '{}',
  catalyst_state jsonb DEFAULT '{}',
  risk_state jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.time_machine_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own snapshots" ON public.time_machine_snapshots FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add FK for portfolio_positions.purpose_bucket_id
ALTER TABLE public.portfolio_positions ADD CONSTRAINT fk_pp_purpose_bucket FOREIGN KEY (purpose_bucket_id) REFERENCES public.capital_purpose_buckets(id) ON DELETE SET NULL;
ALTER TABLE public.portfolio_positions ADD CONSTRAINT fk_pp_thesis FOREIGN KEY (thesis_id) REFERENCES public.thesis_records(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_portfolio_positions_user ON public.portfolio_positions(user_id);
CREATE INDEX idx_thesis_records_user ON public.thesis_records(user_id);
CREATE INDEX idx_decision_records_user ON public.investment_decision_records(user_id);
CREATE INDEX idx_catalyst_events_user ON public.catalyst_events(user_id);
CREATE INDEX idx_market_memory_user ON public.market_memory_events(user_id);
CREATE INDEX idx_advisor_obs_user ON public.investment_advisor_observations(user_id);
CREATE INDEX idx_asset_snapshots_asset ON public.asset_market_snapshots(asset_id);

-- ── 20260405152745_1cbfc827-e87e-4497-b64f-6ea18ae64931.sql ──
-- Revenue Office Data Model
-- Funnels
CREATE TABLE public.revenue_funnels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  funnel_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  steps JSONB DEFAULT '[]'::jsonb,
  total_visitors INTEGER DEFAULT 0,
  total_optins INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue_cents INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_funnels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own funnels" ON public.revenue_funnels FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.revenue_funnel_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  funnel_id UUID REFERENCES public.revenue_funnels(id) ON DELETE CASCADE NOT NULL,
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL DEFAULT 0,
  page_type TEXT DEFAULT 'landing',
  visitors INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_funnel_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own funnel steps" ON public.revenue_funnel_steps FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Campaigns
CREATE TABLE public.revenue_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL DEFAULT 'email',
  status TEXT NOT NULL DEFAULT 'draft',
  steps_count INTEGER DEFAULT 0,
  segment_id UUID,
  subscribers INTEGER DEFAULT 0,
  open_rate NUMERIC(5,2) DEFAULT 0,
  click_rate NUMERIC(5,2) DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue_cents INTEGER DEFAULT 0,
  completion_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own campaigns" ON public.revenue_campaigns FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Segments
CREATE TABLE public.revenue_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  segment_name TEXT NOT NULL,
  filter_criteria JSONB DEFAULT '{}'::jsonb,
  contact_count INTEGER DEFAULT 0,
  growth_rate TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own segments" ON public.revenue_segments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Offers (products, services, memberships, courses, bundles)
CREATE TABLE public.revenue_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  offer_name TEXT NOT NULL,
  offer_type TEXT NOT NULL DEFAULT 'digital',
  category TEXT DEFAULT 'product',
  price_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  recurring_interval TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  total_sales INTEGER DEFAULT 0,
  total_revenue_cents INTEGER DEFAULT 0,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own offers" ON public.revenue_offers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.revenue_offer_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  offer_id UUID REFERENCES public.revenue_offers(id) ON DELETE CASCADE NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);
ALTER TABLE public.revenue_offer_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own offer sales" ON public.revenue_offer_sales FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Booking Services
CREATE TABLE public.revenue_booking_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  total_bookings INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_booking_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own booking services" ON public.revenue_booking_services FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.revenue_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_id UUID REFERENCES public.revenue_booking_services(id) ON DELETE SET NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'pending',
  mode TEXT DEFAULT 'video',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookings" ON public.revenue_bookings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reviews & Reputation
CREATE TABLE public.revenue_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reviewer_name TEXT NOT NULL,
  platform TEXT DEFAULT 'google',
  rating INTEGER NOT NULL DEFAULT 5,
  review_text TEXT,
  responded BOOLEAN DEFAULT false,
  response_text TEXT,
  review_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reviews" ON public.revenue_reviews FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.revenue_reputation_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  nps_score INTEGER DEFAULT 0,
  response_rate NUMERIC(5,2) DEFAULT 0,
  period TEXT DEFAULT 'monthly',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_reputation_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reputation metrics" ON public.revenue_reputation_metrics FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Retention
CREATE TABLE public.revenue_retention_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id TEXT,
  contact_name TEXT,
  signal_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  details JSONB DEFAULT '{}'::jsonb,
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_retention_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own retention signals" ON public.revenue_retention_signals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.revenue_winback_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  churned_at TIMESTAMPTZ,
  ltv_cents INTEGER DEFAULT 0,
  churn_reason TEXT,
  winback_strategy TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_winback_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own winback queue" ON public.revenue_winback_queue FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Experiments / A/B Testing
CREATE TABLE public.revenue_experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  experiment_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  confidence INTEGER DEFAULT 0,
  lift TEXT,
  winner_variant TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own experiments" ON public.revenue_experiments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.revenue_experiment_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  experiment_id UUID REFERENCES public.revenue_experiments(id) ON DELETE CASCADE NOT NULL,
  variant_name TEXT NOT NULL,
  visitors INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_experiment_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own experiment variants" ON public.revenue_experiment_variants FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Journey Touchpoints
CREATE TABLE public.revenue_journey_touchpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stage TEXT NOT NULL,
  touchpoint_type TEXT NOT NULL,
  label TEXT NOT NULL,
  entered_count INTEGER DEFAULT 0,
  exited_count INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_journey_touchpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journey touchpoints" ON public.revenue_journey_touchpoints FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Leak Items
CREATE TABLE public.revenue_leak_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  revenue_at_risk_cents INTEGER DEFAULT 0,
  days_stale INTEGER DEFAULT 0,
  severity TEXT DEFAULT 'medium',
  action_needed TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_leak_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own leak items" ON public.revenue_leak_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Advisor Stances
CREATE TABLE public.revenue_advisor_stances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  advisor_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  stance TEXT NOT NULL,
  recommendation TEXT,
  confidence NUMERIC(3,2) DEFAULT 0,
  stance_type TEXT DEFAULT 'opportunity',
  watching JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_advisor_stances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own advisor stances" ON public.revenue_advisor_stances FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Revenue Memory Events
CREATE TABLE public.revenue_memory_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id TEXT,
  title TEXT NOT NULL,
  summary TEXT,
  severity TEXT DEFAULT 'info',
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_memory_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own revenue memory events" ON public.revenue_memory_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 20260405162554_11f68e00-ab59-4985-bdf1-d86dcf275f70.sql ──
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Digital Presence Office: Full Schema
-- ═══════════════════════════════════════════════════════════════

-- A. digital_presence_profiles
CREATE TABLE public.digital_presence_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_twin_id UUID,
  mode TEXT NOT NULL DEFAULT 'create_new' CHECK (mode IN ('create_new','connect_existing','hybrid')),
  primary_site_id UUID,
  primary_brand_kit_id UUID,
  presence_type_flags TEXT[] DEFAULT '{}',
  default_autonomy_mode TEXT NOT NULL DEFAULT 'observe' CHECK (default_autonomy_mode IN ('observe','draft_review','guardrailed','autonomous')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.digital_presence_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own presence profiles" ON public.digital_presence_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_digital_presence_profiles_updated_at BEFORE UPDATE ON public.digital_presence_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- B. site_registry
CREATE TABLE public.site_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  presence_profile_id UUID REFERENCES public.digital_presence_profiles(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL DEFAULT 'native' CHECK (source_type IN ('native','shopify','webflow','wordpress','wix','squarespace','custom','other')),
  display_name TEXT NOT NULL,
  domain TEXT,
  environment_type TEXT NOT NULL DEFAULT 'live' CHECK (environment_type IN ('live','staging','preview')),
  editable_capabilities TEXT[] DEFAULT '{}',
  monitoring_capabilities TEXT[] DEFAULT '{}',
  sync_status TEXT DEFAULT 'pending',
  health_status TEXT DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sites" ON public.site_registry FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_site_registry_updated_at BEFORE UPDATE ON public.site_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- C. site_pages
CREATE TABLE public.site_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  site_id UUID REFERENCES public.site_registry(id) ON DELETE CASCADE NOT NULL,
  page_type TEXT NOT NULL DEFAULT 'other' CHECK (page_type IN ('homepage','landing','service','product','collection','booking','checkout','blog','faq','policy','member','other')),
  title TEXT NOT NULL,
  path TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  linked_offer_ids TEXT[] DEFAULT '{}',
  linked_product_ids TEXT[] DEFAULT '{}',
  linked_campaign_ids TEXT[] DEFAULT '{}',
  freshness_score NUMERIC DEFAULT 0,
  health_score NUMERIC DEFAULT 0,
  trust_score NUMERIC DEFAULT 0,
  conversion_score NUMERIC DEFAULT 0,
  mobile_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pages" ON public.site_pages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_site_pages_updated_at BEFORE UPDATE ON public.site_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- D. website_twins
CREATE TABLE public.website_twins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  site_id UUID REFERENCES public.site_registry(id) ON DELETE CASCADE NOT NULL,
  page_nodes JSONB DEFAULT '[]',
  journey_paths JSONB DEFAULT '[]',
  trust_nodes JSONB DEFAULT '[]',
  issue_nodes JSONB DEFAULT '[]',
  conversion_nodes JSONB DEFAULT '[]',
  commerce_nodes JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.website_twins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own twins" ON public.website_twins FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_website_twins_updated_at BEFORE UPDATE ON public.website_twins FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- E. brand_kits
CREATE TABLE public.brand_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  presence_profile_id UUID REFERENCES public.digital_presence_profiles(id) ON DELETE CASCADE,
  logo_assets JSONB DEFAULT '[]',
  colors JSONB DEFAULT '[]',
  typography JSONB DEFAULT '[]',
  tone_descriptors TEXT[] DEFAULT '{}',
  image_direction TEXT[] DEFAULT '{}',
  style_tokens JSONB DEFAULT '{}',
  component_styles JSONB DEFAULT '{}',
  brand_rules JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own brand kits" ON public.brand_kits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_brand_kits_updated_at BEFORE UPDATE ON public.brand_kits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- F. promotions
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  presence_profile_id UUID REFERENCES public.digital_presence_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'banner',
  linked_offer_ids TEXT[] DEFAULT '{}',
  linked_product_ids TEXT[] DEFAULT '{}',
  linked_page_ids TEXT[] DEFAULT '{}',
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT false,
  promotion_assets JSONB DEFAULT '[]',
  sync_state TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own promotions" ON public.promotions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- G. product_presence
CREATE TABLE public.product_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id TEXT NOT NULL,
  site_id UUID REFERENCES public.site_registry(id) ON DELETE CASCADE NOT NULL,
  page_ids TEXT[] DEFAULT '{}',
  merchandising_status TEXT DEFAULT 'active',
  featured_state TEXT DEFAULT 'none',
  stale_content_risk NUMERIC DEFAULT 0,
  conversion_health NUMERIC DEFAULT 0,
  recommendation_state TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.product_presence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own product presence" ON public.product_presence FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_product_presence_updated_at BEFORE UPDATE ON public.product_presence FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- H. site_issues
CREATE TABLE public.site_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  site_id UUID REFERENCES public.site_registry(id) ON DELETE CASCADE NOT NULL,
  page_id UUID REFERENCES public.site_pages(id) ON DELETE SET NULL,
  issue_type TEXT NOT NULL CHECK (issue_type IN ('broken_link','missing_asset','stale_content','expired_promo','cta_weakness','trust_gap','mobile_issue','form_failure','checkout_issue','seo_gap','other')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical','high','medium','low')),
  confidence NUMERIC DEFAULT 0,
  detected_by_agent_ids TEXT[] DEFAULT '{}',
  recommended_fix_type TEXT,
  auto_fix_eligible BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','acknowledged','fixing','fixed','ignored','wont_fix')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own site issues" ON public.site_issues FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_site_issues_updated_at BEFORE UPDATE ON public.site_issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- I. site_opportunities
CREATE TABLE public.site_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  site_id UUID REFERENCES public.site_registry(id) ON DELETE CASCADE NOT NULL,
  page_id UUID REFERENCES public.site_pages(id) ON DELETE SET NULL,
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('cta_improvement','new_landing_page','promo_opportunity','product_highlight','bundle_opportunity','trust_improvement','copy_refresh','journey_improvement','other')),
  impact_estimate TEXT DEFAULT 'medium',
  effort_estimate TEXT DEFAULT 'medium',
  confidence NUMERIC DEFAULT 0,
  surfaced_by_agent_ids TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','accepted','in_progress','completed','dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own opportunities" ON public.site_opportunities FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_site_opportunities_updated_at BEFORE UPDATE ON public.site_opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- J. content_freshness
CREATE TABLE public.content_freshness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  page_id UUID REFERENCES public.site_pages(id) ON DELETE CASCADE NOT NULL,
  stale_signals JSONB DEFAULT '[]',
  stale_reason TEXT,
  last_reviewed_at TIMESTAMPTZ,
  suggested_refresh TEXT,
  confidence NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.content_freshness ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own freshness records" ON public.content_freshness FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_content_freshness_updated_at BEFORE UPDATE ON public.content_freshness FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- K. change_plans
CREATE TABLE public.change_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  site_id UUID REFERENCES public.site_registry(id) ON DELETE CASCADE NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('page','site','brand','promotion','product_presence','collection','checkout','other')),
  target_id UUID,
  reason TEXT,
  generated_by_agent_ids TEXT[] DEFAULT '{}',
  risk_class TEXT DEFAULT 'low' CHECK (risk_class IN ('low','medium','high','critical')),
  confidence NUMERIC DEFAULT 0,
  proposed_diff_summary TEXT,
  preview_artifacts JSONB DEFAULT '[]',
  approval_required BOOLEAN DEFAULT true,
  policy_check_result JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','approved','applied','failed','rolled_back','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.change_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own change plans" ON public.change_plans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_change_plans_updated_at BEFORE UPDATE ON public.change_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- L. patch_executions
CREATE TABLE public.patch_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  change_plan_id UUID REFERENCES public.change_plans(id) ON DELETE CASCADE NOT NULL,
  execution_mode TEXT NOT NULL CHECK (execution_mode IN ('manual_apply','api_apply','builder_publish','export_patch')),
  result JSONB,
  verification_result JSONB,
  rollback_available BOOLEAN DEFAULT false,
  executed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.patch_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own patch executions" ON public.patch_executions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- M. presence_receipts
CREATE TABLE public.presence_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  presence_profile_id UUID REFERENCES public.digital_presence_profiles(id) ON DELETE SET NULL,
  receipt_type TEXT NOT NULL CHECK (receipt_type IN ('publish','patch_apply','promotion_change','brand_update','site_connection','rollback','other')),
  related_change_plan_id UUID REFERENCES public.change_plans(id) ON DELETE SET NULL,
  actor TEXT,
  summary TEXT,
  approval_state TEXT DEFAULT 'none',
  affected_assets TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.presence_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own presence receipts" ON public.presence_receipts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- N. digital_agents
CREATE TABLE public.digital_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('web_strategist','design_director','content_strategist','cro_advisor','technical_qa','seo_discovery','ecommerce_merchandising','promotions_advisor','website_ops','app_experience')),
  display_name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 5,
  mode_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.digital_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own digital agents" ON public.digital_agents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_digital_agents_updated_at BEFORE UPDATE ON public.digital_agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- O. digital_agent_observations
CREATE TABLE public.digital_agent_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id UUID REFERENCES public.digital_agents(id) ON DELETE CASCADE NOT NULL,
  owner_type TEXT NOT NULL,
  owner_id UUID,
  title TEXT NOT NULL,
  summary TEXT,
  detailed_reasoning TEXT,
  confidence_level NUMERIC DEFAULT 0,
  uncertainty_level NUMERIC DEFAULT 0,
  recommendation_type TEXT,
  what_changed TEXT,
  what_would_improve TEXT,
  what_could_break TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.digital_agent_observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own agent observations" ON public.digital_agent_observations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_digital_agent_observations_updated_at BEFORE UPDATE ON public.digital_agent_observations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- P. digital_agent_debates
CREATE TABLE public.digital_agent_debates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  owner_type TEXT NOT NULL,
  owner_id UUID,
  participating_agent_ids TEXT[] DEFAULT '{}',
  alignment_summary TEXT,
  disagreement_summary TEXT,
  conflicting_assumptions JSONB DEFAULT '[]',
  resolution_signals JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.digital_agent_debates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own agent debates" ON public.digital_agent_debates FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_digital_agent_debates_updated_at BEFORE UPDATE ON public.digital_agent_debates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Q. chief_digital_synthesis
CREATE TABLE public.chief_digital_synthesis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  owner_type TEXT NOT NULL,
  owner_id UUID,
  strongest_opportunity TEXT,
  strongest_risk TEXT,
  highest_priority_fix TEXT,
  recommended_next_step TEXT,
  confidence_summary JSONB DEFAULT '{}',
  aligned_views JSONB DEFAULT '[]',
  divergent_views JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chief_digital_synthesis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own digital synthesis" ON public.chief_digital_synthesis FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_chief_digital_synthesis_updated_at BEFORE UPDATE ON public.chief_digital_synthesis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- R. presence_timeline_events
CREATE TABLE public.presence_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  presence_profile_id UUID REFERENCES public.digital_presence_profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  site_id UUID REFERENCES public.site_registry(id) ON DELETE SET NULL,
  page_id UUID REFERENCES public.site_pages(id) ON DELETE SET NULL,
  related_change_plan_id UUID REFERENCES public.change_plans(id) ON DELETE SET NULL,
  related_agent_ids TEXT[] DEFAULT '{}',
  summary TEXT,
  impact_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.presence_timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own timeline events" ON public.presence_timeline_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- S. launch_records
CREATE TABLE public.launch_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  presence_profile_id UUID REFERENCES public.digital_presence_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  objective TEXT,
  linked_pages TEXT[] DEFAULT '{}',
  linked_promotions TEXT[] DEFAULT '{}',
  readiness_state TEXT DEFAULT 'planning' CHECK (readiness_state IN ('planning','preparing','ready','launched','post_launch','cancelled')),
  checklist_items JSONB DEFAULT '[]',
  rollback_plan JSONB,
  advisor_signoff_state JSONB DEFAULT '{}',
  launch_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.launch_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own launch records" ON public.launch_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_launch_records_updated_at BEFORE UPDATE ON public.launch_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for common queries
CREATE INDEX idx_site_registry_user ON public.site_registry(user_id);
CREATE INDEX idx_site_pages_site ON public.site_pages(site_id);
CREATE INDEX idx_site_issues_site ON public.site_issues(site_id);
CREATE INDEX idx_site_issues_status ON public.site_issues(status);
CREATE INDEX idx_site_opportunities_site ON public.site_opportunities(site_id);
CREATE INDEX idx_change_plans_site ON public.change_plans(site_id);
CREATE INDEX idx_change_plans_status ON public.change_plans(status);
CREATE INDEX idx_digital_agent_observations_agent ON public.digital_agent_observations(agent_id);
CREATE INDEX idx_presence_timeline_events_site ON public.presence_timeline_events(site_id);
CREATE INDEX idx_promotions_active ON public.promotions(active);
CREATE INDEX idx_content_freshness_page ON public.content_freshness(page_id);

-- ── 20260405165115_3b1281d0-8d35-4834-9853-68bfd85ffac1.sql ──
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Platform Truth Hardening: Core Infrastructure
-- ═══════════════════════════════════════════════════════════════

-- 1. Platform Projection States
CREATE TABLE public.platform_projection_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  projection_key TEXT NOT NULL,
  domain TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'database',
  freshness_status TEXT NOT NULL DEFAULT 'unknown' CHECK (freshness_status IN ('fresh', 'stale', 'degraded', 'unknown', 'offline')),
  confidence_level NUMERIC(3,2) DEFAULT 1.0 CHECK (confidence_level >= 0 AND confidence_level <= 1),
  staleness_threshold_seconds INTEGER NOT NULL DEFAULT 3600,
  last_materialized_at TIMESTAMPTZ,
  last_source_sync_at TIMESTAMPTZ,
  degraded BOOLEAN NOT NULL DEFAULT false,
  degraded_reason TEXT,
  data_hash TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, projection_key)
);

ALTER TABLE public.platform_projection_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own projection states" ON public.platform_projection_states FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own projection states" ON public.platform_projection_states FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own projection states" ON public.platform_projection_states FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own projection states" ON public.platform_projection_states FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_platform_projection_states_updated_at BEFORE UPDATE ON public.platform_projection_states FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Platform Mutation Receipts
CREATE TABLE public.platform_mutation_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mutation_type TEXT NOT NULL,
  domain TEXT NOT NULL,
  actor TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  payload_hash TEXT,
  policy_decision_id TEXT,
  approval_id TEXT,
  proof_bundle_id TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'rolled_back')),
  error TEXT,
  duration_ms INTEGER,
  correlation_id TEXT,
  receipt_hash TEXT NOT NULL,
  previous_receipt_hash TEXT NOT NULL DEFAULT 'genesis',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_mutation_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own mutation receipts" ON public.platform_mutation_receipts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Authenticated users create mutation receipts" ON public.platform_mutation_receipts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_mutation_receipts_correlation ON public.platform_mutation_receipts (correlation_id);
CREATE INDEX idx_mutation_receipts_domain ON public.platform_mutation_receipts (domain);
CREATE INDEX idx_mutation_receipts_created ON public.platform_mutation_receipts (created_at DESC);

-- 3. Platform Health Snapshots
CREATE TABLE public.platform_health_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  component TEXT NOT NULL,
  health_status TEXT NOT NULL DEFAULT 'unknown' CHECK (health_status IN ('healthy', 'degraded', 'unhealthy', 'unknown', 'offline')),
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  details JSONB DEFAULT '{}'::jsonb,
  degraded_capabilities TEXT[] DEFAULT '{}',
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_health_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own health snapshots" ON public.platform_health_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own health snapshots" ON public.platform_health_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_health_snapshots_domain ON public.platform_health_snapshots (domain, component);
CREATE INDEX idx_health_snapshots_checked ON public.platform_health_snapshots (checked_at DESC);

-- 4. Platform Degraded States
CREATE TABLE public.platform_degraded_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  component TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  reason TEXT NOT NULL,
  impact_description TEXT,
  affected_capabilities TEXT[] DEFAULT '{}',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  auto_detected BOOLEAN NOT NULL DEFAULT true,
  resolution_notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_degraded_states ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own degraded states" ON public.platform_degraded_states FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own degraded states" ON public.platform_degraded_states FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own degraded states" ON public.platform_degraded_states FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own degraded states" ON public.platform_degraded_states FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_platform_degraded_states_updated_at BEFORE UPDATE ON public.platform_degraded_states FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Platform Launch Gates
CREATE TABLE public.platform_launch_gates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  gate_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  required BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed', 'skipped', 'overridden')),
  evidence_type TEXT,
  evidence_summary TEXT,
  evidence_data JSONB DEFAULT '{}'::jsonb,
  last_checked_at TIMESTAMPTZ,
  gate_owner TEXT,
  blocking_reason TEXT,
  override_by TEXT,
  override_reason TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_launch_gates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own launch gates" ON public.platform_launch_gates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own launch gates" ON public.platform_launch_gates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own launch gates" ON public.platform_launch_gates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own launch gates" ON public.platform_launch_gates FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_platform_launch_gates_updated_at BEFORE UPDATE ON public.platform_launch_gates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Platform Truth Sync Log
CREATE TABLE public.platform_truth_sync_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  artifact_type TEXT NOT NULL,
  artifact_path TEXT NOT NULL,
  source_hash TEXT,
  generated_hash TEXT,
  in_sync BOOLEAN NOT NULL DEFAULT true,
  drift_description TEXT,
  last_synced_at TIMESTAMPTZ,
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_truth_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own truth sync log" ON public.platform_truth_sync_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own truth sync log" ON public.platform_truth_sync_log FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own truth sync log" ON public.platform_truth_sync_log FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_platform_truth_sync_log_updated_at BEFORE UPDATE ON public.platform_truth_sync_log FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260405171427_54bfd2f9-80bf-4b13-b690-239fcc53e44b.sql ──
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Platform Truth Data Model Expansion (Records A-U)
-- Covers: proof chains, replay/rollback verification, deployment gates,
-- connector lifecycle, concierge continuity, security posture, validation scores
-- ═══════════════════════════════════════════════════════════════

-- A. Admin Mutation Records (extends platform_mutation_receipts with richer fields)
CREATE TABLE public.platform_admin_mutations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  actor_id TEXT NOT NULL,
  actor_type TEXT NOT NULL DEFAULT 'owner',
  surface TEXT NOT NULL,
  mutation_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  persisted_at TIMESTAMPTZ,
  durability_status TEXT NOT NULL DEFAULT 'pending' CHECK (durability_status IN ('pending','persisted','transient','failed')),
  canonical_write_path_used BOOLEAN NOT NULL DEFAULT true,
  policy_decision_ref TEXT,
  receipt_ref TEXT,
  projection_impact_refs TEXT[] DEFAULT '{}',
  rollback_eligible BOOLEAN NOT NULL DEFAULT false,
  rollback_ref TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_admin_mutations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own admin mutations" ON public.platform_admin_mutations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own admin mutations" ON public.platform_admin_mutations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_admin_mutations_surface ON public.platform_admin_mutations (surface);
CREATE INDEX idx_admin_mutations_created ON public.platform_admin_mutations (created_at DESC);

-- B. Admin Durability State
CREATE TABLE public.platform_admin_durability_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mutation_id UUID REFERENCES public.platform_admin_mutations(id) ON DELETE CASCADE,
  persistence_confirmed BOOLEAN NOT NULL DEFAULT false,
  durable_store_ref TEXT,
  projection_observed BOOLEAN NOT NULL DEFAULT false,
  lineage_complete BOOLEAN NOT NULL DEFAULT false,
  degraded BOOLEAN NOT NULL DEFAULT false,
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_admin_durability_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own durability states" ON public.platform_admin_durability_states FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own durability states" ON public.platform_admin_durability_states FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own durability states" ON public.platform_admin_durability_states FOR UPDATE USING (auth.uid() = user_id);

-- D. Read Model Health Records
CREATE TABLE public.platform_read_model_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  read_model_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'healthy' CHECK (status IN ('healthy','degraded','unhealthy','rebuilding','offline')),
  rebuild_eligible BOOLEAN NOT NULL DEFAULT true,
  rebuild_last_attempt_at TIMESTAMPTZ,
  rebuild_last_result TEXT,
  error_count INTEGER NOT NULL DEFAULT 0,
  stale_surface_count INTEGER NOT NULL DEFAULT 0,
  dependency_refs TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, read_model_name)
);
ALTER TABLE public.platform_read_model_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own read model health" ON public.platform_read_model_health FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own read model health" ON public.platform_read_model_health FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own read model health" ON public.platform_read_model_health FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_read_model_health_updated_at BEFORE UPDATE ON public.platform_read_model_health FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- E. Proof Chain Records
CREATE TABLE public.platform_proof_chains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  capability_id TEXT NOT NULL,
  action_id TEXT NOT NULL,
  canonical_chain_version INTEGER NOT NULL DEFAULT 1,
  policy_step_ref TEXT,
  approval_step_ref TEXT,
  execution_step_ref TEXT,
  event_step_refs TEXT[] DEFAULT '{}',
  receipt_step_ref TEXT,
  projection_step_refs TEXT[] DEFAULT '{}',
  proof_integrity_status TEXT NOT NULL DEFAULT 'pending' CHECK (proof_integrity_status IN ('pending','intact','broken','partial')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_proof_chains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own proof chains" ON public.platform_proof_chains FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own proof chains" ON public.platform_proof_chains FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_proof_chains_capability ON public.platform_proof_chains (capability_id);

-- F. Proof Coverage Records
CREATE TABLE public.platform_proof_coverage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  capability_id TEXT NOT NULL,
  approval_coverage BOOLEAN NOT NULL DEFAULT false,
  receipt_coverage BOOLEAN NOT NULL DEFAULT false,
  replay_coverage BOOLEAN NOT NULL DEFAULT false,
  rollback_coverage BOOLEAN NOT NULL DEFAULT false,
  branch_coverage NUMERIC(3,2) DEFAULT 0,
  degraded_branch_coverage NUMERIC(3,2) DEFAULT 0,
  coverage_status TEXT NOT NULL DEFAULT 'incomplete' CHECK (coverage_status IN ('complete','partial','incomplete','not_applicable')),
  last_validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, capability_id)
);
ALTER TABLE public.platform_proof_coverage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own proof coverage" ON public.platform_proof_coverage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own proof coverage" ON public.platform_proof_coverage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own proof coverage" ON public.platform_proof_coverage FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_proof_coverage_updated_at BEFORE UPDATE ON public.platform_proof_coverage FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- G. Replay Verification Records
CREATE TABLE public.platform_replay_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  capability_id TEXT NOT NULL,
  scenario_id TEXT NOT NULL,
  branch_type TEXT NOT NULL DEFAULT 'happy_path',
  replay_status TEXT NOT NULL DEFAULT 'pending' CHECK (replay_status IN ('pending','passed','failed','inconclusive','skipped')),
  verified_at TIMESTAMPTZ,
  mismatch_summary TEXT,
  evidence_refs TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_replay_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own replay verifications" ON public.platform_replay_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own replay verifications" ON public.platform_replay_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- H. Rollback Verification Records
CREATE TABLE public.platform_rollback_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  capability_id TEXT NOT NULL,
  scenario_id TEXT NOT NULL,
  rollback_status TEXT NOT NULL DEFAULT 'pending' CHECK (rollback_status IN ('pending','passed','failed','partial','skipped')),
  partial_rollback_risk BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  evidence_refs TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_rollback_verifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own rollback verifications" ON public.platform_rollback_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own rollback verifications" ON public.platform_rollback_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- I. Deployment Gate Records
CREATE TABLE public.platform_deployment_gates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  release_id TEXT NOT NULL,
  environment TEXT NOT NULL,
  gate_type TEXT NOT NULL CHECK (gate_type IN ('smoke','load','ha','dr','secret_integrity','config_integrity','policy','approval','vmware_evidence')),
  state TEXT NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','passed','failed','skipped','overridden')),
  evidence_ref TEXT,
  owner TEXT,
  last_updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_deployment_gates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own deployment gates" ON public.platform_deployment_gates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own deployment gates" ON public.platform_deployment_gates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own deployment gates" ON public.platform_deployment_gates FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_deployment_gates_release ON public.platform_deployment_gates (release_id, environment);

-- J. Promotion Readiness Records
CREATE TABLE public.platform_promotion_readiness (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ring TEXT NOT NULL,
  environment TEXT NOT NULL,
  release_id TEXT NOT NULL,
  readiness_score INTEGER CHECK (readiness_score >= 0 AND readiness_score <= 100),
  blocker_refs TEXT[] DEFAULT '{}',
  required_evidence_refs TEXT[] DEFAULT '{}',
  approved_for_promotion BOOLEAN NOT NULL DEFAULT false,
  approved_by TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_promotion_readiness ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own promotion readiness" ON public.platform_promotion_readiness FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own promotion readiness" ON public.platform_promotion_readiness FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own promotion readiness" ON public.platform_promotion_readiness FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_promotion_readiness_updated_at BEFORE UPDATE ON public.platform_promotion_readiness FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- K. Environment Truth Records
CREATE TABLE public.platform_environment_truth (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  environment TEXT NOT NULL,
  release_id TEXT NOT NULL,
  deployment_state TEXT NOT NULL DEFAULT 'unknown',
  secret_integrity_state TEXT NOT NULL DEFAULT 'unknown',
  config_integrity_state TEXT NOT NULL DEFAULT 'unknown',
  smoke_state TEXT NOT NULL DEFAULT 'unknown',
  load_state TEXT NOT NULL DEFAULT 'unknown',
  rollback_ready BOOLEAN NOT NULL DEFAULT false,
  ha_ready BOOLEAN NOT NULL DEFAULT false,
  dr_ready BOOLEAN NOT NULL DEFAULT false,
  last_validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, environment, release_id)
);
ALTER TABLE public.platform_environment_truth ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own environment truth" ON public.platform_environment_truth FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own environment truth" ON public.platform_environment_truth FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own environment truth" ON public.platform_environment_truth FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_environment_truth_updated_at BEFORE UPDATE ON public.platform_environment_truth FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- L. Connector Lifecycle Records
CREATE TABLE public.platform_connector_lifecycle (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  connector_id TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'registered' CHECK (state IN ('registered','activating','active','paused','degraded','failed','decommissioned')),
  state_reason TEXT,
  approved_actions TEXT[] DEFAULT '{}',
  blocked_actions TEXT[] DEFAULT '{}',
  degraded_mode BOOLEAN NOT NULL DEFAULT false,
  version TEXT,
  policy_refs TEXT[] DEFAULT '{}',
  health_refs TEXT[] DEFAULT '{}',
  last_transition_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_connector_lifecycle ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own connector lifecycle" ON public.platform_connector_lifecycle FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own connector lifecycle" ON public.platform_connector_lifecycle FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own connector lifecycle" ON public.platform_connector_lifecycle FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_connector_lifecycle_updated_at BEFORE UPDATE ON public.platform_connector_lifecycle FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- M. Connector Health Records
CREATE TABLE public.platform_connector_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  connector_id TEXT NOT NULL,
  sync_state TEXT NOT NULL DEFAULT 'unknown',
  error_rate NUMERIC(5,2) DEFAULT 0,
  degraded BOOLEAN NOT NULL DEFAULT false,
  capability_losses TEXT[] DEFAULT '{}',
  last_healthy_at TIMESTAMPTZ,
  last_checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_connector_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own connector health" ON public.platform_connector_health FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own connector health" ON public.platform_connector_health FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_connector_health_connector ON public.platform_connector_health (connector_id);

-- N. Generated Truth Manifests (extends platform_truth_sync_log)
CREATE TABLE public.platform_truth_manifests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scope_type TEXT NOT NULL,
  scope_id TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source_of_truth_refs TEXT[] DEFAULT '{}',
  claim_refs TEXT[] DEFAULT '{}',
  runtime_evidence_refs TEXT[] DEFAULT '{}',
  drift_status TEXT NOT NULL DEFAULT 'unknown' CHECK (drift_status IN ('synced','drifted','unknown','checking')),
  drift_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_truth_manifests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own truth manifests" ON public.platform_truth_manifests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own truth manifests" ON public.platform_truth_manifests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own truth manifests" ON public.platform_truth_manifests FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_truth_manifests_updated_at BEFORE UPDATE ON public.platform_truth_manifests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- O. Docs/Runtime Drift Records
CREATE TABLE public.platform_docs_runtime_drift (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  doc_ref TEXT NOT NULL,
  runtime_scope TEXT NOT NULL,
  claim_summary TEXT,
  evidence_summary TEXT,
  severity TEXT NOT NULL DEFAULT 'low' CHECK (severity IN ('info','low','medium','high','critical')),
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
ALTER TABLE public.platform_docs_runtime_drift ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own drift records" ON public.platform_docs_runtime_drift FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own drift records" ON public.platform_docs_runtime_drift FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own drift records" ON public.platform_docs_runtime_drift FOR UPDATE USING (auth.uid() = user_id);

-- P. Security Posture Records
CREATE TABLE public.platform_security_posture (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scope_type TEXT NOT NULL,
  scope_id TEXT NOT NULL,
  encryption_at_rest_state TEXT NOT NULL DEFAULT 'unknown',
  secret_integrity_state TEXT NOT NULL DEFAULT 'unknown',
  data_classification_state TEXT NOT NULL DEFAULT 'unknown',
  policy_protection_state TEXT NOT NULL DEFAULT 'unknown',
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, scope_type, scope_id)
);
ALTER TABLE public.platform_security_posture ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own security posture" ON public.platform_security_posture FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own security posture" ON public.platform_security_posture FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own security posture" ON public.platform_security_posture FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_security_posture_updated_at BEFORE UPDATE ON public.platform_security_posture FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Q. Validation Score Records
CREATE TABLE public.platform_validation_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scope_type TEXT NOT NULL,
  scope_id TEXT NOT NULL,
  readiness_score INTEGER CHECK (readiness_score >= 0 AND readiness_score <= 100),
  test_coverage_score INTEGER CHECK (test_coverage_score >= 0 AND test_coverage_score <= 100),
  proof_coverage_score INTEGER CHECK (proof_coverage_score >= 0 AND proof_coverage_score <= 100),
  deployment_truth_score INTEGER CHECK (deployment_truth_score >= 0 AND deployment_truth_score <= 100),
  blocker_count INTEGER NOT NULL DEFAULT 0,
  evidence_completeness_score INTEGER CHECK (evidence_completeness_score >= 0 AND evidence_completeness_score <= 100),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_validation_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own validation scores" ON public.platform_validation_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own validation scores" ON public.platform_validation_scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- R. Launch Blocker Records
CREATE TABLE public.platform_launch_blockers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'high' CHECK (severity IN ('critical','high','medium','low')),
  domain TEXT NOT NULL,
  scope_ref TEXT,
  description TEXT,
  evidence_missing TEXT[] DEFAULT '{}',
  owner TEXT,
  ring_impact TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
ALTER TABLE public.platform_launch_blockers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own launch blockers" ON public.platform_launch_blockers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own launch blockers" ON public.platform_launch_blockers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own launch blockers" ON public.platform_launch_blockers FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_launch_blockers_severity ON public.platform_launch_blockers (severity);

-- S. Concierge Continuity Records
CREATE TABLE public.platform_concierge_continuity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  household_id TEXT,
  journey_type TEXT NOT NULL DEFAULT 'task' CHECK (journey_type IN ('task','travel','commitment','household')),
  continuity_state TEXT NOT NULL DEFAULT 'active' CHECK (continuity_state IN ('active','broken','restored','completed','abandoned')),
  broken_at TIMESTAMPTZ,
  restored_at TIMESTAMPTZ,
  receipt_refs TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_concierge_continuity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own concierge continuity" ON public.platform_concierge_continuity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own concierge continuity" ON public.platform_concierge_continuity FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own concierge continuity" ON public.platform_concierge_continuity FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_concierge_continuity_updated_at BEFORE UPDATE ON public.platform_concierge_continuity FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- T. Operator Incident Records
CREATE TABLE public.platform_operator_incidents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical','high','medium','low')),
  affected_scopes TEXT[] DEFAULT '{}',
  start_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  detected_by TEXT,
  alert_refs TEXT[] DEFAULT '{}',
  runbook_refs TEXT[] DEFAULT '{}',
  mitigation_refs TEXT[] DEFAULT '{}',
  current_state TEXT NOT NULL DEFAULT 'detected' CHECK (current_state IN ('detected','investigating','mitigating','resolved','post_mortem')),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_operator_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own incidents" ON public.platform_operator_incidents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own incidents" ON public.platform_operator_incidents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own incidents" ON public.platform_operator_incidents FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_operator_incidents_updated_at BEFORE UPDATE ON public.platform_operator_incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_operator_incidents_state ON public.platform_operator_incidents (current_state);

-- U. Runbook Execution Records
CREATE TABLE public.platform_runbook_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  incident_id UUID REFERENCES public.platform_operator_incidents(id) ON DELETE SET NULL,
  runbook_name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  steps_completed TEXT[] DEFAULT '{}',
  evidence_captured TEXT[] DEFAULT '{}',
  escalations TEXT[] DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  result TEXT CHECK (result IN ('success','partial','failed','abandoned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_runbook_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own runbook executions" ON public.platform_runbook_executions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own runbook executions" ON public.platform_runbook_executions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own runbook executions" ON public.platform_runbook_executions FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_runbook_executions_incident ON public.platform_runbook_executions (incident_id);

-- ── 20260405181824_6aa32102-6b75-4bf4-adb6-0474e2e09bdd.sql ──
-- AI Engineering Missions
CREATE TABLE public.ai_engineering_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  mission_type TEXT NOT NULL DEFAULT 'fix',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'suggested',
  assigned_agents TEXT[] DEFAULT '{}',
  progress INTEGER DEFAULT 0,
  confidence INTEGER DEFAULT 0,
  evidence JSONB DEFAULT '[]',
  blast_radius TEXT,
  rollback_plan TEXT,
  autonomy_mode TEXT NOT NULL DEFAULT 'approval_required',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_engineering_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own missions" ON public.ai_engineering_missions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_engineering_missions_ts BEFORE UPDATE ON public.ai_engineering_missions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI Change Plans
CREATE TABLE public.ai_change_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mission_id UUID REFERENCES public.ai_engineering_missions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_files TEXT[] DEFAULT '{}',
  target_surfaces TEXT[] DEFAULT '{}',
  intended_effect TEXT,
  affected_services TEXT[] DEFAULT '{}',
  confidence INTEGER DEFAULT 0,
  tests_needed TEXT[] DEFAULT '{}',
  rollback_strategy TEXT,
  deployment_scope TEXT DEFAULT 'preview',
  evidence_refs JSONB DEFAULT '[]',
  approval_required BOOLEAN DEFAULT true,
  autonomy_mode TEXT NOT NULL DEFAULT 'approval_required',
  status TEXT NOT NULL DEFAULT 'draft',
  proposed_by_agent TEXT,
  reviewed_by TEXT,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_change_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own change plans" ON public.ai_change_plans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_change_plans_ts BEFORE UPDATE ON public.ai_change_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI Fix Proposals
CREATE TABLE public.ai_fix_proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium',
  root_cause TEXT,
  affected_area TEXT,
  proposed_patch TEXT,
  confidence INTEGER DEFAULT 0,
  test_impact TEXT,
  auto_fix_eligible BOOLEAN DEFAULT false,
  approval_needed BOOLEAN DEFAULT true,
  rollback_safety TEXT DEFAULT 'safe',
  status TEXT NOT NULL DEFAULT 'detected',
  detected_by_agent TEXT,
  error_cluster_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_fix_proposals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own fix proposals" ON public.ai_fix_proposals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_fix_proposals_ts BEFORE UPDATE ON public.ai_fix_proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI Self-Healing Rules
CREATE TABLE public.ai_self_healing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  rule_name TEXT NOT NULL,
  description TEXT,
  trigger_condition TEXT NOT NULL,
  action_type TEXT NOT NULL,
  risk_level TEXT NOT NULL DEFAULT 'low',
  scope_boundary TEXT,
  max_frequency TEXT DEFAULT '1/hour',
  verification_method TEXT,
  enabled BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  total_triggers INTEGER DEFAULT 0,
  total_successes INTEGER DEFAULT 0,
  total_failures INTEGER DEFAULT 0,
  downgraded_at TIMESTAMPTZ,
  downgrade_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_self_healing_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own healing rules" ON public.ai_self_healing_rules FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_self_healing_rules_ts BEFORE UPDATE ON public.ai_self_healing_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI Learning Patterns
CREATE TABLE public.ai_learning_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_description TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  frequency TEXT,
  confidence INTEGER DEFAULT 0,
  action_taken TEXT,
  impact_result TEXT,
  pattern_type TEXT NOT NULL DEFAULT 'failure',
  status TEXT NOT NULL DEFAULT 'proposed',
  first_detected_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  contributing_events JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_learning_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own learning patterns" ON public.ai_learning_patterns FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_learning_patterns_ts BEFORE UPDATE ON public.ai_learning_patterns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI Agent Debate Records
CREATE TABLE public.ai_agent_debate_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  consensus_score INTEGER DEFAULT 0,
  resolution TEXT,
  participants JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_agent_debate_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own debate records" ON public.ai_agent_debate_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_agent_debate_records_ts BEFORE UPDATE ON public.ai_agent_debate_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- AI Design Diffs
CREATE TABLE public.ai_design_diffs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  area TEXT,
  before_state JSONB DEFAULT '{}',
  after_state JSONB DEFAULT '{}',
  rationale TEXT,
  confidence INTEGER DEFAULT 0,
  consistency_score INTEGER DEFAULT 0,
  impact_level TEXT DEFAULT 'medium',
  design_tokens_used TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'proposal',
  proposed_by_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_design_diffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own design diffs" ON public.ai_design_diffs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_design_diffs_ts BEFORE UPDATE ON public.ai_design_diffs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_ai_missions_status ON public.ai_engineering_missions(status);
CREATE INDEX idx_ai_missions_user ON public.ai_engineering_missions(user_id);
CREATE INDEX idx_ai_change_plans_mission ON public.ai_change_plans(mission_id);
CREATE INDEX idx_ai_change_plans_status ON public.ai_change_plans(status);
CREATE INDEX idx_ai_fix_proposals_severity ON public.ai_fix_proposals(severity);
CREATE INDEX idx_ai_fix_proposals_status ON public.ai_fix_proposals(status);
CREATE INDEX idx_ai_healing_rules_enabled ON public.ai_self_healing_rules(enabled);
CREATE INDEX idx_ai_learning_patterns_status ON public.ai_learning_patterns(status);
CREATE INDEX idx_ai_design_diffs_status ON public.ai_design_diffs(status);

-- ── 20260405193456_d4388c0e-dd08-4a0e-b948-f1cf794013ac.sql ──
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Ultra-Efficient Intelligence Architecture Schema
-- 15 canonical tables for intelligence reuse, differential
-- reasoning, efficiency scoring, and outcome economics.
-- ═══════════════════════════════════════════════════════════════

-- A. intelligence_assets
CREATE TABLE public.intelligence_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'other',
  domain TEXT NOT NULL DEFAULT 'engineering',
  title TEXT NOT NULL,
  summary TEXT,
  structured_payload JSONB DEFAULT '{}'::jsonb,
  evidence_refs TEXT[] DEFAULT '{}',
  source_action_refs TEXT[] DEFAULT '{}',
  source_entity_refs TEXT[] DEFAULT '{}',
  source_environment TEXT,
  confidence_score NUMERIC DEFAULT 0,
  freshness_score NUMERIC DEFAULT 0,
  reuse_eligibility BOOLEAN DEFAULT true,
  verification_state TEXT DEFAULT 'unverified',
  invalidation_triggers TEXT[] DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.intelligence_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own intelligence_assets" ON public.intelligence_assets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_intelligence_assets_updated_at BEFORE UPDATE ON public.intelligence_assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_intelligence_assets_domain ON public.intelligence_assets(domain);
CREATE INDEX idx_intelligence_assets_type ON public.intelligence_assets(asset_type);

-- B. intelligence_asset_usages
CREATE TABLE public.intelligence_asset_usages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  intelligence_asset_id UUID REFERENCES public.intelligence_assets(id) ON DELETE CASCADE,
  tenant_id TEXT,
  workspace TEXT,
  mission_id TEXT,
  agent_id TEXT,
  usage_mode TEXT NOT NULL DEFAULT 'direct_reuse',
  reuse_confidence NUMERIC DEFAULT 0,
  applicability_score NUMERIC DEFAULT 0,
  outcome_quality NUMERIC,
  cost_avoided_estimate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.intelligence_asset_usages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own intelligence_asset_usages" ON public.intelligence_asset_usages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- C. intelligence_patterns
CREATE TABLE public.intelligence_patterns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pattern_type TEXT NOT NULL DEFAULT 'other',
  domain TEXT NOT NULL DEFAULT 'engineering',
  label TEXT NOT NULL,
  description TEXT,
  fingerprint_data JSONB DEFAULT '{}'::jsonb,
  confidence NUMERIC DEFAULT 0,
  false_positive_rate NUMERIC DEFAULT 0,
  source_count INTEGER DEFAULT 0,
  privacy_class TEXT DEFAULT 'tenant_private',
  reusable_across_tenants BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.intelligence_patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own intelligence_patterns" ON public.intelligence_patterns FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_intelligence_patterns_updated_at BEFORE UPDATE ON public.intelligence_patterns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- D. differential_reasoning_records
CREATE TABLE public.differential_reasoning_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  owner_type TEXT,
  owner_id TEXT,
  previous_state_ref TEXT,
  current_state_ref TEXT,
  detected_changes JSONB DEFAULT '[]'::jsonb,
  materiality_score NUMERIC DEFAULT 0,
  invalidated_assets TEXT[] DEFAULT '{}',
  preserved_assets TEXT[] DEFAULT '{}',
  recommended_reasoning_mode TEXT DEFAULT 'none',
  reasoning_savings_estimate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.differential_reasoning_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own differential_reasoning_records" ON public.differential_reasoning_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- E. intelligence_packets
CREATE TABLE public.intelligence_packets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  packet_type TEXT NOT NULL DEFAULT 'engineering',
  tenant_id TEXT,
  scope_type TEXT,
  scope_id TEXT,
  summarized_state JSONB DEFAULT '{}'::jsonb,
  recent_changes JSONB DEFAULT '[]'::jsonb,
  active_risks JSONB DEFAULT '[]'::jsonb,
  active_constraints JSONB DEFAULT '[]'::jsonb,
  prior_recommendations JSONB DEFAULT '[]'::jsonb,
  evidence_refs TEXT[] DEFAULT '{}',
  unresolved_questions TEXT[] DEFAULT '{}',
  confidence_profile JSONB DEFAULT '{}'::jsonb,
  freshness_state TEXT DEFAULT 'fresh',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.intelligence_packets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own intelligence_packets" ON public.intelligence_packets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_intelligence_packets_updated_at BEFORE UPDATE ON public.intelligence_packets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- F. packet_compilation_records
CREATE TABLE public.packet_compilation_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  intelligence_packet_id UUID REFERENCES public.intelligence_packets(id) ON DELETE CASCADE,
  compiler_version TEXT DEFAULT '1.0',
  source_refs TEXT[] DEFAULT '{}',
  compression_ratio NUMERIC DEFAULT 0,
  compile_cost_estimate NUMERIC DEFAULT 0,
  compile_latency_ms INTEGER DEFAULT 0,
  quality_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.packet_compilation_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own packet_compilation_records" ON public.packet_compilation_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- G. reasoning_escalation_records
CREATE TABLE public.reasoning_escalation_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id TEXT,
  tenant_id TEXT,
  domain TEXT,
  previous_reasoning_level TEXT,
  new_reasoning_level TEXT,
  trigger_type TEXT NOT NULL DEFAULT 'low_confidence',
  justification TEXT,
  estimated_incremental_cost NUMERIC DEFAULT 0,
  expected_value NUMERIC DEFAULT 0,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reasoning_escalation_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reasoning_escalation_records" ON public.reasoning_escalation_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- H. ai_efficiency_scores
CREATE TABLE public.ai_efficiency_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scope_type TEXT NOT NULL DEFAULT 'agent',
  scope_id TEXT NOT NULL,
  quality_score NUMERIC DEFAULT 0,
  cost_efficiency_score NUMERIC DEFAULT 0,
  acceptance_rate NUMERIC DEFAULT 0,
  override_rate NUMERIC DEFAULT 0,
  false_positive_rate NUMERIC DEFAULT 0,
  verification_success_rate NUMERIC DEFAULT 0,
  reuse_rate NUMERIC DEFAULT 0,
  cache_contribution_rate NUMERIC DEFAULT 0,
  downstream_value_score NUMERIC DEFAULT 0,
  composite_efficiency_score NUMERIC DEFAULT 0,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_efficiency_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ai_efficiency_scores" ON public.ai_efficiency_scores FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- I. outcome_economics_records
CREATE TABLE public.outcome_economics_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  outcome_type TEXT NOT NULL DEFAULT 'other',
  tenant_id TEXT,
  mission_id TEXT,
  total_ai_cost_estimate NUMERIC DEFAULT 0,
  verification_cost_estimate NUMERIC DEFAULT 0,
  total_cost_estimate NUMERIC DEFAULT 0,
  value_estimate NUMERIC DEFAULT 0,
  confidence NUMERIC DEFAULT 0,
  payback_ratio NUMERIC DEFAULT 0,
  success_state TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.outcome_economics_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own outcome_economics_records" ON public.outcome_economics_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- J. intelligence_reuse_opportunities
CREATE TABLE public.intelligence_reuse_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id TEXT,
  domain TEXT,
  current_task_ref TEXT,
  candidate_asset_ids TEXT[] DEFAULT '{}',
  similarity_score NUMERIC DEFAULT 0,
  expected_cost_avoided NUMERIC DEFAULT 0,
  expected_quality_gain NUMERIC DEFAULT 0,
  recommendation_state TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.intelligence_reuse_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own intelligence_reuse_opportunities" ON public.intelligence_reuse_opportunities FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- K. zero_waste_prompt_profiles
CREATE TABLE public.zero_waste_prompt_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  task_type TEXT,
  prompt_template_version TEXT DEFAULT '1.0',
  max_context_class TEXT DEFAULT 'B',
  reusable_instruction_refs TEXT[] DEFAULT '{}',
  packet_driven BOOLEAN DEFAULT true,
  retrieval_mode TEXT DEFAULT 'hybrid',
  redundancy_score NUMERIC DEFAULT 0,
  average_cost_reduction NUMERIC DEFAULT 0,
  quality_impact_score NUMERIC DEFAULT 0,
  active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.zero_waste_prompt_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own zero_waste_prompt_profiles" ON public.zero_waste_prompt_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_zero_waste_prompt_profiles_updated_at BEFORE UPDATE ON public.zero_waste_prompt_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- L. cross_tenant_pattern_learning_records
CREATE TABLE public.cross_tenant_pattern_learning_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  pattern_id UUID REFERENCES public.intelligence_patterns(id) ON DELETE SET NULL,
  anonymization_method TEXT DEFAULT 'k_anonymity',
  source_tenant_count INTEGER DEFAULT 0,
  confidence NUMERIC DEFAULT 0,
  approved_for_use BOOLEAN DEFAULT false,
  restrictions TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cross_tenant_pattern_learning_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cross_tenant_pattern_learning_records" ON public.cross_tenant_pattern_learning_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- M. intelligence_digests
CREATE TABLE public.intelligence_digests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  digest_type TEXT NOT NULL DEFAULT 'daily_summary',
  tenant_id TEXT,
  workspace TEXT,
  summary TEXT,
  evidence_refs TEXT[] DEFAULT '{}',
  confidence NUMERIC DEFAULT 0,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  cache_status TEXT DEFAULT 'fresh'
);
ALTER TABLE public.intelligence_digests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own intelligence_digests" ON public.intelligence_digests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- N. reasoning_path_performance_records
CREATE TABLE public.reasoning_path_performance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  path_label TEXT NOT NULL,
  task_type TEXT,
  domain TEXT,
  average_cost NUMERIC DEFAULT 0,
  average_latency NUMERIC DEFAULT 0,
  average_quality NUMERIC DEFAULT 0,
  escalation_rate NUMERIC DEFAULT 0,
  reuse_rate NUMERIC DEFAULT 0,
  operator_acceptance_rate NUMERIC DEFAULT 0,
  measured_window TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reasoning_path_performance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reasoning_path_performance_records" ON public.reasoning_path_performance_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_reasoning_path_performance_updated_at BEFORE UPDATE ON public.reasoning_path_performance_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- O. intelligence_quality_feedback
CREATE TABLE public.intelligence_quality_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scope_type TEXT NOT NULL,
  scope_id TEXT NOT NULL,
  feedback_type TEXT NOT NULL DEFAULT 'helpful',
  actor_id TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.intelligence_quality_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own intelligence_quality_feedback" ON public.intelligence_quality_feedback FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 20260405202712_95519ea0-8384-44a7-86ba-faeb4da1e010.sql ──
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Engine Persistence Foundation
-- Generic adapter tables + dedicated high-value tables
-- ═══════════════════════════════════════════════════════════════

-- 1. Generic engine state (one row per user per engine)
CREATE TABLE IF NOT EXISTS public.engine_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  engine_name TEXT NOT NULL,
  state_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, engine_name)
);
ALTER TABLE public.engine_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own engine state" ON public.engine_state FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_engine_state_updated_at BEFORE UPDATE ON public.engine_state FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Engine events (append-only log)
CREATE TABLE IF NOT EXISTS public.engine_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  engine_name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.engine_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own engine events" ON public.engine_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own engine events" ON public.engine_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_engine_events_user_engine ON public.engine_events(user_id, engine_name, created_at DESC);

-- 3. Intelligence Assets Library (dedicated)
CREATE TABLE IF NOT EXISTS public.intelligence_assets_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'other',
  domain TEXT NOT NULL DEFAULT 'platform',
  title TEXT NOT NULL DEFAULT '',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence NUMERIC(5,4) NOT NULL DEFAULT 0.5,
  evidence_grade TEXT NOT NULL DEFAULT 'observed',
  reuse_count INTEGER NOT NULL DEFAULT 0,
  adapted_reuse_count INTEGER NOT NULL DEFAULT 0,
  cost_avoided_cents INTEGER NOT NULL DEFAULT 0,
  freshness_score NUMERIC(5,4) NOT NULL DEFAULT 1.0,
  decay_rate NUMERIC(5,4) NOT NULL DEFAULT 0.01,
  invalidated BOOLEAN NOT NULL DEFAULT false,
  invalidation_reason TEXT,
  source_mission_id TEXT,
  source_agent_id TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.intelligence_assets_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own intelligence assets" ON public.intelligence_assets_library FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_intel_assets_domain ON public.intelligence_assets_library(user_id, domain, asset_type);
CREATE INDEX idx_intel_assets_reuse ON public.intelligence_assets_library(user_id, reuse_count DESC);
CREATE TRIGGER update_intel_assets_updated_at BEFORE UPDATE ON public.intelligence_assets_library FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Quality Floor Configs (dedicated)
CREATE TABLE IF NOT EXISTS public.quality_floor_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_class TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'platform',
  min_confidence NUMERIC(5,4) NOT NULL DEFAULT 0.7,
  min_evidence_completeness NUMERIC(5,4) NOT NULL DEFAULT 0.6,
  min_verification_standard TEXT NOT NULL DEFAULT 'basic',
  min_freshness NUMERIC(5,4) NOT NULL DEFAULT 0.5,
  enforcement_mode TEXT NOT NULL DEFAULT 'warn',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, task_class, domain)
);
ALTER TABLE public.quality_floor_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own quality floor configs" ON public.quality_floor_configs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_quality_floor_updated_at BEFORE UPDATE ON public.quality_floor_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Compute Budget Snapshots (dedicated)
CREATE TABLE IF NOT EXISTS public.compute_budget_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  period TEXT NOT NULL DEFAULT 'monthly',
  domain TEXT NOT NULL DEFAULT 'platform',
  allocated_cents INTEGER NOT NULL DEFAULT 0,
  used_cents INTEGER NOT NULL DEFAULT 0,
  cache_hit_rate NUMERIC(5,4) NOT NULL DEFAULT 0,
  margin_posture TEXT NOT NULL DEFAULT 'healthy',
  deep_reasoning_pct NUMERIC(5,4) NOT NULL DEFAULT 0,
  model_mix JSONB NOT NULL DEFAULT '{}'::jsonb,
  anomaly_flags TEXT[] DEFAULT '{}',
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.compute_budget_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own compute snapshots" ON public.compute_budget_snapshots FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_compute_snapshots_period ON public.compute_budget_snapshots(user_id, period, snapshot_at DESC);

-- 6. Operator Taste Profiles (dedicated)
CREATE TABLE IF NOT EXISTS public.operator_taste_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  preference_key TEXT NOT NULL,
  preference_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  learned_from TEXT NOT NULL DEFAULT 'observation',
  confidence NUMERIC(5,4) NOT NULL DEFAULT 0.5,
  times_applied INTEGER NOT NULL DEFAULT 0,
  last_applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, preference_key)
);
ALTER TABLE public.operator_taste_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own taste profiles" ON public.operator_taste_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_taste_profiles_updated_at BEFORE UPDATE ON public.operator_taste_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260405203702_7ea5321d-adf3-4c4e-aef3-bce0ca1c513b.sql ──
-- Reality Classification Matrix
CREATE TABLE public.reality_classifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  route_path TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  classification TEXT NOT NULL DEFAULT 'presentational' CHECK (classification IN ('presentational','simulated','persisted','proven')),
  mock_sources TEXT[] DEFAULT '{}',
  backend_target TEXT,
  contract_status TEXT DEFAULT 'none' CHECK (contract_status IN ('none','partial','aligned','verified')),
  verification_evidence JSONB DEFAULT '[]',
  readiness_score INTEGER DEFAULT 0 CHECK (readiness_score >= 0 AND readiness_score <= 100),
  notes TEXT,
  classified_by TEXT DEFAULT 'manual',
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, route_path)
);

ALTER TABLE public.reality_classifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own classifications" ON public.reality_classifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_reality_classifications_updated_at BEFORE UPDATE ON public.reality_classifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Mock Replacement Program
CREATE TABLE public.mock_replacements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_name TEXT NOT NULL,
  page_path TEXT NOT NULL,
  mock_source TEXT NOT NULL,
  mock_type TEXT NOT NULL DEFAULT 'hardcoded' CHECK (mock_type IN ('hardcoded','local_array','localstorage','in_memory_engine','pure_function','demo_flow')),
  real_backend_target TEXT,
  expected_contract TEXT,
  migration_status TEXT NOT NULL DEFAULT 'identified' CHECK (migration_status IN ('identified','planned','in_progress','blocked','completed','validated')),
  migration_owner TEXT,
  migration_priority TEXT NOT NULL DEFAULT 'medium' CHECK (migration_priority IN ('critical','high','medium','low')),
  blockers TEXT[] DEFAULT '{}',
  validation_evidence JSONB DEFAULT '[]',
  done_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mock_replacements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own mock replacements" ON public.mock_replacements FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_mock_replacements_updated_at BEFORE UPDATE ON public.mock_replacements FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_reality_classifications_domain ON public.reality_classifications(domain);
CREATE INDEX idx_reality_classifications_classification ON public.reality_classifications(classification);
CREATE INDEX idx_mock_replacements_status ON public.mock_replacements(migration_status);
CREATE INDEX idx_mock_replacements_priority ON public.mock_replacements(migration_priority);

-- ── 20260405205826_33e442cd-8432-439b-b206-4f9e540db91e.sql ──
-- Extend reality_classifications with full scope/evidence/progression support
ALTER TABLE public.reality_classifications
  ADD COLUMN IF NOT EXISTS scope_level text NOT NULL DEFAULT 'feature',
  ADD COLUMN IF NOT EXISTS confidence integer NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS evidence_inputs jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS missing_requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS blockers text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS owner text,
  ADD COLUMN IF NOT EXISTS launch_impact text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS progression_criteria jsonb NOT NULL DEFAULT '{}'::jsonb;

-- Add constraint for scope_level
ALTER TABLE public.reality_classifications
  ADD CONSTRAINT reality_classifications_scope_level_check
  CHECK (scope_level IN ('route', 'page', 'feature', 'component_group', 'service', 'domain', 'workspace', 'office'));

-- Add constraint for launch_impact
ALTER TABLE public.reality_classifications
  ADD CONSTRAINT reality_classifications_launch_impact_check
  CHECK (launch_impact IN ('blocking', 'degraded', 'none'));

-- Extend mock_replacements with sequencing and runtime validation
ALTER TABLE public.mock_replacements
  ADD COLUMN IF NOT EXISTS sequence_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS runtime_validated boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS runtime_evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS dependencies text[] NOT NULL DEFAULT '{}';

-- Index for sequencing
CREATE INDEX IF NOT EXISTS idx_mock_replacements_sequence ON public.mock_replacements (sequence_order);
CREATE INDEX IF NOT EXISTS idx_reality_classifications_scope ON public.reality_classifications (scope_level);
CREATE INDEX IF NOT EXISTS idx_reality_classifications_launch ON public.reality_classifications (launch_impact);

-- ── 20260405215655_0057cd0d-aad0-450e-bbe9-44e08f5ee92a.sql ──
-- ═══════════════════════════════════════════════════════════════
-- SITA Delivery Operating System — Core Schema
-- ═══════════════════════════════════════════════════════════════

-- Feature Archetypes
CREATE TABLE public.feature_archetypes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  archetype_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  default_persistence_class TEXT NOT NULL DEFAULT 'operational',
  default_trust_level TEXT NOT NULL DEFAULT 'standard',
  default_interaction_criticality TEXT NOT NULL DEFAULT 'medium',
  expected_components JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_contracts JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_probes JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_shells JSONB NOT NULL DEFAULT '[]'::jsonb,
  loading_states JSONB NOT NULL DEFAULT '{"loading":true,"error":true,"empty":true,"degraded":false}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_archetypes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Archetypes are readable by authenticated users" ON public.feature_archetypes FOR SELECT TO authenticated USING (true);

-- Feature Blueprints
CREATE TABLE public.feature_blueprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_id TEXT NOT NULL,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  archetype_key TEXT REFERENCES public.feature_archetypes(archetype_key),
  description TEXT,
  user_intent TEXT,
  persistence_class TEXT NOT NULL DEFAULT 'operational',
  contract_class TEXT NOT NULL DEFAULT 'standard',
  interaction_criticality TEXT NOT NULL DEFAULT 'medium',
  journey_criticality TEXT NOT NULL DEFAULT 'medium',
  trust_needs TEXT NOT NULL DEFAULT 'standard',
  ai_compute_class TEXT NOT NULL DEFAULT 'none',
  launch_criticality TEXT NOT NULL DEFAULT 'standard',
  reality_target TEXT NOT NULL DEFAULT 'persisted',
  route_plan JSONB NOT NULL DEFAULT '{}'::jsonb,
  schema_needs JSONB NOT NULL DEFAULT '[]'::jsonb,
  service_location TEXT,
  ownership TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_blueprints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own blueprints" ON public.feature_blueprints FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_blueprints_domain ON public.feature_blueprints(domain);
CREATE INDEX idx_blueprints_status ON public.feature_blueprints(status);

-- Feature Lifecycle Stages
CREATE TABLE public.feature_lifecycle_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  blueprint_id UUID REFERENCES public.feature_blueprints(id) ON DELETE CASCADE,
  feature_id TEXT NOT NULL,
  stage TEXT NOT NULL DEFAULT 'proposed',
  stage_order INT NOT NULL DEFAULT 0,
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  exited_at TIMESTAMPTZ,
  actor TEXT,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  blockers JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_lifecycle_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own lifecycle" ON public.feature_lifecycle_stages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_lifecycle_feature ON public.feature_lifecycle_stages(feature_id);
CREATE INDEX idx_lifecycle_stage ON public.feature_lifecycle_stages(stage);

-- Domain Methodology Packs
CREATE TABLE public.domain_methodology_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  expected_routes JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_shells JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_boards JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_contracts JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_interactions JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_proofs JSONB NOT NULL DEFAULT '[]'::jsonb,
  verification_flows JSONB NOT NULL DEFAULT '[]'::jsonb,
  readiness_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  maturity_target TEXT NOT NULL DEFAULT 'persisted',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, domain_key)
);
ALTER TABLE public.domain_methodology_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own packs" ON public.domain_methodology_packs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Delivery Templates
CREATE TABLE public.delivery_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  archetype_key TEXT NOT NULL REFERENCES public.feature_archetypes(archetype_key),
  template_name TEXT NOT NULL,
  expected_files JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_components JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_contracts JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_persistence JSONB NOT NULL DEFAULT '{}'::jsonb,
  expected_interactions JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_journey_tests JSONB NOT NULL DEFAULT '[]'::jsonb,
  expected_truth_registration JSONB NOT NULL DEFAULT '{}'::jsonb,
  expected_shell TEXT,
  loading_error_degraded JSONB NOT NULL DEFAULT '{"loading":true,"error":true,"degraded":false}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.delivery_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Templates readable by authenticated" ON public.delivery_templates FOR SELECT TO authenticated USING (true);

-- Dependency Maps
CREATE TABLE public.dependency_maps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  blueprint_id UUID REFERENCES public.feature_blueprints(id) ON DELETE CASCADE,
  feature_id TEXT NOT NULL,
  required_contracts JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_services JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_policies JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_proofs JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_projections JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_journey_tests JSONB NOT NULL DEFAULT '[]'::jsonb,
  required_probes JSONB NOT NULL DEFAULT '[]'::jsonb,
  launch_gates JSONB NOT NULL DEFAULT '[]'::jsonb,
  resolved_count INT NOT NULL DEFAULT 0,
  total_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dependency_maps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own deps" ON public.dependency_maps FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Change Impact Records
CREATE TABLE public.change_impact_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  change_title TEXT NOT NULL,
  change_type TEXT NOT NULL DEFAULT 'feature',
  source_blueprint_id UUID REFERENCES public.feature_blueprints(id),
  affected_routes JSONB NOT NULL DEFAULT '[]'::jsonb,
  affected_contracts JSONB NOT NULL DEFAULT '[]'::jsonb,
  affected_probes JSONB NOT NULL DEFAULT '[]'::jsonb,
  affected_journeys JSONB NOT NULL DEFAULT '[]'::jsonb,
  affected_launch_gates JSONB NOT NULL DEFAULT '[]'::jsonb,
  affected_domains JSONB NOT NULL DEFAULT '[]'::jsonb,
  migration_risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  rollout_risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  bundle_perf_risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  trust_risks JSONB NOT NULL DEFAULT '[]'::jsonb,
  severity TEXT NOT NULL DEFAULT 'low',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.change_impact_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own impacts" ON public.change_impact_records FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Delivery Waves
CREATE TABLE public.delivery_waves (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wave_name TEXT NOT NULL,
  wave_number INT NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'planning',
  domain_focus JSONB NOT NULL DEFAULT '[]'::jsonb,
  feature_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  dependency_groups JSONB NOT NULL DEFAULT '[]'::jsonb,
  launch_impact TEXT NOT NULL DEFAULT 'standard',
  migration_opportunities JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_start TIMESTAMPTZ,
  target_end TIMESTAMPTZ,
  completion_pct NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.delivery_waves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own waves" ON public.delivery_waves FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Platform Maturity Scores
CREATE TABLE public.platform_maturity_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scope_type TEXT NOT NULL DEFAULT 'domain',
  scope_id TEXT NOT NULL,
  scope_label TEXT NOT NULL,
  truth_level NUMERIC NOT NULL DEFAULT 0,
  automation_level NUMERIC NOT NULL DEFAULT 0,
  persistence_level NUMERIC NOT NULL DEFAULT 0,
  proof_level NUMERIC NOT NULL DEFAULT 0,
  launch_readiness NUMERIC NOT NULL DEFAULT 0,
  interaction_coverage NUMERIC NOT NULL DEFAULT 0,
  contract_coverage NUMERIC NOT NULL DEFAULT 0,
  composite_score NUMERIC NOT NULL DEFAULT 0,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_maturity_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own maturity" ON public.platform_maturity_scores FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_maturity_scope ON public.platform_maturity_scores(scope_type, scope_id);

-- Remediation Suggestions
CREATE TABLE public.remediation_suggestions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  gap_type TEXT NOT NULL,
  gap_description TEXT NOT NULL,
  suggested_action TEXT NOT NULL,
  suggested_artifacts JSONB NOT NULL DEFAULT '[]'::jsonb,
  priority TEXT NOT NULL DEFAULT 'medium',
  auto_fixable BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'open',
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.remediation_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own remediations" ON public.remediation_suggestions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_remediation_status ON public.remediation_suggestions(status);

-- Seed canonical feature archetypes
INSERT INTO public.feature_archetypes (archetype_key, display_name, description, default_persistence_class, default_trust_level, default_interaction_criticality) VALUES
  ('boardroom', 'Boardroom', 'Executive intelligence surface with synthesis, advisor views, and strategic overlays', 'durable', 'high', 'high'),
  ('office', 'Office / Workspace', 'Full-featured workspace with multiple panels, actions, and deep domain logic', 'durable', 'high', 'high'),
  ('simulator', 'Simulator', 'Scenario simulation with projections, what-if analysis, and outcome modeling', 'operational', 'standard', 'medium'),
  ('workflow', 'Workflow', 'Multi-step process with approvals, state transitions, and audit trail', 'durable', 'high', 'critical'),
  ('onboarding', 'Setup / Onboarding Flow', 'Multi-stage guided setup with branching, validation, and completion tracking', 'durable', 'standard', 'high'),
  ('crud', 'CRUD Surface', 'Standard create/read/update/delete interface for a domain entity', 'operational', 'standard', 'medium'),
  ('action-center', 'Action Center', 'Aggregated actionable items requiring user decision or response', 'operational', 'standard', 'high'),
  ('dashboard', 'Dashboard', 'Read-heavy overview with KPIs, charts, and status summaries', 'operational', 'standard', 'low'),
  ('detail-view', 'Detail View', 'Single-entity deep inspection with related data, history, and actions', 'operational', 'standard', 'medium'),
  ('connector-flow', 'Connector Flow', 'Integration setup with auth, mapping, sync, and health monitoring', 'durable', 'high', 'high'),
  ('intelligence', 'Intelligence Surface', 'AI-powered analysis with confidence, evidence, and recommendations', 'durable', 'high', 'medium'),
  ('proof-evidence', 'Proof / Evidence Surface', 'Trust and audit display with receipts, lineage, and verification', 'durable', 'critical', 'high'),
  ('admin-control', 'Admin Control Surface', 'System administration with configuration, monitoring, and governance', 'durable', 'critical', 'high'),
  ('timeline', 'Timeline / History', 'Chronological event display with filtering, correlation, and drill-down', 'operational', 'standard', 'low'),
  ('settings', 'Settings / Configuration', 'User or system preference management with validation and preview', 'durable', 'standard', 'medium');

-- Triggers for updated_at
CREATE TRIGGER update_feature_archetypes_updated_at BEFORE UPDATE ON public.feature_archetypes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_feature_blueprints_updated_at BEFORE UPDATE ON public.feature_blueprints FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_domain_methodology_packs_updated_at BEFORE UPDATE ON public.domain_methodology_packs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_delivery_templates_updated_at BEFORE UPDATE ON public.delivery_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dependency_maps_updated_at BEFORE UPDATE ON public.dependency_maps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_change_impact_records_updated_at BEFORE UPDATE ON public.change_impact_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_delivery_waves_updated_at BEFORE UPDATE ON public.delivery_waves FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_remediation_suggestions_updated_at BEFORE UPDATE ON public.remediation_suggestions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260405220748_165a004a-1631-4dcb-a9e5-98c86de3195e.sql ──
-- File settings for persisting Files Center configuration
CREATE TABLE public.file_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  auto_classify BOOLEAN NOT NULL DEFAULT true,
  auto_extract BOOLEAN NOT NULL DEFAULT true,
  generate_suggestions BOOLEAN NOT NULL DEFAULT true,
  auto_link BOOLEAN NOT NULL DEFAULT false,
  boardroom_attach BOOLEAN NOT NULL DEFAULT true,
  default_sensitivity TEXT NOT NULL DEFAULT 'internal',
  default_retention TEXT NOT NULL DEFAULT '7 years',
  memory_write_permission TEXT NOT NULL DEFAULT 'allowed_with_review',
  governed_threshold TEXT[] NOT NULL DEFAULT ARRAY['medical', 'legal', 'identity'],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.file_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own file settings" ON public.file_settings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_file_settings_updated_at BEFORE UPDATE ON public.file_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260405222450_27624498-fb0e-4b3f-bd2b-7dd224a71f20.sql ──
-- Feature Integration Protocol Enforcement System Tables

-- 1. Feature Intake Records
CREATE TABLE public.feature_intake_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_id TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  feature_type TEXT NOT NULL DEFAULT 'greenfield',
  wedge_priority TEXT DEFAULT 'medium',
  outcome_statement TEXT,
  non_goals TEXT[] DEFAULT '{}',
  primary_owner TEXT,
  owner_rationale TEXT,
  why_not_elsewhere TEXT,
  capability_classes TEXT[] DEFAULT '{}',
  risk_tier TEXT DEFAULT 'standard',
  autonomy_tier TEXT DEFAULT 'observe',
  trust_bearing BOOLEAN DEFAULT false,
  support_owner TEXT,
  product_owner TEXT,
  engineering_owner TEXT,
  launch_intent TEXT DEFAULT 'internal',
  surface_map JSONB DEFAULT '[]',
  affected_domains TEXT[] DEFAULT '{}',
  intake_status TEXT DEFAULT 'draft',
  completeness_score NUMERIC DEFAULT 0,
  intake_questions JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_intake_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own feature intakes" ON public.feature_intake_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_feature_intake_records_updated_at BEFORE UPDATE ON public.feature_intake_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Capability Registry
CREATE TABLE public.capability_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  capability_id TEXT NOT NULL,
  capability_class TEXT NOT NULL DEFAULT 'observe',
  name TEXT NOT NULL,
  description TEXT,
  owner_service TEXT NOT NULL,
  feature_id TEXT,
  risk_tier TEXT DEFAULT 'standard',
  autonomy_tier TEXT DEFAULT 'observe',
  required_scopes TEXT[] DEFAULT '{}',
  required_policy_family TEXT,
  approval_type TEXT DEFAULT 'none',
  receipt_requirement TEXT DEFAULT 'none',
  event_subjects TEXT[] DEFAULT '{}',
  replayability_class TEXT DEFAULT 'safe',
  entitlement_dependency TEXT,
  sandbox_support BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft',
  version TEXT DEFAULT '1.0.0',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, capability_id)
);
ALTER TABLE public.capability_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own capabilities" ON public.capability_registry FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_capability_registry_updated_at BEFORE UPDATE ON public.capability_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Feature Spec Records
CREATE TABLE public.feature_spec_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_id TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  spec_version TEXT DEFAULT '1.0.0',
  outcome_statement TEXT,
  capability_map JSONB DEFAULT '[]',
  owner_map JSONB DEFAULT '{}',
  surface_map JSONB DEFAULT '[]',
  contract_schema_map JSONB DEFAULT '{}',
  workflow_model JSONB DEFAULT '{}',
  policy_trust_model JSONB DEFAULT '{}',
  execution_model JSONB DEFAULT '{}',
  memory_graph_effects JSONB DEFAULT '{}',
  observability_support JSONB DEFAULT '{}',
  testing_model JSONB DEFAULT '{}',
  rollout_recovery JSONB DEFAULT '{}',
  generated_truth_updates JSONB DEFAULT '[]',
  completeness_score NUMERIC DEFAULT 0,
  missing_sections TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_spec_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own feature specs" ON public.feature_spec_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_feature_spec_records_updated_at BEFORE UPDATE ON public.feature_spec_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Feature Owner Decisions
CREATE TABLE public.feature_owner_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_id TEXT NOT NULL,
  primary_owner TEXT NOT NULL,
  owner_rationale TEXT,
  alternate_candidates JSONB DEFAULT '[]',
  smallest_correct_owner TEXT,
  boundary_violations JSONB DEFAULT '[]',
  second_brain_risk BOOLEAN DEFAULT false,
  module_drift_risk BOOLEAN DEFAULT false,
  unsupported_root_risk BOOLEAN DEFAULT false,
  recommendation TEXT DEFAULT 'extend_existing',
  decision_status TEXT DEFAULT 'proposed',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_owner_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own owner decisions" ON public.feature_owner_decisions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_feature_owner_decisions_updated_at BEFORE UPDATE ON public.feature_owner_decisions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Feature Compliance Records
CREATE TABLE public.feature_compliance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_id TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  owner_declared BOOLEAN DEFAULT false,
  capabilities_registered BOOLEAN DEFAULT false,
  contracts_defined BOOLEAN DEFAULT false,
  workflow_defined BOOLEAN DEFAULT false,
  policy_defined BOOLEAN DEFAULT false,
  execution_path_defined BOOLEAN DEFAULT false,
  receipts_defined BOOLEAN DEFAULT false,
  memory_effects_declared BOOLEAN DEFAULT false,
  boardroom_integration BOOLEAN DEFAULT false,
  observability_defined BOOLEAN DEFAULT false,
  testing_defined BOOLEAN DEFAULT false,
  rollout_defined BOOLEAN DEFAULT false,
  generated_truth_updated BOOLEAN DEFAULT false,
  deprecation_planned BOOLEAN DEFAULT false,
  violation_count INTEGER DEFAULT 0,
  violation_severity TEXT DEFAULT 'none',
  violations JSONB DEFAULT '[]',
  readiness_stage TEXT DEFAULT 'spec-ready',
  completeness_score NUMERIC DEFAULT 0,
  last_evaluated_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_compliance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own compliance records" ON public.feature_compliance_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_feature_compliance_records_updated_at BEFORE UPDATE ON public.feature_compliance_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Feature Execution Paths
CREATE TABLE public.feature_execution_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_id TEXT NOT NULL,
  ingress_point TEXT,
  brain_core_involvement BOOLEAN DEFAULT false,
  policy_decision_point TEXT,
  capability_routing_point TEXT,
  executor_entry TEXT,
  connector_runner_path TEXT,
  receipt_emission_point TEXT,
  event_emission_point TEXT,
  verification_point TEXT,
  idempotency_key_source TEXT,
  duplicate_suppression TEXT,
  replay_safe BOOLEAN DEFAULT false,
  conflict_behavior TEXT,
  partial_success_handling TEXT,
  rollback_behavior TEXT,
  execution_graph JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_execution_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own execution paths" ON public.feature_execution_paths FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_feature_execution_paths_updated_at BEFORE UPDATE ON public.feature_execution_paths FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Feature Rollout Records
CREATE TABLE public.feature_rollout_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_id TEXT NOT NULL,
  feature_flags JSONB DEFAULT '[]',
  rollout_mode TEXT DEFAULT 'dev-only',
  kill_switch_class TEXT DEFAULT 'ui-hide',
  rollback_steps TEXT[] DEFAULT '{}',
  config_owner TEXT,
  monitoring_owner TEXT,
  migration_requirements TEXT[] DEFAULT '{}',
  shadow_sim_progression JSONB DEFAULT '[]',
  promotion_gates JSONB DEFAULT '[]',
  current_ring TEXT DEFAULT 'dev',
  launch_criteria JSONB DEFAULT '[]',
  status TEXT DEFAULT 'planned',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_rollout_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own rollout records" ON public.feature_rollout_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_feature_rollout_records_updated_at BEFORE UPDATE ON public.feature_rollout_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Feature Deprecation Records
CREATE TABLE public.feature_deprecation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_id TEXT NOT NULL,
  feature_name TEXT NOT NULL,
  replacement_owner TEXT,
  migration_path TEXT,
  compatibility_window TEXT,
  contract_deprecation_plan JSONB DEFAULT '{}',
  ui_removal_plan TEXT,
  support_implications TEXT,
  generated_truth_cleanup TEXT[] DEFAULT '{}',
  retirement_status TEXT DEFAULT 'active',
  deprecated_at TIMESTAMPTZ,
  retired_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_deprecation_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own deprecation records" ON public.feature_deprecation_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_feature_deprecation_records_updated_at BEFORE UPDATE ON public.feature_deprecation_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Feature Readiness Gates
CREATE TABLE public.feature_readiness_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_id TEXT NOT NULL,
  current_stage TEXT DEFAULT 'spec-ready',
  stage_evidence JSONB DEFAULT '{}',
  missing_evidence TEXT[] DEFAULT '{}',
  blockers JSONB DEFAULT '[]',
  red_team_answers JSONB DEFAULT '{}',
  support_signoff BOOLEAN DEFAULT false,
  launch_honesty_risk TEXT DEFAULT 'unknown',
  gate_history JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_readiness_gates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own readiness gates" ON public.feature_readiness_gates FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_feature_readiness_gates_updated_at BEFORE UPDATE ON public.feature_readiness_gates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. Feature Generated Truth Impacts
CREATE TABLE public.feature_generated_truth_impacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_id TEXT NOT NULL,
  artifact_path TEXT NOT NULL,
  artifact_type TEXT NOT NULL,
  impact_description TEXT,
  current_state TEXT DEFAULT 'missing',
  expected_entries JSONB DEFAULT '[]',
  impact_severity TEXT DEFAULT 'medium',
  updated_by TEXT,
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feature_generated_truth_impacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own truth impacts" ON public.feature_generated_truth_impacts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_feature_generated_truth_impacts_updated_at BEFORE UPDATE ON public.feature_generated_truth_impacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add audit triggers on sensitive tables
CREATE TRIGGER audit_capability_registry_changes AFTER INSERT OR UPDATE OR DELETE ON public.capability_registry FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_change();
CREATE TRIGGER audit_feature_compliance_changes AFTER INSERT OR UPDATE OR DELETE ON public.feature_compliance_records FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_change();
CREATE TRIGGER audit_feature_readiness_gates_changes AFTER INSERT OR UPDATE OR DELETE ON public.feature_readiness_gates FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_change();

-- ── 20260405223323_12e1833d-6aa9-4fa0-9a0f-e510092b5a4c.sql ──
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Sovereign AI Gateway Database Schema
-- ═══════════════════════════════════════════════════════════════

-- 1. AI Model Registry
CREATE TABLE public.ai_model_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_model_name TEXT NOT NULL,
  model_class TEXT NOT NULL DEFAULT 'standard',
  reasoning_strength TEXT DEFAULT 'standard',
  structured_output_support BOOLEAN DEFAULT false,
  tool_calling_support BOOLEAN DEFAULT false,
  context_length INTEGER DEFAULT 8192,
  latency_tier TEXT DEFAULT 'standard',
  cost_tier TEXT DEFAULT 'standard',
  cost_per_1k_input NUMERIC DEFAULT 0,
  cost_per_1k_output NUMERIC DEFAULT 0,
  reliability_score NUMERIC DEFAULT 0.95,
  safety_notes TEXT,
  allowed_domains TEXT[] DEFAULT '{}',
  disallowed_domains TEXT[] DEFAULT '{}',
  launch_stage TEXT DEFAULT 'active',
  fallback_suitability TEXT DEFAULT 'standard',
  preferred_task_classes TEXT[] DEFAULT '{}',
  deprecated BOOLEAN DEFAULT false,
  deprecated_at TIMESTAMPTZ,
  health_score NUMERIC DEFAULT 1.0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, model_id)
);

ALTER TABLE public.ai_model_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own models" ON public.ai_model_registry FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_model_registry_ts BEFORE UPDATE ON public.ai_model_registry FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. AI Prompt Families
CREATE TABLE public.ai_prompt_families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt_family_id TEXT NOT NULL,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  domain TEXT,
  feature_ids TEXT[] DEFAULT '{}',
  allowed_capability_classes TEXT[] DEFAULT '{}',
  context_sources JSONB DEFAULT '[]',
  redaction_strategy TEXT DEFAULT 'none',
  max_context_tokens INTEGER DEFAULT 4096,
  grounding_requirements JSONB DEFAULT '{}',
  output_schema JSONB,
  hallucination_containment TEXT DEFAULT 'standard',
  system_prompt TEXT,
  version INTEGER DEFAULT 1,
  deprecated BOOLEAN DEFAULT false,
  cost_profile TEXT DEFAULT 'standard',
  quality_notes TEXT,
  test_fixtures JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, prompt_family_id, version)
);

ALTER TABLE public.ai_prompt_families ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own prompts" ON public.ai_prompt_families FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_prompt_families_ts BEFORE UPDATE ON public.ai_prompt_families FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. AI Routing Policies
CREATE TABLE public.ai_routing_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  capability_id TEXT NOT NULL,
  task_class TEXT NOT NULL DEFAULT 'general',
  domain TEXT,
  risk_tier TEXT DEFAULT 'standard',
  default_provider TEXT,
  default_model TEXT,
  fallback_provider TEXT,
  fallback_model TEXT,
  fallback_chain JSONB DEFAULT '[]',
  budget_class TEXT DEFAULT 'standard',
  max_cost_cents INTEGER DEFAULT 100,
  verification_policy TEXT DEFAULT 'none',
  premium_escalation_conditions JSONB DEFAULT '{}',
  async_eligible BOOLEAN DEFAULT false,
  latency_target_ms INTEGER,
  confidence_target NUMERIC DEFAULT 0.8,
  structured_output_required BOOLEAN DEFAULT false,
  reuse_eligible BOOLEAN DEFAULT true,
  allowed_providers TEXT[] DEFAULT '{}',
  disallowed_providers TEXT[] DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_routing_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own routing" ON public.ai_routing_policies FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_routing_policies_ts BEFORE UPDATE ON public.ai_routing_policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. AI Task Requests (inference log)
CREATE TABLE public.ai_task_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  capability_id TEXT,
  feature_id TEXT,
  prompt_family_id TEXT,
  task_class TEXT NOT NULL DEFAULT 'general',
  domain TEXT,
  risk_tier TEXT DEFAULT 'standard',
  autonomy_tier TEXT DEFAULT 'observe',
  input_hash TEXT,
  input_summary TEXT,
  route_decision JSONB DEFAULT '{}',
  provider_chosen TEXT,
  model_chosen TEXT,
  status TEXT DEFAULT 'pending',
  cost_estimate_cents NUMERIC DEFAULT 0,
  cost_actual_cents NUMERIC DEFAULT 0,
  latency_ms INTEGER,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  cache_hit BOOLEAN DEFAULT false,
  reuse_hit BOOLEAN DEFAULT false,
  fallback_used BOOLEAN DEFAULT false,
  fallback_provider TEXT,
  verification_result TEXT,
  verification_confidence NUMERIC,
  structured_output_valid BOOLEAN,
  error TEXT,
  output_summary TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.ai_task_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own requests" ON public.ai_task_requests FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ai_task_requests_capability ON public.ai_task_requests(capability_id);
CREATE INDEX idx_ai_task_requests_provider ON public.ai_task_requests(provider_chosen);
CREATE INDEX idx_ai_task_requests_created ON public.ai_task_requests(created_at DESC);

-- 5. AI Inference Receipts
CREATE TABLE public.ai_inference_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_request_id UUID REFERENCES public.ai_task_requests(id),
  capability_id TEXT,
  prompt_family_id TEXT,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  route_reason TEXT,
  context_sources_used JSONB DEFAULT '[]',
  output_schema_used TEXT,
  cost_estimate_cents NUMERIC DEFAULT 0,
  cost_actual_cents NUMERIC DEFAULT 0,
  latency_ms INTEGER,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  cached_tokens INTEGER DEFAULT 0,
  fallback_chain JSONB DEFAULT '[]',
  cache_hits INTEGER DEFAULT 0,
  reuse_artifacts TEXT[] DEFAULT '{}',
  verification_outcome TEXT DEFAULT 'none',
  verification_confidence NUMERIC,
  redaction_applied BOOLEAN DEFAULT false,
  policy_decision_ref TEXT,
  action_refs JSONB DEFAULT '[]',
  hash TEXT,
  previous_hash TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_inference_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own receipts" ON public.ai_inference_receipts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ai_receipts_task ON public.ai_inference_receipts(task_request_id);
CREATE INDEX idx_ai_receipts_created ON public.ai_inference_receipts(created_at DESC);

-- 6. AI Provider Health
CREATE TABLE public.ai_provider_health (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  model TEXT,
  avg_latency_ms NUMERIC DEFAULT 0,
  p95_latency_ms NUMERIC DEFAULT 0,
  error_rate NUMERIC DEFAULT 0,
  rate_limit_pressure NUMERIC DEFAULT 0,
  availability NUMERIC DEFAULT 1.0,
  structured_output_success_rate NUMERIC DEFAULT 1.0,
  cost_drift_pct NUMERIC DEFAULT 0,
  incident_status TEXT DEFAULT 'none',
  incident_description TEXT,
  total_requests INTEGER DEFAULT 0,
  total_failures INTEGER DEFAULT 0,
  last_checked_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_provider_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own health" ON public.ai_provider_health FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_provider_health_ts BEFORE UPDATE ON public.ai_provider_health FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. AI Portfolio Allocations
CREATE TABLE public.ai_portfolio_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  allocation_class TEXT NOT NULL,
  domain TEXT,
  budget_cents INTEGER NOT NULL DEFAULT 1000,
  spent_cents NUMERIC DEFAULT 0,
  period TEXT DEFAULT 'monthly',
  priority INTEGER DEFAULT 5,
  max_premium_pct NUMERIC DEFAULT 20,
  current_premium_pct NUMERIC DEFAULT 0,
  request_count INTEGER DEFAULT 0,
  avg_cost_per_request NUMERIC DEFAULT 0,
  efficiency_score NUMERIC DEFAULT 0,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_portfolio_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own allocations" ON public.ai_portfolio_allocations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_portfolio_ts BEFORE UPDATE ON public.ai_portfolio_allocations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. AI Compliance Violations
CREATE TABLE public.ai_compliance_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  violation_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  feature_id TEXT,
  capability_id TEXT,
  description TEXT NOT NULL,
  source_file TEXT,
  evidence JSONB DEFAULT '{}',
  remediation TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  blocks_launch BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_compliance_violations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own violations" ON public.ai_compliance_violations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ai_violations_ts BEFORE UPDATE ON public.ai_compliance_violations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── 20260405230840_17098d2b-9dfc-4d5c-af74-209ce6d27ed0.sql ──
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

-- ── 20260405233420_07486295-6ad9-4d84-a932-8b09168b3263.sql ──
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Cron / Scheduler / Automation Reality Tables
-- ═══════════════════════════════════════════════════════════════

-- 1. Scheduled Jobs Registry
CREATE TABLE public.scheduled_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'system',
  job_class TEXT NOT NULL DEFAULT 'maintenance',
  cron_expression TEXT NOT NULL DEFAULT '0 * * * *',
  target_function TEXT NOT NULL,
  description TEXT,
  risk_tier TEXT NOT NULL DEFAULT 'low',
  autonomy_tier TEXT NOT NULL DEFAULT 'supervised',
  state TEXT NOT NULL DEFAULT 'configured',
  policy_family TEXT,
  kill_switch_class TEXT DEFAULT 'global',
  retry_policy TEXT NOT NULL DEFAULT 'exponential',
  max_retries INTEGER NOT NULL DEFAULT 3,
  environment TEXT NOT NULL DEFAULT 'production',
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,
  last_run_status TEXT,
  run_count INTEGER NOT NULL DEFAULT 0,
  fail_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.scheduled_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own scheduled jobs"
  ON public.scheduled_jobs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_scheduled_jobs_state ON public.scheduled_jobs(state);
CREATE INDEX idx_scheduled_jobs_next_run ON public.scheduled_jobs(next_run_at);
CREATE INDEX idx_scheduled_jobs_domain ON public.scheduled_jobs(domain);

-- 2. Job Executions History
CREATE TABLE public.job_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.scheduled_jobs(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  attempt_number INTEGER NOT NULL DEFAULT 1,
  output JSONB,
  error_message TEXT,
  error_class TEXT,
  duration_ms INTEGER,
  policy_decision TEXT DEFAULT 'allowed',
  verification_result TEXT,
  triggered_by TEXT NOT NULL DEFAULT 'scheduler',
  mode TEXT NOT NULL DEFAULT 'real',
  retryable BOOLEAN DEFAULT false,
  escalated BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.job_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own job executions"
  ON public.job_executions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users create their own job executions"
  ON public.job_executions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_job_executions_job ON public.job_executions(job_id);
CREATE INDEX idx_job_executions_status ON public.job_executions(status);
CREATE INDEX idx_job_executions_started ON public.job_executions(started_at DESC);

-- 3. Automation Kill Switches
CREATE TABLE public.automation_kill_switches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scope TEXT NOT NULL DEFAULT 'global',
  scope_id TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  activated_by TEXT DEFAULT 'operator',
  activated_at TIMESTAMPTZ DEFAULT now(),
  deactivated_at TIMESTAMPTZ,
  deactivated_by TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.automation_kill_switches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own kill switches"
  ON public.automation_kill_switches FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_kill_switches_scope ON public.automation_kill_switches(scope, scope_id);

-- Timestamp triggers
CREATE TRIGGER update_scheduled_jobs_updated_at
  BEFORE UPDATE ON public.scheduled_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_kill_switches_updated_at
  BEFORE UPDATE ON public.automation_kill_switches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260405233920_28788352-495e-46a0-a7cb-a3e4c693d608.sql ──
-- Enable required extensions for scheduled automation
CREATE EXTENSION IF NOT EXISTS pg_cron SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;

-- ── 20260405234059_16457199-199b-49ad-a2ef-8c911ed22091.sql ──
SELECT cron.schedule(
  'sita-scheduler-dispatch',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://icrkipwlnuopqbsabngy.supabase.co/functions/v1/scheduler-dispatch',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljcmtpcHdsbnVvcHFic2Fibmd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMzQ2MDcsImV4cCI6MjA5MDkxMDYwN30.nxIqgU_J2HSdH_MjM3Ir62KxTKjk36irOIh-9Giw04s"}'::jsonb,
    body := concat('{"time": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);

-- ── 20260405234546_a219e4df-baa5-4c3a-be2b-a267f04e451f.sql ──
-- CI Runs
CREATE TABLE public.ci_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  branch TEXT,
  commit_sha TEXT,
  trigger_type TEXT DEFAULT 'push',
  status TEXT DEFAULT 'pending',
  environment TEXT DEFAULT 'ci',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  summary JSONB DEFAULT '{}',
  artifact_urls JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ci_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ci_runs_select" ON public.ci_runs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ci_runs_insert" ON public.ci_runs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- CI Jobs
CREATE TABLE public.ci_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ci_run_id UUID REFERENCES public.ci_runs(id) ON DELETE CASCADE,
  job_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  duration_ms INTEGER,
  exit_code INTEGER,
  log_excerpt TEXT,
  artifact_urls JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ci_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ci_jobs_select" ON public.ci_jobs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ci_jobs_insert" ON public.ci_jobs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- E2E Journeys
CREATE TABLE public.e2e_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  journey_id TEXT NOT NULL,
  name TEXT NOT NULL,
  domain TEXT DEFAULT 'core',
  criticality TEXT DEFAULT 'p0',
  mode TEXT DEFAULT 'real',
  route_family TEXT,
  feature_id TEXT,
  description TEXT,
  steps_count INTEGER DEFAULT 0,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.e2e_journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "e2e_journeys_select" ON public.e2e_journeys FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "e2e_journeys_insert" ON public.e2e_journeys FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- E2E Runs
CREATE TABLE public.e2e_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  journey_id UUID REFERENCES public.e2e_journeys(id) ON DELETE SET NULL,
  ci_run_id UUID REFERENCES public.ci_runs(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  environment TEXT DEFAULT 'ci',
  duration_ms INTEGER,
  steps_passed INTEGER DEFAULT 0,
  steps_failed INTEGER DEFAULT 0,
  screenshot_urls JSONB DEFAULT '[]',
  video_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.e2e_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "e2e_runs_select" ON public.e2e_runs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "e2e_runs_insert" ON public.e2e_runs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- E2E Steps
CREATE TABLE public.e2e_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  e2e_run_id UUID REFERENCES public.e2e_runs(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL,
  action TEXT NOT NULL,
  selector TEXT,
  expected_outcome TEXT,
  actual_outcome TEXT,
  status TEXT DEFAULT 'pending',
  duration_ms INTEGER,
  screenshot_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.e2e_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "e2e_steps_select" ON public.e2e_steps FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "e2e_steps_insert" ON public.e2e_steps FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Runtime Probes
CREATE TABLE public.runtime_probes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  probe_id TEXT NOT NULL,
  name TEXT NOT NULL,
  target_system TEXT NOT NULL,
  environment TEXT DEFAULT 'production',
  cadence_seconds INTEGER DEFAULT 300,
  severity TEXT DEFAULT 'high',
  launch_impact TEXT DEFAULT 'blocks',
  owner TEXT,
  success_criteria TEXT,
  failure_criteria TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.runtime_probes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "runtime_probes_select" ON public.runtime_probes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "runtime_probes_insert" ON public.runtime_probes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Runtime Probe Runs
CREATE TABLE public.runtime_probe_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  probe_id UUID REFERENCES public.runtime_probes(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pass',
  latency_ms INTEGER,
  response_snapshot JSONB,
  error_message TEXT,
  trace_id TEXT,
  environment TEXT DEFAULT 'production',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.runtime_probe_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "runtime_probe_runs_select" ON public.runtime_probe_runs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "runtime_probe_runs_insert" ON public.runtime_probe_runs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Launch Gates
CREATE TABLE public.launch_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'default',
  state TEXT DEFAULT 'blocked',
  blockers_count INTEGER DEFAULT 0,
  criteria_met INTEGER DEFAULT 0,
  criteria_total INTEGER DEFAULT 0,
  truth_threshold NUMERIC DEFAULT 0.8,
  current_truth_score NUMERIC DEFAULT 0,
  environment TEXT DEFAULT 'production',
  last_evaluated_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.launch_gates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "launch_gates_select" ON public.launch_gates FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "launch_gates_insert" ON public.launch_gates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Launch Gate Criteria
CREATE TABLE public.launch_gate_criteria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  gate_id UUID REFERENCES public.launch_gates(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  required BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'not_met',
  evidence_refs JSONB DEFAULT '[]',
  last_checked_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.launch_gate_criteria ENABLE ROW LEVEL SECURITY;
CREATE POLICY "launch_gate_criteria_select" ON public.launch_gate_criteria FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "launch_gate_criteria_insert" ON public.launch_gate_criteria FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Launch Blockers
CREATE TABLE public.launch_blockers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  gate_id UUID REFERENCES public.launch_gates(id) ON DELETE CASCADE,
  severity TEXT DEFAULT 'critical',
  source TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.launch_blockers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "launch_blockers_select" ON public.launch_blockers FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "launch_blockers_insert" ON public.launch_blockers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Route Truth Records
CREATE TABLE public.route_truth_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  route TEXT NOT NULL,
  journey_id TEXT,
  interaction_type TEXT DEFAULT 'page_load',
  status TEXT DEFAULT 'pass',
  provider_mode TEXT DEFAULT 'real',
  latency_ms INTEGER,
  diagnostics JSONB DEFAULT '{}',
  failure_notes TEXT,
  environment TEXT DEFAULT 'production',
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.route_truth_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "route_truth_select" ON public.route_truth_records FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "route_truth_insert" ON public.route_truth_records FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Behavioral Regressions
CREATE TABLE public.behavioral_regressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  journey_id TEXT,
  route TEXT,
  domain TEXT,
  severity TEXT DEFAULT 'high',
  regression_type TEXT DEFAULT 'new_failure',
  description TEXT,
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  occurrence_count INTEGER DEFAULT 1,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  linked_commit TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.behavioral_regressions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "regressions_select" ON public.behavioral_regressions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "regressions_insert" ON public.behavioral_regressions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_ci_runs_status ON public.ci_runs(status);
CREATE INDEX idx_ci_jobs_run ON public.ci_jobs(ci_run_id);
CREATE INDEX idx_e2e_runs_journey ON public.e2e_runs(journey_id);
CREATE INDEX idx_e2e_steps_run ON public.e2e_steps(e2e_run_id);
CREATE INDEX idx_probe_runs_probe ON public.runtime_probe_runs(probe_id);
CREATE INDEX idx_launch_blockers_gate ON public.launch_blockers(gate_id);
CREATE INDEX idx_route_truth_route ON public.route_truth_records(route);
CREATE INDEX idx_regressions_resolved ON public.behavioral_regressions(resolved);

-- ── 20260406000527_89051120-8a48-4e51-a1c2-bce7f88bc3ce.sql ──
-- Surface Types
CREATE TABLE IF NOT EXISTS public.surface_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  surface_key text NOT NULL,
  display_name text NOT NULL,
  surface_class text NOT NULL DEFAULT 'planned' CHECK (surface_class IN ('active','planned','experimental','deprecated')),
  interaction_model text DEFAULT 'touch_and_click',
  notification_model text DEFAULT 'push',
  input_modes text[] DEFAULT '{"keyboard","mouse"}',
  output_modes text[] DEFAULT '{"screen"}',
  offline_support boolean NOT NULL DEFAULT false,
  readiness_stage text NOT NULL DEFAULT 'planned' CHECK (readiness_stage IN ('planned','prototyping','alpha','beta','production','deprecated')),
  constraints jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(surface_key, user_id)
);
ALTER TABLE public.surface_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own surface_types" ON public.surface_types FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Surface Adapters
CREATE TABLE IF NOT EXISTS public.surface_adapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  surface_id uuid REFERENCES public.surface_types(id) ON DELETE CASCADE NOT NULL,
  adapter_name text NOT NULL,
  shell_type text NOT NULL DEFAULT 'WebShell' CHECK (shell_type IN ('WebShell','MobileShell','DesktopShell','SpatialShell','VoiceShell','AmbientShell')),
  navigation_grammar jsonb DEFAULT '{}',
  interaction_grammar jsonb DEFAULT '{}',
  notification_grammar jsonb DEFAULT '{}',
  trust_presentation jsonb DEFAULT '{}',
  receipt_presentation jsonb DEFAULT '{}',
  performance_profile jsonb DEFAULT '{}',
  constraints jsonb DEFAULT '{}',
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','in_development','active','deprecated')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.surface_adapters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own surface_adapters" ON public.surface_adapters FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Capability Definitions
CREATE TABLE IF NOT EXISTS public.capability_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  capability_key text NOT NULL,
  display_name text NOT NULL,
  domain text NOT NULL DEFAULT 'general',
  description text,
  action_type text NOT NULL DEFAULT 'query' CHECK (action_type IN ('query','command','workflow','event','subscription')),
  risk_tier text NOT NULL DEFAULT 'low' CHECK (risk_tier IN ('low','medium','high','critical')),
  portability_class text NOT NULL DEFAULT 'portable' CHECK (portability_class IN ('portable','web_preferred','surface_specific','not_portable')),
  requires_auth boolean NOT NULL DEFAULT true,
  requires_approval boolean NOT NULL DEFAULT false,
  ai_eligible boolean NOT NULL DEFAULT false,
  contract_schema jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(capability_key, user_id)
);
ALTER TABLE public.capability_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own capability_definitions" ON public.capability_definitions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_capability_definitions_domain ON public.capability_definitions(domain);

-- Capability Surface Bindings
CREATE TABLE IF NOT EXISTS public.capability_surface_bindings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  capability_id uuid REFERENCES public.capability_definitions(id) ON DELETE CASCADE NOT NULL,
  surface_id uuid REFERENCES public.surface_types(id) ON DELETE CASCADE NOT NULL,
  binding_status text NOT NULL DEFAULT 'planned' CHECK (binding_status IN ('planned','implemented','tested','production','deprecated')),
  adaptation_notes text,
  interaction_pattern text,
  priority integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(capability_id, surface_id)
);
ALTER TABLE public.capability_surface_bindings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own capability_surface_bindings" ON public.capability_surface_bindings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Shell Implementations
CREATE TABLE IF NOT EXISTS public.shell_implementations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  shell_type text NOT NULL,
  surface_id uuid REFERENCES public.surface_types(id) ON DELETE CASCADE NOT NULL,
  version text DEFAULT '0.1.0',
  status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','prototyping','alpha','beta','production','deprecated')),
  technology_stack text[] DEFAULT '{}',
  capability_coverage_pct numeric DEFAULT 0,
  route_count integer DEFAULT 0,
  component_count integer DEFAULT 0,
  boundary_violations integer DEFAULT 0,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.shell_implementations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own shell_implementations" ON public.shell_implementations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Surface Readiness Records
CREATE TABLE IF NOT EXISTS public.surface_readiness_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  surface_id uuid REFERENCES public.surface_types(id) ON DELETE CASCADE NOT NULL,
  portability_score numeric DEFAULT 0,
  contract_coverage_pct numeric DEFAULT 0,
  capability_coverage_pct numeric DEFAULT 0,
  trust_portability boolean NOT NULL DEFAULT false,
  workflow_portability boolean NOT NULL DEFAULT false,
  receipt_portability boolean NOT NULL DEFAULT false,
  blockers text[] DEFAULT '{}',
  evidence jsonb DEFAULT '{}',
  last_audited_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.surface_readiness_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own surface_readiness_records" ON public.surface_readiness_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Architecture Boundary Records
CREATE TABLE IF NOT EXISTS public.architecture_boundary_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  component_path text NOT NULL,
  component_type text NOT NULL DEFAULT 'page' CHECK (component_type IN ('page','hook','component','service','capability','workflow','adapter','contract','unknown')),
  layer text NOT NULL DEFAULT 'surface' CHECK (layer IN ('core_runtime','contract','capability','adapter','surface','unknown')),
  owns_business_logic boolean NOT NULL DEFAULT false,
  is_boundary_violation boolean NOT NULL DEFAULT false,
  violation_type text,
  migration_priority text DEFAULT 'low' CHECK (migration_priority IN ('critical','high','medium','low','none')),
  migration_target text,
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.architecture_boundary_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own architecture_boundary_records" ON public.architecture_boundary_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Cross-Surface Consistency Records
CREATE TABLE IF NOT EXISTS public.cross_surface_consistency_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  check_type text NOT NULL CHECK (check_type IN ('contract','truth','workflow','receipt','capability','notification','trust_presentation')),
  scope text NOT NULL,
  surfaces_checked text[] DEFAULT '{}',
  consistent boolean NOT NULL DEFAULT true,
  drift_description text,
  severity text DEFAULT 'low' CHECK (severity IN ('critical','high','medium','low')),
  resolution text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.cross_surface_consistency_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cross_surface_consistency_records" ON public.cross_surface_consistency_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER update_surface_types_updated_at BEFORE UPDATE ON public.surface_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_surface_adapters_updated_at BEFORE UPDATE ON public.surface_adapters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_capability_definitions_updated_at BEFORE UPDATE ON public.capability_definitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_capability_surface_bindings_updated_at BEFORE UPDATE ON public.capability_surface_bindings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shell_implementations_updated_at BEFORE UPDATE ON public.shell_implementations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_surface_readiness_records_updated_at BEFORE UPDATE ON public.surface_readiness_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_architecture_boundary_records_updated_at BEFORE UPDATE ON public.architecture_boundary_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cross_surface_consistency_records_updated_at BEFORE UPDATE ON public.cross_surface_consistency_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260406001250_6b4c5305-02a3-4811-8c30-8965077032c1.sql ──
-- 1. Experience Grammar Records
CREATE TABLE public.experience_grammar_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grammar_type TEXT NOT NULL CHECK (grammar_type IN (
    'trust_state','workflow_state','action_state','receipt_proof',
    'command','boardroom','notification_urgency','opportunity_scoring',
    'degraded_state','refusal'
  )),
  grammar_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  canonical_values JSONB NOT NULL DEFAULT '[]'::jsonb,
  surface_rendering_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, grammar_type, grammar_key)
);
ALTER TABLE public.experience_grammar_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own experience grammars" ON public.experience_grammar_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_experience_grammar_records_updated_at BEFORE UPDATE ON public.experience_grammar_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Surface Constraint Records
CREATE TABLE public.surface_constraint_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surface_id UUID NOT NULL REFERENCES public.surface_types(id) ON DELETE CASCADE,
  constraint_type TEXT NOT NULL,
  constraint_key TEXT NOT NULL,
  constraint_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  enforced BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, surface_id, constraint_key)
);
ALTER TABLE public.surface_constraint_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own surface constraints" ON public.surface_constraint_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_surface_constraint_records_updated_at BEFORE UPDATE ON public.surface_constraint_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Capability Portability Records
CREATE TABLE public.capability_portability_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  capability_id UUID NOT NULL REFERENCES public.capability_definitions(id) ON DELETE CASCADE,
  surface_id UUID NOT NULL REFERENCES public.surface_types(id) ON DELETE CASCADE,
  portability_score INTEGER NOT NULL DEFAULT 0 CHECK (portability_score >= 0 AND portability_score <= 100),
  blockers TEXT[] NOT NULL DEFAULT '{}',
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'not_assessed' CHECK (status IN ('not_assessed','portable','partial','blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, capability_id, surface_id)
);
ALTER TABLE public.capability_portability_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own capability portability" ON public.capability_portability_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_capability_portability_records_updated_at BEFORE UPDATE ON public.capability_portability_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Surface Launch Profiles
CREATE TABLE public.surface_launch_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surface_id UUID NOT NULL REFERENCES public.surface_types(id) ON DELETE CASCADE,
  launch_target_date DATE,
  readiness_score INTEGER NOT NULL DEFAULT 0 CHECK (readiness_score >= 0 AND readiness_score <= 100),
  gate_results JSONB NOT NULL DEFAULT '{}'::jsonb,
  blockers TEXT[] NOT NULL DEFAULT '{}',
  launch_status TEXT NOT NULL DEFAULT 'planning' CHECK (launch_status IN ('planning','development','testing','staging','launched','suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, surface_id)
);
ALTER TABLE public.surface_launch_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own surface launch profiles" ON public.surface_launch_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_surface_launch_profiles_updated_at BEFORE UPDATE ON public.surface_launch_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Surface Trust Presentations
CREATE TABLE public.surface_trust_presentations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surface_id UUID NOT NULL REFERENCES public.surface_types(id) ON DELETE CASCADE,
  trust_element TEXT NOT NULL,
  rendering_strategy TEXT NOT NULL,
  component_pattern TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, surface_id, trust_element)
);
ALTER TABLE public.surface_trust_presentations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trust presentations" ON public.surface_trust_presentations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_surface_trust_presentations_updated_at BEFORE UPDATE ON public.surface_trust_presentations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Surface Notification Grammars
CREATE TABLE public.surface_notification_grammars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surface_id UUID NOT NULL REFERENCES public.surface_types(id) ON DELETE CASCADE,
  urgency_level TEXT NOT NULL CHECK (urgency_level IN ('critical','high','normal','low','silent')),
  channel TEXT NOT NULL,
  delivery_method TEXT NOT NULL,
  template JSONB NOT NULL DEFAULT '{}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, surface_id, urgency_level, channel)
);
ALTER TABLE public.surface_notification_grammars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notification grammars" ON public.surface_notification_grammars FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_surface_notification_grammars_updated_at BEFORE UPDATE ON public.surface_notification_grammars FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260406002437_af47e604-5764-4809-9015-2e60f242c1ef.sql ──
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Provider Family Architecture Schema (fixed)
-- ═══════════════════════════════════════════════════════════════

-- 1. Provider Families
CREATE TABLE public.provider_families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  categories TEXT[] DEFAULT '{}',
  auth_types_supported TEXT[] DEFAULT '{"oauth2"}',
  identity_support BOOLEAN DEFAULT false,
  connector_support BOOLEAN DEFAULT true,
  demo_support BOOLEAN DEFAULT true,
  health_model TEXT DEFAULT 'basic',
  launch_stage TEXT DEFAULT 'planned',
  active BOOLEAN DEFAULT true,
  docs_url TEXT,
  setup_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_key, user_id)
);
ALTER TABLE public.provider_families ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own provider families" ON public.provider_families FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_provider_families_updated_at BEFORE UPDATE ON public.provider_families FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Provider Capabilities
CREATE TABLE public.provider_capabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_family_id UUID REFERENCES public.provider_families(id) ON DELETE CASCADE NOT NULL,
  capability_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  auth_requirement TEXT DEFAULT 'oauth2',
  minimum_scopes TEXT[] DEFAULT '{}',
  optional_scopes TEXT[] DEFAULT '{}',
  read_write TEXT DEFAULT 'read',
  sync_support BOOLEAN DEFAULT false,
  health_support BOOLEAN DEFAULT false,
  upgrade_path_support BOOLEAN DEFAULT false,
  launch_stage TEXT DEFAULT 'planned',
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(capability_key, user_id)
);
ALTER TABLE public.provider_capabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own provider capabilities" ON public.provider_capabilities FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_provider_capabilities_updated_at BEFORE UPDATE ON public.provider_capabilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. OAuth Client Registry
CREATE TABLE public.oauth_client_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_family_id UUID REFERENCES public.provider_families(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  client_purpose TEXT NOT NULL DEFAULT 'connector_web',
  allowed_capabilities TEXT[] DEFAULT '{}',
  environment TEXT DEFAULT 'production',
  redirect_uris TEXT[] DEFAULT '{}',
  authorized_origins TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  rotation_metadata JSONB DEFAULT '{}',
  launch_stage TEXT DEFAULT 'planned',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.oauth_client_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own oauth clients" ON public.oauth_client_registry FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_oauth_client_registry_updated_at BEFORE UPDATE ON public.oauth_client_registry FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Consent Ledger
CREATE TABLE public.consent_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_family_id UUID REFERENCES public.provider_families(id) ON DELETE CASCADE,
  provider_capability_id UUID REFERENCES public.provider_capabilities(id) ON DELETE SET NULL,
  oauth_client_id UUID REFERENCES public.oauth_client_registry(id) ON DELETE SET NULL,
  granted_scopes TEXT[] DEFAULT '{}',
  denied_scopes TEXT[] DEFAULT '{}',
  consent_version INTEGER DEFAULT 1,
  consent_status TEXT DEFAULT 'active',
  connection_context JSONB DEFAULT '{}',
  source_flow TEXT DEFAULT 'manual',
  mode TEXT DEFAULT 'real',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  entity_id TEXT,
  workspace_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.consent_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own consent" ON public.consent_ledger FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_consent_ledger_updated_at BEFORE UPDATE ON public.consent_ledger FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Consent Upgrades
CREATE TABLE public.consent_upgrades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  consent_ledger_id UUID REFERENCES public.consent_ledger(id) ON DELETE CASCADE NOT NULL,
  previous_scopes TEXT[] DEFAULT '{}',
  new_scopes TEXT[] DEFAULT '{}',
  upgrade_reason TEXT,
  approved_by TEXT,
  approval_required BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.consent_upgrades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own consent upgrades" ON public.consent_upgrades FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Consent Revocations
CREATE TABLE public.consent_revocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  consent_ledger_id UUID REFERENCES public.consent_ledger(id) ON DELETE CASCADE NOT NULL,
  revocation_reason TEXT NOT NULL DEFAULT 'user_requested',
  impacted_capabilities TEXT[] DEFAULT '{}',
  revoked_scopes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.consent_revocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own revocations" ON public.consent_revocations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. Scope Policy Matrix
CREATE TABLE public.scope_policy_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_capability_id UUID REFERENCES public.provider_capabilities(id) ON DELETE CASCADE NOT NULL,
  minimum_scopes TEXT[] DEFAULT '{}',
  optional_scopes TEXT[] DEFAULT '{}',
  disallowed_scopes TEXT[] DEFAULT '{}',
  default_grant_profile TEXT DEFAULT 'read_only',
  upgrade_path_available BOOLEAN DEFAULT false,
  approval_required_for_upgrade BOOLEAN DEFAULT false,
  launch_safety_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_capability_id, user_id)
);
ALTER TABLE public.scope_policy_matrix ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own scope policies" ON public.scope_policy_matrix FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_scope_policy_matrix_updated_at BEFORE UPDATE ON public.scope_policy_matrix FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Scope Recommendations
CREATE TABLE public.scope_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_capability_id UUID REFERENCES public.provider_capabilities(id) ON DELETE CASCADE,
  requested_scopes TEXT[] DEFAULT '{}',
  recommended_scopes TEXT[] DEFAULT '{}',
  removed_scopes TEXT[] DEFAULT '{}',
  warnings TEXT[] DEFAULT '{}',
  approval_needed BOOLEAN DEFAULT false,
  launch_safe BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.scope_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own scope recommendations" ON public.scope_recommendations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. Permission Levels
CREATE TABLE public.permission_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_capability_id UUID REFERENCES public.provider_capabilities(id) ON DELETE CASCADE NOT NULL,
  current_level TEXT DEFAULT 'none',
  granted_scopes TEXT[] DEFAULT '{}',
  max_available_level TEXT DEFAULT 'read_only',
  upgrade_available BOOLEAN DEFAULT false,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_capability_id, user_id)
);
ALTER TABLE public.permission_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own permission levels" ON public.permission_levels FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_permission_levels_updated_at BEFORE UPDATE ON public.permission_levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. Permission Drift Records
CREATE TABLE public.permission_drift_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_capability_id UUID REFERENCES public.provider_capabilities(id) ON DELETE SET NULL,
  drift_type TEXT NOT NULL DEFAULT 'unknown',
  description TEXT,
  impacted_capabilities TEXT[] DEFAULT '{}',
  severity TEXT DEFAULT 'medium',
  reconnect_needed BOOLEAN DEFAULT false,
  reauth_needed BOOLEAN DEFAULT false,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.permission_drift_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own drift records" ON public.permission_drift_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 11. Add provider_capability_id to existing connector_health_records
ALTER TABLE public.connector_health_records ADD COLUMN IF NOT EXISTS provider_capability_id UUID REFERENCES public.provider_capabilities(id) ON DELETE SET NULL;

-- 12. Unified Account Nodes
CREATE TABLE public.unified_account_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  node_type TEXT NOT NULL DEFAULT 'principal',
  display_name TEXT,
  email TEXT,
  entity_id TEXT,
  workspace_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.unified_account_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own account nodes" ON public.unified_account_nodes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_unified_account_nodes_updated_at BEFORE UPDATE ON public.unified_account_nodes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 13. Unified Account Edges
CREATE TABLE public.unified_account_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source_node_id UUID REFERENCES public.unified_account_nodes(id) ON DELETE CASCADE NOT NULL,
  target_node_id UUID REFERENCES public.unified_account_nodes(id) ON DELETE CASCADE NOT NULL,
  edge_type TEXT NOT NULL DEFAULT 'identity_link',
  provider_family_id UUID REFERENCES public.provider_families(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.unified_account_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own account edges" ON public.unified_account_edges FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 14. Identity Provider Links
CREATE TABLE public.identity_provider_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_family_id UUID REFERENCES public.provider_families(id) ON DELETE CASCADE NOT NULL,
  external_id TEXT,
  email TEXT,
  display_name TEXT,
  auth_method TEXT DEFAULT 'oauth2',
  primary_identity BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.identity_provider_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own identity links" ON public.identity_provider_links FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_identity_provider_links_updated_at BEFORE UPDATE ON public.identity_provider_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 15. Connected Service Links
CREATE TABLE public.connected_service_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_family_id UUID REFERENCES public.provider_families(id) ON DELETE CASCADE NOT NULL,
  provider_capability_id UUID REFERENCES public.provider_capabilities(id) ON DELETE CASCADE NOT NULL,
  connection_status TEXT DEFAULT 'disconnected',
  permission_level TEXT DEFAULT 'none',
  granted_scopes TEXT[] DEFAULT '{}',
  mode TEXT DEFAULT 'real',
  last_sync_at TIMESTAMPTZ,
  health_status TEXT DEFAULT 'unknown',
  reauth_needed BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.connected_service_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own service links" ON public.connected_service_links FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_connected_service_links_updated_at BEFORE UPDATE ON public.connected_service_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 16. Device Auth Clients
CREATE TABLE public.device_auth_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  client_class TEXT NOT NULL DEFAULT 'web',
  client_name TEXT NOT NULL,
  provider_family_id UUID REFERENCES public.provider_families(id) ON DELETE SET NULL,
  oauth_client_id UUID REFERENCES public.oauth_client_registry(id) ON DELETE SET NULL,
  device_type TEXT,
  platform TEXT,
  active BOOLEAN DEFAULT true,
  last_auth_at TIMESTAMPTZ,
  launch_stage TEXT DEFAULT 'planned',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.device_auth_clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own device clients" ON public.device_auth_clients FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_device_auth_clients_updated_at BEFORE UPDATE ON public.device_auth_clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 17. Integration Launch Honesty
CREATE TABLE public.integration_launch_honesty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  provider_family_id UUID REFERENCES public.provider_families(id) ON DELETE CASCADE,
  provider_capability_id UUID REFERENCES public.provider_capabilities(id) ON DELETE SET NULL,
  launch_label TEXT DEFAULT 'shell_only',
  evidence JSONB DEFAULT '{}',
  blockers TEXT[] DEFAULT '{}',
  notes TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.integration_launch_honesty ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own launch honesty" ON public.integration_launch_honesty FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_integration_launch_honesty_updated_at BEFORE UPDATE ON public.integration_launch_honesty FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── 20260406003516_4b8156d0-8c4c-4bc6-aee2-6718505ce134.sql ──
-- Create consent_scope_records table (individual scope grants per consent entry)
CREATE TABLE public.consent_scope_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  consent_ledger_id UUID REFERENCES public.consent_ledger(id) ON DELETE CASCADE,
  scope TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT true,
  grant_reason TEXT,
  revoked_at TIMESTAMPTZ,
  revoke_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.consent_scope_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own consent scope records" ON public.consent_scope_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_consent_scope_records_updated_at BEFORE UPDATE ON public.consent_scope_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260406020137_b1bfd1ee-4ab6-4f43-9f17-0d32c9b11ff6.sql ──
-- 1. personal_operating_graph_nodes
CREATE TABLE public.personal_operating_graph_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tenant_id TEXT,
  workspace_id TEXT,
  node_type TEXT NOT NULL DEFAULT 'other',
  node_ref TEXT,
  label TEXT NOT NULL,
  state TEXT DEFAULT 'active',
  visibility_scope TEXT DEFAULT 'private',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.personal_operating_graph_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own graph nodes" ON public.personal_operating_graph_nodes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_personal_operating_graph_nodes_updated_at BEFORE UPDATE ON public.personal_operating_graph_nodes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_pogn_user ON public.personal_operating_graph_nodes(user_id);
CREATE INDEX idx_pogn_type ON public.personal_operating_graph_nodes(node_type);

-- 2. personal_operating_graph_edges
CREATE TABLE public.personal_operating_graph_edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  from_node_id UUID REFERENCES public.personal_operating_graph_nodes(id) ON DELETE CASCADE,
  to_node_id UUID REFERENCES public.personal_operating_graph_nodes(id) ON DELETE CASCADE,
  edge_type TEXT NOT NULL DEFAULT 'related',
  weight NUMERIC DEFAULT 1.0,
  visibility_scope TEXT DEFAULT 'private',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.personal_operating_graph_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own graph edges" ON public.personal_operating_graph_edges FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_poge_user ON public.personal_operating_graph_edges(user_id);
CREATE INDEX idx_poge_from ON public.personal_operating_graph_edges(from_node_id);
CREATE INDEX idx_poge_to ON public.personal_operating_graph_edges(to_node_id);

-- 3. intent_resolutions
CREATE TABLE public.intent_resolutions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID NOT NULL,
  source_surface TEXT,
  source_device_id TEXT,
  raw_input TEXT,
  resolved_intent TEXT,
  confidence NUMERIC DEFAULT 0,
  target_capability TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.intent_resolutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own intents" ON public.intent_resolutions FOR ALL USING (auth.uid() = actor_id) WITH CHECK (auth.uid() = actor_id);
CREATE INDEX idx_ir_actor ON public.intent_resolutions(actor_id);

-- 4. command_orchestrations
CREATE TABLE public.command_orchestrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  intent_resolution_id UUID REFERENCES public.intent_resolutions(id) ON DELETE SET NULL,
  actor_id UUID NOT NULL,
  capability_key TEXT,
  workflow_ref TEXT,
  policy_decision_ref TEXT,
  trust_decision_ref TEXT,
  execution_state TEXT DEFAULT 'pending',
  receipt_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.command_orchestrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own orchestrations" ON public.command_orchestrations FOR ALL USING (auth.uid() = actor_id) WITH CHECK (auth.uid() = actor_id);
CREATE TRIGGER update_command_orchestrations_updated_at BEFORE UPDATE ON public.command_orchestrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_co_actor ON public.command_orchestrations(actor_id);

-- 5. priority_stacks
CREATE TABLE public.priority_stacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mode TEXT DEFAULT 'default',
  stack_date DATE NOT NULL DEFAULT CURRENT_DATE,
  top_items_json JSONB DEFAULT '[]'::jsonb,
  urgency_summary TEXT,
  attention_posture TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.priority_stacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own priority stacks" ON public.priority_stacks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_priority_stacks_updated_at BEFORE UPDATE ON public.priority_stacks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_ps_user_date ON public.priority_stacks(user_id, stack_date);

-- 6. attention_decisions
CREATE TABLE public.attention_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_ref TEXT,
  urgency_class TEXT DEFAULT 'normal',
  routing_decision TEXT,
  selected_surface TEXT,
  selected_device_id TEXT,
  deferred BOOLEAN DEFAULT false,
  defer_until TIMESTAMPTZ,
  reason TEXT,
  fatigue_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.attention_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own attention decisions" ON public.attention_decisions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_ad_user ON public.attention_decisions(user_id);

-- 7. cai_continuity_sessions (prefixed to avoid conflict with existing continuity_sessions)
CREATE TABLE public.cai_continuity_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_surface TEXT,
  target_surface TEXT,
  source_device_id TEXT,
  target_device_id TEXT,
  context_ref TEXT,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.cai_continuity_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own cai continuity sessions" ON public.cai_continuity_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_ccs_user ON public.cai_continuity_sessions(user_id);

-- 8. handoff_contexts
CREATE TABLE public.handoff_contexts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  continuity_session_id UUID REFERENCES public.cai_continuity_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  context_type TEXT DEFAULT 'state',
  payload_ref TEXT,
  urgency_class TEXT DEFAULT 'normal',
  resumable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.handoff_contexts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own handoff contexts" ON public.handoff_contexts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_hc_session ON public.handoff_contexts(continuity_session_id);

-- 9. trust_weighted_actions
CREATE TABLE public.trust_weighted_actions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  action_ref TEXT,
  risk_tier TEXT DEFAULT 'low',
  trust_class TEXT DEFAULT 'standard',
  device_trust_class TEXT DEFAULT 'unknown',
  mode TEXT DEFAULT 'live',
  routing TEXT DEFAULT 'auto',
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trust_weighted_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trust weighted actions" ON public.trust_weighted_actions FOR ALL USING (auth.uid() = actor_id) WITH CHECK (auth.uid() = actor_id);
CREATE INDEX idx_twa_actor ON public.trust_weighted_actions(actor_id);

-- 10. action_escalations
CREATE TABLE public.action_escalations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trust_weighted_action_id UUID REFERENCES public.trust_weighted_actions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  from_state TEXT,
  to_state TEXT,
  escalation_reason TEXT,
  target_surface TEXT,
  target_device_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.action_escalations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own action escalations" ON public.action_escalations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_ae_action ON public.action_escalations(trust_weighted_action_id);

-- 11. assistant_role_states
CREATE TABLE public.assistant_role_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role_key TEXT NOT NULL DEFAULT 'other',
  state TEXT DEFAULT 'idle',
  posture TEXT DEFAULT 'calm',
  confidence NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.assistant_role_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own assistant role states" ON public.assistant_role_states FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_assistant_role_states_updated_at BEFORE UPDATE ON public.assistant_role_states FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_ars_user_role ON public.assistant_role_states(user_id, role_key);

-- 12. coordinated_assistant_sessions
CREATE TABLE public.coordinated_assistant_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  active_roles TEXT[] DEFAULT '{}',
  current_objective TEXT,
  current_context_ref TEXT,
  support_intensity TEXT DEFAULT 'calm',
  calmness_profile TEXT DEFAULT 'balanced',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coordinated_assistant_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own assistant sessions" ON public.coordinated_assistant_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_coordinated_assistant_sessions_updated_at BEFORE UPDATE ON public.coordinated_assistant_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_cas_user ON public.coordinated_assistant_sessions(user_id);

-- 13. timing_intelligence_decisions
CREATE TABLE public.timing_intelligence_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  trigger_ref TEXT,
  recommendation TEXT DEFAULT 'queue',
  reason TEXT,
  readiness_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.timing_intelligence_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own timing decisions" ON public.timing_intelligence_decisions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_tid_user ON public.timing_intelligence_decisions(user_id);

-- 14. relationship_contexts
CREATE TABLE public.relationship_contexts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  related_person_ref TEXT,
  relationship_type TEXT DEFAULT 'contact',
  importance_tier TEXT DEFAULT 'normal',
  last_interaction_at TIMESTAMPTZ,
  open_loops_json JSONB DEFAULT '[]'::jsonb,
  obligations_json JSONB DEFAULT '[]'::jsonb,
  visibility_scope TEXT DEFAULT 'private',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.relationship_contexts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own relationship contexts" ON public.relationship_contexts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_relationship_contexts_updated_at BEFORE UPDATE ON public.relationship_contexts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_rc_user ON public.relationship_contexts(user_id);

-- 15. human_obligations
CREATE TABLE public.human_obligations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  related_person_ref TEXT,
  obligation_type TEXT DEFAULT 'follow_up',
  due_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending',
  source_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.human_obligations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own obligations" ON public.human_obligations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_human_obligations_updated_at BEFORE UPDATE ON public.human_obligations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_ho_user_status ON public.human_obligations(user_id, status);

-- 16. digest_compilations
CREATE TABLE public.digest_compilations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  digest_type TEXT NOT NULL DEFAULT 'daily_pulse',
  mode TEXT DEFAULT 'live',
  source_refs TEXT[] DEFAULT '{}',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivery_surface TEXT,
  summary_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.digest_compilations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own digests" ON public.digest_compilations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_dc_user_type ON public.digest_compilations(user_id, digest_type);

-- 17. operating_modes
CREATE TABLE public.operating_modes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mode_key TEXT NOT NULL DEFAULT 'default',
  active BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);
ALTER TABLE public.operating_modes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own operating modes" ON public.operating_modes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_om_user_active ON public.operating_modes(user_id, active);

-- 18. adaptive_interface_profiles
CREATE TABLE public.adaptive_interface_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  surface TEXT NOT NULL DEFAULT 'web',
  current_mode TEXT DEFAULT 'default',
  cognitive_load_class TEXT DEFAULT 'normal',
  density_preference TEXT DEFAULT 'comfortable',
  summary_depth TEXT DEFAULT 'standard',
  quick_action_bias TEXT DEFAULT 'balanced',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.adaptive_interface_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own interface profiles" ON public.adaptive_interface_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_adaptive_interface_profiles_updated_at BEFORE UPDATE ON public.adaptive_interface_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_aip_user_surface ON public.adaptive_interface_profiles(user_id, surface);

-- 19. opportunity_signals
CREATE TABLE public.opportunity_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  domain TEXT DEFAULT 'general',
  signal_type TEXT DEFAULT 'detected',
  title TEXT NOT NULL,
  summary TEXT,
  importance_tier TEXT DEFAULT 'normal',
  confidence NUMERIC DEFAULT 0,
  source_refs TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.opportunity_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own opportunity signals" ON public.opportunity_signals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_opportunity_signals_updated_at BEFORE UPDATE ON public.opportunity_signals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_os_user_status ON public.opportunity_signals(user_id, status);

-- 20. memory_governance_records
CREATE TABLE public.memory_governance_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_ref TEXT NOT NULL,
  user_id UUID NOT NULL,
  confidence NUMERIC DEFAULT 1.0,
  freshness TEXT DEFAULT 'current',
  correction_state TEXT DEFAULT 'uncorrected',
  archival_state TEXT DEFAULT 'active',
  visibility_scope TEXT DEFAULT 'private',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.memory_governance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own memory governance" ON public.memory_governance_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_memory_governance_records_updated_at BEFORE UPDATE ON public.memory_governance_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_mgr_user ON public.memory_governance_records(user_id);

-- 21. memory_corrections
CREATE TABLE public.memory_corrections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  memory_ref TEXT NOT NULL,
  actor_id UUID NOT NULL,
  correction_type TEXT DEFAULT 'factual',
  old_value_ref TEXT,
  new_value_ref TEXT,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.memory_corrections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own memory corrections" ON public.memory_corrections FOR ALL USING (auth.uid() = actor_id) WITH CHECK (auth.uid() = actor_id);
CREATE INDEX idx_mc_actor ON public.memory_corrections(actor_id);

-- 22. boundary_policies
CREATE TABLE public.boundary_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  boundary_type TEXT NOT NULL DEFAULT 'personal',
  policy_json JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.boundary_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own boundary policies" ON public.boundary_policies FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_boundary_policies_updated_at BEFORE UPDATE ON public.boundary_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_bp_user_type ON public.boundary_policies(user_id, boundary_type);

-- 23. experience_signature_rules
CREATE TABLE public.experience_signature_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  surface TEXT NOT NULL DEFAULT 'web',
  context_type TEXT DEFAULT 'default',
  urgency_class TEXT DEFAULT 'normal',
  tone_profile TEXT DEFAULT 'calm',
  summary_style TEXT DEFAULT 'concise',
  proof_style TEXT DEFAULT 'minimal',
  escalation_style TEXT DEFAULT 'graduated',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.experience_signature_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own experience rules" ON public.experience_signature_rules FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_esr_user_surface ON public.experience_signature_rules(user_id, surface);

-- ── 20260406110642_45ce9a51-99fc-4f30-9789-e3347c1417ff.sql ──
-- Fix system_config RLS: restrict SELECT to admins only
DROP POLICY IF EXISTS "Anyone can read system_config" ON public.system_config;
DROP POLICY IF EXISTS "System config is readable by authenticated users" ON public.system_config;
DROP POLICY IF EXISTS "system_config_select" ON public.system_config;

-- Only admins can read system_config
CREATE POLICY "Admins can read system_config"
  ON public.system_config
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can modify system_config
DROP POLICY IF EXISTS "system_config_insert" ON public.system_config;
DROP POLICY IF EXISTS "system_config_update" ON public.system_config;
DROP POLICY IF EXISTS "system_config_delete" ON public.system_config;

CREATE POLICY "Admins can insert system_config"
  ON public.system_config
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update system_config"
  ON public.system_config
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete system_config"
  ON public.system_config
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ── 20260406121456_1f30918b-fa41-406a-b517-01e072e2a0db.sql ──
DROP POLICY IF EXISTS "Authenticated read system config" ON public.system_config;

-- ── 20260406140905_bf852d81-a6dc-4376-8b34-45416ac25222.sql ──
-- ============================================================
-- 1. Create identity_provider_registry FIRST (referenced by identity_provider_links FK)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.identity_provider_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_family_id uuid REFERENCES public.provider_families(id) ON DELETE CASCADE,
  provider_capability_id uuid REFERENCES public.provider_capabilities(id) ON DELETE SET NULL,
  identity_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  auth_method text NOT NULL DEFAULT 'oauth2',
  default_scopes jsonb NOT NULL DEFAULT '[]',
  platform_scope text NOT NULL DEFAULT 'web',
  launch_stage text NOT NULL DEFAULT 'planned',
  is_active boolean NOT NULL DEFAULT true,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.identity_provider_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ipr_select" ON public.identity_provider_registry FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "ipr_insert" ON public.identity_provider_registry FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ipr_update" ON public.identity_provider_registry FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 2. Create other new tables
-- ============================================================
CREATE TABLE IF NOT EXISTS public.permission_upgrade_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connected_service_account_id uuid REFERENCES public.connected_service_links(id) ON DELETE CASCADE NOT NULL,
  requested_permission_level text NOT NULL,
  current_permission_level text NOT NULL,
  requested_scopes jsonb NOT NULL DEFAULT '[]',
  status text NOT NULL DEFAULT 'pending',
  approval_required boolean NOT NULL DEFAULT false,
  requested_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  notes text,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.permission_upgrade_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pur_select" ON public.permission_upgrade_requests FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "pur_insert" ON public.permission_upgrade_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pur_update" ON public.permission_upgrade_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.auth_connector_separation_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  provider_family_id uuid REFERENCES public.provider_families(id) ON DELETE SET NULL,
  issue_type text NOT NULL,
  severity text NOT NULL DEFAULT 'warning',
  details jsonb NOT NULL DEFAULT '{}',
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.auth_connector_separation_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "acsa_select" ON public.auth_connector_separation_audits FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "acsa_insert" ON public.auth_connector_separation_audits FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.identity_session_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  identity_provider_key text,
  provider_family_id uuid REFERENCES public.provider_families(id) ON DELETE SET NULL,
  event_type text NOT NULL DEFAULT 'login',
  ip_address text,
  user_agent text,
  session_id text,
  trust_posture text DEFAULT 'standard',
  anomaly_detected boolean NOT NULL DEFAULT false,
  anomaly_reason text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.identity_session_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "isa_select" ON public.identity_session_audit FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "isa_insert" ON public.identity_session_audit FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.connector_disconnection_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connected_service_account_id uuid REFERENCES public.connected_service_links(id) ON DELETE CASCADE NOT NULL,
  provider_family_id uuid REFERENCES public.provider_families(id) ON DELETE SET NULL,
  provider_capability_id uuid REFERENCES public.provider_capabilities(id) ON DELETE SET NULL,
  disconnect_reason text NOT NULL DEFAULT 'user_initiated',
  previous_permission_level text,
  previous_scopes jsonb NOT NULL DEFAULT '[]',
  initiated_by text NOT NULL DEFAULT 'user',
  metadata jsonb NOT NULL DEFAULT '{}',
  user_id uuid NOT NULL,
  disconnected_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.connector_disconnection_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cde_select" ON public.connector_disconnection_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "cde_insert" ON public.connector_disconnection_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 3. Add columns to existing tables
-- ============================================================
ALTER TABLE public.unified_account_nodes
  ADD COLUMN IF NOT EXISTS node_ref_id uuid,
  ADD COLUMN IF NOT EXISTS provider_family_id uuid REFERENCES public.provider_families(id) ON DELETE SET NULL;

ALTER TABLE public.consent_ledger
  ADD COLUMN IF NOT EXISTS consent_type text DEFAULT 'connector_grant',
  ADD COLUMN IF NOT EXISTS previous_scopes jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS notes text;

ALTER TABLE public.identity_provider_links
  ADD COLUMN IF NOT EXISTS identity_provider_registry_id uuid REFERENCES public.identity_provider_registry(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS linked_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS revoked_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS mode text DEFAULT 'real';

ALTER TABLE public.connected_service_links
  ADD COLUMN IF NOT EXISTS account_label text,
  ADD COLUMN IF NOT EXISTS external_account_id text,
  ADD COLUMN IF NOT EXISTS external_account_email text,
  ADD COLUMN IF NOT EXISTS external_account_name text,
  ADD COLUMN IF NOT EXISTS workspace_id uuid,
  ADD COLUMN IF NOT EXISTS entity_id uuid,
  ADD COLUMN IF NOT EXISTS disconnected_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_health_check_at timestamptz;

-- ============================================================
-- 4. Create views
-- ============================================================
CREATE OR REPLACE VIEW public.v_connected_accounts_center AS
SELECT
  csl.id, csl.user_id, csl.connection_status, csl.permission_level,
  csl.health_status, csl.last_sync_at, csl.mode, csl.account_label,
  csl.external_account_id, csl.external_account_email, csl.granted_scopes,
  csl.reauth_needed, csl.last_health_check_at, csl.created_at,
  pf.name AS provider_family_name, pf.provider_key AS provider_family_key,
  pc.display_name AS capability_name, pc.capability_key, pc.category AS capability_category,
  spm.default_grant_profile, spm.minimum_scopes AS policy_minimum_scopes, spm.upgrade_path_available
FROM public.connected_service_links csl
LEFT JOIN public.provider_families pf ON csl.provider_family_id = pf.id
LEFT JOIN public.provider_capabilities pc ON csl.provider_capability_id = pc.id
LEFT JOIN public.scope_policy_matrix spm ON spm.provider_capability_id = pc.id;

CREATE OR REPLACE VIEW public.v_identity_methods AS
SELECT
  ipl.id, ipl.user_id, ipl.email, ipl.display_name, ipl.avatar_url,
  ipl.auth_method, ipl.primary_identity, ipl.active, ipl.external_id,
  ipl.linked_at, ipl.revoked_at, ipl.last_verified_at, ipl.last_used_at, ipl.mode,
  pf.name AS provider_family_name, pf.provider_key AS provider_family_key,
  ipr.identity_key, ipr.platform_scope, ipr.launch_stage AS registry_launch_stage
FROM public.identity_provider_links ipl
LEFT JOIN public.provider_families pf ON ipl.provider_family_id = pf.id
LEFT JOIN public.identity_provider_registry ipr ON ipl.identity_provider_registry_id = ipr.id;

CREATE OR REPLACE VIEW public.v_consent_history AS
SELECT
  cl.id, cl.user_id, cl.consent_type, cl.consent_status,
  cl.granted_scopes, cl.denied_scopes, cl.previous_scopes,
  cl.revoked_at, cl.revocation_reason, cl.source_flow, cl.mode, cl.notes,
  cl.granted_at, cl.created_at,
  pf.name AS provider_family_name, pf.provider_key AS provider_family_key,
  pc.display_name AS capability_name, pc.capability_key
FROM public.consent_ledger cl
LEFT JOIN public.provider_families pf ON cl.provider_family_id = pf.id
LEFT JOIN public.provider_capabilities pc ON cl.provider_capability_id = pc.id;

CREATE OR REPLACE VIEW public.v_account_graph_summary AS
SELECT
  n.id AS node_id, n.user_id, n.node_type, n.display_name, n.email,
  n.entity_id, n.node_ref_id, n.provider_family_id,
  pf.name AS provider_family_name, pf.provider_key AS provider_family_key,
  (SELECT count(*) FROM public.unified_account_edges e
   WHERE e.source_node_id = n.id OR e.target_node_id = n.id) AS edge_count,
  n.created_at
FROM public.unified_account_nodes n
LEFT JOIN public.provider_families pf ON n.provider_family_id = pf.id;

-- ============================================================
-- 5. Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_ipr_family ON public.identity_provider_registry(provider_family_id);
CREATE INDEX IF NOT EXISTS idx_pur_account ON public.permission_upgrade_requests(connected_service_account_id);
CREATE INDEX IF NOT EXISTS idx_pur_status ON public.permission_upgrade_requests(status);
CREATE INDEX IF NOT EXISTS idx_acsa_type ON public.auth_connector_separation_audits(issue_type);
CREATE INDEX IF NOT EXISTS idx_isa_user ON public.identity_session_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_isa_created ON public.identity_session_audit(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cde_account ON public.connector_disconnection_events(connected_service_account_id);

-- ============================================================
-- 6. Triggers
-- ============================================================
CREATE TRIGGER update_identity_provider_registry_ts
  BEFORE UPDATE ON public.identity_provider_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260406141034_906dd2da-1435-40c3-93b8-b0324f6b3001.sql ──
ALTER VIEW public.v_connected_accounts_center SET (security_invoker = on);
ALTER VIEW public.v_identity_methods SET (security_invoker = on);
ALTER VIEW public.v_consent_history SET (security_invoker = on);
ALTER VIEW public.v_account_graph_summary SET (security_invoker = on);

-- ── 20260406142211_6db66201-6c2a-4ff7-a94c-4155322099ac.sql ──
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — AI Provider Gateway & Budget Intelligence Schema
-- Full advanced implementation
-- ═══════════════════════════════════════════════════════════════

-- ── TABLE 1: ai_provider_registry ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_provider_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider_key text NOT NULL,
  display_name text NOT NULL,
  api_style text NOT NULL DEFAULT 'chat_completions',
  secret_env_name text,
  base_url text,
  supports_tools boolean NOT NULL DEFAULT false,
  supports_structured_output boolean NOT NULL DEFAULT false,
  supports_streaming boolean NOT NULL DEFAULT false,
  supports_demo_mode boolean NOT NULL DEFAULT false,
  launch_stage text NOT NULL DEFAULT 'planned',
  is_active boolean NOT NULL DEFAULT true,
  mode text NOT NULL DEFAULT 'real',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_provider_registry_key ON public.ai_provider_registry(user_id, provider_key);

ALTER TABLE public.ai_provider_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own provider registry"
  ON public.ai_provider_registry FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── Extend ai_model_registry ───────────────────────────────────
ALTER TABLE public.ai_model_registry
  ADD COLUMN IF NOT EXISTS quality_tier text DEFAULT 'balanced',
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS supports_streaming boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS supports_json_mode boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS recommended_use_cases jsonb DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS max_output_tokens_default integer,
  ADD COLUMN IF NOT EXISTS provider_registry_id uuid REFERENCES public.ai_provider_registry(id),
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS mode text DEFAULT 'real';

-- ── Extend ai_routing_policies ─────────────────────────────────
ALTER TABLE public.ai_routing_policies
  ADD COLUMN IF NOT EXISTS routing_class text DEFAULT 'balanced_assistant',
  ADD COLUMN IF NOT EXISTS quality_requirement text DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS tool_use_required boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_fallback_to_demo boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_fallback_to_unavailable boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS launch_honesty_class text DEFAULT 'qualified';

-- ── Extend ai_provider_health ──────────────────────────────────
ALTER TABLE public.ai_provider_health
  ADD COLUMN IF NOT EXISTS health_state text DEFAULT 'healthy',
  ADD COLUMN IF NOT EXISTS last_success_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_failure_at timestamptz,
  ADD COLUMN IF NOT EXISTS failure_reason text,
  ADD COLUMN IF NOT EXISTS provider_registry_id uuid REFERENCES public.ai_provider_registry(id);

-- ── TABLE 3: ai_capability_routing ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_capability_routing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  capability_key text NOT NULL,
  default_provider_id uuid REFERENCES public.ai_provider_registry(id),
  default_model_id uuid REFERENCES public.ai_model_registry(id),
  fallback_provider_id uuid REFERENCES public.ai_provider_registry(id),
  fallback_model_id uuid REFERENCES public.ai_model_registry(id),
  routing_class text NOT NULL DEFAULT 'balanced_assistant',
  budget_class text NOT NULL DEFAULT 'standard',
  quality_requirement text NOT NULL DEFAULT 'standard',
  structured_output_required boolean NOT NULL DEFAULT false,
  tool_use_required boolean NOT NULL DEFAULT false,
  max_latency_class text NOT NULL DEFAULT 'medium',
  can_fallback_to_demo boolean NOT NULL DEFAULT false,
  can_fallback_to_unavailable boolean NOT NULL DEFAULT true,
  launch_honesty_class text NOT NULL DEFAULT 'qualified',
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_capability_routing_key ON public.ai_capability_routing(user_id, capability_key);
CREATE INDEX IF NOT EXISTS idx_ai_capability_routing_class ON public.ai_capability_routing(routing_class);

ALTER TABLE public.ai_capability_routing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own capability routing"
  ON public.ai_capability_routing FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── TABLE 4: ai_budget_policies ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_budget_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  policy_key text NOT NULL,
  scope_type text NOT NULL DEFAULT 'global',
  scope_ref text,
  daily_budget_usd numeric(12,4),
  weekly_budget_usd numeric(12,4),
  monthly_budget_usd numeric(12,4),
  max_request_cost_usd numeric(12,4),
  max_daily_requests integer,
  premium_allowed boolean NOT NULL DEFAULT true,
  fallback_on_exceeded boolean NOT NULL DEFAULT true,
  fallback_model_id uuid REFERENCES public.ai_model_registry(id),
  block_on_exceeded boolean NOT NULL DEFAULT false,
  alert_threshold_percent numeric(5,2) NOT NULL DEFAULT 80.00,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_budget_policies_key ON public.ai_budget_policies(user_id, policy_key);
CREATE INDEX IF NOT EXISTS idx_ai_budget_policies_scope ON public.ai_budget_policies(scope_type);

ALTER TABLE public.ai_budget_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own budget policies"
  ON public.ai_budget_policies FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── TABLE 5: ai_usage_ledger ───────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_usage_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  workspace_id uuid,
  session_id uuid,
  capability_key text NOT NULL,
  provider_id uuid REFERENCES public.ai_provider_registry(id),
  model_id uuid REFERENCES public.ai_model_registry(id),
  mode text NOT NULL DEFAULT 'real',
  request_class text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'success',
  prompt_tokens integer,
  completion_tokens integer,
  total_tokens integer,
  estimated_cost_usd numeric(12,6),
  latency_ms integer,
  structured_output_valid boolean,
  tool_invocations_count integer NOT NULL DEFAULT 0,
  receipt_id uuid,
  error_code text,
  error_summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_ledger_user ON public.ai_usage_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_ledger_capability ON public.ai_usage_ledger(capability_key);
CREATE INDEX IF NOT EXISTS idx_ai_usage_ledger_provider ON public.ai_usage_ledger(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_ledger_created ON public.ai_usage_ledger(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_usage_ledger_status ON public.ai_usage_ledger(status);

ALTER TABLE public.ai_usage_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own usage ledger"
  ON public.ai_usage_ledger FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own usage ledger"
  ON public.ai_usage_ledger FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── TABLE 7: ai_fallback_events ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_fallback_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  capability_key text NOT NULL,
  primary_provider_id uuid REFERENCES public.ai_provider_registry(id),
  primary_model_id uuid REFERENCES public.ai_model_registry(id),
  fallback_provider_id uuid REFERENCES public.ai_provider_registry(id),
  fallback_model_id uuid REFERENCES public.ai_model_registry(id),
  fallback_reason text NOT NULL,
  result_state text NOT NULL DEFAULT 'fallback_success',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_fallback_events_cap ON public.ai_fallback_events(capability_key);
CREATE INDEX IF NOT EXISTS idx_ai_fallback_events_created ON public.ai_fallback_events(created_at DESC);

ALTER TABLE public.ai_fallback_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own fallback events"
  ON public.ai_fallback_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own fallback events"
  ON public.ai_fallback_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── TABLE 8: ai_launch_honesty ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_launch_honesty (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  capability_key text NOT NULL,
  launch_honesty_class text NOT NULL DEFAULT 'planned',
  public_claim_allowed boolean NOT NULL DEFAULT false,
  qualifier_required boolean NOT NULL DEFAULT true,
  notes text,
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_launch_honesty_key ON public.ai_launch_honesty(user_id, capability_key);

ALTER TABLE public.ai_launch_honesty ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own launch honesty"
  ON public.ai_launch_honesty FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── TABLE 9: ai_receipt_records ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_receipt_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  workspace_id uuid,
  capability_key text NOT NULL,
  provider_id uuid REFERENCES public.ai_provider_registry(id),
  model_id uuid REFERENCES public.ai_model_registry(id),
  mode text NOT NULL DEFAULT 'real',
  request_summary text,
  response_summary text,
  structured_output_valid boolean,
  decision_class text,
  degraded_reason text,
  usage_ledger_id uuid REFERENCES public.ai_usage_ledger(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_receipt_records_cap ON public.ai_receipt_records(capability_key);
CREATE INDEX IF NOT EXISTS idx_ai_receipt_records_created ON public.ai_receipt_records(created_at DESC);

ALTER TABLE public.ai_receipt_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own receipt records"
  ON public.ai_receipt_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own receipt records"
  ON public.ai_receipt_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── TABLE 10: ai_budget_alerts ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_budget_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  policy_id uuid REFERENCES public.ai_budget_policies(id),
  scope_type text NOT NULL,
  scope_ref text,
  threshold_percent numeric(5,2) NOT NULL,
  observed_cost_usd numeric(12,4) NOT NULL,
  period_class text NOT NULL DEFAULT 'daily',
  alert_state text NOT NULL DEFAULT 'warning',
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_budget_alerts_policy ON public.ai_budget_alerts(policy_id);
CREATE INDEX IF NOT EXISTS idx_ai_budget_alerts_state ON public.ai_budget_alerts(alert_state);

ALTER TABLE public.ai_budget_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own budget alerts"
  ON public.ai_budget_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own budget alerts"
  ON public.ai_budget_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ── VIEWS ──────────────────────────────────────────────────────

-- v_ai_capability_status: routing + provider + model + launch honesty
CREATE OR REPLACE VIEW public.v_ai_capability_status
WITH (security_invoker = on) AS
SELECT
  cr.id,
  cr.user_id,
  cr.capability_key,
  cr.routing_class,
  cr.budget_class,
  cr.quality_requirement,
  cr.is_active,
  dp.provider_key AS default_provider_key,
  dp.display_name AS default_provider_name,
  dp.is_active AS provider_active,
  dm.model_id AS default_model_key,
  dm.display_name AS default_model_name,
  dm.quality_tier,
  dm.cost_tier,
  fp.provider_key AS fallback_provider_key,
  fm.model_id AS fallback_model_key,
  lh.launch_honesty_class,
  lh.public_claim_allowed,
  lh.qualifier_required,
  ph.health_state AS provider_health_state,
  cr.created_at,
  cr.updated_at
FROM public.ai_capability_routing cr
LEFT JOIN public.ai_provider_registry dp ON cr.default_provider_id = dp.id
LEFT JOIN public.ai_model_registry dm ON cr.default_model_id = dm.id
LEFT JOIN public.ai_provider_registry fp ON cr.fallback_provider_id = fp.id
LEFT JOIN public.ai_model_registry fm ON cr.fallback_model_id = fm.id
LEFT JOIN public.ai_launch_honesty lh ON cr.capability_key = lh.capability_key AND cr.user_id = lh.user_id
LEFT JOIN public.ai_provider_health ph ON dp.provider_key = ph.provider AND cr.user_id = ph.user_id;

-- v_ai_budget_summary: aggregated spend
CREATE OR REPLACE VIEW public.v_ai_budget_summary
WITH (security_invoker = on) AS
SELECT
  ul.user_id,
  date_trunc('day', ul.created_at) AS period_day,
  ul.capability_key,
  ul.status,
  COUNT(*) AS request_count,
  SUM(ul.prompt_tokens) AS total_prompt_tokens,
  SUM(ul.completion_tokens) AS total_completion_tokens,
  SUM(ul.total_tokens) AS total_tokens,
  SUM(ul.estimated_cost_usd) AS total_cost_usd,
  AVG(ul.latency_ms) AS avg_latency_ms
FROM public.ai_usage_ledger ul
GROUP BY ul.user_id, date_trunc('day', ul.created_at), ul.capability_key, ul.status;

-- v_ai_provider_status: provider + health + config
CREATE OR REPLACE VIEW public.v_ai_provider_status
WITH (security_invoker = on) AS
SELECT
  pr.id,
  pr.user_id,
  pr.provider_key,
  pr.display_name,
  pr.api_style,
  pr.secret_env_name,
  pr.supports_tools,
  pr.supports_structured_output,
  pr.supports_streaming,
  pr.launch_stage,
  pr.is_active,
  pr.mode,
  ph.health_state,
  ph.last_success_at,
  ph.last_failure_at,
  ph.failure_reason,
  ph.avg_latency_ms,
  ph.error_rate,
  ph.total_requests,
  ph.total_failures
FROM public.ai_provider_registry pr
LEFT JOIN public.ai_provider_health ph ON pr.provider_key = ph.provider AND pr.user_id = ph.user_id;

-- v_ai_usage_recent: recent invocations readable
CREATE OR REPLACE VIEW public.v_ai_usage_recent
WITH (security_invoker = on) AS
SELECT
  ul.id,
  ul.user_id,
  ul.capability_key,
  ul.mode,
  ul.request_class,
  ul.status,
  ul.prompt_tokens,
  ul.completion_tokens,
  ul.total_tokens,
  ul.estimated_cost_usd,
  ul.latency_ms,
  ul.structured_output_valid,
  ul.error_code,
  ul.error_summary,
  pr.provider_key,
  pr.display_name AS provider_name,
  mr.model_id AS model_key,
  mr.display_name AS model_name,
  mr.quality_tier,
  ul.created_at
FROM public.ai_usage_ledger ul
LEFT JOIN public.ai_provider_registry pr ON ul.provider_id = pr.id
LEFT JOIN public.ai_model_registry mr ON ul.model_id = mr.id
ORDER BY ul.created_at DESC;

-- ── Triggers for updated_at ────────────────────────────────────
CREATE TRIGGER update_ai_provider_registry_updated_at
  BEFORE UPDATE ON public.ai_provider_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_capability_routing_updated_at
  BEFORE UPDATE ON public.ai_capability_routing
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_budget_policies_updated_at
  BEFORE UPDATE ON public.ai_budget_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_launch_honesty_updated_at
  BEFORE UPDATE ON public.ai_launch_honesty
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260406142735_8814c1d4-cfdf-412b-b7c3-c49de4cdf091.sql ──
-- Add critical threshold to budget policies
ALTER TABLE public.ai_budget_policies
  ADD COLUMN IF NOT EXISTS critical_threshold_percent numeric(5,2) NOT NULL DEFAULT 95.00;

-- ── Budget policy check function ───────────────────────────────
CREATE OR REPLACE FUNCTION public.check_ai_budget_policies(
  p_user_id uuid,
  p_capability_key text,
  p_estimated_cost_usd numeric
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_policy record;
  v_daily_spend numeric;
  v_weekly_spend numeric;
  v_monthly_spend numeric;
  v_daily_requests integer;
  v_pct numeric;
  v_result jsonb := jsonb_build_object('allowed', true, 'reason', 'no_policy', 'should_downgrade', false, 'should_block', false);
BEGIN
  -- Get daily spend from usage ledger
  SELECT COALESCE(SUM(estimated_cost_usd), 0), COUNT(*)
  INTO v_daily_spend, v_daily_requests
  FROM public.ai_usage_ledger
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('day', now());

  -- Get weekly spend
  SELECT COALESCE(SUM(estimated_cost_usd), 0)
  INTO v_weekly_spend
  FROM public.ai_usage_ledger
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('week', now());

  -- Get monthly spend
  SELECT COALESCE(SUM(estimated_cost_usd), 0)
  INTO v_monthly_spend
  FROM public.ai_usage_ledger
  WHERE user_id = p_user_id
    AND created_at >= date_trunc('month', now());

  -- Check all applicable active policies (most specific first)
  FOR v_policy IN
    SELECT * FROM public.ai_budget_policies
    WHERE is_active = true
      AND (
        (scope_type = 'global')
        OR (scope_type = 'user' AND scope_ref = p_user_id::text)
        OR (scope_type = 'capability' AND scope_ref = p_capability_key)
      )
    ORDER BY
      CASE scope_type
        WHEN 'capability' THEN 1
        WHEN 'user' THEN 2
        WHEN 'workspace' THEN 3
        WHEN 'global' THEN 4
        ELSE 5
      END
  LOOP
    -- Check max request cost
    IF v_policy.max_request_cost_usd IS NOT NULL AND p_estimated_cost_usd > v_policy.max_request_cost_usd THEN
      IF v_policy.block_on_exceeded THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'max_request_cost_exceeded', 'policy_key', v_policy.policy_key, 'should_downgrade', v_policy.fallback_on_exceeded, 'should_block', true);
      END IF;
      IF v_policy.fallback_on_exceeded THEN
        RETURN jsonb_build_object('allowed', true, 'reason', 'max_request_cost_exceeded_fallback', 'policy_key', v_policy.policy_key, 'should_downgrade', true, 'should_block', false, 'fallback_model_id', v_policy.fallback_model_id);
      END IF;
    END IF;

    -- Check daily budget
    IF v_policy.daily_budget_usd IS NOT NULL THEN
      v_pct := ((v_daily_spend + p_estimated_cost_usd) / v_policy.daily_budget_usd) * 100;
      IF v_pct >= 100 THEN
        IF v_policy.block_on_exceeded THEN
          RETURN jsonb_build_object('allowed', false, 'reason', 'daily_budget_exceeded', 'policy_key', v_policy.policy_key, 'should_downgrade', false, 'should_block', true, 'pct', v_pct);
        END IF;
        IF v_policy.fallback_on_exceeded THEN
          RETURN jsonb_build_object('allowed', true, 'reason', 'daily_budget_exceeded_fallback', 'policy_key', v_policy.policy_key, 'should_downgrade', true, 'should_block', false, 'fallback_model_id', v_policy.fallback_model_id, 'pct', v_pct);
        END IF;
      END IF;
      IF v_pct >= v_policy.critical_threshold_percent THEN
        v_result := jsonb_build_object('allowed', true, 'reason', 'approaching_daily_critical', 'policy_key', v_policy.policy_key, 'should_downgrade', false, 'should_block', false, 'pct', v_pct, 'alert_state', 'critical');
      ELSIF v_pct >= v_policy.alert_threshold_percent THEN
        v_result := jsonb_build_object('allowed', true, 'reason', 'approaching_daily_warning', 'policy_key', v_policy.policy_key, 'should_downgrade', false, 'should_block', false, 'pct', v_pct, 'alert_state', 'warning');
      END IF;
    END IF;

    -- Check max daily requests
    IF v_policy.max_daily_requests IS NOT NULL AND v_daily_requests >= v_policy.max_daily_requests THEN
      IF v_policy.block_on_exceeded THEN
        RETURN jsonb_build_object('allowed', false, 'reason', 'max_daily_requests_exceeded', 'policy_key', v_policy.policy_key, 'should_downgrade', false, 'should_block', true);
      END IF;
      IF v_policy.fallback_on_exceeded THEN
        RETURN jsonb_build_object('allowed', true, 'reason', 'max_daily_requests_fallback', 'policy_key', v_policy.policy_key, 'should_downgrade', true, 'should_block', false, 'fallback_model_id', v_policy.fallback_model_id);
      END IF;
    END IF;

    -- Check premium not allowed
    IF NOT v_policy.premium_allowed THEN
      v_result := jsonb_set(v_result, '{premium_blocked}', 'true'::jsonb);
      v_result := jsonb_set(v_result, '{premium_blocked_policy}', to_jsonb(v_policy.policy_key));
    END IF;
  END LOOP;

  RETURN v_result;
END;
$$;

-- ── Aggregate daily spend view function ────────────────────────
CREATE OR REPLACE FUNCTION public.aggregate_ai_daily_spend(p_user_id uuid)
RETURNS TABLE(
  spend_date date,
  capability_key text,
  request_count bigint,
  total_cost_usd numeric,
  total_tokens bigint,
  avg_latency_ms numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    (created_at AT TIME ZONE 'UTC')::date AS spend_date,
    capability_key,
    COUNT(*) AS request_count,
    COALESCE(SUM(estimated_cost_usd), 0) AS total_cost_usd,
    COALESCE(SUM(total_tokens), 0) AS total_tokens,
    COALESCE(AVG(latency_ms), 0) AS avg_latency_ms
  FROM public.ai_usage_ledger
  WHERE user_id = p_user_id
    AND created_at >= now() - interval '30 days'
  GROUP BY spend_date, capability_key
  ORDER BY spend_date DESC, total_cost_usd DESC;
$$;

-- ── 20260406150733_35055b30-99f8-4163-b31a-a1e8809a0a8f.sql ──
-- Enable required extensions for scheduled jobs
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- Schedule agent-scheduler to run every 5 minutes
SELECT cron.schedule(
  'sita-agent-scheduler',
  '*/5 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://icrkipwlnuopqbsabngy.supabase.co/functions/v1/agent-scheduler',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljcmtpcHdsbnVvcHFic2Fibmd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMzQ2MDcsImV4cCI6MjA5MDkxMDYwN30.nxIqgU_J2HSdH_MjM3Ir62KxTKjk36irOIh-9Giw04s"}'::jsonb,
      body := concat('{"time": "', now(), '", "source": "pg_cron"}')::jsonb
    ) AS request_id;
  $$
);

-- Schedule self-healing heartbeat every 10 minutes
SELECT cron.schedule(
  'sita-self-healing-heartbeat',
  '*/10 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://icrkipwlnuopqbsabngy.supabase.co/functions/v1/agent-heartbeat',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljcmtpcHdsbnVvcHFic2Fibmd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMzQ2MDcsImV4cCI6MjA5MDkxMDYwN30.nxIqgU_J2HSdH_MjM3Ir62KxTKjk36irOIh-9Giw04s"}'::jsonb,
      body := concat('{"time": "', now(), '", "source": "pg_cron", "mode": "self-healing"}')::jsonb
    ) AS request_id;
  $$
);

-- ── 20260406151302_b7c4caad-64d2-4a81-98c1-433339ed4304.sql ──
-- Schedule the scheduler-dispatch function to run every 3 minutes via pg_cron
SELECT cron.schedule(
  'sita-scheduler-dispatch',
  '*/3 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://icrkipwlnuopqbsabngy.supabase.co/functions/v1/scheduler-dispatch',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljcmtpcHdsbnVvcHFic2Fibmd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMzQ2MDcsImV4cCI6MjA5MDkxMDYwN30.nxIqgU_J2HSdH_MjM3Ir62KxTKjk36irOIh-9Giw04s"}'::jsonb,
      body := concat('{"time": "', now(), '", "source": "pg_cron"}')::jsonb
    ) AS request_id;
  $$
);

-- Schedule runtime-probes health check every 15 minutes
SELECT cron.schedule(
  'sita-runtime-probes',
  '*/15 * * * *',
  $$
  SELECT
    net.http_post(
      url := 'https://icrkipwlnuopqbsabngy.supabase.co/functions/v1/runtime-probes',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljcmtpcHdsbnVvcHFic2Fibmd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMzQ2MDcsImV4cCI6MjA5MDkxMDYwN30.nxIqgU_J2HSdH_MjM3Ir62KxTKjk36irOIh-9Giw04s"}'::jsonb,
      body := concat('{"time": "', now(), '"}')::jsonb
    ) AS request_id;
  $$
);

-- ── 20260406151744_9cea5d83-f448-4eab-9719-8a07921b0807.sql ──
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Apple + Android Ecosystem Runtime Tables
-- ═══════════════════════════════════════════════════════════════

-- 1. Ecosystem Devices (unified Apple + Android)
CREATE TABLE public.ecosystem_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ecosystem TEXT NOT NULL CHECK (ecosystem IN ('apple', 'android')),
  surface TEXT NOT NULL,
  device_model TEXT NOT NULL,
  os_version TEXT NOT NULL DEFAULT '',
  manufacturer TEXT DEFAULT '',
  push_token TEXT,
  push_channel TEXT NOT NULL DEFAULT 'none',
  trust_class TEXT NOT NULL DEFAULT 'untrusted',
  biometric_capable BOOLEAN DEFAULT false,
  biometric_types TEXT[] DEFAULT '{}',
  play_services_available BOOLEAN,
  continuity_eligible BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ecosystem_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ecosystem devices" ON public.ecosystem_devices FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_ecosystem_devices_user ON public.ecosystem_devices(user_id);
CREATE INDEX idx_ecosystem_devices_ecosystem ON public.ecosystem_devices(ecosystem, surface);
CREATE TRIGGER update_ecosystem_devices_updated_at BEFORE UPDATE ON public.ecosystem_devices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Ecosystem Trust Records
CREATE TABLE public.ecosystem_trust_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_id UUID NOT NULL REFERENCES public.ecosystem_devices(id) ON DELETE CASCADE,
  ecosystem TEXT NOT NULL CHECK (ecosystem IN ('apple', 'android')),
  trust_class TEXT NOT NULL DEFAULT 'untrusted',
  biometric_verified BOOLEAN DEFAULT false,
  biometric_type TEXT,
  keystore_secured BOOLEAN DEFAULT false,
  attestation_verified BOOLEAN DEFAULT false,
  approval_eligible_classes TEXT[] DEFAULT '{}',
  risk_tier_ceiling TEXT NOT NULL DEFAULT 'low' CHECK (risk_tier_ceiling IN ('low', 'medium', 'high')),
  escalation_target TEXT,
  device_bound_receipts BOOLEAN DEFAULT false,
  session_duration TEXT DEFAULT '24h',
  reauth_method TEXT DEFAULT 'biometric',
  last_verified_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ecosystem_trust_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trust records" ON public.ecosystem_trust_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_ecosystem_trust_user ON public.ecosystem_trust_records(user_id);
CREATE INDEX idx_ecosystem_trust_device ON public.ecosystem_trust_records(device_id);
CREATE TRIGGER update_ecosystem_trust_updated_at BEFORE UPDATE ON public.ecosystem_trust_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Ecosystem Health Consents
CREATE TABLE public.ecosystem_health_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ecosystem TEXT NOT NULL CHECK (ecosystem IN ('apple', 'android')),
  signal_type TEXT NOT NULL,
  read_permission BOOLEAN DEFAULT false,
  routing_influence_consent BOOLEAN DEFAULT false,
  assistant_use_consent BOOLEAN DEFAULT false,
  boardroom_visibility_consent BOOLEAN DEFAULT false,
  privacy_explanation_shown BOOLEAN DEFAULT false,
  consented_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, ecosystem, signal_type)
);

ALTER TABLE public.ecosystem_health_consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own health consents" ON public.ecosystem_health_consents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_health_consents_user ON public.ecosystem_health_consents(user_id, ecosystem);
CREATE TRIGGER update_health_consents_updated_at BEFORE UPDATE ON public.ecosystem_health_consents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Ecosystem Push Routes
CREATE TABLE public.ecosystem_push_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_id UUID NOT NULL REFERENCES public.ecosystem_devices(id) ON DELETE CASCADE,
  ecosystem TEXT NOT NULL CHECK (ecosystem IN ('apple', 'android')),
  channel TEXT NOT NULL,
  urgency_filter TEXT NOT NULL DEFAULT 'all' CHECK (urgency_filter IN ('all', 'high_and_critical', 'critical_only')),
  focus_mode_aware BOOLEAN DEFAULT false,
  dnd_aware BOOLEAN DEFAULT false,
  calm_router_integrated BOOLEAN DEFAULT false,
  routing_priority INTEGER DEFAULT 0,
  notification_channel_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ecosystem_push_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own push routes" ON public.ecosystem_push_routes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_push_routes_user ON public.ecosystem_push_routes(user_id);
CREATE TRIGGER update_push_routes_updated_at BEFORE UPDATE ON public.ecosystem_push_routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Ecosystem Wearable Configs (Watch / Wear OS)
CREATE TABLE public.ecosystem_wearable_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_id UUID NOT NULL REFERENCES public.ecosystem_devices(id) ON DELETE CASCADE,
  ecosystem TEXT NOT NULL CHECK (ecosystem IN ('apple', 'android')),
  watch_model TEXT NOT NULL DEFAULT '',
  watch_os_version TEXT NOT NULL DEFAULT '',
  complications_supported TEXT[] DEFAULT '{}',
  tiles_supported TEXT[] DEFAULT '{}',
  micro_actions_enabled BOOLEAN DEFAULT false,
  glanceable_states_enabled BOOLEAN DEFAULT false,
  haptic_routing_enabled BOOLEAN DEFAULT false,
  filtered_alerts_only BOOLEAN DEFAULT true,
  escalate_to_phone_enabled BOOLEAN DEFAULT true,
  max_risk_tier TEXT DEFAULT 'low' CHECK (max_risk_tier IN ('low', 'medium')),
  auto_escalate_sec INTEGER DEFAULT 120,
  urgency_patterns TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ecosystem_wearable_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own wearable configs" ON public.ecosystem_wearable_configs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_wearable_configs_user ON public.ecosystem_wearable_configs(user_id);
CREATE TRIGGER update_wearable_configs_updated_at BEFORE UPDATE ON public.ecosystem_wearable_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Ecosystem Continuity Events
CREATE TABLE public.ecosystem_continuity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ecosystem TEXT NOT NULL CHECK (ecosystem IN ('apple', 'android')),
  source_device_id UUID REFERENCES public.ecosystem_devices(id) ON DELETE SET NULL,
  target_device_id UUID REFERENCES public.ecosystem_devices(id) ON DELETE SET NULL,
  source_surface TEXT NOT NULL,
  target_surface TEXT NOT NULL,
  handoff_type TEXT NOT NULL,
  context_ref TEXT,
  state TEXT NOT NULL DEFAULT 'available' CHECK (state IN ('available', 'active', 'completed', 'failed')),
  initiated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ecosystem_continuity_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own continuity events" ON public.ecosystem_continuity_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_continuity_events_user ON public.ecosystem_continuity_events(user_id);

-- 7. Ecosystem Launch Readiness
CREATE TABLE public.ecosystem_launch_readiness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ecosystem TEXT NOT NULL CHECK (ecosystem IN ('apple', 'android')),
  target TEXT NOT NULL,
  target_name TEXT NOT NULL DEFAULT '',
  launch_stage TEXT NOT NULL DEFAULT 'planned' CHECK (launch_stage IN ('planned', 'internal', 'demo', 'pilot', 'launch_ready', 'production')),
  blockers TEXT[] DEFAULT '{}',
  demo_available BOOLEAN DEFAULT false,
  pilot_ready BOOLEAN DEFAULT false,
  launch_ready BOOLEAN DEFAULT false,
  evidence JSONB DEFAULT '{}',
  last_assessed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, ecosystem, target)
);

ALTER TABLE public.ecosystem_launch_readiness ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own launch readiness" ON public.ecosystem_launch_readiness FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_launch_readiness_user ON public.ecosystem_launch_readiness(user_id, ecosystem);
CREATE TRIGGER update_launch_readiness_updated_at BEFORE UPDATE ON public.ecosystem_launch_readiness FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260406155114_47f679da-9813-40df-be9c-1ee6591c64ed.sql ──
ALTER VIEW public.v_ai_workforce_role_summary SET (security_invoker = true);
ALTER VIEW public.v_ai_workforce_recent_activity SET (security_invoker = true);
ALTER VIEW public.v_ai_workforce_recommendation_summary SET (security_invoker = true);
ALTER VIEW public.v_ai_workforce_queue_summary SET (security_invoker = true);

-- ── 20260406164642_21059fb2-e78c-45c0-858f-ad04dcb12e5e.sql ──
-- Seed ai_launch_honesty with honest capability classifications
-- Only insert if no records exist to avoid duplicates
INSERT INTO public.ai_launch_honesty (user_id, capability_key, launch_honesty_class, public_claim_allowed, qualifier_required, notes)
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid,
  v.capability_key,
  v.launch_honesty_class,
  v.public_claim_allowed,
  v.qualifier_required,
  v.notes
FROM (VALUES
  -- Core (real)
  ('auth.login', 'real', true, false, 'Supabase Auth fully operational'),
  ('auth.signup', 'real', true, false, 'Supabase Auth fully operational'),
  ('auth.password_reset', 'real', true, false, 'Supabase Auth fully operational'),
  ('notifications.push', 'real', true, false, 'DB-backed notification queue'),
  ('notifications.dedup', 'real', true, false, 'Trigger-based deduplication'),
  ('proof.receipt_creation', 'real', true, false, 'Persisted proof records'),
  ('proof.hash_verification', 'real', true, false, 'Receipt hash chain'),
  ('approval.queue', 'real', true, false, 'DB-backed approval workflow'),
  ('approval.execution', 'real', true, false, 'Trust-weighted action execution'),
  ('audit.logging', 'real', true, false, 'Trigger-based audit trail'),
  ('reality.mode_switching', 'real', true, false, 'Full dual-reality system'),
  ('files.upload', 'real', true, false, 'Supabase storage integration'),
  ('files.metadata', 'real', true, false, 'DB-persisted file metadata'),

  -- AI Gateway (partial — infrastructure exists, no API key)
  ('ai.gateway.routing', 'partial', false, true, 'Routing policies defined; no AI provider key configured'),
  ('ai.gateway.budget_enforcement', 'partial', false, true, 'Budget policies in DB; enforcement active but no live AI calls'),
  ('ai.gateway.fallback', 'partial', false, true, 'Fallback chain defined; untested with live providers'),
  ('ai.gateway.receipt_logging', 'real', true, false, 'Inference receipts persisted to DB'),
  ('ai.capability.advisor_synthesis', 'planned', false, true, 'Advisor architecture built; needs AI provider'),
  ('ai.capability.boardroom_briefing', 'planned', false, true, 'UI ready; needs AI-generated content'),
  ('ai.capability.recommendation_engine', 'planned', false, true, 'Service scaffold; needs AI provider'),
  ('ai.workforce.agent_roster', 'partial', false, true, 'Registry DB exists; agents not executing'),
  ('ai.workforce.task_governance', 'partial', false, true, 'Task queue in DB; no live agent execution'),
  ('ai.workforce.cost_tracking', 'real', true, false, 'Cost ledger and budget policies operational'),

  -- Finance (planned — engines built, no real financial data)
  ('finance.safe_to_spend', 'planned', false, true, 'Calculation engine built; needs real account data'),
  ('finance.tax_estimation', 'planned', false, true, 'Engine built; needs financial connector'),
  ('finance.burn_rate', 'planned', false, true, 'Calculation ready; needs transaction feed'),
  ('finance.invoice_aging', 'partial', false, true, 'Invoice table exists; aging logic ready'),
  ('finance.bill_calendar', 'planned', false, true, 'Service built; needs bank connector'),
  ('finance.subscription_detection', 'planned', false, true, 'Detection engine built; needs transaction data'),
  ('finance.waste_detection', 'planned', false, true, 'Engine ready; needs spending data'),
  ('finance.cash_flow_projection', 'planned', false, true, 'Projection engine built; needs real data feed'),

  -- Business (partial — DB tables exist, limited real data flow)
  ('business.lead_management', 'partial', false, true, 'Leads table operational; CRM features demo-backed'),
  ('business.customer_records', 'partial', false, true, 'Customer table exists; manual entry only'),
  ('business.invoice_management', 'partial', false, true, 'Invoice CRUD operational'),
  ('business.opportunity_ranking', 'planned', false, true, 'Service built; needs AI scoring'),
  ('business.customer_health', 'planned', false, true, 'Health scoring engine; needs interaction data'),
  ('business.revenue_forecasting', 'planned', false, true, 'Forecast engine; needs historical data'),

  -- Concierge (planned)
  ('concierge.household_ops', 'planned', false, true, 'Task management built; not connected to real services'),
  ('concierge.travel_booking', 'planned', false, true, 'UI scaffold; no booking API connected'),
  ('concierge.responsibilities', 'planned', false, true, 'Responsibility engine; needs household data'),

  -- Integrations (partial — framework exists, limited real connectors)
  ('integrations.connector_framework', 'partial', false, true, 'Control plane built; no live OAuth connectors'),
  ('integrations.webhook_relay', 'planned', false, true, 'Relay architecture defined; not deployed'),
  ('integrations.sync_engine', 'planned', false, true, 'Sync logic built; needs live connectors'),

  -- Workflows
  ('workflows.engine', 'partial', false, true, 'Workflow table + execution engine in DB'),
  ('workflows.automation_rules', 'partial', false, true, 'Rule engine built; limited automation'),

  -- Learning & Growth
  ('learning.goal_tracking', 'planned', false, true, 'Goal tracker service built; in-memory only'),
  ('learning.financial_literacy', 'planned', false, true, 'Literacy engine; needs content + AI'),

  -- Ecosystem Admin
  ('admin.reality_classification', 'real', true, false, 'Classification CRUD operational'),
  ('admin.truth_dashboard', 'real', true, false, 'Dashboard reads live classification data'),
  ('admin.deployment_center', 'partial', false, true, 'UI built; limited real deployment data')
) AS v(capability_key, launch_honesty_class, public_claim_allowed, qualifier_required, notes)
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_launch_honesty WHERE capability_key = v.capability_key
);

-- ── 20260406165526_0237d71a-3516-4672-9919-f383a8a1a905.sql ──
-- Kill switch persistence table
CREATE TABLE public.demo_kill_switches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, key)
);

ALTER TABLE public.demo_kill_switches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own kill switches"
  ON public.demo_kill_switches FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_demo_kill_switches_updated_at
  BEFORE UPDATE ON public.demo_kill_switches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260406173243_ea9815ec-d3da-40d5-850b-8ec1e22e0a57.sql ──
-- ══ TABLE 1: reality_mode_registry ══
CREATE TABLE public.reality_mode_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL,
  allows_real_side_effects boolean NOT NULL DEFAULT false,
  allows_demo_side_effects boolean NOT NULL DEFAULT false,
  analytics_bucket text NOT NULL,
  user_visible boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reality_mode_registry ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 2: surface_class_registry ══
CREATE TABLE public.surface_class_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  surface_class_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL,
  operator_only boolean NOT NULL DEFAULT false,
  user_facing boolean NOT NULL DEFAULT false,
  launch_stage text NOT NULL DEFAULT 'planned',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.surface_class_registry ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 3: route_surface_registry ══
CREATE TABLE public.route_surface_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_key text UNIQUE NOT NULL,
  route_path text NOT NULL,
  surface_class_id uuid NOT NULL REFERENCES public.surface_class_registry(id) ON DELETE CASCADE,
  shell_key text NOT NULL,
  domain_family text NOT NULL,
  capability_family text,
  launch_stage text NOT NULL DEFAULT 'planned',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_route_surface_sc ON public.route_surface_registry(surface_class_id);
CREATE INDEX idx_route_surface_sh ON public.route_surface_registry(shell_key);
ALTER TABLE public.route_surface_registry ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 4: capability_reality_bindings ══
CREATE TABLE public.capability_reality_bindings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_key text UNIQUE NOT NULL,
  surface_class_id uuid REFERENCES public.surface_class_registry(id),
  preferred_mode_key text NOT NULL,
  allowed_modes jsonb NOT NULL DEFAULT '["real"]',
  requires_real_provider boolean NOT NULL DEFAULT false,
  allows_demo_provider boolean NOT NULL DEFAULT false,
  allows_internal_test_provider boolean NOT NULL DEFAULT false,
  side_effect_policy_key text NOT NULL,
  launch_honesty_class text NOT NULL DEFAULT 'qualified',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.capability_reality_bindings ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 5: provider_activation_registry ══
CREATE TABLE public.provider_activation_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_family_key text NOT NULL,
  provider_capability_key text NOT NULL,
  activation_state text NOT NULL,
  real_mode_supported boolean NOT NULL DEFAULT false,
  demo_mode_supported boolean NOT NULL DEFAULT false,
  internal_test_supported boolean NOT NULL DEFAULT false,
  health_state text NOT NULL DEFAULT 'unknown',
  notes text,
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pa_family ON public.provider_activation_registry(provider_family_key);
CREATE INDEX idx_pa_cap ON public.provider_activation_registry(provider_capability_key);
CREATE INDEX idx_pa_state ON public.provider_activation_registry(activation_state);
ALTER TABLE public.provider_activation_registry ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 6: demo_provider_registry ══
CREATE TABLE public.demo_provider_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_provider_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  domain_family text NOT NULL,
  capability_keys jsonb NOT NULL DEFAULT '[]',
  supports_interaction boolean NOT NULL DEFAULT true,
  supports_simulated_writes boolean NOT NULL DEFAULT false,
  launch_honesty_class text NOT NULL DEFAULT 'demo_governed',
  scenario_pack_required boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_dp_domain ON public.demo_provider_registry(domain_family);
ALTER TABLE public.demo_provider_registry ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 7: demo_scenario_packs ══
CREATE TABLE public.demo_scenario_packs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_pack_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL,
  theme_family text NOT NULL,
  surface_classes jsonb NOT NULL DEFAULT '[]',
  enabled_demo_providers jsonb NOT NULL DEFAULT '[]',
  storyline_metadata jsonb NOT NULL DEFAULT '{}',
  default_for_demo_mode boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.demo_scenario_packs ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 8: Alter existing demo_scenario_entities ══
ALTER TABLE public.demo_scenario_entities
  ADD COLUMN scenario_pack_id uuid REFERENCES public.demo_scenario_packs(id) ON DELETE CASCADE,
  ADD COLUMN display_name text,
  ADD COLUMN entity_payload jsonb NOT NULL DEFAULT '{}';
CREATE INDEX idx_dse_pack ON public.demo_scenario_entities(scenario_pack_id);

-- ══ TABLE 9: demo_interaction_policies ══
CREATE TABLE public.demo_interaction_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demo_provider_id uuid NOT NULL REFERENCES public.demo_provider_registry(id) ON DELETE CASCADE,
  interaction_key text NOT NULL,
  interaction_behavior text NOT NULL,
  user_visible_label text,
  side_effect_policy_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_dip_prov ON public.demo_interaction_policies(demo_provider_id);
ALTER TABLE public.demo_interaction_policies ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 10: side_effect_policies ══
CREATE TABLE public.side_effect_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  real_mode_behavior text NOT NULL,
  demo_mode_behavior text NOT NULL,
  internal_test_behavior text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.side_effect_policies ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 11: launch_honesty_surface_bindings ══
CREATE TABLE public.launch_honesty_surface_bindings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  binding_type text NOT NULL,
  binding_key text NOT NULL,
  launch_honesty_class text NOT NULL,
  public_claim_allowed boolean NOT NULL DEFAULT false,
  qualifier_required boolean NOT NULL DEFAULT true,
  notes text,
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lhsb_type ON public.launch_honesty_surface_bindings(binding_type);
CREATE INDEX idx_lhsb_key ON public.launch_honesty_surface_bindings(binding_key);
ALTER TABLE public.launch_honesty_surface_bindings ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 12: reality_mode_resolution_log ══
CREATE TABLE public.reality_mode_resolution_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  route_key text,
  capability_key text,
  surface_class_key text,
  requested_mode text,
  resolved_mode text NOT NULL,
  provider_source_type text NOT NULL,
  provider_source_key text,
  launch_honesty_class text NOT NULL,
  side_effect_policy_key text,
  analytics_bucket text NOT NULL,
  resolution_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_rmrl_route ON public.reality_mode_resolution_log(route_key);
CREATE INDEX idx_rmrl_cap ON public.reality_mode_resolution_log(capability_key);
CREATE INDEX idx_rmrl_mode ON public.reality_mode_resolution_log(resolved_mode);
CREATE INDEX idx_rmrl_ts ON public.reality_mode_resolution_log(created_at DESC);
ALTER TABLE public.reality_mode_resolution_log ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 13: analytics_mode_policies ══
CREATE TABLE public.analytics_mode_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode_key text NOT NULL,
  analytics_bucket text NOT NULL,
  mix_with_real_allowed boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(mode_key, analytics_bucket)
);
ALTER TABLE public.analytics_mode_policies ENABLE ROW LEVEL SECURITY;

-- ══ TABLE 14: mode_segregation_audits ══
CREATE TABLE public.mode_segregation_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_type text NOT NULL,
  severity text NOT NULL,
  route_key text,
  capability_key text,
  details jsonb NOT NULL DEFAULT '{}',
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
CREATE INDEX idx_msa_type ON public.mode_segregation_audits(issue_type);
CREATE INDEX idx_msa_sev ON public.mode_segregation_audits(severity);
CREATE INDEX idx_msa_res ON public.mode_segregation_audits(resolved);
ALTER TABLE public.mode_segregation_audits ENABLE ROW LEVEL SECURITY;

-- ══ TRIGGERS ══
CREATE TRIGGER trg_route_surface_updated BEFORE UPDATE ON public.route_surface_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_cap_bindings_updated BEFORE UPDATE ON public.capability_reality_bindings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_prov_act_updated BEFORE UPDATE ON public.provider_activation_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_demo_prov_updated BEFORE UPDATE ON public.demo_provider_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_demo_packs_updated BEFORE UPDATE ON public.demo_scenario_packs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ══ RLS POLICIES ══
CREATE POLICY "auth_read_rmr" ON public.reality_mode_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_rmr" ON public.reality_mode_registry FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_scr" ON public.surface_class_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_scr" ON public.surface_class_registry FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_rsr" ON public.route_surface_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_rsr" ON public.route_surface_registry FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_crb" ON public.capability_reality_bindings FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_crb" ON public.capability_reality_bindings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_par" ON public.provider_activation_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_par" ON public.provider_activation_registry FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_dpr" ON public.demo_provider_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_dpr" ON public.demo_provider_registry FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_dsp" ON public.demo_scenario_packs FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_dsp" ON public.demo_scenario_packs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_dse" ON public.demo_scenario_entities FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_dse" ON public.demo_scenario_entities FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_dip" ON public.demo_interaction_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_dip" ON public.demo_interaction_policies FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_sep" ON public.side_effect_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_sep" ON public.side_effect_policies FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "auth_read_lhsb" ON public.launch_honesty_surface_bindings FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_lhsb" ON public.launch_honesty_surface_bindings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "own_read_rmrl" ON public.reality_mode_resolution_log FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "admin_read_rmrl" ON public.reality_mode_resolution_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "auth_insert_rmrl" ON public.reality_mode_resolution_log FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "auth_read_amp" ON public.analytics_mode_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "admin_all_amp" ON public.analytics_mode_policies FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin_read_msa" ON public.mode_segregation_audits FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admin_all_msa" ON public.mode_segregation_audits FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ══ VIEWS ══
CREATE OR REPLACE VIEW public.v_reality_mode_surface_summary AS
SELECT rsr.route_key, rsr.route_path, rsr.shell_key, rsr.domain_family, rsr.launch_stage AS route_launch_stage,
  scr.surface_class_key, scr.display_name AS surface_display_name, scr.operator_only,
  crb.capability_key, crb.preferred_mode_key, crb.allowed_modes, crb.launch_honesty_class, crb.side_effect_policy_key,
  lhsb.launch_honesty_class AS honesty_binding_class, lhsb.public_claim_allowed, lhsb.qualifier_required
FROM public.route_surface_registry rsr
JOIN public.surface_class_registry scr ON rsr.surface_class_id = scr.id
LEFT JOIN public.capability_reality_bindings crb ON crb.surface_class_id = scr.id
LEFT JOIN public.launch_honesty_surface_bindings lhsb ON lhsb.binding_key = rsr.route_key AND lhsb.binding_type = 'route'
WHERE rsr.is_active = true;

CREATE OR REPLACE VIEW public.v_demo_provider_summary AS
SELECT dpr.demo_provider_key, dpr.display_name, dpr.domain_family, dpr.capability_keys,
  dpr.supports_interaction, dpr.supports_simulated_writes, dpr.launch_honesty_class, dpr.is_active,
  COUNT(DISTINCT dsp.id) AS scenario_pack_count, COUNT(DISTINCT dip.id) AS interaction_policy_count
FROM public.demo_provider_registry dpr
LEFT JOIN public.demo_scenario_packs dsp ON dsp.enabled_demo_providers ? dpr.demo_provider_key
LEFT JOIN public.demo_interaction_policies dip ON dip.demo_provider_id = dpr.id
GROUP BY dpr.id;

CREATE OR REPLACE VIEW public.v_provider_activation_summary AS
SELECT provider_family_key, provider_capability_key, activation_state, real_mode_supported,
  demo_mode_supported, internal_test_supported, health_state, notes, last_verified_at, updated_at
FROM public.provider_activation_registry ORDER BY provider_family_key;

CREATE OR REPLACE VIEW public.v_mode_resolution_recent AS
SELECT id, user_id, route_key, capability_key, surface_class_key, requested_mode, resolved_mode,
  provider_source_type, provider_source_key, launch_honesty_class, analytics_bucket, resolution_reason, created_at
FROM public.reality_mode_resolution_log ORDER BY created_at DESC LIMIT 500;

CREATE OR REPLACE VIEW public.v_launch_honesty_by_surface AS
SELECT lhsb.binding_type, lhsb.binding_key, lhsb.launch_honesty_class, lhsb.public_claim_allowed,
  lhsb.qualifier_required, lhsb.notes, lhsb.last_verified_at,
  CASE WHEN lhsb.binding_type = 'route' THEN rsr.route_path ELSE NULL END AS route_path,
  CASE WHEN lhsb.binding_type = 'route' THEN scr.surface_class_key
       WHEN lhsb.binding_type = 'surface_class' THEN lhsb.binding_key ELSE NULL END AS surface_class_key
FROM public.launch_honesty_surface_bindings lhsb
LEFT JOIN public.route_surface_registry rsr ON lhsb.binding_type = 'route' AND lhsb.binding_key = rsr.route_key
LEFT JOIN public.surface_class_registry scr ON rsr.surface_class_id = scr.id
ORDER BY lhsb.binding_type, lhsb.binding_key;

-- ══ SEED DATA ══
INSERT INTO public.reality_mode_registry (mode_key, display_name, description, allows_real_side_effects, allows_demo_side_effects, analytics_bucket, user_visible) VALUES
  ('real', 'Real Mode', 'Production runtime with real auth, data, persistence, and side effects', true, false, 'real', true),
  ('demo', 'Demo Mode', 'Investor/sales demo with curated scenario data, blocked real side effects', false, true, 'demo', true),
  ('internal_test', 'Internal Test', 'Internal testing/staging with partial real systems', false, true, 'internal_test', false),
  ('unavailable', 'Unavailable', 'Capability or provider is not available', false, false, 'discard', true),
  ('planned', 'Planned', 'Architecture defined, implementation pending', false, false, 'discard', true);

INSERT INTO public.surface_class_registry (surface_class_key, display_name, description, operator_only, user_facing, launch_stage) VALUES
  ('admin_os', 'Admin OS', 'Internal operating system for operators, admins, AI governance', true, false, 'active'),
  ('user_app', 'User App', 'Elegant daily-use product experience', false, true, 'active'),
  ('mobile_app', 'Mobile App', 'Mobile-optimized user app surface', false, true, 'planned'),
  ('device_surface', 'Device Surface', 'Ambient device interfaces', false, false, 'planned'),
  ('internal_tool', 'Internal Tool', 'Internal development and experiment tools', true, false, 'active');

INSERT INTO public.side_effect_policies (policy_key, display_name, real_mode_behavior, demo_mode_behavior, internal_test_behavior, notes) VALUES
  ('allow_all', 'Allow All', 'allow', 'block', 'block', 'Full real writes, blocked in demo/test'),
  ('allow_with_trust', 'Allow With Trust', 'allow_with_trust', 'block', 'block', 'Trust-weighted real writes'),
  ('simulate_demo', 'Simulate in Demo', 'allow', 'simulate_only', 'simulate_only', 'Real writes in real, simulated in demo'),
  ('write_demo_store', 'Write Demo Store', 'allow', 'write_demo_store', 'allow_test_store', 'Writes to segregated demo/test stores'),
  ('read_only', 'Read Only', 'allow', 'read_only', 'read_only', 'No writes in any mode'),
  ('block_all', 'Block All', 'block', 'block', 'block', 'All writes blocked');

INSERT INTO public.analytics_mode_policies (mode_key, analytics_bucket, mix_with_real_allowed, notes) VALUES
  ('real', 'real', false, 'Real analytics must never be contaminated'),
  ('demo', 'demo', false, 'Demo analytics segregated from real'),
  ('internal_test', 'internal_test', false, 'Internal test analytics isolated'),
  ('unavailable', 'discard', false, 'Unavailable modes discard analytics'),
  ('planned', 'discard', false, 'Planned modes discard analytics');

INSERT INTO public.demo_provider_registry (demo_provider_key, display_name, domain_family, capability_keys, supports_interaction, supports_simulated_writes, launch_honesty_class) VALUES
  ('demo_boardroom', 'Boardroom Demo', 'boardroom', '["boardroom.weekly.summary","boardroom.strategic.view"]', true, false, 'demo_governed'),
  ('demo_advisor', 'AI Advisor Demo', 'advisor', '["advisor.chat.primary","advisor.summary"]', true, true, 'demo_governed'),
  ('demo_business_crm', 'Business CRM Demo', 'business', '["business.pipeline","business.contacts","business.revenue"]', true, true, 'demo_governed'),
  ('demo_investment', 'Investment Demo', 'investment', '["investment.portfolio","investment.analysis"]', true, false, 'demo_governed'),
  ('demo_money', 'Money Demo', 'money', '["money.accounts","money.transactions"]', true, false, 'demo_governed'),
  ('demo_workspace', 'Workspace Demo', 'workspace', '["workspace.projects","workspace.tasks"]', true, true, 'demo_governed'),
  ('demo_connectors', 'Connectors Demo', 'connectors', '["connector.registry","connector.health"]', true, false, 'demo_governed'),
  ('demo_files', 'Files Demo', 'files', '["files.list","files.preview"]', true, false, 'demo_governed'),
  ('demo_approvals', 'Approvals Demo', 'approvals', '["approvals.queue","approvals.review"]', true, true, 'demo_governed'),
  ('demo_pulse', 'Daily Pulse Demo', 'pulse', '["pulse.morning","pulse.summary"]', true, false, 'demo_governed');

INSERT INTO public.demo_scenario_packs (scenario_pack_key, display_name, description, theme_family, surface_classes, enabled_demo_providers, default_for_demo_mode) VALUES
  ('founder_operator_demo', 'Founder/Operator Life', 'A day in the life of a tech founder managing business, investments, and personal finances', 'founder', '["user_app","admin_os"]', '["demo_boardroom","demo_advisor","demo_business_crm","demo_investment","demo_money","demo_approvals","demo_pulse"]', true),
  ('family_office_demo', 'Family Office', 'Multi-entity wealth management with household operations and generational planning', 'wealth', '["user_app"]', '["demo_boardroom","demo_investment","demo_money","demo_advisor"]', false),
  ('business_growth_demo', 'Business Growth', 'SaaS founder scaling revenue with CRM, pipeline management, and operational intelligence', 'business', '["user_app"]', '["demo_business_crm","demo_advisor","demo_workspace","demo_connectors"]', false),
  ('connected_services_demo', 'Connected Services', 'Integration ecosystem showcase with external services and data sources', 'integration', '["user_app","admin_os"]', '["demo_connectors","demo_workspace","demo_advisor"]', false),
  ('admin_operator_demo', 'Admin Operator', 'System operator walkthrough of internal control plane and governance', 'operations', '["admin_os"]', '["demo_advisor","demo_connectors"]', false);

-- ── 20260406173332_9d86afaa-d7ed-4081-945b-3cf76a8808c4.sql ──
-- Fix views to use SECURITY INVOKER
ALTER VIEW public.v_reality_mode_surface_summary SET (security_invoker = on);
ALTER VIEW public.v_demo_provider_summary SET (security_invoker = on);
ALTER VIEW public.v_provider_activation_summary SET (security_invoker = on);
ALTER VIEW public.v_mode_resolution_recent SET (security_invoker = on);
ALTER VIEW public.v_launch_honesty_by_surface SET (security_invoker = on);

-- Tighten resolution log INSERT policy
DROP POLICY IF EXISTS "auth_insert_rmrl" ON public.reality_mode_resolution_log;
CREATE POLICY "auth_insert_rmrl" ON public.reality_mode_resolution_log
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ── 20260406174602_8d16f8f0-d100-40c8-8b98-a0610452a29c.sql ──
-- ═══════════════════════════════════════════════════════════════
-- Seed route_surface_registry (25 routes)
-- ═══════════════════════════════════════════════════════════════
INSERT INTO route_surface_registry (route_key, route_path, surface_class_id, shell_key, domain_family, capability_family, launch_stage, is_active) VALUES
('admin.runtime_truth', '/admin/runtime', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'admin_shell', 'system', 'observability', 'live', true),
('admin.ai_governance', '/admin/ai-governance', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'admin_shell', 'ai', 'ai_governance', 'live', true),
('admin.ai_team', '/admin/ai-team', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'admin_shell', 'ai', 'ai_workforce', 'live', true),
('admin.connectors', '/admin/connectors', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'admin_shell', 'connectors', 'connector_management', 'live', true),
('admin.providers', '/admin/providers', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'admin_shell', 'system', 'provider_management', 'live', true),
('admin.launch_truth', '/admin/launch-truth', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'admin_shell', 'system', 'launch_governance', 'live', true),
('admin.demo_governance', '/admin/demo-governance', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'admin_shell', 'system', 'demo_governance', 'live', true),
('admin.budgets', '/admin/budgets', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'admin_shell', 'ai', 'budget_management', 'live', true),
('admin.system', '/admin/system', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'admin_shell', 'system', 'system_config', 'live', true),
('admin.remediation', '/admin/remediation', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'admin_shell', 'system', 'remediation', 'live', true),
('app.dashboard', '/app/dashboard', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'owner', 'daily_pulse', 'live', true),
('app.assistant', '/app/assistant', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'advisor', 'ai_assistant', 'live', true),
('app.files', '/app/files', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'files', 'file_management', 'live', true),
('app.boardroom', '/app/boardroom', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'boardroom', 'boardroom_view', 'live', true),
('app.approvals', '/app/approvals', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'approvals', 'approval_workflow', 'live', true),
('app.business', '/app/business', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'business', 'business_ops', 'live', true),
('app.money', '/app/money', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'money', 'finance_overview', 'live', true),
('app.workspace', '/app/workspace', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'workspace', 'workspace_management', 'live', true),
('app.connected_services', '/app/connected-services', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'connectors', 'service_connections', 'live', true),
('app.settings', '/app/settings', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'owner', 'user_settings', 'live', true),
('app.pulse', '/app/pulse', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'pulse', 'daily_pulse', 'live', true),
('app.investment', '/app/investment', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'user_app_shell', 'investment', 'portfolio_view', 'live', true),
('mobile.home', '/mobile', '57a362a2-f1c9-42c3-b1d3-4af2a0715302', 'mobile_shell', 'owner', 'mobile_home', 'live', true),
('mobile.approvals', '/mobile/approvals', '57a362a2-f1c9-42c3-b1d3-4af2a0715302', 'mobile_shell', 'approvals', 'approval_workflow', 'live', true),
('mobile.alerts', '/mobile/alerts', '57a362a2-f1c9-42c3-b1d3-4af2a0715302', 'mobile_shell', 'alerts', 'alert_system', 'live', true);

-- ═══════════════════════════════════════════════════════════════
-- Seed capability_reality_bindings (20 bindings) — allowed_modes as jsonb
-- ═══════════════════════════════════════════════════════════════
INSERT INTO capability_reality_bindings (capability_key, surface_class_id, preferred_mode_key, allowed_modes, requires_real_provider, allows_demo_provider, allows_internal_test_provider, side_effect_policy_key, launch_honesty_class) VALUES
('boardroom.weekly.summary', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo","internal_test"]'::jsonb, false, true, true, 'read_only', 'qualified'),
('boardroom.strategic.view', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'read_only', 'qualified'),
('advisor.chat.primary', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo","internal_test"]'::jsonb, false, true, true, 'simulated_actions', 'demo_governed'),
('advisor.summary', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'read_only', 'demo_governed'),
('business.pipeline', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'read_only', 'qualified'),
('business.contacts', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'simulated_actions', 'qualified'),
('investment.portfolio', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'read_only', 'demo_governed'),
('money.accounts', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'read_only', 'qualified'),
('money.transactions', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'read_only', 'qualified'),
('workspace.projects', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo","internal_test"]'::jsonb, false, true, true, 'simulated_actions', 'qualified'),
('workspace.tasks', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo","internal_test"]'::jsonb, false, true, true, 'simulated_actions', 'qualified'),
('connector.registry', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'read_only', 'qualified'),
('approvals.queue', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'simulated_actions', 'qualified'),
('approvals.review', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'real_writes_required', 'qualified'),
('pulse.morning', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'read_only', 'demo_governed'),
('files.list', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'read_only', 'truthful'),
('files.preview', '4e67a6ea-74ef-48ab-baa9-d77590d11510', 'real', '["real","demo"]'::jsonb, false, true, false, 'read_only', 'truthful'),
('admin.truth_dashboard', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'real', '["real","internal_test"]'::jsonb, true, false, true, 'read_only', 'truthful'),
('admin.ai_governance', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'real', '["real","internal_test"]'::jsonb, true, false, true, 'read_only', 'truthful'),
('admin.demo_governance', 'af96b5a4-cc99-4db0-a8af-925f2b0f9f93', 'real', '["real","internal_test"]'::jsonb, true, false, true, 'read_only', 'internal_only');

-- ═══════════════════════════════════════════════════════════════
-- Seed launch_honesty_surface_bindings (20 bindings)
-- ═══════════════════════════════════════════════════════════════
INSERT INTO launch_honesty_surface_bindings (binding_type, binding_key, launch_honesty_class, public_claim_allowed, qualifier_required, notes) VALUES
('route', 'app.dashboard', 'qualified', true, true, 'Dashboard real when connectors active; demo-backed otherwise'),
('route', 'app.files', 'truthful', true, false, 'File system fully real via Supabase storage'),
('route', 'app.boardroom', 'demo_governed', true, true, 'Boardroom uses demo data until real connectors'),
('route', 'app.assistant', 'demo_governed', true, true, 'AI advisor requires live API key for real mode'),
('route', 'app.approvals', 'qualified', true, true, 'Approval engine real; data sources may be demo'),
('route', 'app.business', 'qualified', true, true, 'Business CRM demo-backed until connector integration'),
('route', 'app.money', 'demo_governed', true, true, 'Financial data requires banking connector'),
('route', 'app.investment', 'demo_governed', true, true, 'Investment data requires brokerage connector'),
('route', 'app.workspace', 'qualified', true, false, 'Workspace management fully functional'),
('route', 'app.connected_services', 'qualified', true, true, 'Shows real connector status + demo stubs'),
('route', 'app.pulse', 'demo_governed', true, true, 'Pulse aggregates from multiple sources'),
('route', 'app.settings', 'truthful', true, false, 'Settings fully real'),
('route', 'admin.runtime_truth', 'truthful', false, false, 'Admin truth dashboard always real'),
('route', 'admin.ai_governance', 'truthful', false, false, 'AI governance always real'),
('route', 'admin.demo_governance', 'internal_only', false, false, 'Demo governance is internal-only'),
('route', 'mobile.home', 'qualified', true, true, 'Mobile home mirrors app.dashboard honesty'),
('route', 'mobile.approvals', 'qualified', true, true, 'Mobile approvals mirrors app.approvals'),
('capability', 'advisor.chat.primary', 'demo_governed', true, true, 'AI chat demo until provider key configured'),
('capability', 'boardroom.weekly.summary', 'demo_governed', true, true, 'Boardroom summary demo until data sources real'),
('capability', 'files.list', 'truthful', true, false, 'File listing fully real');

-- ═══════════════════════════════════════════════════════════════
-- Seed demo_interaction_policies (20 policies)
-- ═══════════════════════════════════════════════════════════════
INSERT INTO demo_interaction_policies (demo_provider_id, interaction_key, interaction_behavior, user_visible_label, side_effect_policy_key) VALUES
('2af53311-88c4-4efc-beb9-bf2b8f59f69d', 'view_summary', 'simulate', 'View Summary', 'read_only'),
('2af53311-88c4-4efc-beb9-bf2b8f59f69d', 'generate_report', 'preview_only', 'Generate Report', 'simulated_actions'),
('9dcd24ab-7b35-4194-a38d-9869d249a72e', 'send_message', 'simulate', 'Ask Advisor', 'simulated_actions'),
('9dcd24ab-7b35-4194-a38d-9869d249a72e', 'view_history', 'simulate', 'View History', 'read_only'),
('e8b1a53d-e78a-45af-a24b-cf7aedc8166e', 'view_pipeline', 'simulate', 'View Pipeline', 'read_only'),
('e8b1a53d-e78a-45af-a24b-cf7aedc8166e', 'create_contact', 'preview_only', 'Add Contact', 'simulated_actions'),
('e8b1a53d-e78a-45af-a24b-cf7aedc8166e', 'send_proposal', 'blocked', 'Send Proposal', 'real_writes_required'),
('b4ad37e2-8654-4c60-b7ea-5a1e3ae89bff', 'view_portfolio', 'simulate', 'View Portfolio', 'read_only'),
('b4ad37e2-8654-4c60-b7ea-5a1e3ae89bff', 'execute_trade', 'blocked', 'Execute Trade', 'real_writes_required'),
('8d4c96a3-aec6-419e-8881-a64f7533c229', 'view_accounts', 'simulate', 'View Accounts', 'read_only'),
('8d4c96a3-aec6-419e-8881-a64f7533c229', 'initiate_transfer', 'blocked', 'Transfer', 'real_writes_required'),
('42ecea5e-92b4-49a0-bea1-b289e1eb3db9', 'view_projects', 'simulate', 'View Projects', 'read_only'),
('42ecea5e-92b4-49a0-bea1-b289e1eb3db9', 'create_task', 'safe_internal_write', 'Create Task', 'demo_store_allowed'),
('f910bd0c-8bec-414a-b60a-fde77ac9c2f7', 'view_connections', 'simulate', 'View Connections', 'read_only'),
('f910bd0c-8bec-414a-b60a-fde77ac9c2f7', 'connect_service', 'preview_only', 'Connect Service', 'simulated_actions'),
('0de3f2cd-6941-4b9b-bb3f-7886e04e5456', 'list_files', 'simulate', 'List Files', 'read_only'),
('0de3f2cd-6941-4b9b-bb3f-7886e04e5456', 'upload_file', 'preview_only', 'Upload File', 'simulated_actions'),
('bd56248d-e21e-48c5-a8c0-dd7d5ee2c83e', 'view_queue', 'simulate', 'View Queue', 'read_only'),
('bd56248d-e21e-48c5-a8c0-dd7d5ee2c83e', 'approve_action', 'preview_only', 'Approve', 'simulated_actions'),
('0d76d15e-32f5-4e56-9413-3742b6388988', 'view_pulse', 'simulate', 'View Pulse', 'read_only');

-- ── 20260406194807_a56fe23c-fb03-4222-b181-21cef7c8c713.sql ──
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Workspace Documents + Calendar Events Tables
-- ═══════════════════════════════════════════════════════════════

-- Documents table (covers docs, sheets, slides/decks)
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled',
  document_type TEXT NOT NULL DEFAULT 'document' CHECK (document_type IN ('document','proposal','report','boardroom-packet','note','sheet','slide','deck')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','approved','published','archived','ready','presented')),
  author TEXT DEFAULT 'You',
  content TEXT DEFAULT '',
  privacy TEXT DEFAULT 'personal' CHECK (privacy IN ('personal','team','client','public','restricted')),
  governed BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  version INTEGER DEFAULT 1,
  linked_entity TEXT,
  linked_workflow TEXT,
  linked_domain TEXT,
  columns_config JSONB DEFAULT '[]',
  data_rows JSONB DEFAULT '[]',
  formulas JSONB DEFAULT '{}',
  slides JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_documents_user_type ON public.documents (user_id, document_type);

-- Calendar Events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TEXT,
  end_time TEXT,
  domain TEXT DEFAULT 'personal' CHECK (domain IN ('personal','business','household','finance')),
  event_type TEXT DEFAULT 'task' CHECK (event_type IN ('meeting','task','reminder','appointment','deadline','travel')),
  location TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  overlap_warning BOOLEAN DEFAULT false,
  recurrence TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calendar events" ON public.calendar_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own calendar events" ON public.calendar_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own calendar events" ON public.calendar_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own calendar events" ON public.calendar_events FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_calendar_events_user_date ON public.calendar_events (user_id, event_date);

-- ── 20260406201726_2b26dc96-5b97-4776-bc50-3dd12732721e.sql ──
-- ═══════════════════════════════════════════════════════
-- SITA OS — Behavioral Truth Verification System Tables
-- ═══════════════════════════════════════════════════════

-- Surface Inventory: every route, button, form, action
CREATE TABLE public.verification_surfaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  route_key TEXT NOT NULL,
  route_path TEXT NOT NULL,
  shell TEXT NOT NULL DEFAULT 'user',
  surface_class TEXT NOT NULL DEFAULT 'page',
  domain TEXT,
  component_name TEXT,
  action_type TEXT NOT NULL DEFAULT 'navigation',
  action_label TEXT,
  action_selector TEXT,
  expected_result TEXT,
  backend_dependency TEXT,
  supported_modes TEXT[] NOT NULL DEFAULT '{real,demo}',
  launch_honesty_class TEXT NOT NULL DEFAULT 'real',
  test_priority TEXT NOT NULL DEFAULT 'P2',
  owner TEXT,
  verification_status TEXT NOT NULL DEFAULT 'untested',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_surfaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own surfaces" ON public.verification_surfaces FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_vs_route ON public.verification_surfaces(route_key);
CREATE INDEX idx_vs_priority ON public.verification_surfaces(test_priority);
CREATE INDEX idx_vs_status ON public.verification_surfaces(verification_status);

CREATE TRIGGER update_verification_surfaces_updated_at BEFORE UPDATE ON public.verification_surfaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Verification Runs: each test execution
CREATE TABLE public.verification_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  surface_id UUID REFERENCES public.verification_surfaces(id) ON DELETE CASCADE,
  run_type TEXT NOT NULL DEFAULT 'manual',
  mode TEXT NOT NULL DEFAULT 'real',
  environment TEXT NOT NULL DEFAULT 'preview',
  passed BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  duration_ms INTEGER,
  evidence_refs JSONB DEFAULT '[]'::jsonb,
  launched_by TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own runs" ON public.verification_runs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_vr_surface ON public.verification_runs(surface_id);
CREATE INDEX idx_vr_passed ON public.verification_runs(passed);
CREATE INDEX idx_vr_created ON public.verification_runs(created_at DESC);

-- Verification Evidence: screenshots, logs, traces
CREATE TABLE public.verification_evidence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  run_id UUID REFERENCES public.verification_runs(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL DEFAULT 'log',
  content TEXT,
  file_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own evidence" ON public.verification_evidence FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_ve_run ON public.verification_evidence(run_id);

-- Verification Blockers: launch blockers from failures
CREATE TABLE public.verification_blockers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  surface_id UUID REFERENCES public.verification_surfaces(id) ON DELETE CASCADE,
  blocker_type TEXT NOT NULL DEFAULT 'functional',
  severity TEXT NOT NULL DEFAULT 'high',
  description TEXT NOT NULL,
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.verification_blockers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own blockers" ON public.verification_blockers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_vb_surface ON public.verification_blockers(surface_id);
CREATE INDEX idx_vb_resolved ON public.verification_blockers(resolved);

CREATE TRIGGER update_verification_blockers_updated_at BEFORE UPDATE ON public.verification_blockers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260406202512_d947b01f-9617-4142-a9e9-1b78e07f22a3.sql ──
-- Customer Journey Proof System

-- Journey status enum
DO $$ BEGIN
  CREATE TYPE public.journey_status AS ENUM ('working','partial','demo_governed','degraded_usable','broken','planned','internal_only');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Launch impact enum
DO $$ BEGIN
  CREATE TYPE public.journey_launch_impact AS ENUM ('launch_blocker','pilot_blocker','claim_risk','important_non_blocker','non_blocking');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Proof confidence enum
DO $$ BEGIN
  CREATE TYPE public.journey_proof_confidence AS ENUM ('verified_e2e','verified_interaction','verified_component_only','manually_confirmed','unverified');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1. customer_journeys — full journey inventory
CREATE TABLE public.customer_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  journey_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  persona TEXT NOT NULL DEFAULT 'user',
  domain TEXT NOT NULL DEFAULT 'core',
  route_family TEXT,
  primary_modes TEXT[] DEFAULT '{"real","demo"}',
  steps JSONB DEFAULT '[]',
  expected_outcome TEXT,
  launch_importance TEXT DEFAULT 'important_non_blocker',
  dependencies TEXT[] DEFAULT '{}',
  owner TEXT,
  current_status TEXT DEFAULT 'unverified',
  last_verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, journey_key)
);

ALTER TABLE public.customer_journeys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journeys" ON public.customer_journeys FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_customer_journeys_updated_at BEFORE UPDATE ON public.customer_journeys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. customer_journey_runs — execution records
CREATE TABLE public.customer_journey_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  journey_id UUID REFERENCES public.customer_journeys(id) ON DELETE CASCADE,
  journey_key TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'real',
  status TEXT NOT NULL DEFAULT 'working',
  launch_impact TEXT DEFAULT 'non_blocking',
  proof_confidence TEXT DEFAULT 'unverified',
  steps_passed INT DEFAULT 0,
  steps_failed INT DEFAULT 0,
  steps_total INT DEFAULT 0,
  expected_outcome TEXT,
  actual_outcome TEXT,
  degraded_reason TEXT,
  demo_governed BOOLEAN DEFAULT false,
  provider_source_type TEXT,
  evidence_refs JSONB DEFAULT '[]',
  recommended_fix TEXT,
  root_cause_layer TEXT,
  severity TEXT DEFAULT 'medium',
  owner TEXT,
  notes TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_journey_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journey runs" ON public.customer_journey_runs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. customer_journey_steps — individual step records
CREATE TABLE public.customer_journey_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  run_id UUID REFERENCES public.customer_journey_runs(id) ON DELETE CASCADE,
  step_order INT NOT NULL DEFAULT 0,
  step_name TEXT NOT NULL,
  expected_behavior TEXT,
  actual_behavior TEXT,
  result TEXT DEFAULT 'pending',
  evidence_ref TEXT,
  root_cause TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_journey_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journey steps" ON public.customer_journey_steps FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. customer_journey_blockers — launch blockers from failures
CREATE TABLE public.customer_journey_blockers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  journey_key TEXT NOT NULL,
  run_id UUID REFERENCES public.customer_journey_runs(id) ON DELETE SET NULL,
  blocker_type TEXT NOT NULL DEFAULT 'launch_blocker',
  severity TEXT DEFAULT 'high',
  summary TEXT,
  recommended_fix TEXT,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.customer_journey_blockers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journey blockers" ON public.customer_journey_blockers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_customer_journey_blockers_updated_at BEFORE UPDATE ON public.customer_journey_blockers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_cj_user_key ON public.customer_journeys(user_id, journey_key);
CREATE INDEX idx_cjr_journey ON public.customer_journey_runs(journey_id);
CREATE INDEX idx_cjr_user ON public.customer_journey_runs(user_id);
CREATE INDEX idx_cjs_run ON public.customer_journey_steps(run_id);
CREATE INDEX idx_cjb_user ON public.customer_journey_blockers(user_id, resolved);

-- ── 20260406204306_43ed2114-e076-4c18-a74d-6795d69854c8.sql ──
-- Financial Accounts table
CREATE TABLE public.financial_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  institution TEXT,
  account_type TEXT NOT NULL DEFAULT 'checking',
  balance NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  trend NUMERIC DEFAULT 0,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own financial accounts"
  ON public.financial_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own financial accounts"
  ON public.financial_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial accounts"
  ON public.financial_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial accounts"
  ON public.financial_accounts FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_financial_accounts_updated_at
  BEFORE UPDATE ON public.financial_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Money Policies table
CREATE TABLE public.money_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  enabled BOOLEAN NOT NULL DEFAULT true,
  threshold NUMERIC,
  icon_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.money_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own money policies"
  ON public.money_policies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own money policies"
  ON public.money_policies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own money policies"
  ON public.money_policies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own money policies"
  ON public.money_policies FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_money_policies_updated_at
  BEFORE UPDATE ON public.money_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260406213620_f97d96ac-3a00-4f84-8a8d-7b801d3a6405.sql ──
-- ═══════════════════════════════════════════════════════
-- Customer Journey Proof System — 6 New Tables
-- ═══════════════════════════════════════════════════════

-- 1. ui_action_inventory
CREATE TABLE public.ui_action_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  route_key TEXT NOT NULL,
  surface_class TEXT NOT NULL DEFAULT 'user_app',
  component_name TEXT,
  action_key TEXT NOT NULL,
  action_label TEXT,
  action_type TEXT NOT NULL DEFAULT 'click',
  selector_hint TEXT,
  test_id TEXT,
  expected_outcome TEXT,
  supported_modes JSONB NOT NULL DEFAULT '[]'::jsonb,
  priority_class TEXT NOT NULL DEFAULT 'p2',
  launch_honesty_class TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, route_key, action_key)
);

ALTER TABLE public.ui_action_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own action inventory"
  ON public.ui_action_inventory FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_ui_action_inventory_updated_at
  BEFORE UPDATE ON public.ui_action_inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. journey_step_results
CREATE TABLE public.journey_step_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  verification_run_id UUID NOT NULL,
  journey_step_id UUID,
  step_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'skipped',
  actual_behavior TEXT,
  error_summary TEXT,
  screenshot_ref TEXT,
  trace_ref TEXT,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_journey_step_results_run ON public.journey_step_results (verification_run_id);
CREATE INDEX idx_journey_step_results_step ON public.journey_step_results (journey_step_id);

ALTER TABLE public.journey_step_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own step results"
  ON public.journey_step_results FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. launch_blocker_scores
CREATE TABLE public.launch_blocker_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  journey_key TEXT,
  verification_run_id UUID,
  blocker_type TEXT NOT NULL DEFAULT 'non_blocking',
  severity_score INTEGER NOT NULL DEFAULT 0,
  reason_summary TEXT NOT NULL DEFAULT '',
  affects_demo BOOLEAN NOT NULL DEFAULT false,
  affects_real BOOLEAN NOT NULL DEFAULT false,
  affects_admin BOOLEAN NOT NULL DEFAULT false,
  affects_user BOOLEAN NOT NULL DEFAULT true,
  resolved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_launch_blocker_scores_journey ON public.launch_blocker_scores (journey_key);
CREATE INDEX idx_launch_blocker_scores_type ON public.launch_blocker_scores (blocker_type);

ALTER TABLE public.launch_blocker_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own blocker scores"
  ON public.launch_blocker_scores FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. customer_journey_mode_comparisons
CREATE TABLE public.customer_journey_mode_comparisons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  journey_key TEXT NOT NULL,
  real_status TEXT,
  demo_status TEXT,
  internal_test_status TEXT,
  comparison_summary TEXT,
  claim_risk BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, journey_key)
);

ALTER TABLE public.customer_journey_mode_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own mode comparisons"
  ON public.customer_journey_mode_comparisons FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_cj_mode_comparisons_updated_at
  BEFORE UPDATE ON public.customer_journey_mode_comparisons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. verification_evidence_assets
CREATE TABLE public.verification_evidence_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  verification_run_id UUID NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'screenshot',
  asset_ref TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_verification_evidence_assets_run ON public.verification_evidence_assets (verification_run_id);

ALTER TABLE public.verification_evidence_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own evidence assets"
  ON public.verification_evidence_assets FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. route_verification_coverage
CREATE TABLE public.route_verification_coverage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  route_key TEXT NOT NULL,
  surface_class TEXT NOT NULL DEFAULT 'user_app',
  total_actions INTEGER NOT NULL DEFAULT 0,
  verified_actions INTEGER NOT NULL DEFAULT 0,
  p0_actions INTEGER NOT NULL DEFAULT 0,
  p0_verified_actions INTEGER NOT NULL DEFAULT 0,
  p1_actions INTEGER NOT NULL DEFAULT 0,
  p1_verified_actions INTEGER NOT NULL DEFAULT 0,
  last_verified_at TIMESTAMPTZ,
  coverage_percent NUMERIC(5,2) DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, route_key)
);

ALTER TABLE public.route_verification_coverage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own route coverage"
  ON public.route_verification_coverage FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_route_verification_coverage_updated_at
  BEFORE UPDATE ON public.route_verification_coverage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260406214712_f226c21a-9946-46ba-8cf8-a816d6a7a1b8.sql ──
-- 1. customer_journey_registry
CREATE TABLE public.customer_journey_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  persona text NOT NULL,
  surface_class text NOT NULL,
  domain_family text NOT NULL,
  route_key text NULL,
  priority_class text NOT NULL DEFAULT 'p1',
  launch_importance text NOT NULL DEFAULT 'important',
  expected_outcome text NOT NULL,
  supported_modes jsonb NOT NULL DEFAULT '[]'::jsonb,
  launch_honesty_class text NULL,
  owner_team text NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cjr_priority ON public.customer_journey_registry(priority_class);
CREATE INDEX idx_cjr_importance ON public.customer_journey_registry(launch_importance);
CREATE INDEX idx_cjr_surface ON public.customer_journey_registry(surface_class);
CREATE INDEX idx_cjr_domain ON public.customer_journey_registry(domain_family);
ALTER TABLE public.customer_journey_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read registry" ON public.customer_journey_registry FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert registry" ON public.customer_journey_registry FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update registry" ON public.customer_journey_registry FOR UPDATE TO authenticated USING (true);
CREATE POLICY "auth delete registry" ON public.customer_journey_registry FOR DELETE TO authenticated USING (true);
CREATE TRIGGER update_cjr_updated_at BEFORE UPDATE ON public.customer_journey_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. journey_verification_runs
CREATE TABLE public.journey_verification_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid NOT NULL REFERENCES public.customer_journey_registry(id) ON DELETE CASCADE,
  mode text NOT NULL,
  environment text NOT NULL,
  verification_type text NOT NULL,
  status text NOT NULL,
  proof_confidence text NOT NULL,
  steps_passed integer NOT NULL DEFAULT 0,
  steps_failed integer NOT NULL DEFAULT 0,
  steps_skipped integer NOT NULL DEFAULT 0,
  launch_impact text NULL,
  summary text NULL,
  evidence_bundle_ref text NULL,
  run_identifier text NULL,
  commit_sha text NULL,
  branch_name text NULL,
  started_at timestamptz NULL,
  completed_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_jvr_journey ON public.journey_verification_runs(journey_id);
CREATE INDEX idx_jvr_mode ON public.journey_verification_runs(mode);
CREATE INDEX idx_jvr_env ON public.journey_verification_runs(environment);
CREATE INDEX idx_jvr_status ON public.journey_verification_runs(status);
CREATE INDEX idx_jvr_created ON public.journey_verification_runs(created_at DESC);
ALTER TABLE public.journey_verification_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read runs" ON public.journey_verification_runs FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert runs" ON public.journey_verification_runs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update runs" ON public.journey_verification_runs FOR UPDATE TO authenticated USING (true);

-- 3. customer_journey_status
CREATE TABLE public.customer_journey_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journey_id uuid UNIQUE NOT NULL REFERENCES public.customer_journey_registry(id) ON DELETE CASCADE,
  current_status text NOT NULL DEFAULT 'unverified',
  last_verified_run_id uuid NULL REFERENCES public.journey_verification_runs(id) ON DELETE SET NULL,
  last_verified_at timestamptz NULL,
  launch_impact text NULL,
  proof_confidence text NULL,
  actual_outcome_summary text NULL,
  recommended_fix text NULL,
  owner_team text NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_cjs_status ON public.customer_journey_status(current_status);
CREATE INDEX idx_cjs_impact ON public.customer_journey_status(launch_impact);
ALTER TABLE public.customer_journey_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth read status" ON public.customer_journey_status FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth insert status" ON public.customer_journey_status FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth update status" ON public.customer_journey_status FOR UPDATE TO authenticated USING (true);
CREATE TRIGGER update_cjs_updated_at BEFORE UPDATE ON public.customer_journey_status FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. ALTER existing tables
ALTER TABLE public.ui_action_inventory ADD COLUMN IF NOT EXISTS owner_team text NULL;
ALTER TABLE public.verification_evidence_assets ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.launch_blocker_scores ADD COLUMN IF NOT EXISTS journey_id uuid NULL REFERENCES public.customer_journey_registry(id) ON DELETE SET NULL;

-- 5. Views

CREATE OR REPLACE VIEW public.v_customer_journey_summary AS
SELECT r.id AS registry_id, r.journey_key, r.display_name, r.persona, r.surface_class, r.domain_family,
  r.priority_class, r.launch_importance, r.expected_outcome, r.launch_honesty_class, r.owner_team, r.is_active,
  s.current_status, s.last_verified_at, s.launch_impact, s.proof_confidence, s.actual_outcome_summary, s.recommended_fix,
  v.status AS last_run_status, v.mode AS last_run_mode, v.environment AS last_run_environment,
  v.steps_passed AS last_run_steps_passed, v.steps_failed AS last_run_steps_failed, v.commit_sha AS last_run_commit_sha
FROM public.customer_journey_registry r
LEFT JOIN public.customer_journey_status s ON s.journey_id = r.id
LEFT JOIN public.journey_verification_runs v ON v.id = s.last_verified_run_id;

CREATE OR REPLACE VIEW public.v_customer_journey_blockers AS
SELECT b.id AS blocker_id, b.blocker_type, b.severity_score, b.reason_summary,
  b.affects_demo, b.affects_real, b.affects_admin, b.affects_user, b.resolved, b.created_at AS blocker_created_at, b.resolved_at,
  r.journey_key, r.display_name, r.domain_family, r.priority_class, r.launch_importance, r.owner_team
FROM public.launch_blocker_scores b
LEFT JOIN public.customer_journey_registry r ON r.id = b.journey_id
WHERE b.resolved = false;

CREATE OR REPLACE VIEW public.v_customer_journey_mode_deltas AS
SELECT mc.id AS comparison_id, mc.real_status, mc.demo_status, mc.comparison_summary, mc.claim_risk, mc.updated_at,
  r.journey_key, r.display_name, r.domain_family, r.persona, r.priority_class
FROM public.customer_journey_mode_comparisons mc
LEFT JOIN public.customer_journey_registry r ON r.journey_key = mc.journey_key;

CREATE OR REPLACE VIEW public.v_route_verification_summary AS
SELECT surface_class, COUNT(*) AS total_routes, SUM(total_actions) AS total_actions,
  SUM(verified_actions) AS total_verified_actions, SUM(p0_actions) AS total_p0_actions,
  SUM(p0_verified_actions) AS total_p0_verified,
  CASE WHEN SUM(total_actions) > 0 THEN ROUND((SUM(verified_actions)::numeric / SUM(total_actions)::numeric) * 100, 2) ELSE 0 END AS overall_coverage_percent,
  MAX(last_verified_at) AS latest_verification
FROM public.route_verification_coverage GROUP BY surface_class;

CREATE OR REPLACE VIEW public.v_customer_journey_recent_failures AS
SELECT v.id AS run_id, v.status, v.mode, v.environment, v.verification_type,
  v.steps_passed, v.steps_failed, v.steps_skipped, v.summary, v.commit_sha, v.branch_name,
  v.started_at, v.completed_at, v.created_at,
  r.journey_key, r.display_name, r.domain_family, r.priority_class, r.launch_importance
FROM public.journey_verification_runs v
JOIN public.customer_journey_registry r ON r.id = v.journey_id
WHERE v.status IN ('fail', 'partial', 'blocked')
ORDER BY v.created_at DESC LIMIT 100;

-- ── 20260406214819_ab3fb7d2-dac2-441d-8177-ec66808d0d00.sql ──
ALTER VIEW public.v_customer_journey_summary SET (security_invoker = true);
ALTER VIEW public.v_customer_journey_blockers SET (security_invoker = true);
ALTER VIEW public.v_customer_journey_mode_deltas SET (security_invoker = true);
ALTER VIEW public.v_route_verification_summary SET (security_invoker = true);
ALTER VIEW public.v_customer_journey_recent_failures SET (security_invoker = true);

-- ── 20260406224550_6dea7f8b-9d41-4686-a6d5-f73a0a8825d1.sql ──
-- ══════════════════════════════════════════════════════════════
-- Remediation Programs
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.remediation_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  program_key TEXT NOT NULL,
  title TEXT NOT NULL,
  focus_area TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'draft',
  linked_flagship_loop TEXT,
  open_items_count INTEGER NOT NULL DEFAULT 0,
  completed_items_count INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.remediation_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own remediation_programs" ON public.remediation_programs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_remediation_programs_updated_at BEFORE UPDATE ON public.remediation_programs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ══════════════════════════════════════════════════════════════
-- Outcome Verifications
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.outcome_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recommendation_id UUID REFERENCES public.ai_workforce_recommendations(id) ON DELETE SET NULL,
  execution_ref TEXT,
  expected_improvement TEXT,
  actual_improvement TEXT,
  journey_delta JSONB DEFAULT '{}'::jsonb,
  launch_truth_delta JSONB DEFAULT '{}'::jsonb,
  score_adjustment NUMERIC DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verifier_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.outcome_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own outcome_verifications" ON public.outcome_verifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════
-- Flagship Loops
-- ══════════════════════════════════════════════════════════════
CREATE TABLE public.flagship_loops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  loop_key TEXT NOT NULL,
  title TEXT NOT NULL,
  owner TEXT,
  target_persona TEXT,
  routes JSONB DEFAULT '[]'::jsonb,
  capabilities JSONB DEFAULT '[]'::jsonb,
  primary_services JSONB DEFAULT '[]'::jsonb,
  cj_entries JSONB DEFAULT '[]'::jsonb,
  launch_blockers JSONB DEFAULT '[]'::jsonb,
  proof_status TEXT NOT NULL DEFAULT 'unverified',
  ux_quality TEXT NOT NULL DEFAULT 'draft',
  launch_claim_status TEXT NOT NULL DEFAULT 'not_claimable',
  demo_vs_real TEXT NOT NULL DEFAULT 'demo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.flagship_loops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own flagship_loops" ON public.flagship_loops FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_flagship_loops_updated_at BEFORE UPDATE ON public.flagship_loops FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ══════════════════════════════════════════════════════════════
-- ALTER ai_workforce_recommendations
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.ai_workforce_recommendations
  ADD COLUMN IF NOT EXISTS execution_binding_status TEXT NOT NULL DEFAULT 'unbound',
  ADD COLUMN IF NOT EXISTS outcome_verification_id UUID REFERENCES public.outcome_verifications(id) ON DELETE SET NULL;

-- ── 20260406230924_53caeff0-7501-4573-8a86-ebf21404aa81.sql ──
-- ═══════════════════════════════════════════════════════════════
-- PART 1: Extend ai_workforce_recommendations
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.ai_workforce_recommendations
  ADD COLUMN IF NOT EXISTS lifecycle_status text NOT NULL DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS approval_decision_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by_user_id uuid,
  ADD COLUMN IF NOT EXISTS rejected_by_user_id uuid,
  ADD COLUMN IF NOT EXISTS deferred_reason text,
  ADD COLUMN IF NOT EXISTS execution_required boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS execution_priority text,
  ADD COLUMN IF NOT EXISTS flagship_loop_key text,
  ADD COLUMN IF NOT EXISTS customer_journey_impact_key text,
  ADD COLUMN IF NOT EXISTS launch_blocker_impact_class text,
  ADD COLUMN IF NOT EXISTS outcome_verification_required boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_awr_lifecycle_status ON public.ai_workforce_recommendations (lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_awr_execution_required ON public.ai_workforce_recommendations (execution_required);
CREATE INDEX IF NOT EXISTS idx_awr_flagship_loop_key ON public.ai_workforce_recommendations (flagship_loop_key);

-- ═══════════════════════════════════════════════════════════════
-- PART 2: Extend remediation_programs
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.remediation_programs
  ADD COLUMN IF NOT EXISTS display_name text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS owner_team text,
  ADD COLUMN IF NOT EXISTS owner_user_id uuid,
  ADD COLUMN IF NOT EXISTS start_at timestamptz,
  ADD COLUMN IF NOT EXISTS target_at timestamptz,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS launch_impact_class text;

-- ═══════════════════════════════════════════════════════════════
-- PART 3: Extend flagship_loops
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.flagship_loops
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS primary_persona text,
  ADD COLUMN IF NOT EXISTS launch_importance text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS owner_team text,
  ADD COLUMN IF NOT EXISTS ux_quality_target text,
  ADD COLUMN IF NOT EXISTS proof_required boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS launch_honesty_class text DEFAULT 'demo_only';

-- ═══════════════════════════════════════════════════════════════
-- PART 4: recommendation_execution_bindings
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.recommendation_execution_bindings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recommendation_id uuid NOT NULL REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE,
  approval_queue_item_id uuid,
  binding_type text NOT NULL,
  binding_status text NOT NULL DEFAULT 'bound',
  linked_program_id uuid,
  linked_task_id uuid,
  owner_team text,
  owner_user_id uuid,
  due_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recommendation_execution_bindings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own execution bindings"
  ON public.recommendation_execution_bindings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_reb_recommendation_id ON public.recommendation_execution_bindings (recommendation_id);
CREATE INDEX IF NOT EXISTS idx_reb_binding_status ON public.recommendation_execution_bindings (binding_status);
CREATE INDEX IF NOT EXISTS idx_reb_binding_type ON public.recommendation_execution_bindings (binding_type);
CREATE INDEX IF NOT EXISTS idx_reb_owner_team ON public.recommendation_execution_bindings (owner_team);

CREATE TRIGGER update_reb_updated_at BEFORE UPDATE ON public.recommendation_execution_bindings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- PART 5: remediation_tasks
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.remediation_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  program_id uuid REFERENCES public.remediation_programs(id) ON DELETE SET NULL,
  task_key text UNIQUE NOT NULL,
  display_name text NOT NULL,
  description text NOT NULL,
  task_status text NOT NULL DEFAULT 'new',
  execution_type text NOT NULL,
  owner_team text,
  owner_user_id uuid,
  related_route_key text,
  related_service_key text,
  related_customer_journey_key text,
  related_flagship_loop_key text,
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.remediation_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own remediation tasks"
  ON public.remediation_tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_rt_program_id ON public.remediation_tasks (program_id);
CREATE INDEX IF NOT EXISTS idx_rt_task_status ON public.remediation_tasks (task_status);
CREATE INDEX IF NOT EXISTS idx_rt_related_route ON public.remediation_tasks (related_route_key);
CREATE INDEX IF NOT EXISTS idx_rt_related_service ON public.remediation_tasks (related_service_key);
CREATE INDEX IF NOT EXISTS idx_rt_related_cj ON public.remediation_tasks (related_customer_journey_key);

CREATE TRIGGER update_rt_updated_at BEFORE UPDATE ON public.remediation_tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- PART 6: recommendation_execution_events
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.recommendation_execution_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  binding_id uuid NOT NULL REFERENCES public.recommendation_execution_bindings(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  summary text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}',
  created_by_user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recommendation_execution_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own execution events"
  ON public.recommendation_execution_events FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_ree_binding_id ON public.recommendation_execution_events (binding_id);
CREATE INDEX IF NOT EXISTS idx_ree_event_type ON public.recommendation_execution_events (event_type);

-- ═══════════════════════════════════════════════════════════════
-- PART 7: recommendation_outcome_verifications
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.recommendation_outcome_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recommendation_id uuid NOT NULL REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE,
  binding_id uuid REFERENCES public.recommendation_execution_bindings(id) ON DELETE SET NULL,
  verification_method text NOT NULL,
  expected_improvement text NOT NULL,
  actual_improvement text,
  verification_status text NOT NULL DEFAULT 'pending',
  customer_journey_delta text,
  launch_truth_delta text,
  notes text,
  verified_by_user_id uuid,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recommendation_outcome_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own outcome verifications"
  ON public.recommendation_outcome_verifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_rov_recommendation_id ON public.recommendation_outcome_verifications (recommendation_id);
CREATE INDEX IF NOT EXISTS idx_rov_verification_status ON public.recommendation_outcome_verifications (verification_status);

-- ═══════════════════════════════════════════════════════════════
-- PART 8: recommendation_learning_signals
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.recommendation_learning_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recommendation_id uuid NOT NULL REFERENCES public.ai_workforce_recommendations(id) ON DELETE CASCADE,
  signal_type text NOT NULL,
  signal_strength numeric(5,2) NOT NULL,
  signal_source text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recommendation_learning_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own learning signals"
  ON public.recommendation_learning_signals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_rls_recommendation_id ON public.recommendation_learning_signals (recommendation_id);
CREATE INDEX IF NOT EXISTS idx_rls_signal_type ON public.recommendation_learning_signals (signal_type);

-- ═══════════════════════════════════════════════════════════════
-- PART 9: Views
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.v_recommendation_closure_summary AS
SELECT
  r.id,
  r.user_id,
  r.title,
  r.recommendation_type,
  r.domain,
  r.severity,
  r.lifecycle_status,
  r.execution_required,
  r.execution_priority,
  r.flagship_loop_key,
  r.customer_journey_impact_key,
  r.launch_blocker_impact_class,
  r.outcome_verification_required,
  r.created_at,
  b.id AS binding_id,
  b.binding_type,
  b.binding_status,
  b.linked_program_id,
  b.owner_team AS binding_owner_team,
  ov.id AS verification_id,
  ov.verification_status,
  ov.verification_method,
  ov.actual_improvement
FROM public.ai_workforce_recommendations r
LEFT JOIN public.recommendation_execution_bindings b ON b.recommendation_id = r.id
LEFT JOIN public.recommendation_outcome_verifications ov ON ov.recommendation_id = r.id;

CREATE OR REPLACE VIEW public.v_remediation_program_summary AS
SELECT
  p.id,
  p.user_id,
  p.program_key,
  p.title,
  p.display_name,
  p.focus_area,
  p.status,
  p.linked_flagship_loop AS flagship_loop_key,
  p.owner_team,
  p.launch_impact_class,
  p.start_at,
  p.target_at,
  p.completed_at,
  COALESCE(p.open_items_count, 0) AS open_items,
  COALESCE(p.completed_items_count, 0) AS completed_items,
  (SELECT COUNT(*) FROM public.remediation_tasks t WHERE t.program_id = p.id) AS total_tasks,
  (SELECT COUNT(*) FROM public.remediation_tasks t WHERE t.program_id = p.id AND t.task_status = 'done') AS done_tasks
FROM public.remediation_programs p;

CREATE OR REPLACE VIEW public.v_recommendation_execution_pipeline AS
SELECT
  r.lifecycle_status,
  r.domain,
  r.recommendation_type,
  r.flagship_loop_key,
  COUNT(*) AS count,
  COUNT(*) FILTER (WHERE r.execution_required) AS execution_required_count,
  COUNT(*) FILTER (WHERE b.id IS NOT NULL) AS bound_count,
  COUNT(*) FILTER (WHERE ov.id IS NOT NULL) AS verified_count
FROM public.ai_workforce_recommendations r
LEFT JOIN public.recommendation_execution_bindings b ON b.recommendation_id = r.id
LEFT JOIN public.recommendation_outcome_verifications ov ON ov.recommendation_id = r.id
GROUP BY r.lifecycle_status, r.domain, r.recommendation_type, r.flagship_loop_key;

CREATE OR REPLACE VIEW public.v_outcome_verification_summary AS
SELECT
  ov.verification_status,
  ov.verification_method,
  r.domain,
  r.recommendation_type,
  r.flagship_loop_key,
  COUNT(*) AS count,
  COUNT(*) FILTER (WHERE ov.verification_status = 'verified_positive') AS positive_count,
  COUNT(*) FILTER (WHERE ov.verification_status = 'verified_negative') AS negative_count,
  COUNT(*) FILTER (WHERE ov.verification_status = 'verified_neutral') AS neutral_count
FROM public.recommendation_outcome_verifications ov
JOIN public.ai_workforce_recommendations r ON r.id = ov.recommendation_id
GROUP BY ov.verification_status, ov.verification_method, r.domain, r.recommendation_type, r.flagship_loop_key;

-- ── 20260406231023_77d59488-4037-4db5-a305-09aa092272dd.sql ──
ALTER VIEW public.v_recommendation_closure_summary SET (security_invoker = on);
ALTER VIEW public.v_remediation_program_summary SET (security_invoker = on);
ALTER VIEW public.v_recommendation_execution_pipeline SET (security_invoker = on);
ALTER VIEW public.v_outcome_verification_summary SET (security_invoker = on);

-- ── 20260406233246_1e3d41e6-214e-42e2-8e38-906b02633803.sql ──
-- Add truth score columns to flagship_loops table
ALTER TABLE public.flagship_loops
  ADD COLUMN IF NOT EXISTS truth_pct integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS structural_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS runtime_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS proof_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ux_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS next_actions text[] DEFAULT '{}';

-- ── 20260407001438_825651b3-7b3d-411b-9ba0-afbd14621884.sql ──
-- Add missing columns to communications if they don't exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='communications' AND column_name='channel') THEN
    ALTER TABLE communications ADD COLUMN channel text DEFAULT 'email';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='communications' AND column_name='direction') THEN
    ALTER TABLE communications ADD COLUMN direction text DEFAULT 'outbound';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='communications' AND column_name='preview') THEN
    ALTER TABLE communications ADD COLUMN preview text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='communications' AND column_name='contact_name') THEN
    ALTER TABLE communications ADD COLUMN contact_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='communications' AND column_name='domain') THEN
    ALTER TABLE communications ADD COLUMN domain text DEFAULT 'general';
  END IF;
END $$;

-- scenarios table
CREATE TABLE IF NOT EXISTS scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  category text DEFAULT 'general',
  parameters jsonb DEFAULT '{}',
  results jsonb DEFAULT '{}',
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own scenarios" ON scenarios
  FOR ALL TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_scenarios_updated_at
  BEFORE UPDATE ON scenarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260407012128_dd9851db-40f5-453a-96bf-e86adb818472.sql ──
-- Fix customer_journey_registry: admin-only write access
DROP POLICY IF EXISTS "auth insert registry" ON public.customer_journey_registry;
DROP POLICY IF EXISTS "auth update registry" ON public.customer_journey_registry;
DROP POLICY IF EXISTS "auth delete registry" ON public.customer_journey_registry;

CREATE POLICY "admin insert registry" ON public.customer_journey_registry
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin update registry" ON public.customer_journey_registry
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin delete registry" ON public.customer_journey_registry
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix customer_journey_status: admin-only write access
DROP POLICY IF EXISTS "auth insert status" ON public.customer_journey_status;
DROP POLICY IF EXISTS "auth update status" ON public.customer_journey_status;

CREATE POLICY "admin insert status" ON public.customer_journey_status
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin update status" ON public.customer_journey_status
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix journey_verification_runs: admin-only access
DROP POLICY IF EXISTS "auth insert runs" ON public.journey_verification_runs;
DROP POLICY IF EXISTS "auth read runs" ON public.journey_verification_runs;
DROP POLICY IF EXISTS "auth update runs" ON public.journey_verification_runs;

CREATE POLICY "admin read runs" ON public.journey_verification_runs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin insert runs" ON public.journey_verification_runs
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin update runs" ON public.journey_verification_runs
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix demo_scenario_entities: user-scoped read
DROP POLICY IF EXISTS "auth_read_dse" ON public.demo_scenario_entities;

CREATE POLICY "user_read_own_dse" ON public.demo_scenario_entities
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- ── 20260407132759_84b1a91b-bc84-4c10-80e1-ddf7597da16f.sql ──
-- Create public avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view avatars (public bucket)
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- ── 20260407134922_2f9bc036-06e3-46e3-8673-d253780c45b6.sql ──
-- Bulk reassign all public-schema RLS policies from 'public' role to 'authenticated' role.
-- This is a defense-in-depth hardening: the USING/WITH CHECK clauses are unchanged,
-- but unauthenticated callers are now rejected before RLS evaluation.

DO $$
DECLARE
  r RECORD;
  sql_drop TEXT;
  sql_create TEXT;
  using_clause TEXT;
  check_clause TEXT;
BEGIN
  FOR r IN
    SELECT policyname, schemaname, tablename, cmd, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'public'
      AND 'public' = ANY(roles)
    ORDER BY tablename, policyname
  LOOP
    -- Build USING clause
    IF r.qual IS NOT NULL THEN
      using_clause := ' USING (' || r.qual || ')';
    ELSE
      using_clause := '';
    END IF;

    -- Build WITH CHECK clause
    IF r.with_check IS NOT NULL THEN
      check_clause := ' WITH CHECK (' || r.with_check || ')';
    ELSE
      check_clause := '';
    END IF;

    -- Drop existing policy
    sql_drop := format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    EXECUTE sql_drop;

    -- Recreate with authenticated role
    sql_create := format('CREATE POLICY %I ON %I.%I FOR %s TO authenticated', r.policyname, r.schemaname, r.tablename, r.cmd)
      || using_clause
      || check_clause;
    EXECUTE sql_create;
  END LOOP;
END;
$$;

-- ── 20260407135639_b3f2d504-b783-4cc6-8abc-e18644a10612.sql ──
-- Fix documents bucket storage policies: public → authenticated
DROP POLICY IF EXISTS "Users view own documents" ON storage.objects;
CREATE POLICY "Users view own documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users upload own documents" ON storage.objects;
CREATE POLICY "Users upload own documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users update own documents" ON storage.objects;
CREATE POLICY "Users update own documents" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

DROP POLICY IF EXISTS "Users delete own documents" ON storage.objects;
CREATE POLICY "Users delete own documents" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'documents' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- ── 20260407142801_ad2e1d8d-d98f-415c-941d-aa257ffe2c7b.sql ──
-- 1. notes
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  content TEXT DEFAULT '',
  folder TEXT DEFAULT 'General',
  tags TEXT[] DEFAULT '{}',
  pinned BOOLEAN DEFAULT false,
  starred BOOLEAN DEFAULT false,
  color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notes" ON public.notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. media_items
CREATE TABLE public.media_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT 'file',
  mime_type TEXT,
  size_bytes BIGINT DEFAULT 0,
  url TEXT,
  storage_path TEXT,
  folder TEXT DEFAULT 'Uploads',
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own media" ON public.media_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_media_items_updated_at BEFORE UPDATE ON public.media_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. outcome_tracking
CREATE TABLE public.outcome_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metric TEXT NOT NULL DEFAULT 'custom',
  target_value NUMERIC DEFAULT 0,
  current_value NUMERIC DEFAULT 0,
  unit TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active',
  category TEXT DEFAULT 'general',
  interventions JSONB DEFAULT '[]',
  spillovers JSONB DEFAULT '[]',
  started_at TIMESTAMPTZ DEFAULT now(),
  target_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.outcome_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own outcomes" ON public.outcome_tracking FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_outcome_tracking_updated_at BEFORE UPDATE ON public.outcome_tracking FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. import_export_jobs
CREATE TABLE public.import_export_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_type TEXT NOT NULL DEFAULT 'import',
  file_name TEXT,
  file_size BIGINT DEFAULT 0,
  format TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  progress NUMERIC DEFAULT 0,
  records_processed INTEGER DEFAULT 0,
  records_total INTEGER DEFAULT 0,
  error_message TEXT,
  result_url TEXT,
  metadata JSONB DEFAULT '{}',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.import_export_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own jobs" ON public.import_export_jobs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_import_export_jobs_updated_at BEFORE UPDATE ON public.import_export_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. calling_contacts
CREATE TABLE public.calling_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  phone TEXT,
  email TEXT,
  value NUMERIC DEFAULT 0,
  priority TEXT DEFAULT 'medium',
  stage TEXT DEFAULT 'prospect',
  last_called_at TIMESTAMPTZ,
  next_call_at TIMESTAMPTZ,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.calling_contacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own calling contacts" ON public.calling_contacts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_calling_contacts_updated_at BEFORE UPDATE ON public.calling_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. call_logs
CREATE TABLE public.call_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id UUID REFERENCES public.calling_contacts(id) ON DELETE SET NULL,
  contact_name TEXT,
  duration_seconds INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  outcome TEXT,
  notes TEXT,
  revenue_impact NUMERIC DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own call logs" ON public.call_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_call_logs_updated_at BEFORE UPDATE ON public.call_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. pack_installs
CREATE TABLE public.pack_installs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  pack_id TEXT NOT NULL,
  pack_name TEXT,
  status TEXT NOT NULL DEFAULT 'installed',
  version TEXT DEFAULT '1.0.0',
  config JSONB DEFAULT '{}',
  installed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, pack_id)
);
ALTER TABLE public.pack_installs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pack installs" ON public.pack_installs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_pack_installs_updated_at BEFORE UPDATE ON public.pack_installs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260407150652_33c9d2e9-a301-41af-a514-0818b7be1058.sql ──
-- REVENUE OFFICE
CREATE TABLE public.pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL, position INTEGER NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#3B82F6', deal_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pipeline_stages" ON public.pipeline_stages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_pipeline_stages_ts BEFORE UPDATE ON public.pipeline_stages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL, campaign_type TEXT DEFAULT 'email',
  status TEXT DEFAULT 'draft', budget NUMERIC DEFAULT 0, spend NUMERIC DEFAULT 0,
  start_date DATE, end_date DATE, channel TEXT DEFAULT 'email', metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own campaigns" ON public.campaigns FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_campaigns_ts BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL, description TEXT, fields JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft', submission_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own forms" ON public.forms FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_forms_ts BEFORE UPDATE ON public.forms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.funnels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL, stages JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft', conversion_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own funnels" ON public.funnels FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_funnels_ts BEFORE UPDATE ON public.funnels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, title TEXT NOT NULL, description TEXT, price NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD', status TEXT DEFAULT 'active', valid_until DATE, metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own offers" ON public.offers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_offers_ts BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL, tier TEXT DEFAULT 'basic', price NUMERIC DEFAULT 0,
  interval TEXT DEFAULT 'monthly', status TEXT DEFAULT 'active', member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own memberships" ON public.memberships FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_memberships_ts BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.reputation_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, source TEXT DEFAULT 'manual', author TEXT, rating INTEGER DEFAULT 5,
  content TEXT, response TEXT, review_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reputation_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reputation_reviews" ON public.reputation_reviews FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_reputation_reviews_ts BEFORE UPDATE ON public.reputation_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.retention_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, customer_name TEXT NOT NULL, alert_type TEXT DEFAULT 'churn_risk',
  severity TEXT DEFAULT 'medium', risk_score NUMERIC DEFAULT 0, status TEXT DEFAULT 'open', notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.retention_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own retention_alerts" ON public.retention_alerts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_retention_alerts_ts BEFORE UPDATE ON public.retention_alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- INVESTMENT OFFICE
CREATE TABLE public.trade_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, symbol TEXT NOT NULL, side TEXT NOT NULL DEFAULT 'buy',
  quantity NUMERIC DEFAULT 0, price NUMERIC DEFAULT 0, status TEXT DEFAULT 'pending',
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trade_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trade_orders" ON public.trade_orders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_trade_orders_ts BEFORE UPDATE ON public.trade_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.market_watchlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, symbol TEXT NOT NULL, name TEXT NOT NULL,
  current_price NUMERIC DEFAULT 0, change_percent NUMERIC DEFAULT 0, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.market_watchlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own market_watchlist_items" ON public.market_watchlist_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_market_watchlist_items_ts BEFORE UPDATE ON public.market_watchlist_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.investment_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, title TEXT NOT NULL, thesis TEXT, decision_type TEXT DEFAULT 'buy',
  amount NUMERIC DEFAULT 0, status TEXT DEFAULT 'pending', confidence NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.investment_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own investment_decisions" ON public.investment_decisions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_investment_decisions_ts BEFORE UPDATE ON public.investment_decisions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.risk_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, title TEXT NOT NULL, description TEXT, probability NUMERIC DEFAULT 0,
  impact TEXT DEFAULT 'medium', mitigation TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.risk_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own risk_scenarios" ON public.risk_scenarios FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_risk_scenarios_ts BEFORE UPDATE ON public.risk_scenarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- DIGITAL PRESENCE
CREATE TABLE public.sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL, domain TEXT, status TEXT DEFAULT 'draft',
  template TEXT, published_at TIMESTAMPTZ, metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sites" ON public.sites FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_sites_ts BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.brand_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL, asset_type TEXT DEFAULT 'image',
  file_url TEXT, category TEXT, tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own brand_assets" ON public.brand_assets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_brand_assets_ts BEFORE UPDATE ON public.brand_assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.seo_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  url TEXT, score INTEGER DEFAULT 0, issues JSONB DEFAULT '[]', checked_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.seo_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own seo_reports" ON public.seo_reports FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_seo_reports_ts BEFORE UPDATE ON public.seo_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.ecommerce_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL, description TEXT, price NUMERIC DEFAULT 0,
  sku TEXT, stock INTEGER DEFAULT 0, status TEXT DEFAULT 'draft', images JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ecommerce_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ecommerce_products" ON public.ecommerce_products FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ecommerce_products_ts BEFORE UPDATE ON public.ecommerce_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CONCIERGE
CREATE TABLE public.travel_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, title TEXT NOT NULL, destination TEXT,
  start_date DATE, end_date DATE, budget NUMERIC DEFAULT 0, status TEXT DEFAULT 'planning', notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.travel_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own travel_plans" ON public.travel_plans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_travel_plans_ts BEFORE UPDATE ON public.travel_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.grocery_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL DEFAULT 'Shopping List', status TEXT DEFAULT 'active',
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own grocery_lists" ON public.grocery_lists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_grocery_lists_ts BEFORE UPDATE ON public.grocery_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.grocery_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, list_id UUID REFERENCES public.grocery_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL, quantity NUMERIC DEFAULT 1, unit TEXT DEFAULT 'pcs', category TEXT, checked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own grocery_items" ON public.grocery_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_grocery_items_ts BEFORE UPDATE ON public.grocery_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.service_providers_list (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL, category TEXT, phone TEXT, email TEXT,
  rating INTEGER DEFAULT 0, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.service_providers_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own service_providers_list" ON public.service_providers_list FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_service_providers_list_ts BEFORE UPDATE ON public.service_providers_list FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.school_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, child_name TEXT NOT NULL, activity TEXT NOT NULL,
  day_of_week TEXT, activity_time TEXT, location TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.school_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own school_activities" ON public.school_activities FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_school_activities_ts BEFORE UPDATE ON public.school_activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.gift_tracker (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, recipient TEXT NOT NULL, occasion TEXT, gift_idea TEXT,
  budget NUMERIC DEFAULT 0, status TEXT DEFAULT 'idea', target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gift_tracker ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own gift_tracker" ON public.gift_tracker FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_gift_tracker_ts BEFORE UPDATE ON public.gift_tracker FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, title TEXT NOT NULL, provider TEXT,
  appointment_date TIMESTAMPTZ NOT NULL, duration_minutes INTEGER DEFAULT 30,
  location TEXT, status TEXT DEFAULT 'scheduled', notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own appointments" ON public.appointments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_appointments_ts BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MONEY
CREATE TABLE public.tax_estimates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, tax_year INTEGER NOT NULL, category TEXT DEFAULT 'income',
  estimated_amount NUMERIC DEFAULT 0, paid_amount NUMERIC DEFAULT 0, due_date DATE,
  status TEXT DEFAULT 'estimated',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tax_estimates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tax_estimates" ON public.tax_estimates FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_tax_estimates_ts BEFORE UPDATE ON public.tax_estimates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.receivables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, customer_name TEXT NOT NULL, invoice_ref TEXT,
  amount NUMERIC DEFAULT 0, due_date DATE, status TEXT DEFAULT 'pending', days_overdue INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own receivables" ON public.receivables FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_receivables_ts BEFORE UPDATE ON public.receivables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.money_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, title TEXT NOT NULL, amount NUMERIC DEFAULT 0, category TEXT,
  requested_by TEXT, status TEXT DEFAULT 'pending', approved_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.money_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own money_approvals" ON public.money_approvals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_money_approvals_ts BEFORE UPDATE ON public.money_approvals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- APPS / MISSION
CREATE TABLE public.health_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, log_type TEXT NOT NULL DEFAULT 'general', value NUMERIC DEFAULT 0,
  unit TEXT, notes TEXT, logged_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.health_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own health_logs" ON public.health_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_health_logs_ts BEFORE UPDATE ON public.health_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.vault_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL, category TEXT DEFAULT 'password',
  encrypted_data TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own vault_items" ON public.vault_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_vault_items_ts BEFORE UPDATE ON public.vault_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.mission_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, title TEXT NOT NULL, description TEXT, target_date DATE,
  progress NUMERIC DEFAULT 0, status TEXT DEFAULT 'active', priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mission_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mission_goals" ON public.mission_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_mission_goals_ts BEFORE UPDATE ON public.mission_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.mission_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, goal_id UUID REFERENCES public.mission_goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL, due_date DATE, completed BOOLEAN DEFAULT false, completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mission_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mission_milestones" ON public.mission_milestones FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_mission_milestones_ts BEFORE UPDATE ON public.mission_milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260407162925_79acb0d8-bf53-44a0-a3c4-3cc1199b4639.sql ──
-- savings_goals
CREATE TABLE public.savings_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  target_amount numeric DEFAULT 0,
  current_amount numeric DEFAULT 0,
  target_date date,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own savings_goals" ON public.savings_goals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- money_accounts
CREATE TABLE public.money_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  account_type text DEFAULT 'checking',
  balance numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  institution text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.money_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own money_accounts" ON public.money_accounts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_money_accounts_updated_at BEFORE UPDATE ON public.money_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- investment_thesis_entries
CREATE TABLE public.investment_thesis_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  thesis text,
  conviction_level text DEFAULT 'medium',
  status text DEFAULT 'active',
  asset_class text,
  time_horizon text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.investment_thesis_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own investment_thesis_entries" ON public.investment_thesis_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_investment_thesis_entries_updated_at BEFORE UPDATE ON public.investment_thesis_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- automation_rules
CREATE TABLE public.automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  trigger_type text,
  action_type text,
  conditions jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_triggered_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own automation_rules" ON public.automation_rules FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON public.automation_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260407164911_c6532beb-638f-4226-a340-024f62fa9791.sql ──
CREATE TABLE public.constitution_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  natural_text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  priority INTEGER NOT NULL DEFAULT 50,
  enforcement_mode TEXT NOT NULL DEFAULT 'advisory',
  is_active BOOLEAN NOT NULL DEFAULT true,
  compiled_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.constitution_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own rules"
  ON public.constitution_rules FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE TRIGGER update_constitution_rules_updated_at
  BEFORE UPDATE ON public.constitution_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── 20260409010628_7dc0eaac-0617-434e-84d9-8fa224296f41.sql ──
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Fix 30 RLS policies: public → authenticated
-- These policies already have auth.uid() = user_id checks,
-- but were assigned to the {public} role instead of {authenticated}.
-- ═══════════════════════════════════════════════════════════════

-- Drop and recreate each policy with TO authenticated

-- 1. appointments
DROP POLICY IF EXISTS "Users manage own appointments" ON public.appointments;
CREATE POLICY "Users manage own appointments" ON public.appointments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. brand_assets
DROP POLICY IF EXISTS "Users manage own brand_assets" ON public.brand_assets;
CREATE POLICY "Users manage own brand_assets" ON public.brand_assets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. campaigns
DROP POLICY IF EXISTS "Users manage own campaigns" ON public.campaigns;
CREATE POLICY "Users manage own campaigns" ON public.campaigns FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. ecommerce_products
DROP POLICY IF EXISTS "Users manage own ecommerce_products" ON public.ecommerce_products;
CREATE POLICY "Users manage own ecommerce_products" ON public.ecommerce_products FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. forms
DROP POLICY IF EXISTS "Users manage own forms" ON public.forms;
CREATE POLICY "Users manage own forms" ON public.forms FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. funnels
DROP POLICY IF EXISTS "Users manage own funnels" ON public.funnels;
CREATE POLICY "Users manage own funnels" ON public.funnels FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. gift_tracker
DROP POLICY IF EXISTS "Users manage own gift_tracker" ON public.gift_tracker;
CREATE POLICY "Users manage own gift_tracker" ON public.gift_tracker FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. grocery_items
DROP POLICY IF EXISTS "Users manage own grocery_items" ON public.grocery_items;
CREATE POLICY "Users manage own grocery_items" ON public.grocery_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. grocery_lists
DROP POLICY IF EXISTS "Users manage own grocery_lists" ON public.grocery_lists;
CREATE POLICY "Users manage own grocery_lists" ON public.grocery_lists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 10. health_logs
DROP POLICY IF EXISTS "Users manage own health_logs" ON public.health_logs;
CREATE POLICY "Users manage own health_logs" ON public.health_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 11. investment_decisions
DROP POLICY IF EXISTS "Users manage own investment_decisions" ON public.investment_decisions;
CREATE POLICY "Users manage own investment_decisions" ON public.investment_decisions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 12. market_watchlist_items
DROP POLICY IF EXISTS "Users manage own market_watchlist_items" ON public.market_watchlist_items;
CREATE POLICY "Users manage own market_watchlist_items" ON public.market_watchlist_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 13. memberships
DROP POLICY IF EXISTS "Users manage own memberships" ON public.memberships;
CREATE POLICY "Users manage own memberships" ON public.memberships FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 14. mission_goals
DROP POLICY IF EXISTS "Users manage own mission_goals" ON public.mission_goals;
CREATE POLICY "Users manage own mission_goals" ON public.mission_goals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 15. mission_milestones
DROP POLICY IF EXISTS "Users manage own mission_milestones" ON public.mission_milestones;
CREATE POLICY "Users manage own mission_milestones" ON public.mission_milestones FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 16. money_approvals
DROP POLICY IF EXISTS "Users manage own money_approvals" ON public.money_approvals;
CREATE POLICY "Users manage own money_approvals" ON public.money_approvals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 17. offers
DROP POLICY IF EXISTS "Users manage own offers" ON public.offers;
CREATE POLICY "Users manage own offers" ON public.offers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 18. pipeline_stages
DROP POLICY IF EXISTS "Users manage own pipeline_stages" ON public.pipeline_stages;
CREATE POLICY "Users manage own pipeline_stages" ON public.pipeline_stages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 19. receivables
DROP POLICY IF EXISTS "Users manage own receivables" ON public.receivables;
CREATE POLICY "Users manage own receivables" ON public.receivables FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 20. reputation_reviews
DROP POLICY IF EXISTS "Users manage own reputation_reviews" ON public.reputation_reviews;
CREATE POLICY "Users manage own reputation_reviews" ON public.reputation_reviews FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 21. retention_alerts
DROP POLICY IF EXISTS "Users manage own retention_alerts" ON public.retention_alerts;
CREATE POLICY "Users manage own retention_alerts" ON public.retention_alerts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 22. risk_scenarios
DROP POLICY IF EXISTS "Users manage own risk_scenarios" ON public.risk_scenarios;
CREATE POLICY "Users manage own risk_scenarios" ON public.risk_scenarios FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 23. school_activities
DROP POLICY IF EXISTS "Users manage own school_activities" ON public.school_activities;
CREATE POLICY "Users manage own school_activities" ON public.school_activities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 24. seo_reports
DROP POLICY IF EXISTS "Users manage own seo_reports" ON public.seo_reports;
CREATE POLICY "Users manage own seo_reports" ON public.seo_reports FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 25. service_providers_list
DROP POLICY IF EXISTS "Users manage own service_providers_list" ON public.service_providers_list;
CREATE POLICY "Users manage own service_providers_list" ON public.service_providers_list FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 26. sites
DROP POLICY IF EXISTS "Users manage own sites" ON public.sites;
CREATE POLICY "Users manage own sites" ON public.sites FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 27. tax_estimates
DROP POLICY IF EXISTS "Users manage own tax_estimates" ON public.tax_estimates;
CREATE POLICY "Users manage own tax_estimates" ON public.tax_estimates FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 28. trade_orders
DROP POLICY IF EXISTS "Users manage own trade_orders" ON public.trade_orders;
CREATE POLICY "Users manage own trade_orders" ON public.trade_orders FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 29. travel_plans
DROP POLICY IF EXISTS "Users manage own travel_plans" ON public.travel_plans;
CREATE POLICY "Users manage own travel_plans" ON public.travel_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 30. vault_items
DROP POLICY IF EXISTS "Users manage own vault_items" ON public.vault_items;
CREATE POLICY "Users manage own vault_items" ON public.vault_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 20260409233135_7f581796-b461-467f-84ef-dd3d34c99fad.sql ──
-- Create calibration_checkpoints table for first-week calibration loop
CREATE TABLE public.calibration_checkpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  checkpoint_key TEXT NOT NULL,
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  response JSONB DEFAULT '{}'::jsonb,
  dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint: one checkpoint per user per key
ALTER TABLE public.calibration_checkpoints ADD CONSTRAINT calibration_checkpoints_user_key_unique UNIQUE (user_id, checkpoint_key);

-- Enable RLS
ALTER TABLE public.calibration_checkpoints ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own checkpoints" ON public.calibration_checkpoints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own checkpoints" ON public.calibration_checkpoints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checkpoints" ON public.calibration_checkpoints FOR UPDATE USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE TRIGGER update_calibration_checkpoints_updated_at
  BEFORE UPDATE ON public.calibration_checkpoints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260410001312_6e38e24f-4435-4de6-8090-2569ab39fb94.sql ──
-- ══════════════════════════════════════════════════════════════
-- SITA OS — App Platform persistence tables
-- ══════════════════════════════════════════════════════════════

-- 1. Installed apps per user
CREATE TABLE public.installed_apps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  app_id TEXT NOT NULL,
  install_status TEXT NOT NULL DEFAULT 'installed',
  install_scope TEXT NOT NULL DEFAULT 'user',
  sandbox_level TEXT NOT NULL DEFAULT 'standard',
  source_origin TEXT NOT NULL DEFAULT 'sita-store',
  package_type TEXT NOT NULL DEFAULT 'native-application',
  update_mode TEXT NOT NULL DEFAULT 'store-managed',
  permissions_granted JSONB NOT NULL DEFAULT '[]'::jsonb,
  dock_pinned BOOLEAN NOT NULL DEFAULT false,
  notification_enabled BOOLEAN NOT NULL DEFAULT true,
  startup_behavior TEXT NOT NULL DEFAULT 'none',
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, app_id)
);

ALTER TABLE public.installed_apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own installed apps (select)"
  ON public.installed_apps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own installed apps (insert)"
  ON public.installed_apps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own installed apps (update)"
  ON public.installed_apps FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own installed apps (delete)"
  ON public.installed_apps FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_installed_apps_updated_at
  BEFORE UPDATE ON public.installed_apps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Default app associations per user
CREATE TABLE public.app_default_associations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  app_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.app_default_associations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own app associations (select)"
  ON public.app_default_associations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own app associations (insert)"
  ON public.app_default_associations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own app associations (update)"
  ON public.app_default_associations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own app associations (delete)"
  ON public.app_default_associations FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_app_default_associations_updated_at
  BEFORE UPDATE ON public.app_default_associations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_installed_apps_user ON public.installed_apps (user_id);
CREATE INDEX idx_installed_apps_app ON public.installed_apps (user_id, app_id);
CREATE INDEX idx_app_default_assoc_user ON public.app_default_associations (user_id);

-- ── 20260410155648_62f02161-a1e9-4b19-99c9-570651fad8da.sql ──
-- Implementation Spec Registry
CREATE TABLE public.implementation_spec_registry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  spec_id TEXT NOT NULL,
  canonical_name TEXT NOT NULL,
  owning_module TEXT NOT NULL DEFAULT 'unassigned',
  description TEXT,
  required_routes TEXT[] DEFAULT '{}',
  required_components TEXT[] DEFAULT '{}',
  required_services TEXT[] DEFAULT '{}',
  required_contracts TEXT[] DEFAULT '{}',
  required_events TEXT[] DEFAULT '{}',
  required_tests TEXT[] DEFAULT '{}',
  required_proofs TEXT[] DEFAULT '{}',
  implementation_status TEXT NOT NULL DEFAULT 'not_started',
  prompt_origin TEXT,
  acceptance_criteria TEXT[] DEFAULT '{}',
  dependencies TEXT[] DEFAULT '{}',
  spec_score INT DEFAULT 0,
  ui_score INT DEFAULT 0,
  contract_score INT DEFAULT 0,
  wiring_score INT DEFAULT 0,
  runtime_score INT DEFAULT 0,
  overall_readiness INT DEFAULT 0,
  last_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, spec_id)
);

ALTER TABLE public.implementation_spec_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own specs" ON public.implementation_spec_registry FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own specs" ON public.implementation_spec_registry FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own specs" ON public.implementation_spec_registry FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own specs" ON public.implementation_spec_registry FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_implementation_spec_registry_updated_at
  BEFORE UPDATE ON public.implementation_spec_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Implementation Wiring Edges
CREATE TABLE public.implementation_wiring_edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  spec_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_name TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_name TEXT NOT NULL,
  edge_status TEXT NOT NULL DEFAULT 'missing',
  evidence TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.implementation_wiring_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own edges" ON public.implementation_wiring_edges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own edges" ON public.implementation_wiring_edges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own edges" ON public.implementation_wiring_edges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own edges" ON public.implementation_wiring_edges FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_implementation_wiring_edges_updated_at
  BEFORE UPDATE ON public.implementation_wiring_edges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_wiring_edges_spec ON public.implementation_wiring_edges(spec_id);
CREATE INDEX idx_spec_registry_status ON public.implementation_spec_registry(implementation_status);

-- ── 20260410162646_f27b00ee-881e-4fd9-a80a-4144e0f52636.sql ──
ALTER TABLE public.implementation_spec_registry
  ADD COLUMN IF NOT EXISTS required_shells text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS required_endpoints text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS required_schemas text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS required_docs text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS required_screens text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS required_projections text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS drift_state text DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS architecture_score int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS test_score int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS docs_score int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS proof_score int DEFAULT 0,
  ADD COLUMN IF NOT EXISTS policy_score int DEFAULT 0;

-- ── 20260410231436_7eb990c8-2a32-43b7-9b11-c045334aafd4.sql ──
-- Seed AI Provider Registry
INSERT INTO public.ai_provider_registry (user_id, provider_key, display_name, api_style, secret_env_name, base_url, supports_tools, supports_structured_output, supports_streaming, supports_demo_mode, launch_stage, is_active, mode, metadata)
VALUES
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'lovable', 'Lovable AI Gateway', 'chat_completions', 'LOVABLE_API_KEY', 'https://ai.gateway.lovable.dev/v1', true, true, true, true, 'active', true, 'real', '{"notes": "Sovereign gateway — routes to Google Gemini models"}'),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'openai', 'OpenAI', 'chat_completions', 'OPENAI_API_KEY', 'https://api.openai.com/v1', true, true, true, false, 'active', true, 'real', '{"notes": "Direct OpenAI — used for fallback or premium tasks"}'),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'anthropic', 'Anthropic', 'messages', 'ANTHROPIC_API_KEY', 'https://api.anthropic.com/v1', true, true, true, false, 'active', true, 'real', '{"notes": "Direct Anthropic — Claude family"}')
ON CONFLICT DO NOTHING;

-- Seed AI Model Registry (Lovable/Gemini models)
INSERT INTO public.ai_model_registry (user_id, model_id, provider, provider_model_name, model_class, display_name, reasoning_strength, structured_output_support, tool_calling_support, context_length, latency_tier, cost_tier, cost_per_1k_input, cost_per_1k_output, reliability_score, launch_stage, fallback_suitability, preferred_task_classes, quality_tier, supports_streaming, supports_json_mode, max_output_tokens_default, is_active, mode, provider_registry_id)
VALUES
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'google/gemini-2.5-pro', 'lovable', 'gemini-2.5-pro', 'premium', 'Gemini 2.5 Pro', 'strong', true, true, 1048576, 'slow', 'premium', 0.0100, 0.0300, 0.94, 'active', 'poor', '{"premium_synthesis","internal_only"}', 'premium', true, true, 65536, true, 'real',
    (SELECT id FROM ai_provider_registry WHERE provider_key = 'lovable' LIMIT 1)),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'google/gemini-3-flash-preview', 'lovable', 'gemini-3-flash-preview', 'standard', 'Gemini 3 Flash', 'moderate', true, true, 1048576, 'fast', 'economy', 0.0020, 0.0060, 0.96, 'active', 'good', '{"balanced_assistant"}', 'balanced', true, true, 32768, true, 'real',
    (SELECT id FROM ai_provider_registry WHERE provider_key = 'lovable' LIMIT 1)),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'google/gemini-2.5-flash-lite', 'lovable', 'gemini-2.5-flash-lite', 'economy', 'Gemini 2.5 Flash Lite', 'basic', true, false, 131072, 'fast', 'economy', 0.0005, 0.0015, 0.97, 'active', 'excellent', '{"economy_utility","cheap_utility","fallback"}', 'economy', true, true, 8192, true, 'real',
    (SELECT id FROM ai_provider_registry WHERE provider_key = 'lovable' LIMIT 1))
ON CONFLICT DO NOTHING;

-- OpenAI models
INSERT INTO public.ai_model_registry (user_id, model_id, provider, provider_model_name, model_class, display_name, reasoning_strength, structured_output_support, tool_calling_support, context_length, latency_tier, cost_tier, cost_per_1k_input, cost_per_1k_output, reliability_score, launch_stage, fallback_suitability, preferred_task_classes, quality_tier, supports_streaming, supports_json_mode, max_output_tokens_default, is_active, mode, provider_registry_id)
VALUES
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'openai/gpt-4o', 'openai', 'gpt-4o', 'premium', 'GPT-4o', 'strong', true, true, 128000, 'standard', 'premium', 0.0050, 0.0150, 0.95, 'active', 'moderate', '{"premium_synthesis","balanced_assistant"}', 'premium', true, true, 16384, true, 'real',
    (SELECT id FROM ai_provider_registry WHERE provider_key = 'openai' LIMIT 1)),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'openai/gpt-4o-mini', 'openai', 'gpt-4o-mini', 'standard', 'GPT-4o Mini', 'moderate', true, true, 128000, 'fast', 'economy', 0.0002, 0.0006, 0.97, 'active', 'good', '{"economy_utility","balanced_assistant"}', 'balanced', true, true, 16384, true, 'real',
    (SELECT id FROM ai_provider_registry WHERE provider_key = 'openai' LIMIT 1)),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'openai/o1', 'openai', 'o1', 'premium', 'o1 Reasoning', 'exceptional', true, false, 200000, 'slow', 'premium', 0.0150, 0.0600, 0.90, 'active', 'poor', '{"premium_synthesis","internal_only"}', 'premium', false, true, 100000, true, 'real',
    (SELECT id FROM ai_provider_registry WHERE provider_key = 'openai' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Anthropic models
INSERT INTO public.ai_model_registry (user_id, model_id, provider, provider_model_name, model_class, display_name, reasoning_strength, structured_output_support, tool_calling_support, context_length, latency_tier, cost_tier, cost_per_1k_input, cost_per_1k_output, reliability_score, launch_stage, fallback_suitability, preferred_task_classes, quality_tier, supports_streaming, supports_json_mode, max_output_tokens_default, is_active, mode, provider_registry_id)
VALUES
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'anthropic/claude-4-sonnet', 'anthropic', 'claude-sonnet-4-20250514', 'premium', 'Claude 4 Sonnet', 'strong', true, true, 200000, 'standard', 'premium', 0.0030, 0.0150, 0.95, 'active', 'moderate', '{"premium_synthesis","balanced_assistant"}', 'premium', true, true, 64000, true, 'real',
    (SELECT id FROM ai_provider_registry WHERE provider_key = 'anthropic' LIMIT 1)),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'anthropic/claude-3.5-haiku', 'anthropic', 'claude-3-5-haiku-20241022', 'economy', 'Claude 3.5 Haiku', 'moderate', true, true, 200000, 'fast', 'economy', 0.0008, 0.0040, 0.97, 'active', 'good', '{"economy_utility","balanced_assistant","fallback"}', 'balanced', true, true, 8192, true, 'real',
    (SELECT id FROM ai_provider_registry WHERE provider_key = 'anthropic' LIMIT 1))
ON CONFLICT DO NOTHING;

-- Demo/fallback models
INSERT INTO public.ai_model_registry (user_id, model_id, provider, provider_model_name, model_class, display_name, reasoning_strength, structured_output_support, tool_calling_support, context_length, latency_tier, cost_tier, cost_per_1k_input, cost_per_1k_output, reliability_score, launch_stage, fallback_suitability, preferred_task_classes, quality_tier, supports_streaming, supports_json_mode, max_output_tokens_default, is_active, mode)
VALUES
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'demo/static-response', 'lovable', 'demo-static', 'fallback', 'Demo Static Response', 'none', false, false, 0, 'instant', 'free', 0, 0, 1.0, 'active', 'excellent', '{"fallback","fallback_degraded"}', 'demo', false, false, 0, true, 'demo'),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'fallback/unavailable', 'lovable', 'unavailable-stub', 'fallback', 'Unavailable Stub', 'none', false, false, 0, 'instant', 'free', 0, 0, 1.0, 'active', 'excellent', '{"fallback_degraded"}', 'demo', false, false, 0, false, 'unavailable')
ON CONFLICT DO NOTHING;

-- ── 20260410231641_5eb7b382-0a20-41e8-be07-b6fb13d41712.sql ──
-- Seed AI Capability Routing
INSERT INTO public.ai_capability_routing (user_id, capability_key, routing_class, budget_class, quality_requirement, max_latency_class, launch_honesty_class, is_active, structured_output_required, tool_use_required, can_fallback_to_demo, can_fallback_to_unavailable, metadata)
VALUES
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'advisor.chat.primary', 'balanced_assistant', 'standard', 'high', 'fast', 'partial', true, false, false, true, false, '{}'),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'classification.extract', 'economy_utility', 'utility', 'standard', 'realtime', 'partial', true, true, false, true, false, '{}'),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'boardroom.weekly.summary', 'premium_synthesis', 'premium', 'premium', 'standard', 'partial', true, false, false, true, false, '{}'),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'admin.synthesis', 'internal_only', 'premium', 'premium', 'standard', 'internal_only', true, false, false, true, false, '{}'),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'admin.ai_workforce.run', 'balanced_assistant', 'standard', 'standard', 'standard', 'internal_only', true, false, true, true, false, '{}'),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'utility.extract', 'economy_utility', 'utility', 'standard', 'realtime', 'partial', true, true, false, true, false, '{}'),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'daily_pulse.generate', 'balanced_assistant', 'standard', 'high', 'standard', 'partial', true, false, false, true, false, '{}'),
  ('62ae1b1f-dfb8-4a9c-8a3d-40442e77bcc0', 'memory.summarize', 'balanced_assistant', 'standard', 'standard', 'fast', 'partial', true, false, false, true, true, '{}')
ON CONFLICT DO NOTHING;

-- ── 20260411151702_2f2b32a2-c8e6-4545-b2c8-5ce83e236ad3.sql ──
-- app_default_associations: 4 policies
ALTER POLICY "Users manage own app associations (select)" ON public.app_default_associations TO authenticated;
ALTER POLICY "Users manage own app associations (insert)" ON public.app_default_associations TO authenticated;
ALTER POLICY "Users manage own app associations (update)" ON public.app_default_associations TO authenticated;
ALTER POLICY "Users manage own app associations (delete)" ON public.app_default_associations TO authenticated;

-- calibration_checkpoints: 3 policies
ALTER POLICY "Users can view own checkpoints" ON public.calibration_checkpoints TO authenticated;
ALTER POLICY "Users can create own checkpoints" ON public.calibration_checkpoints TO authenticated;
ALTER POLICY "Users can update own checkpoints" ON public.calibration_checkpoints TO authenticated;

-- installed_apps: 4 policies
ALTER POLICY "Users manage own installed apps (select)" ON public.installed_apps TO authenticated;
ALTER POLICY "Users manage own installed apps (insert)" ON public.installed_apps TO authenticated;
ALTER POLICY "Users manage own installed apps (update)" ON public.installed_apps TO authenticated;
ALTER POLICY "Users manage own installed apps (delete)" ON public.installed_apps TO authenticated;

-- ── 20260411152308_08a0c6f4-776c-4c0e-8254-c81727cdeb60.sql ──
ALTER POLICY "Users can view their own specs" ON public.implementation_spec_registry TO authenticated;
ALTER POLICY "Users can create their own specs" ON public.implementation_spec_registry TO authenticated;
ALTER POLICY "Users can update their own specs" ON public.implementation_spec_registry TO authenticated;
ALTER POLICY "Users can delete their own specs" ON public.implementation_spec_registry TO authenticated;

ALTER POLICY "Users can view their own edges" ON public.implementation_wiring_edges TO authenticated;
ALTER POLICY "Users can create their own edges" ON public.implementation_wiring_edges TO authenticated;
ALTER POLICY "Users can update their own edges" ON public.implementation_wiring_edges TO authenticated;
ALTER POLICY "Users can delete their own edges" ON public.implementation_wiring_edges TO authenticated;

ALTER POLICY "Users manage own oauth state sessions" ON public.oauth_state_sessions TO authenticated;

-- ── 20260411153058_9643c966-67e9-4628-b9e4-01bc414fc25d.sql ──
DROP POLICY "auth read status" ON public.customer_journey_status;
CREATE POLICY "admin read status" ON public.customer_journey_status
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ── 20260412220647_d923c5d7-7c11-443c-9bd0-6a299bd93418.sql ──
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Concierge Backend Schema
-- ═══════════════════════════════════════════════════════════════

-- Shared updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ═══ 1. travel_plans ═══
CREATE TABLE public.travel_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  readiness_percent INTEGER DEFAULT 0,
  status TEXT DEFAULT 'planning',
  travelers TEXT,
  budget NUMERIC(10,2),
  spent NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.travel_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own travel_plans" ON public.travel_plans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_travel_plans_updated_at BEFORE UPDATE ON public.travel_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ 2. appointments ═══
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  provider TEXT,
  appointment_date TIMESTAMPTZ,
  status TEXT DEFAULT 'confirmed',
  prep_items TEXT[] DEFAULT '{}',
  docs_needed TEXT[] DEFAULT '{}',
  transport_time TEXT,
  category TEXT DEFAULT 'personal',
  owner TEXT,
  location TEXT,
  who TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own appointments" ON public.appointments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ 3. grocery_lists ═══
CREATE TABLE public.grocery_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Shopping List',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own grocery_lists" ON public.grocery_lists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_grocery_lists_updated_at BEFORE UPDATE ON public.grocery_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ 4. grocery_items ═══
CREATE TABLE public.grocery_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  list_id UUID REFERENCES public.grocery_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  quantity TEXT,
  estimated_cost NUMERIC(8,2),
  checked BOOLEAN DEFAULT false,
  recurring BOOLEAN DEFAULT false,
  urgent BOOLEAN DEFAULT false,
  store TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own grocery_items" ON public.grocery_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══ 5. service_providers_list ═══
CREATE TABLE public.service_providers_list (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  phone TEXT,
  location TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  trusted BOOLEAN DEFAULT false,
  total_spent NUMERIC(10,2) DEFAULT 0,
  response_time TEXT,
  cost_range TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.service_providers_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own service_providers" ON public.service_providers_list FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON public.service_providers_list FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ 6. school_activities ═══
CREATE TABLE public.school_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  child_name TEXT,
  activity_type TEXT DEFAULT 'event',
  schedule TEXT,
  location TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.school_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own school_activities" ON public.school_activities FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_school_activities_updated_at BEFORE UPDATE ON public.school_activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ 7. gift_tracker ═══
CREATE TABLE public.gift_tracker (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipient TEXT NOT NULL,
  occasion TEXT,
  gift_idea TEXT,
  budget NUMERIC(8,2),
  status TEXT DEFAULT 'idea',
  target_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gift_tracker ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own gift_tracker" ON public.gift_tracker FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_gift_tracker_updated_at BEFORE UPDATE ON public.gift_tracker FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ 8. concierge_errands ═══
CREATE TABLE public.concierge_errands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  estimated_minutes INTEGER,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  bundle_id TEXT,
  combinable BOOLEAN DEFAULT false,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.concierge_errands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own errands" ON public.concierge_errands FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_errands_updated_at BEFORE UPDATE ON public.concierge_errands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ 9. concierge_recurring_obligations ═══
CREATE TABLE public.concierge_recurring_obligations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'admin',
  frequency TEXT DEFAULT 'monthly',
  next_due DATE,
  last_completed DATE,
  status TEXT DEFAULT 'on-track',
  effort TEXT DEFAULT 'medium',
  automatable BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.concierge_recurring_obligations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own recurring_obligations" ON public.concierge_recurring_obligations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_recurring_obligations_updated_at BEFORE UPDATE ON public.concierge_recurring_obligations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ 10. concierge_automations ═══
CREATE TABLE public.concierge_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  trigger_event TEXT,
  conditions JSONB DEFAULT '{}',
  trust_level TEXT DEFAULT 'review',
  status TEXT DEFAULT 'proposed',
  safety_boundary TEXT,
  last_run TIMESTAMPTZ,
  recent_runs_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.concierge_automations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own automations" ON public.concierge_automations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON public.concierge_automations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ 11. concierge_documents ═══
CREATE TABLE public.concierge_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  doc_type TEXT DEFAULT 'general',
  sensitivity TEXT DEFAULT 'normal',
  linked_context TEXT,
  expiry_date DATE,
  file_path TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.concierge_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own documents" ON public.concierge_documents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.concierge_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260413001439_ad28d4e6-170b-44f1-8903-7bbf61dcea70.sql ──
-- Fix security definer views by recreating with security_invoker = true

CREATE OR REPLACE VIEW public.v_recommendation_closure_summary
WITH (security_invoker = true) AS
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

CREATE OR REPLACE VIEW public.v_remediation_program_summary
WITH (security_invoker = true) AS
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

CREATE OR REPLACE VIEW public.v_recommendation_execution_pipeline
WITH (security_invoker = true) AS
SELECT
  lifecycle_status AS stage,
  COUNT(*) AS count,
  user_id
FROM public.ai_workforce_recommendations
GROUP BY lifecycle_status, user_id;

CREATE OR REPLACE VIEW public.v_outcome_verification_summary
WITH (security_invoker = true) AS
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

-- ── 20260413032159_8b6f9ba0-6665-4c58-8548-26d7acc5ae02.sql ──
-- ═══════════════════════════════════════════════════════════════
-- RLS Hardening: Migrate all public-role policies to authenticated
-- Affects 27 tables with "Users manage own ..." ALL policies
-- ═══════════════════════════════════════════════════════════════

-- advisor_action_queue
DROP POLICY "Users manage own advisor_action_queue" ON public.advisor_action_queue;
CREATE POLICY "Users manage own advisor_action_queue" ON public.advisor_action_queue FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- advisor_agents
DROP POLICY "Users manage own advisor_agents" ON public.advisor_agents;
CREATE POLICY "Users manage own advisor_agents" ON public.advisor_agents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_approval_queue
DROP POLICY "Users manage own ai_workforce_approval_queue" ON public.ai_workforce_approval_queue;
CREATE POLICY "Users manage own ai_workforce_approval_queue" ON public.ai_workforce_approval_queue FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_budget_classes
DROP POLICY "Users manage own ai_workforce_budget_classes" ON public.ai_workforce_budget_classes;
CREATE POLICY "Users manage own ai_workforce_budget_classes" ON public.ai_workforce_budget_classes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_cached_outputs
DROP POLICY "Users manage own ai_workforce_cached_outputs" ON public.ai_workforce_cached_outputs;
CREATE POLICY "Users manage own ai_workforce_cached_outputs" ON public.ai_workforce_cached_outputs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_invocations
DROP POLICY "Users manage own ai_workforce_invocations" ON public.ai_workforce_invocations;
CREATE POLICY "Users manage own ai_workforce_invocations" ON public.ai_workforce_invocations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_launch_honesty
DROP POLICY "Users manage own ai_workforce_launch_honesty" ON public.ai_workforce_launch_honesty;
CREATE POLICY "Users manage own ai_workforce_launch_honesty" ON public.ai_workforce_launch_honesty FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_outputs
DROP POLICY "Users manage own ai_workforce_outputs" ON public.ai_workforce_outputs;
CREATE POLICY "Users manage own ai_workforce_outputs" ON public.ai_workforce_outputs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_recommendation_scores
DROP POLICY "Users manage own ai_workforce_recommendation_scores" ON public.ai_workforce_recommendation_scores;
CREATE POLICY "Users manage own ai_workforce_recommendation_scores" ON public.ai_workforce_recommendation_scores FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_recommendations
DROP POLICY "Users manage own ai_workforce_recommendations" ON public.ai_workforce_recommendations;
CREATE POLICY "Users manage own ai_workforce_recommendations" ON public.ai_workforce_recommendations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_role_health
DROP POLICY "Users manage own ai_workforce_role_health" ON public.ai_workforce_role_health;
CREATE POLICY "Users manage own ai_workforce_role_health" ON public.ai_workforce_role_health FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_role_task_permissions
DROP POLICY "Users manage own ai_workforce_role_task_permissions" ON public.ai_workforce_role_task_permissions;
CREATE POLICY "Users manage own ai_workforce_role_task_permissions" ON public.ai_workforce_role_task_permissions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_roles
DROP POLICY "Users manage own ai_workforce_roles" ON public.ai_workforce_roles;
CREATE POLICY "Users manage own ai_workforce_roles" ON public.ai_workforce_roles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ai_workforce_task_types
DROP POLICY "Users manage own ai_workforce_task_types" ON public.ai_workforce_task_types;
CREATE POLICY "Users manage own ai_workforce_task_types" ON public.ai_workforce_task_types FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- appointments
DROP POLICY "Users manage own appointments" ON public.appointments;
CREATE POLICY "Users manage own appointments" ON public.appointments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- concierge_automations
DROP POLICY "Users manage own automations" ON public.concierge_automations;
CREATE POLICY "Users manage own automations" ON public.concierge_automations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- concierge_documents
DROP POLICY "Users manage own documents" ON public.concierge_documents;
CREATE POLICY "Users manage own documents" ON public.concierge_documents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- concierge_errands
DROP POLICY "Users manage own errands" ON public.concierge_errands;
CREATE POLICY "Users manage own errands" ON public.concierge_errands FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- concierge_recurring_obligations
DROP POLICY "Users manage own recurring_obligations" ON public.concierge_recurring_obligations;
CREATE POLICY "Users manage own recurring_obligations" ON public.concierge_recurring_obligations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- flagship_loops
DROP POLICY "Users manage own flagship_loops" ON public.flagship_loops;
CREATE POLICY "Users manage own flagship_loops" ON public.flagship_loops FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- gift_tracker
DROP POLICY "Users manage own gift_tracker" ON public.gift_tracker;
CREATE POLICY "Users manage own gift_tracker" ON public.gift_tracker FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- grocery_items
DROP POLICY "Users manage own grocery_items" ON public.grocery_items;
CREATE POLICY "Users manage own grocery_items" ON public.grocery_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- grocery_lists
DROP POLICY "Users manage own grocery_lists" ON public.grocery_lists;
CREATE POLICY "Users manage own grocery_lists" ON public.grocery_lists FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- outcome_verifications
DROP POLICY "Users manage own outcome_verifications" ON public.outcome_verifications;
CREATE POLICY "Users manage own outcome_verifications" ON public.outcome_verifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- recommendation_execution_bindings
DROP POLICY "Users manage own recommendation_execution_bindings" ON public.recommendation_execution_bindings;
CREATE POLICY "Users manage own recommendation_execution_bindings" ON public.recommendation_execution_bindings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- recommendation_execution_events
DROP POLICY "Users manage own recommendation_execution_events" ON public.recommendation_execution_events;
CREATE POLICY "Users manage own recommendation_execution_events" ON public.recommendation_execution_events FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- recommendation_learning_signals
DROP POLICY "Users manage own recommendation_learning_signals" ON public.recommendation_learning_signals;
CREATE POLICY "Users manage own recommendation_learning_signals" ON public.recommendation_learning_signals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- recommendation_outcome_verifications
DROP POLICY "Users manage own recommendation_outcome_verifications" ON public.recommendation_outcome_verifications;
CREATE POLICY "Users manage own recommendation_outcome_verifications" ON public.recommendation_outcome_verifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- remediation_programs
DROP POLICY "Users manage own remediation_programs" ON public.remediation_programs;
CREATE POLICY "Users manage own remediation_programs" ON public.remediation_programs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- remediation_tasks
DROP POLICY "Users manage own remediation_tasks" ON public.remediation_tasks;
CREATE POLICY "Users manage own remediation_tasks" ON public.remediation_tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- school_activities
DROP POLICY "Users manage own school_activities" ON public.school_activities;
CREATE POLICY "Users manage own school_activities" ON public.school_activities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- service_providers_list
DROP POLICY "Users manage own service_providers" ON public.service_providers_list;
CREATE POLICY "Users manage own service_providers" ON public.service_providers_list FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- travel_plans
DROP POLICY "Users manage own travel_plans" ON public.travel_plans;
CREATE POLICY "Users manage own travel_plans" ON public.travel_plans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ── 20260413050711_c4fa5fdf-68c9-4336-afce-e444af897670.sql ──
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_metadata->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_metadata->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ── 20260413061234_ff7a4dd7-7d64-4afb-a885-20c1a1d41f26.sql ──
DROP POLICY "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- ── 20260413120423_ac6c7409-4799-4ae1-a724-7876ff0aaaae.sql ──
-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create org_members table
CREATE TABLE public.org_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- Security definer function: check if user is member of org
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members
    WHERE user_id = _user_id AND org_id = _org_id
  )
$$;

-- Security definer function: check if user is org owner
CREATE OR REPLACE FUNCTION public.is_org_owner(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organizations
    WHERE id = _org_id AND owner_id = _user_id
  )
$$;

-- Organizations: members can view their org
CREATE POLICY "Members can view their organization"
ON public.organizations FOR SELECT TO authenticated
USING (public.is_org_member(auth.uid(), id));

-- Organizations: owners can update
CREATE POLICY "Owners can update their organization"
ON public.organizations FOR UPDATE TO authenticated
USING (owner_id = auth.uid());

-- Organizations: any authenticated user can create
CREATE POLICY "Users can create organizations"
ON public.organizations FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid());

-- Organizations: owners can delete
CREATE POLICY "Owners can delete their organization"
ON public.organizations FOR DELETE TO authenticated
USING (owner_id = auth.uid());

-- Org members: members can view other members in their org
CREATE POLICY "Members can view org members"
ON public.org_members FOR SELECT TO authenticated
USING (public.is_org_member(auth.uid(), org_id));

-- Org members: owners can add members
CREATE POLICY "Owners can add org members"
ON public.org_members FOR INSERT TO authenticated
WITH CHECK (public.is_org_owner(auth.uid(), org_id));

-- Org members: owners can remove members
CREATE POLICY "Owners can remove org members"
ON public.org_members FOR DELETE TO authenticated
USING (public.is_org_owner(auth.uid(), org_id));

-- Org members: owners can update roles
CREATE POLICY "Owners can update org members"
ON public.org_members FOR UPDATE TO authenticated
USING (public.is_org_owner(auth.uid(), org_id));

-- Triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_org_members_updated_at
BEFORE UPDATE ON public.org_members
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast lookups
CREATE INDEX idx_org_members_user_id ON public.org_members(user_id);
CREATE INDEX idx_org_members_org_id ON public.org_members(org_id);

-- ── 20260414191021_1de84593-5b49-40b4-bbaf-4171787a5fc8.sql ──
-- Create lead_inbox_items table (triage queue)
CREATE TABLE public.lead_inbox_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_name TEXT NOT NULL DEFAULT '',
  contact_email TEXT,
  contact_phone TEXT,
  company TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  inquiry_text TEXT,
  urgency TEXT NOT NULL DEFAULT 'low',
  quality_score INTEGER DEFAULT 0,
  quality_hints JSONB DEFAULT '[]'::jsonb,
  completeness_score INTEGER DEFAULT 0,
  missing_fields TEXT[] DEFAULT '{}'::text[],
  duplicate_status TEXT NOT NULL DEFAULT 'none',
  duplicate_match_id UUID,
  suggested_owner TEXT,
  suggested_route TEXT NOT NULL DEFAULT 'lead',
  advisor_suggestion TEXT,
  triage_status TEXT NOT NULL DEFAULT 'new',
  routed_to TEXT,
  accepted_at TIMESTAMP WITH TIME ZONE,
  business_profile_mode TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_inbox_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own lead_inbox_items"
  ON public.lead_inbox_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_lead_inbox_items_updated_at
  BEFORE UPDATE ON public.lead_inbox_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_lead_inbox_items_user_status ON public.lead_inbox_items (user_id, triage_status);
CREATE INDEX idx_lead_inbox_items_urgency ON public.lead_inbox_items (urgency);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_inbox_items;

-- Create leads table (accepted leads)
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  company TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  likely_value NUMERIC DEFAULT 0,
  opportunity_score INTEGER DEFAULT 0,
  next_action TEXT,
  last_contact_at TIMESTAMP WITH TIME ZONE,
  stale_risk BOOLEAN DEFAULT false,
  notes TEXT,
  urgency TEXT DEFAULT 'low',
  inbox_item_id UUID REFERENCES public.lead_inbox_items(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own leads"
  ON public.leads FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_leads_user_status ON public.leads (user_id, status);

-- ── 20260414224841_a0efed66-e4d7-4003-925f-ebf552baa572.sql ──
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

-- ── 20260415072540_e45222b9-3c61-4509-bb5d-012dcc401158.sql ──
-- =============================================
-- BATCH 1: Platform Plane Separation Tables
-- =============================================

-- 1. Platform Planes Registry
CREATE TABLE public.platform_planes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plane_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#888888',
  icon TEXT NOT NULL DEFAULT 'layers',
  service_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_planes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage planes" ON public.platform_planes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view planes" ON public.platform_planes FOR SELECT TO authenticated USING (true);

-- 2. Plane Service Assignments
CREATE TABLE public.plane_service_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plane_id UUID NOT NULL REFERENCES public.platform_planes(id) ON DELETE CASCADE,
  service_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  service_type TEXT NOT NULL DEFAULT 'backbone',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(plane_id, service_key)
);
ALTER TABLE public.plane_service_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage assignments" ON public.plane_service_assignments FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view assignments" ON public.plane_service_assignments FOR SELECT TO authenticated USING (true);

-- 3. Admin Role Permissions (granular)
CREATE TABLE public.admin_role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_key TEXT NOT NULL,
  permission TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  granted BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role_key, permission)
);
ALTER TABLE public.admin_role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage permissions" ON public.admin_role_permissions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view permissions" ON public.admin_role_permissions FOR SELECT TO authenticated USING (true);

-- 4. Admin Action Audit
CREATE TABLE public.admin_action_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  plane TEXT NOT NULL DEFAULT 'control',
  justification TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  session_id UUID,
  severity TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_admin_audit_actor ON public.admin_action_audit(actor_user_id);
CREATE INDEX idx_admin_audit_action ON public.admin_action_audit(action);
CREATE INDEX idx_admin_audit_created ON public.admin_action_audit(created_at DESC);
CREATE INDEX idx_admin_audit_plane ON public.admin_action_audit(plane);
ALTER TABLE public.admin_action_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit" ON public.admin_action_audit FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert audit" ON public.admin_action_audit FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Admin Sessions
CREATE TABLE public.admin_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '2 hours'),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  mfa_verified BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  revoked_at TIMESTAMPTZ,
  revoke_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_admin_sessions_user ON public.admin_sessions(user_id);
CREATE INDEX idx_admin_sessions_status ON public.admin_sessions(status);
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON public.admin_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all sessions" ON public.admin_sessions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage sessions" ON public.admin_sessions FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 6. Environment Configs
CREATE TABLE public.environment_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  env_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  api_base_url TEXT,
  feature_flag_context JSONB DEFAULT '{}',
  config JSONB DEFAULT '{}',
  is_current BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.environment_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view envs" ON public.environment_configs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage envs" ON public.environment_configs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 7. Token Classes
CREATE TABLE public.token_classes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  class_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  default_ttl_seconds INTEGER NOT NULL DEFAULT 3600,
  max_ttl_seconds INTEGER NOT NULL DEFAULT 86400,
  scope_template JSONB DEFAULT '[]',
  requires_mfa BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.token_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage tokens" ON public.token_classes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view tokens" ON public.token_classes FOR SELECT TO authenticated USING (true);

-- 8. API Gateway Routes
CREATE TABLE public.api_gateway_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  route_pattern TEXT NOT NULL,
  method TEXT NOT NULL DEFAULT 'POST',
  plane TEXT NOT NULL DEFAULT 'shared-core',
  required_token_class TEXT NOT NULL DEFAULT 'user',
  required_permission TEXT,
  rate_limit_per_minute INTEGER NOT NULL DEFAULT 60,
  description TEXT NOT NULL DEFAULT '',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(route_pattern, method)
);
ALTER TABLE public.api_gateway_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage routes" ON public.api_gateway_routes FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Authenticated can view routes" ON public.api_gateway_routes FOR SELECT TO authenticated USING (true);

-- 9. Device Ownership
CREATE TABLE public.device_ownership (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id UUID NOT NULL,
  owner_user_id UUID NOT NULL,
  device_name TEXT NOT NULL DEFAULT 'Unknown Device',
  device_type TEXT NOT NULL DEFAULT 'desktop',
  platform TEXT NOT NULL DEFAULT 'web',
  trust_level TEXT NOT NULL DEFAULT 'standard',
  permissions JSONB DEFAULT '[]',
  capabilities JSONB DEFAULT '[]',
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sync_enabled BOOLEAN NOT NULL DEFAULT true,
  selective_sync_config JSONB DEFAULT '{}',
  revoked BOOLEAN NOT NULL DEFAULT false,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID,
  revoke_scope TEXT,
  environment TEXT NOT NULL DEFAULT 'production',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(device_id, owner_user_id)
);
CREATE INDEX idx_device_ownership_owner ON public.device_ownership(owner_user_id);
CREATE INDEX idx_device_ownership_device ON public.device_ownership(device_id);
ALTER TABLE public.device_ownership ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own devices" ON public.device_ownership FOR SELECT TO authenticated USING (auth.uid() = owner_user_id);
CREATE POLICY "Users can manage own devices" ON public.device_ownership FOR UPDATE TO authenticated USING (auth.uid() = owner_user_id);
CREATE POLICY "Users can register devices" ON public.device_ownership FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Admins can view all devices" ON public.device_ownership FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all devices" ON public.device_ownership FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 10. Support Access Grants
CREATE TABLE public.support_access_grants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_user_id UUID NOT NULL,
  granted_to_user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'read-only',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 hour'),
  revoked_at TIMESTAMPTZ,
  actions_performed JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_support_grants_target ON public.support_access_grants(target_user_id);
CREATE INDEX idx_support_grants_grantee ON public.support_access_grants(granted_to_user_id);
ALTER TABLE public.support_access_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Target user can view grants" ON public.support_access_grants FOR SELECT TO authenticated USING (auth.uid() = target_user_id);
CREATE POLICY "Grantee can view own grants" ON public.support_access_grants FOR SELECT TO authenticated USING (auth.uid() = granted_to_user_id);
CREATE POLICY "Admins can manage grants" ON public.support_access_grants FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_platform_planes_updated_at BEFORE UPDATE ON public.platform_planes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_plane_service_assignments_updated_at BEFORE UPDATE ON public.plane_service_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_role_permissions_updated_at BEFORE UPDATE ON public.admin_role_permissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_admin_sessions_updated_at BEFORE UPDATE ON public.admin_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_environment_configs_updated_at BEFORE UPDATE ON public.environment_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_token_classes_updated_at BEFORE UPDATE ON public.token_classes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_api_gateway_routes_updated_at BEFORE UPDATE ON public.api_gateway_routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_device_ownership_updated_at BEFORE UPDATE ON public.device_ownership FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_support_access_grants_updated_at BEFORE UPDATE ON public.support_access_grants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Security definer for granular admin permission check
CREATE OR REPLACE FUNCTION public.has_admin_permission(_user_id UUID, _permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_role_permissions arp
    JOIN public.cloud_admin_role_assignments cara ON cara.user_id = _user_id
    JOIN public.cloud_admin_roles car ON car.id = cara.role_id AND car.role_key = arp.role_key
    WHERE arp.permission = _permission
      AND arp.granted = true
  )
$$;

-- ── 20260415074231_e38b4f6b-42b6-476d-8d6a-5d7694d715d5.sql ──
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

-- ── 20260415074252_e2eab9e4-df79-45e3-83c4-155e486f3dcc.sql ──
-- Fix the permissive INSERT policy on platform_notifications
DROP POLICY IF EXISTS "System can insert notifications" ON public.platform_notifications;
CREATE POLICY "Users can insert own notifications" ON public.platform_notifications FOR INSERT TO authenticated WITH CHECK (
  (target_user_id = auth.uid()) OR public.has_admin_permission(auth.uid(), 'platform.admin')
);

-- ── 20260415091816_6e8046fd-d3a2-434d-9fba-1fd6bfd713eb.sql ──
-- Create founder_directives table
CREATE TABLE public.founder_directives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  intent_text TEXT NOT NULL,
  domain_classification TEXT NOT NULL DEFAULT 'general',
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  decomposed_plan JSONB NOT NULL DEFAULT '[]'::jsonb,
  task_graph JSONB NOT NULL DEFAULT '{}'::jsonb,
  execution_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  outcome_summary TEXT,
  risk_assessment JSONB NOT NULL DEFAULT '{}'::jsonb,
  agent_assignments JSONB NOT NULL DEFAULT '[]'::jsonb,
  approvals_required BOOLEAN NOT NULL DEFAULT false,
  approvals_received JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.founder_directives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own directives"
  ON public.founder_directives FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own directives"
  ON public.founder_directives FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own directives"
  ON public.founder_directives FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own directives"
  ON public.founder_directives FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_founder_directives_updated_at
  BEFORE UPDATE ON public.founder_directives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create platform_runbooks table
CREATE TABLE public.platform_runbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  domain TEXT NOT NULL DEFAULT 'ops',
  severity TEXT NOT NULL DEFAULT 'medium',
  trigger_conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  agent_assignments JSONB NOT NULL DEFAULT '[]'::jsonb,
  auto_heal_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_heal_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  tags TEXT[] NOT NULL DEFAULT '{}',
  execution_count INTEGER NOT NULL DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  last_execution_result JSONB,
  incident_patterns JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_runbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own runbooks"
  ON public.platform_runbooks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own runbooks"
  ON public.platform_runbooks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own runbooks"
  ON public.platform_runbooks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own runbooks"
  ON public.platform_runbooks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_platform_runbooks_updated_at
  BEFORE UPDATE ON public.platform_runbooks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_founder_directives_user_status ON public.founder_directives(user_id, status);
CREATE INDEX idx_founder_directives_domain ON public.founder_directives(domain_classification);
CREATE INDEX idx_platform_runbooks_user_domain ON public.platform_runbooks(user_id, domain);
CREATE INDEX idx_platform_runbooks_tags ON public.platform_runbooks USING GIN(tags);

-- ── 20260415171628_3ecf7354-f382-45fa-bbea-5defd8130858.sql ──
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  domain TEXT NOT NULL DEFAULT 'personal',
  event_type TEXT NOT NULL DEFAULT 'meeting',
  location TEXT,
  priority TEXT DEFAULT 'medium',
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  source_id TEXT,
  color TEXT,
  recurring TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calendar events"
  ON public.calendar_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own calendar events"
  ON public.calendar_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events"
  ON public.calendar_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events"
  ON public.calendar_events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_calendar_events_user_date ON public.calendar_events (user_id, event_date);
CREATE INDEX idx_calendar_events_domain ON public.calendar_events (user_id, domain);

CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260416010347_03ff1b0b-0dda-4dba-8fa6-eea0ecf22fd0.sql ──
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

-- ── 20260416151015_5a65a765-7d6c-4ae7-96f1-e0a908b64472.sql ──
-- License Keys table
CREATE TABLE public.licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  license_key TEXT NOT NULL UNIQUE,
  product_tier TEXT NOT NULL DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'active',
  max_devices INTEGER NOT NULL DEFAULT 3,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own licenses"
  ON public.licenses FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own licenses"
  ON public.licenses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own licenses"
  ON public.licenses FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_licenses_updated_at
  BEFORE UPDATE ON public.licenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- License Activations table
CREATE TABLE public.license_activations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  platform TEXT,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (license_id, device_fingerprint)
);

ALTER TABLE public.license_activations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own activations"
  ON public.license_activations FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.licenses l WHERE l.id = license_id AND l.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own activations"
  ON public.license_activations FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.licenses l WHERE l.id = license_id AND l.user_id = auth.uid()
  ));

CREATE POLICY "Users can update their own activations"
  ON public.license_activations FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.licenses l WHERE l.id = license_id AND l.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own activations"
  ON public.license_activations FOR DELETE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.licenses l WHERE l.id = license_id AND l.user_id = auth.uid()
  ));

CREATE TRIGGER update_license_activations_updated_at
  BEFORE UPDATE ON public.license_activations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- License Audit Log (append-only)
CREATE TABLE public.license_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  event TEXT NOT NULL,
  device_fingerprint TEXT,
  ip_address TEXT,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.license_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own audit logs"
  ON public.license_audit_log FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.licenses l WHERE l.id = license_id AND l.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert audit logs for their licenses"
  ON public.license_audit_log FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.licenses l WHERE l.id = license_id AND l.user_id = auth.uid()
  ));

-- Indexes
CREATE INDEX idx_licenses_key ON public.licenses(license_key);
CREATE INDEX idx_licenses_user ON public.licenses(user_id);
CREATE INDEX idx_activations_license ON public.license_activations(license_id);
CREATE INDEX idx_activations_fingerprint ON public.license_activations(device_fingerprint);
CREATE INDEX idx_audit_license ON public.license_audit_log(license_id);
CREATE INDEX idx_audit_event ON public.license_audit_log(event);

-- ── 20260416152158_5825aa76-69c4-4e00-b434-ecfe3669746a.sql ──
ALTER TABLE public.licenses ADD COLUMN IF NOT EXISTS key_signature text DEFAULT null;
