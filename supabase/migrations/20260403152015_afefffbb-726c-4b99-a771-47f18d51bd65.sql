
-- Digital twins table: stores customer health scores for revenue forecasting
CREATE TABLE public.digital_twins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  health_score INTEGER NOT NULL DEFAULT 50 CHECK (health_score >= 0 AND health_score <= 100),
  revenue_at_risk INTEGER NOT NULL DEFAULT 0,
  predicted_revenue INTEGER NOT NULL DEFAULT 0,
  churn_probability NUMERIC(3,2) NOT NULL DEFAULT 0.00 CHECK (churn_probability >= 0 AND churn_probability <= 1),
  last_activity TEXT DEFAULT 'unknown',
  segment TEXT NOT NULL DEFAULT 'smb' CHECK (segment IN ('enterprise', 'mid-market', 'smb')),
  trend TEXT NOT NULL DEFAULT 'stable' CHECK (trend IN ('improving', 'stable', 'declining')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.digital_twins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own digital twins"
  ON public.digital_twins FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own digital twins"
  ON public.digital_twins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own digital twins"
  ON public.digital_twins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own digital twins"
  ON public.digital_twins FOR DELETE USING (auth.uid() = user_id);

-- Playbook metrics table: tracks playbook performance for forecasting
CREATE TABLE public.playbook_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  playbook_id TEXT NOT NULL,
  name TEXT NOT NULL,
  projected_lift INTEGER NOT NULL DEFAULT 0,
  confidence INTEGER NOT NULL DEFAULT 50 CHECK (confidence >= 0 AND confidence <= 100),
  active_customers INTEGER NOT NULL DEFAULT 0,
  avg_health_delta NUMERIC(5,1) NOT NULL DEFAULT 0.0,
  status TEXT NOT NULL DEFAULT 'moderate' CHECK (status IN ('high-impact', 'moderate', 'emerging')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.playbook_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own playbook metrics"
  ON public.playbook_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own playbook metrics"
  ON public.playbook_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own playbook metrics"
  ON public.playbook_metrics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own playbook metrics"
  ON public.playbook_metrics FOR DELETE USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_digital_twins_updated_at
  BEFORE UPDATE ON public.digital_twins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_playbook_metrics_updated_at
  BEFORE UPDATE ON public.playbook_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
