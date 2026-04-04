create table if not exists public.sovereign_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  export_type text not null check (export_type in ('full','partial','domain','receipts','memory','audit')),
  domain text,
  status text default 'pending' check (status in ('pending','processing','completed','failed','expired')),
  format text default 'json' check (format in ('json','csv','pdf','zip')),
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
