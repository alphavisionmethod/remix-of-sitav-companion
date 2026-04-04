create table if not exists public.ai_agent_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  agent_id text not null,
  agent_name text not null,
  capability_id text not null,
  status text default 'pending' check (status in ('pending','running','completed','failed','cancelled')),
  input_payload jsonb default '{}'::jsonb,
  output_payload jsonb,
  error_message text,
  trust_score_at_execution numeric(5,2),
  autonomy_level text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);
alter table public.ai_agent_tasks enable row level security;
create policy "Users manage own agent tasks" on public.ai_agent_tasks for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index idx_ai_agent_tasks_user on public.ai_agent_tasks(user_id, status);
create index idx_ai_agent_tasks_agent on public.ai_agent_tasks(agent_id);
