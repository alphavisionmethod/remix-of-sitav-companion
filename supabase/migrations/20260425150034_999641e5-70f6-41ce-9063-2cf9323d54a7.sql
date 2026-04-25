-- Sensitivity ranking helper
CREATE OR REPLACE FUNCTION public.sensitivity_rank(_s TEXT)
RETURNS INT
LANGUAGE SQL
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE LOWER(COALESCE(_s, 'internal'))
    WHEN 'public' THEN 1
    WHEN 'internal' THEN 2
    WHEN 'confidential' THEN 3
    WHEN 'restricted' THEN 4
    ELSE 2
  END;
$$;

DROP FUNCTION IF EXISTS public.semantic_knowledge_chunks_federated(vector, uuid, int, float);

CREATE OR REPLACE FUNCTION public.semantic_knowledge_chunks_federated(
  _query_embedding vector,
  _workspace_id uuid,
  _max_n int DEFAULT 12,
  _min_similarity float DEFAULT 0.55
)
RETURNS TABLE (
  chunk_id uuid,
  content text,
  file_id uuid,
  pillar text,
  sensitivity text,
  similarity float,
  source_table text,
  workspace_id uuid,
  via_federation uuid
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH caller AS (SELECT auth.uid() AS uid),
  fed AS (
    SELECT
      f.id AS federation_id,
      f.max_sensitivity,
      CASE
        WHEN f.source_workspace_id = _workspace_id THEN f.target_workspace_id
        ELSE f.source_workspace_id
      END AS peer_workspace_id
    FROM public.workspace_federations f, caller c
    WHERE f.user_id = c.uid
      AND f.status = 'active'
      AND f.scope_chunks = true
      AND f.revoked_at IS NULL
      AND f.expires_at > now()
      AND (f.source_workspace_id = _workspace_id OR f.target_workspace_id = _workspace_id)
  ),
  own_rows AS (
    SELECT
      kc.id AS chunk_id,
      kc.content,
      kc.file_id,
      COALESCE((kc.metadata->>'pillar'), 'shared') AS pillar,
      COALESCE(kc.sensitivity, 'internal') AS sensitivity,
      (1 - (kc.embedding <=> _query_embedding))::float AS similarity,
      'knowledge_chunks'::text AS source_table,
      kc.workspace_id,
      NULL::uuid AS via_federation
    FROM public.knowledge_chunks kc, caller c
    WHERE kc.user_id = c.uid
      AND kc.workspace_id = _workspace_id
      AND kc.embedding IS NOT NULL
      AND kc.embedding_status = 'embedded'
  ),
  fed_rows AS (
    SELECT
      kc.id AS chunk_id,
      kc.content,
      kc.file_id,
      COALESCE((kc.metadata->>'pillar'), 'shared') AS pillar,
      COALESCE(kc.sensitivity, 'internal') AS sensitivity,
      (1 - (kc.embedding <=> _query_embedding))::float AS similarity,
      'knowledge_chunks'::text AS source_table,
      kc.workspace_id,
      f.federation_id AS via_federation
    FROM public.knowledge_chunks kc
    JOIN fed f ON f.peer_workspace_id = kc.workspace_id
    WHERE kc.embedding IS NOT NULL
      AND kc.embedding_status = 'embedded'
      AND public.sensitivity_rank(kc.sensitivity) <= public.sensitivity_rank(f.max_sensitivity)
  )
  SELECT *
  FROM (SELECT * FROM own_rows UNION ALL SELECT * FROM fed_rows) merged
  WHERE similarity >= _min_similarity
  ORDER BY similarity DESC
  LIMIT _max_n;
$$;

DROP FUNCTION IF EXISTS public.semantic_workspace_memories_federated(vector, uuid, int, float);

CREATE OR REPLACE FUNCTION public.semantic_workspace_memories_federated(
  _query_embedding vector,
  _workspace_id uuid,
  _max_n int DEFAULT 12,
  _min_similarity float DEFAULT 0.55
)
RETURNS TABLE (
  memory_id uuid,
  content text,
  category text,
  confidence numeric,
  pillar text,
  sensitivity text,
  provenance_kind text,
  workspace_id uuid,
  similarity float,
  last_used_at timestamptz,
  via_federation uuid
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH caller AS (SELECT auth.uid() AS uid),
  fed AS (
    SELECT
      f.id AS federation_id,
      f.max_sensitivity,
      CASE
        WHEN f.source_workspace_id = _workspace_id THEN f.target_workspace_id
        ELSE f.source_workspace_id
      END AS peer_workspace_id
    FROM public.workspace_federations f, caller c
    WHERE f.user_id = c.uid
      AND f.status = 'active'
      AND f.scope_memories = true
      AND f.revoked_at IS NULL
      AND f.expires_at > now()
      AND (f.source_workspace_id = _workspace_id OR f.target_workspace_id = _workspace_id)
  ),
  own_rows AS (
    SELECT
      m.id AS memory_id,
      m.content,
      m.category,
      m.confidence,
      mp.pillar,
      mp.sensitivity,
      mp.provenance_kind,
      mp.workspace_id,
      (1 - (mp.embedding <=> _query_embedding))::float AS similarity,
      mp.last_used_at,
      NULL::uuid AS via_federation
    FROM public.pb_memories m
    JOIN public.memory_provenance mp ON mp.memory_id = m.id, caller c
    WHERE m.user_id = c.uid
      AND m.status = 'active'
      AND mp.embedding IS NOT NULL
      AND mp.review_status = 'accepted'
      AND (mp.workspace_id = _workspace_id OR mp.workspace_id IS NULL)
  ),
  fed_rows AS (
    SELECT
      m.id AS memory_id,
      m.content,
      m.category,
      m.confidence,
      mp.pillar,
      mp.sensitivity,
      mp.provenance_kind,
      mp.workspace_id,
      (1 - (mp.embedding <=> _query_embedding))::float AS similarity,
      mp.last_used_at,
      f.federation_id AS via_federation
    FROM public.pb_memories m
    JOIN public.memory_provenance mp ON mp.memory_id = m.id
    JOIN fed f ON f.peer_workspace_id = mp.workspace_id
    WHERE m.status = 'active'
      AND mp.embedding IS NOT NULL
      AND mp.review_status = 'accepted'
      AND public.sensitivity_rank(mp.sensitivity) <= public.sensitivity_rank(f.max_sensitivity)
  )
  SELECT *
  FROM (SELECT * FROM own_rows UNION ALL SELECT * FROM fed_rows) merged
  WHERE similarity >= _min_similarity
  ORDER BY similarity DESC
  LIMIT _max_n;
$$;

GRANT EXECUTE ON FUNCTION public.semantic_knowledge_chunks_federated(vector, uuid, int, float) TO authenticated;
GRANT EXECUTE ON FUNCTION public.semantic_workspace_memories_federated(vector, uuid, int, float) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sensitivity_rank(text) TO authenticated;