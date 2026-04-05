-- Universal service state persistence table
CREATE TABLE public.os_service_state (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_id TEXT NOT NULL,
  state_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT os_service_state_user_service_unique UNIQUE (user_id, service_id)
);

-- Index for fast lookups
CREATE INDEX idx_os_service_state_user_service ON public.os_service_state (user_id, service_id);

-- Enable RLS
ALTER TABLE public.os_service_state ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own service state"
  ON public.os_service_state FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own service state"
  ON public.os_service_state FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own service state"
  ON public.os_service_state FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own service state"
  ON public.os_service_state FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update timestamp trigger
CREATE TRIGGER update_os_service_state_updated_at
  BEFORE UPDATE ON public.os_service_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();