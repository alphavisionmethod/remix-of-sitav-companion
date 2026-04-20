-- Append-only mutation blocker
CREATE OR REPLACE FUNCTION public.block_recovery_boot_evidence_mutation()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  RAISE EXCEPTION 'recovery_boot_evidence is append-only: % not permitted', TG_OP
    USING ERRCODE = '42501';
END;
$$;

CREATE TABLE IF NOT EXISTS public.recovery_boot_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  recovery_reason text NOT NULL CHECK (recovery_reason IN ('auto-fallback','operator-menu','boot-failure','first-boot','manual-test')),
  slot text NOT NULL CHECK (slot IN ('a','b','unknown')),
  kernel_version text,
  verity_state text,
  bless_state text,
  failed_units jsonb NOT NULL DEFAULT '[]'::jsonb,
  shell_crash_count integer NOT NULL DEFAULT 0,
  tpm_pcr_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  evidence_hash text NOT NULL,
  signature text NOT NULL,
  collected_at timestamptz NOT NULL,
  inserted_at timestamptz NOT NULL DEFAULT now(),
  inserted_by uuid
);

CREATE INDEX IF NOT EXISTS idx_recovery_boot_evidence_device
  ON public.recovery_boot_evidence (device_id, collected_at DESC);
CREATE INDEX IF NOT EXISTS idx_recovery_boot_evidence_reason
  ON public.recovery_boot_evidence (recovery_reason, collected_at DESC);

ALTER TABLE public.recovery_boot_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view recovery boot evidence"
  ON public.recovery_boot_evidence FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Service role can insert recovery boot evidence"
  ON public.recovery_boot_evidence FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP TRIGGER IF EXISTS recovery_boot_evidence_no_update ON public.recovery_boot_evidence;
CREATE TRIGGER recovery_boot_evidence_no_update
  BEFORE UPDATE ON public.recovery_boot_evidence
  FOR EACH ROW EXECUTE FUNCTION public.block_recovery_boot_evidence_mutation();

DROP TRIGGER IF EXISTS recovery_boot_evidence_no_delete ON public.recovery_boot_evidence;
CREATE TRIGGER recovery_boot_evidence_no_delete
  BEFORE DELETE ON public.recovery_boot_evidence
  FOR EACH ROW EXECUTE FUNCTION public.block_recovery_boot_evidence_mutation();