create table if not exists public.capital_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  allocation_name text not null,
  category text not null,
  amount_cents bigint not null,
  currency text default 'USD',
  status text default 'active' check (status in ('active','depleted','frozen','pending')),
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
