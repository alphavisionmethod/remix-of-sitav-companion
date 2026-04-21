
CREATE TABLE public.kill_switch_drill_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  switch_id TEXT NOT NULL,
  drill_type TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  success BOOLEAN,
  time_to_disable_ms INTEGER,
  operator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  failure_notes TEXT,
  rollback_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.kill_switch_drill_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view drill results"
ON public.kill_switch_drill_results FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert drill results"
ON public.kill_switch_drill_results FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = operator_id);

CREATE OR REPLACE FUNCTION public.validate_drill_type()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.drill_type NOT IN ('dry-run', 'live') THEN
    RAISE EXCEPTION 'drill_type must be dry-run or live';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_validate_drill_type
BEFORE INSERT OR UPDATE ON public.kill_switch_drill_results
FOR EACH ROW EXECUTE FUNCTION public.validate_drill_type();
