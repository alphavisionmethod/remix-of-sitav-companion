create table if not exists public.communication_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  channel text not null check (channel in ('email','sms','call','chat','webhook')),
  direction text not null check (direction in ('inbound','outbound')),
  contact_name text,
  contact_identifier text,
  subject text,
  body_preview text,
  status text default 'sent' check (status in ('queued','sent','delivered','read','failed','bounced')),
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
