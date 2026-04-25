-- ════════════════════════════════════════════════════════════
-- Phase 7.1 — voice_intents table (proposed actions from transcripts)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.voice_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.voice_sessions(id) ON DELETE CASCADE,
  transcript_id uuid REFERENCES public.voice_transcripts(id) ON DELETE SET NULL,
  user_id uuid NOT NULL,
  action_key text NOT NULL,
  params jsonb NOT NULL DEFAULT '{}'::jsonb,
  rationale text NOT NULL DEFAULT '',
  confidence numeric(4,3) NOT NULL DEFAULT 0.5,
  status text NOT NULL DEFAULT 'proposed',
  trust_request_id uuid,
  executed_at timestamptz,
  rejected_at timestamptz,
  rejected_reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  CONSTRAINT voice_intents_status_chk CHECK (status IN ('proposed','approved','rejected','executed','expired')),
  CONSTRAINT voice_intents_confidence_chk CHECK (confidence >= 0 AND confidence <= 1)
);

CREATE INDEX IF NOT EXISTS idx_voice_intents_user ON public.voice_intents (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_voice_intents_session ON public.voice_intents (session_id);
CREATE INDEX IF NOT EXISTS idx_voice_intents_status ON public.voice_intents (status) WHERE status = 'proposed';
CREATE INDEX IF NOT EXISTS idx_voice_intents_expires ON public.voice_intents (expires_at);

ALTER TABLE public.voice_intents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "voice_intents_owner_select" ON public.voice_intents
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "voice_intents_owner_insert" ON public.voice_intents
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "voice_intents_owner_update" ON public.voice_intents
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "voice_intents_owner_delete" ON public.voice_intents
  FOR DELETE USING (auth.uid() = user_id);

-- updated_at trigger
DROP TRIGGER IF EXISTS update_voice_intents_updated_at ON public.voice_intents;
CREATE TRIGGER update_voice_intents_updated_at
  BEFORE UPDATE ON public.voice_intents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ════════════════════════════════════════════════════════════
-- Phase 7.2 — extract_voice_intents RPC
-- Returns the most recent proposed intents for a session.
-- (The actual extraction is performed by the voice-spine edge fn,
--  which inserts into voice_intents; this RPC is a typed read.)
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.extract_voice_intents(
  _session_id uuid,
  _max_n integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  transcript_id uuid,
  action_key text,
  params jsonb,
  rationale text,
  confidence numeric,
  status text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT vi.id, vi.transcript_id, vi.action_key, vi.params, vi.rationale,
         vi.confidence, vi.status, vi.created_at
  FROM public.voice_intents vi
  WHERE vi.session_id = _session_id
    AND vi.user_id = auth.uid()
    AND vi.expires_at > now()
  ORDER BY vi.created_at DESC
  LIMIT GREATEST(1, LEAST(_max_n, 50));
$$;

REVOKE ALL ON FUNCTION public.extract_voice_intents(uuid, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.extract_voice_intents(uuid, integer) TO authenticated;

-- ════════════════════════════════════════════════════════════
-- Phase 7.3 — embedding_budget_overview view
-- Rolls up embedding-mode AI invocations into daily / monthly bins
-- per user. Read-only; RLS enforced via underlying table policies.
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW public.embedding_budget_overview
WITH (security_invoker = true) AS
SELECT
  user_id,
  date_trunc('day', created_at)::date AS day,
  date_trunc('month', created_at)::date AS month,
  count(*) AS invocations,
  coalesce(sum(total_tokens), 0)::bigint AS total_tokens,
  coalesce(sum(prompt_tokens), 0)::bigint AS prompt_tokens,
  coalesce(sum(completion_tokens), 0)::bigint AS completion_tokens,
  coalesce(sum(estimated_cost_usd), 0)::numeric(10,6) AS estimated_cost_usd,
  count(*) FILTER (WHERE status = 'completed') AS succeeded,
  count(*) FILTER (WHERE status = 'failed') AS failed
FROM public.ai_invocation_plans
WHERE mode = 'embedding'
GROUP BY user_id, date_trunc('day', created_at), date_trunc('month', created_at);

COMMENT ON VIEW public.embedding_budget_overview IS
  'Phase 7 — daily/monthly embedding cost rollup per user. RLS via underlying ai_invocation_plans.';

-- ════════════════════════════════════════════════════════════
-- Phase 7.4 — purge expired intents helper
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.purge_expired_voice_intents()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted integer;
BEGIN
  WITH expire_first AS (
    UPDATE public.voice_intents
    SET status = 'expired'
    WHERE status = 'proposed' AND expires_at <= now()
    RETURNING 1
  ),
  delete_old AS (
    DELETE FROM public.voice_intents
    WHERE expires_at <= (now() - interval '7 days')
    RETURNING 1
  )
  SELECT count(*) INTO v_deleted FROM delete_old;
  RETURN coalesce(v_deleted, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.purge_expired_voice_intents() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_expired_voice_intents() TO service_role;
