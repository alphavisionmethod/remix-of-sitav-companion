-- ── Phase 8.1 — Cross-workspace federation ───────────────────────
CREATE TABLE IF NOT EXISTS public.workspace_federations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source_workspace_id uuid NOT NULL,
  target_workspace_id uuid NOT NULL,
  scope_memories boolean NOT NULL DEFAULT true,
  scope_chunks boolean NOT NULL DEFAULT true,
  scope_voice boolean NOT NULL DEFAULT false,
  max_sensitivity text NOT NULL DEFAULT 'internal',
  rationale text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '365 days'),
  revoked_at timestamptz NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT workspace_federations_distinct CHECK (source_workspace_id <> target_workspace_id),
  CONSTRAINT workspace_federations_status_chk CHECK (status IN ('active','revoked','expired')),
  CONSTRAINT workspace_federations_sens_chk CHECK (max_sensitivity IN ('public','internal','confidential','restricted'))
);
CREATE UNIQUE INDEX IF NOT EXISTS workspace_federations_unique_active
  ON public.workspace_federations (user_id, source_workspace_id, target_workspace_id)
  WHERE status = 'active';
CREATE INDEX IF NOT EXISTS workspace_federations_user_idx ON public.workspace_federations(user_id);
ALTER TABLE public.workspace_federations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wf_owner_select" ON public.workspace_federations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "wf_owner_insert" ON public.workspace_federations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "wf_owner_update" ON public.workspace_federations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "wf_owner_delete" ON public.workspace_federations FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.workspace_federation_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  federation_id uuid NOT NULL REFERENCES public.workspace_federations(id) ON DELETE CASCADE,
  resource_kind text NOT NULL,
  resource_id uuid NOT NULL,
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '365 days'),
  revoked_at timestamptz NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT wfg_kind_chk CHECK (resource_kind IN ('memory','chunk','voice_transcript'))
);
CREATE UNIQUE INDEX IF NOT EXISTS wfg_unique
  ON public.workspace_federation_grants (federation_id, resource_kind, resource_id)
  WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS wfg_user_idx ON public.workspace_federation_grants(user_id);
ALTER TABLE public.workspace_federation_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wfg_owner_all" ON public.workspace_federation_grants FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at trigger (uses existing helper)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column' AND pronamespace = 'public'::regnamespace) THEN
    EXECUTE 'CREATE TRIGGER trg_wf_updated BEFORE UPDATE ON public.workspace_federations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()';
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END$$;

-- ── Phase 8.2 — Multi-modal embedding columns ────────────────────
ALTER TABLE public.knowledge_chunks
  ADD COLUMN IF NOT EXISTS modality text NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS media_uri text NULL,
  ADD COLUMN IF NOT EXISTS media_mime text NULL;
ALTER TABLE public.knowledge_chunks
  DROP CONSTRAINT IF EXISTS knowledge_chunks_modality_chk;
ALTER TABLE public.knowledge_chunks
  ADD CONSTRAINT knowledge_chunks_modality_chk CHECK (modality IN ('text','image','audio','video'));

ALTER TABLE public.memory_provenance
  ADD COLUMN IF NOT EXISTS modality text NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS media_uri text NULL,
  ADD COLUMN IF NOT EXISTS media_mime text NULL;
ALTER TABLE public.memory_provenance
  DROP CONSTRAINT IF EXISTS memory_provenance_modality_chk;
ALTER TABLE public.memory_provenance
  ADD CONSTRAINT memory_provenance_modality_chk CHECK (modality IN ('text','image','audio','video'));

CREATE INDEX IF NOT EXISTS knowledge_chunks_modality_idx ON public.knowledge_chunks(modality) WHERE modality <> 'text';
CREATE INDEX IF NOT EXISTS memory_provenance_modality_idx ON public.memory_provenance(modality) WHERE modality <> 'text';

-- ── Phase 8.3 — Voice intent dispatch ────────────────────────────
ALTER TABLE public.voice_intents
  ADD COLUMN IF NOT EXISTS dispatched_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS dispatch_correlation_id uuid NULL;

ALTER TABLE public.voice_intents
  DROP CONSTRAINT IF EXISTS voice_intents_status_chk;
ALTER TABLE public.voice_intents
  ADD CONSTRAINT voice_intents_status_chk
  CHECK (status IN ('proposed','approved','rejected','executed','expired','dispatched'));

-- ── Federation overview view ─────────────────────────────────────
CREATE OR REPLACE VIEW public.workspace_federation_overview AS
SELECT
  f.user_id,
  f.id AS federation_id,
  f.source_workspace_id,
  f.target_workspace_id,
  f.status,
  f.max_sensitivity,
  f.scope_memories,
  f.scope_chunks,
  f.scope_voice,
  f.expires_at,
  f.revoked_at,
  f.created_at,
  COUNT(g.id) FILTER (WHERE g.revoked_at IS NULL) AS active_grants,
  COUNT(g.id) FILTER (WHERE g.resource_kind = 'memory' AND g.revoked_at IS NULL) AS memory_grants,
  COUNT(g.id) FILTER (WHERE g.resource_kind = 'chunk' AND g.revoked_at IS NULL) AS chunk_grants,
  MAX(g.granted_at) AS last_grant_at
FROM public.workspace_federations f
LEFT JOIN public.workspace_federation_grants g ON g.federation_id = f.id AND g.user_id = f.user_id
GROUP BY f.id, f.user_id;

-- ── RPC: federate_memories ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.federate_memories(_federation_id uuid, _memory_ids uuid[])
RETURNS TABLE(memory_id uuid, granted boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_fed public.workspace_federations%ROWTYPE;
  v_mid uuid;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  SELECT * INTO v_fed FROM public.workspace_federations
    WHERE id = _federation_id AND user_id = v_user AND status = 'active' AND (revoked_at IS NULL) AND expires_at > now();
  IF NOT FOUND THEN RAISE EXCEPTION 'federation_not_active'; END IF;
  IF NOT v_fed.scope_memories THEN RAISE EXCEPTION 'federation_scope_excludes_memories'; END IF;

  FOREACH v_mid IN ARRAY _memory_ids LOOP
    BEGIN
      INSERT INTO public.workspace_federation_grants (user_id, federation_id, resource_kind, resource_id, metadata)
      VALUES (v_user, _federation_id, 'memory', v_mid, jsonb_build_object('source_workspace', v_fed.source_workspace_id, 'target_workspace', v_fed.target_workspace_id));
      memory_id := v_mid; granted := true; RETURN NEXT;
    EXCEPTION WHEN unique_violation THEN
      memory_id := v_mid; granted := false; RETURN NEXT;
    END;
  END LOOP;
END;
$$;

-- ── RPC: dispatch_voice_intent ───────────────────────────────────
CREATE OR REPLACE FUNCTION public.dispatch_voice_intent(_intent_id uuid)
RETURNS TABLE(intent_id uuid, action_key text, params jsonb, rationale text, confidence numeric, correlation_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_corr uuid := gen_random_uuid();
  v_row public.voice_intents%ROWTYPE;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  SELECT * INTO v_row FROM public.voice_intents
    WHERE id = _intent_id AND user_id = v_user;
  IF NOT FOUND THEN RAISE EXCEPTION 'intent_not_found'; END IF;
  IF v_row.status NOT IN ('approved','proposed') THEN RAISE EXCEPTION 'intent_not_dispatchable: %', v_row.status; END IF;

  UPDATE public.voice_intents
    SET status = 'dispatched', dispatched_at = now(), dispatch_correlation_id = v_corr, updated_at = now()
    WHERE id = _intent_id;

  intent_id := v_row.id;
  action_key := v_row.action_key;
  params := v_row.params;
  rationale := v_row.rationale;
  confidence := v_row.confidence;
  correlation_id := v_corr;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION public.federate_memories(uuid, uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.dispatch_voice_intent(uuid) TO authenticated;