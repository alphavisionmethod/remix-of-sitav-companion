
-- ═══════════════════════════════════════════════════════════════
-- Personal Brain — Phase 0: Foundation tables, RLS, storage, triggers
-- ═══════════════════════════════════════════════════════════════

-- Reuse existing public.update_updated_at_column() if present; otherwise create a local helper.
CREATE OR REPLACE FUNCTION public.pb_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ── pb_profile ────────────────────────────────────────────────
CREATE TABLE public.pb_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  role TEXT,
  life_context TEXT,
  work_mode TEXT NOT NULL DEFAULT 'mixed' CHECK (work_mode IN ('personal','business','mixed')),
  language TEXT NOT NULL DEFAULT 'en',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  tone TEXT NOT NULL DEFAULT 'balanced',
  depth TEXT NOT NULL DEFAULT 'moderate' CHECK (depth IN ('concise','moderate','deep')),
  coaching_style TEXT NOT NULL DEFAULT 'direct',
  format_pref TEXT NOT NULL DEFAULT 'mixed',
  personalization_depth TEXT NOT NULL DEFAULT 'moderate' CHECK (personalization_depth IN ('minimal','moderate','deep')),
  use_cases JSONB NOT NULL DEFAULT '[]'::jsonb,
  context_sources JSONB NOT NULL DEFAULT '{}'::jsonb,
  mode_overrides JSONB NOT NULL DEFAULT '{}'::jsonb,
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pb_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pb_profile self select" ON public.pb_profile FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pb_profile self insert" ON public.pb_profile FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pb_profile self update" ON public.pb_profile FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pb_profile self delete" ON public.pb_profile FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER pb_profile_updated_at BEFORE UPDATE ON public.pb_profile
  FOR EACH ROW EXECUTE FUNCTION public.pb_set_updated_at();

-- ── pb_goals ──────────────────────────────────────────────────
CREATE TABLE public.pb_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL DEFAULT 'skill' CHECK (kind IN ('skill','project','outcome')),
  title TEXT NOT NULL,
  description TEXT,
  horizon_days INTEGER NOT NULL DEFAULT 90,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','done','archived')),
  progress_pct NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pb_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pb_goals self select" ON public.pb_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pb_goals self insert" ON public.pb_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pb_goals self update" ON public.pb_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pb_goals self delete" ON public.pb_goals FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX pb_goals_user_status_idx ON public.pb_goals(user_id, status);
CREATE TRIGGER pb_goals_updated_at BEFORE UPDATE ON public.pb_goals
  FOR EACH ROW EXECUTE FUNCTION public.pb_set_updated_at();

-- ── pb_workspaces ─────────────────────────────────────────────
CREATE TABLE public.pb_workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'custom' CHECK (kind IN ('business','personal','skill','writing','finance','custom')),
  default_mode TEXT NOT NULL DEFAULT 'think',
  custom_instructions TEXT,
  color TEXT NOT NULL DEFAULT 'primary',
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pb_workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pb_workspaces self select" ON public.pb_workspaces FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pb_workspaces self insert" ON public.pb_workspaces FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pb_workspaces self update" ON public.pb_workspaces FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pb_workspaces self delete" ON public.pb_workspaces FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX pb_workspaces_user_archived_idx ON public.pb_workspaces(user_id, archived_at);
CREATE TRIGGER pb_workspaces_updated_at BEFORE UPDATE ON public.pb_workspaces
  FOR EACH ROW EXECUTE FUNCTION public.pb_set_updated_at();

-- ── pb_chats ──────────────────────────────────────────────────
CREATE TABLE public.pb_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workspace_id UUID REFERENCES public.pb_workspaces(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'New chat',
  mode TEXT NOT NULL DEFAULT 'think',
  pinned BOOLEAN NOT NULL DEFAULT false,
  archived_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  message_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pb_chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pb_chats self select" ON public.pb_chats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pb_chats self insert" ON public.pb_chats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pb_chats self update" ON public.pb_chats FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pb_chats self delete" ON public.pb_chats FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX pb_chats_user_last_idx ON public.pb_chats(user_id, last_message_at DESC);
CREATE INDEX pb_chats_workspace_idx ON public.pb_chats(workspace_id) WHERE workspace_id IS NOT NULL;
CREATE TRIGGER pb_chats_updated_at BEFORE UPDATE ON public.pb_chats
  FOR EACH ROW EXECUTE FUNCTION public.pb_set_updated_at();

-- ── pb_messages ───────────────────────────────────────────────
CREATE TABLE public.pb_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  chat_id UUID NOT NULL REFERENCES public.pb_chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  tokens INTEGER,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pb_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pb_messages self select" ON public.pb_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pb_messages self insert" ON public.pb_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pb_messages self update" ON public.pb_messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pb_messages self delete" ON public.pb_messages FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX pb_messages_chat_idx ON public.pb_messages(chat_id, created_at);

-- ── pb_memories ───────────────────────────────────────────────
CREATE TABLE public.pb_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  kind TEXT NOT NULL DEFAULT 'explicit' CHECK (kind IN ('explicit','inferred')),
  category TEXT NOT NULL DEFAULT 'general',
  content TEXT NOT NULL,
  confidence NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (confidence >= 0 AND confidence <= 1),
  source_chat_id UUID REFERENCES public.pb_chats(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled','pending')),
  decay_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pb_memories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pb_memories self select" ON public.pb_memories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pb_memories self insert" ON public.pb_memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pb_memories self update" ON public.pb_memories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pb_memories self delete" ON public.pb_memories FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX pb_memories_user_status_idx ON public.pb_memories(user_id, status);
CREATE INDEX pb_memories_user_cat_idx ON public.pb_memories(user_id, category);
CREATE TRIGGER pb_memories_updated_at BEFORE UPDATE ON public.pb_memories
  FOR EACH ROW EXECUTE FUNCTION public.pb_set_updated_at();

-- ── pb_files ──────────────────────────────────────────────────
CREATE TABLE public.pb_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  workspace_id UUID REFERENCES public.pb_workspaces(id) ON DELETE SET NULL,
  scope TEXT NOT NULL DEFAULT 'global' CHECK (scope IN ('global','workspace')),
  filename TEXT NOT NULL,
  mime_type TEXT,
  size_bytes BIGINT,
  storage_path TEXT NOT NULL,
  summary TEXT,
  indexed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pb_files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pb_files self select" ON public.pb_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pb_files self insert" ON public.pb_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pb_files self update" ON public.pb_files FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pb_files self delete" ON public.pb_files FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX pb_files_user_idx ON public.pb_files(user_id);
CREATE TRIGGER pb_files_updated_at BEFORE UPDATE ON public.pb_files
  FOR EACH ROW EXECUTE FUNCTION public.pb_set_updated_at();

-- ── pb_voice_prefs ────────────────────────────────────────────
CREATE TABLE public.pb_voice_prefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  voice_id TEXT NOT NULL DEFAULT 'default',
  rate NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (rate >= 0.5 AND rate <= 2.0),
  pitch NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (pitch >= 0.5 AND pitch <= 2.0),
  autoread BOOLEAN NOT NULL DEFAULT false,
  input_mode TEXT NOT NULL DEFAULT 'tap' CHECK (input_mode IN ('tap','ptt','continuous')),
  use_cloud_stt BOOLEAN NOT NULL DEFAULT false,
  transcript_retention TEXT NOT NULL DEFAULT 'session' CHECK (transcript_retention IN ('none','session','persist')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pb_voice_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pb_voice_prefs self select" ON public.pb_voice_prefs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pb_voice_prefs self insert" ON public.pb_voice_prefs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pb_voice_prefs self update" ON public.pb_voice_prefs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pb_voice_prefs self delete" ON public.pb_voice_prefs FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER pb_voice_prefs_updated_at BEFORE UPDATE ON public.pb_voice_prefs
  FOR EACH ROW EXECUTE FUNCTION public.pb_set_updated_at();

-- ── pb_security_prefs ─────────────────────────────────────────
CREATE TABLE public.pb_security_prefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  sensitive_mode BOOLEAN NOT NULL DEFAULT false,
  retention_days INTEGER NOT NULL DEFAULT 365 CHECK (retention_days >= 7),
  autolearn_enabled BOOLEAN NOT NULL DEFAULT true,
  autolearn_threshold NUMERIC(3,2) NOT NULL DEFAULT 0.7 CHECK (autolearn_threshold >= 0 AND autolearn_threshold <= 1),
  learn_from_chats BOOLEAN NOT NULL DEFAULT true,
  learn_from_files BOOLEAN NOT NULL DEFAULT true,
  voice_transcript_retention TEXT NOT NULL DEFAULT 'session' CHECK (voice_transcript_retention IN ('none','session','persist')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pb_security_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pb_security_prefs self select" ON public.pb_security_prefs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pb_security_prefs self insert" ON public.pb_security_prefs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pb_security_prefs self update" ON public.pb_security_prefs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pb_security_prefs self delete" ON public.pb_security_prefs FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER pb_security_prefs_updated_at BEFORE UPDATE ON public.pb_security_prefs
  FOR EACH ROW EXECUTE FUNCTION public.pb_set_updated_at();

-- ── pb_security_events (append-only audit) ────────────────────
CREATE TABLE public.pb_security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  detail JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pb_security_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pb_security_events self select" ON public.pb_security_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pb_security_events self insert" ON public.pb_security_events FOR INSERT WITH CHECK (auth.uid() = user_id);
-- intentionally NO update or delete policy — append-only from the user's perspective
CREATE INDEX pb_security_events_user_idx ON public.pb_security_events(user_id, created_at DESC);

-- ── Storage bucket: pb-files (private) ────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('pb-files', 'pb-files', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "pb-files self read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'pb-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "pb-files self insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'pb-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "pb-files self update"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'pb-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "pb-files self delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'pb-files' AND auth.uid()::text = (storage.foldername(name))[1]);
