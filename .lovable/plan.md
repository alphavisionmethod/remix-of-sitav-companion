
# SITA OS — Master Prompt 2 Implementation Plan

**Scope reality check (already in place):**
- 490 public tables · 214 edge functions · 277 migrations
- 4 module skeletons: `business`, `concierge`, `finance`, `health` (greenfield)
- Trust layer wired (`_trust/index.ts`, registry of 9 actions, manifest CI gate, kill-switch, support escalation)
- Existing platform: `pb_workspaces`, `pb_memories`, `pb_files`, `advisor_*`, `simulations`, `notifications`, `waitlist_signups`, `customer_lifecycle_stages`, `cloud_devices`, `user_passkeys`, `consent_scope_records`, `ai_action_receipts`, `approval_requests`

**Operating rules (non-negotiable):**
1. **No duplicates.** Every new capability extends an existing table/service or is added once at `src/modules/_shared/**` or `src/modules/_trust/**`.
2. **No stubs.** A phase ships only when every surface, edge function, RLS policy, and CI gate is wired and green.
3. **Trust-first.** Every mutating capability added in any phase MUST have a `TRUST_ACTION_REGISTRY` entry + receipt + (where appropriate) approval gating, enforced by the Phase-9-of-prior-work CI manifest diff.
4. **One phase at a time.** Phase N+1 cannot start until Phase N's typecheck passes, manifest is fresh, RLS lints clean, CI gates pass, and all new routes/services are reachable.
5. Health OS is built like Finance was — full RLS, receipts from day one.

---

## PHASE 1 — Identity, Workspace & Module Registry Foundation

**Goal:** A single, canonical model for *who you are*, *which workspace you're in*, and *which module/sub-app you're using*. This is the substrate every later phase depends on.

**Backend (migrations):**
- New table `module_registry` (top-level + sub-app catalog: `module_id`, `parent_id`, `pillar`, `route_prefix`, `icon`, `category`, `feature_flag`, `lifecycle` ['ga'|'beta'|'experimental'|'legacy'], `default_authority_level`, `health_status`, `owner`).
- New table `route_ownership` (route → module mapping, `is_shared`, `is_trust`, `visibility` ['public'|'internal'|'admin']).
- New table `workspace_contexts` (extends `pb_workspaces` with: `pillar` ['business'|'concierge'|'finance'|'health'|'personal'|'shared'], `protected` bool, `default_authority_level`, `memory_scope` ['isolated'|'shared'|'cross-pillar'], `assistant_advisor_id`, `visibility`, `default_notification_level`).
- New table `workspace_memberships_extended` (or columns on `pb_workspace_members`: `role` ['owner'|'admin'|'editor'|'viewer'], `automation_authority_override`).
- Trigger: every new `pb_workspaces` row auto-creates a `workspace_contexts` row with sensible defaults.
- All tables RLS via `is_org_member`/`workspace_id = ANY(my_workspaces())`.

**Frontend / services:**
- `src/modules/_shared/registry/module-registry.ts` — typed catalog seeded from DB on boot, exposed via `useModuleRegistry()`.
- `src/modules/_shared/workspace/workspace-context.tsx` — global `useActiveWorkspace()` hook + `<WorkspaceBoundary>` wrapper that scopes downstream queries.
- Update `src/routes/*.tsx` files to register via `route_ownership` (one-time seed migration).
- Health module gets its first real entries (no implementation yet — registry only).

**CI/QA:**
- New script `scripts/architecture/check-module-registry-coverage.ts` — fails if any route in the router has no `route_ownership` row.
- Manifest `public/generated/module-registry.json` regenerated and diff-checked, same pattern as trust-action manifest.
- Typecheck + RLS linter clean.

**Deployment gate:** Module registry visible at `/trust/decisions` and at a new admin page `/admin/architecture/modules`. Seed includes all 4 pillars + every sub-app currently in the codebase. Workspace switcher in shell reads from `workspace_contexts`.

---

## PHASE 2 — Trust Action Registry Expansion + Authority/Approval Engine

**Goal:** Make automation governance real for *every* mutating capability across all 4 pillars, with user-configurable authority levels.

**Registry expansion (no duplicates — all NEW keys):**
Add ~25 entries covering: `business.deal.create`, `business.invoice.send`, `business.email.campaign_send`, `concierge.calendar.event_create`, `concierge.reservation.cancel`, `concierge.gift.purchase`, `finance.transfer.execute`, `finance.subscription.cancel`, `finance.investment.rebalance`, `finance.tax.filing_submit`, `health.connector.connect`, `health.record.read`, `health.medication.log`, `health.appointment.book`, `shared.memory.delete`, `shared.workspace.delete`, `shared.file.delete_bulk`, `shared.export.full_data`, `shared.consent.revoke`, `shared.device.revoke`, `shared.passkey.remove`.

**Backend:**
- New table `automation_authority_settings` (per `user_id` × `workspace_id` × `action_key` OR `category`: `mode` ['suggest'|'ask'|'pre_approved'|'blocked'], `expires_at`).
- New table `approval_categories` (low/medium/high/critical defaults per pillar; user can override).
- New edge function `authority-evaluate` — given `(user_id, workspace_id, action_key)` returns `'auto'|'ask'|'block'` + reason. Called by `emitRegisteredTrustAction`.
- Extend `emitRegisteredTrustAction` to consult authority settings before requiring approval.

**Frontend:**
- `/trust/automation-authority` page — per-action and per-category sliders.
- `/trust/approvals` page — already exists, add filters by pillar/risk/workspace, expiry handling, bulk actions.
- `<TrustActionButton>` automatically reads authority + shows pre-action explainability ("This will be auto-executed because…").

**CI:** Coverage script now requires every direct `supabase.from(...).insert/update/delete` in `src/modules/**` to either be a registry-listed action or be tagged `// trust:read-only` in code. Baseline gap from 60 → 0 over the phase.

**Deployment gate:** Toggle authority for any of the 34 registry actions; verify auto/ask/block paths emit correctly-tiered receipts. CI blocks new mutations without registry entries.

---

## PHASE 3 — Health OS Pillar (Real Implementation, Not Greenfield)

**Goal:** Stand up Health OS to feature parity with Concierge OS scaffolding, with strictest privacy controls from day 1.

**Backend (new tables, all RLS-locked to owner only):**
- `health_profiles` (sex_at_birth, dob, blood_type, allergies, conditions — encrypted at rest via pgcrypto wrapper)
- `health_metrics` (timestamped: weight, hr_resting, hrv, sleep_hours, steps, vo2max, source ['manual'|'apple'|'oura'|'whoop'|'fitbit'|'garmin'])
- `health_nutrition_log`, `health_workouts`, `health_medications`, `health_appointments`, `health_symptoms`, `health_recovery_signals`
- `health_consents` (per-data-class explicit consent + retention preference)
- `wearable_connections` (provider, scopes, last_sync, status) — extends existing `connectors` infra

**Edge functions (new):**
- `health-wearable-sync` — pulls Apple Health/Oura/Whoop/Fitbit/Garmin via existing connector framework
- `health-receipt-emit` — wraps every health read/write in a `health.*` registry receipt
- `health-redact-pii` — DLP guard for any health data leaving the user's tenant

**Frontend:**
- Real pages at `src/modules/health/pages/`: `HealthOverview`, `NutritionLog`, `WearableSync`, `MedicalRecord`, `FitnessRoutines`, `RecoveryPanel`, `HealthPlanning`, `HealthReminders`, `SymptomLog`, `Performance` — all reading from new tables, no mocks.
- Health pillar appears in `/launcher`, dock, command palette.
- Health-specific advisor (registered in `advisor_registry`).

**Trust/safety:**
- Health workspace is `protected=true` by default → requires re-auth (passkey) to enter.
- Every health data access → receipt with `riskTier='high'`, no auto-approval ever for medical record reads.
- Memory writes from Health OS isolated to `memory_scope='isolated'`.

**CI:** New scanner `check-health-pii-leaks.ts` — fails if any health table column appears in a non-Health log/console/receipt payload.

**Deployment gate:** Full Health pillar bootable end-to-end with one wearable provider live; all writes trust-wrapped; pillar dashboard renders real data.

---

## PHASE 4 — AI Orchestration & Explainability Spine

**Goal:** Centralize AI invocation across all 4 modules through one orchestration layer with mandatory explainability and receipt emission.

**Backend:**
- New table `ai_invocation_plans` (correlation_id, user_id, workspace_id, module_id, mode ['chat'|'simulation'|'action'|'voice'|'recap'], model_choice, context_sources jsonb [memory_ids, file_ids, advisor_ids], assumptions, confidence_target, authority_check jsonb, created_at)
- New table `ai_explainability_traces` (invocation_id, source_type, source_id, weight, role) — what influenced the answer
- Extend existing `ai_inference_receipts` (already exists) with FK to `ai_invocation_plans`.

**Edge function:**
- New `ai-orchestrator` (replaces ad-hoc `supabase.functions.invoke('ai-gateway')` calls):
  1. Build invocation plan
  2. Resolve workspace + module context
  3. Pull memory/files/advisor context
  4. Authority check via Phase-2 engine
  5. Call ai-gateway
  6. Emit explainability trace + receipt
  7. Return shaped response by mode

**Frontend:**
- `src/modules/_shared/ai/useOrchestrator.ts` — single hook every chat/agent call must use.
- `<ExplainabilityPanel>` reusable component — reads traces, renders "what was used."
- Codemod across `src/pages/**` and `src/modules/**` replacing direct `ai-gateway` invokes (~100 sites) with `useOrchestrator`.

**CI:**
- Lint rule: direct `supabase.functions.invoke('ai-gateway'...)` outside `ai-orchestrator` fails.
- Manifest `public/generated/ai-orchestration-coverage.json`.

**Deployment gate:** All in-app AI calls flow through orchestrator; every response carries an explainability trace renderable on demand; receipts include `module_id` + `workspace_id`.

---

## PHASE 5 — Memory, Files & Knowledge Platform Hardening

**Goal:** Promote `pb_memories` + `pb_files` to true platform-wide, workspace-scoped, module-aware infra used by all 4 pillars.

**Backend:**
- Extend `pb_memories`: `module_id`, `workspace_id`, `confidence` numeric, `category`, `provenance` jsonb (chat_id|file_id|behavior), `last_used_at`, `sensitive` bool, `inferred` bool, `user_confirmed` bool.
- Extend `pb_files`: `module_id`, `workspace_id`, `sensitivity` ['public'|'internal'|'sensitive'|'restricted'], `processing_status`, `summary`, `embedding_status`, `access_log_count`.
- New table `file_access_logs` (file_id, user_id, action ['view'|'download'|'reprocess'|'delete'|'qna'], at).
- New table `memory_review_queue` (inferred memories awaiting user confirm).
- Edge function `file-ingest-pipeline` — unified PDF/DOCX/CSV/TXT/MD/image-OCR/audio-transcript pipeline, emits per-file processing receipts.

**Frontend:**
- `/files` (real Files Center) — workspace + module filters, sensitivity badges, ingestion status.
- `/personal-brain/memory` — review queue, confidence indicators, provenance, "should I remember this?" prompts, per-category disable, sensitive memory protection.

**Trust:**
- Sensitive file/memory access → registry actions `shared.file.access_sensitive`, `shared.memory.write_sensitive`.

**Deployment gate:** Upload/ingest/Q&A end-to-end across all 6 file types in one workspace; memory inferences land in review queue with provenance; every read of a sensitive item is audited.

---

## PHASE 6 — Voice & Multi-Modal Spine

**Goal:** Voice as a system capability with retention controls, workspace-aware behavior, and full receipt coverage.

**Backend:**
- Extend `pb_voice_prefs`: `retention_days`, `transcript_storage` ['none'|'session'|'persistent'], `default_mode` ['ptt'|'tap'|'always-on'], `voice_id`, `summary_on_end` bool.
- New table `voice_sessions` (user_id, workspace_id, started_at, ended_at, transcript_id?, summary_id?, device_id, modality ['mic'|'phone-handoff'|'wearable']).
- New table `voice_transcripts` (session_id, ts, role, text, redacted_text) — auto-redact via DLP.
- Extend orchestrator to accept `mode='voice'`.

**Frontend:**
- Voice settings page (under settings framework).
- HUD voice indicator binds to `voice_sessions`.
- Voice replays in workspace with permission check.

**Trust:** New registry actions `shared.voice.session_start`, `shared.voice.transcript_export`.

**Deployment gate:** Start/stop a voice session in any workspace, observe transcript persistence honored, receipt emitted, summary generated.

---

## PHASE 7 — Simulation, Advisors & Boardroom Wiring

**Goal:** Make `simulations` + `advisor_*` tables a first-class user-facing capability across all pillars.

**Backend:**
- Extend `simulations` with: `module_id`, `workspace_id`, `scenario_compare_group_id`, `assumptions` jsonb, `outcome_projections` jsonb, `confidence`, `recommendation_shift` jsonb.
- New table `simulation_compare_groups` (so 2-N scenarios can be compared side-by-side).
- Ensure every advisor in `advisor_registry` has: `applicable_modules[]`, `output_style`, `synthesis_role`.
- Edge function `simulation-run` — runs one scenario, returns projection + receipt; `simulation-compare` runs N in parallel.

**Frontend:**
- Reusable `<SimulationPanel>` and `<ScenarioCompare>` primitives in `_shared/ui/`.
- Each module gets a "Simulate" affordance in its overview page.
- Boardroom view shows advisor agreement/disagreement metadata from existing `advisor_board_recommendations`.

**Trust:** Simulations themselves are zero-receipt (read-only); promoting a simulation outcome to action goes through normal registry flow.

**Deployment gate:** Run a real "save vs spend vs invest" simulation in Finance, "ad spend vs hiring" in Business, "trip plan A/B" in Concierge, "routine A/B" in Health — all with side-by-side compare and explainability.

---

## PHASE 8 — Event Bus, Notifications, Lifecycle & Growth Wiring

**Goal:** Wire product behavior to the existing growth tables (`waitlist_signups`, `customer_lifecycle_stages`, `notifications`, `notification_preferences`) so onboarding, retention, and CRM are fully event-driven.

**Backend:**
- New table `platform_events` (event_type, user_id, workspace_id, module_id, payload, occurred_at, processed_at, idempotency_key) — single canonical event log.
- New table `event_subscriptions` (event_type → handler_fn, retries, dead_letter).
- Edge function `event-dispatcher` — pgnet-triggered, fan-outs to subscriptions, idempotent.
- Extend `customer_lifecycle_stages` with engagement_score formula updated by event handlers (`module_first_use`, `voice_first_use`, `receipt_first_view`, `approval_first_grant`, etc.).
- New table `email_automation_enrollments` (lifecycle automations: first-wave, beta, donor, investor, module-specific re-engagement).

**Frontend:**
- Notification center reads from existing `notifications` + `notification_preferences`; add per-module/per-workspace mute.
- Recap surfaces (weekly digests) — reuses existing `pb_digests`.

**Admin:**
- `/admin/lifecycle` — segment users by engagement, trigger manual or scheduled email automations.

**Deployment gate:** Performing key actions (workspace_create, file_upload, voice_use, approval_grant, simulation_run, health_connect) writes to `platform_events`, fires correct lifecycle stage transitions, and triggers correct emails (using `send-email` edge function which already exists).

---

## PHASE 9 — Security, Privacy, Devices & Global Search

**Goal:** Lock down the platform end-to-end and add OS-level discoverability.

**Security backend:**
- Extend `user_passkeys` flow: enforce passkey for protected workspaces (Health, anything `protected=true`).
- Extend `cloud_devices` + `cloud_device_sessions`: trusted-device flag, session revocation UI, suspicious-login alerts via `pb_security_events`.
- New table `data_export_requests`, `data_delete_requests` — GDPR-grade with receipts.
- New table `transcript_retention_overrides` for per-workspace voice/chat retention.
- Reduced-retention "ephemeral mode" toggle on workspace_contexts.

**Trust:** Registry adds `shared.passkey.remove`, `shared.device.revoke`, `shared.export.full_data`, `shared.delete.full_account` (all critical, all approval-required + 24h delay where appropriate).

**Search/Command:**
- New edge function `global-search` — federated search across files, memory, receipts, modules, projects, recent actions.
- Promote existing command palette to read from `module_registry` + global-search results + voice-trigger commands.

**Frontend:**
- `/settings/security` — passkeys, devices, sessions, suspicious activity, export/delete.
- Cmd+K palette with module launcher, project search, file search, memory search, quick-create per pillar.

**Deployment gate:** Add/remove passkey, revoke device, export data, delete account — all with receipts. Cmd+K finds everything. Suspicious login fires real alert.

---

## PHASE 10 — Admin Operations, Analytics, Dashboards & Reliability

**Goal:** Operate the platform seriously: admin views, instrumentation, dashboards, and observability.

**Analytics backend:**
- New table `product_analytics_events` (event_name, user_id, workspace_id, module_id, properties, session_id, occurred_at) — single funnel substrate.
- Auto-instrumentation hook `useAnalytics()` fires on: module entry, sub-app entry, app launch, workspace create, chat start, mode usage, file upload, voice session, memory save, inferred-pattern resolution, receipt view, approval flow, simulation run, advisor invocation, onboarding step, security setup, feature adoption.
- Materialized views: `mv_module_usage_daily`, `mv_funnel_onboarding`, `mv_retention_by_pillar`, `mv_feature_adoption`, `mv_wow_features`.

**Admin dashboards (under existing `/admin`):**
- `/admin/users`, `/admin/workspaces`, `/admin/modules`, `/admin/files`, `/admin/memory`, `/admin/receipts`, `/admin/approvals`, `/admin/security`, `/admin/workflows`, `/admin/lifecycle`, `/admin/email`, `/admin/feature-flags`, `/admin/audit`.
- Module health cards reading from `module_registry.health_status` + recent error_events.

**Module dashboards:**
- Each pillar gets a unified `<PillarDashboard>` aggregating: recent activity, recent receipts, active workspaces, learning momentum, outstanding approvals, suggested next actions, recent uploads, security reminders.
- Cross-pillar OS Home dashboard at `/` for authenticated users.

**Reliability/observability:**
- Extend existing `error_events` → tie to `platform_events`, `ai_invocation_plans`.
- Workflow failure tracking dashboard.
- E2E test suite (Vitest) covering: workspace isolation, receipt generation, approval flow, memory write/read, file ingestion, security event, session/device, analytics event verification, notification delivery.
- All new tables get RLS verification tests.

**Final gate (deployment-ready):**
- All 10 phases’ CI gates green (manifest freshness, trust coverage, route ownership, AI orchestration coverage, RLS lints, typecheck, e2e).
- Architectural-attestation umbrella signs the final state.
- Admin can see every user, every receipt, every approval, every event for any user, with full audit trail.

---

## Cross-cutting deliverables produced (mapped to your "Required Outputs")

| Output | Where it lands |
|---|---|
| A. Backend/platform architecture plan | This plan + `src/modules/_shared/MANIFEST.md` updates per phase |
| B. Data model | All migrations in `supabase/migrations/`, types auto-regen |
| C. Event/orchestration model | Phase 4 (`ai-orchestrator`) + Phase 8 (`platform_events`/`event-dispatcher`) |
| D. Trust/safety/authority model | Phase 2 (`automation_authority_settings`, expanded registry) |
| E. Personalization model | Phase 5 (memory provenance, module/workspace scope) |
| F. Growth/lifecycle integration | Phase 8 (lifecycle stages, email automations, engagement scoring) |
| G. Admin/ops plan | Phase 10 admin dashboards |
| H. Instrumentation/analytics plan | Phase 10 (`product_analytics_events`, materialized views) |
| I. Security/privacy plan | Phase 9 (passkeys, devices, export/delete, retention) |
| J. Implementation roadmap | This document |

---

## Phase boundary — explicit "100% done" checklist (applied to every phase)

A phase is **done** only when all of these are true:
1. ✅ All migrations applied, RLS enabled on every new table, RLS linter passes.
2. ✅ All edge functions deployed and reachable.
3. ✅ All new code reachable via the router; no orphan files.
4. ✅ `bunx tsc --noEmit` exits 0.
5. ✅ Trust action registry updated for any new mutations + manifest regenerated + diff CI green.
6. ✅ Phase-specific CI gate added and passing.
7. ✅ At least one real end-to-end smoke (described in each phase's "Deployment gate") works in preview.
8. ✅ Memory/index updated with any new platform rules.

Phase N+1 begins only after Phase N is fully signed off.

---

**Recommendation:** Approve and I will start with **Phase 1** (Identity, Workspace & Module Registry Foundation) — the substrate everything else depends on — and ship it complete before touching Phase 2.
