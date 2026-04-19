

The user wants me to implement "all fixes 100%" from the MASTER_REMEDIATION_BLUEPRINT_v1.md. That blueprint defines a 12-week, 16-phase, 50+ ticket program covering migrations, edge functions, validators, contracts, dashboards, runbooks, and ~6000 lines of execution work.

I cannot honestly claim to deliver all of that in a single pass. The right move is to scope a real, deployment-impactful slice that closes the most consequential gaps from the blueprint **truthfully**, then sequence the rest. I'll propose an executable Phase 0 → Phase 4 closure pack — the foundation everything else depends on — and be explicit about what stays deferred.

## Honest scoping

The blueprint's Phases 0–4 are the dependency root. If they don't ship, nothing downstream is real. Phases 5–15 either depend on them or are already closed (per prior audits: AI Runtime Truth, Connector Truth, Boardroom L7, Security Council, Kill-Switches, Runbooks all GREEN).

What's genuinely missing on disk (verified in earlier audit passes):
- No `evidence_graph_nodes` / `evidence_graph_edges` tables
- No `cron_run_receipts` table — cron firing is unproven
- No `release_decisions` table — release gate outcomes aren't persisted
- No `installed_apps_receipts` table — App Platform install lifecycle has no proof
- No `advisor_action_proof_packs` table — advisor actions lack reversibility receipts
- No `kill_switch_ttl_expiry_receipts` table — TTL claims unproven
- No `evidence-graph-builder`, `cron-receipt-collector`, `app-manifest-verifier` edge functions
- Several Phase 0/1 validators (`check-canonical-paths`, `check-5-plane-boundaries`, `check-evidence-graph-completeness`, `check-cron-execution-evidence`, `check-release-decision-persistence`) don't exist

## Plan: Phase 0–4 Closure Pack

### Phase A — Truth-Persistence Migrations (1 migration, 6 tables)
Create one consolidated migration `add_evidence_persistence_layer` with:
- `evidence_graph_nodes` (id, kind, ref, owner, created_at) + RLS admin-read
- `evidence_graph_edges` (id, from_node, to_node, relation, created_at) + RLS
- `cron_run_receipts` (id, job_name, started_at, finished_at, status, payload jsonb) + RLS
- `release_decisions` (id, release_id, gate_name, decision, evidence jsonb, decided_at, decided_by) + append-only via trigger
- `installed_apps_receipts` (id, app_id, user_id, action enum[install,uninstall,update], manifest_hash, occurred_at) + RLS owner-scoped
- `advisor_action_proof_packs` (id, action_id, advisor_id, evidence jsonb, reversible bool, rollback_token, created_at) + RLS
- `kill_switch_ttl_expiry_receipts` (id, switch_id, expired_at, expired_by_actor, prior_state jsonb) append-only

All tables use `gen_random_uuid()` defaults, security-definer helper functions where role-checks needed, and the established `has_admin_permission` pattern. No CHECK constraints on time-based fields — use validation triggers per project rules.

### Phase B — Evidence/Cron Edge Functions (3 functions)
- `evidence-graph-builder` — reads manifests from `generated/manifest-registry.json`, scans validator outputs, populates `evidence_graph_nodes` + `evidence_graph_edges`. Service-role, callable by aggregator.
- `cron-receipt-collector` — pg_cron job calls this every 5m to persist its own heartbeat + sweep recent job logs into `cron_run_receipts`.
- `app-manifest-verifier` — verifies ed25519 manifest signatures for App Platform installs, writes `installed_apps_receipts` row on success.

All three: `verify_jwt = false` for cron callers, in-code service-role validation, CORS headers from `@supabase/supabase-js/cors`, Zod input validation.

### Phase C — Phase 0/1/4 Validators (5 new scripts)
Add to `scripts/architecture/checks/`:
- `check-canonical-paths.ts` — asserts `src/lib/architecture/`, `src/lib/runtime/desktop/`, `src/lib/nova-sdk/`, `electron/security/`, `os/runtime/`, `supabase/functions/` exist with expected sentinel files. BLOCK.
- `check-5-plane-boundaries.ts` — re-runs `route-plane-map.ts` + `app-plane-map.ts` parse, fails on routes/apps without plane assignment. BLOCK.
- `check-evidence-graph-completeness.ts` — queries `evidence_graph_nodes` count vs `manifest-registry.json` entry count; fails if <90% coverage. BLOCK at YELLOW threshold, WARN below.
- `check-cron-execution-evidence.ts` — queries `cron_run_receipts` for last-24h entries per declared schedule in §64; fails if any job missing. BLOCK.
- `check-release-decision-persistence.ts` — verifies the master aggregator's last run wrote a `release_decisions` row. WARN initially, BLOCK after 7 days.

Wire all five into `scripts/architecture/checks/run-all.ts` and the master aggregator at `scripts/architecture/checks/check-os-release-readiness.ts`.

### Phase D — Aggregator Wiring + Generated Artifacts
- Update `check-os-release-readiness.ts` to invoke the 5 new validators and persist a `release_decisions` row via service-role on completion.
- Generate `generated/evidence-persistence-layer-status.json` documenting the 6 new tables, RLS coverage, owner mapping.
- Generate `generated/master-remediation-progress.json` with the closure-pack execution status (Phase A–D done, Phase 5–15 deferred with reasons).
- Mirror both to `public/generated/`.

### What stays honestly deferred
- Phases 5–15 ticket execution (Advisor Boardroom 16-tab cockpit hardening, Onboarding 29-screen telemetry, Mobile-deferral hardening beyond what's archived, App SDK plugin/widget extension manager, Owner Copilots, Federation, DR drill expansion). These are real work; they don't get pretended-done.
- AI Runtime 7-day clean-streak — calendar-bound, can't be force-finished.
- Apple/Play account procurement — externally blocked.

### Discipline
- 1 migration (the 6-table evidence persistence layer)
- 3 edge functions (evidence-graph-builder, cron-receipt-collector, app-manifest-verifier)
- 5 validators
- 2 generated status JSONs (+ mirrors)
- 1 aggregator wiring update
- 0 changes to `App.tsx`, `client.ts`, `types.ts`, or `config.toml` project block
- 0 false-green status flips

### Acceptance
- Migration applies cleanly with RLS on all 6 tables, security-definer helpers in place
- 3 edge functions deploy successfully, return 200 on smoke calls
- 5 validators run via `npx tsx`; new ones at `offenders=0` after first cron-receipt-collector run; release-decision validator at WARN
- Master aggregator runs end-to-end, persists a `release_decisions` row, count goes from 213→218 gates, 0 new errors
- `generated/master-remediation-progress.json` honestly lists Phase A–D shipped + Phase 5–15 outstanding

After this lands the user gets the next closure pack (Phase 5–7: AI receipt hardening, connector reauth UX, security-fabric runtime probes) as a separate approved scope.

