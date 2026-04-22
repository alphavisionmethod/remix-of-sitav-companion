
-- Digital Twin State table
CREATE TABLE public.digital_twin_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  parameters JSONB NOT NULL DEFAULT '{}',
  simulation_config JSONB NOT NULL DEFAULT '{}',
  health_score NUMERIC(5,2) DEFAULT 0,
  last_simulation_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.digital_twin_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own twin state"
  ON public.digital_twin_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own twin state"
  ON public.digital_twin_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own twin state"
  ON public.digital_twin_state FOR UPDATE
  USING (auth.uid() = user_id);

-- Digital Twin Snapshots table
CREATE TABLE public.digital_twin_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  state_snapshot JSONB NOT NULL DEFAULT '{}',
  label TEXT NOT NULL DEFAULT 'manual-snapshot',
  snapshot_type TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.digital_twin_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own snapshots"
  ON public.digital_twin_snapshots FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own snapshots"
  ON public.digital_twin_snapshots FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Timestamp trigger for digital_twin_state
CREATE TRIGGER update_digital_twin_state_updated_at
  BEFORE UPDATE ON public.digital_twin_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
