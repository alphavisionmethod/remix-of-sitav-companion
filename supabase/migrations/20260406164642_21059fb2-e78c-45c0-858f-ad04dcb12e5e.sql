-- Seed ai_launch_honesty with honest capability classifications
-- Only insert if no records exist to avoid duplicates
INSERT INTO public.ai_launch_honesty (user_id, capability_key, launch_honesty_class, public_claim_allowed, qualifier_required, notes)
SELECT 
  '00000000-0000-0000-0000-000000000000'::uuid,
  v.capability_key,
  v.launch_honesty_class,
  v.public_claim_allowed,
  v.qualifier_required,
  v.notes
FROM (VALUES
  -- Core (real)
  ('auth.login', 'real', true, false, 'Supabase Auth fully operational'),
  ('auth.signup', 'real', true, false, 'Supabase Auth fully operational'),
  ('auth.password_reset', 'real', true, false, 'Supabase Auth fully operational'),
  ('notifications.push', 'real', true, false, 'DB-backed notification queue'),
  ('notifications.dedup', 'real', true, false, 'Trigger-based deduplication'),
  ('proof.receipt_creation', 'real', true, false, 'Persisted proof records'),
  ('proof.hash_verification', 'real', true, false, 'Receipt hash chain'),
  ('approval.queue', 'real', true, false, 'DB-backed approval workflow'),
  ('approval.execution', 'real', true, false, 'Trust-weighted action execution'),
  ('audit.logging', 'real', true, false, 'Trigger-based audit trail'),
  ('reality.mode_switching', 'real', true, false, 'Full dual-reality system'),
  ('files.upload', 'real', true, false, 'Supabase storage integration'),
  ('files.metadata', 'real', true, false, 'DB-persisted file metadata'),

  -- AI Gateway (partial — infrastructure exists, no API key)
  ('ai.gateway.routing', 'partial', false, true, 'Routing policies defined; no AI provider key configured'),
  ('ai.gateway.budget_enforcement', 'partial', false, true, 'Budget policies in DB; enforcement active but no live AI calls'),
  ('ai.gateway.fallback', 'partial', false, true, 'Fallback chain defined; untested with live providers'),
  ('ai.gateway.receipt_logging', 'real', true, false, 'Inference receipts persisted to DB'),
  ('ai.capability.advisor_synthesis', 'planned', false, true, 'Advisor architecture built; needs AI provider'),
  ('ai.capability.boardroom_briefing', 'planned', false, true, 'UI ready; needs AI-generated content'),
  ('ai.capability.recommendation_engine', 'planned', false, true, 'Service scaffold; needs AI provider'),
  ('ai.workforce.agent_roster', 'partial', false, true, 'Registry DB exists; agents not executing'),
  ('ai.workforce.task_governance', 'partial', false, true, 'Task queue in DB; no live agent execution'),
  ('ai.workforce.cost_tracking', 'real', true, false, 'Cost ledger and budget policies operational'),

  -- Finance (planned — engines built, no real financial data)
  ('finance.safe_to_spend', 'planned', false, true, 'Calculation engine built; needs real account data'),
  ('finance.tax_estimation', 'planned', false, true, 'Engine built; needs financial connector'),
  ('finance.burn_rate', 'planned', false, true, 'Calculation ready; needs transaction feed'),
  ('finance.invoice_aging', 'partial', false, true, 'Invoice table exists; aging logic ready'),
  ('finance.bill_calendar', 'planned', false, true, 'Service built; needs bank connector'),
  ('finance.subscription_detection', 'planned', false, true, 'Detection engine built; needs transaction data'),
  ('finance.waste_detection', 'planned', false, true, 'Engine ready; needs spending data'),
  ('finance.cash_flow_projection', 'planned', false, true, 'Projection engine built; needs real data feed'),

  -- Business (partial — DB tables exist, limited real data flow)
  ('business.lead_management', 'partial', false, true, 'Leads table operational; CRM features demo-backed'),
  ('business.customer_records', 'partial', false, true, 'Customer table exists; manual entry only'),
  ('business.invoice_management', 'partial', false, true, 'Invoice CRUD operational'),
  ('business.opportunity_ranking', 'planned', false, true, 'Service built; needs AI scoring'),
  ('business.customer_health', 'planned', false, true, 'Health scoring engine; needs interaction data'),
  ('business.revenue_forecasting', 'planned', false, true, 'Forecast engine; needs historical data'),

  -- Concierge (planned)
  ('concierge.household_ops', 'planned', false, true, 'Task management built; not connected to real services'),
  ('concierge.travel_booking', 'planned', false, true, 'UI scaffold; no booking API connected'),
  ('concierge.responsibilities', 'planned', false, true, 'Responsibility engine; needs household data'),

  -- Integrations (partial — framework exists, limited real connectors)
  ('integrations.connector_framework', 'partial', false, true, 'Control plane built; no live OAuth connectors'),
  ('integrations.webhook_relay', 'planned', false, true, 'Relay architecture defined; not deployed'),
  ('integrations.sync_engine', 'planned', false, true, 'Sync logic built; needs live connectors'),

  -- Workflows
  ('workflows.engine', 'partial', false, true, 'Workflow table + execution engine in DB'),
  ('workflows.automation_rules', 'partial', false, true, 'Rule engine built; limited automation'),

  -- Learning & Growth
  ('learning.goal_tracking', 'planned', false, true, 'Goal tracker service built; in-memory only'),
  ('learning.financial_literacy', 'planned', false, true, 'Literacy engine; needs content + AI'),

  -- Ecosystem Admin
  ('admin.reality_classification', 'real', true, false, 'Classification CRUD operational'),
  ('admin.truth_dashboard', 'real', true, false, 'Dashboard reads live classification data'),
  ('admin.deployment_center', 'partial', false, true, 'UI built; limited real deployment data')
) AS v(capability_key, launch_honesty_class, public_claim_allowed, qualifier_required, notes)
WHERE NOT EXISTS (
  SELECT 1 FROM public.ai_launch_honesty WHERE capability_key = v.capability_key
);