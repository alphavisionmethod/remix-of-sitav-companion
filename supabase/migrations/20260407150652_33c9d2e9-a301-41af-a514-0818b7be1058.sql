
-- REVENUE OFFICE
CREATE TABLE public.pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL, position INTEGER NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#3B82F6', deal_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pipeline_stages" ON public.pipeline_stages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_pipeline_stages_ts BEFORE UPDATE ON public.pipeline_stages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL, campaign_type TEXT DEFAULT 'email',
  status TEXT DEFAULT 'draft', budget NUMERIC DEFAULT 0, spend NUMERIC DEFAULT 0,
  start_date DATE, end_date DATE, channel TEXT DEFAULT 'email', metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own campaigns" ON public.campaigns FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_campaigns_ts BEFORE UPDATE ON public.campaigns FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL, description TEXT, fields JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft', submission_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own forms" ON public.forms FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_forms_ts BEFORE UPDATE ON public.forms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.funnels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL, stages JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft', conversion_rate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own funnels" ON public.funnels FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_funnels_ts BEFORE UPDATE ON public.funnels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, title TEXT NOT NULL, description TEXT, price NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'USD', status TEXT DEFAULT 'active', valid_until DATE, metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own offers" ON public.offers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_offers_ts BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL, tier TEXT DEFAULT 'basic', price NUMERIC DEFAULT 0,
  interval TEXT DEFAULT 'monthly', status TEXT DEFAULT 'active', member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own memberships" ON public.memberships FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_memberships_ts BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.reputation_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, source TEXT DEFAULT 'manual', author TEXT, rating INTEGER DEFAULT 5,
  content TEXT, response TEXT, review_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reputation_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reputation_reviews" ON public.reputation_reviews FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_reputation_reviews_ts BEFORE UPDATE ON public.reputation_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.retention_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, customer_name TEXT NOT NULL, alert_type TEXT DEFAULT 'churn_risk',
  severity TEXT DEFAULT 'medium', risk_score NUMERIC DEFAULT 0, status TEXT DEFAULT 'open', notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.retention_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own retention_alerts" ON public.retention_alerts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_retention_alerts_ts BEFORE UPDATE ON public.retention_alerts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- INVESTMENT OFFICE
CREATE TABLE public.trade_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, symbol TEXT NOT NULL, side TEXT NOT NULL DEFAULT 'buy',
  quantity NUMERIC DEFAULT 0, price NUMERIC DEFAULT 0, status TEXT DEFAULT 'pending',
  executed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trade_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own trade_orders" ON public.trade_orders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_trade_orders_ts BEFORE UPDATE ON public.trade_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.market_watchlist_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, symbol TEXT NOT NULL, name TEXT NOT NULL,
  current_price NUMERIC DEFAULT 0, change_percent NUMERIC DEFAULT 0, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.market_watchlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own market_watchlist_items" ON public.market_watchlist_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_market_watchlist_items_ts BEFORE UPDATE ON public.market_watchlist_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.investment_decisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, title TEXT NOT NULL, thesis TEXT, decision_type TEXT DEFAULT 'buy',
  amount NUMERIC DEFAULT 0, status TEXT DEFAULT 'pending', confidence NUMERIC DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.investment_decisions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own investment_decisions" ON public.investment_decisions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_investment_decisions_ts BEFORE UPDATE ON public.investment_decisions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.risk_scenarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, title TEXT NOT NULL, description TEXT, probability NUMERIC DEFAULT 0,
  impact TEXT DEFAULT 'medium', mitigation TEXT, status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.risk_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own risk_scenarios" ON public.risk_scenarios FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_risk_scenarios_ts BEFORE UPDATE ON public.risk_scenarios FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- DIGITAL PRESENCE
CREATE TABLE public.sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL, domain TEXT, status TEXT DEFAULT 'draft',
  template TEXT, published_at TIMESTAMPTZ, metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sites" ON public.sites FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_sites_ts BEFORE UPDATE ON public.sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.brand_assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL, asset_type TEXT DEFAULT 'image',
  file_url TEXT, category TEXT, tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own brand_assets" ON public.brand_assets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_brand_assets_ts BEFORE UPDATE ON public.brand_assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.seo_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, site_id UUID REFERENCES public.sites(id) ON DELETE SET NULL,
  url TEXT, score INTEGER DEFAULT 0, issues JSONB DEFAULT '[]', checked_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.seo_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own seo_reports" ON public.seo_reports FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_seo_reports_ts BEFORE UPDATE ON public.seo_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.ecommerce_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL, description TEXT, price NUMERIC DEFAULT 0,
  sku TEXT, stock INTEGER DEFAULT 0, status TEXT DEFAULT 'draft', images JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ecommerce_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own ecommerce_products" ON public.ecommerce_products FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ecommerce_products_ts BEFORE UPDATE ON public.ecommerce_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- CONCIERGE
CREATE TABLE public.travel_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, title TEXT NOT NULL, destination TEXT,
  start_date DATE, end_date DATE, budget NUMERIC DEFAULT 0, status TEXT DEFAULT 'planning', notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.travel_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own travel_plans" ON public.travel_plans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_travel_plans_ts BEFORE UPDATE ON public.travel_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.grocery_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL DEFAULT 'Shopping List', status TEXT DEFAULT 'active',
  item_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grocery_lists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own grocery_lists" ON public.grocery_lists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_grocery_lists_ts BEFORE UPDATE ON public.grocery_lists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.grocery_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, list_id UUID REFERENCES public.grocery_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL, quantity NUMERIC DEFAULT 1, unit TEXT DEFAULT 'pcs', category TEXT, checked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own grocery_items" ON public.grocery_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_grocery_items_ts BEFORE UPDATE ON public.grocery_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.service_providers_list (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL, category TEXT, phone TEXT, email TEXT,
  rating INTEGER DEFAULT 0, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.service_providers_list ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own service_providers_list" ON public.service_providers_list FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_service_providers_list_ts BEFORE UPDATE ON public.service_providers_list FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.school_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, child_name TEXT NOT NULL, activity TEXT NOT NULL,
  day_of_week TEXT, activity_time TEXT, location TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.school_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own school_activities" ON public.school_activities FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_school_activities_ts BEFORE UPDATE ON public.school_activities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.gift_tracker (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, recipient TEXT NOT NULL, occasion TEXT, gift_idea TEXT,
  budget NUMERIC DEFAULT 0, status TEXT DEFAULT 'idea', target_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gift_tracker ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own gift_tracker" ON public.gift_tracker FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_gift_tracker_ts BEFORE UPDATE ON public.gift_tracker FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, title TEXT NOT NULL, provider TEXT,
  appointment_date TIMESTAMPTZ NOT NULL, duration_minutes INTEGER DEFAULT 30,
  location TEXT, status TEXT DEFAULT 'scheduled', notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own appointments" ON public.appointments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_appointments_ts BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- MONEY
CREATE TABLE public.tax_estimates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, tax_year INTEGER NOT NULL, category TEXT DEFAULT 'income',
  estimated_amount NUMERIC DEFAULT 0, paid_amount NUMERIC DEFAULT 0, due_date DATE,
  status TEXT DEFAULT 'estimated',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.tax_estimates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tax_estimates" ON public.tax_estimates FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_tax_estimates_ts BEFORE UPDATE ON public.tax_estimates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.receivables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, customer_name TEXT NOT NULL, invoice_ref TEXT,
  amount NUMERIC DEFAULT 0, due_date DATE, status TEXT DEFAULT 'pending', days_overdue INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.receivables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own receivables" ON public.receivables FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_receivables_ts BEFORE UPDATE ON public.receivables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.money_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, title TEXT NOT NULL, amount NUMERIC DEFAULT 0, category TEXT,
  requested_by TEXT, status TEXT DEFAULT 'pending', approved_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.money_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own money_approvals" ON public.money_approvals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_money_approvals_ts BEFORE UPDATE ON public.money_approvals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- APPS / MISSION
CREATE TABLE public.health_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, log_type TEXT NOT NULL DEFAULT 'general', value NUMERIC DEFAULT 0,
  unit TEXT, notes TEXT, logged_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.health_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own health_logs" ON public.health_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_health_logs_ts BEFORE UPDATE ON public.health_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.vault_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, name TEXT NOT NULL, category TEXT DEFAULT 'password',
  encrypted_data TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.vault_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own vault_items" ON public.vault_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_vault_items_ts BEFORE UPDATE ON public.vault_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.mission_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, title TEXT NOT NULL, description TEXT, target_date DATE,
  progress NUMERIC DEFAULT 0, status TEXT DEFAULT 'active', priority TEXT DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mission_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mission_goals" ON public.mission_goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_mission_goals_ts BEFORE UPDATE ON public.mission_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.mission_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL, goal_id UUID REFERENCES public.mission_goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL, due_date DATE, completed BOOLEAN DEFAULT false, completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.mission_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own mission_milestones" ON public.mission_milestones FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_mission_milestones_ts BEFORE UPDATE ON public.mission_milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
