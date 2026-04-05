-- Revenue Office Data Model
-- Funnels
CREATE TABLE public.revenue_funnels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  funnel_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  steps JSONB DEFAULT '[]'::jsonb,
  total_visitors INTEGER DEFAULT 0,
  total_optins INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_revenue_cents INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_funnels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own funnels" ON public.revenue_funnels FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.revenue_funnel_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  funnel_id UUID REFERENCES public.revenue_funnels(id) ON DELETE CASCADE NOT NULL,
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL DEFAULT 0,
  page_type TEXT DEFAULT 'landing',
  visitors INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_funnel_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own funnel steps" ON public.revenue_funnel_steps FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Campaigns
CREATE TABLE public.revenue_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL DEFAULT 'email',
  status TEXT NOT NULL DEFAULT 'draft',
  steps_count INTEGER DEFAULT 0,
  segment_id UUID,
  subscribers INTEGER DEFAULT 0,
  open_rate NUMERIC(5,2) DEFAULT 0,
  click_rate NUMERIC(5,2) DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue_cents INTEGER DEFAULT 0,
  completion_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own campaigns" ON public.revenue_campaigns FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Segments
CREATE TABLE public.revenue_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  segment_name TEXT NOT NULL,
  filter_criteria JSONB DEFAULT '{}'::jsonb,
  contact_count INTEGER DEFAULT 0,
  growth_rate TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own segments" ON public.revenue_segments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Offers (products, services, memberships, courses, bundles)
CREATE TABLE public.revenue_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  offer_name TEXT NOT NULL,
  offer_type TEXT NOT NULL DEFAULT 'digital',
  category TEXT DEFAULT 'product',
  price_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  recurring_interval TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  total_sales INTEGER DEFAULT 0,
  total_revenue_cents INTEGER DEFAULT 0,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own offers" ON public.revenue_offers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.revenue_offer_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  offer_id UUID REFERENCES public.revenue_offers(id) ON DELETE CASCADE NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'::jsonb
);
ALTER TABLE public.revenue_offer_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own offer sales" ON public.revenue_offer_sales FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Booking Services
CREATE TABLE public.revenue_booking_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  price_cents INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  total_bookings INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_booking_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own booking services" ON public.revenue_booking_services FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.revenue_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  service_id UUID REFERENCES public.revenue_booking_services(id) ON DELETE SET NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'pending',
  mode TEXT DEFAULT 'video',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookings" ON public.revenue_bookings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reviews & Reputation
CREATE TABLE public.revenue_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reviewer_name TEXT NOT NULL,
  platform TEXT DEFAULT 'google',
  rating INTEGER NOT NULL DEFAULT 5,
  review_text TEXT,
  responded BOOLEAN DEFAULT false,
  response_text TEXT,
  review_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reviews" ON public.revenue_reviews FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.revenue_reputation_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  avg_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  nps_score INTEGER DEFAULT 0,
  response_rate NUMERIC(5,2) DEFAULT 0,
  period TEXT DEFAULT 'monthly',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_reputation_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reputation metrics" ON public.revenue_reputation_metrics FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Retention
CREATE TABLE public.revenue_retention_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_id TEXT,
  contact_name TEXT,
  signal_type TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  details JSONB DEFAULT '{}'::jsonb,
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_retention_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own retention signals" ON public.revenue_retention_signals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.revenue_winback_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT,
  churned_at TIMESTAMPTZ,
  ltv_cents INTEGER DEFAULT 0,
  churn_reason TEXT,
  winback_strategy TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_winback_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own winback queue" ON public.revenue_winback_queue FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Experiments / A/B Testing
CREATE TABLE public.revenue_experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  experiment_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  confidence INTEGER DEFAULT 0,
  lift TEXT,
  winner_variant TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own experiments" ON public.revenue_experiments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.revenue_experiment_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  experiment_id UUID REFERENCES public.revenue_experiments(id) ON DELETE CASCADE NOT NULL,
  variant_name TEXT NOT NULL,
  visitors INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_experiment_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own experiment variants" ON public.revenue_experiment_variants FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Journey Touchpoints
CREATE TABLE public.revenue_journey_touchpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stage TEXT NOT NULL,
  touchpoint_type TEXT NOT NULL,
  label TEXT NOT NULL,
  entered_count INTEGER DEFAULT 0,
  exited_count INTEGER DEFAULT 0,
  conversion_rate NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_journey_touchpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journey touchpoints" ON public.revenue_journey_touchpoints FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Leak Items
CREATE TABLE public.revenue_leak_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  item_name TEXT NOT NULL,
  revenue_at_risk_cents INTEGER DEFAULT 0,
  days_stale INTEGER DEFAULT 0,
  severity TEXT DEFAULT 'medium',
  action_needed TEXT,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_leak_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own leak items" ON public.revenue_leak_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Advisor Stances
CREATE TABLE public.revenue_advisor_stances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  advisor_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  stance TEXT NOT NULL,
  recommendation TEXT,
  confidence NUMERIC(3,2) DEFAULT 0,
  stance_type TEXT DEFAULT 'opportunity',
  watching JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_advisor_stances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own advisor stances" ON public.revenue_advisor_stances FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Revenue Memory Events
CREATE TABLE public.revenue_memory_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id TEXT,
  title TEXT NOT NULL,
  summary TEXT,
  severity TEXT DEFAULT 'info',
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.revenue_memory_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own revenue memory events" ON public.revenue_memory_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);