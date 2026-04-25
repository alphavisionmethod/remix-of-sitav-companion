
-- ═══════════════════════════════════════════════════════════════
-- Phase 5 — Memory, Files & Knowledge Platform Hardening
-- ═══════════════════════════════════════════════════════════════

-- 1. memory_provenance ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.memory_provenance (
  memory_id              UUID PRIMARY KEY REFERENCES public.pb_memories(id) ON DELETE CASCADE,
  user_id                UUID NOT NULL,
  workspace_id           UUID,
  module_id              TEXT,
  pillar                 TEXT NOT NULL DEFAULT 'shared',
  sensitivity            TEXT NOT NULL DEFAULT 'internal',
  provenance_kind        TEXT NOT NULL DEFAULT 'explicit_user',
  source_chat_id         UUID,
  source_file_id         UUID,
  source_correlation_id  UUID,
  confidence_band        TEXT NOT NULL DEFAULT 'medium',
  usage_count            INTEGER NOT NULL DEFAULT 0,
  last_used_at           TIMESTAMPTZ,
  review_status          TEXT NOT NULL DEFAULT 'accepted',
  metadata               JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS memory_provenance_user_workspace_idx
  ON public.memory_provenance (user_id, workspace_id);
CREATE INDEX IF NOT EXISTS memory_provenance_pillar_idx
  ON public.memory_provenance (pillar);
CREATE INDEX IF NOT EXISTS memory_provenance_review_idx
  ON public.memory_provenance (review_status) WHERE review_status = 'pending_review';
CREATE INDEX IF NOT EXISTS memory_provenance_sensitivity_idx
  ON public.memory_provenance (sensitivity);

ALTER TABLE public.memory_provenance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads own provenance"
  ON public.memory_provenance FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "owner inserts own provenance"
  ON public.memory_provenance FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner updates own provenance"
  ON public.memory_provenance FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "owner deletes own provenance"
  ON public.memory_provenance FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_memory_provenance_updated_at
  BEFORE UPDATE ON public.memory_provenance
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. knowledge_chunks ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL,
  workspace_id      UUID,
  module_id         TEXT,
  pillar            TEXT NOT NULL DEFAULT 'shared',
  file_id           UUID NOT NULL,
  source_table      TEXT NOT NULL DEFAULT 'pb_files',
  chunk_index       INTEGER NOT NULL DEFAULT 0,
  content           TEXT NOT NULL,
  token_estimate    INTEGER NOT NULL DEFAULT 0,
  sensitivity       TEXT NOT NULL DEFAULT 'internal',
  embedding_status  TEXT NOT NULL DEFAULT 'pending',
  metadata          JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_search    TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', coalesce(content, ''))) STORED,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS knowledge_chunks_user_workspace_idx
  ON public.knowledge_chunks (user_id, workspace_id);
CREATE INDEX IF NOT EXISTS knowledge_chunks_file_idx
  ON public.knowledge_chunks (file_id, chunk_index);
CREATE INDEX IF NOT EXISTS knowledge_chunks_search_idx
  ON public.knowledge_chunks USING GIN (content_search);
CREATE INDEX IF NOT EXISTS knowledge_chunks_pillar_idx
  ON public.knowledge_chunks (pillar);

ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads own chunks"
  ON public.knowledge_chunks FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "owner inserts own chunks"
  ON public.knowledge_chunks FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner deletes own chunks"
  ON public.knowledge_chunks FOR DELETE
  USING (auth.uid() = user_id);
CREATE POLICY "service role manages chunks"
  ON public.knowledge_chunks FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER trg_knowledge_chunks_updated_at
  BEFORE UPDATE ON public.knowledge_chunks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. ingestion_jobs ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ingestion_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL,
  workspace_id    UUID,
  source_kind     TEXT NOT NULL,
  source_id       UUID,
  source_table    TEXT,
  stage           TEXT NOT NULL DEFAULT 'queued',
  progress        NUMERIC(4,3) NOT NULL DEFAULT 0,
  error           TEXT,
  correlation_id  UUID,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS ingestion_jobs_user_idx
  ON public.ingestion_jobs (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ingestion_jobs_active_idx
  ON public.ingestion_jobs (stage) WHERE stage NOT IN ('indexed','failed');

ALTER TABLE public.ingestion_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner reads own ingestion jobs"
  ON public.ingestion_jobs FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "owner inserts own ingestion jobs"
  ON public.ingestion_jobs FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "service role manages ingestion jobs"
  ON public.ingestion_jobs FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER trg_ingestion_jobs_updated_at
  BEFORE UPDATE ON public.ingestion_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. RPCs ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.record_memory_usage(_memory_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.memory_provenance
     SET usage_count = usage_count + 1,
         last_used_at = now(),
         updated_at = now()
   WHERE memory_id = _memory_id
     AND user_id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_memory_usage(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.effective_workspace_memories(
  _workspace_id UUID,
  _max_n INTEGER DEFAULT 25
)
RETURNS TABLE (
  memory_id UUID,
  content TEXT,
  category TEXT,
  kind TEXT,
  confidence NUMERIC,
  workspace_id UUID,
  pillar TEXT,
  sensitivity TEXT,
  provenance_kind TEXT,
  confidence_band TEXT,
  last_used_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _workspace_protected BOOLEAN := FALSE;
BEGIN
  IF _workspace_id IS NOT NULL THEN
    SELECT COALESCE(protected, FALSE) INTO _workspace_protected
      FROM public.workspace_contexts
     WHERE workspace_contexts.workspace_id = _workspace_id;
  END IF;

  RETURN QUERY
  SELECT m.id              AS memory_id,
         m.content,
         m.category,
         m.kind,
         m.confidence,
         p.workspace_id,
         p.pillar,
         p.sensitivity,
         p.provenance_kind,
         p.confidence_band,
         p.last_used_at
    FROM public.pb_memories m
    JOIN public.memory_provenance p ON p.memory_id = m.id
   WHERE m.user_id = auth.uid()
     AND p.review_status = 'accepted'
     AND m.status = 'active'
     AND (
       p.workspace_id IS NULL
       OR p.workspace_id = _workspace_id
     )
     AND (
       _workspace_protected
       OR p.sensitivity <> 'restricted'
     )
   ORDER BY
     CASE p.confidence_band
       WHEN 'verified' THEN 4
       WHEN 'high'     THEN 3
       WHEN 'medium'   THEN 2
       ELSE 1
     END DESC,
     COALESCE(p.last_used_at, m.created_at) DESC
   LIMIT _max_n;
END;
$$;

GRANT EXECUTE ON FUNCTION public.effective_workspace_memories(UUID, INTEGER) TO authenticated;

-- 5. Trust catalog seeds (4 new actions; shared.memory.delete &
--    shared.file.delete already exist from Phase 2)
INSERT INTO public.trust_action_catalog (action_key, pillar, label, description, risk_tier, require_approval, reversible, default_authority_level)
VALUES
  ('shared.memory.create',     'shared', 'Create memory',
   'Persist a new memory entry for the user.',
   'low', false, true, 'pre_approved'),
  ('shared.memory.update',     'shared', 'Update memory',
   'Edit an existing memory entry.',
   'low', false, true, 'pre_approved'),
  ('shared.file.upload',       'shared', 'Upload file',
   'Upload a new file to user storage.',
   'low', false, true, 'pre_approved'),
  ('shared.knowledge.reindex', 'shared', 'Re-index knowledge file',
   'Re-extract and re-chunk a file in the knowledge spine.',
   'low', false, true, 'pre_approved')
ON CONFLICT (action_key) DO NOTHING;

-- 6. Backfill provenance for existing memories
INSERT INTO public.memory_provenance (
  memory_id, user_id, pillar, sensitivity, provenance_kind, confidence_band, review_status
)
SELECT
  m.id,
  m.user_id,
  'shared',
  'internal',
  'system_seed',
  CASE
    WHEN m.confidence >= 0.85 THEN 'verified'
    WHEN m.confidence >= 0.65 THEN 'high'
    WHEN m.confidence >= 0.40 THEN 'medium'
    ELSE 'low'
  END,
  'accepted'
FROM public.pb_memories m
WHERE NOT EXISTS (
  SELECT 1 FROM public.memory_provenance p WHERE p.memory_id = m.id
);
