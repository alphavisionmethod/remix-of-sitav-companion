create table if not exists public.ai_cost_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  agent_id text,
  model_id text not null,
  provider text not null,
  input_tokens integer default 0,
  output_tokens integer default 0,
  cost_cents integer default 0,
  capability_id text,
  correlation_id text,
  domain text,
  created_at timestamptz default now()
);
alter table public.ai_cost_ledger enable row level security;
create policy "Users view own AI costs" on public.ai_cost_ledger for select to authenticated using (auth.uid() = user_id);
create policy "Users insert own AI costs" on public.ai_cost_ledger for insert to authenticated with check (auth.uid() = user_id);
create index idx_ai_cost_ledger_user on public.ai_cost_ledger(user_id);
create index idx_ai_cost_ledger_date on public.ai_cost_ledger(created_at);
