-- ═══════════════════════════════════════════════════════════════
-- Phase 9.1 — Human-initiated runbook launch queue
-- ═══════════════════════════════════════════════════════════════
create table if not exists public.runbook_launch_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  runbook_id uuid not null references public.platform_runbooks(id) on delete cascade,
  trigger_reason text not null default 'manual_launch',
  justification text,
  parameters jsonb not null default '{}'::jsonb,
  status text not null default 'queued'
    check (status in ('queued','approved','executing','completed','failed','cancelled')),
  requested_at timestamptz not null default now(),
  approved_at timestamptz,
  approved_by uuid,
  executed_at timestamptz,
  completed_at timestamptz,
  outcome_summary text,
  execution_id uuid,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.runbook_launch_requests enable row level security;

create policy "rb_launch_select_own"
  on public.runbook_launch_requests for select to authenticated
  using (auth.uid() = user_id);

create policy "rb_launch_insert_own"
  on public.runbook_launch_requests for insert to authenticated
  with check (auth.uid() = user_id);

create policy "rb_launch_update_own"
  on public.runbook_launch_requests for update to authenticated
  using (auth.uid() = user_id);

create index if not exists idx_rb_launch_user_created
  on public.runbook_launch_requests (user_id, created_at desc);

create index if not exists idx_rb_launch_runbook
  on public.runbook_launch_requests (runbook_id);

create index if not exists idx_rb_launch_status
  on public.runbook_launch_requests (status) where status in ('queued','approved','executing');

create trigger trg_rb_launch_updated
  before update on public.runbook_launch_requests
  for each row execute function public.update_updated_at_column();