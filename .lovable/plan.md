

# Personal Brain — Premium Onboarding + Settings + Dashboard Upgrade

Goal: replace the existing 6-step intake with a guided 11-step "calibration" ceremony, expand the Settings hub from 5 sections to 11 first-class sections, and evolve the dashboard into a true command center — all wired to existing `pb_*` tables (no schema rewrites; one additive migration only).

---

## Part 1 — The 11-Step Calibration Ceremony

Rebuild `src/components/personal-brain/onboarding/PersonalBrainOnboarding.tsx` as a step machine driven by config. Steps correspond 1:1 to the spec.

| # | Step | Maps to |
|---|---|---|
| 0 | Intro / "Let's shape your Brain" | none (skip → defaults) |
| 1 | Identity (name, role, life context, timezone, language, optional location) | `pb_profile` |
| 2 | What do you want help with? (use cases + top-3 strengths + biggest need) | `pb_profile.use_cases` + new `strengths`, `biggest_need` |
| 3 | What are you trying to learn? (skills, current topics, 3-mo + 6-12-mo goals, learning style, level) | `pb_goals` rows + `pb_profile.learning_style`, `learning_level` |
| 4 | Cognition style (response style, thinking-style top-2, output formats, depth-of-detail) | `pb_profile.tone`, `coaching_style`, `format_pref`, new `output_formats` |
| 5 | Personal vs Business vs Mixed (work_mode, separation pref, default workspaces to create, default workspace) | `pb_profile.work_mode` + queues `pb_workspaces` inserts |
| 6 | Projects in flight (free-text list + optional first project) | creates a `pb_workspaces` row of kind `custom` (= project) per entry |
| 7 | Memory & learning controls (depth, sources, infer-toggle, review cadence, "should I remember?" prompts) | `pb_profile.personalization_depth`, `context_sources` + `pb_security_prefs.autolearn_*` + new `infer_prompt_mode` |
| 8 | Voice (use-frequency, default mode, autoread, voice summaries) | `pb_voice_prefs` |
| 9 | Security & privacy (privacy level preset, sensitive-mode opt-in, separate-controls toggle) | `pb_security_prefs` |
| 10 | Final calibration / summary screen with personalized recap and 4 CTAs (Enter / Review / Create workspace / Start with voice) | reads what was just saved |

Each step renders inside the existing `OnboardingShell` + `OnboardingProgress` + `OnboardingChoiceCard` primitives — so the visual grammar already in `src/components/onboarding/*` is reused.

A "Save & exit" link appears on every step from #2 onward; partial state is upserted to `pb_profile` so the user can resume mid-flow (gate hook already keys on `onboarded_at`).

The existing single-call `submit()` is replaced with a per-step `persistStep()` that does a small upsert on advance, plus a final `finalize()` that writes `onboarded_at`, the chosen workspaces, and the optional first project in one batched call.

---

## Part 2 — Settings Center Expansion

Rebuild `/personal-brain/settings` as an 11-section hub with a left-rail nav (sticky on desktop, accordion on mobile) using `Sidebar` primitives. Each section gets its own route under `/personal-brain/settings/<section>`.

| Section | Route | Backed by |
|---|---|---|
| Overview | `/settings` (default) | aggregate read |
| Profile & Personalization | `/settings/profile` | `pb_profile` |
| Memory & Learning | `/settings/memory` | `pb_memories`, `pb_security_prefs` |
| Modes & Behavior | `/settings/modes` | `pb_profile.mode_overrides` |
| Workspaces & Projects | `/settings/workspaces` | `pb_workspaces` |
| Files & Knowledge | `/settings/files` | `pb_files` |
| Voice & Audio | `/voice-settings` (existing) | `pb_voice_prefs` |
| Notifications | `/settings/notifications` | new `pb_notification_prefs` (additive migration) |
| Security & Privacy | `/settings/security` (existing) | `pb_security_prefs`, `pb_security_events` |
| Data & Controls | `/settings/data` (existing — extend) | export/delete edge fns |
| Advanced / Labs | `/settings/labs` | `pb_profile.mode_overrides.labs` JSON |

New components (under `src/components/personal-brain/settings/`):
- `SettingsSidebarNav.tsx`
- `OverviewCard.tsx` (live tiles: personalization level, memory count, active workspaces, voice on/off, security level, recent learned patterns)
- `ProfilePersonalizationCard.tsx`
- `MemoryControlCenter.tsx` (lists explicit + inferred, accept/edit/reject, category filters, reset buttons)
- `ModesBehaviorEditor.tsx` (per-mode tone/verbosity/output/clarify-first/use-context toggles, persisted as `pb_profile.mode_overrides[modeId]`)
- `WorkspacesManager.tsx` (full CRUD, type selector, default-workspace, archive, custom-instructions)
- `FilesKnowledgeManager.tsx` (existing `pb_files` table — uploads already wired through edge fn)
- `NotificationsCard.tsx`
- `LabsCard.tsx`

`BrainSettings.tsx` becomes a layout shell with `<Outlet/>`; the 11 section pages become children.

---

## Part 3 — Dashboard Command Center

Rebuild `BrainDashboard.tsx` to match the spec sections 1–10. Existing components are reused; new ones are added.

Layout (top to bottom):

1. **Top header**: keep `BrainHero` (already has scope, voice, settings, sentinel) — extend with a `WorkspaceSwitcher` (already exists) and `ModePicker` inline.
2. **Hero prompt**: large adaptive prompt box with mode-aware placeholder, attach button, voice trigger (new `BrainCommandBar.tsx`).
3. **Active workspaces** (existing `WorkspaceGrid`) — extend each card with: recent activity, suggested next action, chat count, file count, active goals.
4. **Continue where you left off** (existing `ChatList`) — add pin/favorite (uses `pb_chats.metadata`).
5. **Brain Snapshot** (new `BrainSnapshotCard.tsx`) — "What your Brain knows right now": current focus, top skills, preferred style, most-used mode, suggested next skill, recent inferred pattern. Reads `pb_profile` + `pb_memories` (top by recency) + `pb_chats` aggregate.
6. **Suggested next actions** (new `BrainNextActionsCard.tsx`) — derived client-side from goals + chats + insights.
7. **Learning momentum** (new `BrainLearningMomentumCard.tsx`) — per-goal progress bars + suggested next step (uses `pb_goals`).
8. **Projects in motion** (new `BrainProjectsCard.tsx`) — `pb_workspaces` of kind `custom` with chat/file counts.
9. **Files recently used** (new `BrainRecentFilesCard.tsx`) — `pb_files` ordered by `updated_at`.
10. **Voice & quick capture** (new `BrainQuickCaptureCard.tsx`) — start voice convo, record reflection, dictate idea.
11. **Insights / adaptation feed** (existing `BrainInsightCard`) — extend with Accept / Edit / Dismiss actions writing back to `pb_memories.status`.
12. **Footer actions** (new `BrainFooterActions.tsx`).

Layout uses a 3-col responsive grid on `lg+`, single-column on mobile. All new cards follow existing glassmorphic Card grammar; no inline CSS.

---

## Part 4 — Mode Behavior Matrix (real, not cosmetic)

`src/components/personal-brain/BRAIN_MODES.ts` is extended with the per-mode behavior block from the spec (default tone, verbosity, output structure, clarify-first, cite sources, use project context, memory weight, voice compatibility). The chat page (`PersonalBrainChat.tsx`) already reads from this file — extend its system-prompt builder so each mode actually loads its overrides, blended with the user's `pb_profile.mode_overrides[modeId]`.

Also adds a `getEffectiveModeBehavior(modeId, profile)` helper used by both the chat surface and the planner edge function (`personal-brain/router`).

---

## Part 5 — Database (one additive migration)

Single migration file. No table renames. No column drops. No data backfill needed.

```sql
-- pb_profile additive columns
alter table public.pb_profile
  add column if not exists location text,
  add column if not exists strengths jsonb not null default '[]'::jsonb,
  add column if not exists biggest_need text,
  add column if not exists learning_style jsonb not null default '[]'::jsonb,
  add column if not exists learning_level text not null default 'adaptive'
    check (learning_level in ('beginner','intermediate','advanced','adaptive')),
  add column if not exists output_formats jsonb not null default '[]'::jsonb,
  add column if not exists default_workspace_id uuid,
  add column if not exists separation_pref text not null default 'mixed-ok'
    check (separation_pref in ('always-separate','mostly-separate','mixed-ok','ask')),
  add column if not exists infer_prompt_mode text not null default 'sometimes'
    check (infer_prompt_mode in ('always','sometimes','never'));

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
create policy "pb_notif_prefs self all" on public.pb_notification_prefs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create trigger pb_notif_prefs_updated_at before update on public.pb_notification_prefs
  for each row execute function pb_set_updated_at();
```

After migration, regenerate `src/integrations/supabase/types.ts` automatically.

---

## Part 6 — Edge function changes

- `supabase/functions/personal-brain/router.ts` (existing): consume `getEffectiveModeBehavior` and inject mode behavior + memory + selected `context_sources` into the system prompt.
- New `supabase/functions/pb-snapshot-aggregate/index.ts`: returns the Brain Snapshot in one call (current focus, top skills, preferred style, most-used mode, recent inferred pattern). Cached server-side with `evidence_signal_cache` (already used by other PB functions). `verify_jwt = true`.
- New `supabase/functions/pb-suggest-next/index.ts`: returns 3-5 suggested next actions per scope. `verify_jwt = true`.

Both registered in `supabase/config.toml` with default JWT verification.

---

## Part 7 — Memory file

New `mem://features/personal-brain-onboarding-and-settings.md` describing: 11-step ceremony + 11-section settings hub + 12-section dashboard + per-mode behavior matrix + which `pb_*` tables back what. Index updated.

---

## Files added
- `src/components/personal-brain/onboarding/steps/Step{0..10}.tsx` (11 step components)
- `src/components/personal-brain/onboarding/onboarding-machine.ts` (state, persistStep, finalize)
- `src/components/personal-brain/onboarding/onboarding-config.ts` (extended)
- `src/components/personal-brain/settings/{OverviewCard,ProfilePersonalizationCard,MemoryControlCenter,ModesBehaviorEditor,WorkspacesManager,FilesKnowledgeManager,NotificationsCard,LabsCard,SettingsSidebarNav}.tsx`
- `src/pages/personal-brain/settings/{Profile,Memory,Modes,Workspaces,Files,Notifications,Labs}.tsx`
- `src/components/personal-brain/dashboard/{BrainCommandBar,BrainSnapshotCard,BrainNextActionsCard,BrainLearningMomentumCard,BrainProjectsCard,BrainRecentFilesCard,BrainQuickCaptureCard,BrainFooterActions}.tsx`
- `src/lib/personal-brain/effective-mode-behavior.ts`
- `supabase/functions/pb-snapshot-aggregate/index.ts`
- `supabase/functions/pb-suggest-next/index.ts`
- `supabase/migrations/<ts>_pb_onboarding_v2.sql`
- `mem/features/personal-brain-onboarding-and-settings.md`

## Files edited
- `src/components/personal-brain/onboarding/PersonalBrainOnboarding.tsx` (rewritten as machine host)
- `src/components/personal-brain/BrainDashboard.tsx` (sectional layout)
- `src/components/personal-brain/BRAIN_MODES.ts` (behavior block per mode)
- `src/pages/personal-brain/BrainSettings.tsx` (becomes layout with `<Outlet/>`)
- `src/pages/personal-brain/PersonalBrainChat.tsx` (uses `getEffectiveModeBehavior`)
- `src/routes/os-routes.tsx` (7 new settings child routes)
- `supabase/functions/personal-brain/router.ts` (mode behavior injection)
- `supabase/config.toml` (register 2 new functions)
- `mem/index.md`

## Verification gates
1. `tsc --noEmit` clean.
2. `npm run test:seq -- --filter personal-brain` (uses the runner you just shipped).
3. Manual gate-walk: fresh user → 11 steps → land on dashboard → all 12 sections render with empty-state honesty (no inline CSS).
4. Existing user (already onboarded): dashboard renders unchanged-by-default, settings hub now shows 11 sections with values populated from existing rows.
5. RLS check on `pb_notification_prefs`.

## Out of scope (documented as follow-ups)
- Real-time pattern-acceptance via inferred-memory edge fn (existing `pb-learn` already covers writes — UI surfaces what's there).
- Multi-tenant workspace sharing UI (the `pb_workspace_members` table already exists; the existing AcceptInvite flow stays).
- Background job for "weekly Brain recap" notification (queued for a later phase; the toggle persists today).

