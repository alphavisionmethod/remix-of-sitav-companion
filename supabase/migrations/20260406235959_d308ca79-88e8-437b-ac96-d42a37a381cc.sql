CREATE TABLE public.boardroom_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_type text DEFAULT 'weekly',
  title text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  slides_data jsonb DEFAULT '[]',
  summary_text text,
  confidence_score integer,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.boardroom_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.boardroom_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  decision_text text NOT NULL,
  status text DEFAULT 'pending',
  advisor text,
  domain text,
  decided_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.boardroom_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boardroom_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own sessions" ON public.boardroom_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own decisions" ON public.boardroom_decisions FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER set_boardroom_sessions_updated_at BEFORE UPDATE ON public.boardroom_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();