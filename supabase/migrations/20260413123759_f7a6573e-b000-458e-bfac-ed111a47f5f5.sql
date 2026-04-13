
CREATE TABLE public.advisor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  advisor_id TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  personality_traits JSONB DEFAULT '{}',
  visual_style TEXT DEFAULT 'professional',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(advisor_id, user_id)
);

ALTER TABLE public.advisor_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own advisor profiles"
ON public.advisor_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own advisor profiles"
ON public.advisor_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own advisor profiles"
ON public.advisor_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own advisor profiles"
ON public.advisor_profiles FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_advisor_profiles_updated_at
BEFORE UPDATE ON public.advisor_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
