
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Concierge Backend Schema
-- ═══════════════════════════════════════════════════════════════

-- Shared updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ═══ 1. travel_plans ═══
CREATE TABLE public.travel_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  destination TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  readiness_percent INTEGER DEFAULT 0,
  status TEXT DEFAULT 'planning',
  travelers TEXT,
  budget NUMERIC(10,2),
  spent NUMERIC(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.travel_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own travel_plans" ON public.travel_plans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_travel_plans_updated_at BEFORE UPDATE ON public.travel_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ 2. appointments ═══
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  provider TEXT,
  appointment_date TIMESTAMPTZ,
  status TEXT DEFAULT 'confirmed',
  prep_items TEXT[] DEFAULT '{}',
  docs_needed TEXT[] DEFAULT '{}',
  transport_time TEXT,
  category TEXT DEFAULT 'personal',
  owner TEXT,
  location TEXT,
  who TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own appointments" ON public.appointments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ 3. grocery_lists ═══
CREATE TABLE public.grocery_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Shopping List',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own grocery_lists" ON public.grocery_lists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_grocery_lists_updated_at BEFORE UPDATE ON public.grocery_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ 4. grocery_items ═══
CREATE TABLE public.grocery_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  list_id UUID REFERENCES public.grocery_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  quantity TEXT,
  estimated_cost NUMERIC(8,2),
  checked BOOLEAN DEFAULT false,
  recurring BOOLEAN DEFAULT false,
  urgent BOOLEAN DEFAULT false,
  store TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own grocery_items" ON public.grocery_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ═══ 5. service_providers_list ═══
CREATE TABLE public.service_providers_list (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  phone TEXT,
  location TEXT,
  rating NUMERIC(2,1) DEFAULT 0,
  trusted BOOLEAN DEFAULT false,
  total_spent NUMERIC(10,2) DEFAULT 0,
  response_time TEXT,
  cost_range TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.service_providers_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own service_providers" ON public.service_providers_list FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON public.service_providers_list FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ 6. school_activities ═══
CREATE TABLE public.school_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  child_name TEXT,
  activity_type TEXT DEFAULT 'event',
  schedule TEXT,
  location TEXT,
  status TEXT DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.school_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own school_activities" ON public.school_activities FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_school_activities_updated_at BEFORE UPDATE ON public.school_activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ 7. gift_tracker ═══
CREATE TABLE public.gift_tracker (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipient TEXT NOT NULL,
  occasion TEXT,
  gift_idea TEXT,
  budget NUMERIC(8,2),
  status TEXT DEFAULT 'idea',
  target_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gift_tracker ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own gift_tracker" ON public.gift_tracker FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_gift_tracker_updated_at BEFORE UPDATE ON public.gift_tracker FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ 8. concierge_errands ═══
CREATE TABLE public.concierge_errands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  estimated_minutes INTEGER,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  bundle_id TEXT,
  combinable BOOLEAN DEFAULT false,
  due_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.concierge_errands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own errands" ON public.concierge_errands FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_errands_updated_at BEFORE UPDATE ON public.concierge_errands FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ 9. concierge_recurring_obligations ═══
CREATE TABLE public.concierge_recurring_obligations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'admin',
  frequency TEXT DEFAULT 'monthly',
  next_due DATE,
  last_completed DATE,
  status TEXT DEFAULT 'on-track',
  effort TEXT DEFAULT 'medium',
  automatable BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.concierge_recurring_obligations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own recurring_obligations" ON public.concierge_recurring_obligations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_recurring_obligations_updated_at BEFORE UPDATE ON public.concierge_recurring_obligations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ 10. concierge_automations ═══
CREATE TABLE public.concierge_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  trigger_event TEXT,
  conditions JSONB DEFAULT '{}',
  trust_level TEXT DEFAULT 'review',
  status TEXT DEFAULT 'proposed',
  safety_boundary TEXT,
  last_run TIMESTAMPTZ,
  recent_runs_count INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.concierge_automations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own automations" ON public.concierge_automations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON public.concierge_automations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ═══ 11. concierge_documents ═══
CREATE TABLE public.concierge_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  doc_type TEXT DEFAULT 'general',
  sensitivity TEXT DEFAULT 'normal',
  linked_context TEXT,
  expiry_date DATE,
  file_path TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.concierge_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own documents" ON public.concierge_documents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.concierge_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
