-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Synthesized schema for: auth-identity
-- AUTO-GENERATED from supabase/migrations/. DO NOT EDIT.
-- Regenerate via: npx tsx scripts/db/generate/synthesize-domain-schemas.ts
-- Source migrations: 15
-- Last generated: 2026-04-16T21:25:36.045Z
-- ═══════════════════════════════════════════════════════════════

-- ── 20260403005816_958dada3-fe5c-47a4-8997-f3a556e3692d.sql ──
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT, avatar_url TEXT, role TEXT DEFAULT 'founder',
  demo_mode BOOLEAN NOT NULL DEFAULT true, onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, email TEXT, phone TEXT, company TEXT, source TEXT,
  status TEXT NOT NULL DEFAULT 'new', opportunity_score INTEGER DEFAULT 0,
  urgency TEXT DEFAULT 'low', likely_value NUMERIC(12,2),
  stale_risk BOOLEAN DEFAULT false, next_action TEXT, assigned_advisor TEXT,
  last_contact_at TIMESTAMPTZ, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own leads" ON public.leads FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, email TEXT, phone TEXT, company TEXT,
  relationship_type TEXT DEFAULT 'client', health_score INTEGER DEFAULT 80,
  status TEXT NOT NULL DEFAULT 'active', lifetime_revenue NUMERIC(12,2) DEFAULT 0,
  last_contact_at TIMESTAMPTZ, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own customers" ON public.customers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  title TEXT NOT NULL, stage TEXT NOT NULL DEFAULT 'lead',
  value NUMERIC(12,2), confidence INTEGER DEFAULT 50,
  blockers TEXT, stale_risk BOOLEAN DEFAULT false,
  quote_status TEXT, next_action TEXT, last_movement_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own opportunities" ON public.opportunities FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  title TEXT NOT NULL, line_items JSONB DEFAULT '[]'::jsonb,
  total NUMERIC(12,2), status TEXT NOT NULL DEFAULT 'draft',
  expiry_date DATE, revision_count INTEGER DEFAULT 0, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own quotes" ON public.quotes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL, amount NUMERIC(12,2) NOT NULL,
  due_date DATE NOT NULL, status TEXT NOT NULL DEFAULT 'draft',
  aging_days INTEGER DEFAULT 0, payment_proof TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own invoices" ON public.invoices FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'email', subject TEXT, body TEXT,
  status TEXT NOT NULL DEFAULT 'draft', requires_approval BOOLEAN DEFAULT false,
  proof_of_send TEXT, sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own communications" ON public.communications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_communications_updated_at BEFORE UPDATE ON public.communications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, value NUMERIC(12,2) DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'lead', probability NUMERIC(5,2) DEFAULT 0,
  customer_id TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own deals" ON public.deals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_deals_user ON public.deals(user_id);

-- ── 20260404160933_993f8234-883b-4f9d-8737-0d06a36a5c51.sql ──
-- ══════════════════════════════════════════════════════════════
-- SITA OS — Phase 2: Create 20+ missing database tables
-- ══════════════════════════════════════════════════════════════

-- 1. Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  display_name text,
  avatar_url text,
  timezone text DEFAULT 'UTC',
  locale text DEFAULT 'en',
  onboarding_completed boolean DEFAULT false,
  preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- 2. User Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- 3. Opportunities
CREATE TABLE public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  value numeric DEFAULT 0,
  stage text DEFAULT 'discovery',
  probability numeric DEFAULT 0,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  days_open integer DEFAULT 0,
  next_action text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own opportunities" ON public.opportunities FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Quotes
CREATE TABLE public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  opportunity_id uuid REFERENCES public.opportunities(id) ON DELETE SET NULL,
  quote_number text,
  amount numeric DEFAULT 0,
  status text DEFAULT 'draft',
  valid_until timestamptz,
  line_items jsonb DEFAULT '[]'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own quotes" ON public.quotes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Communications
CREATE TABLE public.communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entity_type text,
  entity_id text,
  channel text DEFAULT 'email',
  direction text DEFAULT 'outbound',
  subject text,
  body text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own comms" ON public.communications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Bills
CREATE TABLE public.bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  payee text NOT NULL,
  amount numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  status text DEFAULT 'upcoming',
  due_at timestamptz,
  paid_at timestamptz,
  category text,
  recurring boolean DEFAULT false,
  recurrence_rule text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own bills" ON public.bills FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. Subscriptions
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  provider text,
  amount numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  billing_cycle text DEFAULT 'monthly',
  status text DEFAULT 'active',
  next_billing_at timestamptz,
  category text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own subs" ON public.subscriptions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. Reserves
CREATE TABLE public.reserves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  target_amount numeric DEFAULT 0,
  current_amount numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  purpose text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.reserves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own reserves" ON public.reserves FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 9. Tasks (general)
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  domain text,
  due_at timestamptz,
  completed_at timestamptz,
  assigned_to text,
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own tasks" ON public.tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 10. Bookings
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  provider text,
  status text DEFAULT 'confirmed',
  date timestamptz,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own bookings" ON public.bookings FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 11. Budgets
CREATE TABLE public.budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL,
  allocated numeric DEFAULT 0,
  spent numeric DEFAULT 0,
  period text DEFAULT 'monthly',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own budgets" ON public.budgets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 12. Deals
CREATE TABLE public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  value numeric DEFAULT 0,
  stage text DEFAULT 'prospecting',
  probability numeric DEFAULT 0,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own deals" ON public.deals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 13. Goals
CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  domain text,
  target_value numeric,
  current_value numeric DEFAULT 0,
  unit text,
  status text DEFAULT 'active',
  due_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own goals" ON public.goals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 14. Household Tasks
CREATE TABLE public.household_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  category text DEFAULT 'general',
  assigned_to text,
  status text DEFAULT 'pending',
  priority text DEFAULT 'medium',
  due_at timestamptz,
  recurrence_rule text,
  estimated_minutes integer DEFAULT 15,
  completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.household_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own household tasks" ON public.household_tasks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 15. Workflows
CREATE TABLE public.workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  domain text,
  status text DEFAULT 'active',
  trigger_type text DEFAULT 'manual',
  steps jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own workflows" ON public.workflows FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 16. Workflow Runs
CREATE TABLE public.workflow_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  workflow_id uuid REFERENCES public.workflows(id) ON DELETE CASCADE,
  status text DEFAULT 'running',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  result jsonb DEFAULT '{}'::jsonb,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own runs" ON public.workflow_runs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 17. Approval Queue
CREATE TABLE public.approval_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  domain text,
  risk_level text DEFAULT 'medium',
  status text DEFAULT 'pending',
  policy_context text,
  entity_type text,
  entity_id text,
  requested_by text,
  decided_at timestamptz,
  decided_by text,
  decision_reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.approval_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own approvals" ON public.approval_queue FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 18. Policies
CREATE TABLE public.policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  domain text,
  rule_type text DEFAULT 'threshold',
  conditions jsonb DEFAULT '{}'::jsonb,
  actions jsonb DEFAULT '[]'::jsonb,
  enabled boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own policies" ON public.policies FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 19. Audit Logs
CREATE TABLE public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  domain text,
  details jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own audit logs" ON public.audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own audit logs" ON public.audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 20. Capabilities
CREATE TABLE public.capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text,
  description text,
  enabled boolean DEFAULT true,
  risk_tier text DEFAULT 'low',
  autonomy_level text DEFAULT 'observe',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.capabilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view capabilities" ON public.capabilities FOR SELECT TO authenticated USING (true);

-- 21. Trust State
CREATE TABLE public.trust_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  trust_level text DEFAULT 'standard',
  score numeric DEFAULT 50,
  evidence jsonb DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.trust_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own trust" ON public.trust_state FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 22. Execution Envelopes
CREATE TABLE public.execution_envelopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  capability_id text,
  status text DEFAULT 'pending',
  intent jsonb DEFAULT '{}'::jsonb,
  result jsonb,
  approved_by text,
  correlation_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.execution_envelopes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own envelopes" ON public.execution_envelopes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 23. Connector Configs
CREATE TABLE public.connector_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  connector_id text NOT NULL,
  provider text NOT NULL,
  status text DEFAULT 'disconnected',
  config jsonb DEFAULT '{}'::jsonb,
  last_sync_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.connector_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own connectors" ON public.connector_configs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 24. Sync Logs
CREATE TABLE public.sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  connector_id text NOT NULL,
  status text DEFAULT 'success',
  records_synced integer DEFAULT 0,
  error text,
  synced_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own sync logs" ON public.sync_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own sync logs" ON public.sync_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 25. Incidents
CREATE TABLE public.incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  severity text DEFAULT 'medium',
  status text DEFAULT 'open',
  domain text,
  resolution text,
  resolved_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own incidents" ON public.incidents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.approval_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_runs;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON public.bills FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reserves_updated_at BEFORE UPDATE ON public.reserves FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON public.goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON public.policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trust_state_updated_at BEFORE UPDATE ON public.trust_state FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_execution_envelopes_updated_at BEFORE UPDATE ON public.execution_envelopes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_connector_configs_updated_at BEFORE UPDATE ON public.connector_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ── 20260404190001_setup_sessions.sql ──
create table if not exists public.setup_sessions (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  device_id text not null,
  session_data jsonb not null default '{}'::jsonb,
  current_phase text not null default 'boot',
  branch_path text not null default 'personal',
  completion_pct integer not null default 0,
  interrupted boolean not null default false,
  interruption_reason text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_setup_sessions_user_id on public.setup_sessions(user_id);

alter table public.setup_sessions enable row level security;

create policy "Users can read own setup sessions"
  on public.setup_sessions for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert own setup sessions"
  on public.setup_sessions for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update own setup sessions"
  on public.setup_sessions for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own setup sessions"
  on public.setup_sessions for delete
  to authenticated
  using (auth.uid() = user_id);

-- ── 20260404193920_fd8d729a-dcc6-4ee8-8fdf-d35ca2063506.sql ──
-- Enum
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- user_roles FIRST (before function that references it)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Now the function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text, avatar_url text, email text, phone text,
  timezone text DEFAULT 'UTC', locale text DEFAULT 'en',
  onboarding_completed boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- customers
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  name text NOT NULL, email text, phone text, company text,
  status text DEFAULT 'active', tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own customers" ON public.customers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- leads
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  name text NOT NULL, email text, phone text, source text,
  status text DEFAULT 'new', score integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own leads" ON public.leads FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- deals
CREATE TABLE IF NOT EXISTS public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  name text NOT NULL, value numeric DEFAULT 0, stage text DEFAULT 'discovery',
  probability numeric DEFAULT 0, customer_id uuid, expected_close_date date,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own deals" ON public.deals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  customer_id uuid, invoice_number text, amount_cents bigint DEFAULT 0,
  currency text DEFAULT 'USD', status text DEFAULT 'draft', due_date date,
  paid_at timestamptz, line_items jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own invoices" ON public.invoices FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- opportunities
CREATE TABLE IF NOT EXISTS public.opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  title text NOT NULL, description text, value numeric DEFAULT 0,
  stage text DEFAULT 'qualification', probability numeric DEFAULT 0,
  customer_id uuid, metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own opportunities" ON public.opportunities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- quotes
CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  customer_id uuid, opportunity_id uuid, title text NOT NULL,
  total_cents bigint DEFAULT 0, currency text DEFAULT 'USD',
  status text DEFAULT 'draft', valid_until date,
  line_items jsonb DEFAULT '[]'::jsonb, metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own quotes" ON public.quotes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- communications
CREATE TABLE IF NOT EXISTS public.communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  contact_id uuid, channel text NOT NULL, direction text NOT NULL,
  subject text, body text, status text DEFAULT 'sent',
  metadata jsonb DEFAULT '{}'::jsonb, created_at timestamptz DEFAULT now()
);
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own communications" ON public.communications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- bills
CREATE TABLE IF NOT EXISTS public.bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  vendor text NOT NULL, amount_cents bigint DEFAULT 0, currency text DEFAULT 'USD',
  due_date date, status text DEFAULT 'pending', category text,
  recurring boolean DEFAULT false, metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own bills" ON public.bills FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  name text NOT NULL, provider text, amount_cents bigint DEFAULT 0,
  currency text DEFAULT 'USD', billing_cycle text DEFAULT 'monthly',
  status text DEFAULT 'active', next_billing_date date,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own subscriptions" ON public.subscriptions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- reserves
CREATE TABLE IF NOT EXISTS public.reserves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  name text NOT NULL, target_cents bigint DEFAULT 0, current_cents bigint DEFAULT 0,
  currency text DEFAULT 'USD', purpose text, metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.reserves ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own reserves" ON public.reserves FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- financial_documents
CREATE TABLE IF NOT EXISTS public.financial_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  document_type text NOT NULL, title text NOT NULL, file_path text,
  amount_cents bigint, currency text DEFAULT 'USD', status text DEFAULT 'pending',
  extracted_data jsonb DEFAULT '{}'::jsonb, metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.financial_documents ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own financial docs" ON public.financial_documents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  title text NOT NULL, description text, status text DEFAULT 'pending',
  priority text DEFAULT 'medium', due_date timestamptz, completed_at timestamptz,
  category text, tags text[] DEFAULT '{}', metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own tasks" ON public.tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  type text NOT NULL, title text NOT NULL, provider text,
  status text DEFAULT 'pending', date timestamptz,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own bookings" ON public.bookings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- budgets
CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  category text NOT NULL, allocated numeric DEFAULT 0, spent numeric DEFAULT 0,
  period text DEFAULT 'monthly', metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own budgets" ON public.budgets FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- goals
CREATE TABLE IF NOT EXISTS public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  title text NOT NULL, description text, target_value numeric,
  current_value numeric DEFAULT 0, unit text, status text DEFAULT 'active',
  due_date date, metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own goals" ON public.goals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- household_tasks
CREATE TABLE IF NOT EXISTS public.household_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  title text NOT NULL, description text, assignee text,
  status text DEFAULT 'pending', frequency text DEFAULT 'once',
  due_date date, completed_at timestamptz, metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.household_tasks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own household tasks" ON public.household_tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  title text NOT NULL, body text, category text NOT NULL,
  channel text DEFAULT 'push', urgency text DEFAULT 'normal',
  status text DEFAULT 'pending', action_url text,
  read_at timestamptz, sent_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb, created_at timestamptz DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- advisor_configs
CREATE TABLE IF NOT EXISTS public.advisor_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  advisor_id text NOT NULL, domain text NOT NULL, enabled boolean DEFAULT true,
  autonomy_level text DEFAULT 'L1-suggest', preferences jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, advisor_id)
);
ALTER TABLE public.advisor_configs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own advisor configs" ON public.advisor_configs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- advisor_requests
CREATE TABLE IF NOT EXISTS public.advisor_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  advisor_id text, intent text NOT NULL, complexity text DEFAULT 'standard',
  status text DEFAULT 'pending', input_data jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.advisor_requests ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own advisor requests" ON public.advisor_requests FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- advisor_responses
CREATE TABLE IF NOT EXISTS public.advisor_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  request_id uuid, advisor_id text, model_used text,
  tokens_used integer DEFAULT 0, confidence numeric DEFAULT 0,
  latency_ms integer DEFAULT 0, response_data jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb, created_at timestamptz DEFAULT now()
);
ALTER TABLE public.advisor_responses ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own advisor responses" ON public.advisor_responses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- user_memory
CREATE TABLE IF NOT EXISTS public.user_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  category text NOT NULL, key text NOT NULL, value jsonb NOT NULL,
  source text DEFAULT 'system', confidence numeric DEFAULT 1.0,
  expires_at timestamptz, metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category, key)
);
ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own memory" ON public.user_memory FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- workflows
CREATE TABLE IF NOT EXISTS public.workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  name text NOT NULL, description text, trigger_type text DEFAULT 'manual',
  trigger_config jsonb DEFAULT '{}'::jsonb, steps jsonb DEFAULT '[]'::jsonb,
  enabled boolean DEFAULT true, metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own workflows" ON public.workflows FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- workflow_runs
CREATE TABLE IF NOT EXISTS public.workflow_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  workflow_id uuid, status text DEFAULT 'running', current_step integer DEFAULT 0,
  step_results jsonb DEFAULT '[]'::jsonb, error text,
  started_at timestamptz DEFAULT now(), completed_at timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb, created_at timestamptz DEFAULT now()
);
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own workflow runs" ON public.workflow_runs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- workflow_steps
CREATE TABLE IF NOT EXISTS public.workflow_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), workflow_id uuid, run_id uuid,
  user_id uuid NOT NULL, step_index integer DEFAULT 0, step_type text NOT NULL,
  config jsonb DEFAULT '{}'::jsonb, status text DEFAULT 'pending',
  input_data jsonb DEFAULT '{}'::jsonb, output_data jsonb DEFAULT '{}'::jsonb,
  error text, started_at timestamptz, completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own workflow steps" ON public.workflow_steps FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- events
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  event_type text NOT NULL, domain text, entity_id text,
  payload jsonb DEFAULT '{}'::jsonb, source text DEFAULT 'system',
  correlation_id text, metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own events" ON public.events FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- proof_records
CREATE TABLE IF NOT EXISTS public.proof_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  action text NOT NULL, domain text, entity_id text, actor text NOT NULL,
  evidence jsonb DEFAULT '{}'::jsonb, hash text, metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.proof_records ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own proof records" ON public.proof_records FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- receipts
CREATE TABLE IF NOT EXISTS public.receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  type text NOT NULL, domain text, entity_id text,
  payload jsonb DEFAULT '{}'::jsonb, hash text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own receipts" ON public.receipts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- execution_envelopes
CREATE TABLE IF NOT EXISTS public.execution_envelopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  capability_id text NOT NULL, status text DEFAULT 'pending',
  intent jsonb DEFAULT '{}'::jsonb, result jsonb, approved_by text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.execution_envelopes ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own envelopes" ON public.execution_envelopes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- approval_queue
CREATE TABLE IF NOT EXISTS public.approval_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  action_summary text NOT NULL, proposed_action jsonb DEFAULT '{}'::jsonb,
  status text DEFAULT 'pending', decided_at timestamptz, decision_reason text,
  domain text, risk_level text DEFAULT 'medium', metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.approval_queue ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own approvals" ON public.approval_queue FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- policies
CREATE TABLE IF NOT EXISTS public.policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  name text NOT NULL, category text NOT NULL, description text,
  conditions jsonb DEFAULT '{}'::jsonb, actions jsonb DEFAULT '{}'::jsonb,
  approval_required boolean DEFAULT false, active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own policies" ON public.policies FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- incidents
CREATE TABLE IF NOT EXISTS public.incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  title text NOT NULL, description text, severity text NOT NULL DEFAULT 'medium',
  status text DEFAULT 'open', impact text, root_cause text, assigned_to text,
  acknowledged_at timestamptz, resolved_at timestamptz,
  services_affected text[] DEFAULT '{}', timeline jsonb DEFAULT '[]'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own incidents" ON public.incidents FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- audit_logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), actor_id uuid NOT NULL,
  action text NOT NULL, resource_type text, resource_id text,
  result text DEFAULT 'success', changes jsonb DEFAULT '{}'::jsonb,
  ip_address text, user_agent text, correlation_id text,
  metadata jsonb DEFAULT '{}'::jsonb, created_at timestamptz DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users view own audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (auth.uid() = actor_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users insert own audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = actor_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- council_decisions
CREATE TABLE IF NOT EXISTS public.council_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  council_id text NOT NULL, topic text NOT NULL, description text,
  status text DEFAULT 'pending', domain text, votes jsonb DEFAULT '[]'::jsonb,
  votes_for integer DEFAULT 0, votes_against integer DEFAULT 0,
  votes_abstained integer DEFAULT 0, quorum integer DEFAULT 3,
  resolution text, decided_at timestamptz, metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.council_decisions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own council decisions" ON public.council_decisions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- device_statuses
CREATE TABLE IF NOT EXISTS public.device_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  device_id text NOT NULL, device_name text NOT NULL, device_type text DEFAULT 'server',
  health text DEFAULT 'healthy', connectivity text DEFAULT 'online',
  last_heartbeat timestamptz DEFAULT now(), os_version text,
  uptime_seconds bigint DEFAULT 0, cpu_pct numeric DEFAULT 0,
  memory_pct numeric DEFAULT 0, disk_pct numeric DEFAULT 0,
  issues jsonb DEFAULT '[]'::jsonb, metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.device_statuses ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own devices" ON public.device_statuses FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- connector_configs
CREATE TABLE IF NOT EXISTS public.connector_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  service text NOT NULL, status text DEFAULT 'active', config jsonb DEFAULT '{}'::jsonb,
  last_sync_at timestamptz, metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.connector_configs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own connector configs" ON public.connector_configs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- connector_credentials
CREATE TABLE IF NOT EXISTS public.connector_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  connector_id text NOT NULL, provider text NOT NULL, status text DEFAULT 'active',
  encrypted_token text, metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.connector_credentials ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own connector creds" ON public.connector_credentials FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- sync_logs
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  connector_id text NOT NULL, status text DEFAULT 'completed',
  records_synced integer DEFAULT 0, error text, metadata jsonb DEFAULT '{}'::jsonb,
  synced_at timestamptz DEFAULT now()
);
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own sync logs" ON public.sync_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- trust_state
CREATE TABLE IF NOT EXISTS public.trust_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  entity_type text NOT NULL, entity_id text NOT NULL,
  trust_level text DEFAULT 'neutral', score numeric DEFAULT 50,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.trust_state ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own trust state" ON public.trust_state FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- projections
CREATE TABLE IF NOT EXISTS public.projections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  domain text NOT NULL, type text NOT NULL, data jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb, generated_at timestamptz DEFAULT now()
);
ALTER TABLE public.projections ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own projections" ON public.projections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- capabilities
CREATE TABLE IF NOT EXISTS public.capabilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL,
  domain text NOT NULL, description text, enabled boolean DEFAULT true,
  risk_tier text DEFAULT 'low', metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.capabilities ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Anyone can read capabilities" ON public.capabilities FOR SELECT TO authenticated USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- tenant_firewall_logs
CREATE TABLE IF NOT EXISTS public.tenant_firewall_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  action text NOT NULL, source_ip text, rule_matched text,
  blocked boolean DEFAULT false, metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.tenant_firewall_logs ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users view own firewall logs" ON public.tenant_firewall_logs FOR SELECT TO authenticated USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE POLICY "Users insert own firewall logs" ON public.tenant_firewall_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- agent_telemetry
CREATE TABLE IF NOT EXISTS public.agent_telemetry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  agent_id text NOT NULL, metric_name text NOT NULL, metric_value numeric NOT NULL,
  unit text, tags jsonb DEFAULT '{}'::jsonb, metadata jsonb DEFAULT '{}'::jsonb,
  recorded_at timestamptz DEFAULT now()
);
ALTER TABLE public.agent_telemetry ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own agent telemetry" ON public.agent_telemetry FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- agent_signals
CREATE TABLE IF NOT EXISTS public.agent_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  agent_id text NOT NULL, signal_type text NOT NULL, severity text DEFAULT 'info',
  message text, acknowledged boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb, created_at timestamptz DEFAULT now()
);
ALTER TABLE public.agent_signals ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own agent signals" ON public.agent_signals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- agent_action_receipts
CREATE TABLE IF NOT EXISTS public.agent_action_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  agent_id text NOT NULL, action_type text NOT NULL,
  input_data jsonb DEFAULT '{}'::jsonb, output_data jsonb DEFAULT '{}'::jsonb,
  risk_score numeric DEFAULT 0, autonomy_level text,
  governance_checks jsonb DEFAULT '[]'::jsonb, status text DEFAULT 'completed',
  tokens_used integer DEFAULT 0, cost_cents integer DEFAULT 0,
  metadata jsonb DEFAULT '{}'::jsonb, created_at timestamptz DEFAULT now()
);
ALTER TABLE public.agent_action_receipts ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own action receipts" ON public.agent_action_receipts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- agent_schedules
CREATE TABLE IF NOT EXISTS public.agent_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  agent_id text NOT NULL, schedule_type text NOT NULL, cron_expression text,
  next_run_at timestamptz, last_run_at timestamptz, enabled boolean DEFAULT true,
  config jsonb DEFAULT '{}'::jsonb, metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.agent_schedules ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own agent schedules" ON public.agent_schedules FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- file_metadata
CREATE TABLE IF NOT EXISTS public.file_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL,
  filename text NOT NULL, mime_type text, size_bytes bigint DEFAULT 0,
  storage_path text, domain text, status text DEFAULT 'uploaded',
  extracted_data jsonb DEFAULT '{}'::jsonb, metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);
ALTER TABLE public.file_metadata ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN CREATE POLICY "Users manage own files" ON public.file_metadata FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.approval_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_incidents_user_status ON public.incidents(user_id, status);
CREATE INDEX IF NOT EXISTS idx_incidents_user_severity ON public.incidents(user_id, severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON public.audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_council_decisions_user ON public.council_decisions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_device_statuses_user ON public.device_statuses(user_id);
CREATE INDEX IF NOT EXISTS idx_advisor_requests_user ON public.advisor_requests(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_advisor_responses_user ON public.advisor_responses(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_runs_user ON public.workflow_runs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_events_user_type ON public.events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON public.tasks(user_id, status);
CREATE INDEX IF NOT EXISTS idx_deals_user_stage ON public.deals(user_id, stage);
CREATE INDEX IF NOT EXISTS idx_invoices_user_status ON public.invoices(user_id, status);
CREATE INDEX IF NOT EXISTS idx_agent_telemetry_agent ON public.agent_telemetry(agent_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_action_receipts_agent ON public.agent_action_receipts(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approval_queue_user ON public.approval_queue(user_id, status);

-- ── 20260404232554_f874895a-e12a-4ca1-a46d-b7ce40ade878.sql ──
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END $$;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin') OR auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT, avatar_url TEXT, role TEXT DEFAULT 'founder',
  demo_mode BOOLEAN NOT NULL DEFAULT true, onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, email TEXT, phone TEXT, company TEXT, source TEXT,
  status TEXT NOT NULL DEFAULT 'new', opportunity_score INTEGER DEFAULT 0,
  urgency TEXT DEFAULT 'low', likely_value NUMERIC(12,2),
  stale_risk BOOLEAN DEFAULT false, next_action TEXT, assigned_advisor TEXT,
  last_contact_at TIMESTAMPTZ, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own leads" ON public.leads FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, email TEXT, phone TEXT, company TEXT,
  relationship_type TEXT DEFAULT 'client', health_score INTEGER DEFAULT 80,
  status TEXT NOT NULL DEFAULT 'active', lifetime_revenue NUMERIC(12,2) DEFAULT 0,
  last_contact_at TIMESTAMPTZ, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own customers" ON public.customers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  title TEXT NOT NULL, stage TEXT NOT NULL DEFAULT 'lead',
  value NUMERIC(12,2), confidence INTEGER DEFAULT 50,
  blockers TEXT, stale_risk BOOLEAN DEFAULT false,
  quote_status TEXT, next_action TEXT, last_movement_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own opportunities" ON public.opportunities FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON public.opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  title TEXT NOT NULL, line_items JSONB DEFAULT '[]'::jsonb,
  total NUMERIC(12,2), status TEXT NOT NULL DEFAULT 'draft',
  expiry_date DATE, revision_count INTEGER DEFAULT 0, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own quotes" ON public.quotes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL, amount NUMERIC(12,2) NOT NULL,
  due_date DATE NOT NULL, status TEXT NOT NULL DEFAULT 'draft',
  aging_days INTEGER DEFAULT 0, payment_proof TEXT, notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own invoices" ON public.invoices FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'email', subject TEXT, body TEXT,
  status TEXT NOT NULL DEFAULT 'draft', requires_approval BOOLEAN DEFAULT false,
  proof_of_send TEXT, sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.communications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own communications" ON public.communications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_communications_updated_at BEFORE UPDATE ON public.communications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL, value NUMERIC(12,2) DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'lead', probability NUMERIC(5,2) DEFAULT 0,
  customer_id TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own deals" ON public.deals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_deals_user ON public.deals(user_id);

-- ── 20260406004431_6867b789-7e23-471f-ac36-939e85e42295.sql ──
-- ══════════════════════════════════════════════════════════════
-- UAO Wave — Unified Ambient Operating System Tables
-- ══════════════════════════════════════════════════════════════

-- 1. Device Families
CREATE TABLE public.device_families (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  family_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  interaction_type TEXT NOT NULL DEFAULT 'active',
  screen_class TEXT DEFAULT 'standard',
  notification_type TEXT DEFAULT 'push',
  quick_action_support BOOLEAN DEFAULT false,
  trust_level TEXT DEFAULT 'standard',
  sensor_support TEXT[] DEFAULT '{}',
  passive_usage_support BOOLEAN DEFAULT false,
  offline_behavior TEXT DEFAULT 'queue',
  continuity_support BOOLEAN DEFAULT true,
  handoff_support BOOLEAN DEFAULT true,
  launch_stage TEXT DEFAULT 'planned',
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(family_key, user_id)
);

-- 2. Connected Devices
CREATE TABLE public.connected_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_family_id UUID REFERENCES public.device_families(id) ON DELETE SET NULL,
  device_name TEXT NOT NULL,
  device_identifier TEXT,
  platform TEXT,
  os_version TEXT,
  app_version TEXT,
  trust_level TEXT DEFAULT 'standard',
  biometric_capable BOOLEAN DEFAULT false,
  push_token TEXT,
  last_seen_at TIMESTAMPTZ,
  reachable BOOLEAN DEFAULT true,
  health_status TEXT DEFAULT 'unknown',
  notification_eligible BOOLEAN DEFAULT true,
  approval_eligible BOOLEAN DEFAULT false,
  is_primary BOOLEAN DEFAULT false,
  mode TEXT DEFAULT 'real',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Wearable Providers
CREATE TABLE public.wearable_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider_key TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  categories TEXT[] DEFAULT '{}',
  api_type TEXT DEFAULT 'rest',
  auth_method TEXT DEFAULT 'oauth2',
  supported_signals TEXT[] DEFAULT '{}',
  health_data_support BOOLEAN DEFAULT false,
  activity_data_support BOOLEAN DEFAULT false,
  sleep_data_support BOOLEAN DEFAULT false,
  readiness_data_support BOOLEAN DEFAULT false,
  notification_support BOOLEAN DEFAULT false,
  micro_action_support BOOLEAN DEFAULT false,
  requires_native_app BOOLEAN DEFAULT false,
  requires_partner_program BOOLEAN DEFAULT false,
  launch_stage TEXT DEFAULT 'planned',
  active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(provider_key, user_id)
);

-- 4. Wearable Signals
CREATE TABLE public.wearable_signals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wearable_provider_id UUID REFERENCES public.wearable_providers(id) ON DELETE SET NULL,
  connected_device_id UUID REFERENCES public.connected_devices(id) ON DELETE SET NULL,
  signal_type TEXT NOT NULL,
  signal_value NUMERIC,
  signal_unit TEXT,
  signal_quality TEXT DEFAULT 'normal',
  confidence NUMERIC DEFAULT 0.8,
  privacy_tier TEXT DEFAULT 'confidential',
  consented BOOLEAN DEFAULT true,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Readiness States
CREATE TABLE public.readiness_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  readiness_level TEXT DEFAULT 'available',
  availability TEXT DEFAULT 'available',
  energy_estimate TEXT,
  stress_estimate TEXT,
  activity_state TEXT DEFAULT 'idle',
  workout_active BOOLEAN DEFAULT false,
  sleep_state TEXT DEFAULT 'awake',
  focus_mode BOOLEAN DEFAULT false,
  dnd_active BOOLEAN DEFAULT false,
  interruption_tolerance TEXT DEFAULT 'normal',
  derived_from TEXT[] DEFAULT '{}',
  confidence NUMERIC DEFAULT 0.5,
  expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Presence States
CREATE TABLE public.presence_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  active_device_id UUID REFERENCES public.connected_devices(id) ON DELETE SET NULL,
  active_surface TEXT DEFAULT 'web',
  recent_surfaces TEXT[] DEFAULT '{}',
  focus_state TEXT DEFAULT 'normal',
  interruption_tolerance TEXT DEFAULT 'normal',
  motion_state TEXT DEFAULT 'unknown',
  session_id TEXT,
  handoff_eligible BOOLEAN DEFAULT true,
  last_interaction_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Context Continuity Records
CREATE TABLE public.context_continuity_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id TEXT,
  surface TEXT NOT NULL,
  device_id UUID REFERENCES public.connected_devices(id) ON DELETE SET NULL,
  active_task_ids TEXT[] DEFAULT '{}',
  active_workflow_ids TEXT[] DEFAULT '{}',
  open_approval_ids TEXT[] DEFAULT '{}',
  assistant_thread_id TEXT,
  assistant_context JSONB DEFAULT '{}',
  boardroom_context JSONB DEFAULT '{}',
  urgency_stack JSONB DEFAULT '[]',
  recent_entities TEXT[] DEFAULT '{}',
  scroll_position JSONB DEFAULT '{}',
  resumable BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Handoff Sessions
CREATE TABLE public.handoff_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_surface TEXT NOT NULL,
  source_device_id UUID REFERENCES public.connected_devices(id) ON DELETE SET NULL,
  target_surface TEXT NOT NULL,
  target_device_id UUID REFERENCES public.connected_devices(id) ON DELETE SET NULL,
  continuity_record_id UUID REFERENCES public.context_continuity_records(id) ON DELETE SET NULL,
  handoff_status TEXT DEFAULT 'initiated',
  handoff_quality TEXT DEFAULT 'unknown',
  friction_notes TEXT,
  initiated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Ambient Notification Routes
CREATE TABLE public.ambient_notification_routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  route_name TEXT NOT NULL,
  urgency_level TEXT DEFAULT 'normal',
  category TEXT,
  target_surface TEXT NOT NULL,
  target_device_family TEXT,
  condition_rules JSONB DEFAULT '{}',
  presence_requirement TEXT,
  readiness_requirement TEXT,
  quiet_hours_override BOOLEAN DEFAULT false,
  fatigue_aware BOOLEAN DEFAULT true,
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 50,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Notification Fatigue Profiles
CREATE TABLE public.notification_fatigue_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  max_notifications_per_hour INTEGER DEFAULT 10,
  max_watch_notifications_per_hour INTEGER DEFAULT 3,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  quiet_hours_timezone TEXT DEFAULT 'UTC',
  focus_mode_behavior TEXT DEFAULT 'suppress_low',
  workout_behavior TEXT DEFAULT 'urgent_only',
  sleep_behavior TEXT DEFAULT 'silent',
  cooldown_minutes INTEGER DEFAULT 5,
  escalation_only_after_minutes INTEGER DEFAULT 15,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Device Trust Records
CREATE TABLE public.device_trust_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  connected_device_id UUID REFERENCES public.connected_devices(id) ON DELETE CASCADE,
  trust_level TEXT DEFAULT 'standard',
  biometric_verified BOOLEAN DEFAULT false,
  approval_tier TEXT DEFAULT 'low',
  max_approval_amount_cents INTEGER,
  financial_actions_allowed BOOLEAN DEFAULT false,
  high_risk_actions_allowed BOOLEAN DEFAULT false,
  last_trust_verification_at TIMESTAMPTZ,
  trust_downgrade_reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Micro Approval Policies
CREATE TABLE public.micro_approval_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_family_key TEXT NOT NULL,
  approval_class TEXT NOT NULL,
  allowed BOOLEAN DEFAULT false,
  requires_biometric BOOLEAN DEFAULT false,
  max_value_cents INTEGER,
  cooldown_seconds INTEGER DEFAULT 60,
  escalation_target TEXT DEFAULT 'phone',
  receipt_required BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Device Approval Receipts
CREATE TABLE public.device_approval_receipts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  connected_device_id UUID REFERENCES public.connected_devices(id) ON DELETE SET NULL,
  device_family_key TEXT,
  approval_class TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_summary TEXT,
  decision TEXT NOT NULL,
  biometric_used BOOLEAN DEFAULT false,
  trust_level_at_time TEXT,
  value_cents INTEGER,
  receipt_hash TEXT,
  metadata JSONB DEFAULT '{}',
  decided_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Assistant Role Presences
CREATE TABLE public.assistant_role_presences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  role_key TEXT NOT NULL,
  role_name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN DEFAULT true,
  intensity TEXT DEFAULT 'normal',
  proactive_mode BOOLEAN DEFAULT true,
  tone TEXT DEFAULT 'professional',
  escalation_behavior TEXT DEFAULT 'suggest',
  handoff_targets TEXT[] DEFAULT '{}',
  schedule TEXT DEFAULT 'always',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role_key, user_id)
);

-- 15. Proactive Interventions
CREATE TABLE public.proactive_interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  intervention_type TEXT NOT NULL,
  source_role TEXT,
  title TEXT NOT NULL,
  body TEXT,
  urgency TEXT DEFAULT 'low',
  target_surface TEXT,
  consented BOOLEAN DEFAULT true,
  delivered BOOLEAN DEFAULT false,
  delivered_at TIMESTAMPTZ,
  accepted BOOLEAN,
  dismissed BOOLEAN DEFAULT false,
  reversible BOOLEAN DEFAULT true,
  confidence NUMERIC DEFAULT 0.7,
  explanation TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 16. Interruption Policies
CREATE TABLE public.interruption_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  policy_name TEXT NOT NULL,
  time_range_start TIME,
  time_range_end TIME,
  timezone TEXT DEFAULT 'UTC',
  activity_states TEXT[] DEFAULT '{}',
  device_families TEXT[] DEFAULT '{}',
  allowed_urgencies TEXT[] DEFAULT '{critical}',
  suppress_categories TEXT[] DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 50,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 17. Health Signal Consents
CREATE TABLE public.health_signal_consents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  signal_category TEXT NOT NULL,
  wearable_provider_id UUID REFERENCES public.wearable_providers(id) ON DELETE SET NULL,
  consented BOOLEAN DEFAULT false,
  consent_granted_at TIMESTAMPTZ,
  consent_revoked_at TIMESTAMPTZ,
  consent_reason TEXT,
  data_retention_days INTEGER DEFAULT 90,
  share_with_advisors BOOLEAN DEFAULT false,
  share_with_routing BOOLEAN DEFAULT true,
  visibility TEXT DEFAULT 'private',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(signal_category, wearable_provider_id, user_id)
);

-- 18. Health Signal Privacy
CREATE TABLE public.health_signal_privacy (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  signal_category TEXT NOT NULL,
  privacy_tier TEXT DEFAULT 'confidential',
  local_only BOOLEAN DEFAULT false,
  anonymize BOOLEAN DEFAULT false,
  redact_from_exports BOOLEAN DEFAULT true,
  retention_days INTEGER DEFAULT 90,
  visible_in_boardroom BOOLEAN DEFAULT false,
  visible_in_timeline BOOLEAN DEFAULT false,
  visible_to_advisors BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(signal_category, user_id)
);

-- 19. User Device Graph Edges
CREATE TABLE public.user_device_graph_edges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  source_type TEXT NOT NULL,
  source_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  relationship TEXT NOT NULL,
  trust_level TEXT DEFAULT 'standard',
  consent_status TEXT DEFAULT 'active',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 20. Surface Context States
CREATE TABLE public.surface_context_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  surface TEXT NOT NULL,
  device_id UUID REFERENCES public.connected_devices(id) ON DELETE SET NULL,
  current_route TEXT,
  current_view TEXT,
  open_panels TEXT[] DEFAULT '{}',
  scroll_state JSONB DEFAULT '{}',
  active_filters JSONB DEFAULT '{}',
  last_active_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 21. Ambient Launch Readiness
CREATE TABLE public.ambient_launch_readiness (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  target_type TEXT NOT NULL,
  target_key TEXT NOT NULL,
  target_name TEXT NOT NULL,
  launch_label TEXT DEFAULT 'planned',
  supported BOOLEAN DEFAULT false,
  demo_available BOOLEAN DEFAULT false,
  internal_only BOOLEAN DEFAULT false,
  pilot_ready BOOLEAN DEFAULT false,
  launch_ready BOOLEAN DEFAULT false,
  blockers TEXT[] DEFAULT '{}',
  evidence JSONB DEFAULT '{}',
  verified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(target_type, target_key, user_id)
);

-- ══════════════════════════════════════════════════════════════
-- RLS Policies
-- ══════════════════════════════════════════════════════════════

ALTER TABLE public.device_families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connected_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wearable_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wearable_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presence_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.context_continuity_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.handoff_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambient_notification_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_fatigue_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_trust_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_approval_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_approval_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_role_presences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proactive_interventions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interruption_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_signal_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_signal_privacy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_device_graph_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.surface_context_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambient_launch_readiness ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own device_families" ON public.device_families FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own connected_devices" ON public.connected_devices FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own wearable_providers" ON public.wearable_providers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own wearable_signals" ON public.wearable_signals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own readiness_states" ON public.readiness_states FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own presence_states" ON public.presence_states FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own context_continuity_records" ON public.context_continuity_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own handoff_sessions" ON public.handoff_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own ambient_notification_routes" ON public.ambient_notification_routes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own notification_fatigue_profiles" ON public.notification_fatigue_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own device_trust_records" ON public.device_trust_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own micro_approval_policies" ON public.micro_approval_policies FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own device_approval_receipts" ON public.device_approval_receipts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own assistant_role_presences" ON public.assistant_role_presences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own proactive_interventions" ON public.proactive_interventions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own interruption_policies" ON public.interruption_policies FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own health_signal_consents" ON public.health_signal_consents FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own health_signal_privacy" ON public.health_signal_privacy FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own user_device_graph_edges" ON public.user_device_graph_edges FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own surface_context_states" ON public.surface_context_states FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own ambient_launch_readiness" ON public.ambient_launch_readiness FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ══════════════════════════════════════════════════════════════
-- Updated_at Triggers
-- ══════════════════════════════════════════════════════════════

CREATE TRIGGER update_device_families_updated_at BEFORE UPDATE ON public.device_families FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_connected_devices_updated_at BEFORE UPDATE ON public.connected_devices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wearable_providers_updated_at BEFORE UPDATE ON public.wearable_providers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_readiness_states_updated_at BEFORE UPDATE ON public.readiness_states FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_presence_states_updated_at BEFORE UPDATE ON public.presence_states FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_context_continuity_records_updated_at BEFORE UPDATE ON public.context_continuity_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ambient_notification_routes_updated_at BEFORE UPDATE ON public.ambient_notification_routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notification_fatigue_profiles_updated_at BEFORE UPDATE ON public.notification_fatigue_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_device_trust_records_updated_at BEFORE UPDATE ON public.device_trust_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_assistant_role_presences_updated_at BEFORE UPDATE ON public.assistant_role_presences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_interruption_policies_updated_at BEFORE UPDATE ON public.interruption_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_health_signal_consents_updated_at BEFORE UPDATE ON public.health_signal_consents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_health_signal_privacy_updated_at BEFORE UPDATE ON public.health_signal_privacy FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_device_graph_edges_updated_at BEFORE UPDATE ON public.user_device_graph_edges FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_surface_context_states_updated_at BEFORE UPDATE ON public.surface_context_states FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ambient_launch_readiness_updated_at BEFORE UPDATE ON public.ambient_launch_readiness FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 20260406115635_616b1767-d00b-4299-9135-ad9c3812809b.sql ──
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb;

-- ── 20260406180623_24a8102b-b541-4900-ade0-d8e933ba5b45.sql ──
-- Create platform enum
CREATE TYPE public.push_platform AS ENUM ('web', 'ios', 'android', 'electron');

-- Device push tokens table
CREATE TABLE public.device_push_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform push_platform NOT NULL,
  token TEXT NOT NULL,
  endpoint TEXT,
  auth_key TEXT,
  p256dh TEXT,
  device_name TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

-- Index for fast lookup by user
CREATE INDEX idx_device_push_tokens_user_active ON public.device_push_tokens(user_id) WHERE active = true;

-- Enable RLS
ALTER TABLE public.device_push_tokens ENABLE ROW LEVEL SECURITY;

-- RLS policies: users manage own tokens only
CREATE POLICY "Users can view own push tokens"
  ON public.device_push_tokens FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own push tokens"
  ON public.device_push_tokens FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own push tokens"
  ON public.device_push_tokens FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own push tokens"
  ON public.device_push_tokens FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_device_push_tokens_updated_at
  BEFORE UPDATE ON public.device_push_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Dispatch function: calls push-dispatch edge function via pg_net
CREATE OR REPLACE FUNCTION public.dispatch_push_notification()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO 'public'
AS $$
DECLARE
  v_supabase_url TEXT;
  v_service_key TEXT;
BEGIN
  -- Only dispatch for push channel notifications
  IF NEW.channel != 'push' THEN
    RETURN NEW;
  END IF;

  -- Get Supabase URL and service key from vault or env
  v_supabase_url := current_setting('app.settings.supabase_url', true);
  v_service_key := current_setting('app.settings.service_role_key', true);

  -- If pg_net is available, call the edge function
  IF v_supabase_url IS NOT NULL AND v_service_key IS NOT NULL THEN
    PERFORM net.http_post(
      url := v_supabase_url || '/functions/v1/push-dispatch',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || v_service_key
      ),
      body := jsonb_build_object(
        'notification_id', NEW.id,
        'user_id', NEW.user_id,
        'title', NEW.title,
        'body', NEW.body,
        'urgency', NEW.urgency,
        'action_url', NEW.action_url,
        'category', NEW.category
      )
    );
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't block notification insert if push dispatch fails
  RETURN NEW;
END;
$$;

-- Trigger on notifications_queue for push dispatch
CREATE TRIGGER trg_dispatch_push_notification
  AFTER INSERT ON public.notifications_queue
  FOR EACH ROW
  EXECUTE FUNCTION public.dispatch_push_notification();

-- Audit trigger for security
CREATE TRIGGER audit_device_push_tokens_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.device_push_tokens
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_change();

-- ── 20260409201903_b947cd8a-79a7-43a9-8ee4-63adc9fe0aed.sql ──
-- Add data quality metadata columns to user_memory
ALTER TABLE public.user_memory
ADD COLUMN IF NOT EXISTS confirmed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sensitivity text DEFAULT 'low' CHECK (sensitivity IN ('low', 'medium', 'high'));

-- ── 20260410222340_e83ca736-c75d-49c9-9aa5-3f788369a5e4.sql ──
-- ══════════════════════════════════════════════════════════════
-- Gap 1: Create oauth_state_sessions table
-- ══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.oauth_state_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider_family_id uuid REFERENCES public.provider_families(id),
  provider_capability_id uuid REFERENCES public.provider_capabilities(id),
  oauth_client_registry_id uuid REFERENCES public.oauth_client_registry(id),
  state_token text UNIQUE NOT NULL,
  code_verifier text,
  redirect_uri text,
  requested_scopes jsonb NOT NULL DEFAULT '[]'::jsonb,
  flow_type text NOT NULL DEFAULT 'connector_grant',
  status text NOT NULL DEFAULT 'initiated',
  initiated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.oauth_state_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own oauth state sessions"
  ON public.oauth_state_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_oauth_state_sessions_user ON public.oauth_state_sessions(user_id);
CREATE INDEX idx_oauth_state_sessions_state ON public.oauth_state_sessions(state_token);
CREATE INDEX idx_oauth_state_sessions_status ON public.oauth_state_sessions(status);
CREATE INDEX idx_oauth_state_sessions_expires ON public.oauth_state_sessions(expires_at);

-- ══════════════════════════════════════════════════════════════
-- Gap 2: Add missing columns to connector_oauth_tokens
-- ══════════════════════════════════════════════════════════════
ALTER TABLE public.connector_oauth_tokens
  ADD COLUMN IF NOT EXISTS oauth_client_registry_id uuid REFERENCES public.oauth_client_registry(id),
  ADD COLUMN IF NOT EXISTS scope_string text,
  ADD COLUMN IF NOT EXISTS refresh_failed_at timestamptz,
  ADD COLUMN IF NOT EXISTS refresh_failure_reason text,
  ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'real';

-- ══════════════════════════════════════════════════════════════
-- Gap 3: Add performance indexes
-- ══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_csl_user ON public.connected_service_links(user_id);
CREATE INDEX IF NOT EXISTS idx_csl_provider_family ON public.connected_service_links(provider_family_id);
CREATE INDEX IF NOT EXISTS idx_csl_capability ON public.connected_service_links(provider_capability_id);
CREATE INDEX IF NOT EXISTS idx_csl_status ON public.connected_service_links(connection_status);
CREATE INDEX IF NOT EXISTS idx_ipl_user ON public.identity_provider_links(user_id);
CREATE INDEX IF NOT EXISTS idx_ipl_provider_family ON public.identity_provider_links(provider_family_id);
CREATE INDEX IF NOT EXISTS idx_cl_user ON public.consent_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_cl_capability ON public.consent_ledger(provider_capability_id);
CREATE INDEX IF NOT EXISTS idx_cl_type ON public.consent_ledger(consent_type);
CREATE INDEX IF NOT EXISTS idx_cot_account ON public.connector_oauth_tokens(account_id);
CREATE INDEX IF NOT EXISTS idx_cot_expires ON public.connector_oauth_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_cot_reauth ON public.connector_oauth_tokens(reauth_required);
CREATE INDEX IF NOT EXISTS idx_chr_account ON public.connector_health_records(account_id);
CREATE INDEX IF NOT EXISTS idx_chr_status ON public.connector_health_records(health_status);

-- ── 20260413013837_bf1ccc85-0102-4ba1-9c2f-af9493e90ad3.sql ──
-- ═══════════════════════════════════════════════════════════════
-- PROFILES TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════
-- NOTIFICATIONS TABLE
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  urgency TEXT NOT NULL DEFAULT 'low',
  domain TEXT DEFAULT 'general',
  action_url TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- ═══════════════════════════════════════════════════════════════
-- USER-FILES STORAGE BUCKET
-- ═══════════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
  VALUES ('user-files', 'user-files', false);

CREATE POLICY "Users can view their own files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ── 20260413114643_e7dc91d1-efae-47c7-893c-992cf88d6ac5.sql ──
-- Create trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_metadata->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_metadata->>'avatar_url'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if any, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add unique constraint on user_id if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
    AND contype = 'u'
    AND conname = 'profiles_user_id_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- ── 20260414223054_5d0f5d86-ce67-4db0-bc2f-e4675f7c6570.sql ──
-- ═══════════════════════════════════════════════════════════════
-- SITA OS — Onboarding + Update System Tables
-- ═══════════════════════════════════════════════════════════════

-- Onboarding Sessions
CREATE TABLE public.onboarding_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  device_id TEXT NOT NULL,
  boot_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  state TEXT NOT NULL DEFAULT 'not_started',
  current_step TEXT NOT NULL DEFAULT 'welcome',
  version TEXT NOT NULL DEFAULT '1.0.0',
  interrupted BOOLEAN NOT NULL DEFAULT false,
  resume_token TEXT,
  managed_enrollment_mode BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Onboarding Steps
CREATE TABLE public.onboarding_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.onboarding_sessions(id) ON DELETE CASCADE NOT NULL,
  step_name TEXT NOT NULL,
  required BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  entered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  skipped_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  validation_error_code TEXT,
  validation_error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Onboarding Choices
CREATE TABLE public.onboarding_choices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.onboarding_sessions(id) ON DELETE CASCADE NOT NULL,
  key TEXT NOT NULL,
  value JSONB,
  source TEXT NOT NULL DEFAULT 'user',
  applied BOOLEAN NOT NULL DEFAULT false,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Onboarding Hardware Detection
CREATE TABLE public.onboarding_hardware_detection (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.onboarding_sessions(id) ON DELETE CASCADE NOT NULL,
  hardware_model TEXT,
  battery_present BOOLEAN DEFAULT false,
  biometric_present BOOLEAN DEFAULT false,
  tpm_present BOOLEAN DEFAULT false,
  wifi_present BOOLEAN DEFAULT false,
  ethernet_present BOOLEAN DEFAULT false,
  bluetooth_present BOOLEAN DEFAULT false,
  display_resolution TEXT,
  storage_bytes BIGINT,
  memory_bytes BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Onboarding Restore Sources
CREATE TABLE public.onboarding_restore_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.onboarding_sessions(id) ON DELETE CASCADE NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'cloud',
  selected BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'available',
  metadata_ref TEXT,
  validation_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Onboarding Completion Markers
CREATE TABLE public.onboarding_completion_markers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.onboarding_sessions(id) ON DELETE CASCADE NOT NULL,
  marker_name TEXT NOT NULL,
  satisfied BOOLEAN NOT NULL DEFAULT false,
  satisfied_at TIMESTAMPTZ,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update Channels
CREATE TABLE public.update_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL DEFAULT 'stable',
  enabled BOOLEAN NOT NULL DEFAULT true,
  user_selectable BOOLEAN NOT NULL DEFAULT true,
  policy_allowed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update Catalog
CREATE TABLE public.update_catalog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL,
  build_id TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'stable',
  update_type TEXT NOT NULL DEFAULT 'full',
  package_format TEXT DEFAULT 'image',
  metadata_hash TEXT,
  signature_ref TEXT,
  payload_size BIGINT DEFAULT 0,
  delta_from_version TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  critical BOOLEAN NOT NULL DEFAULT false,
  min_supported_version TEXT,
  rollout_percentage INTEGER DEFAULT 100,
  release_notes TEXT,
  components JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update Preflight Results
CREATE TABLE public.update_preflight_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  update_id UUID REFERENCES public.update_catalog(id),
  battery_percent INTEGER,
  charger_connected BOOLEAN DEFAULT false,
  free_storage_bytes BIGINT,
  network_type TEXT,
  policy_allowed BOOLEAN DEFAULT true,
  channel_allowed BOOLEAN DEFAULT true,
  slot_available BOOLEAN DEFAULT true,
  passed BOOLEAN NOT NULL DEFAULT false,
  reason_code TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update Staging
CREATE TABLE public.update_staging (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  update_id UUID REFERENCES public.update_catalog(id),
  target_slot TEXT NOT NULL DEFAULT 'B',
  snapshot_id TEXT,
  state TEXT NOT NULL DEFAULT 'pending',
  integrity_verified BOOLEAN DEFAULT false,
  staged_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update Boot Attempts
CREATE TABLE public.update_boot_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  update_id UUID REFERENCES public.update_catalog(id),
  target_slot TEXT NOT NULL,
  reboot_requested_at TIMESTAMPTZ,
  booted_at TIMESTAMPTZ,
  startup_validation_ok BOOLEAN,
  health_validation_ok BOOLEAN,
  rollback_triggered BOOLEAN DEFAULT false,
  rollback_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Update History
CREATE TABLE public.update_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  update_id UUID REFERENCES public.update_catalog(id),
  from_version TEXT,
  to_version TEXT NOT NULL,
  action TEXT NOT NULL DEFAULT 'installed',
  actor TEXT NOT NULL DEFAULT 'system',
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rollback Events
CREATE TABLE public.rollback_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  update_id UUID REFERENCES public.update_catalog(id),
  source_slot TEXT NOT NULL,
  rollback_to_slot TEXT NOT NULL,
  trigger_type TEXT NOT NULL DEFAULT 'auto',
  reason_code TEXT,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Health Validation Results
CREATE TABLE public.health_validation_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  update_id UUID REFERENCES public.update_catalog(id),
  component TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  details TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System Slots (A/B partition tracking)
CREATE TABLE public.system_slots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  slot_id TEXT NOT NULL,
  version TEXT NOT NULL,
  build_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'inactive',
  boot_count INTEGER DEFAULT 0,
  health_status TEXT DEFAULT 'unknown',
  integrity_verified BOOLEAN DEFAULT false,
  last_boot_at TIMESTAMPTZ,
  installed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.onboarding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_hardware_detection ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_restore_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_completion_markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_preflight_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_staging ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_boot_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rollback_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_validation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_slots ENABLE ROW LEVEL SECURITY;

-- Users can manage their own data
CREATE POLICY "Users manage own onboarding sessions" ON public.onboarding_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own onboarding steps" ON public.onboarding_steps FOR ALL USING (session_id IN (SELECT id FROM public.onboarding_sessions WHERE user_id = auth.uid()));
CREATE POLICY "Users manage own onboarding choices" ON public.onboarding_choices FOR ALL USING (session_id IN (SELECT id FROM public.onboarding_sessions WHERE user_id = auth.uid()));
CREATE POLICY "Users manage own hw detection" ON public.onboarding_hardware_detection FOR ALL USING (session_id IN (SELECT id FROM public.onboarding_sessions WHERE user_id = auth.uid()));
CREATE POLICY "Users manage own restore sources" ON public.onboarding_restore_sources FOR ALL USING (session_id IN (SELECT id FROM public.onboarding_sessions WHERE user_id = auth.uid()));
CREATE POLICY "Users manage own completion markers" ON public.onboarding_completion_markers FOR ALL USING (session_id IN (SELECT id FROM public.onboarding_sessions WHERE user_id = auth.uid()));
CREATE POLICY "Users manage own update channels" ON public.update_channels FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read update catalog" ON public.update_catalog FOR SELECT USING (true);
CREATE POLICY "Users manage own preflight results" ON public.update_preflight_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own update staging" ON public.update_staging FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own boot attempts" ON public.update_boot_attempts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own update history" ON public.update_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own rollback events" ON public.rollback_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own health validation" ON public.health_validation_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own system slots" ON public.system_slots FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_onboarding_sessions_user ON public.onboarding_sessions(user_id);
CREATE INDEX idx_onboarding_steps_session ON public.onboarding_steps(session_id);
CREATE INDEX idx_onboarding_choices_session ON public.onboarding_choices(session_id);
CREATE INDEX idx_update_catalog_channel ON public.update_catalog(channel);
CREATE INDEX idx_update_history_user ON public.update_history(user_id);
CREATE INDEX idx_rollback_events_user ON public.rollback_events(user_id);
CREATE INDEX idx_system_slots_user ON public.system_slots(user_id);

-- ── 20260415011212_40063655-06a1-4383-b6e9-c072ec8c3e0d.sql ──
-- 0. Role system foundation
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 1. Cloud Devices
CREATE TABLE public.cloud_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_name TEXT NOT NULL DEFAULT 'Unknown Device',
  platform TEXT NOT NULL DEFAULT 'web',
  client_version TEXT DEFAULT '1.0.0',
  trust_state TEXT NOT NULL DEFAULT 'trusted',
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  is_current BOOLEAN DEFAULT false,
  requires_reauth BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own devices" ON public.cloud_devices FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users manage own devices" ON public.cloud_devices FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins view all devices" ON public.cloud_devices FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_cloud_devices_user ON public.cloud_devices(user_id);

-- 2. Cloud Storage Usage
CREATE TABLE public.cloud_storage_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  used_bytes BIGINT NOT NULL DEFAULT 0,
  quota_bytes BIGINT NOT NULL DEFAULT 5368709120,
  file_count INT NOT NULL DEFAULT 0,
  largest_file_bytes BIGINT DEFAULT 0,
  orphaned_blobs INT DEFAULT 0,
  failed_uploads INT DEFAULT 0,
  failed_downloads INT DEFAULT 0,
  last_reconciled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_storage_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own storage" ON public.cloud_storage_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins view all storage" ON public.cloud_storage_usage FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 3. Cloud Sync Jobs
CREATE TABLE public.cloud_sync_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_type TEXT NOT NULL DEFAULT 'reindex',
  target_user_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  progress_pct INT DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  result_summary TEXT,
  error_message TEXT,
  triggered_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_sync_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage sync jobs" ON public.cloud_sync_jobs FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 4. Cloud Plans
CREATE TABLE public.cloud_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  storage_limit_bytes BIGINT NOT NULL DEFAULT 5368709120,
  max_devices INT NOT NULL DEFAULT 3,
  max_file_size_bytes BIGINT NOT NULL DEFAULT 104857600,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  price_cents INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone views plans" ON public.cloud_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage plans" ON public.cloud_plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 5. Cloud User Plans
CREATE TABLE public.cloud_user_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  plan_id UUID REFERENCES public.cloud_plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  bonus_storage_bytes BIGINT DEFAULT 0,
  overage_allowed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_user_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own plan" ON public.cloud_user_plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins manage user plans" ON public.cloud_user_plans FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 6. Cloud Audit Events
CREATE TABLE public.cloud_audit_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  severity TEXT NOT NULL DEFAULT 'info',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins view audit" ON public.cloud_audit_events FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert audit" ON public.cloud_audit_events FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_cloud_audit_created ON public.cloud_audit_events(created_at DESC);

-- 7. Cloud Feature Flags
CREATE TABLE public.cloud_feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flag_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  scope TEXT NOT NULL DEFAULT 'global',
  conditions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage flags" ON public.cloud_feature_flags FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8. Cloud Policies
CREATE TABLE public.cloud_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  value_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  enforced BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cloud_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone reads policies" ON public.cloud_policies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage policies" ON public.cloud_policies FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Triggers
CREATE TRIGGER update_cloud_devices_ts BEFORE UPDATE ON public.cloud_devices FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_storage_ts BEFORE UPDATE ON public.cloud_storage_usage FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_sync_jobs_ts BEFORE UPDATE ON public.cloud_sync_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_plans_ts BEFORE UPDATE ON public.cloud_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_user_plans_ts BEFORE UPDATE ON public.cloud_user_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_flags_ts BEFORE UPDATE ON public.cloud_feature_flags FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cloud_policies_ts BEFORE UPDATE ON public.cloud_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed plans
INSERT INTO public.cloud_plans (plan_key, display_name, storage_limit_bytes, max_devices, max_file_size_bytes, price_cents, features) VALUES
  ('free', 'Free', 5368709120, 3, 104857600, 0, '["5GB storage","3 devices","100MB file limit"]'::jsonb),
  ('pro', 'Pro', 107374182400, 10, 1073741824, 999, '["100GB storage","10 devices","1GB file limit","Priority sync","Version history"]'::jsonb),
  ('enterprise', 'Enterprise', 1099511627776, 50, 5368709120, 4999, '["1TB storage","50 devices","5GB file limit","Priority sync","Version history","Admin tools","SSO"]'::jsonb);

-- ── 20260415085433_2079038d-93d8-40ec-901d-9eb5db8c0990.sql ──
-- ══════════════════════════════════════════════════════════════
-- SITA OS — Intelligent Differentiation Layer: Batch 1
-- 3 new tables: device_mesh_peers, context_graph_snapshots, action_safety_classifications
-- ══════════════════════════════════════════════════════════════

-- 1. Device Mesh Peers
CREATE TABLE public.device_mesh_peers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL DEFAULT 'desktop',
  role TEXT NOT NULL DEFAULT 'anchor',
  capabilities TEXT[] NOT NULL DEFAULT '{}',
  trust_score NUMERIC NOT NULL DEFAULT 0.5,
  proximity_status TEXT NOT NULL DEFAULT 'remote',
  last_handshake TIMESTAMPTZ,
  mesh_group TEXT DEFAULT 'default',
  is_online BOOLEAN NOT NULL DEFAULT false,
  platform TEXT DEFAULT 'web',
  os_version TEXT,
  battery_level NUMERIC,
  network_type TEXT DEFAULT 'unknown',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.device_mesh_peers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own mesh peers" ON public.device_mesh_peers
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_device_mesh_peers_updated_at
  BEFORE UPDATE ON public.device_mesh_peers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_device_mesh_peers_user ON public.device_mesh_peers(user_id);
CREATE INDEX idx_device_mesh_peers_online ON public.device_mesh_peers(user_id, is_online);

-- 2. Context Graph Snapshots
CREATE TABLE public.context_graph_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  snapshot_type TEXT NOT NULL DEFAULT 'periodic',
  context_data JSONB NOT NULL DEFAULT '{}',
  active_signals TEXT[] NOT NULL DEFAULT '{}',
  freshness_score NUMERIC NOT NULL DEFAULT 1.0,
  workspace_id TEXT,
  device_id TEXT,
  cognitive_load NUMERIC DEFAULT 0,
  active_mode TEXT DEFAULT 'default',
  signal_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.context_graph_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own context snapshots" ON public.context_graph_snapshots
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_context_graph_snapshots_updated_at
  BEFORE UPDATE ON public.context_graph_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_context_graph_user ON public.context_graph_snapshots(user_id);
CREATE INDEX idx_context_graph_type ON public.context_graph_snapshots(user_id, snapshot_type);

-- 3. Action Safety Classifications
CREATE TABLE public.action_safety_classifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action_key TEXT NOT NULL,
  safety_class TEXT NOT NULL DEFAULT 'passive',
  trust_threshold NUMERIC NOT NULL DEFAULT 0.5,
  requires_confirmation BOOLEAN NOT NULL DEFAULT false,
  requires_audit BOOLEAN NOT NULL DEFAULT true,
  confirmation_prompt TEXT,
  rollback_capable BOOLEAN NOT NULL DEFAULT false,
  max_autonomy_level INTEGER NOT NULL DEFAULT 3,
  policy_overrides JSONB DEFAULT '{}',
  description TEXT,
  domain TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, action_key)
);

ALTER TABLE public.action_safety_classifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own safety classifications" ON public.action_safety_classifications
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_action_safety_updated_at
  BEFORE UPDATE ON public.action_safety_classifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_action_safety_user ON public.action_safety_classifications(user_id);
CREATE INDEX idx_action_safety_class ON public.action_safety_classifications(user_id, safety_class);
