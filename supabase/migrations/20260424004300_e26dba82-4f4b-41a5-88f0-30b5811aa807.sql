-- ═══════════════════════════════════════════════════════════════
-- Phase G finishing + Phase H — Sita Sentience Layer
-- ═══════════════════════════════════════════════════════════════

-- ── 1. Phase G: TTL purge for sita_app_open_log (retention 30d) ──
CREATE OR REPLACE FUNCTION public.purge_sita_app_open_log()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.sita_app_open_log WHERE expires_at < now();
END;
$$;

-- ── 2. Phase H: Personality profile (one row per user) ──────────
CREATE TABLE IF NOT EXISTS public.sita_personality_profiles (
  user_id UUID PRIMARY KEY,
  voice_persona TEXT NOT NULL DEFAULT 'sita',         -- sita | jarvis | terse | warm | british
  formality NUMERIC(3,2) NOT NULL DEFAULT 0.5,        -- 0=casual, 1=formal
  verbosity NUMERIC(3,2) NOT NULL DEFAULT 0.4,        -- 0=terse, 1=detailed
  proactivity NUMERIC(3,2) NOT NULL DEFAULT 0.5,      -- 0=reactive, 1=proactive
  humor NUMERIC(3,2) NOT NULL DEFAULT 0.2,
  honorific TEXT,                                      -- e.g. "sir", "boss", first name
  preferred_pronouns TEXT,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  language TEXT NOT NULL DEFAULT 'en',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sita_personality_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "personality_select" ON public.sita_personality_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "personality_insert" ON public.sita_personality_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "personality_update" ON public.sita_personality_profiles FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "personality_delete" ON public.sita_personality_profiles FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER trg_sita_personality_updated BEFORE UPDATE ON public.sita_personality_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 3. Phase H: Knowledge graph nodes ───────────────────────────
CREATE TABLE IF NOT EXISTS public.sita_knowledge_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL,           -- person | place | concept | preference | habit | fact | event
  label TEXT NOT NULL,
  body TEXT,
  confidence NUMERIC(3,2) NOT NULL DEFAULT 0.5,
  source TEXT,                  -- chat | observation | reflection | manual
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sita_knowledge_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "knowledge_nodes_select" ON public.sita_knowledge_nodes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "knowledge_nodes_insert" ON public.sita_knowledge_nodes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "knowledge_nodes_update" ON public.sita_knowledge_nodes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "knowledge_nodes_delete" ON public.sita_knowledge_nodes FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_sita_knowledge_nodes_user_kind ON public.sita_knowledge_nodes(user_id, kind);
CREATE INDEX idx_sita_knowledge_nodes_label ON public.sita_knowledge_nodes(user_id, label);
CREATE TRIGGER trg_sita_knowledge_nodes_updated BEFORE UPDATE ON public.sita_knowledge_nodes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 4. Phase H: Knowledge edges (relations) ─────────────────────
CREATE TABLE IF NOT EXISTS public.sita_knowledge_edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  from_node_id UUID NOT NULL REFERENCES public.sita_knowledge_nodes(id) ON DELETE CASCADE,
  to_node_id UUID NOT NULL REFERENCES public.sita_knowledge_nodes(id) ON DELETE CASCADE,
  relation TEXT NOT NULL,
  weight NUMERIC(4,3) NOT NULL DEFAULT 1.0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sita_knowledge_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "knowledge_edges_select" ON public.sita_knowledge_edges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "knowledge_edges_insert" ON public.sita_knowledge_edges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "knowledge_edges_update" ON public.sita_knowledge_edges FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "knowledge_edges_delete" ON public.sita_knowledge_edges FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_sita_knowledge_edges_from ON public.sita_knowledge_edges(from_node_id);
CREATE INDEX idx_sita_knowledge_edges_to ON public.sita_knowledge_edges(to_node_id);

-- ── 5. Phase H: Proactive briefings (queued briefs Sita surfaces) ─
CREATE TABLE IF NOT EXISTS public.sita_proactive_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL,                  -- morning | midday | evening | weekly | mission | risk
  headline TEXT NOT NULL,
  body TEXT,
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'queued',   -- queued | delivered | acknowledged | expired
  priority INTEGER NOT NULL DEFAULT 3,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sita_proactive_briefings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "briefings_select" ON public.sita_proactive_briefings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "briefings_insert" ON public.sita_proactive_briefings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "briefings_update" ON public.sita_proactive_briefings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "briefings_delete" ON public.sita_proactive_briefings FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_sita_briefings_user_status ON public.sita_proactive_briefings(user_id, status, scheduled_for);

-- ── 6. Phase H: Conflict resolutions (when Sita detects competing tasks) ─
CREATE TABLE IF NOT EXISTS public.sita_conflict_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  conflict_kind TEXT NOT NULL,          -- calendar | budget | mission | priority
  description TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_option TEXT,
  resolved_option TEXT,
  resolved_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'open',  -- open | resolved | dismissed
  evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sita_conflict_resolutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conflicts_select" ON public.sita_conflict_resolutions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "conflicts_insert" ON public.sita_conflict_resolutions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "conflicts_update" ON public.sita_conflict_resolutions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "conflicts_delete" ON public.sita_conflict_resolutions FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_sita_conflicts_user_status ON public.sita_conflict_resolutions(user_id, status);

-- ── 7. Phase H: Multimodal perception events (screen / vision / clipboard) ─
CREATE TABLE IF NOT EXISTS public.sita_perception_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  source TEXT NOT NULL,                 -- screen | clipboard | vision | mic_meta
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  ttl_seconds INTEGER NOT NULL DEFAULT 86400,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '1 day')
);
ALTER TABLE public.sita_perception_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perception_select" ON public.sita_perception_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "perception_insert" ON public.sita_perception_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "perception_delete" ON public.sita_perception_events FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_sita_perception_user_time ON public.sita_perception_events(user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.purge_sita_perception_events()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN DELETE FROM public.sita_perception_events WHERE expires_at < now(); END;
$$;

-- ── 8. Phase H: Schedule nightly + hourly cron jobs ─────────────
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname='pg_cron') THEN
    -- Nightly reflection at 03:30 UTC
    BEGIN
      PERFORM cron.unschedule('sita-reflection-nightly');
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    PERFORM cron.schedule(
      'sita-reflection-nightly',
      '30 3 * * *',
      $cron$
        SELECT net.http_post(
          url := 'https://fctupowhcljejygjfpty.supabase.co/functions/v1/sita-reflection-loop',
          headers := jsonb_build_object('Content-Type','application/json'),
          body := jsonb_build_object('source','pg_cron','cadence','nightly')
        ) AS request_id;
      $cron$
    );

    -- Hourly TTL purges
    BEGIN PERFORM cron.unschedule('sita-purge-app-log'); EXCEPTION WHEN OTHERS THEN NULL; END;
    PERFORM cron.schedule('sita-purge-app-log', '17 * * * *', $cron$ SELECT public.purge_sita_app_open_log(); $cron$);

    BEGIN PERFORM cron.unschedule('sita-purge-perception'); EXCEPTION WHEN OTHERS THEN NULL; END;
    PERFORM cron.schedule('sita-purge-perception', '23 * * * *', $cron$ SELECT public.purge_sita_perception_events(); $cron$);
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron scheduling skipped: %', SQLERRM;
END $$;