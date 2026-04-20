-- Seed one baseline signed attestation receipt for mobile substrate archived posture.
-- Idempotent: only inserts if no baseline row exists.
DO $$
DECLARE
  v_evidence_payload TEXT;
  v_evidence_hash TEXT;
  v_signature_payload TEXT;
  v_signature TEXT;
  v_attestor UUID := '00000000-0000-0000-0000-000000000001';
  v_metadata JSONB;
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.mobile_deferral_attestations
    WHERE notes LIKE 'Initial baseline%'
  ) THEN
    RAISE NOTICE 'baseline mobile-deferral attestation already exists; skipping seed';
    RETURN;
  END IF;

  v_metadata := jsonb_build_object(
    'truth_refs', jsonb_build_array(
      'archive/mobile/ARCHIVED.md',
      'docs/MOBILE_HONESTY.md',
      'generated/mobile-scope-closure/MOBILE_REACTIVATION_CONDITIONS.md',
      'generated/mobile-scope-closure/MOBILE_SCOPE_CANONICAL_MODEL.md',
      'generated/mobile-deferral-attestation-report.json'
    ),
    'classification', 'ARCHIVED/FUTURE_VISION_ONLY/NOT_LAUNCH_SURFACE',
    'install_paths_status', 'intentionally_not_green',
    'seeded_at', now()::text,
    'seed_version', '1.0.0'
  );

  v_evidence_payload := v_metadata::text;
  v_evidence_hash := encode(digest(v_evidence_payload, 'sha256'), 'hex');

  v_signature_payload := 'archived' || '|' || 'archive/mobile/' || '|' || v_evidence_hash || '|' || v_attestor::text;
  v_signature := encode(digest(v_signature_payload, 'sha256'), 'hex');

  INSERT INTO public.mobile_deferral_attestations (
    attested_by,
    posture,
    archive_path,
    evidence_hash,
    signature,
    notes,
    metadata
  ) VALUES (
    v_attestor,
    'archived',
    'archive/mobile/',
    v_evidence_hash,
    v_signature,
    'Initial baseline attestation: mobile substrate archived; install paths intentionally not green per docs/MOBILE_HONESTY.md.',
    v_metadata
  );
END $$;