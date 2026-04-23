

# Personal Brain → Adaptive Intelligence Layer (Phased Master Plan)

Transform the current 4-mode chat page into a personalized, self-learning, voice-enabled, project-aware AI environment with deep settings + security. Built in **6 sequential phases** — each phase is fully wired, tested, and verifiable before the next begins.

---

## Phase 0 — Foundation: Data Model & Edge Function Skeleton

**Goal:** lay the persistent backbone so every later phase has truth to write to.

**New tables (migration, all RLS = `user_id = auth.uid()`):**
- `pb_profile` — identity + onboarding answers (role, life_context, work_mode, tone, depth, coaching_style, format_pref, language, timezone, personalization_depth: minimal|moderate|deep, onboarded_at).
- `pb_goals` — learning goals & projects-in-flight (kind: skill|project|outcome, title, horizon_days, status, progress_pct).
- `pb_workspaces` — projects/workspaces (name, kind: business|personal|skill|writing|finance|custom, default_mode, custom_instructions, color, archived_at).
- `pb_chats` — chat threads (workspace_id nullable, title, mode, pinned, archived_at, last_message_at).
- `pb_messages` — `chat_id`, role, content, tokens, sources jsonb, created_at.
- `pb_memories` — explicit + inferred memory (kind: explicit|inferred, category, content, confidence 0–1, source_chat_id, status: active|disabled, decay_at).
- `pb_files` — workspace-scoped uploads (storage_path, scope: global|workspace, indexed_at, summary).
- `pb_voice_prefs` — voice id, rate, pitch, autoread, ptt vs tap, transcript_retention.
- `pb_security_prefs` — sensitive_mode, retention_days, autolearn_enabled, learn_from_chats, learn_from_files, voice_transcript_retention.
- `pb_security_events` — login/device/memory-access audit log.

**Storage bucket:** `pb-files` (private, RLS by `user_id` prefix).

**Edge function rework:** evolve `personal-brain` into a router with these subcommands (single function, action param):
- `infer` (existing chat — preserved)
- `memory.save`, `memory.list`, `memory.toggle`, `memory.delete`
- `learn.scan` (background pattern inference over recent messages → writes `kind:inferred`)
- `file.ingest` (extract text + summary)
- `voice.transcribe` (whisper-equiv via Lovable AI)

**Verification gate (must pass before Phase 1):**
- Migration applied, all 10 tables have RLS verified by linter.
- Edge function deploys; smoke test in `src/test/edge-functions-smoke.test.ts` covers each action.
- `personal-brain` existing chat behavior unchanged (regression test added).

---

## Phase 1 — Onboarding Ceremony

**Goal:** every first-time visit to `/personal-brain` is intercepted by a premium 6-step intake that writes to `pb_profile`, `pb_goals`, `pb_security_prefs`.

**New surface:** `src/components/personal-brain/onboarding/PersonalBrainOnboarding.tsx` reusing `OnboardingShell`.
- Step 1 — Identity (name, role, life context, timezone, language).
- Step 2 — Use cases (multi-select: learn, research, write, plan, build, decide, create, reflect…).
- Step 3 — Skill goals (chips + free-text, horizon picker 3/6/12 mo).
- Step 4 — Thinking style (concise/strategic/coach/analytical/creative/Socratic/direct).
- Step 5 — Personalization depth (minimal | moderate | deep) + context sources toggles.
- Step 6 — Voice & privacy quick-pick (enable voice? auto-learn? sensitive mode?).

Routing: page checks `pb_profile.onboarded_at`; if null → render onboarding, else render dashboard.

**Verification:** completing onboarding writes all answers; replay state via reload; existing E2E smoke suite gets a new spec.

---

## Phase 2 — Dashboard, Workspaces, Chats, Modes

**Goal:** replace today's bare chat with a Brain home.

**New routes (under `/personal-brain`):**
- `/personal-brain` → **BrainDashboard** (cards: Continue Chats · Active Goals · Workspaces · Brain Insights · Suggested Prompts · Voice CTA · Personal/Business toggle).
- `/personal-brain/w/:workspaceId` → workspace home (its chats, files, memory subset, mode default).
- `/personal-brain/c/:chatId` → chat view (current chat UI, expanded).

**Chat enhancements (in chat view):**
- Mode selector grows from 4 → 9: Think · Learn · Build · Create · Research · Strategize · Coach · Reflect · Decide. Each maps to a system prompt in `personal-brain/index.ts` (`MODE_PROMPTS` extended).
- Side context drawer: "Memory & sources used in this reply" — reads `sources` jsonb on each assistant message.
- Convert chat → note/task/project actions.

**New UI primitives (under `src/components/personal-brain/`):**
`BrainHero`, `WorkspaceCard`, `GoalProgressCard`, `BrainInsightCard`, `SuggestedPromptStrip`, `ContextDrawer`, `ModePicker`, `ChatList`, `WorkspaceSwitcher`.

**Verification:** create workspace → create chat in it → message persists in `pb_chats`/`pb_messages` → reload survives; switching workspace changes mode default and visible memories.

---

## Phase 3 — Memory & Self-Learning Engine

**Goal:** Brain becomes *adaptive*, transparently.

**Explicit memory:**
- "Remember this" affordance on any assistant or user message → writes `pb_memories` (`kind:explicit`).
- Inline `/remember …` slash command in input.

**Automatic learning (server-side):**
- Edge action `learn.scan` runs after every 10 messages OR nightly cron (`pg_cron` job hitting `personal-brain` with `{action:"learn.scan"}`).
- Uses Lovable AI (`google/gemini-3-flash-preview`) with structured output (tool-calling) to extract: preferred response style, depth, format, recurring topics, in-progress skills, project themes, business/personal ratio, repeated pain points.
- Each inferred memory stored with `confidence`. Below `pb_security_prefs.autolearn_threshold` → status `pending` (suggested), above → `active`.

**Brain Snapshot UI:** `src/pages/personal-brain/BrainSnapshot.tsx` — "What I've learned about you" panel grouped by category, with confidence bars, edit/disable/delete, "Was this right?" feedback that adjusts confidence.

**Prompt builder:** `personal-brain/index.ts` `buildBrainContext` upgraded — pulls active `pb_memories` + workspace custom_instructions + tone/depth from `pb_profile` + active goals → richer system prompt.

**Verification:** after seeded chat history, `learn.scan` produces ≥1 inferred memory; toggling it off removes it from prompt build (assert via inspection endpoint).

---

## Phase 4 — Voice (Desktop + Mobile)

**Goal:** true voice interaction layer, not just a mic icon.

**Desktop:**
- Mic button in chat input (push-to-talk, hold-Space shortcut).
- Floating Voice Orb (toggleable, draggable) for hands-free continuous mode.
- Live transcript overlay; edit-before-send.

**Mobile:**
- Primary mic CTA on dashboard hero & every chat.
- Tap-to-talk + push-to-talk modes; speak/listen/pause controls; transcript review screen.

**Implementation:**
- Reuse `src/lib/services/voice-command/` for STT (Web Speech API).
- For better quality + multilingual, add edge action `voice.transcribe` calling Lovable AI when `pb_voice_prefs.use_cloud_stt = true`.
- TTS via `speechSynthesis` (free) with selectable voice/rate/pitch from `pb_voice_prefs`.
- Auto-read assistant replies when `pb_voice_prefs.autoread = true`.
- Voice transcripts respect `pb_security_prefs.voice_transcript_retention` (none|session|persist).

**New components:** `VoiceOrb`, `MicButton`, `TranscriptStream`, `VoiceReviewSheet` (mobile).

**Verification:** voice → text → send → reply → optional spoken playback round-trip works on Chrome desktop + iOS/Android Safari.

---

## Phase 5 — Settings & Security Console

**Goal:** premium settings hub at `/personal-brain/settings` with 9 sections; reuses & links existing security pages.

**Sections (each its own subroute):**
1. **Profile & Personalization** → `pb_profile` editor.
2. **Memory & Learning** → list + edit `pb_memories`, autolearn toggle, depth slider, clear-by-category, confidence threshold.
3. **Modes** → per-mode tone/depth overrides → stored in `pb_profile.mode_overrides` jsonb.
4. **Workspaces** → CRUD on `pb_workspaces`, default-context picker, archive.
5. **Files & Knowledge** → `pb_files` browser, scope toggle (global/workspace), reprocess, delete.
6. **Voice & Audio** → `pb_voice_prefs` editor, voice picker, test playback.
7. **Security & Privacy** — composite page linking:
   - existing `MFAEnrollment`, `PasskeyManagement`, `TrustedDeviceManager`, `DeviceSettings`
   - **new:** Sessions list (reads `os_sessions`/`admin_sessions`) with revoke
   - **new:** Sensitive mode toggle (writes `pb_security_prefs.sensitive_mode` → no auto-learn, 7-day retention, no voice transcript persistence)
   - **new:** Security event log viewer (`pb_security_events`)
   - **new:** Data export (calls edge function returning JSON of all `pb_*` rows for the user)
   - **new:** Per-category memory deletion + full-account deletion CTA (re-uses existing GDPR delete edge function)
8. **Notifications** → reuses `NotificationPreferences` + Brain-specific learning nudges.
9. **Advanced / Labs** → reasoning effort, output verbosity, context blending toggles.

**Hardening:**
- All new edge actions: zod-validated, rate-limited (30/min), `requireAuth`, receipt-logged, budget-checked (existing `_shared` helpers).
- Memory access logged to `pb_security_events`.
- Sensitive mode enforced server-side in `personal-brain` (skip writes to `pb_memories` when on).

**Verification:** every settings save round-trips DB; revoking a session ends it; export produces a valid JSON file; sensitive mode prevents memory writes (asserted in edge function smoke test).

---

## Wiring & Deployment Readiness Checklist

- New route file `src/routes/personal-brain-routes.tsx` mounted in `os-routes.tsx`.
- Brain icon on Desktop + Dock + Control Room sidebar links to `/personal-brain`.
- Mobile route mapping in `src/App.tsx` `MOBILE_ROUTE_MAP_EXTENDED` adds `/personal-brain` → mobile shell variant.
- All new artifacts pass `key-artifact-freshness-gate.test.ts` and `production-build-smoke.spec.ts`.
- New `cron.schedule` for nightly `learn.scan` registered via insert tool (not migration).
- Edge function `personal-brain` redeployed; CORS/auth/zod tests added.

---

## Out of Scope

- Marketplace for shared workspaces / multi-user collaboration (deferred).
- Offline desktop voice models (deferred to runtime tier work).
- Social/SSO providers beyond what Cloud already supports.

---

## Files Touched

**New (~25):** `pb_*` migration, onboarding, dashboard, workspace/chat routes, memory engine UI, voice components, 9 settings subroutes, `personal-brain-routes.tsx`.
**Edited:** `src/pages/PersonalBrain.tsx` (becomes thin router), `supabase/functions/personal-brain/index.ts` (router + new actions), `src/routes/os-routes.tsx`, `src/App.tsx`, sidebar/dock app registries, edge-function smoke test, e2e smoke suite.

