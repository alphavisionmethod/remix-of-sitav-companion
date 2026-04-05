
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
