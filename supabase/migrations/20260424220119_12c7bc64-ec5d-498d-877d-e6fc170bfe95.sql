
-- Phase 0: Shared Advisor Platform — schema additions

-- 1. Simulation runs (advisor "what-if" / dry-run scenarios)
CREATE TABLE IF NOT EXISTS public.advisor_simulation_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  advisor_id TEXT NOT NULL,
  domain TEXT NOT NULL,
  scenario_title TEXT NOT NULL,
  scenario_inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  scenario_assumptions JSONB NOT NULL DEFAULT '{}'::jsonb,
  projected_outcomes JSONB NOT NULL DEFAULT '{}'::jsonb,
  risk_summary TEXT,
  confidence NUMERIC(3,2) NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','running','completed','failed','archived')),
  source_citations JSONB NOT NULL DEFAULT '[]'::jsonb,
  ran_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.advisor_simulation_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own simulation runs" ON public.advisor_simulation_runs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own simulation runs" ON public.advisor_simulation_runs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own simulation runs" ON public.advisor_simulation_runs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own simulation runs" ON public.advisor_simulation_runs FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_advisor_sim_runs_user_advisor ON public.advisor_simulation_runs(user_id, advisor_id, created_at DESC);

-- 2. Source citations (what data/files an advisor used to reason)
CREATE TABLE IF NOT EXISTS public.advisor_source_citations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  advisor_id TEXT NOT NULL,
  invocation_id UUID,
  recommendation_id UUID,
  source_type TEXT NOT NULL,
  source_ref TEXT NOT NULL,
  source_label TEXT NOT NULL,
  excerpt TEXT,
  weight NUMERIC(3,2) NOT NULL DEFAULT 1.0 CHECK (weight >= 0 AND weight <= 1),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.advisor_source_citations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own citations" ON public.advisor_source_citations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own citations" ON public.advisor_source_citations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_advisor_citations_user_advisor ON public.advisor_source_citations(user_id, advisor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_advisor_citations_invocation ON public.advisor_source_citations(invocation_id);

-- 3. Deployment status (Definition-of-Done tracking per advisor)
CREATE TABLE IF NOT EXISTS public.advisor_deployment_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id TEXT NOT NULL UNIQUE,
  phase TEXT NOT NULL DEFAULT 'discovery' CHECK (phase IN ('discovery','design','wiring','intelligence','trust','testing','stabilization','deployment-ready','deployed')),
  scope_complete BOOLEAN NOT NULL DEFAULT false,
  ui_complete BOOLEAN NOT NULL DEFAULT false,
  backend_complete BOOLEAN NOT NULL DEFAULT false,
  context_wired BOOLEAN NOT NULL DEFAULT false,
  explainability_complete BOOLEAN NOT NULL DEFAULT false,
  trust_model_complete BOOLEAN NOT NULL DEFAULT false,
  authority_model_complete BOOLEAN NOT NULL DEFAULT false,
  receipts_integrated BOOLEAN NOT NULL DEFAULT false,
  simulation_capable BOOLEAN NOT NULL DEFAULT false,
  tests_passing BOOLEAN NOT NULL DEFAULT false,
  analytics_wired BOOLEAN NOT NULL DEFAULT false,
  admin_visibility BOOLEAN NOT NULL DEFAULT false,
  empty_states_handled BOOLEAN NOT NULL DEFAULT false,
  error_states_handled BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  ready_score NUMERIC(3,2) GENERATED ALWAYS AS (
    (CAST(scope_complete AS INTEGER) + CAST(ui_complete AS INTEGER) + CAST(backend_complete AS INTEGER) +
     CAST(context_wired AS INTEGER) + CAST(explainability_complete AS INTEGER) + CAST(trust_model_complete AS INTEGER) +
     CAST(authority_model_complete AS INTEGER) + CAST(receipts_integrated AS INTEGER) + CAST(simulation_capable AS INTEGER) +
     CAST(tests_passing AS INTEGER) + CAST(analytics_wired AS INTEGER) + CAST(admin_visibility AS INTEGER) +
     CAST(empty_states_handled AS INTEGER) + CAST(error_states_handled AS INTEGER))::NUMERIC / 14.0
  ) STORED,
  last_reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.advisor_deployment_status ENABLE ROW LEVEL SECURITY;
-- Read-only for any authenticated user (DoD is a global registry)
CREATE POLICY "Authenticated read deployment status" ON public.advisor_deployment_status FOR SELECT TO authenticated USING (true);
-- Writes go through admin role only
CREATE POLICY "Admins manage deployment status" ON public.advisor_deployment_status FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- 4. updated_at trigger
CREATE TRIGGER trg_advisor_sim_runs_updated_at
  BEFORE UPDATE ON public.advisor_simulation_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_advisor_deployment_status_updated_at
  BEFORE UPDATE ON public.advisor_deployment_status
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Seed the 9 Business System advisors into advisor_registry
INSERT INTO public.advisor_registry (
  advisor_id, display_name, domain, council, autonomy_level, maturity, risk_tier,
  capabilities, blocked_actions, required_inputs, confidence_threshold, default_model, metadata
) VALUES
  ('sales-advisor', 'Sales Advisor', 'business-os', 'customer-facing', 'L3-draft', 'scaffold', 'medium',
   '["lead_qualification","objection_handling","sales_script_drafting","pipeline_analysis","follow_up_planning","pricing_guidance","offer_design"]'::jsonb,
   '["send_external_email","modify_pricing_live","commit_deal"]'::jsonb,
   '["crm_records","leads","pipeline","quotes","offers"]'::jsonb,
   0.70, 'google/gemini-2.5-flash',
   '{"order":1,"focus":"revenue_conversion"}'::jsonb),
  ('customer-service-advisor', 'Customer Service Advisor', 'business-os', 'customer-facing', 'L3-draft', 'scaffold', 'medium',
   '["response_drafting","escalation_routing","csat_analysis","complaint_triage","support_workflow_design"]'::jsonb,
   '["send_external_email","close_ticket_autonomous","issue_refund"]'::jsonb,
   '["support_tickets","customer_records","sla_policies"]'::jsonb,
   0.70, 'google/gemini-2.5-flash',
   '{"order":2,"focus":"customer_experience"}'::jsonb),
  ('cfo-advisor', 'CFO Advisor', 'business-os', 'customer-facing', 'L2-recommend', 'scaffold', 'high',
   '["cash_flow_analysis","budget_planning","scenario_modelling","margin_analysis","financial_risk_review","spend_review"]'::jsonb,
   '["execute_payment","modify_budget_live","close_books","file_returns"]'::jsonb,
   '["financial_statements","budgets","transactions","forecasts"]'::jsonb,
   0.80, 'openai/gpt-5-mini',
   '{"order":3,"focus":"financial_decisions","sensitive":true}'::jsonb),
  ('marketing-advertising-advisor', 'Marketing & Advertising Advisor', 'business-os', 'customer-facing', 'L3-draft', 'scaffold', 'medium',
   '["campaign_planning","creative_briefing","positioning_analysis","copy_drafting","channel_recommendation","ad_test_planning"]'::jsonb,
   '["launch_paid_campaign","modify_brand_assets_live","send_external_email"]'::jsonb,
   '["campaigns","funnels","content_assets","audience_data"]'::jsonb,
   0.70, 'google/gemini-2.5-flash',
   '{"order":4,"focus":"acquisition_growth"}'::jsonb),
  ('growth-advisor', 'Growth Advisor', 'business-os', 'synthesizer', 'L2-recommend', 'scaffold', 'medium',
   '["funnel_analysis","activation_planning","retention_strategy","experiment_design","loop_identification","scaling_priorities"]'::jsonb,
   '["modify_pricing_live","launch_external_experiment","commit_strategic_shift"]'::jsonb,
   '["analytics","funnel_metrics","cohorts","experiments"]'::jsonb,
   0.75, 'openai/gpt-5-mini',
   '{"order":5,"focus":"growth_loops"}'::jsonb),
  ('tech-advisor', 'Tech Advisor', 'business-os', 'customer-facing', 'L3-draft', 'scaffold', 'medium',
   '["architecture_review","tradeoff_analysis","debugging_strategy","tooling_recommendation","scaling_planning","tech_risk_review"]'::jsonb,
   '["deploy_production","modify_infra_live","commit_breaking_change"]'::jsonb,
   '["product_roadmap","tech_stack","architecture_docs","incidents"]'::jsonb,
   0.75, 'openai/gpt-5-mini',
   '{"order":6,"focus":"technical_strategy"}'::jsonb),
  ('imports-exports-advisor', 'Imports & Exports Advisor', 'business-os', 'customer-facing', 'L2-recommend', 'scaffold', 'high',
   '["trade_workflow_design","sourcing_analysis","logistics_planning","documentation_guidance","cross_border_planning"]'::jsonb,
   '["execute_customs_filing","commit_supplier_contract","modify_shipping_live"]'::jsonb,
   '["trade_records","logistics","supplier_data","customs_docs"]'::jsonb,
   0.80, 'openai/gpt-5-mini',
   '{"order":7,"focus":"trade_logistics","sensitive":true}'::jsonb),
  ('taxes-laws-advisor', 'Taxes & Laws Advisor', 'business-os', 'customer-facing', 'L1-suggest', 'scaffold', 'critical',
   '["compliance_checklist","issue_spotting","preparation_guidance","decision_structure_support","document_organization"]'::jsonb,
   '["file_tax_return","provide_legal_advice","submit_legal_filing","execute_compliance_action"]'::jsonb,
   '["tax_documents","jurisdiction_data","compliance_records"]'::jsonb,
   0.85, 'openai/gpt-5',
   '{"order":8,"focus":"compliance_preparation","sensitive":true,"professional_disclaimer_required":true}'::jsonb),
  ('ceo-advisor', 'CEO Advisor', 'business-os', 'synthesizer', 'L2-recommend', 'scaffold', 'high',
   '["strategic_synthesis","prioritization","tradeoff_analysis","cross_function_synthesis","decision_support","leadership_thinking"]'::jsonb,
   '["commit_strategic_shift","execute_org_change","make_external_announcement"]'::jsonb,
   '["all_advisor_outputs","business_metrics","goals","decisions_log"]'::jsonb,
   0.80, 'openai/gpt-5',
   '{"order":9,"focus":"executive_synthesis","synthesizer_inputs":["sales-advisor","cfo-advisor","marketing-advertising-advisor","growth-advisor","tech-advisor","customer-service-advisor"]}'::jsonb)
ON CONFLICT (advisor_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  domain = EXCLUDED.domain,
  council = EXCLUDED.council,
  capabilities = EXCLUDED.capabilities,
  blocked_actions = EXCLUDED.blocked_actions,
  required_inputs = EXCLUDED.required_inputs,
  metadata = EXCLUDED.metadata,
  updated_at = now();

-- 6. Seed deployment status rows (all start at scaffold/discovery)
INSERT INTO public.advisor_deployment_status (advisor_id, phase, notes)
SELECT advisor_id, 'discovery', 'Awaiting Phase 1+ implementation'
FROM (VALUES
  ('sales-advisor'),('customer-service-advisor'),('cfo-advisor'),
  ('marketing-advertising-advisor'),('growth-advisor'),('tech-advisor'),
  ('imports-exports-advisor'),('taxes-laws-advisor'),('ceo-advisor')
) AS t(advisor_id)
ON CONFLICT (advisor_id) DO NOTHING;
