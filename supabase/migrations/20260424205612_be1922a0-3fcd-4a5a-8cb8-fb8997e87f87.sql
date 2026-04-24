-- ═══════════════════════════════════════════════════════════════
-- Phase 9 — Stub Surface Elimination: backing tables
-- ═══════════════════════════════════════════════════════════════

-- ── 1. call_outcomes ──────────────────────────────────────────
create table if not exists public.call_outcomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  calendar_event_id uuid references public.calendar_events(id) on delete set null,
  contact_name text,
  company text,
  duration_seconds integer not null default 0,
  sentiment text not null default 'neutral'
    check (sentiment in ('very positive','positive','warm','neutral','cool','negative')),
  outcome text not null default '',
  next_step text,
  quote_triggered boolean not null default false,
  follow_up_sent boolean not null default false,
  warmth_score integer check (warmth_score is null or (warmth_score between 0 and 100)),
  ai_prep_brief text,
  talking_points jsonb not null default '[]'::jsonb,
  objections jsonb not null default '[]'::jsonb,
  post_call_actions jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.call_outcomes enable row level security;

create policy "call_outcomes_select_own"
  on public.call_outcomes for select to authenticated
  using (auth.uid() = user_id);

create policy "call_outcomes_insert_own"
  on public.call_outcomes for insert to authenticated
  with check (auth.uid() = user_id);

create policy "call_outcomes_update_own"
  on public.call_outcomes for update to authenticated
  using (auth.uid() = user_id);

create policy "call_outcomes_delete_own"
  on public.call_outcomes for delete to authenticated
  using (auth.uid() = user_id);

create index if not exists idx_call_outcomes_user_created
  on public.call_outcomes (user_id, created_at desc);

create index if not exists idx_call_outcomes_event
  on public.call_outcomes (calendar_event_id);

create trigger trg_call_outcomes_updated
  before update on public.call_outcomes
  for each row execute function public.update_updated_at_column();

-- ── 2. automation_fatigue_alerts ──────────────────────────────
create table if not exists public.automation_fatigue_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  automation_id uuid references public.crm_automations(id) on delete cascade,
  contact_id uuid,
  channel text not null check (channel in ('email','sms','push','call','in_app')),
  signal text not null,
  severity text not null default 'warning'
    check (severity in ('info','warning','critical')),
  evidence jsonb not null default '{}'::jsonb,
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.automation_fatigue_alerts enable row level security;

create policy "fatigue_alerts_select_own"
  on public.automation_fatigue_alerts for select to authenticated
  using (auth.uid() = user_id);

create policy "fatigue_alerts_insert_own"
  on public.automation_fatigue_alerts for insert to authenticated
  with check (auth.uid() = user_id);

create policy "fatigue_alerts_update_own"
  on public.automation_fatigue_alerts for update to authenticated
  using (auth.uid() = user_id);

create policy "fatigue_alerts_delete_own"
  on public.automation_fatigue_alerts for delete to authenticated
  using (auth.uid() = user_id);

create index if not exists idx_fatigue_alerts_user_created
  on public.automation_fatigue_alerts (user_id, created_at desc);

create index if not exists idx_fatigue_alerts_automation
  on public.automation_fatigue_alerts (automation_id);

create trigger trg_fatigue_alerts_updated
  before update on public.automation_fatigue_alerts
  for each row execute function public.update_updated_at_column();

-- ── 3. pack_install_metrics ───────────────────────────────────
create table if not exists public.pack_install_metrics (
  pack_id text not null,
  metric_date date not null,
  category text,
  installs integer not null default 0,
  uninstalls integer not null default 0,
  active_users integer not null default 0,
  revenue_cents bigint not null default 0,
  arpu_cents bigint not null default 0,
  retention_30d numeric(5,4),
  attach_rate numeric(5,4),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (pack_id, metric_date)
);

alter table public.pack_install_metrics enable row level security;

create policy "pack_metrics_read_all_authenticated"
  on public.pack_install_metrics for select to authenticated
  using (true);

create policy "pack_metrics_admin_write"
  on public.pack_install_metrics for all to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));

create index if not exists idx_pack_metrics_pack_date
  on public.pack_install_metrics (pack_id, metric_date desc);

create index if not exists idx_pack_metrics_date
  on public.pack_install_metrics (metric_date desc);

create trigger trg_pack_metrics_updated
  before update on public.pack_install_metrics
  for each row execute function public.update_updated_at_column();