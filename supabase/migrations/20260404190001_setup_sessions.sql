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
