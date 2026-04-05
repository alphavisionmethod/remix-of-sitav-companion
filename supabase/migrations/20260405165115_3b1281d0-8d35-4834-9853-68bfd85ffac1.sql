
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
