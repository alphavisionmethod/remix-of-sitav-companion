-- =========================================================
-- Phase 6 — Vector Embeddings & Voice-to-Memory Bridge
-- =========================================================

-- 6.1 Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 6.1 Embedding columns on knowledge spine
ALTER TABLE public.knowledge_chunks
  ADD COLUMN IF NOT EXISTS embedding vector(768),
  ADD COLUMN IF NOT EXISTS embedding_model text,
  ADD COLUMN IF NOT EXISTS embedding_dim int,
  ADD COLUMN IF NOT EXISTS embedded_at timestamptz;

ALTER TABLE public.memory_provenance
  ADD COLUMN IF NOT EXISTS embedding vector(768),
  ADD COLUMN IF NOT EXISTS embedding_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS embedding_model text,
  ADD COLUMN IF NOT EXISTS embedding_dim int,
  ADD COLUMN IF NOT EXISTS embedded_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding_status
  ON public.knowledge_chunks (embedding_status)
  WHERE embedding_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_memory_provenance_embedding_status
  ON public.memory_provenance (embedding_status)
  WHERE embedding_status = 'pending';

-- 6.6 voice_sessions
CREATE TABLE IF NOT EXISTS public.voice_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  workspace_id uuid NULL,
  module_id text NULL,
  pillar text NOT NULL DEFAULT 'shared',
  provider text NOT NULL DEFAULT 'browser_stt',
  mode text NOT NULL DEFAULT 'dictation',
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz NULL,
  duration_ms int NULL,
  correlation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '90 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT voice_sessions_provider_chk CHECK (provider IN ('browser_stt','elevenlabs_stt','gemini_stt','manual')),
  CONSTRAINT voice_sessions_mode_chk CHECK (mode IN ('dictation','conversation','background')),
  CONSTRAINT voice_sessions_status_chk CHECK (status IN ('active','ended','aborted','failed'))
);

CREATE INDEX IF NOT EXISTS idx_voice_sessions_user ON public.voice_sessions (user_id, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_sessions_workspace ON public.voice_sessions (workspace_id) WHERE workspace_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_voice_sessions_expires ON public.voice_sessions (expires_at);

ALTER TABLE public.voice_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "voice_sessions_owner_select" ON public.voice_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "voice_sessions_owner_insert" ON public.voice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "voice_sessions_owner_update" ON public.voice_sessions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "voice_sessions_owner_delete" ON public.voice_sessions
  FOR DELETE USING (auth.uid() = user_id);

-- 6.6 voice_transcripts
CREATE TABLE IF NOT EXISTS public.voice_transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.voice_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  seq int NOT NULL DEFAULT 0,
  role text NOT NULL DEFAULT 'user',
  text text NOT NULL,
  lang text NOT NULL DEFAULT 'en',
  confidence numeric(4,3) NOT NULL DEFAULT 0.0,
  is_final boolean NOT NULL DEFAULT true,
  audio_storage_path text NULL,
  embedding vector(768) NULL,
  embedding_status text NOT NULL DEFAULT 'pending',
  embedding_model text NULL,
  embedding_dim int NULL,
  embedded_at timestamptz NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '90 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT voice_transcripts_role_chk CHECK (role IN ('user','assistant','system')),
  CONSTRAINT voice_transcripts_embedding_status_chk CHECK (embedding_status IN ('pending','embedded','failed','skipped'))
);

CREATE INDEX IF NOT EXISTS idx_voice_transcripts_session ON public.voice_transcripts (session_id, seq);
CREATE INDEX IF NOT EXISTS idx_voice_transcripts_user ON public.voice_transcripts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_transcripts_pending ON public.voice_transcripts (embedding_status) WHERE embedding_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_voice_transcripts_expires ON public.voice_transcripts (expires_at);

ALTER TABLE public.voice_transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "voice_transcripts_owner_select" ON public.voice_transcripts
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "voice_transcripts_owner_insert" ON public.voice_transcripts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "voice_transcripts_owner_update" ON public.voice_transcripts
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "voice_transcripts_owner_delete" ON public.voice_transcripts
  FOR DELETE USING (auth.uid() = user_id);

-- updated_at triggers
CREATE TRIGGER voice_sessions_set_updated_at
  BEFORE UPDATE ON public.voice_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER voice_transcripts_set_updated_at
  BEFORE UPDATE ON public.voice_transcripts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6.3 RPC: semantic_workspace_memories
CREATE OR REPLACE FUNCTION public.semantic_workspace_memories(
  _workspace_id uuid,
  _query_embedding vector(768),
  _max_n int DEFAULT 12,
  _min_similarity numeric DEFAULT 0.55
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
  similarity numeric,
  last_used_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.id AS memory_id,
    m.content,
    m.category,
    m.confidence,
    mp.pillar,
    mp.sensitivity,
    mp.provenance_kind,
    mp.workspace_id,
    (1 - (mp.embedding <=> _query_embedding))::numeric AS similarity,
    mp.last_used_at
  FROM public.pb_memories m
  JOIN public.memory_provenance mp ON mp.memory_id = m.id
  WHERE m.user_id = auth.uid()
    AND m.status = 'active'
    AND mp.embedding IS NOT NULL
    AND mp.review_status = 'accepted'
    AND (mp.workspace_id = _workspace_id OR mp.workspace_id IS NULL)
    AND mp.sensitivity <> 'restricted'
    AND (1 - (mp.embedding <=> _query_embedding)) >= _min_similarity
  ORDER BY mp.embedding <=> _query_embedding ASC
  LIMIT GREATEST(_max_n, 1);
$$;

GRANT EXECUTE ON FUNCTION public.semantic_workspace_memories(uuid, vector, int, numeric) TO authenticated;

-- 6.4 RPC: semantic_knowledge_chunks
CREATE OR REPLACE FUNCTION public.semantic_knowledge_chunks(
  _workspace_id uuid,
  _query_embedding vector(768),
  _max_n int DEFAULT 8,
  _min_similarity numeric DEFAULT 0.5
)
RETURNS TABLE (
  chunk_id uuid,
  file_id uuid,
  source_table text,
  content text,
  pillar text,
  sensitivity text,
  workspace_id uuid,
  similarity numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    kc.id AS chunk_id,
    kc.file_id,
    kc.source_table,
    kc.content,
    kc.pillar,
    kc.sensitivity,
    kc.workspace_id,
    (1 - (kc.embedding <=> _query_embedding))::numeric AS similarity
  FROM public.knowledge_chunks kc
  WHERE kc.user_id = auth.uid()
    AND kc.embedding IS NOT NULL
    AND (kc.workspace_id = _workspace_id OR kc.workspace_id IS NULL)
    AND kc.sensitivity <> 'restricted'
    AND (1 - (kc.embedding <=> _query_embedding)) >= _min_similarity
  ORDER BY kc.embedding <=> _query_embedding ASC
  LIMIT GREATEST(_max_n, 1);
$$;

GRANT EXECUTE ON FUNCTION public.semantic_knowledge_chunks(uuid, vector, int, numeric) TO authenticated;

-- 6.7 RPC: promote_voice_transcript_to_memory
CREATE OR REPLACE FUNCTION public.promote_voice_transcript_to_memory(
  _transcript_id uuid,
  _sensitivity text DEFAULT 'internal',
  _category text DEFAULT 'voice_note'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_transcript public.voice_transcripts%ROWTYPE;
  v_session public.voice_sessions%ROWTYPE;
  v_memory_id uuid;
  v_band text;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'unauthenticated';
  END IF;

  SELECT * INTO v_transcript FROM public.voice_transcripts WHERE id = _transcript_id AND user_id = v_user;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'transcript not found';
  END IF;

  SELECT * INTO v_session FROM public.voice_sessions WHERE id = v_transcript.session_id AND user_id = v_user;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'session not found';
  END IF;

  v_band := CASE
    WHEN v_transcript.confidence >= 0.9 THEN 'verified'
    WHEN v_transcript.confidence >= 0.75 THEN 'high'
    WHEN v_transcript.confidence >= 0.5 THEN 'medium'
    ELSE 'low'
  END;

  INSERT INTO public.pb_memories (user_id, kind, category, content, confidence, source_chat_id, status, metadata)
  VALUES (
    v_user,
    'voice',
    _category,
    v_transcript.text,
    v_transcript.confidence,
    v_session.id,
    'active',
    jsonb_build_object('voice_transcript_id', v_transcript.id, 'voice_session_id', v_session.id)
  )
  RETURNING id INTO v_memory_id;

  INSERT INTO public.memory_provenance (
    memory_id, user_id, workspace_id, module_id, pillar, sensitivity,
    provenance_kind, source_chat_id, source_correlation_id, confidence_band,
    review_status, embedding, embedding_status, embedding_model, embedding_dim, embedded_at, metadata
  )
  VALUES (
    v_memory_id, v_user, v_session.workspace_id, v_session.module_id,
    COALESCE(v_session.pillar, 'shared'), _sensitivity,
    'inferred_voice', v_session.id, v_session.correlation_id, v_band,
    'accepted',
    v_transcript.embedding, COALESCE(v_transcript.embedding_status, 'pending'),
    v_transcript.embedding_model, v_transcript.embedding_dim, v_transcript.embedded_at,
    jsonb_build_object('voice_transcript_id', v_transcript.id)
  );

  UPDATE public.voice_transcripts
  SET metadata = metadata || jsonb_build_object('promoted_memory_id', v_memory_id)
  WHERE id = _transcript_id;

  RETURN v_memory_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.promote_voice_transcript_to_memory(uuid, text, text) TO authenticated;

-- 6.7 Trust action seed
INSERT INTO public.trust_action_catalog (action_key, pillar, label, description, risk_tier, default_authority_level, require_approval, reversible, metadata)
VALUES (
  'shared.voice.session.start',
  'shared',
  'Start voice session',
  'Begin a voice capture session that records transcripts under workspace scope.',
  'low',
  'pre_approved',
  false,
  true,
  '{"phase":6,"surface":"voice"}'::jsonb
)
ON CONFLICT (action_key) DO UPDATE SET
  description = EXCLUDED.description,
  risk_tier = EXCLUDED.risk_tier,
  default_authority_level = EXCLUDED.default_authority_level,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- 6.6 Storage bucket: voice-recordings (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('voice-recordings', 'voice-recordings', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "voice_recordings_owner_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'voice-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "voice_recordings_owner_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'voice-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "voice_recordings_owner_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'voice-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "voice_recordings_owner_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'voice-recordings' AND auth.uid()::text = (storage.foldername(name))[1]);