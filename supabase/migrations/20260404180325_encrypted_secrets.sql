create table if not exists public.encrypted_secrets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  key_name text not null,
  encrypted_value text not null,
  provider text,
  scope text default 'personal',
  rotation_due_at timestamptz,
  last_rotated_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, key_name)
);
alter table public.encrypted_secrets enable row level security;
create policy "Users manage own secrets" on public.encrypted_secrets for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
