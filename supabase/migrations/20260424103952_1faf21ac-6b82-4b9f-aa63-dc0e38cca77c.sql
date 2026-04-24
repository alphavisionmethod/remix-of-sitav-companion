-- ═══════════════════════════════════════════════════════════════
-- Personal Brain Onboarding v2 — additive schema
-- ═══════════════════════════════════════════════════════════════

-- pb_profile additive columns (all nullable / defaulted, no backfill needed)
alter table public.pb_profile
  add column if not exists location text,
  add column if not exists strengths jsonb not null default '[]'::jsonb,
  add column if not exists biggest_need text,
  add column if not exists learning_style jsonb not null default '[]'::jsonb,
  add column if not exists learning_level text not null default 'adaptive',
  add column if not exists output_formats jsonb not null default '[]'::jsonb,
  add column if not exists default_workspace_id uuid,
  add column if not exists separation_pref text not null default 'mixed-ok',
  add column if not exists infer_prompt_mode text not null default 'sometimes';

-- Constraints (named so re-runs are idempotent)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'pb_profile_learning_level_chk'
  ) then
    alter table public.pb_profile
      add constraint pb_profile_learning_level_chk
      check (learning_level in ('beginner','intermediate','advanced','adaptive'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'pb_profile_separation_pref_chk'
  ) then
    alter table public.pb_profile
      add constraint pb_profile_separation_pref_chk
      check (separation_pref in ('always-separate','mostly-separate','mixed-ok','ask'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'pb_profile_infer_prompt_mode_chk'
  ) then
    alter table public.pb_profile
      add constraint pb_profile_infer_prompt_mode_chk
      check (infer_prompt_mode in ('always','sometimes','never'));
  end if;
end$$;

-- pb_notification_prefs (new)
create table if not exists public.pb_notification_prefs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  learning_reminders text not null default 'weekly',
  project_nudges text not null default 'weekly',
  continue_where_left_off boolean not null default true,
  weekly_recap boolean not null default true,
  inferred_pattern_review boolean not null default true,
  daily_planning_prompt boolean not null default false,
  voice_reflection_reminder boolean not null default false,
  channel_in_app boolean not null default true,
  channel_email boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pb_notification_prefs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'pb_notification_prefs'
      and policyname = 'pb_notif_prefs self all'
  ) then
    create policy "pb_notif_prefs self all"
      on public.pb_notification_prefs
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end$$;

-- Reuse existing pb_set_updated_at() trigger function if present;
-- otherwise create a local equivalent.
do $$
begin
  if not exists (select 1 from pg_proc where proname = 'pb_set_updated_at') then
    create function public.pb_set_updated_at()
    returns trigger
    language plpgsql
    set search_path = public
    as $fn$
    begin
      new.updated_at = now();
      return new;
    end;
    $fn$;
  end if;
end$$;

drop trigger if exists pb_notif_prefs_updated_at on public.pb_notification_prefs;
create trigger pb_notif_prefs_updated_at
  before update on public.pb_notification_prefs
  for each row execute function public.pb_set_updated_at();
