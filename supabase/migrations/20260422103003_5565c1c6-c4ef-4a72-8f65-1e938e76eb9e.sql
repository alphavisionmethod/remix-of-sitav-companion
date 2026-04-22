
CREATE TABLE public.revenue_leaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  leak_type TEXT NOT NULL DEFAULT 'unknown',
  stage TEXT NOT NULL DEFAULT '',
  severity TEXT NOT NULL DEFAULT 'medium',
  amount_at_risk NUMERIC NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  source TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'open',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.revenue_leaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own revenue leaks"
  ON public.revenue_leaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own revenue leaks"
  ON public.revenue_leaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own revenue leaks"
  ON public.revenue_leaks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own revenue leaks"
  ON public.revenue_leaks FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_revenue_leaks_updated_at
  BEFORE UPDATE ON public.revenue_leaks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
