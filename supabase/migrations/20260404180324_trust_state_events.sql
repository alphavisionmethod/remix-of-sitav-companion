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
