-- Kill switch persistence table
CREATE TABLE public.demo_kill_switches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, key)
);

ALTER TABLE public.demo_kill_switches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own kill switches"
  ON public.demo_kill_switches FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_demo_kill_switches_updated_at
  BEFORE UPDATE ON public.demo_kill_switches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();