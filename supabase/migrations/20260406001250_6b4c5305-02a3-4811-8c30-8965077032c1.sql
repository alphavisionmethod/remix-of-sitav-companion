
-- 1. Experience Grammar Records
CREATE TABLE public.experience_grammar_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  grammar_type TEXT NOT NULL CHECK (grammar_type IN (
    'trust_state','workflow_state','action_state','receipt_proof',
    'command','boardroom','notification_urgency','opportunity_scoring',
    'degraded_state','refusal'
  )),
  grammar_key TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  canonical_values JSONB NOT NULL DEFAULT '[]'::jsonb,
  surface_rendering_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, grammar_type, grammar_key)
);
ALTER TABLE public.experience_grammar_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own experience grammars" ON public.experience_grammar_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_experience_grammar_records_updated_at BEFORE UPDATE ON public.experience_grammar_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Surface Constraint Records
CREATE TABLE public.surface_constraint_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surface_id UUID NOT NULL REFERENCES public.surface_types(id) ON DELETE CASCADE,
  constraint_type TEXT NOT NULL,
  constraint_key TEXT NOT NULL,
  constraint_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  enforced BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, surface_id, constraint_key)
);
ALTER TABLE public.surface_constraint_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own surface constraints" ON public.surface_constraint_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_surface_constraint_records_updated_at BEFORE UPDATE ON public.surface_constraint_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Capability Portability Records
CREATE TABLE public.capability_portability_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  capability_id UUID NOT NULL REFERENCES public.capability_definitions(id) ON DELETE CASCADE,
  surface_id UUID NOT NULL REFERENCES public.surface_types(id) ON DELETE CASCADE,
  portability_score INTEGER NOT NULL DEFAULT 0 CHECK (portability_score >= 0 AND portability_score <= 100),
  blockers TEXT[] NOT NULL DEFAULT '{}',
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'not_assessed' CHECK (status IN ('not_assessed','portable','partial','blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, capability_id, surface_id)
);
ALTER TABLE public.capability_portability_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own capability portability" ON public.capability_portability_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_capability_portability_records_updated_at BEFORE UPDATE ON public.capability_portability_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Surface Launch Profiles
CREATE TABLE public.surface_launch_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surface_id UUID NOT NULL REFERENCES public.surface_types(id) ON DELETE CASCADE,
  launch_target_date DATE,
  readiness_score INTEGER NOT NULL DEFAULT 0 CHECK (readiness_score >= 0 AND readiness_score <= 100),
  gate_results JSONB NOT NULL DEFAULT '{}'::jsonb,
  blockers TEXT[] NOT NULL DEFAULT '{}',
  launch_status TEXT NOT NULL DEFAULT 'planning' CHECK (launch_status IN ('planning','development','testing','staging','launched','suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, surface_id)
);
ALTER TABLE public.surface_launch_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own surface launch profiles" ON public.surface_launch_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_surface_launch_profiles_updated_at BEFORE UPDATE ON public.surface_launch_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Surface Trust Presentations
CREATE TABLE public.surface_trust_presentations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surface_id UUID NOT NULL REFERENCES public.surface_types(id) ON DELETE CASCADE,
  trust_element TEXT NOT NULL,
  rendering_strategy TEXT NOT NULL,
  component_pattern TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, surface_id, trust_element)
);
ALTER TABLE public.surface_trust_presentations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trust presentations" ON public.surface_trust_presentations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_surface_trust_presentations_updated_at BEFORE UPDATE ON public.surface_trust_presentations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Surface Notification Grammars
CREATE TABLE public.surface_notification_grammars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  surface_id UUID NOT NULL REFERENCES public.surface_types(id) ON DELETE CASCADE,
  urgency_level TEXT NOT NULL CHECK (urgency_level IN ('critical','high','normal','low','silent')),
  channel TEXT NOT NULL,
  delivery_method TEXT NOT NULL,
  template JSONB NOT NULL DEFAULT '{}'::jsonb,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, surface_id, urgency_level, channel)
);
ALTER TABLE public.surface_notification_grammars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notification grammars" ON public.surface_notification_grammars FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_surface_notification_grammars_updated_at BEFORE UPDATE ON public.surface_notification_grammars FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
