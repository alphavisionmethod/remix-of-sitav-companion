
-- ── Phase 24.A — Domain ownership rows ──
INSERT INTO public.domain_ownership_registry (domain_key, display_name, owning_service, plane, team, description, dependencies, api_surface, status)
VALUES
  ('business-os', 'Business OS', 'business-os-service', 'product', 'business-team',
    'Revenue engine: CRM, invoices, deals, communications.',
    '["platform-core","ai-gateway","connector-fabric"]'::jsonb,
    '{"public":["business-board-api"],"internal":["business-os-service"]}'::jsonb,
    'active'),
  ('finance-os', 'Finance OS', 'finance-os-service', 'product', 'finance-team',
    'Money management: transactions, bills, budgets, reserves, capital allocation.',
    '["platform-core","connector-fabric"]'::jsonb,
    '{"public":[],"internal":["finance-os-service"]}'::jsonb,
    'active'),
  ('concierge-os', 'Concierge OS', 'concierge-os-service', 'product', 'concierge-team',
    'Life management: errands, travel, household, family coordination.',
    '["platform-core","ai-gateway"]'::jsonb,
    '{"public":[],"internal":["concierge-os-service"]}'::jsonb,
    'active'),
  ('investment-office', 'Investment Office', 'investment-office-service', 'product', 'investment-team',
    'Capital management: portfolios, holdings, theses, trades, behavioural firewall.',
    '["finance-os-service","platform-core","ai-gateway"]'::jsonb,
    '{"public":[],"internal":["investment-office-service"]}'::jsonb,
    'active'),
  ('boardroom', 'Boardroom', 'boardroom-service', 'control', 'boardroom-team',
    'Strategic decision chamber: sessions, items, recommendations, decisions, replay.',
    '["platform-core","ai-gateway","business-os-service","finance-os-service"]'::jsonb,
    '{"public":["boardroom-session","boardroom-replay"],"internal":["boardroom-service"]}'::jsonb,
    'active')
ON CONFLICT (domain_key) DO UPDATE SET
  display_name   = EXCLUDED.display_name,
  owning_service = EXCLUDED.owning_service,
  plane          = EXCLUDED.plane,
  team           = EXCLUDED.team,
  description    = EXCLUDED.description,
  dependencies   = EXCLUDED.dependencies,
  api_surface    = EXCLUDED.api_surface,
  status         = EXCLUDED.status,
  updated_at     = now();

-- ── Phase 24.B — Helper to make table creation concise ──
-- We inline the same shape per table: id, user_id, org_id, status, name/title, payload, timestamps + RLS
-- Reusable trigger function already exists: public.update_updated_at_column

-- ── Business OS tables ──
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  display_name text NOT NULL,
  primary_email text,
  primary_phone text,
  status text NOT NULL DEFAULT 'active',
  health_score integer,
  tags text[] DEFAULT ARRAY[]::text[],
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  customer_id uuid,
  title text NOT NULL,
  value_cents bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  stage text NOT NULL DEFAULT 'discovery',
  status text NOT NULL DEFAULT 'discovery',
  probability numeric NOT NULL DEFAULT 0,
  expected_close_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  customer_id uuid,
  invoice_number text,
  amount_cents bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'draft',
  issued_at timestamptz,
  due_at timestamptz,
  paid_at timestamptz,
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  customer_id uuid,
  title text NOT NULL,
  amount_cents bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'draft',
  expires_at timestamptz,
  line_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  customer_id uuid,
  title text NOT NULL,
  scope text,
  status text NOT NULL DEFAULT 'draft',
  sent_at timestamptz,
  decided_at timestamptz,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  customer_id uuid,
  display_name text NOT NULL,
  email text,
  phone text,
  role text,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  display_name text NOT NULL,
  industry text,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  customer_id uuid,
  title text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  location text,
  status text NOT NULL DEFAULT 'scheduled',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  customer_id uuid,
  deal_id uuid,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'created',
  scheduled_for timestamptz,
  completed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.communications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  customer_id uuid,
  channel text NOT NULL DEFAULT 'email',
  direction text NOT NULL DEFAULT 'outbound',
  subject text,
  body text,
  status text NOT NULL DEFAULT 'draft',
  scheduled_for timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── Finance OS tables ──
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  account_label text,
  amount_cents bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  direction text NOT NULL DEFAULT 'debit',
  category text,
  description text,
  status text NOT NULL DEFAULT 'pending',
  occurred_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  vendor text NOT NULL,
  amount_cents bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  due_at timestamptz,
  paid_at timestamptz,
  status text NOT NULL DEFAULT 'upcoming',
  recurrence text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  category text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  allocated_cents bigint NOT NULL DEFAULT 0,
  spent_cents bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.envelopes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  name text NOT NULL,
  balance_cents bigint NOT NULL DEFAULT 0,
  target_cents bigint,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sinking_funds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  name text NOT NULL,
  target_cents bigint NOT NULL DEFAULT 0,
  current_cents bigint NOT NULL DEFAULT 0,
  contribute_per_period_cents bigint,
  target_date date,
  status text NOT NULL DEFAULT 'accumulating',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  vendor text NOT NULL,
  amount_cents bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  cadence text NOT NULL DEFAULT 'monthly',
  next_charge_at timestamptz,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  name text NOT NULL,
  asset_class text,
  current_value_cents bigint NOT NULL DEFAULT 0,
  acquired_at timestamptz,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  name text NOT NULL,
  base_currency text NOT NULL DEFAULT 'USD',
  total_value_cents bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.receivables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  customer_id uuid,
  amount_cents bigint NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  due_at timestamptz,
  collected_at timestamptz,
  status text NOT NULL DEFAULT 'outstanding',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.debt_obligations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  lender text NOT NULL,
  principal_cents bigint NOT NULL DEFAULT 0,
  balance_cents bigint NOT NULL DEFAULT 0,
  apr numeric,
  next_payment_at timestamptz,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.capital_buckets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  name text NOT NULL,
  purpose text,
  balance_cents bigint NOT NULL DEFAULT 0,
  target_cents bigint,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.investment_theses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  title text NOT NULL,
  summary text,
  conviction integer NOT NULL DEFAULT 0,
  horizon text,
  status text NOT NULL DEFAULT 'draft',
  validated_at timestamptz,
  invalidated_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  name text NOT NULL,
  scenario_type text,
  inputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  outputs jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reserves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  name text NOT NULL,
  reserve_type text,
  balance_cents bigint NOT NULL DEFAULT 0,
  target_cents bigint,
  status text NOT NULL DEFAULT 'healthy',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── Investment Office tables ──
CREATE TABLE IF NOT EXISTS public.holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  portfolio_id uuid,
  symbol text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  avg_cost_cents bigint NOT NULL DEFAULT 0,
  current_value_cents bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  portfolio_id uuid,
  symbol text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  side text NOT NULL DEFAULT 'long',
  entry_price_cents bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open',
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  portfolio_id uuid,
  symbol text NOT NULL,
  side text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  price_cents bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  executed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.instruments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  symbol text NOT NULL,
  display_name text,
  asset_class text,
  exchange text,
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.theses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  portfolio_id uuid,
  symbol text,
  title text NOT NULL,
  summary text,
  conviction integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.watchlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  org_id uuid,
  name text NOT NULL,
  symbols text[] NOT NULL DEFAULT ARRAY[]::text[],
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- ── Enable RLS + policies + updated_at trigger for every new table ──
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'customers','deals','invoices','quotes','proposals','contacts','accounts','bookings','service_orders','communications',
    'transactions','bills','budgets','envelopes','sinking_funds','subscriptions','assets','portfolios','receivables','debt_obligations','capital_buckets','investment_theses','scenarios','reserves',
    'holdings','positions','trades','instruments','theses','watchlists'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

    -- Drop pre-existing policies if they were created previously to avoid duplicates.
    EXECUTE format('DROP POLICY IF EXISTS "%s_select" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_insert" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_update" ON public.%I', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "%s_delete" ON public.%I', t, t);

    EXECUTE format($p$CREATE POLICY "%s_select" ON public.%I FOR SELECT USING (auth.uid() = user_id OR (org_id IS NOT NULL AND public.is_org_member(auth.uid(), org_id)))$p$, t, t);
    EXECUTE format($p$CREATE POLICY "%s_insert" ON public.%I FOR INSERT WITH CHECK (auth.uid() = user_id)$p$, t, t);
    EXECUTE format($p$CREATE POLICY "%s_update" ON public.%I FOR UPDATE USING (auth.uid() = user_id OR (org_id IS NOT NULL AND public.is_org_member(auth.uid(), org_id)))$p$, t, t);
    EXECUTE format($p$CREATE POLICY "%s_delete" ON public.%I FOR DELETE USING (auth.uid() = user_id OR (org_id IS NOT NULL AND public.is_org_owner(auth.uid(), org_id)))$p$, t, t);

    -- updated_at trigger
    EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at_%s ON public.%I', t, t);
    EXECUTE format('CREATE TRIGGER set_updated_at_%s BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t, t);

    -- helpful user_id index
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_user_id ON public.%I (user_id)', t, t);
  END LOOP;
END $$;
