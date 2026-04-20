# SITA OS — MASTER REMEDIATION BLUEPRINT v1.0
**Document class:** Execution-grade build-to-closure plan
**Authority:** Implementation-first; converts ONE_MASTER_SITA_AUDIT_v3.md into actionable tickets
**Generated:** 2026-04-19
**Audience:** Engineering leads, plane owners, release captains
**Source spec:** `docs/audits/ONE_MASTER_SITA_AUDIT_v3.md` (64 sections + 4 appendices)
**Verification basis:** Repo spot-check on 2026-04-19 — 173 edge functions confirmed, 433 generated artifacts confirmed, 170 architecture checks confirmed, 7 claimed meta-validators **NOT all present** (only `check-5-plane-boundaries.ts` and `check-deployment-profile-coverage.ts` exist by claimed name); `electron/security/` directory **does not exist** — security modules are flat in `electron/`.

> This is not an audit. This is a build plan. Every item ends in a deliverable.

---

## TABLE OF CONTENTS

1. **Master Fix Strategy**
2. **Phased Fix Plan** (Phase 0 → Phase 15)
3. **Section-by-Section Fixes** (§1 → §64)
4. **Exact Wiring Instructions** (FE / BE / DB / Runtime-OS / Evidence)
5. **Files, Artifacts, and Modules to Create**
6. **Validators and Gates to Implement**
7. **Migrations, Edge Functions, and Contracts**
8. **Execution Backlog** (tickets grouped by phase)
9. **30 / 60 / 90 Day Build Sequence**

---

# PART 1 — MASTER FIX STRATEGY

## 1.1 Verdict

The v3 audit is **structurally credible but evidentially overstated** in five places. Closure is achievable in 90 days if we execute in dependency order. The Composite Truth Index of 95.1 is aspirational until the seven claimed meta-validators actually exist and run green.

## 1.2 Top 20 Fixes — Do These First (in this order)

| # | Fix | Why | Owner |
|---|---|---|---|
| 1 | Create the 7 claimed meta-validators that don't exist on disk | Audit cites them as proof; only 2 of 7 exist | Architecture |
| 2 | Move `electron/*-guard.cjs`, `*-shield.cjs`, `*-sentinel.cjs` into `electron/security/` and re-export | Audit claims path that doesn't exist | Security |
| 3 | Persist 5-plane membership for every route via runtime probe (not just registry) | `route-plane-map.ts` is declarative; no runtime proof | Architecture |
| 4 | Promote `check-deployment-profile-coverage.ts` from declarative to runtime-resolved | Profile-aware nav must be proved by hook execution | Shell-Runtime |
| 5 | Implement `check-final-runtime-proof.ts` — boots Electron in CI headless, asserts heartbeat written | Audit claim §53 unproven | Runtime |
| 6 | Implement `check-manifest-truth-coverage.ts` — every artifact in `generated/` resolves to a registry entry | §7 framework needs binding gate | Architecture |
| 7 | Implement `check-frontend-truth-backing.ts` — every `StatusBadge`/`AITruthDisclosure` consumer has a backing receipt query | App. A claim of 100 needs proof | Frontend |
| 8 | Implement `check-evidence-graph-completeness.ts` — every claim in audit resolves to an artifact path | §48 truth index needs computable proof | Governance |
| 9 | Wire `ai-runtime-nightly-verify` to write to `ai_runtime_streak_state` and expose 7-day streak in `/admin/ai-runtime` | §24 streak must be computable, not narrative | AI Runtime |
| 10 | Stand up `connector-truth-nightly` as a real cron, not a script | §25 closure requires nightly artifact | Connectors |
| 11 | Publish `runbook-link-coverage` validator — every `raiseAlert` callsite resolves to a runbook id | §61 claim of integration unproven | Operator |
| 12 | Publish `kill-switch-ttl-enforcement` validator + `kill_switch_audit_log` retention job | §61 TTL claim has no enforcement gate | Security |
| 13 | Add `app-install-lifecycle-proof` validator — every install row has receipt + reversibility | §22 needs lineage proof | App Platform |
| 14 | Add `advisor-action-proof-pack` generator — emits per-action proof bundle (request, simulation, receipt, reversal) | §58 claim of proof+reversibility | Advisor |
| 15 | Add `onboarding-branch-completion` telemetry table + validator | §63 branching has no measurable proof | Onboarding |
| 16 | Add `deployment-profile-build-matrix` — CI emits ISO/IMG/OVA per profile with manifest | §51 build matrix unproven | Release |
| 17 | Promote AI Runtime hub from claimed-22 to **actually 22** by binding the missing 4 boards (Drift, Kill-Switches, Runbooks, Frontend Truth-Backing) into `AIRuntimeHome.tsx` | App. B claim | Frontend |
| 18 | Stand up `mobile-deferment-readiness` truth panel — surfaces what is engineering-complete vs account-blocked | Launch honesty §47 | Mobile |
| 19 | Wire 9-gate Sovereign AI Gateway (§34, §59) as a single typed pipeline, not 9 scattered checks | Currently scattered across edge functions | AI Runtime |
| 20 | Create `final-launch-honesty-matrix.json` generator + validator | §47 currently a hand-edited table | Governance |

## 1.3 Top Dependency Chains

```
Chain A — Truth Closure (longest critical path)
  manifest-registry.ts complete ownership
    → check-manifest-truth-coverage.ts
      → check-evidence-graph-completeness.ts
        → final-launch-honesty-matrix.json
          → release-readiness-aggregator.json fully GREEN

Chain B — Runtime Proof
  Electron headless CI harness
    → check-final-runtime-proof.ts
      → shell-watchdog heartbeat ingest validator
        → §53 closure

Chain C — AI Runtime Truth
  ai_runtime_nightly_runs table populated
    → ai_runtime_streak_state computed
      → 7-day clean streak achieved
        → §24 closure (Yellow→Green)

Chain D — Connector Truth
  Real refresh path receipts (Google/MS/Slack)
    → connector-truth-nightly cron
      → connector_truth_status table
        → §25 closure

Chain E — App Platform
  app_registry + installed_apps RLS proven
    → app-install-lifecycle-proof validator
      → app-launch-resolver receipts
        → §22, §55, §56 closure

Chain F — Advisor Boardroom
  advisor_board_actions + receipts persisted
    → advisor-action-proof-pack generator
      → 9-gate pipeline as typed module
        → §58, §59 closure
```

## 1.4 What Is Probably Missing Despite Being Claimed

| Claim (audit §) | Likely gap | Evidence |
|---|---|---|
| §4 — "124 BLOCK gates + 7 meta-validators" | 5 of 7 meta-validators missing | Filesystem scan returned only 2 by name |
| §7 — "Manifest Truth Framework" | No `check-manifest-truth-coverage.ts` validator on disk | Filesystem scan |
| §10 — "App. A truth-backing 100" | No runtime gate that asserts every primitive consumer has receipt query | Search of `scripts/` |
| §17 — "5-Layer Service Constitution" with cross-layer block | Boundary guard is for planes, not for service layers | `check-5-plane-boundaries.ts` exists; no `check-service-layer-boundaries.ts` |
| §22 — "Real install lifecycle (no mocks)" | No proof bundle per install | No `installed_apps_receipts` table observed |
| §24 — "7-day clean streak required" | Streak computation not surfaced as gate | No streak validator on disk |
| §39 — "TPM 2.0 PCR sealing" | TPM-absent fallback path needs evidence file | Not in `generated/trusted-boot/` |
| §53 — "Heartbeat 5s + watchdog 3s backoff" | No CI gate that boots Electron and asserts the heartbeat file ticks | No headless harness |
| §54 — "5 OS daemons" | Daemons enumerated but no `check-platform-daemons-health.ts` | No validator |
| §55 — "App SDK ed25519 manifest signing" | No `check-app-manifest-signature.ts` validator | No validator |
| §61 — "TTL auto-expire" | TTL field exists but no enforcement cron + receipt | No expiry receipts |
| §63 — "29 first-use screens with branching" | Branching has no completion telemetry | No `onboarding_branch_completion` table |
| §64 — "Cron schedule" | No `cron_run_receipts` table proving execution | No receipts |
| App. B — "22-tab AI Engineer hub" | 18 board files in `src/pages/admin/ai-runtime/`; remaining 4 tabs likely inline-only | Filesystem |

## 1.5 What Can Be Hardened (Better-Than-Claimed)

1. **Service-layer guard** — extend plane guard to enforce 5-layer downward-only authority.
2. **Single typed `AIGatewayPipeline`** — collapse the 9 gates into one composable pipeline with proof emission.
3. **Receipt-backed UI** — every `<StatusBadge>` requires a `proofRef` prop, not optional.
4. **Profile-aware preload** — Electron preload reads deployment profile, restricts IPC method groups per profile.
5. **Cron-receipt table** — every scheduled job writes `cron_run_receipts(job_id, started_at, finished_at, outcome, artifact_ref)`.
6. **Evidence graph** — JSON graph of `claim → artifact → validator → gate` published at `generated/evidence-graph.json`, rendered in `/admin/verification`.
7. **Append-only `release_decisions` table** — every promote/rollback writes a signed row; surfaces in `/admin/releases`.
8. **Trust ledger** — EWMA trust scores per advisor persisted nightly to `advisor_trust_ledger`.

## 1.6 What Must Remain Honestly Deferred

| Surface | Posture | Reason | Reactivation gate |
|---|---|---|---|
| Capacitor / iOS / Android distribution | Honestly deferred | Account-blocked, not engineering-blocked | Apple Dev + Play Console enrollment |
| OVA hardware compatibility matrix breadth | Partial | Hardware vendor coverage cost | Procurement decision |
| Owner Copilot federation across tenants (§60 phase 7) | Future | Multi-tenant isolation work outstanding | Phase 7 prerequisites green |
| External API workforce federation (§60 phase 8) | Future | External SLOs out of scope until phase 7 | Phase 8 design |
| Tenant Console + Compliance Attestation (§60 phase 9) | Future | Regulatory framework choice pending | Compliance-officer hire |

---

# PART 2 — PHASED FIX PLAN

Each phase has: Objective · Systems · Files · New artifacts · Validators · Generated outputs · Release gates · Acceptance criteria · Dependencies.

---

## Phase 0 — Canonicalization & Truth-Source Consolidation

**Objective.** One name, one path, one owner per registry. Eliminate "claim path doesn't exist" drift.

**Systems modified.** `manifest-registry.ts`, `src/lib/architecture/`, `electron/`, `os/runtime/`, `scripts/architecture/`, `scripts/registry/`.

**Files touched.**
- `src/lib/architecture/manifest-registry.ts`
- `src/lib/architecture/canonical-paths.ts` (NEW)
- Move `electron/runtime-shield.cjs`, `electron/dlp-guard.cjs`, `electron/network-sentinel.cjs`, `electron/license-guard.cjs`, `electron/integrity-check.cjs` → `electron/security/`
- Update `electron/main.cjs` and `electron/preload.cjs` requires
- `scripts/architecture/checks/check-canonical-paths.ts` (NEW)

**New artifacts.**
- `generated/canonical-paths.json` — single source of every claimed path with on-disk truth
- `generated/manifest-ownership.json` — every manifest file has owner + validator + gate

**Validators added.**
- `check-canonical-paths.ts` (BLOCK) — every entry in `canonical-paths.ts` exists on disk
- `check-manifest-ownership-completeness.ts` (BLOCK) — no manifest without owner

**Generated outputs.** `generated/canonical-paths-report.json`, `generated/manifest-ownership-report.json`.

**Release gates.** Both new validators added to `release-readiness-aggregator`.

**Acceptance criteria.**
- Zero canonical path drift.
- Every artifact in `generated/` listed in `manifest-registry.ts`.
- v3 audit citation paths resolve 1:1 to disk.

**Dependencies.** None. This is foundational.

---

## Phase 1 — Architecture Boundaries & Registry Closure

**Objective.** Make plane + service-layer boundaries provable at CI time, not just declared.

**Systems.** Plane guard, service constitution, contracts.

**Files.**
- `scripts/architecture/checks/check-5-plane-boundaries.ts` (HARDEN — add import-graph proof)
- `scripts/architecture/checks/check-service-layer-boundaries.ts` (NEW — 5-layer downward-only)
- `src/packages/contracts/index.ts` (HARDEN — assert no runtime imports)
- `scripts/architecture/checks/check-contracts-typeonly.ts` (NEW)
- `src/lib/services/service-facade.ts` (HARDEN — barrel completeness)

**New artifacts.**
- `generated/plane-import-graph.json`
- `generated/service-layer-import-graph.json`

**Validators.**
- `check-service-layer-boundaries.ts` (BLOCK)
- `check-contracts-typeonly.ts` (BLOCK)
- `check-service-facade-completeness.ts` (WARN→BLOCK after 7 days)

**Acceptance.** Cross-layer upward import = CI fail. Contract package zero runtime deps.

**Dependencies.** Phase 0.

---

## Phase 2 — Route, Shell & Deployment-Profile Wiring

**Objective.** Every route resolves to a plane AND a profile AND a real lazy-loaded module; ShellComposer proves it at runtime.

**Files.**
- `src/lib/architecture/route-plane-map.ts` (HARDEN — assert lazy import resolves)
- `src/lib/runtime/desktop/DeploymentProfile.ts` (NEW or canonicalize)
- `src/components/shell/ShellComposer.tsx` (HARDEN — read `/etc/sita/deployment-profile.json` via IPC)
- `src/hooks/useRouteVisibleInProfile.ts` (HARDEN)
- `scripts/architecture/checks/check-route-resolution.ts` (NEW)
- `scripts/architecture/checks/check-shell-profile-home.ts` (NEW)

**New artifacts.**
- `generated/route-resolution-report.json`
- `generated/profile-home-resolution.json`

**Validators.**
- `check-route-resolution.ts` (BLOCK) — every route imports a real module
- `check-shell-profile-home.ts` (BLOCK) — `sita-os-user` → `/desktop`, `sita-os-operator` → `/admin`
- `check-deployment-profile-coverage.ts` (already exists — HARDEN to read manifest)

**Release gates.** Block release if any route in `route-plane-map.ts` 404s.

**Acceptance.** Booting either profile lands on the correct home with zero runtime warnings.

**Dependencies.** Phase 1.

---

## Phase 3 — Frontend Truth Primitives & UX Honesty Closure

**Objective.** Every status, trust, and AI claim in the UI is receipt-backed and validated.

**Files.**
- `src/components/primitives/StatusBadge.tsx` (HARDEN — `proofRef: string` becomes required)
- `src/components/primitives/AITruthDisclosure.tsx` (HARDEN — render evidence grade A–F)
- `src/lib/copy/trust-copy-map.ts` (HARDEN — every key emits resolved string + source)
- `src/components/primitives/EvidenceLink.tsx` (HARDEN — link must resolve to artifact path)
- `scripts/architecture/checks/check-frontend-truth-backing.ts` (NEW — replaces claim)
- `scripts/architecture/checks/check-evidence-link-resolvability.ts` (NEW)

**New artifacts.**
- `generated/frontend-truth-backing-report.json`
- `generated/evidence-link-resolvability-report.json`

**Validators.**
- `check-frontend-truth-backing.ts` (BLOCK) — no `<StatusBadge>` without `proofRef`
- `check-trust-copy-coverage.ts` (BLOCK)
- `check-provenance-chip-coverage.ts` (WARN→BLOCK)
- `check-ai-truth-disclosure-presence.ts` (BLOCK on AI surfaces)
- `check-evidence-link-resolvability.ts` (BLOCK)
- `check-status-tone-consistency.ts` (BLOCK)

**Acceptance.** App. A claim of "100" resolves to validator green, not narrative.

**Dependencies.** Phase 0.

---

## Phase 4 — DB, Contracts, BFFs, Edge Functions & Orchestration Closure

**Objective.** Every UI surface that consumes AI/connector/admin data resolves through a typed BFF; orchestration has a single choke point.

**Migrations.**
- `installed_apps_receipts` (NEW)
- `cron_run_receipts` (NEW)
- `release_decisions` (NEW, append-only)
- `advisor_trust_ledger` (NEW)
- `evidence_graph_nodes` + `evidence_graph_edges` (NEW)
- `onboarding_branch_completion` (NEW)
- `connector_truth_status` (NEW)

**Edge functions.**
- `admin-bff-gateway` — already canonical; HARDEN with caller-class enforcement
- `agent-executor` — already sole orchestrator; HARDEN with kill-switch interceptor
- `evidence-graph-builder` (NEW)
- `cron-receipt-collector` (NEW)
- `release-decision-recorder` (NEW)

**Validators.**
- `check-bff-caller-class.ts` (BLOCK) — Runtime functions reject Public BFF callers
- `check-orchestration-choke-point.ts` (BLOCK) — only `agent-executor` may dispatch agent runs
- `check-receipts-completeness.ts` (BLOCK)

**Acceptance.** Every action in the UI traces to a receipt row; orchestration cannot be bypassed.

**Dependencies.** Phases 0–3.

---

## Phase 5 — AI Runtime, Provider Routing, Receipts, Verifier Closure

**Objective.** Move §24 from Yellow → Green by computing the 7-day streak as a gate.

**Files.**
- `supabase/functions/ai-runtime-nightly-verify/index.ts` (HARDEN — write to `ai_runtime_streak_state`)
- `src/pages/admin/ai-runtime/StreakBoard.tsx` (NEW)
- `scripts/validation/check-ai-runtime-streak.ts` (NEW)
- `src/lib/ai/AIGatewayPipeline.ts` (NEW — collapses 9 gates)

**Migrations.**
- `ai_runtime_streak_state` (NEW or HARDEN existing)
- `ai_runtime_nightly_runs` (HARDEN)

**Validators.**
- `check-ai-runtime-streak.ts` (WARN until streak ≥7, BLOCK after)
- `check-ai-receipts-and-fallback.ts` (BLOCK) — every invocation has receipt + fallback ledger
- `check-ai-cost-ceiling.ts` (BLOCK) — per-invocation ≤$0.005

**Generated outputs.** `generated/ai-runtime-truth-closure/streak.json` daily.

**Acceptance.** 7 consecutive nightly runs all green → §24 closes.

**Dependencies.** Phase 4.

---

## Phase 6 — Connectors, Refresh Flows & Truth Closure Hardening

**Objective.** §25 backed by nightly artifact and per-provider state machine.

**Files.**
- `supabase/functions/connector-truth-nightly/index.ts` (NEW or HARDEN)
- `supabase/functions/google-oauth-refresh/index.ts`
- `supabase/functions/microsoft-graph-refresh/index.ts`
- `supabase/functions/slack-oauth-refresh/index.ts`
- `src/pages/admin/integrations/ConnectorTruthBoard.tsx` (NEW)

**Migrations.**
- `connector_truth_status(provider, state, last_proved_at, evidence_ref)` (NEW)

**Validators.**
- `check-connector-truth-nightly.ts` (BLOCK)
- `check-connector-state-machine.ts` (BLOCK) — only success/degraded/reauth-required/failing

**Acceptance.** Nightly cron writes a row per provider; UI reflects state with EvidenceLink.

**Dependencies.** Phase 4.

---

## Phase 7 — Security Fabric, Trust Chain, Kill-Switches, Runbooks

**Objective.** §34, §50, §61 all CI-proven; security modules at canonical path.

**Files.**
- Move flat `electron/*-{shield,guard,sentinel}.cjs` → `electron/security/`
- `electron/security/index.cjs` (NEW barrel)
- `src/lib/security/ai-output-firewall.ts` (HARDEN)
- `src/lib/security/session-threat-detector.ts` (HARDEN)
- `src/lib/security/secure-memory-vault.ts` (HARDEN)
- `os/scripts/sita-verify-rootfs` (HARDEN — emit PCR map evidence)
- `scripts/validation/check-trusted-boot-evidence.ts` (NEW)
- `scripts/validation/check-kill-switch-ttl.ts` (NEW)
- `scripts/validation/check-runbook-link-coverage.ts` (NEW)

**Migrations.**
- `kill_switch_audit_log` (HARDEN — TTL enforcement)
- `kill_switch_ttl_expiry_receipts` (NEW)

**Validators.**
- `check-trusted-boot-evidence.ts` (BLOCK on appliance build)
- `check-kill-switch-ttl.ts` (BLOCK)
- `check-runbook-link-coverage.ts` (BLOCK) — every `raiseAlert` has runbook id
- `check-security-fabric-init.ts` (BLOCK) — all 7 layers init at boot

**Acceptance.** PCR map artifact present, TTL receipts written nightly, every alert links to a runbook.

**Dependencies.** Phase 0 (path canonicalization).

---

## Phase 8 — Desktop Host, Watchdog, Daemons, Nova SDK & Runtime Closure

**Objective.** §49–§54 proven by booting Electron headless in CI.

**Files.**
- `src/lib/runtime/desktop/DesktopHostContract.ts` (HARDEN)
- `src/lib/runtime/desktop/ElectronBridgeContract.ts` (HARDEN — 22 typed method groups)
- `src/lib/nova-sdk/kernel/boot/` (HARDEN — emit boot-trace artifact per phase)
- `os/runtime/shell-watchdog.sh` (HARDEN — emit `/var/lib/sita/state/watchdog-events.log`)
- `os/runtime/check-shell-health.sh` (HARDEN)
- `scripts/ci/electron-headless-harness.ts` (NEW)
- `scripts/validation/check-final-runtime-proof.ts` (NEW)
- `scripts/validation/check-platform-daemons-health.ts` (NEW)

**New artifacts.**
- `generated/runtime-proof/electron-boot-trace.json`
- `generated/runtime-proof/heartbeat-tick.json`
- `generated/runtime-proof/daemon-status.json`

**Validators.**
- `check-final-runtime-proof.ts` (BLOCK) — boot Electron headless, assert heartbeat ticks
- `check-platform-daemons-health.ts` (BLOCK)
- `check-nova-boot-phases.ts` (BLOCK) — all 4 phases emit trace

**Acceptance.** CI run produces boot trace + heartbeat + daemon-status artifacts every release.

**Dependencies.** Phase 0, 2.

---

## Phase 9 — App Platform, App SDK, Standalone Windows & Install/Launch Lifecycle

**Objective.** §22, §55, §56, §57 backed by install receipts and signed manifests.

**Files.**
- `src/lib/nova-sdk/app/manifest.schema.ts` (NEW)
- `src/lib/nova-sdk/app/Lifecycle.ts` (HARDEN — formal state machine)
- `src/lib/nova-sdk/app/launch-resolver.ts` (HARDEN)
- `supabase/functions/app-ingest-web/index.ts` (HARDEN)
- `supabase/functions/app-ingest-pwa/index.ts` (HARDEN)
- `scripts/validation/check-app-manifest-signature.ts` (NEW)
- `scripts/validation/check-app-install-lifecycle.ts` (NEW)

**Migrations.**
- `installed_apps_receipts(install_id, app_id, action, actor, receipt_hash, created_at)` (NEW)
- `app_launch_receipts` (NEW)

**Validators.**
- `check-app-manifest-signature.ts` (BLOCK) — every app manifest ed25519-signed
- `check-app-install-lifecycle.ts` (BLOCK) — install/uninstall has reversibility receipt

**Acceptance.** Every install action persists a receipt; manifest sig verified at install.

**Dependencies.** Phase 4.

---

## Phase 10 — Advisor Boardroom, Autonomous Advisors & Workforce Roadmap Foundations

**Objective.** §58–§60 backed by per-action proof packs and a single 9-gate pipeline.

**Files.**
- `src/lib/ai/AIGatewayPipeline.ts` (NEW — Phase 5 dependency)
- `src/lib/advisors/proof-pack-builder.ts` (NEW)
- `supabase/functions/agent-executor/index.ts` (HARDEN — emit proof pack)
- `src/pages/business/boardroom/ProofPackBrowser.tsx` (NEW)
- `scripts/validation/check-advisor-action-proof.ts` (NEW)

**Migrations.**
- `advisor_trust_ledger(advisor_id, day, ewma_score, sample_count)` (NEW)
- `advisor_action_proof_packs(action_id, request, simulation, receipt, reversal)` (NEW)

**Validators.**
- `check-advisor-action-proof.ts` (BLOCK) — every executed action has proof pack
- `check-advisor-trust-ledger.ts` (WARN) — EWMA computed nightly

**Acceptance.** Browse any advisor action → see request → simulation → receipt → reversal artifact.

**Dependencies.** Phases 4, 5.

---

## Phase 11 — Admin IA, Operator Workflows, Observability & Support Tooling

**Objective.** §38, §62 — 12 domains and 8 workflows are real surfaces, not aspirational.

**Files.**
- `src/components/admin/AdminControlPlaneShell.tsx` (CANONICAL — deprecate legacy shells)
- `src/pages/admin/operator/OperatorHome.tsx` (NEW)
- `src/pages/admin/operator/IncidentTriage.tsx` etc. (8 workflow pages, HARDEN existing)
- `scripts/validation/check-admin-ia-coverage.ts` (NEW)
- `scripts/validation/check-operator-workflow-coverage.ts` (NEW)
- `scripts/support/diagnostics/ops-build-diagnostic-bundle.ts` (HARDEN — already exists)

**Validators.**
- `check-admin-ia-coverage.ts` (BLOCK) — all 12 domains have a route
- `check-operator-workflow-coverage.ts` (BLOCK) — all 8 workflows have an entry surface
- `check-legacy-admin-shell-deprecation.ts` (WARN→BLOCK)

**Acceptance.** Operator profile loads `OperatorHome` with all 8 workflow tiles populated.

**Dependencies.** Phase 2.

---

## Phase 12 — Onboarding, Journeys, Lifecycle Continuity & First-Use Closure

**Objective.** §29, §63 — branching has telemetry; reflective copy is real.

**Files.**
- `src/lib/onboarding/branch-resolver.ts` (HARDEN)
- `src/lib/onboarding/reflective-copy-engine.ts` (HARDEN)
- `supabase/functions/onboarding-progress-recorder/index.ts` (NEW)
- `src/pages/admin/onboarding/OnboardingHealthBoard.tsx` (NEW)
- `scripts/validation/check-onboarding-branch-completion.ts` (NEW)
- `scripts/validation/check-onboarding-screen-coverage.ts` (NEW)

**Migrations.**
- `onboarding_branch_completion(session_id, branch, depth, completed_at, drop_off_screen)` (NEW)
- `onboarding_screen_telemetry(session_id, screen_id, entered_at, exited_at, choice)` (NEW)

**Validators.**
- `check-onboarding-branch-completion.ts` (BLOCK) — completion ≥ X% per branch (initial: 0% allowed, ratchet upward)
- `check-onboarding-screen-coverage.ts` (BLOCK) — all 29 screens reachable from branch tree

**Acceptance.** `/admin/onboarding-health` shows live funnel per branch.

**Dependencies.** Phase 4.

---

## Phase 13 — Mobile Deferment Hardening & Future Launch Path

**Objective.** Honest deferment with a one-day reactivation path when accounts arrive.

**Files.**
- `docs/MOBILE_HONESTY.md` (KEEP)
- `generated/mobile-deferment-readiness.json` (NEW — engineering-complete vs account-blocked)
- `src/pages/admin/mobile/MobileScopeTruth.tsx` (HARDEN)
- `archive/capacitor/REACTIVATION_RUNBOOK.md` (HARDEN)
- `scripts/validation/check-mobile-deferment-honesty.ts` (NEW)

**Validators.**
- `check-mobile-archived-scope.ts` (already exists — KEEP)
- `check-no-active-native-mobile-claims.ts` (already exists — KEEP)
- `check-mobile-deferment-honesty.ts` (NEW) — mobile UI surfaces all label deferred state

**Acceptance.** Operator can read in 60 seconds: what works, what's archived, what's needed to reactivate.

**Dependencies.** None.

---

## Phase 14 — Release Aggregator, Evidence Graph & Final Production Closure

**Objective.** Composite Truth Index becomes computed, not narrated.

**Files.**
- `scripts/release/build-release-readiness-aggregator.ts` (HARDEN — emit signed JSON)
- `scripts/release/build-evidence-graph.ts` (NEW)
- `scripts/validation/check-evidence-graph-completeness.ts` (NEW)
- `src/pages/admin/verification/EvidenceGraphViewer.tsx` (NEW)
- `scripts/release/build-launch-honesty-matrix.ts` (NEW)

**New artifacts.**
- `generated/evidence-graph.json`
- `generated/release-readiness-aggregator.json` (HARDEN — signed)
- `generated/launch-honesty-matrix.json`

**Validators.**
- `check-evidence-graph-completeness.ts` (BLOCK)
- `check-final-gate-meaningfulness.ts` (BLOCK) — every gate either BLOCKs or has a documented WARN-bucket
- `check-launch-honesty-matrix.ts` (BLOCK)

**Acceptance.** Release captain views one dashboard; every claim in v3 audit links to artifact + validator + gate.

**Dependencies.** All prior phases.

---

## Phase 15 — Better-Than-Claimed Upgrades

**Objective.** Once green, raise the floor.

**Adds.**
- Profile-aware Electron preload (restrict IPC method groups by profile).
- Trust ledger publication to operator surface.
- Receipt-required `<StatusBadge proofRef>` (not optional).
- Cron-receipt table for every scheduled job.
- Append-only `release_decisions` ledger.
- Auto-generated runbook stubs for any new alert without one.
- Service-layer downward-only enforcement.

**Acceptance.** Each upgrade ships a validator + dashboard tile.

**Dependencies.** Phases 0–14 green.

---

# PART 3 — SECTION-BY-SECTION FIXES (§1 → §64)

> Format per section: Keep · Fix Now · Harden Next · Closure Proof.

---

## §1 — Posture
**Keep.** Substrate (Ubuntu 24.04 + 6.8 HWE), userland (Nova Runtime SDK), backend (Lovable Cloud), platform-scope doc.
**Fix now.** Add `generated/posture-snapshot.json` emitted weekly with each row in §1 table tied to an artifact. Replace narrative `Composite Truth Index 95.1/100` with computed value from `evidence-graph.json`.
**Harden next.** Sign posture snapshot with release key.
**Closure proof.** `posture-snapshot.json` exists, signed, under 7 days old, every dimension has artifact ref.

## §2 — Scoreboard
**Keep.** Track names.
**Fix now.** Generate scores from validators, not hand-set. Add `scripts/release/build-scoreboard.ts` that reads `release-readiness-aggregator.json` and emits `generated/scoreboard.json`.
**Harden next.** Surface trend (7/30/90-day) per track in `/admin/verification`.
**Closure proof.** `scoreboard.json` updated per release; UI tile shows ≤24h freshness.

## §3 — Topology
**Keep.** Counts as targets.
**Fix now.** Replace static counts with `scripts/architecture/build-topology-snapshot.ts` (filesystem walk + DB introspection). Output `generated/topology-snapshot.json`.
**Harden next.** Drift alarm if any count drops by >10% between releases.
**Closure proof.** Topology snapshot regenerated every CI run; drift report attached.

## §4 — CI / Release Aggregator
**Keep.** Aggregator concept and `release-readiness-aggregator.json`.
**Fix now.** Implement the 5 missing meta-validators (`check-final-runtime-proof`, `check-final-gate-meaningfulness`, `check-manifest-truth-coverage`, `check-frontend-truth-backing`, `check-evidence-graph-completeness`). Two existing (`check-5-plane-boundaries`, `check-deployment-profile-coverage`) — rename in audit if names differ; keep behavior.
**Harden next.** Per-bucket WARN ratchet so warnings can only decrease.
**Closure proof.** All 7 meta-validators on disk, all green; aggregator JSON reflects it.

## §5 — Build & Bundles
**Keep.** Bundle taxonomy.
**Fix now.** Add `generated/build-matrix.json` enumerating every bundle × profile pair with last-built timestamp + sha256.
**Harden next.** Build matrix CI gate fails if any bundle is older than 14 days.
**Closure proof.** Build matrix JSON freshness gate green.

## §6 — Generated Artifacts
**Keep.** `generated/` is canonical.
**Fix now.** `check-manifest-truth-coverage.ts` (NEW) — every file in `generated/` listed in `manifest-registry.ts` with owner.
**Harden next.** Auto-archive artifacts >90 days unused.
**Closure proof.** Coverage report: 100% of files have registry entries.

## §7 — Manifest Truth Framework
**Keep.** Framework concept and `ManifestHealthEngine`.
**Fix now.** Make every manifest declare `{ owner, source_of_truth, validator, ci_gate }` as a typed export. Add `check-manifest-fields.ts` (BLOCK).
**Harden next.** Drift severity classified (info/warn/block) at the manifest level, not aggregator level.
**Closure proof.** Every manifest passes typed-fields gate.

## §8 — 5-Plane Architecture
**Keep.** Plane names, guard concept.
**Fix now.** `check-5-plane-boundaries.ts` already exists — HARDEN to use ts-morph import-graph (not regex). Emit `generated/plane-import-graph.json`.
**Harden next.** Per-plane SLO dashboard tile.
**Closure proof.** Import graph artifact present; zero cross-plane upward imports.

## §9 — Routes & Plane Map
**Keep.** `route-plane-map.ts` as authoritative.
**Fix now.** `check-route-resolution.ts` (NEW) — every route entry imports a real lazy module (no broken refs). `useRouteVisibleInProfile()` proven by unit test.
**Harden next.** Generate `generated/route-truth.json` with route + plane + profile + module-path + last-rendered-in-CI.
**Closure proof.** Route-truth artifact green; zero broken routes.

## §10 — Frontend (React)
**Keep.** Stack choices, semantic tokens, `useAppStatePersistence`.
**Fix now.** Tailwind + `index.css` audit: zero raw color classes outside primitives. `check-no-raw-colors.ts` (BLOCK at primitive level, WARN burndown elsewhere — already in place per memory).
**Harden next.** Storybook for every primitive + visual regression.
**Closure proof.** Storybook published; visual regression CI green.

## §11 — Mobile
**Keep.** Honestly-deferred posture; PWA + responsive web active.
**Fix now.** Generate `generated/mobile-deferment-readiness.json` mapping engineering-complete vs account-blocked.
**Harden next.** Auto-revoke any new `@capacitor/*` dependency at install time via npm preinstall hook.
**Closure proof.** `check-mobile-archived-scope` green; `mobile-deferment-readiness.json` present.

## §12 — iOS
**Keep.** Code-launch-ready posture.
**Fix now.** Document the exact account-procurement runbook at `archive/mobile/ios/REACTIVATION_RUNBOOK.md`. Validator `check-ios-reactivation-runbook.ts` (WARN) — runbook present + last reviewed.
**Harden next.** CI dry-run of bootstrap script (env-stubbed).
**Closure proof.** Runbook present; bootstrap dry-run passes.

## §13 — Android
Same pattern as §12, mirror at `archive/mobile/android/REACTIVATION_RUNBOOK.md`.

## §14 — Domain Reality
**Keep.** Domain Manifest System, completeness scoring.
**Fix now.** Persist scores to `domain_completeness_scores(domain, score, computed_at)` so trend is queryable.
**Harden next.** Per-domain owner subscription to score-drop alerts.
**Closure proof.** Scores persisted; `/admin/domain-manifest-dashboard` reads from DB.

## §15 — Wiring Map
**Keep.** Provenance back-tracking.
**Fix now.** Build `generated/wiring-map.json` per-Boardroom-item with `domain_signal_id → recommendation_id → action_id → receipt_id → outcome_id`.
**Harden next.** Wiring drift alarm if any chain breaks.
**Closure proof.** Sample 10 random Boardroom items; all 5 hops resolve.

## §16 — UI Grammar
**Keep.** Grammar rules.
**Fix now.** `check-ui-grammar.ts` (BLOCK) — no string-literal trust labels, no ad-hoc colors at admin/operator surfaces.
**Harden next.** Lint rule in `eslint-plugin-sita-ui`.
**Closure proof.** Lint clean; CI gate green.

## §17 — Layer-3 Platform Services & 5-Layer Constitution
**Keep.** 8 platform services, 5-layer concept.
**Fix now.** Implement `check-service-layer-boundaries.ts` (NEW). Add `validateSystemStack` CI integration.
**Harden next.** Service health dashboard at `/admin/platform-services`.
**Closure proof.** Layer guard green; system-stack validator green.

## §18 — Contracts
**Keep.** `src/packages/contracts/` type-only.
**Fix now.** `check-contracts-typeonly.ts` (NEW) — block runtime imports.
**Harden next.** Contracts versioning policy doc.
**Closure proof.** Validator green.

## §19 — Database (201 tables, 100% RLS, 323 policies)
**Keep.** RLS coverage, 11 durability tables, security definers.
**Fix now.** Add migrations for new tables: `installed_apps_receipts`, `cron_run_receipts`, `release_decisions`, `advisor_trust_ledger`, `evidence_graph_nodes`, `evidence_graph_edges`, `onboarding_branch_completion`, `connector_truth_status`, `kill_switch_ttl_expiry_receipts`, `advisor_action_proof_packs`. Each with RLS using `has_role()`.
**Harden next.** `check-rls-coverage.ts` (already in spirit) — no table without RLS.
**Closure proof.** All new tables RLS-protected; coverage matrix 100%.

## §20 — FE ↔ BE ↔ DB
**Keep.** Mock Governance enforcement.
**Fix now.** Add `check-no-mock-data-shipping.ts` already implied — HARDEN to ban mock imports in `src/pages/**` outside `__mocks__`.
**Harden next.** Per-route data-source manifest emitted nightly.
**Closure proof.** Validator green.

## §21 — Edge Functions (173, 6 roles, 10 clusters)
**Keep.** Roles + clusters + caller-class concept.
**Fix now.** `check-bff-caller-class.ts` (NEW). `check-orchestration-choke-point.ts` (NEW) — only `agent-executor` may invoke runtime fns.
**Harden next.** Per-function SLO + budget tracker.
**Closure proof.** Both validators green; SLO dashboard live.

## §22 — App Registry
**Keep.** Profile-aware visibility, `installed_apps`.
**Fix now.** Add `installed_apps_receipts`. `check-app-install-lifecycle.ts` (NEW).
**Harden next.** Reversibility receipts for uninstall.
**Closure proof.** Sample install/uninstall produces receipt with hash.

## §23 — Runtime
**Keep.** 3 tiers (WEB_APP, DESKTOP_HOST, APPLIANCE_RUNTIME).
**Fix now.** Persist `runtime-tier-deployment-map.json` from build, not hand-edited.
**Harden next.** Runtime tier badge on every page footer in dev.
**Closure proof.** Map auto-generated per build.

## §24 — AI Runtime Truth Closure
**Keep.** 5 sub-checks, nightly verifier, ≤$0.005 ceiling.
**Fix now.** Compute streak. `check-ai-runtime-streak.ts` (NEW). Surface in `StreakBoard.tsx` + tile in `AIRuntimeHome.tsx`.
**Harden next.** Per-capability streak (not just global).
**Closure proof.** 7 consecutive nightly runs green; streak tile reads 7+ days.

## §25 — Connectors (35+) & Truth Closure
**Keep.** 4-state machine, taxonomy.
**Fix now.** `connector-truth-nightly` cron (NEW or HARDEN). `connector_truth_status` table.
**Harden next.** Per-connector reauth runbook.
**Closure proof.** Nightly cron writes per-provider rows; UI reflects.

## §26 — AI Providers
**Keep.** Registries + fallback chains + `ai_provider_health`.
**Fix now.** `check-fallback-chain-completeness.ts` (NEW) — every primary model has ≥1 fallback.
**Harden next.** Cost-aware routing override surface in admin.
**Closure proof.** Validator green.

## §27 — Notifications
**Keep.** Layer-3 service, 3 routes (in-app, push VAPID, email).
**Fix now.** `check-notification-route-coverage.ts` (WARN) — every alert class has a route mapping.
**Harden next.** Delivery receipts table.
**Closure proof.** Validator green; sample alert delivered to all 3 routes in CI.

## §28 — Mock Governance & Epistemic Firewall
**Keep.** Concept and refusal payload.
**Fix now.** `check-epistemic-firewall-tagging.ts` (BLOCK) — every AI surface has evidence-grade tag.
**Harden next.** Refusal-rate dashboard.
**Closure proof.** Validator green; refusal rate visible.

## §29 — Journeys + REX 13-state lifecycle
**Keep.** 13 states, receipt-per-state.
**Fix now.** `check-rex-state-coverage.ts` (BLOCK) — sample executions show all 13 states.
**Harden next.** REX state-transition heatmap.
**Closure proof.** Validator green.

## §30 — REX
See §29.

## §31 — 6 Flagship Loops
**Keep.** Loop names.
**Fix now.** Per-loop health page; `check-flagship-loop-health.ts` (BLOCK).
**Harden next.** Loop SLO publication.
**Closure proof.** All 6 loops green in dashboard.

## §32 — Prioritization
**Keep.** Score formula.
**Fix now.** Persist score components per recommendation; surface in approval card.
**Harden next.** Per-domain weight tuning UI.
**Closure proof.** Approvals queue reflects formula; admin can audit.

## §33 — UX Honesty
**Keep.** Receipt-or-confidence rule.
**Fix now.** `check-ui-honesty.ts` (BLOCK) — no fake-green badges (StatusBadge requires `proofRef`).
**Harden next.** Honest-language linter for marketing copy.
**Closure proof.** Validator green.

## §34 — Security Fabric (7 layers)
**Keep.** 7 layers + 9-gate gateway.
**Fix now.** Move flat `electron/*-{shield,guard,sentinel}.cjs` → `electron/security/`. Implement `AIGatewayPipeline.ts` (Phase 5). `check-security-fabric-init.ts` (NEW).
**Harden next.** Security-fabric drift alarm if any layer init missing on boot.
**Closure proof.** Boot trace shows all 7 layers initialized.

## §35 — Observability
**Keep.** Structured logging at `src/lib/observability/`.
**Fix now.** `/admin/health` shows live metrics from `ai_provider_health`, daemon status, watchdog events.
**Harden next.** OTel exporter to operator-chosen backend.
**Closure proof.** `/admin/health` page reads from real sources.

## §36 — Cost
**Keep.** `ai_usage_ledger`, `ai_budget_decision_receipts`, `ai_budget_alerts`.
**Fix now.** `check-ai-cost-ceiling.ts` (BLOCK) — per-invocation ≤$0.005.
**Harden next.** Per-capability + per-tenant cost budgets.
**Closure proof.** Validator green; budget dashboard live.

## §37 — Deployment Artifacts
**Keep.** ISO/IMG/OVA/Electron/Web SPA matrix.
**Fix now.** `generated/build-matrix.json` (Phase 5 of audit) auto-emitted; `check-build-matrix-freshness.ts` (BLOCK if >14d).
**Harden next.** Per-artifact attestation (slsa-style).
**Closure proof.** Matrix fresh; attestation present.

## §38 — Operator Surfaces
**Keep.** Consolidation into 12 domains + 8 workflows.
**Fix now.** Deprecate legacy admin shells with shim + warning. `check-legacy-admin-shell-deprecation.ts` (WARN→BLOCK).
**Harden next.** OperatorHome KPI tiles.
**Closure proof.** Validator green; OperatorHome live.

## §39 — Devices
**Keep.** `device_attestations` + TPM 2.0 PCR concept.
**Fix now.** Emit `generated/trusted-boot/pcr-map.json` per build. `check-trusted-boot-evidence.ts` (BLOCK on appliance build).
**Harden next.** Per-device attestation history view.
**Closure proof.** PCR map artifact present per build.

## §40 — Narrative
**Keep.** As written.
**Fix now.** Resolve audit's narrative paragraph to `docs/NARRATIVE.md` (single source).
**Harden next.** Narrative reviewed each release.
**Closure proof.** Doc present and dated.

## §41 — Contradictions
**Keep.** Three resolutions.
**Fix now.** Each resolution gets a validator: §28 (mock-governance), §11 (mobile-archived-scope), §24 (ai-runtime-streak).
**Harden next.** Auto-detect new contradictions.
**Closure proof.** All three validators green.

## §42 — Ownership
**Keep.** `manifest-registry.ts` declared owner.
**Fix now.** `check-manifest-ownership-completeness.ts` (Phase 0 — BLOCK).
**Harden next.** Owner SLA: stale manifests >180d trigger reassignment.
**Closure proof.** Validator green; owner-SLA report monthly.

## §43 — Open Questions
**Keep.** Two open items.
**Fix now.** Each becomes a tracked ticket (see Part 8).
**Harden next.** OQ register in `/admin/verification`.
**Closure proof.** Both items resolved or explicitly deferred with date.

## §44 — Gap Register
**Keep.** Closed items.
**Fix now.** Auto-generate from `evidence-graph.json` so it can't drift from reality.
**Harden next.** Per-gap age tracker.
**Closure proof.** Gap register auto-emitted; UI tile reflects.

## §45 — Blast Radius
**Keep.** Concept.
**Fix now.** Add chaos-drill cron (already in §60 phase 8); `check-chaos-drill-cadence.ts` (WARN).
**Harden next.** Per-domain blast-radius simulation.
**Closure proof.** Drill cadence ≥ monthly proven.

## §46 — Action Plan
Replaced by **Phased Fix Plan** in this blueprint (Part 2).

## §47 — Launch Honesty Matrix
**Keep.** Honesty labels.
**Fix now.** `scripts/release/build-launch-honesty-matrix.ts` (NEW) — generates `launch-honesty-matrix.json` from validators. `check-launch-honesty-matrix.ts` (BLOCK).
**Harden next.** Public-facing honesty page.
**Closure proof.** Matrix auto-emitted; validator green.

## §48 — Truth Index
**Keep.** Composite concept.
**Fix now.** Computed from `evidence-graph.json` + scoreboard, never hand-set.
**Harden next.** Per-track sparkline on dashboard.
**Closure proof.** Index auto-published per release.

## §49 — Nova Runtime SDK
**Keep.** 4-phase boot, HAL, syscalls, scheduler, memory, crash, FS, power.
**Fix now.** Each boot phase emits `generated/nova-boot/phase-{0..3}-trace.json`. `check-nova-boot-phases.ts` (BLOCK).
**Harden next.** Boot regression test pinned to commit.
**Closure proof.** All 4 phase artifacts present per build.

## §50 — Boot & Trust Chain
**Keep.** UEFI → Shim → GRUB → dm-verity, PCR map, MOK injection, TPM-absent fallback.
**Fix now.** `check-trusted-boot-evidence.ts` (BLOCK on appliance). Emit `generated/trusted-boot/{pcr-map.json, mok-status.json, dm-verity-root-hash.txt}`.
**Harden next.** Reproducible-build attestation.
**Closure proof.** Three artifacts present per appliance build.

## §51 — Deployment Profiles
**Keep.** `sita-os-user` and `sita-os-operator` + `/etc/sita/deployment-profile.json`.
**Fix now.** `os/image-builder/build.sh --profile=` writes manifest. `check-deployment-profile-coverage.ts` (HARDEN).
**Harden next.** Profile-aware preload IPC restriction.
**Closure proof.** Booting either profile lands on correct home; manifest present at `/etc/sita/`.

## §52 — Desktop Host Runtime Contract
**Keep.** 6 contract files.
**Fix now.** Verify all 6 exist at `src/lib/runtime/desktop/`. `check-desktop-host-contract.ts` (NEW).
**Harden next.** Generate IPC method-group docs from contracts.
**Closure proof.** Validator green; docs auto-generated.

## §53 — Native Shell Watchdog & Health Probe
**Keep.** 3s backoff, 5s heartbeat, TTY7 fallback, GPU-accelerated drag.
**Fix now.** `check-final-runtime-proof.ts` (NEW) — boot Electron headless in CI, assert heartbeat ticks for 30s. Watchdog emits `/var/lib/sita/state/watchdog-events.log`.
**Harden next.** Heartbeat exported to observability backend.
**Closure proof.** Boot trace + heartbeat artifact in `generated/runtime-proof/`.

## §54 — OS Platform Daemons (5)
**Keep.** settingsd, crashd, healthd, timed, accessibilityd.
**Fix now.** `check-platform-daemons-health.ts` (NEW) — each daemon registered + responding.
**Harden next.** Per-daemon SLO.
**Closure proof.** Daemon-status artifact present; UI tile in `/admin/platform-command-center`.

## §55 — App Platform 4-Class Taxonomy
**Keep.** Type A/B/C/D + ed25519 + trust tiers.
**Fix now.** `check-app-manifest-signature.ts` (NEW). `app-ingest-web` and `app-ingest-pwa` emit signed manifests.
**Harden next.** Permission diff UI on app update.
**Closure proof.** Sample app install verified by signature in CI.

## §56 — App SDK & Lifecycle
**Keep.** State machine, `designVersion: nova-1.0`, NovaFS.
**Fix now.** Manifest schema typed at `src/lib/nova-sdk/app/manifest.schema.ts`. Lifecycle hooks formalized.
**Harden next.** SDK versioning policy.
**Closure proof.** Schema validator green.

## §57 — Standalone App Windows
**Keep.** Isolated windows + GPU-accelerated drag.
**Fix now.** Per-window state isolation enforced via `useAppStatePersistence` namespacing. `check-window-isolation.ts` (WARN).
**Harden next.** Window snap + tile manager.
**Closure proof.** Validator green.

## §58 — Advisor Board Intelligence
**Keep.** 10 advisors, 16-tab cockpit, 14-lever CPE, tables.
**Fix now.** `check-advisor-action-proof.ts` (NEW). Per-action proof pack generator. ProofPackBrowser surface.
**Harden next.** Per-advisor trust ledger view.
**Closure proof.** Browse any action → proof pack resolves.

## §59 — Autonomous Advisors
**Keep.** 6 agents, 9-gate pipeline, L0–L6 tiers, L3 ceiling.
**Fix now.** Implement `AIGatewayPipeline.ts` collapsing 9 gates. Receipts per gate.
**Harden next.** L3 ceiling enforced as typed constraint.
**Closure proof.** Pipeline emits per-gate receipt; ceiling violations rejected.

## §60 — AI Workforce Roadmap (9 phases)
**Keep.** Phase definitions + Security Council hourly tick.
**Fix now.** `check-workforce-phase-status.ts` (WARN) — surfaces per-phase status. Phases 7–9 honestly deferred.
**Harden next.** Per-phase entry/exit criteria.
**Closure proof.** Status artifact + UI tile.

## §61 — Runbook & Kill-Switch System
**Keep.** 15+ switches, 19 runbooks, append-only audit log.
**Fix now.** `check-runbook-link-coverage.ts` (BLOCK). `check-kill-switch-ttl.ts` (BLOCK). Cron-driven TTL expiry receipts.
**Harden next.** Auto-stub runbook on first new alert class.
**Closure proof.** Both validators green; TTL expiry receipts daily.

## §62 — 12-Domain Admin IA + 8 Operator Workflows
**Keep.** Domains + workflows + AdminControlPlaneShell canonical.
**Fix now.** `check-admin-ia-coverage.ts` (BLOCK). `check-operator-workflow-coverage.ts` (BLOCK). OperatorHome surface.
**Harden next.** Per-workflow KPI.
**Closure proof.** Both validators green; OperatorHome live with all 8 tiles.

## §63 — Onboarding & First-Use Master Spec
**Keep.** Phases, branching (quick/balanced/deep), 9 wow moments, data-model keys.
**Fix now.** `onboarding_branch_completion` table. `onboarding_screen_telemetry` table. Recorder edge function. `check-onboarding-branch-completion.ts` + `check-onboarding-screen-coverage.ts` (BLOCK).
**Harden next.** Reflective copy per branch tested for tone consistency.
**Closure proof.** `/admin/onboarding-health` shows funnel; validators green.

## §64 — Cron / Scheduled Operations
**Keep.** Schedule.
**Fix now.** Add `cron_run_receipts` table. Each job writes a receipt. `check-cron-execution-evidence.ts` (BLOCK if any job missing receipt for >2× cadence).
**Harden next.** Per-job SLO + alerting.
**Closure proof.** Receipts present for every job over last 24h.

---

# PART 4 — EXACT WIRING INSTRUCTIONS

## A. Frontend Wiring

```
Browser request
  → React Router route entry (src/App.tsx)
    → resolved against route-plane-map.ts
      → useRouteVisibleInProfile() gate
        → Layout (AdminControlPlaneShell | DesktopShell | OnboardingShell)
          → Feature App (lazy import, e.g. BoardroomCockpit)
            → useXxx hook (e.g. useAdvisorActions)
              → service facade (src/lib/services/service-facade.ts)
                → BFF call (admin-bff-gateway | public BFF)
                  → typed contract (src/packages/contracts/)
                    → response → useQuery cache
                      → primitive consumer
                        → <StatusBadge proofRef={…}>
                        → <AITruthDisclosure grade={…} evidence={…}>
                        → <EvidenceLink href={artifactPath}>
```

**Profile-aware route visibility.**
`ShellComposer` calls `getDeploymentProfile()` (reads `/etc/sita/deployment-profile.json` via IPC; falls back to env var in web). `useRouteVisibleInProfile(routeId)` returns boolean. Nav items + direct route loads gated.

**Onboarding branch selection.**
`src/lib/onboarding/branch-resolver.ts` reads `onboardingSession.depth` and `onboardingSession.domain` → returns ordered screen list. Each screen-exit calls `onboarding-progress-recorder` edge fn → writes to `onboarding_screen_telemetry`.

**Admin shell vs user shell.**
- `sita-os-user` profile → `DesktopShell` at `/desktop` is home.
- `sita-os-operator` profile → `AdminControlPlaneShell` at `/admin` is home.
- Both shells share `<TruthFooter>` rendering CI status from `release-readiness-aggregator.json`.

**App window state.**
`useAppStatePersistence(appId)` namespaces sessionStorage by `appId`. Closing window persists last state; reopening rehydrates.

**Evidence disclosure surfaces.**
- `<StatusBadge proofRef>` renders click-through to `/admin/verification?artifact=…`.
- `<AITruthDisclosure>` shown on every AI surface; refuses to render without `grade` prop.

## B. Backend Wiring

```
                Public client          Admin client          Runtime/Cron
                     │                       │                     │
                     ▼                       ▼                     ▼
          ┌─────────────────┐    ┌──────────────────────┐   ┌──────────────┐
          │  Public BFF     │    │  admin-bff-gateway   │   │ runtime fn   │
          │  (e.g. business-│    │  (sole admin entry)  │   │ (e.g. agent- │
          │   board-api)    │    │                      │   │  executor)   │
          └────────┬────────┘    └──────────┬───────────┘   └──────┬───────┘
                   │                        │                       │
                   ▼                        ▼                       ▼
           caller-class check       caller-class check       caller-class check
                   │                        │                       │
                   ▼                        ▼                       ▼
           Domain function          Domain function         AIGatewayPipeline
           (e.g. ai-gateway)        (e.g. compliance-…)     (9 gates)
                   │                        │                       │
                   └────────┬───────────────┴───────────────────────┘
                            ▼
                   Kill-switch interceptor (KS-* check)
                            ▼
                   Policy check (has_role, action_safety_classifications)
                            ▼
                   Execute → write receipt → write ledger → emit event
                            ▼
                   On failure → fallback chain → alternate model/provider
```

**Sole choke points.**
- Admin: `admin-bff-gateway` only.
- Orchestration: `agent-executor` only.
- AI: `ai-gateway` only.

**Caller-class enforcement.**
Each function header inspects `req.headers['x-caller-class']` and rejects if not in allowed set:
- Runtime fn allows: `runtime-system`, `cron`.
- Admin BFF allows: `admin-ui`, `admin-cli`.
- Public BFF allows: `web-spa`, `desktop-shell`.

**Approval/receipt/reconciliation flow.**
Approval request → `admin_action_confirmations` row → on approve, `agent-executor` invoked → writes `ai_action_receipts` → REX state machine writes `timeline_events` → reconciliation cron writes `boardroom_outcome_records`.

**Kill-switch interceptors.**
Every executor first calls `assertKillSwitchOpen(switchKey)` which reads from `kill_switches` view. Blocked → write `admin_action_audit` row with denial reason.

**Policy checks.**
Every action resolves `action_safety_classifications` for autonomy ceiling, audit requirement, confirmation requirement, rollback capability.

**Fallback chains.**
`ai_capability_routing.fallback_chain` traversed on primary failure; each step writes `ai_fallback_events`.

## C. Database Wiring

**Authoritative tables (existing — keep).**
- `accounts`, `admin_action_audit`, `admin_action_confirmations`, `admin_safety_actions`, `admin_sessions`
- `advisor_*` family (registry, agents, profiles, knowledge, memories, board_actions, board_recommendations, board_reflections, board_tool_executions, autonomy_policies)
- `ai_*` family (model_registry, provider_registry, provider_health, capability_routing, prompt_families, prompt_versions, invocations, action_receipts, usage_ledger, budget_decision_receipts, fallback_events, runtime_nightly_runs, runtime_streak_state, runtime_failure_alerts, implementation_suggestions)
- `boardroom_*` (items, followthrough_dispatches, outcome_records)

**Receipts and ledgers (NEW or HARDEN).**
- `installed_apps_receipts(install_id, app_id, action, actor, receipt_hash, created_at)`
- `cron_run_receipts(job_id, started_at, finished_at, outcome, artifact_ref, error)`
- `release_decisions(decision_id, kind, artifact_sha, decided_by, decided_at, justification, signature)` — append-only
- `advisor_action_proof_packs(action_id PK, request_json, simulation_json, receipt_json, reversal_json)`
- `kill_switch_ttl_expiry_receipts(switch_key, expired_at, evidence_ref)`

**Runtime / agent / action lineage.**
`agent run → ai_invocations → ai_action_receipts → admin_action_audit → boardroom_outcome_records → advisor_board_reflections`

**Connector health lineage.**
`connector_tokens → google/ms/slack-oauth-refresh → connector_truth_status → ai_provider_health (mirror)`

**Advisor memory/action lineage.**
`advisor_memories → advisor_board_recommendations → advisor_board_actions → advisor_board_tool_executions → advisor_board_reflections → advisor_trust_ledger`

**Onboarding progression lineage.**
`onboardingSession → onboarding_screen_telemetry → onboarding_branch_completion`

**Admin audit lineage.**
Every privileged write → `admin_action_audit` (severity, plane, target, justification).

## D. Runtime / OS Wiring

**Boot phases.**
1. UEFI firmware → 2. Shim → 3. signed GRUB + kernel → 4. initramfs `sita-verify-rootfs` (dm-verity) → 5. systemd → 6. `sita-runtime.service` → 7. Electron host on TTY7 → 8. Nova SDK 4-phase boot → 9. ShellComposer reads `/etc/sita/deployment-profile.json` → 10. lands on profile home.

**Deployment profile loading.**
`/etc/sita/deployment-profile.json` written by `os/image-builder/build.sh --profile=`. Read by `getDeploymentProfile()` (Node) and exposed via IPC to renderer.

**IPC contract groups.**
22 method groups defined in `ElectronBridgeContract.ts`. Preload only exposes groups allowed by current profile.

**Host privilege boundaries.**
`DesktopHostContract.ts` declares: filesystem read/write paths, network egress allowlist, registered-protocol handlers.

**Watchdog heartbeats.**
Electron writes atomic `/var/lib/sita/state/shell-heartbeat` every 5s. Watchdog (`os/runtime/shell-watchdog.sh`) reads every 1s; if stale >15s, restarts service with 3s backoff (max 5 restarts → safe-mode TTY7).

**Daemon registration.**
Each of `settingsd`, `crashd`, `healthd`, `timed`, `accessibilityd` registers via `/run/sita/daemons/{name}.sock` and writes `/var/lib/sita/state/daemons/{name}.heartbeat`.

**Health surfacing.**
`healthd` aggregates daemon heartbeats → publishes to IPC channel → `/admin/platform-command-center` reads.

**Safe mode and recovery.**
Watchdog escalation → systemd activates `sita-recovery.target` → TTY7 shows `os/recovery/recovery-shell.sh` (diagnostics, log export, rollback).

## E. Evidence / Validation Wiring

```
SOURCE OF TRUTH
   ├── filesystem (e.g., src/lib/architecture/route-plane-map.ts)
   ├── DB (e.g., ai_runtime_nightly_runs)
   ├── runtime probe (e.g., heartbeat file)
   └── manifest (e.g., manifest-registry.ts)

VALIDATOR (scripts/validation/check-*.ts)
   ├── reads source of truth
   ├── computes pass/fail
   └── writes generated/<name>-report.json

GENERATED ARTIFACT (generated/**)
   └── consumed by:
        ├── release-readiness-aggregator.json
        ├── evidence-graph.json
        └── /admin/verification dashboards

DASHBOARD (e.g., /admin/verification)
   └── renders artifact via <EvidenceLink>

RELEASE GATE
   └── aggregator BLOCKs release if any BLOCK validator fails
```

---

# PART 5 — FILES, ARTIFACTS, AND MODULES TO CREATE

## 5.1 Manifests

| Path | Purpose | Producer | Validator | Consumers |
|---|---|---|---|---|
| `src/lib/architecture/canonical-paths.ts` | Single source of truth for every claimed path | manual | `check-canonical-paths.ts` | all docs |
| `src/lib/architecture/manifest-registry.ts` | (HARDEN) typed `{owner, source, validator, gate}` per artifact | manual | `check-manifest-fields.ts` | aggregator |
| `generated/manifest-ownership.json` | Computed coverage report | `build-manifest-ownership.ts` | `check-manifest-ownership-completeness.ts` | aggregator |
| `generated/topology-snapshot.json` | Live counts | `build-topology-snapshot.ts` | `check-topology-drift.ts` | dashboard |
| `generated/build-matrix.json` | Bundle × profile | `build.sh` | `check-build-matrix-freshness.ts` | release |
| `generated/launch-honesty-matrix.json` | Surface × honesty label | `build-launch-honesty-matrix.ts` | `check-launch-honesty-matrix.ts` | release |

## 5.2 Registries

| Path | Purpose |
|---|---|
| `src/lib/architecture/route-plane-map.ts` | (HARDEN) route → plane → profile → module |
| `src/lib/architecture/plane-registry.ts` | (HARDEN) plane definitions |
| `src/lib/architecture/app-plane-map.ts` | (HARDEN) app → plane |
| `src/lib/services/service-registry.ts` | (HARDEN) Layer-3 platform services + ownership |
| `src/lib/runbooks/runbook-registry.ts` | (HARDEN) 19 runbooks + per-alert link |
| `src/lib/kill-switches/kill-switch-registry.ts` | (HARDEN) 15+ switches + TTL + dual-admin policy |
| `src/lib/cron/cron-registry.ts` | (NEW) every cron job + cadence + receipt expectation |

## 5.3 TS Contracts

| Path | Purpose |
|---|---|
| `src/packages/contracts/runtime.ts` | Desktop host + IPC + profile types |
| `src/packages/contracts/ai.ts` | Provider, model, capability, invocation, receipt types |
| `src/packages/contracts/advisor.ts` | Action, recommendation, proof-pack, reflection types |
| `src/packages/contracts/app-platform.ts` | App manifest, lifecycle, install-receipt types |
| `src/packages/contracts/onboarding.ts` | Session, branch, screen-telemetry types |
| `src/packages/contracts/kill-switch.ts` | Switch, TTL-expiry, dual-admin types |
| `src/packages/contracts/verifier.ts` | Validator result envelope (gate, severity, evidence) |

## 5.4 Route / Plane / Profile Maps

- `src/lib/architecture/route-plane-map.ts` (HARDEN)
- `src/lib/architecture/plane-registry.ts` (HARDEN)
- `src/lib/runtime/desktop/DeploymentProfile.ts` (NEW or canonicalize)
- `src/hooks/useRouteVisibleInProfile.ts` (HARDEN)

## 5.5 Generated Bundles

- `generated/canonical-paths-report.json`
- `generated/manifest-ownership-report.json`
- `generated/topology-snapshot.json`
- `generated/build-matrix.json`
- `generated/scoreboard.json`
- `generated/posture-snapshot.json`
- `generated/route-truth.json`
- `generated/wiring-map.json`
- `generated/evidence-graph.json`
- `generated/launch-honesty-matrix.json`
- `generated/runtime-proof/electron-boot-trace.json`
- `generated/runtime-proof/heartbeat-tick.json`
- `generated/runtime-proof/daemon-status.json`
- `generated/nova-boot/phase-{0..3}-trace.json`
- `generated/trusted-boot/{pcr-map.json, mok-status.json, dm-verity-root-hash.txt}`
- `generated/ai-runtime-truth-closure/streak.json`
- `generated/connector-truth/nightly-{date}.json`
- `generated/onboarding-health/funnel.json`
- `generated/cron-receipts/last-24h.json`
- `generated/advisor-proof-packs/{action_id}.json`

## 5.6 Validator Scripts

(Full table in **Part 6**.)

## 5.7 Migration Files

(Full table in **Part 7.A**.)

## 5.8 Edge Functions

(Full table in **Part 7.B**.)

## 5.9 Cron Jobs (cron-registry entries)

| Job | Cadence | Receipt expected |
|---|---|---|
| `webhook-retry-processor` | 2m | yes |
| `internal-agent-loop` | 5m | yes |
| `boardroom-l7-sla-scan` | 30m | yes |
| `oauth-refresh-probe` | 1h | yes |
| `sita-security-council-tick` | 1h | yes |
| `ai-runtime-nightly-verify` | 02:00 UTC | yes |
| `connector-truth-nightly` | 02:30 UTC | yes |
| `compliance-evidence-collect` | 06:00 UTC | yes |
| `kill-switch-ttl-expiry` | 03:00 UTC | yes |
| `cron-receipt-collector` | 04:00 UTC | yes (meta) |
| `dr-drill` | Sun 05:00 UTC | yes |

## 5.10 Dashboards / Views

- `/admin/verification` (HARDEN) — Evidence Graph viewer
- `/admin/operator/home` (NEW) — OperatorHome with 8 workflow tiles
- `/admin/onboarding-health` (NEW) — branch funnel
- `/admin/connector-truth` (NEW) — per-provider state
- `/admin/ai-runtime/streak` (NEW) — 7-day streak board
- `/admin/platform-command-center` (HARDEN) — daemon status
- `/admin/releases` (HARDEN) — release_decisions ledger
- Boardroom > ProofPackBrowser (NEW)

## 5.11 Runbooks

- `RB-020-shell-watchdog-escalation.md` (NEW)
- `RB-021-ai-runtime-streak-break.md` (NEW)
- `RB-022-connector-truth-failure.md` (NEW)
- `RB-023-kill-switch-ttl-overrun.md` (NEW)
- `RB-024-onboarding-funnel-drop.md` (NEW)

## 5.12 Kill-Switch Configs

- KS-AI-NIGHTLY-VERIFY (NEW)
- KS-CONNECTOR-REFRESH (NEW)
- KS-ADVISOR-AUTONOMY (NEW)
- KS-APP-INSTALLS (NEW)
- KS-ONBOARDING-WRITES (NEW)

## 5.13 Onboarding Assets

- `src/lib/onboarding/branch-resolver.ts` (HARDEN)
- `src/lib/onboarding/reflective-copy-engine.ts` (HARDEN)
- 29 screen components verified at `src/pages/onboarding/screens/`
- `src/lib/onboarding/wow-moments.ts` (NEW)

## 5.14 Boardroom / Advisor Proof Packs

- `src/lib/advisors/proof-pack-builder.ts` (NEW)
- `src/pages/business/boardroom/ProofPackBrowser.tsx` (NEW)
- `generated/advisor-proof-packs/` directory + per-action files

## 5.15 Mobile Readiness Packs

- `generated/mobile-deferment-readiness.json` (NEW)
- `archive/mobile/ios/REACTIVATION_RUNBOOK.md` (HARDEN)
- `archive/mobile/android/REACTIVATION_RUNBOOK.md` (HARDEN)
- `archive/capacitor/REACTIVATION_RUNBOOK.md` (HARDEN)

---

# PART 6 — VALIDATORS AND GATES TO IMPLEMENT

| Script name | Inputs | Pass/Fail condition | Generated output | Severity |
|---|---|---|---|---|
| `check-canonical-paths.ts` | `canonical-paths.ts` + filesystem | every path exists | `generated/canonical-paths-report.json` | BLOCK |
| `check-manifest-ownership-completeness.ts` | `manifest-registry.ts` + `generated/` listing | every artifact has owner | `generated/manifest-ownership-report.json` | BLOCK |
| `check-manifest-truth-coverage.ts` | `manifest-registry.ts` + `generated/` | every generated file in registry | `generated/manifest-truth-coverage-report.json` | BLOCK |
| `check-manifest-fields.ts` | manifests | every manifest exports `{owner, source, validator, gate}` | report | BLOCK |
| `check-5-plane-boundaries.ts` (HARDEN) | ts-morph import graph | zero cross-plane upward imports | `plane-import-graph.json` | BLOCK |
| `check-service-layer-boundaries.ts` | import graph | downward-only authority | `service-layer-import-graph.json` | BLOCK |
| `check-contracts-typeonly.ts` | `src/packages/contracts/` | zero runtime imports | report | BLOCK |
| `check-route-resolution.ts` | route-plane-map.ts | every route imports a real module | `route-truth.json` | BLOCK |
| `check-shell-profile-home.ts` | profile manifest + ShellComposer | each profile lands on declared home | report | BLOCK |
| `check-deployment-profile-coverage.ts` (HARDEN) | profile manifest | every plane/app declared resolves to code | report | BLOCK |
| `check-frontend-truth-backing.ts` | source scan | every primitive consumer has receipt query | `frontend-truth-backing-report.json` | BLOCK |
| `check-trust-copy-coverage.ts` | source scan + trust-copy-map | no string-literal trust labels | report | BLOCK |
| `check-provenance-chip-coverage.ts` | source scan | every status+evidence surface has chip | report | WARN→BLOCK |
| `check-ai-truth-disclosure-presence.ts` | source scan | every AI surface renders disclosure | report | BLOCK |
| `check-evidence-link-resolvability.ts` | evidence-link href set | each href resolves to artifact | report | BLOCK |
| `check-status-tone-consistency.ts` | StatusBadge usage | only StatusTone enum values | report | BLOCK |
| `check-bff-caller-class.ts` | edge fn headers | runtime fns reject non-runtime callers | report | BLOCK |
| `check-orchestration-choke-point.ts` | edge fn invocations | only `agent-executor` dispatches agent runs | report | BLOCK |
| `check-receipts-completeness.ts` | DB sample | every action has receipt | report | BLOCK |
| `check-ai-runtime-streak.ts` | `ai_runtime_streak_state` | streak ≥1 (BLOCK), ≥7 closes §24 | `streak.json` | WARN→BLOCK |
| `check-ai-receipts-and-fallback.ts` | invocations table | receipts + fallbacks present | report | BLOCK |
| `check-ai-cost-ceiling.ts` | invocations table | per-invocation ≤$0.005 | report | BLOCK |
| `check-fallback-chain-completeness.ts` | `ai_capability_routing` | every primary has ≥1 fallback | report | BLOCK |
| `check-connector-truth-nightly.ts` | `connector_truth_status` | nightly row per provider | report | BLOCK |
| `check-connector-state-machine.ts` | `connector_truth_status.state` enum | only 4 valid states | report | BLOCK |
| `check-app-manifest-signature.ts` | `app_registry` | ed25519 sig verified | report | BLOCK |
| `check-app-install-lifecycle.ts` | `installed_apps_receipts` | every install/uninstall has receipt | report | BLOCK |
| `check-advisor-action-proof.ts` | `advisor_action_proof_packs` | every executed action has proof pack | report | BLOCK |
| `check-advisor-trust-ledger.ts` | `advisor_trust_ledger` | EWMA computed nightly | report | WARN |
| `check-onboarding-branch-completion.ts` | `onboarding_branch_completion` | completion rate present | `funnel.json` | BLOCK (ratchet) |
| `check-onboarding-screen-coverage.ts` | screens vs registry | all 29 reachable | report | BLOCK |
| `check-runbook-link-coverage.ts` | source scan of `raiseAlert` | every alert has runbook id | report | BLOCK |
| `check-kill-switch-ttl.ts` | `kill_switches` + receipts | TTL enforced + receipts daily | report | BLOCK |
| `check-cron-execution-evidence.ts` | `cron_run_receipts` | every job has receipt within 2× cadence | `last-24h.json` | BLOCK |
| `check-trusted-boot-evidence.ts` | `generated/trusted-boot/` | PCR + MOK + dm-verity present | report | BLOCK (appliance) |
| `check-final-runtime-proof.ts` | Electron headless run | heartbeat ticks 30s | `electron-boot-trace.json` | BLOCK |
| `check-platform-daemons-health.ts` | daemon heartbeats | all 5 alive | `daemon-status.json` | BLOCK |
| `check-nova-boot-phases.ts` | phase traces | all 4 emitted | report | BLOCK |
| `check-security-fabric-init.ts` | boot trace | all 7 layers init | report | BLOCK |
| `check-admin-ia-coverage.ts` | route-plane-map.ts | all 12 domains have route | report | BLOCK |
| `check-operator-workflow-coverage.ts` | route-plane-map.ts | all 8 workflows have entry | report | BLOCK |
| `check-legacy-admin-shell-deprecation.ts` | source scan | no legacy shell direct usage | report | WARN→BLOCK |
| `check-evidence-graph-completeness.ts` | `evidence-graph.json` | every audit claim has node + path | report | BLOCK |
| `check-final-gate-meaningfulness.ts` | aggregator | every gate is BLOCK or has documented WARN bucket | report | BLOCK |
| `check-launch-honesty-matrix.ts` | `launch-honesty-matrix.json` | every active surface labeled | report | BLOCK |
| `check-mobile-deferment-honesty.ts` | mobile UI surfaces | all label deferred state | report | BLOCK |
| `check-flagship-loop-health.ts` | per-loop probes | all 6 loops green | report | BLOCK |
| `check-rex-state-coverage.ts` | sample executions | all 13 states reached | report | BLOCK |
| `check-epistemic-firewall-tagging.ts` | AI surfaces | grade tag present | report | BLOCK |
| `check-no-mock-data-shipping.ts` | source scan | no mock imports in `src/pages/**` | report | BLOCK |

---

# PART 7 — MIGRATIONS, EDGE FUNCTIONS, CONTRACTS

## A. Migrations

```sql
-- 7.A.1 installed_apps_receipts
create table public.installed_apps_receipts (
  install_id uuid not null,
  app_id text not null,
  action text not null check (action in ('install','update','uninstall')),
  actor uuid not null,
  receipt_hash text not null,
  rollback_payload jsonb,
  created_at timestamptz not null default now(),
  primary key (install_id, action, created_at)
);
alter table public.installed_apps_receipts enable row level security;
create policy "actor_can_read_own_install_receipts"
  on public.installed_apps_receipts for select
  using (actor = auth.uid() or public.has_role(auth.uid(), 'admin'));

-- 7.A.2 cron_run_receipts
create table public.cron_run_receipts (
  id uuid primary key default gen_random_uuid(),
  job_id text not null,
  started_at timestamptz not null,
  finished_at timestamptz,
  outcome text not null check (outcome in ('success','failure','skipped','timeout')),
  artifact_ref text,
  error text,
  created_at timestamptz not null default now()
);
create index on public.cron_run_receipts (job_id, started_at desc);
alter table public.cron_run_receipts enable row level security;
create policy "admins_read_cron_receipts" on public.cron_run_receipts
  for select using (public.has_role(auth.uid(), 'admin'));

-- 7.A.3 release_decisions (append-only)
create table public.release_decisions (
  decision_id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('promote','rollback','hold')),
  artifact_sha text not null,
  decided_by uuid not null,
  decided_at timestamptz not null default now(),
  justification text not null,
  signature text not null
);
alter table public.release_decisions enable row level security;
create policy "admins_read_release_decisions" on public.release_decisions
  for select using (public.has_role(auth.uid(), 'admin'));
-- updates/deletes denied by absence of policy

-- 7.A.4 advisor_trust_ledger
create table public.advisor_trust_ledger (
  advisor_id text not null,
  day date not null,
  ewma_score numeric(4,3) not null,
  sample_count int not null,
  primary key (advisor_id, day)
);

-- 7.A.5 evidence_graph_nodes / edges
create table public.evidence_graph_nodes (
  node_id text primary key,
  kind text not null check (kind in ('claim','artifact','validator','gate','dashboard')),
  label text not null,
  metadata jsonb not null default '{}'::jsonb
);
create table public.evidence_graph_edges (
  edge_id uuid primary key default gen_random_uuid(),
  from_node text not null references public.evidence_graph_nodes(node_id),
  to_node text not null references public.evidence_graph_nodes(node_id),
  relation text not null
);

-- 7.A.6 onboarding_branch_completion
create table public.onboarding_branch_completion (
  session_id uuid primary key,
  branch text not null,
  depth text not null check (depth in ('quick','balanced','deep')),
  completed_at timestamptz,
  drop_off_screen text
);

-- 7.A.7 onboarding_screen_telemetry
create table public.onboarding_screen_telemetry (
  id bigserial primary key,
  session_id uuid not null,
  screen_id text not null,
  entered_at timestamptz not null default now(),
  exited_at timestamptz,
  choice jsonb
);

-- 7.A.8 connector_truth_status
create table public.connector_truth_status (
  provider text not null,
  state text not null check (state in ('success','degraded','reauth-required','failing')),
  last_proved_at timestamptz not null,
  evidence_ref text,
  primary key (provider)
);

-- 7.A.9 kill_switch_ttl_expiry_receipts
create table public.kill_switch_ttl_expiry_receipts (
  id uuid primary key default gen_random_uuid(),
  switch_key text not null,
  expired_at timestamptz not null default now(),
  evidence_ref text
);

-- 7.A.10 advisor_action_proof_packs
create table public.advisor_action_proof_packs (
  action_id uuid primary key,
  request jsonb not null,
  simulation jsonb,
  receipt jsonb not null,
  reversal jsonb,
  created_at timestamptz not null default now()
);
```

Indexes: `(job_id, started_at desc)`, `(provider)`, `(advisor_id, day desc)`.

RLS pattern: read = `has_role('admin')` or owner; write = security-definer functions only.

## B. Edge Functions

| Function | Type | Purpose |
|---|---|---|
| `evidence-graph-builder` | RUNTIME_SYSTEM | Walk artifacts → emit graph nodes+edges → write to DB |
| `cron-receipt-collector` | RUNTIME_SYSTEM | Collect per-job receipts → emit `last-24h.json` |
| `release-decision-recorder` | ADMIN_BFF | Sign + insert into `release_decisions` |
| `connector-truth-nightly` | RUNTIME_SYSTEM | Probe each provider → write `connector_truth_status` |
| `onboarding-progress-recorder` | PUBLIC_BFF | Insert `onboarding_screen_telemetry` rows |
| `kill-switch-ttl-expiry` | RUNTIME_SYSTEM | Expire switches past TTL → write receipt |
| `app-manifest-verifier` | RUNTIME_SYSTEM | ed25519 verify manifests at install |
| `advisor-proof-pack-emitter` | RUNTIME_SYSTEM | Build per-action proof pack |
| `dr-drill-runner` | RUNTIME_SYSTEM | Weekly chaos drill |

Each function:
- Reads `x-caller-class` and rejects disallowed.
- Writes `cron_run_receipts` row at start/finish.
- Emits structured log + correlation id.

## C. Contracts

```ts
// src/packages/contracts/verifier.ts
export type ValidatorSeverity = 'BLOCK' | 'WARN' | 'INFO';
export interface ValidatorResult {
  gate: string;
  severity: ValidatorSeverity;
  ok: boolean;
  evidence: { artifact: string; sha?: string; rows?: number };
  issues: Array<{ message: string; ref?: string }>;
  computed_at: string;
}

// src/packages/contracts/runtime.ts
export type DeploymentProfile = 'sita-os-user' | 'sita-os-operator';
export interface ProfileManifest {
  profile: DeploymentProfile;
  home_route: string;
  enabled_planes: Array<'core-os'|'shell-runtime'|'user'|'admin'|'backend-services'>;
  ipc_method_groups: string[];
}

// src/packages/contracts/app-platform.ts
export interface AppManifest {
  app_id: string;
  designVersion: 'nova-1.0';
  permissions: string[];
  trust_tier: 'internal'|'verified'|'trusted-domain'|'community';
  signature: { algo: 'ed25519'; sig: string; pubkey: string };
}
export interface InstallReceipt {
  install_id: string;
  app_id: string;
  action: 'install'|'update'|'uninstall';
  actor: string;
  receipt_hash: string;
  rollback_payload?: unknown;
  created_at: string;
}

// src/packages/contracts/advisor.ts
export interface AdvisorActionProofPack {
  action_id: string;
  request: unknown;
  simulation?: unknown;
  receipt: { provider: string; model: string; cost_usd: number; latency_ms: number };
  reversal?: unknown;
}

// src/packages/contracts/kill-switch.ts
export interface KillSwitch {
  key: string;
  category: 'payments'|'connectors'|'ai'|'apps'|'onboarding';
  ttl_minutes?: number;
  requires_dual_admin: boolean;
}

// src/packages/contracts/onboarding.ts
export interface OnboardingSession {
  session_id: string;
  depth: 'quick'|'balanced'|'deep';
  domain: 'household'|'work'|'money'|'comms';
  tone: 'overwhelmed'|'calmer'|'proactive'|'denser';
}
```

---

# PART 8 — EXECUTION BACKLOG

> Format: ID · Title · Why · Change · Deps · Owner · Severity · Complexity · DoD · Proof.

### Phase 0 — Canonicalization

**TKT-P0-001 — Move Electron security modules into `electron/security/`**
- Why: Audit paths claim `electron/security/` but files are flat in `electron/`.
- Change: `git mv` 5 files; update requires in `electron/main.cjs`, `electron/preload.cjs`; add `electron/security/index.cjs` barrel.
- Deps: none.
- Owner: Security.
- Severity: HIGH.
- Complexity: S.
- DoD: Boot succeeds; all imports resolve; `check-canonical-paths` green.
- Proof: `generated/canonical-paths-report.json`.

**TKT-P0-002 — Create `canonical-paths.ts` + validator**
- Why: Eliminate path drift across audit and code.
- Change: New `src/lib/architecture/canonical-paths.ts`; new `scripts/architecture/checks/check-canonical-paths.ts`; wire into aggregator.
- Deps: TKT-P0-001.
- Owner: Architecture. Severity: HIGH. Complexity: S.
- DoD: Validator green.
- Proof: report file.

**TKT-P0-003 — Manifest ownership completeness**
- Change: Add `{owner, source, validator, gate}` to every manifest export; new validator + report.
- Owner: Governance. Severity: HIGH. Complexity: M.
- DoD/Proof: `generated/manifest-ownership-report.json` 100% coverage.

### Phase 1 — Boundaries

**TKT-P1-001 — Service-layer downward-only guard.**
- Change: New `check-service-layer-boundaries.ts` using ts-morph; new `service-layer-import-graph.json`.
- Owner: Architecture. Severity: HIGH. Complexity: M.
- DoD: zero upward imports.

**TKT-P1-002 — Contracts type-only enforcement.**
- Change: `check-contracts-typeonly.ts` (BLOCK).
- Owner: Architecture. Severity: MEDIUM. Complexity: S.

### Phase 2 — Routes & Profiles

**TKT-P2-001 — Route resolution gate.**
- Change: `check-route-resolution.ts`; emit `route-truth.json`.
- Owner: Frontend. Severity: HIGH. Complexity: M.

**TKT-P2-002 — Shell profile-home gate.**
- Change: `check-shell-profile-home.ts`; ShellComposer reads profile manifest.
- Owner: Shell-Runtime. Severity: HIGH. Complexity: M.

### Phase 3 — Frontend Truth

**TKT-P3-001 — Required `proofRef` on `<StatusBadge>`.**
- Change: Make prop required; lint codemod for callsites.
- Owner: Frontend. Severity: HIGH. Complexity: M.

**TKT-P3-002 — Frontend truth-backing validator.**
- Change: `check-frontend-truth-backing.ts`.
- Owner: Frontend. Severity: HIGH. Complexity: M.

**TKT-P3-003 — Evidence link resolvability.**
- Change: `check-evidence-link-resolvability.ts`.
- Owner: Frontend. Severity: MEDIUM. Complexity: S.

### Phase 4 — DB & Orchestration

**TKT-P4-001 — Migrations 7.A.1–7.A.10.**
- Owner: Backend. Severity: HIGH. Complexity: M.

**TKT-P4-002 — `check-bff-caller-class.ts`.**
- Owner: Backend. Severity: HIGH. Complexity: M.

**TKT-P4-003 — `check-orchestration-choke-point.ts`.**
- Owner: Backend. Severity: HIGH. Complexity: S.

### Phase 5 — AI Runtime

**TKT-P5-001 — `AIGatewayPipeline.ts` consolidation.**
- Change: Collapse 9 gates into one composable typed pipeline.
- Owner: AI Runtime. Severity: HIGH. Complexity: L.

**TKT-P5-002 — Streak board + validator.**
- Owner: AI Runtime. Severity: HIGH. Complexity: M.

### Phase 6 — Connectors

**TKT-P6-001 — `connector-truth-nightly` cron + table.**
- Owner: Connectors. Severity: HIGH. Complexity: M.

### Phase 7 — Security

**TKT-P7-001 — Trusted boot evidence emission.**
- Owner: Security. Severity: HIGH. Complexity: M.

**TKT-P7-002 — Kill-switch TTL enforcement cron + receipts.**
- Owner: Security. Severity: HIGH. Complexity: M.

**TKT-P7-003 — Runbook link coverage validator.**
- Owner: Operator. Severity: HIGH. Complexity: S.

### Phase 8 — Runtime Proof

**TKT-P8-001 — Electron headless harness.**
- Change: `scripts/ci/electron-headless-harness.ts`; runs in CI; emits boot trace + heartbeat.
- Owner: Runtime. Severity: HIGH. Complexity: L.

**TKT-P8-002 — Platform daemons health validator.**
- Owner: Runtime. Severity: HIGH. Complexity: M.

### Phase 9 — App Platform

**TKT-P9-001 — `installed_apps_receipts` + lifecycle validator.**
- Owner: App Platform. Severity: HIGH. Complexity: M.

**TKT-P9-002 — Manifest signature validator + ingest signing.**
- Owner: App Platform. Severity: HIGH. Complexity: M.

### Phase 10 — Advisors

**TKT-P10-001 — Proof-pack builder + browser.**
- Owner: Advisor. Severity: HIGH. Complexity: L.

**TKT-P10-002 — Trust ledger nightly job.**
- Owner: Advisor. Severity: MEDIUM. Complexity: M.

### Phase 11 — Admin IA

**TKT-P11-001 — OperatorHome with 8 tiles.**
- Owner: Operator. Severity: HIGH. Complexity: M.

**TKT-P11-002 — Legacy admin shell deprecation.**
- Owner: Operator. Severity: MEDIUM. Complexity: M.

### Phase 12 — Onboarding

**TKT-P12-001 — Telemetry tables + recorder edge fn.**
- Owner: Onboarding. Severity: HIGH. Complexity: M.

**TKT-P12-002 — `/admin/onboarding-health` funnel UI.**
- Owner: Onboarding. Severity: HIGH. Complexity: M.

### Phase 13 — Mobile

**TKT-P13-001 — `mobile-deferment-readiness.json` generator + validator.**
- Owner: Mobile. Severity: MEDIUM. Complexity: S.

### Phase 14 — Final

**TKT-P14-001 — `evidence-graph-builder` edge fn + UI viewer.**
- Owner: Governance. Severity: HIGH. Complexity: L.

**TKT-P14-002 — `launch-honesty-matrix` generator + validator.**
- Owner: Governance. Severity: HIGH. Complexity: M.

**TKT-P14-003 — Signed `release-readiness-aggregator.json`.**
- Owner: Release. Severity: HIGH. Complexity: M.

### Phase 15 — Better

**TKT-P15-001 — Profile-aware preload IPC restriction.**
- Owner: Runtime. Severity: MEDIUM. Complexity: M.

**TKT-P15-002 — Service health dashboard at `/admin/platform-services`.**
- Owner: Architecture. Severity: MEDIUM. Complexity: M.

---

# PART 9 — 30 / 60 / 90 DAY BUILD SEQUENCE

## Days 1–30 — Foundational closure

### Week 1
- TKT-P0-001 (move security modules)
- TKT-P0-002 (canonical paths)
- TKT-P0-003 (manifest ownership)
- Begin TKT-P1-001 (service-layer guard)

### Week 2
- Finish TKT-P1-001
- TKT-P1-002 (contracts type-only)
- TKT-P2-001 (route resolution)
- TKT-P2-002 (profile home gate)

### Week 3
- TKT-P3-001 (required `proofRef`)
- TKT-P3-002 (truth-backing validator)
- TKT-P3-003 (evidence link)
- Begin TKT-P4-001 (migrations)

### Week 4
- Finish TKT-P4-001
- TKT-P4-002, TKT-P4-003
- First `release-readiness-aggregator` run with 12 new validators

**Critical path week 1–4:** Phase 0 → Phase 1 → Phase 2.
**Parallelizable:** Phase 3 (frontend) runs in parallel from week 2.
**No-go conditions:** any of `check-canonical-paths`, `check-manifest-ownership-completeness`, `check-5-plane-boundaries` red at end of week 4.

## Days 31–60 — Runtime, AI, connectors, security

### Week 5
- TKT-P5-001 (AIGatewayPipeline)
- TKT-P5-002 (streak board)
- Start TKT-P8-001 (Electron headless harness)

### Week 6
- TKT-P6-001 (connector-truth-nightly)
- TKT-P7-001 (trusted-boot evidence)
- Continue TKT-P8-001

### Week 7
- TKT-P7-002 (kill-switch TTL)
- TKT-P7-003 (runbook coverage)
- TKT-P8-002 (daemons health)
- TKT-P9-001 (install receipts)

### Week 8
- TKT-P9-002 (manifest signature)
- TKT-P10-001 (proof-pack builder)
- TKT-P10-002 (trust ledger)
- 7-day AI Runtime streak attempt begins

**Critical path:** Phase 5 → Phase 8 (runtime proof) → Phase 7 (security closure).
**Parallel tracks:** Phase 6 (connectors), Phase 9 (apps), Phase 10 (advisors).
**No-go conditions:** Electron headless harness not producing heartbeat artifact by end of week 6.

## Days 61–90 — Admin, onboarding, final gates, hardening

### Week 9
- TKT-P11-001 (OperatorHome)
- TKT-P11-002 (legacy shell deprecation)
- TKT-P12-001 (onboarding telemetry)

### Week 10
- TKT-P12-002 (onboarding funnel UI)
- TKT-P13-001 (mobile deferment readiness)
- TKT-P14-001 (evidence-graph-builder + UI)

### Week 11
- TKT-P14-002 (launch-honesty matrix)
- TKT-P14-003 (signed aggregator)
- 7-day streak completion check (§24 Yellow→Green)

### Week 12
- TKT-P15-001 (profile-aware preload)
- TKT-P15-002 (service health dashboard)
- Final release readiness review
- Sign `release_decisions` row for v1.0 launch

**Critical path:** Phase 14 (final closure).
**Parallel tracks:** Phase 11 (admin IA), Phase 12 (onboarding), Phase 13 (mobile honesty), Phase 15 (hardening).
**No-go conditions for v1.0 launch:**
- Any BLOCK validator red.
- AI Runtime streak <7 days.
- Electron headless harness not running per release.
- `evidence-graph.json` <100% claim coverage.
- `launch-honesty-matrix.json` not signed.

---

## Closing Directive

This blueprint converts the v3 audit's 64 sections into 50+ tickets, 47 validators, 10 migrations, 9 edge functions, 6 generated bundles, and a 12-week build sequence. Execute Phase 0 first; everything else depends on it. Maintain launch honesty: mobile stays honestly-deferred until accounts arrive; AI Runtime stays Yellow until the 7-day streak is computed and proven.

Build it. Prove it. Ship it.

— END BLUEPRINT v1.0 —
