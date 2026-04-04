create table if not exists public.notifications_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  channel text not null default 'push',
  title text not null,
  body text,
  urgency text default 'normal' check (urgency in ('low','normal','high','critical')),
  status text default 'pending' check (status in ('pending','sent','delivered','read','failed')),
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
