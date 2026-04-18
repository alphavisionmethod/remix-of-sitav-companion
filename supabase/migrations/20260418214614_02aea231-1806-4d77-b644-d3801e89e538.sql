-- ═══════════════════════════════════════════════════════════════
-- Phase 9A — Sovereign Deployment & DR
-- ═══════════════════════════════════════════════════════════════

-- 1) DR drills (production-shape failover rehearsals)
CREATE TABLE IF NOT EXISTS public.dr_drills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  drill_key text NOT NULL,
  drill_type text NOT NULL DEFAULT 'failover' CHECK (drill_type IN ('failover','restore','partial-restore','region-loss','data-corruption')),
  scope text NOT NULL DEFAULT 'staging' CHECK (scope IN ('staging','production-shape','production')),
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','running','passed','failed','aborted')),
  rto_target_seconds integer NOT NULL DEFAULT 3600,
  rpo_target_seconds integer NOT NULL DEFAULT 900,
  rto_actual_seconds integer,
  rpo_actual_seconds integer,
  data_integrity_pct numeric(5,2),
  notes text,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  scheduled_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.dr_drills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read dr_drills" ON public.dr_drills FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'::public.app_role));
CREATE POLICY "admins write dr_drills" ON public.dr_drills FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::public.app_role));

-- 2) Signed release artifacts (SHA-256 + ed25519 signature ledger)
CREATE TABLE IF NOT EXISTS public.signed_release_artifacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  release_tag text NOT NULL,
  artifact_kind text NOT NULL CHECK (artifact_kind IN ('iso','img','ova','container','wasm-bundle','migration-bundle')),
  artifact_name text NOT NULL,
  size_bytes bigint NOT NULL DEFAULT 0,
  sha256 text NOT NULL,
  signature text NOT NULL,
  signed_by text NOT NULL DEFAULT 'sita-release-key-v1',
  attestation jsonb NOT NULL DEFAULT '{}'::jsonb,
  verified boolean NOT NULL DEFAULT false,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (release_tag, artifact_name)
);
ALTER TABLE public.signed_release_artifacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read sra" ON public.signed_release_artifacts FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'::public.app_role));
CREATE POLICY "admins write sra" ON public.signed_release_artifacts FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::public.app_role));

-- 3) Region failover events (record-only — failover itself is L3-staged)
CREATE TABLE IF NOT EXISTS public.region_failover_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_region text NOT NULL,
  to_region text NOT NULL,
  trigger_kind text NOT NULL CHECK (trigger_kind IN ('drill','manual','automated-recommendation','health-degradation')),
  status text NOT NULL DEFAULT 'staged' CHECK (status IN ('staged','approved','executing','completed','rolled-back','failed')),
  staged_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  approval_request_id uuid,
  duration_seconds integer,
  data_loss_seconds integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.region_failover_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read rfe" ON public.region_failover_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'::public.app_role));
CREATE POLICY "admins write rfe" ON public.region_failover_events FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::public.app_role));

-- 4) Immutable audit export bundles
CREATE TABLE IF NOT EXISTS public.audit_export_bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_key text NOT NULL UNIQUE,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  record_count bigint NOT NULL DEFAULT 0,
  sha256 text NOT NULL,
  signature text NOT NULL,
  storage_path text,
  status text NOT NULL DEFAULT 'sealed' CHECK (status IN ('building','sealed','exported','expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  exported_at timestamptz
);
ALTER TABLE public.audit_export_bundles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read aeb" ON public.audit_export_bundles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'::public.app_role));
CREATE POLICY "admins write aeb" ON public.audit_export_bundles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin'::public.app_role)) WITH CHECK (public.has_role(auth.uid(),'admin'::public.app_role));

-- 5) L3 clamp helper for DR actions
CREATE OR REPLACE FUNCTION public.clamp_dr_action_autonomy(requested integer)
RETURNS integer LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT LEAST(GREATEST(COALESCE(requested,0), 0), 3);
$$;

-- 6) Trigger: any DR action above L3 is clamped via region_failover_events
CREATE OR REPLACE FUNCTION public.enforce_dr_l3_ceiling()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status NOT IN ('staged','approved','rolled-back','failed') AND NEW.approval_request_id IS NULL THEN
    NEW.status := 'staged';
    NEW.notes := COALESCE(NEW.notes,'') || ' [auto-clamped to staged: L3 ceiling]';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_dr_l3_ceiling ON public.region_failover_events;
CREATE TRIGGER trg_dr_l3_ceiling BEFORE INSERT OR UPDATE ON public.region_failover_events
  FOR EACH ROW EXECUTE FUNCTION public.enforce_dr_l3_ceiling();

CREATE INDEX IF NOT EXISTS idx_dr_drills_status ON public.dr_drills(status, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_sra_release ON public.signed_release_artifacts(release_tag);
CREATE INDEX IF NOT EXISTS idx_rfe_status ON public.region_failover_events(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aeb_period ON public.audit_export_bundles(period_end DESC);