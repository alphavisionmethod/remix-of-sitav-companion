
-- 1. Trust State Events
create table if not exists public.trust_state_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  entity_id text not null,
  event_type text not null,
  trust_score_before numeric(5,2),
  trust_score_after numeric(5,2),
  delta numeric(5,2),
  reason text,
  source text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
alter table public.trust_state_events enable row level security;
create policy "Users can view own trust events" on public.trust_state_events for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own trust events" on public.trust_state_events for insert to authenticated with check (auth.uid() = user_id);
create index idx_trust_state_events_user on public.trust_state_events(user_id);
create index idx_trust_state_events_entity on public.trust_state_events(entity_id);

-- 2. Encrypted Secrets
create table if not exists public.encrypted_secrets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  key_name text not null,
  encrypted_value text not null,
  algorithm text default 'aes-256-gcm',
  iv text,
  domain text,
  expires_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, key_name)
);
alter table public.encrypted_secrets enable row level security;
create policy "Users manage own secrets" on public.encrypted_secrets for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_encrypted_secrets_user on public.encrypted_secrets(user_id);

-- 3. Notifications Queue
create table if not exists public.notifications_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  channel text not null default 'push',
  title text not null,
  body text,
  urgency text default 'normal',
  status text default 'pending',
  action_url text,
  metadata jsonb default '{}'::jsonb,
  scheduled_at timestamptz,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz default now()
);
alter table public.notifications_queue enable row level security;
create policy "Users manage own notifications" on public.notifications_queue for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_notifications_user_status on public.notifications_queue(user_id, status);

-- 4. AI Agent Tasks
create table if not exists public.ai_agent_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  agent_id text not null,
  task_type text not null,
  description text,
  status text default 'pending',
  priority text default 'normal',
  input_data jsonb default '{}'::jsonb,
  output_data jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.ai_agent_tasks enable row level security;
create policy "Users manage own agent tasks" on public.ai_agent_tasks for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_ai_agent_tasks_user on public.ai_agent_tasks(user_id, status);
create index idx_ai_agent_tasks_agent on public.ai_agent_tasks(agent_id);

-- 5. AI Cost Ledger
create table if not exists public.ai_cost_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  model_id text not null,
  provider text not null,
  operation text not null,
  tokens_in integer default 0,
  tokens_out integer default 0,
  cost_cents integer default 0,
  latency_ms integer,
  domain text,
  agent_id text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
alter table public.ai_cost_ledger enable row level security;
create policy "Users view own cost ledger" on public.ai_cost_ledger for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own cost entries" on public.ai_cost_ledger for insert to authenticated with check (auth.uid() = user_id);
create index idx_ai_cost_ledger_user on public.ai_cost_ledger(user_id);
create index idx_ai_cost_ledger_model on public.ai_cost_ledger(model_id);

-- 6. Capital Allocations
create table if not exists public.capital_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  allocation_name text not null,
  category text not null,
  amount_cents bigint not null,
  currency text default 'USD',
  status text default 'active',
  utilization_pct numeric(5,2) default 0,
  threshold_warning_pct numeric(5,2) default 80,
  threshold_critical_pct numeric(5,2) default 95,
  period_start timestamptz,
  period_end timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.capital_allocations enable row level security;
create policy "Users manage own allocations" on public.capital_allocations for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_capital_allocations_user on public.capital_allocations(user_id, status);

-- 7. Communication Log
create table if not exists public.communication_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  channel text not null,
  direction text not null,
  contact_name text,
  contact_identifier text,
  subject text,
  body_preview text,
  status text default 'sent',
  domain text,
  correlation_id text,
  metadata jsonb default '{}'::jsonb,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz default now()
);
alter table public.communication_log enable row level security;
create policy "Users manage own communications" on public.communication_log for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_communication_log_user on public.communication_log(user_id);
create index idx_communication_log_channel on public.communication_log(channel);

-- 8. Sovereign Exports
create table if not exists public.sovereign_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  export_type text not null,
  domain text,
  status text default 'pending',
  format text default 'json',
  file_path text,
  file_size_bytes bigint,
  record_count integer default 0,
  requested_at timestamptz default now(),
  completed_at timestamptz,
  expires_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
alter table public.sovereign_exports enable row level security;
create policy "Users manage own exports" on public.sovereign_exports for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_sovereign_exports_user on public.sovereign_exports(user_id, status);

-- 9. Setup Sessions
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
create policy "Users can read own setup sessions" on public.setup_sessions for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert own setup sessions" on public.setup_sessions for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own setup sessions" on public.setup_sessions for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own setup sessions" on public.setup_sessions for delete to authenticated using (auth.uid() = user_id);
