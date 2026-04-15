
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  domain TEXT NOT NULL DEFAULT 'personal',
  event_type TEXT NOT NULL DEFAULT 'meeting',
  location TEXT,
  priority TEXT DEFAULT 'medium',
  notes TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  source_id TEXT,
  color TEXT,
  recurring TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calendar events"
  ON public.calendar_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own calendar events"
  ON public.calendar_events FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events"
  ON public.calendar_events FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events"
  ON public.calendar_events FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_calendar_events_user_date ON public.calendar_events (user_id, event_date);
CREATE INDEX idx_calendar_events_domain ON public.calendar_events (user_id, domain);

CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
