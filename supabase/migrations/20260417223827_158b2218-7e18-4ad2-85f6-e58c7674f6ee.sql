-- ═══════════════════════════════════════════════════════════════
-- Migration: Canonical Backend Truth Tables (15 net-new)
-- ═══════════════════════════════════════════════════════════════

-- 1. APPROVAL_REQUESTS
CREATE TABLE IF NOT EXISTS public.approval_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  requested_by UUID NOT NULL,
  subject_type TEXT NOT NULL,
  subject_id UUID,
  action_key TEXT NOT NULL,
  policy_id UUID,
  policy_basis JSONB NOT NULL DEFAULT '{}'::jsonb,
  required_approvers INT NOT NULL DEFAULT 1,
  approver_roles TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  risk_tier TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  escalation_state TEXT NOT NULL DEFAULT 'none',
  escalated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  context JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_approval_requests_user ON public.approval_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON public.approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_subject ON public.approval_requests(subject_type, subject_id);
ALTER TABLE public.approval_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own approval_requests" ON public.approval_requests FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users insert own approval_requests" ON public.approval_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own approval_requests" ON public.approval_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users delete own approval_requests" ON public.approval_requests FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_approval_requests_updated_at BEFORE UPDATE ON public.approval_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. RECEIPTS
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  receipt_class TEXT NOT NULL,
  subject_type TEXT NOT NULL,
  subject_id UUID,
  actor_user_id UUID,
  actor_kind TEXT NOT NULL DEFAULT 'user',
  action_key TEXT NOT NULL,
  outcome TEXT NOT NULL DEFAULT 'success',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  hash TEXT,
  prev_hash TEXT,
  signature TEXT,
  parent_receipt_id UUID REFERENCES public.receipts(id) ON DELETE SET NULL,
  correlation_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_receipts_user ON public.receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_class ON public.receipts(receipt_class);
CREATE INDEX IF NOT EXISTS idx_receipts_subject ON public.receipts(subject_type, subject_id);
CREATE INDEX IF NOT EXISTS idx_receipts_correlation ON public.receipts(correlation_id);
CREATE INDEX IF NOT EXISTS idx_receipts_created ON public.receipts(created_at DESC);
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own receipts" ON public.receipts FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users insert own receipts" ON public.receipts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "admins delete receipts" ON public.receipts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 3. NOTIFICATION_DELIVERIES
CREATE TABLE IF NOT EXISTS public.notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_id UUID NOT NULL,
  channel TEXT NOT NULL,
  endpoint_ref TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  attempt_count INT NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  error_code TEXT,
  error_message TEXT,
  provider_response JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notif_deliveries_user ON public.notification_deliveries(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_deliveries_notification ON public.notification_deliveries(notification_id);
CREATE INDEX IF NOT EXISTS idx_notif_deliveries_status ON public.notification_deliveries(status);
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own notif_deliveries" ON public.notification_deliveries FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users insert own notif_deliveries" ON public.notification_deliveries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own notif_deliveries" ON public.notification_deliveries FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_notif_deliveries_updated_at BEFORE UPDATE ON public.notification_deliveries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. SYNC_CONFLICTS
CREATE TABLE IF NOT EXISTS public.sync_conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  sync_object_id UUID NOT NULL,
  namespace TEXT NOT NULL,
  conflict_kind TEXT NOT NULL DEFAULT 'version',
  local_version INT,
  remote_version INT,
  local_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  remote_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  resolution_strategy TEXT,
  resolved_payload JSONB,
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'open',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_user ON public.sync_conflicts(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_object ON public.sync_conflicts(sync_object_id);
CREATE INDEX IF NOT EXISTS idx_sync_conflicts_status ON public.sync_conflicts(status);
ALTER TABLE public.sync_conflicts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own sync_conflicts" ON public.sync_conflicts FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users insert own sync_conflicts" ON public.sync_conflicts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own sync_conflicts" ON public.sync_conflicts FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users delete own sync_conflicts" ON public.sync_conflicts FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_sync_conflicts_updated_at BEFORE UPDATE ON public.sync_conflicts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. UPDATES
CREATE TABLE IF NOT EXISTS public.updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  update_key TEXT NOT NULL,
  component TEXT NOT NULL,
  current_version TEXT,
  target_version TEXT NOT NULL,
  ring_key TEXT NOT NULL DEFAULT 'stable',
  artifact_id UUID,
  install_status TEXT NOT NULL DEFAULT 'available',
  scheduled_at TIMESTAMPTZ,
  installed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  release_notes TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_updates_user ON public.updates(user_id);
CREATE INDEX IF NOT EXISTS idx_updates_status ON public.updates(install_status);
CREATE INDEX IF NOT EXISTS idx_updates_ring ON public.updates(ring_key);
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own updates" ON public.updates FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users insert own updates" ON public.updates FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own updates" ON public.updates FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users delete own updates" ON public.updates FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_updates_updated_at BEFORE UPDATE ON public.updates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. RELEASE_RINGS
CREATE TABLE IF NOT EXISTS public.release_rings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ring_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  rollout_order INT NOT NULL DEFAULT 0,
  rollout_percent NUMERIC NOT NULL DEFAULT 100,
  cohort_definition JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  promotes_to TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.release_rings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone authenticated reads release_rings" ON public.release_rings FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage release_rings" ON public.release_rings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_release_rings_updated_at BEFORE UPDATE ON public.release_rings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. RELEASE_ARTIFACTS
CREATE TABLE IF NOT EXISTS public.release_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artifact_key TEXT NOT NULL,
  component TEXT NOT NULL,
  version TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'stable',
  hash TEXT NOT NULL,
  signature TEXT,
  size_bytes BIGINT,
  download_url TEXT,
  compatibility JSONB NOT NULL DEFAULT '{}'::jsonb,
  release_notes TEXT,
  is_yanked BOOLEAN NOT NULL DEFAULT false,
  yanked_reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (component, version, channel)
);
CREATE INDEX IF NOT EXISTS idx_release_artifacts_component ON public.release_artifacts(component);
CREATE INDEX IF NOT EXISTS idx_release_artifacts_channel ON public.release_artifacts(channel);
ALTER TABLE public.release_artifacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone authenticated reads release_artifacts" ON public.release_artifacts FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage release_artifacts" ON public.release_artifacts FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_release_artifacts_updated_at BEFORE UPDATE ON public.release_artifacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. ROLLBACKS
CREATE TABLE IF NOT EXISTS public.rollbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  initiated_by UUID NOT NULL,
  subject_type TEXT NOT NULL,
  subject_id UUID,
  from_version TEXT,
  to_version TEXT NOT NULL,
  artifact_id UUID REFERENCES public.release_artifacts(id) ON DELETE SET NULL,
  cause TEXT NOT NULL,
  cause_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  verification_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  receipt_id UUID REFERENCES public.receipts(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rollbacks_user ON public.rollbacks(user_id);
CREATE INDEX IF NOT EXISTS idx_rollbacks_status ON public.rollbacks(status);
CREATE INDEX IF NOT EXISTS idx_rollbacks_subject ON public.rollbacks(subject_type, subject_id);
ALTER TABLE public.rollbacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own rollbacks" ON public.rollbacks FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users insert own rollbacks" ON public.rollbacks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own rollbacks" ON public.rollbacks FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_rollbacks_updated_at BEFORE UPDATE ON public.rollbacks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 9. POLICIES (universal store)
CREATE TABLE IF NOT EXISTS public.policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  policy_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  domain TEXT NOT NULL DEFAULT 'general',
  scope TEXT NOT NULL DEFAULT 'global',
  version INT NOT NULL DEFAULT 1,
  evaluation_mode TEXT NOT NULL DEFAULT 'enforce',
  rule_logic JSONB NOT NULL DEFAULT '{}'::jsonb,
  parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  effective_until TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_policies_user_key_version ON public.policies(user_id, policy_key, version) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_policies_global_key_version ON public.policies(policy_key, version) WHERE user_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_policies_user ON public.policies(user_id);
CREATE INDEX IF NOT EXISTS idx_policies_key ON public.policies(policy_key);
CREATE INDEX IF NOT EXISTS idx_policies_domain ON public.policies(domain);
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own or global policies" ON public.policies FOR SELECT TO authenticated USING (user_id IS NULL OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users insert own policies" ON public.policies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own policies" ON public.policies FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins manage global policies" ON public.policies FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_policies_updated_at BEFORE UPDATE ON public.policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 10. AI_INVOCATIONS
CREATE TABLE IF NOT EXISTS public.ai_invocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  capability_key TEXT NOT NULL,
  prompt_class TEXT NOT NULL DEFAULT 'general',
  prompt_family_id TEXT,
  prompt_version_id TEXT,
  model TEXT NOT NULL,
  provider TEXT,
  request_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  response_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  prompt_tokens INT,
  completion_tokens INT,
  total_tokens INT,
  latency_ms INT,
  estimated_cost_usd NUMERIC(12,6),
  error_code TEXT,
  error_message TEXT,
  correlation_id UUID,
  invoked_by_role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '90 days')
);
CREATE INDEX IF NOT EXISTS idx_ai_invocations_user ON public.ai_invocations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_invocations_capability ON public.ai_invocations(capability_key);
CREATE INDEX IF NOT EXISTS idx_ai_invocations_created ON public.ai_invocations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_invocations_status ON public.ai_invocations(status);
ALTER TABLE public.ai_invocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own ai_invocations" ON public.ai_invocations FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users insert own ai_invocations" ON public.ai_invocations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- 11. AI_ACTION_RECEIPTS
CREATE TABLE IF NOT EXISTS public.ai_action_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  invocation_id UUID REFERENCES public.ai_invocations(id) ON DELETE CASCADE,
  recommendation_summary TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence NUMERIC NOT NULL DEFAULT 0,
  risk_tier TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'proposed',
  approval_request_id UUID REFERENCES public.approval_requests(id) ON DELETE SET NULL,
  executed_at TIMESTAMPTZ,
  receipt_id UUID REFERENCES public.receipts(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_action_receipts_user ON public.ai_action_receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_action_receipts_status ON public.ai_action_receipts(status);
CREATE INDEX IF NOT EXISTS idx_ai_action_receipts_invocation ON public.ai_action_receipts(invocation_id);
ALTER TABLE public.ai_action_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own ai_action_receipts" ON public.ai_action_receipts FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users insert own ai_action_receipts" ON public.ai_action_receipts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own ai_action_receipts" ON public.ai_action_receipts FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_ai_action_receipts_updated_at BEFORE UPDATE ON public.ai_action_receipts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 12. GRAPH_NODES
CREATE TABLE IF NOT EXISTS public.graph_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  node_key TEXT NOT NULL,
  node_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
  importance NUMERIC NOT NULL DEFAULT 0.5,
  source TEXT NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, node_key)
);
CREATE INDEX IF NOT EXISTS idx_graph_nodes_user ON public.graph_nodes(user_id);
CREATE INDEX IF NOT EXISTS idx_graph_nodes_type ON public.graph_nodes(node_type);
ALTER TABLE public.graph_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own graph_nodes" ON public.graph_nodes FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users insert own graph_nodes" ON public.graph_nodes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own graph_nodes" ON public.graph_nodes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users delete own graph_nodes" ON public.graph_nodes FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_graph_nodes_updated_at BEFORE UPDATE ON public.graph_nodes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 13. OBSERVABILITY_METRICS
CREATE TABLE IF NOT EXISTS public.observability_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  metric_key TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'user',
  scope_ref TEXT,
  value NUMERIC NOT NULL,
  unit TEXT,
  dimension JSONB NOT NULL DEFAULT '{}'::jsonb,
  observed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  window_start TIMESTAMPTZ,
  window_end TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'platform',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days')
);
CREATE INDEX IF NOT EXISTS idx_obs_metrics_user ON public.observability_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_obs_metrics_key ON public.observability_metrics(metric_key);
CREATE INDEX IF NOT EXISTS idx_obs_metrics_observed ON public.observability_metrics(observed_at DESC);
ALTER TABLE public.observability_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own or global obs_metrics" ON public.observability_metrics FOR SELECT TO authenticated USING (user_id IS NULL OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users insert own obs_metrics" ON public.observability_metrics FOR INSERT TO authenticated WITH CHECK (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "admins manage obs_metrics" ON public.observability_metrics FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 14. AUDIT_LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  actor_user_id UUID,
  actor_kind TEXT NOT NULL DEFAULT 'user',
  action TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  severity TEXT NOT NULL DEFAULT 'info',
  subject_type TEXT,
  subject_id UUID,
  ip_address INET,
  user_agent TEXT,
  session_id UUID,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  before_state JSONB,
  after_state JSONB,
  result TEXT NOT NULL DEFAULT 'success',
  reason TEXT,
  correlation_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_subject ON public.audit_logs(subject_type, subject_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs(created_at DESC);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own audit_logs" ON public.audit_logs FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = actor_user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "authenticated insert audit_logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_user_id OR auth.uid() = user_id);
CREATE POLICY "admins delete audit_logs" ON public.audit_logs FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 15. RECOVERY_SNAPSHOTS
CREATE TABLE IF NOT EXISTS public.recovery_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  snapshot_key TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'user',
  scope_ref TEXT,
  snapshot_type TEXT NOT NULL DEFAULT 'full',
  storage_location TEXT NOT NULL,
  size_bytes BIGINT,
  hash TEXT,
  encryption_kind TEXT NOT NULL DEFAULT 'aes256-gcm',
  status TEXT NOT NULL DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  failure_reason TEXT,
  verified_at TIMESTAMPTZ,
  verification_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  retention_until TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_recovery_snapshots_user ON public.recovery_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_recovery_snapshots_status ON public.recovery_snapshots(status);
ALTER TABLE public.recovery_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view own recovery_snapshots" ON public.recovery_snapshots FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "users insert own recovery_snapshots" ON public.recovery_snapshots FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own recovery_snapshots" ON public.recovery_snapshots FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete recovery_snapshots" ON public.recovery_snapshots FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER trg_recovery_snapshots_updated_at BEFORE UPDATE ON public.recovery_snapshots FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Realtime
ALTER TABLE public.approval_requests REPLICA IDENTITY FULL;
ALTER TABLE public.receipts REPLICA IDENTITY FULL;
ALTER TABLE public.notification_deliveries REPLICA IDENTITY FULL;
ALTER TABLE public.sync_conflicts REPLICA IDENTITY FULL;
ALTER TABLE public.updates REPLICA IDENTITY FULL;
ALTER TABLE public.rollbacks REPLICA IDENTITY FULL;
ALTER TABLE public.ai_action_receipts REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.approval_requests; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.receipts; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_deliveries; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.sync_conflicts; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.updates; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.rollbacks; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_action_receipts; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;