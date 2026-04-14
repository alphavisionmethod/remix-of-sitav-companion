
-- Create lead_inbox_items table (triage queue)
CREATE TABLE public.lead_inbox_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_name TEXT NOT NULL DEFAULT '',
  contact_email TEXT,
  contact_phone TEXT,
  company TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  inquiry_text TEXT,
  urgency TEXT NOT NULL DEFAULT 'low',
  quality_score INTEGER DEFAULT 0,
  quality_hints JSONB DEFAULT '[]'::jsonb,
  completeness_score INTEGER DEFAULT 0,
  missing_fields TEXT[] DEFAULT '{}'::text[],
  duplicate_status TEXT NOT NULL DEFAULT 'none',
  duplicate_match_id UUID,
  suggested_owner TEXT,
  suggested_route TEXT NOT NULL DEFAULT 'lead',
  advisor_suggestion TEXT,
  triage_status TEXT NOT NULL DEFAULT 'new',
  routed_to TEXT,
  accepted_at TIMESTAMP WITH TIME ZONE,
  business_profile_mode TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_inbox_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own lead_inbox_items"
  ON public.lead_inbox_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_lead_inbox_items_updated_at
  BEFORE UPDATE ON public.lead_inbox_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_lead_inbox_items_user_status ON public.lead_inbox_items (user_id, triage_status);
CREATE INDEX idx_lead_inbox_items_urgency ON public.lead_inbox_items (urgency);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.lead_inbox_items;

-- Create leads table (accepted leads)
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  company TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  likely_value NUMERIC DEFAULT 0,
  opportunity_score INTEGER DEFAULT 0,
  next_action TEXT,
  last_contact_at TIMESTAMP WITH TIME ZONE,
  stale_risk BOOLEAN DEFAULT false,
  notes TEXT,
  urgency TEXT DEFAULT 'low',
  inbox_item_id UUID REFERENCES public.lead_inbox_items(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own leads"
  ON public.leads FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_leads_user_status ON public.leads (user_id, status);
