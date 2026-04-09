
-- Create calibration_checkpoints table for first-week calibration loop
CREATE TABLE public.calibration_checkpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  checkpoint_key TEXT NOT NULL,
  triggered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  response JSONB DEFAULT '{}'::jsonb,
  dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Unique constraint: one checkpoint per user per key
ALTER TABLE public.calibration_checkpoints ADD CONSTRAINT calibration_checkpoints_user_key_unique UNIQUE (user_id, checkpoint_key);

-- Enable RLS
ALTER TABLE public.calibration_checkpoints ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own checkpoints" ON public.calibration_checkpoints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own checkpoints" ON public.calibration_checkpoints FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checkpoints" ON public.calibration_checkpoints FOR UPDATE USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE TRIGGER update_calibration_checkpoints_updated_at
  BEFORE UPDATE ON public.calibration_checkpoints
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
