
-- ═══════════════════════════════════════════════════════════════
-- Advisor Knowledge, Memories, and Feedback tables
-- ═══════════════════════════════════════════════════════════════

-- 1. advisor_knowledge
CREATE TABLE public.advisor_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  advisor_id TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  tags TEXT[] NOT NULL DEFAULT '{}',
  confidence NUMERIC NOT NULL DEFAULT 0.8,
  source TEXT NOT NULL DEFAULT 'system',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own and system advisor_knowledge"
  ON public.advisor_knowledge FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users insert own advisor_knowledge"
  ON public.advisor_knowledge FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND user_id != '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users update own advisor_knowledge"
  ON public.advisor_knowledge FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND user_id != '00000000-0000-0000-0000-000000000000'::uuid);

CREATE POLICY "Users delete own advisor_knowledge"
  ON public.advisor_knowledge FOR DELETE TO authenticated
  USING (auth.uid() = user_id AND user_id != '00000000-0000-0000-0000-000000000000'::uuid);

CREATE INDEX idx_advisor_knowledge_lookup ON public.advisor_knowledge (user_id, advisor_id, domain, status);

CREATE TRIGGER update_advisor_knowledge_updated_at
  BEFORE UPDATE ON public.advisor_knowledge
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. advisor_memories
CREATE TABLE public.advisor_memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  advisor_id TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  memory_type TEXT NOT NULL DEFAULT 'observation',
  content TEXT NOT NULL DEFAULT '',
  importance NUMERIC NOT NULL DEFAULT 0.5,
  context_ref TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own advisor_memories"
  ON public.advisor_memories FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_advisor_memories_lookup ON public.advisor_memories (user_id, advisor_id, domain, status);

CREATE TRIGGER update_advisor_memories_updated_at
  BEFORE UPDATE ON public.advisor_memories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. advisor_feedback
CREATE TABLE public.advisor_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  advisor_id TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  feedback_type TEXT NOT NULL DEFAULT 'rating',
  rating INTEGER,
  comment TEXT,
  request_ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own advisor_feedback"
  ON public.advisor_feedback FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_advisor_feedback_lookup ON public.advisor_feedback (user_id, advisor_id, domain);
