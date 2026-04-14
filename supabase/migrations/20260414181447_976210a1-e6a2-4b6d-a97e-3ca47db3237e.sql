
CREATE TABLE public.business_onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  onboarding_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.business_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own business_onboarding"
  ON public.business_onboarding
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_business_onboarding_updated_at
  BEFORE UPDATE ON public.business_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
