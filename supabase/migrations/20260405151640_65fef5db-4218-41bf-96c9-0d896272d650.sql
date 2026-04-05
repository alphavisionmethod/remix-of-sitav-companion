
-- Investment Office Profile
CREATE TABLE public.investment_office_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  enabled boolean DEFAULT true,
  experience_level text NOT NULL DEFAULT 'beginner',
  office_mode text NOT NULL DEFAULT 'quiet_monitoring',
  default_view text DEFAULT 'boardroom',
  currency_base text DEFAULT 'USD',
  region text DEFAULT 'US',
  restricted_features text[] DEFAULT '{}',
  advisor_mode_preference text DEFAULT 'balanced',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.investment_office_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own io profile" ON public.investment_office_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_io_profiles_updated_at BEFORE UPDATE ON public.investment_office_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Connected Investment Platforms
CREATE TABLE public.connected_investment_platforms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform_type text NOT NULL DEFAULT 'brokerage',
  provider_name text NOT NULL,
  provider_key text,
  auth_status text NOT NULL DEFAULT 'disconnected',
  sync_status text NOT NULL DEFAULT 'never',
  last_sync_at timestamptz,
  supported_asset_classes text[] DEFAULT '{}',
  read_permissions text[] DEFAULT '{}',
  trade_permissions text[] DEFAULT '{}',
  region_restrictions text[] DEFAULT '{}',
  account_ids text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.connected_investment_platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own platforms" ON public.connected_investment_platforms FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_cip_updated_at BEFORE UPDATE ON public.connected_investment_platforms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Investment Accounts
CREATE TABLE public.investment_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid REFERENCES public.connected_investment_platforms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  account_label text NOT NULL,
  account_type text NOT NULL DEFAULT 'brokerage',
  base_currency text DEFAULT 'USD',
  available_cash numeric DEFAULT 0,
  total_value numeric DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  sync_health text DEFAULT 'healthy',
  risk_flags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.investment_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own accounts" ON public.investment_accounts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ia_updated_at BEFORE UPDATE ON public.investment_accounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Asset Master
CREATE TABLE public.asset_master (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  display_name text NOT NULL,
  asset_class text NOT NULL DEFAULT 'stock',
  subtype text,
  exchange_or_venue text,
  region text,
  metadata jsonb DEFAULT '{}',
  availability_by_platform jsonb DEFAULT '[]',
  tags text[] DEFAULT '{}',
  theme_ids text[] DEFAULT '{}',
  sector_ids text[] DEFAULT '{}',
  risk_tags text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.asset_master ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read assets" ON public.asset_master FOR SELECT TO authenticated USING (true);
CREATE TRIGGER update_am_updated_at BEFORE UPDATE ON public.asset_master FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Asset Market Snapshots
CREATE TABLE public.asset_market_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES public.asset_master(id) ON DELETE CASCADE,
  as_of timestamptz NOT NULL DEFAULT now(),
  price numeric,
  daily_change numeric,
  weekly_change numeric,
  monthly_change numeric,
  volatility_estimate numeric,
  liquidity_estimate numeric,
  market_state text DEFAULT 'open',
  confidence numeric DEFAULT 0.8,
  source text,
  stale boolean DEFAULT false,
  metadata jsonb DEFAULT '{}'
);
ALTER TABLE public.asset_market_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read snapshots" ON public.asset_market_snapshots FOR SELECT TO authenticated USING (true);

-- Portfolio Positions
CREATE TABLE public.portfolio_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  account_id uuid REFERENCES public.investment_accounts(id) ON DELETE SET NULL,
  asset_id uuid REFERENCES public.asset_master(id) ON DELETE SET NULL,
  quantity numeric DEFAULT 0,
  average_cost numeric DEFAULT 0,
  market_value numeric DEFAULT 0,
  unrealized_pnl numeric DEFAULT 0,
  realized_pnl numeric DEFAULT 0,
  allocation_pct numeric DEFAULT 0,
  purpose_bucket_id uuid,
  thesis_id uuid,
  conviction_tag text,
  risk_tags text[] DEFAULT '{}',
  opened_at timestamptz DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.portfolio_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own positions" ON public.portfolio_positions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_pp_updated_at BEFORE UPDATE ON public.portfolio_positions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Capital Purpose Buckets
CREATE TABLE public.capital_purpose_buckets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL,
  target_allocation_pct numeric DEFAULT 0,
  current_allocation_pct numeric DEFAULT 0,
  policy_limits jsonb DEFAULT '{}',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.capital_purpose_buckets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own buckets" ON public.capital_purpose_buckets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_cpb_updated_at BEFORE UPDATE ON public.capital_purpose_buckets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Investment Constitutions
CREATE TABLE public.investment_constitutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  version integer DEFAULT 1,
  max_single_position_pct numeric DEFAULT 10,
  max_speculative_sleeve_pct numeric DEFAULT 20,
  max_event_sleeve_pct numeric DEFAULT 10,
  max_platform_exposure_pct numeric DEFAULT 50,
  require_simulation_rules jsonb DEFAULT '[]',
  require_approval_rules jsonb DEFAULT '[]',
  journal_required_rules jsonb DEFAULT '[]',
  cool_down_rules jsonb DEFAULT '[]',
  override_policy jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.investment_constitutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own constitution" ON public.investment_constitutions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ic_updated_at BEFORE UPDATE ON public.investment_constitutions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Investment Watchlists
CREATE TABLE public.investment_watchlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'manual',
  asset_ids uuid[] DEFAULT '{}',
  rules jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.investment_watchlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own watchlists" ON public.investment_watchlists FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_iw_updated_at BEFORE UPDATE ON public.investment_watchlists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Investment Signals
CREATE TABLE public.investment_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  asset_id uuid REFERENCES public.asset_master(id) ON DELETE SET NULL,
  signal_type text NOT NULL,
  severity text DEFAULT 'info',
  message text,
  related_advisor_ids text[] DEFAULT '{}',
  related_catalyst_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz,
  metadata jsonb DEFAULT '{}'
);
ALTER TABLE public.investment_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own signals" ON public.investment_signals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Catalyst Events
CREATE TABLE public.catalyst_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  asset_ids uuid[] DEFAULT '{}',
  theme_ids text[] DEFAULT '{}',
  catalyst_type text NOT NULL DEFAULT 'other',
  title text NOT NULL,
  scheduled_at timestamptz,
  importance text DEFAULT 'medium',
  uncertainty_level numeric DEFAULT 0.5,
  source text,
  scenario_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.catalyst_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own catalysts" ON public.catalyst_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ce_updated_at BEFORE UPDATE ON public.catalyst_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Thesis Records
CREATE TABLE public.thesis_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  related_asset_ids uuid[] DEFAULT '{}',
  related_theme_ids text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft',
  rationale text,
  assumptions jsonb DEFAULT '[]',
  catalyst_ids uuid[] DEFAULT '{}',
  risk_factors jsonb DEFAULT '[]',
  invalidation_criteria jsonb DEFAULT '[]',
  expected_horizon text,
  desired_sizing_note text,
  linked_strategy_id uuid,
  linked_decision_ids uuid[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  review_at timestamptz
);
ALTER TABLE public.thesis_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own theses" ON public.thesis_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_tr_updated_at BEFORE UPDATE ON public.thesis_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Journal Entries
CREATE TABLE public.investment_journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  thesis_id uuid REFERENCES public.thesis_records(id) ON DELETE SET NULL,
  decision_id uuid,
  entry_type text NOT NULL DEFAULT 'pre_trade',
  content text,
  emotional_tags text[] DEFAULT '{}',
  confidence_self_rating numeric,
  discipline_self_rating numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.investment_journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own journal" ON public.investment_journal_entries FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_ije_updated_at BEFORE UPDATE ON public.investment_journal_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Strategy Records
CREATE TABLE public.investment_strategy_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  strategy_type text DEFAULT 'custom',
  horizon text,
  objective text,
  allocation_model jsonb DEFAULT '{}',
  scenario_set_id uuid,
  advisor_summary_id uuid,
  readiness_status text DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.investment_strategy_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own strategies" ON public.investment_strategy_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_isr_updated_at BEFORE UPDATE ON public.investment_strategy_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Scenario Sets
CREATE TABLE public.investment_scenario_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  owner_type text NOT NULL DEFAULT 'strategy',
  owner_id uuid,
  scenarios jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.investment_scenario_sets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own scenarios" ON public.investment_scenario_sets FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_iss_updated_at BEFORE UPDATE ON public.investment_scenario_sets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Decision Records
CREATE TABLE public.investment_decision_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  decision_type text NOT NULL DEFAULT 'trade',
  status text NOT NULL DEFAULT 'draft',
  related_asset_ids uuid[] DEFAULT '{}',
  related_account_ids uuid[] DEFAULT '{}',
  related_thesis_id uuid REFERENCES public.thesis_records(id) ON DELETE SET NULL,
  related_strategy_id uuid REFERENCES public.investment_strategy_records(id) ON DELETE SET NULL,
  rationale_summary text,
  proposed_sizing jsonb DEFAULT '{}',
  proposed_platform text,
  readiness_score numeric,
  constitution_check_result jsonb DEFAULT '{}',
  advisor_snapshot_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  executed_at timestamptz
);
ALTER TABLE public.investment_decision_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own decisions" ON public.investment_decision_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_idr_updated_at BEFORE UPDATE ON public.investment_decision_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Execution Records
CREATE TABLE public.investment_execution_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  decision_id uuid REFERENCES public.investment_decision_records(id) ON DELETE SET NULL,
  platform_id uuid REFERENCES public.connected_investment_platforms(id) ON DELETE SET NULL,
  account_id uuid REFERENCES public.investment_accounts(id) ON DELETE SET NULL,
  execution_status text NOT NULL DEFAULT 'pending',
  quantity numeric,
  executed_value numeric,
  average_execution_price numeric,
  fee_estimate numeric,
  fee_actual numeric,
  slippage_estimate numeric,
  slippage_actual numeric,
  executed_at timestamptz,
  metadata jsonb DEFAULT '{}'
);
ALTER TABLE public.investment_execution_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own executions" ON public.investment_execution_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Investment Receipts
CREATE TABLE public.investment_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  receipt_type text NOT NULL DEFAULT 'trade_prep',
  related_decision_id uuid REFERENCES public.investment_decision_records(id) ON DELETE SET NULL,
  related_execution_id uuid REFERENCES public.investment_execution_records(id) ON DELETE SET NULL,
  related_thesis_id uuid REFERENCES public.thesis_records(id) ON DELETE SET NULL,
  advisor_snapshot_id uuid,
  summary text,
  actor text DEFAULT 'user',
  approval_state text DEFAULT 'none',
  risk_summary jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  exportable_bundle_ref text
);
ALTER TABLE public.investment_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own receipts" ON public.investment_receipts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Investment Advisor Profiles
CREATE TABLE public.investment_advisor_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  advisor_type text NOT NULL,
  display_name text NOT NULL,
  description text,
  active boolean DEFAULT true,
  priority integer DEFAULT 5,
  output_style_preferences jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.investment_advisor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own advisors" ON public.investment_advisor_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_iap_updated_at BEFORE UPDATE ON public.investment_advisor_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Advisor Observations
CREATE TABLE public.investment_advisor_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  advisor_id uuid REFERENCES public.investment_advisor_profiles(id) ON DELETE CASCADE,
  owner_type text NOT NULL DEFAULT 'asset',
  owner_id uuid,
  title text,
  summary text,
  detailed_reasoning text,
  confidence_level numeric DEFAULT 0.5,
  uncertainty_level numeric DEFAULT 0.5,
  recommendation_type text DEFAULT 'observe',
  what_changed text,
  what_would_change_mind text,
  key_risks jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.investment_advisor_observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own observations" ON public.investment_advisor_observations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_iao_updated_at BEFORE UPDATE ON public.investment_advisor_observations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Advisor Debates
CREATE TABLE public.investment_advisor_debates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  owner_type text NOT NULL DEFAULT 'asset',
  owner_id uuid,
  participating_advisor_ids uuid[] DEFAULT '{}',
  alignment_summary text,
  disagreement_summary text,
  conflicting_assumptions jsonb DEFAULT '[]',
  resolution_signals jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.investment_advisor_debates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own debates" ON public.investment_advisor_debates FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_iad_updated_at BEFORE UPDATE ON public.investment_advisor_debates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Chief Synthesis Records
CREATE TABLE public.chief_synthesis_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  owner_type text NOT NULL DEFAULT 'boardroom',
  owner_id uuid,
  aligned_views jsonb DEFAULT '[]',
  divergent_views jsonb DEFAULT '[]',
  strongest_opportunity text,
  strongest_risk text,
  key_unknown text,
  recommended_next_step text,
  confidence_summary jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.chief_synthesis_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own synthesis" ON public.chief_synthesis_records FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_csr_updated_at BEFORE UPDATE ON public.chief_synthesis_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Behavioral Signals
CREATE TABLE public.investment_behavioral_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  signal_type text NOT NULL,
  severity text DEFAULT 'medium',
  evidence_summary text,
  suggested_intervention text,
  requires_cooldown boolean DEFAULT false,
  requires_simulation boolean DEFAULT false,
  requires_approval boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
ALTER TABLE public.investment_behavioral_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own behavioral" ON public.investment_behavioral_signals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Strategy DNA Profiles
CREATE TABLE public.strategy_dna_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  traits jsonb DEFAULT '[]',
  confidence_by_trait jsonb DEFAULT '{}',
  observed_patterns jsonb DEFAULT '[]',
  notes text,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.strategy_dna_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own dna" ON public.strategy_dna_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Market Memory Events
CREATE TABLE public.market_memory_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  related_asset_ids uuid[] DEFAULT '{}',
  related_decision_id uuid,
  related_thesis_id uuid,
  related_advisor_ids uuid[] DEFAULT '{}',
  title text NOT NULL,
  summary text,
  severity text DEFAULT 'info',
  created_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz
);
ALTER TABLE public.market_memory_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own memory events" ON public.market_memory_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Time Machine Snapshots
CREATE TABLE public.time_machine_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  owner_type text NOT NULL DEFAULT 'decision',
  owner_id uuid,
  captured_at timestamptz NOT NULL DEFAULT now(),
  market_context jsonb DEFAULT '{}',
  advisor_state jsonb DEFAULT '{}',
  thesis_state jsonb DEFAULT '{}',
  portfolio_state jsonb DEFAULT '{}',
  catalyst_state jsonb DEFAULT '{}',
  risk_state jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.time_machine_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own snapshots" ON public.time_machine_snapshots FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add FK for portfolio_positions.purpose_bucket_id
ALTER TABLE public.portfolio_positions ADD CONSTRAINT fk_pp_purpose_bucket FOREIGN KEY (purpose_bucket_id) REFERENCES public.capital_purpose_buckets(id) ON DELETE SET NULL;
ALTER TABLE public.portfolio_positions ADD CONSTRAINT fk_pp_thesis FOREIGN KEY (thesis_id) REFERENCES public.thesis_records(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX idx_portfolio_positions_user ON public.portfolio_positions(user_id);
CREATE INDEX idx_thesis_records_user ON public.thesis_records(user_id);
CREATE INDEX idx_decision_records_user ON public.investment_decision_records(user_id);
CREATE INDEX idx_catalyst_events_user ON public.catalyst_events(user_id);
CREATE INDEX idx_market_memory_user ON public.market_memory_events(user_id);
CREATE INDEX idx_advisor_obs_user ON public.investment_advisor_observations(user_id);
CREATE INDEX idx_asset_snapshots_asset ON public.asset_market_snapshots(asset_id);
