
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
