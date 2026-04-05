
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Digital Presence Office: Full Schema
-- ═══════════════════════════════════════════════════════════════

-- A. digital_presence_profiles
CREATE TABLE public.digital_presence_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_twin_id UUID,
  mode TEXT NOT NULL DEFAULT 'create_new' CHECK (mode IN ('create_new','connect_existing','hybrid')),
  primary_site_id UUID,
  primary_brand_kit_id UUID,
  presence_type_flags TEXT[] DEFAULT '{}',
  default_autonomy_mode TEXT NOT NULL DEFAULT 'observe' CHECK (default_autonomy_mode IN ('observe','draft_review','guardrailed','autonomous')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.digital_presence_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own presence profiles" ON public.digital_presence_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_digital_presence_profiles_updated_at BEFORE UPDATE ON public.digital_presence_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- B. site_registry
CREATE TABLE public.site_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  presence_profile_id UUID REFERENCES public.digital_presence_profiles(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL DEFAULT 'native' CHECK (source_type IN ('native','shopify','webflow','wordpress','wix','squarespace','custom','other')),
  display_name TEXT NOT NULL,
  domain TEXT,
  environment_type TEXT NOT NULL DEFAULT 'live' CHECK (environment_type IN ('live','staging','preview')),
  editable_capabilities TEXT[] DEFAULT '{}',
  monitoring_capabilities TEXT[] DEFAULT '{}',
  sync_status TEXT DEFAULT 'pending',
  health_status TEXT DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sites" ON public.site_registry FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_site_registry_updated_at BEFORE UPDATE ON public.site_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- C. site_pages
CREATE TABLE public.site_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  site_id UUID REFERENCES public.site_registry(id) ON DELETE CASCADE NOT NULL,
  page_type TEXT NOT NULL DEFAULT 'other' CHECK (page_type IN ('homepage','landing','service','product','collection','booking','checkout','blog','faq','policy','member','other')),
  title TEXT NOT NULL,
  path TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  linked_offer_ids TEXT[] DEFAULT '{}',
  linked_product_ids TEXT[] DEFAULT '{}',
  linked_campaign_ids TEXT[] DEFAULT '{}',
  freshness_score NUMERIC DEFAULT 0,
  health_score NUMERIC DEFAULT 0,
  trust_score NUMERIC DEFAULT 0,
  conversion_score NUMERIC DEFAULT 0,
  mobile_score NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own pages" ON public.site_pages FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_site_pages_updated_at BEFORE UPDATE ON public.site_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- D. website_twins
CREATE TABLE public.website_twins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  site_id UUID REFERENCES public.site_registry(id) ON DELETE CASCADE NOT NULL,
  page_nodes JSONB DEFAULT '[]',
  journey_paths JSONB DEFAULT '[]',
  trust_nodes JSONB DEFAULT '[]',
  issue_nodes JSONB DEFAULT '[]',
  conversion_nodes JSONB DEFAULT '[]',
  commerce_nodes JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.website_twins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own twins" ON public.website_twins FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_website_twins_updated_at BEFORE UPDATE ON public.website_twins FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- E. brand_kits
CREATE TABLE public.brand_kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  presence_profile_id UUID REFERENCES public.digital_presence_profiles(id) ON DELETE CASCADE,
  logo_assets JSONB DEFAULT '[]',
  colors JSONB DEFAULT '[]',
  typography JSONB DEFAULT '[]',
  tone_descriptors TEXT[] DEFAULT '{}',
  image_direction TEXT[] DEFAULT '{}',
  style_tokens JSONB DEFAULT '{}',
  component_styles JSONB DEFAULT '{}',
  brand_rules JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brand_kits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own brand kits" ON public.brand_kits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_brand_kits_updated_at BEFORE UPDATE ON public.brand_kits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- F. promotions
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  presence_profile_id UUID REFERENCES public.digital_presence_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'banner',
  linked_offer_ids TEXT[] DEFAULT '{}',
  linked_product_ids TEXT[] DEFAULT '{}',
  linked_page_ids TEXT[] DEFAULT '{}',
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  active BOOLEAN DEFAULT false,
  promotion_assets JSONB DEFAULT '[]',
  sync_state TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own promotions" ON public.promotions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- G. product_presence
CREATE TABLE public.product_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id TEXT NOT NULL,
  site_id UUID REFERENCES public.site_registry(id) ON DELETE CASCADE NOT NULL,
  page_ids TEXT[] DEFAULT '{}',
  merchandising_status TEXT DEFAULT 'active',
  featured_state TEXT DEFAULT 'none',
  stale_content_risk NUMERIC DEFAULT 0,
  conversion_health NUMERIC DEFAULT 0,
  recommendation_state TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.product_presence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own product presence" ON public.product_presence FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_product_presence_updated_at BEFORE UPDATE ON public.product_presence FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- H. site_issues
CREATE TABLE public.site_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  site_id UUID REFERENCES public.site_registry(id) ON DELETE CASCADE NOT NULL,
  page_id UUID REFERENCES public.site_pages(id) ON DELETE SET NULL,
  issue_type TEXT NOT NULL CHECK (issue_type IN ('broken_link','missing_asset','stale_content','expired_promo','cta_weakness','trust_gap','mobile_issue','form_failure','checkout_issue','seo_gap','other')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('critical','high','medium','low')),
  confidence NUMERIC DEFAULT 0,
  detected_by_agent_ids TEXT[] DEFAULT '{}',
  recommended_fix_type TEXT,
  auto_fix_eligible BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','acknowledged','fixing','fixed','ignored','wont_fix')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own site issues" ON public.site_issues FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_site_issues_updated_at BEFORE UPDATE ON public.site_issues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- I. site_opportunities
CREATE TABLE public.site_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  site_id UUID REFERENCES public.site_registry(id) ON DELETE CASCADE NOT NULL,
  page_id UUID REFERENCES public.site_pages(id) ON DELETE SET NULL,
  opportunity_type TEXT NOT NULL CHECK (opportunity_type IN ('cta_improvement','new_landing_page','promo_opportunity','product_highlight','bundle_opportunity','trust_improvement','copy_refresh','journey_improvement','other')),
  impact_estimate TEXT DEFAULT 'medium',
  effort_estimate TEXT DEFAULT 'medium',
  confidence NUMERIC DEFAULT 0,
  surfaced_by_agent_ids TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','accepted','in_progress','completed','dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own opportunities" ON public.site_opportunities FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_site_opportunities_updated_at BEFORE UPDATE ON public.site_opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- J. content_freshness
CREATE TABLE public.content_freshness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  page_id UUID REFERENCES public.site_pages(id) ON DELETE CASCADE NOT NULL,
  stale_signals JSONB DEFAULT '[]',
  stale_reason TEXT,
  last_reviewed_at TIMESTAMPTZ,
  suggested_refresh TEXT,
  confidence NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.content_freshness ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own freshness records" ON public.content_freshness FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_content_freshness_updated_at BEFORE UPDATE ON public.content_freshness FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- K. change_plans
CREATE TABLE public.change_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  site_id UUID REFERENCES public.site_registry(id) ON DELETE CASCADE NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('page','site','brand','promotion','product_presence','collection','checkout','other')),
  target_id UUID,
  reason TEXT,
  generated_by_agent_ids TEXT[] DEFAULT '{}',
  risk_class TEXT DEFAULT 'low' CHECK (risk_class IN ('low','medium','high','critical')),
  confidence NUMERIC DEFAULT 0,
  proposed_diff_summary TEXT,
  preview_artifacts JSONB DEFAULT '[]',
  approval_required BOOLEAN DEFAULT true,
  policy_check_result JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','approved','applied','failed','rolled_back','cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.change_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own change plans" ON public.change_plans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_change_plans_updated_at BEFORE UPDATE ON public.change_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- L. patch_executions
CREATE TABLE public.patch_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  change_plan_id UUID REFERENCES public.change_plans(id) ON DELETE CASCADE NOT NULL,
  execution_mode TEXT NOT NULL CHECK (execution_mode IN ('manual_apply','api_apply','builder_publish','export_patch')),
  result JSONB,
  verification_result JSONB,
  rollback_available BOOLEAN DEFAULT false,
  executed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.patch_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own patch executions" ON public.patch_executions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- M. presence_receipts
CREATE TABLE public.presence_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  presence_profile_id UUID REFERENCES public.digital_presence_profiles(id) ON DELETE SET NULL,
  receipt_type TEXT NOT NULL CHECK (receipt_type IN ('publish','patch_apply','promotion_change','brand_update','site_connection','rollback','other')),
  related_change_plan_id UUID REFERENCES public.change_plans(id) ON DELETE SET NULL,
  actor TEXT,
  summary TEXT,
  approval_state TEXT DEFAULT 'none',
  affected_assets TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.presence_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own presence receipts" ON public.presence_receipts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- N. digital_agents
CREATE TABLE public.digital_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_type TEXT NOT NULL CHECK (agent_type IN ('web_strategist','design_director','content_strategist','cro_advisor','technical_qa','seo_discovery','ecommerce_merchandising','promotions_advisor','website_ops','app_experience')),
  display_name TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 5,
  mode_preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.digital_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own digital agents" ON public.digital_agents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_digital_agents_updated_at BEFORE UPDATE ON public.digital_agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- O. digital_agent_observations
CREATE TABLE public.digital_agent_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  agent_id UUID REFERENCES public.digital_agents(id) ON DELETE CASCADE NOT NULL,
  owner_type TEXT NOT NULL,
  owner_id UUID,
  title TEXT NOT NULL,
  summary TEXT,
  detailed_reasoning TEXT,
  confidence_level NUMERIC DEFAULT 0,
  uncertainty_level NUMERIC DEFAULT 0,
  recommendation_type TEXT,
  what_changed TEXT,
  what_would_improve TEXT,
  what_could_break TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.digital_agent_observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own agent observations" ON public.digital_agent_observations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_digital_agent_observations_updated_at BEFORE UPDATE ON public.digital_agent_observations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- P. digital_agent_debates
CREATE TABLE public.digital_agent_debates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  owner_type TEXT NOT NULL,
  owner_id UUID,
  participating_agent_ids TEXT[] DEFAULT '{}',
  alignment_summary TEXT,
  disagreement_summary TEXT,
  conflicting_assumptions JSONB DEFAULT '[]',
  resolution_signals JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.digital_agent_debates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own agent debates" ON public.digital_agent_debates FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_digital_agent_debates_updated_at BEFORE UPDATE ON public.digital_agent_debates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Q. chief_digital_synthesis
CREATE TABLE public.chief_digital_synthesis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  owner_type TEXT NOT NULL,
  owner_id UUID,
  strongest_opportunity TEXT,
  strongest_risk TEXT,
  highest_priority_fix TEXT,
  recommended_next_step TEXT,
  confidence_summary JSONB DEFAULT '{}',
  aligned_views JSONB DEFAULT '[]',
  divergent_views JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chief_digital_synthesis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own digital synthesis" ON public.chief_digital_synthesis FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_chief_digital_synthesis_updated_at BEFORE UPDATE ON public.chief_digital_synthesis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- R. presence_timeline_events
CREATE TABLE public.presence_timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  presence_profile_id UUID REFERENCES public.digital_presence_profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  site_id UUID REFERENCES public.site_registry(id) ON DELETE SET NULL,
  page_id UUID REFERENCES public.site_pages(id) ON DELETE SET NULL,
  related_change_plan_id UUID REFERENCES public.change_plans(id) ON DELETE SET NULL,
  related_agent_ids TEXT[] DEFAULT '{}',
  summary TEXT,
  impact_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.presence_timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own timeline events" ON public.presence_timeline_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- S. launch_records
CREATE TABLE public.launch_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  presence_profile_id UUID REFERENCES public.digital_presence_profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  objective TEXT,
  linked_pages TEXT[] DEFAULT '{}',
  linked_promotions TEXT[] DEFAULT '{}',
  readiness_state TEXT DEFAULT 'planning' CHECK (readiness_state IN ('planning','preparing','ready','launched','post_launch','cancelled')),
  checklist_items JSONB DEFAULT '[]',
  rollback_plan JSONB,
  advisor_signoff_state JSONB DEFAULT '{}',
  launch_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.launch_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own launch records" ON public.launch_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_launch_records_updated_at BEFORE UPDATE ON public.launch_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for common queries
CREATE INDEX idx_site_registry_user ON public.site_registry(user_id);
CREATE INDEX idx_site_pages_site ON public.site_pages(site_id);
CREATE INDEX idx_site_issues_site ON public.site_issues(site_id);
CREATE INDEX idx_site_issues_status ON public.site_issues(status);
CREATE INDEX idx_site_opportunities_site ON public.site_opportunities(site_id);
CREATE INDEX idx_change_plans_site ON public.change_plans(site_id);
CREATE INDEX idx_change_plans_status ON public.change_plans(status);
CREATE INDEX idx_digital_agent_observations_agent ON public.digital_agent_observations(agent_id);
CREATE INDEX idx_presence_timeline_events_site ON public.presence_timeline_events(site_id);
CREATE INDEX idx_promotions_active ON public.promotions(active);
CREATE INDEX idx_content_freshness_page ON public.content_freshness(page_id);
