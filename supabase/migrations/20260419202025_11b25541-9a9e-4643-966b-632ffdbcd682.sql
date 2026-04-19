-- ═══════════════════════════════════════════════════════════════
-- Evidence Persistence Layer — 7 tables
-- Phase 0–4 closure pack
-- ═══════════════════════════════════════════════════════════════

-- 1. evidence_graph_nodes
CREATE TABLE public.evidence_graph_nodes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kind TEXT NOT NULL,
  ref TEXT NOT NULL,
  owner TEXT NOT NULL DEFAULT 'platform',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (kind, ref)
);
CREATE INDEX idx_evidence_graph_nodes_kind ON public.evidence_graph_nodes(kind);
CREATE INDEX idx_evidence_graph_nodes_owner ON public.evidence_graph_nodes(owner);
ALTER TABLE public.evidence_graph_nodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read evidence graph nodes"
  ON public.evidence_graph_nodes FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Service role can manage evidence graph nodes"
  ON public.evidence_graph_nodes FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 2. evidence_graph_edges
CREATE TABLE public.evidence_graph_edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_node UUID NOT NULL REFERENCES public.evidence_graph_nodes(id) ON DELETE CASCADE,
  to_node UUID NOT NULL REFERENCES public.evidence_graph_nodes(id) ON DELETE CASCADE,
  relation TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (from_node, to_node, relation)
);
CREATE INDEX idx_evidence_graph_edges_from ON public.evidence_graph_edges(from_node);
CREATE INDEX idx_evidence_graph_edges_to ON public.evidence_graph_edges(to_node);
CREATE INDEX idx_evidence_graph_edges_relation ON public.evidence_graph_edges(relation);
ALTER TABLE public.evidence_graph_edges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read evidence graph edges"
  ON public.evidence_graph_edges FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Service role can manage evidence graph edges"
  ON public.evidence_graph_edges FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 3. cron_run_receipts
CREATE TABLE public.cron_run_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_name TEXT NOT NULL,
  schedule_expression TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'running',
  duration_ms INTEGER,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_cron_run_receipts_job ON public.cron_run_receipts(job_name);
CREATE INDEX idx_cron_run_receipts_started ON public.cron_run_receipts(started_at DESC);
CREATE INDEX idx_cron_run_receipts_status ON public.cron_run_receipts(status);
ALTER TABLE public.cron_run_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read cron run receipts"
  ON public.cron_run_receipts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Service role can manage cron run receipts"
  ON public.cron_run_receipts FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 4. release_decisions (append-only)
CREATE TABLE public.release_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  release_id TEXT NOT NULL,
  gate_name TEXT NOT NULL,
  decision TEXT NOT NULL,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  decided_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_by TEXT NOT NULL DEFAULT 'release-aggregator',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_release_decisions_release ON public.release_decisions(release_id);
CREATE INDEX idx_release_decisions_gate ON public.release_decisions(gate_name);
CREATE INDEX idx_release_decisions_decided ON public.release_decisions(decided_at DESC);
ALTER TABLE public.release_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read release decisions"
  ON public.release_decisions FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Service role can insert release decisions"
  ON public.release_decisions FOR INSERT TO service_role
  WITH CHECK (true);

-- Append-only enforcement
CREATE OR REPLACE FUNCTION public.block_release_decision_mutation()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'release_decisions is append-only';
END;
$$;
CREATE TRIGGER block_release_decisions_update
  BEFORE UPDATE ON public.release_decisions
  FOR EACH ROW EXECUTE FUNCTION public.block_release_decision_mutation();
CREATE TRIGGER block_release_decisions_delete
  BEFORE DELETE ON public.release_decisions
  FOR EACH ROW EXECUTE FUNCTION public.block_release_decision_mutation();

-- 5. installed_apps_receipts
CREATE TABLE public.installed_apps_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  app_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  manifest_hash TEXT,
  manifest_signature TEXT,
  signature_verified BOOLEAN NOT NULL DEFAULT false,
  source_channel TEXT NOT NULL DEFAULT 'unknown',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_installed_apps_receipts_user ON public.installed_apps_receipts(user_id);
CREATE INDEX idx_installed_apps_receipts_app ON public.installed_apps_receipts(app_id);
CREATE INDEX idx_installed_apps_receipts_occurred ON public.installed_apps_receipts(occurred_at DESC);
ALTER TABLE public.installed_apps_receipts ENABLE ROW LEVEL SECURITY;

-- Validation trigger for action enum (no CHECK constraint per project rules)
CREATE OR REPLACE FUNCTION public.validate_installed_apps_receipt()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.action NOT IN ('install','uninstall','update','reinstall') THEN
    RAISE EXCEPTION 'invalid action: %', NEW.action;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER validate_installed_apps_receipt_trg
  BEFORE INSERT OR UPDATE ON public.installed_apps_receipts
  FOR EACH ROW EXECUTE FUNCTION public.validate_installed_apps_receipt();

CREATE POLICY "Users can view their own install receipts"
  ON public.installed_apps_receipts FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all install receipts"
  ON public.installed_apps_receipts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Users can insert their own install receipts"
  ON public.installed_apps_receipts FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage install receipts"
  ON public.installed_apps_receipts FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 6. advisor_action_proof_packs
CREATE TABLE public.advisor_action_proof_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action_id UUID NOT NULL,
  advisor_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  reversible BOOLEAN NOT NULL DEFAULT false,
  rollback_token TEXT,
  rollback_executed_at TIMESTAMPTZ,
  rollback_evidence JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_advisor_action_proof_packs_action ON public.advisor_action_proof_packs(action_id);
CREATE INDEX idx_advisor_action_proof_packs_advisor ON public.advisor_action_proof_packs(advisor_id);
CREATE INDEX idx_advisor_action_proof_packs_user ON public.advisor_action_proof_packs(user_id);
ALTER TABLE public.advisor_action_proof_packs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own advisor proof packs"
  ON public.advisor_action_proof_packs FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all advisor proof packs"
  ON public.advisor_action_proof_packs FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Service role can manage advisor proof packs"
  ON public.advisor_action_proof_packs FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 7. kill_switch_ttl_expiry_receipts (append-only)
CREATE TABLE public.kill_switch_ttl_expiry_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  switch_id TEXT NOT NULL,
  switch_row_id UUID,
  expired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expired_by_actor TEXT NOT NULL DEFAULT 'expire_overdue_kill_switches',
  prior_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_kill_switch_ttl_expiry_switch ON public.kill_switch_ttl_expiry_receipts(switch_id);
CREATE INDEX idx_kill_switch_ttl_expiry_at ON public.kill_switch_ttl_expiry_receipts(expired_at DESC);
ALTER TABLE public.kill_switch_ttl_expiry_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read kill switch ttl expiry receipts"
  ON public.kill_switch_ttl_expiry_receipts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Service role can insert kill switch ttl expiry receipts"
  ON public.kill_switch_ttl_expiry_receipts FOR INSERT TO service_role
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.block_kill_switch_ttl_mutation()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  RAISE EXCEPTION 'kill_switch_ttl_expiry_receipts is append-only';
END;
$$;
CREATE TRIGGER block_kill_switch_ttl_update
  BEFORE UPDATE ON public.kill_switch_ttl_expiry_receipts
  FOR EACH ROW EXECUTE FUNCTION public.block_kill_switch_ttl_mutation();
CREATE TRIGGER block_kill_switch_ttl_delete
  BEFORE DELETE ON public.kill_switch_ttl_expiry_receipts
  FOR EACH ROW EXECUTE FUNCTION public.block_kill_switch_ttl_mutation();

-- updated_at triggers
CREATE TRIGGER update_evidence_graph_nodes_updated_at
  BEFORE UPDATE ON public.evidence_graph_nodes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();