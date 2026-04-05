
-- Advisor Knowledge Base
CREATE TABLE public.advisor_knowledge (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'manual',
  confidence NUMERIC NOT NULL DEFAULT 0.5,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own advisor knowledge"
  ON public.advisor_knowledge FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_advisor_knowledge_advisor ON public.advisor_knowledge (advisor_id, user_id);
CREATE INDEX idx_advisor_knowledge_tags ON public.advisor_knowledge USING GIN (tags);

CREATE TRIGGER update_advisor_knowledge_updated_at
  BEFORE UPDATE ON public.advisor_knowledge
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Advisor Memories
CREATE TABLE public.advisor_memories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  memory_type TEXT NOT NULL DEFAULT 'summary',
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own advisor memories"
  ON public.advisor_memories FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_advisor_memories_lookup ON public.advisor_memories (advisor_id, user_id, memory_type);

-- Advisor Feedback
CREATE TABLE public.advisor_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  message_id TEXT,
  feedback_type TEXT NOT NULL DEFAULT 'rating',
  original_response TEXT,
  corrected_response TEXT,
  rating INTEGER,
  category TEXT DEFAULT 'general',
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.advisor_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own advisor feedback"
  ON public.advisor_feedback FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_advisor_feedback_advisor ON public.advisor_feedback (advisor_id, user_id);
