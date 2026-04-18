-- ═══════════════════════════════════════════════════════════════
-- Restore drills + OAuth refresh probes — durable receipts
-- ═══════════════════════════════════════════════════════════════

-- 1. Restore drill receipts (durable, operator-visible)
CREATE TABLE IF NOT EXISTS public.restore_drill_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drill_id text NOT NULL UNIQUE,
  drill_class text NOT NULL DEFAULT 'production-shape',
  mode text NOT NULL,
  environment text NOT NULL DEFAULT 'sandbox',
  started_at timestamptz NOT NULL,
  finished_at timestamptz NOT NULL,
  duration_ms integer NOT NULL,
  status text NOT NULL,
  backup_file text,
  backup_mode text,
  registry_table_count integer NOT NULL DEFAULT 0,
  backup_table_count integer NOT NULL DEFAULT 0,
  match_percent numeric NOT NULL DEFAULT 0,
  rls_pass_count integer NOT NULL DEFAULT 0,
  rls_fail_count integer NOT NULL DEFAULT 0,
  critical_route_pass_count integer NOT NULL DEFAULT 0,
  critical_route_fail_count integer NOT NULL DEFAULT 0,
  verification_matrix jsonb NOT NULL DEFAULT '{}'::jsonb,
  errors jsonb NOT NULL DEFAULT '[]'::jsonb,
  warnings jsonb NOT NULL DEFAULT '[]'::jsonb,
  runner_identity text,
  artifact_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restore_drill_receipts_finished ON public.restore_drill_receipts(finished_at DESC);
CREATE INDEX IF NOT EXISTS idx_restore_drill_receipts_status ON public.restore_drill_receipts(status);

ALTER TABLE public.restore_drill_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view restore drill receipts"
ON public.restore_drill_receipts FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Service role can insert restore drill receipts"
ON public.restore_drill_receipts FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 2. OAuth refresh probe results (durable health truth)
CREATE TABLE IF NOT EXISTS public.oauth_refresh_probe_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  probe_id text NOT NULL,
  user_id uuid NOT NULL,
  provider text NOT NULL,
  account_id text,
  token_row_id uuid,
  probe_started_at timestamptz NOT NULL DEFAULT now(),
  probe_finished_at timestamptz,
  duration_ms integer,
  status text NOT NULL DEFAULT 'pending',
  failure_class text,
  failure_reason text,
  retry_count integer NOT NULL DEFAULT 0,
  lifecycle_state text NOT NULL DEFAULT 'unknown',
  alert_state text NOT NULL DEFAULT 'ok',
  reauth_required boolean NOT NULL DEFAULT false,
  next_probe_due_at timestamptz,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oauth_probe_provider_user ON public.oauth_refresh_probe_results(user_id, provider, probe_started_at DESC);
CREATE INDEX IF NOT EXISTS idx_oauth_probe_lifecycle ON public.oauth_refresh_probe_results(lifecycle_state, alert_state);

ALTER TABLE public.oauth_refresh_probe_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own probe results"
ON public.oauth_refresh_probe_results FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can insert probe results"
ON public.oauth_refresh_probe_results FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role) OR auth.uid() = user_id);

-- 3. Drill cadence registry (formalize recurring discipline)
CREATE TABLE IF NOT EXISTS public.drill_cadence_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drill_key text NOT NULL UNIQUE,
  display_name text NOT NULL,
  category text NOT NULL,
  cadence_label text NOT NULL,
  cadence_interval_hours integer NOT NULL,
  owner_role text NOT NULL,
  backup_owner_role text,
  evidence_path text,
  evidence_table text,
  last_run_at timestamptz,
  last_status text,
  next_due_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.drill_cadence_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drill cadence is admin-readable"
ON public.drill_cadence_registry FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can manage drill cadence"
ON public.drill_cadence_registry FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER trg_drill_cadence_updated
BEFORE UPDATE ON public.drill_cadence_registry
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed canonical cadence rows
INSERT INTO public.drill_cadence_registry (drill_key, display_name, category, cadence_label, cadence_interval_hours, owner_role, backup_owner_role, evidence_path, evidence_table, description) VALUES
  ('restore-drill-production-shape', 'Production-shape Restore Drill', 'disaster-recovery', 'monthly', 720, 'platform-sre', 'platform-lead', 'generated/restore-drill-report.json', 'restore_drill_receipts', 'Full production-shape restore + post-restore verification matrix'),
  ('oauth-refresh-probe-google', 'OAuth Refresh Probe — Google', 'connector-health', 'hourly', 1, 'platform-sre', 'integrations-lead', NULL, 'oauth_refresh_probe_results', 'Live refresh probe for Google connectors'),
  ('oauth-refresh-probe-microsoft', 'OAuth Refresh Probe — Microsoft', 'connector-health', 'hourly', 1, 'platform-sre', 'integrations-lead', NULL, 'oauth_refresh_probe_results', 'Live refresh probe for Microsoft Graph connectors'),
  ('oauth-refresh-probe-slack', 'OAuth Refresh Probe — Slack', 'connector-health', 'hourly', 1, 'platform-sre', 'integrations-lead', NULL, 'oauth_refresh_probe_results', 'Live refresh probe for Slack connectors'),
  ('release-artifact-verification', 'Release Artifact Verification', 'release', 'pre-release', 168, 'release-captain', 'platform-lead', 'generated/os-release-readiness-report.json', NULL, 'Verify all release gates GREEN before publish'),
  ('baseline-seal-verification', 'Baseline Seal Verification', 'governance', 'weekly', 168, 'platform-lead', 'security-lead', 'generated/baseline-seal-status.json', NULL, 'Verify cryptographic ratchet seal integrity'),
  ('notification-calmness-review', 'Notification Calmness Review', 'ux', 'weekly', 168, 'design-lead', 'product-lead', NULL, NULL, 'Review notification volume + calm metrics'),
  ('admin-golden-path-drill', 'Admin Operator Golden Path Drill', 'operator-readiness', 'monthly', 720, 'platform-sre', 'support-lead', NULL, NULL, 'Execute the 5 canonical operator golden paths end-to-end'),
  ('boardroom-followthrough-runbook-drill', 'Boardroom Layer 7 Runbook Drill', 'operator-readiness', 'monthly', 720, 'platform-sre', 'product-lead', NULL, 'boardroom_followthrough_dispatches', 'Execute Boardroom L7 runbook against synthetic stuck/failed dispatches')
ON CONFLICT (drill_key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  category = EXCLUDED.category,
  cadence_label = EXCLUDED.cadence_label,
  cadence_interval_hours = EXCLUDED.cadence_interval_hours,
  owner_role = EXCLUDED.owner_role,
  backup_owner_role = EXCLUDED.backup_owner_role,
  evidence_path = EXCLUDED.evidence_path,
  evidence_table = EXCLUDED.evidence_table,
  description = EXCLUDED.description,
  updated_at = now();