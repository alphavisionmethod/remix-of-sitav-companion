

## Audit findings (live)

**Already in place — DO NOT duplicate:**
- Real `secret-rotation-orchestrator` edge function with secret taxonomy (push/comms/ai/auth/storage)
- `security-anomaly-rotation-trigger` edge function (dry-run only, dual-admin gated)
- 7-layer Electron security fabric: `runtime-shield.cjs`, `dlp-guard.cjs`, `network-sentinel.cjs`, `integrity-check.cjs`, `license-guard.cjs` + `os-security/` (sessiond, secretsd, auditd, policyd)
- Canonical runtime-host abstraction already exists at `src/runtimes/`: `RuntimeTierProvider`, `runtime-detection.ts`, `desktop-runtime-detection.ts`, `feature-runtime-tier-registry.ts` — this IS the canonical adapter (no need for a 2nd abstraction)
- `src/lib/ux-trust/` (microcopy + ux-principles) and 7 frontend-polish gates including `trust-copy-quality`
- 171 BLOCK gates wired in `check-os-release-readiness.ts`
- AI Engineer hub at `src/pages/admin/ai-runtime/AIRuntimeHome.tsx` with 6 truth panels (mount point for new panel)
- `RUNTIME_TIER_GOVERNANCE_REPORT.md` and portability registries in `src/runtimes/`

**Real gaps (not yet implemented):**

*Section A — Secret rotation cadence:*
- Orchestrator exists but NO codified cadence policy per secret class (rotation interval, owner, stale threshold)
- No freshness validator that fails CI when a secret class is overdue
- No `secret_rotation_log` durable evidence table tracking real rotation runs

*Section B — Adversarial proof:*
- Zero adversarial validators (RLS-under-stress, Electron threat detection, debugger/tamper, session-threat behavior)
- No `SECURITY_FINDINGS_REGISTER` model — findings have no closure-loop tracking

*Section C — Browser-only assumptions in shared logic:*
- 4 shared hooks directly access `window` without going through the canonical `useRuntimeTier()` adapter:
  - `src/hooks/useAppStatePersistence.ts` (window.scrollY, scroll listeners)
  - `src/hooks/use-zero-latency.ts` (window.scrollY/scrollTo)
  - `src/hooks/use-session-restore.ts` (window.location.pathname, scrollTo)
  - `src/hooks/useSetupOrchestration.ts` (window.addEventListener beforeunload)
- `useReducedMotion`, `useWindowSnap`, `use-mobile`, `useElectronBridge` are correctly scoped (browser-leaf or already adapter-routed) → leave alone
- No `check-no-browser-trapped-shared-hooks` or `check-portability-boundaries` validator

*Section D — Hub UI:*
- No "Security & Portability Truth" panel on AI Engineer hub

**Scope rule (per user):** All NEW UI lives ONLY on Admin AI Engineer hub (`AIRuntimeHome.tsx`) as 1 new truth-panel tab. Validators in canonical `scripts/validation/`. Generated evidence in canonical `generated/security-and-portability-closure/`. **Zero edits to other admin domains.**

---

## Phase 1 — Secret rotation cadence (codified + enforced)

### 1A. Database — durable rotation evidence (1 migration)
Create `secret_rotation_log` table:
- columns: `id uuid PK`, `secret_class text`, `secret_name text`, `rotated_at timestamptz`, `rotated_by uuid`, `dry_run bool`, `result jsonb`, `cadence_due_at timestamptz`
- RLS: admin-only SELECT/INSERT via existing `has_role(auth.uid(),'admin')`
- Index on `(secret_class, rotated_at DESC)` for freshness lookups
- Realtime publication for live truth panel

### 1B. Cadence policy (1 canonical model file + 1 status mate)
- `src/lib/security/secret-rotation-cadence.ts` — typed registry: per-class `{class, intervalDays, ownerRole, backupOwnerRole, staleThresholdDays, alertSeverity}`. Classes: `push` (90d), `comms` (180d), `ai` (90d), `auth` (control-plane), `storage` (control-plane), `webhook-signing` (90d), `attestation-signing` (180d), `audit-export-hmac` (180d)
- `generated/security-and-portability-closure/secret-rotation-status.json` — emitter reads `secret_rotation_log` + cadence registry, computes per-class freshness/overdue state

### 1C. Wire orchestrator → log
Edit `supabase/functions/secret-rotation-orchestrator/index.ts` to INSERT a row into `secret_rotation_log` on every plan execution (dryRun included), with `cadence_due_at = now() + interval`.

### 1D. Cadence emitter + 2 validators
- `scripts/validation/emit-secret-rotation-status.ts` — queries DB, emits status JSON
- `scripts/validation/check-secret-rotation-cadence.ts` — asserts every class in registry has a policy entry; fails BLOCK if cadence/owner missing
- `scripts/validation/check-secret-rotation-freshness.ts` — asserts no class is past `staleThresholdDays`; honest WARN-tier for `auth`/`storage` (control-plane-blocked)

---

## Phase 2 — Adversarial validation evidence (5 validators + register)

Each validator does REAL work (no stubs); honest WARN-tier where evidence requires real execution.

### 2A. `check-rls-under-stress.ts` (~80 LOC)
- Reads `generated/security-and-portability-closure/rls-stress-runs/*.json` (evidence files)
- Required: ≥1 run in last 90 days with: concurrent multi-tenant probe, SECURITY DEFINER coverage check, edge-condition policy bypass attempt
- Honest WARN if zero runs ("pending-execution"); BLOCK if any run shows isolation breach
- Companion script `os/scripts/run-rls-stress-probe.sh` — real psql-based concurrent probe (uses existing `PG*` env), writes evidence file

### 2B. `check-electron-threat-detection-proof.ts` (~60 LOC)
- Scans `electron/runtime-shield.cjs`, `dlp-guard.cjs`, `network-sentinel.cjs` for required detection paths (anti-debug, screenshot block, domain allowlist)
- Reads `electron/__threat_drills__/*.json` evidence files
- Honest `partner-blocked` if no Electron-build environment available

### 2C. `check-debugger-tamper-proof.ts` (~50 LOC)
- Verifies `runtime-shield.cjs` exports debugger-detection + integrity-check hooks
- Verifies `integrity-check.cjs` ASAR hash check is wired
- Reads tamper-drill evidence; honest WARN where real-device drill required

### 2D. `check-session-threat-behavior.ts` (~50 LOC)
- Scans `src/lib/security/` and `os-security/sessiond.ts` for behavioral thresholds + anomaly response
- Reads `generated/security-and-portability-closure/session-threat-runs/*.json`
- Asserts admin visibility wired (existing `kill_switch_audit_log` linkage)

### 2E. `check-security-adversarial-proof.ts` (meta, ~70 LOC)
- Aggregates the 4 above + reads `SECURITY_FINDINGS_REGISTER` JSON mate
- Asserts every claimed strong-security area has at least: a validator + an evidence file OR explicit `pending-execution` classification

### 2F. Findings register
- `generated/security-and-portability-closure/security-findings-register.json` — typed array `{id, severity, area, status: open|closed|accepted-risk|blocked-externally, opened_at, remediation_ref}`
- `SECURITY_FINDINGS_REGISTER.md` — human-readable mate

---

## Phase 3 — Browser-only hook portability (4 hook refactors + 2 validators)

### 3A. Extend canonical runtime-host adapter
Add to `src/runtimes/`:
- `runtime-host-adapter.ts` — typed surface exposing: `getScrollY()`, `setScrollY(y)`, `addBeforeUnload(fn)`, `getCurrentPath()`, `addOnlineListener(fn)`. Implementations:
  - `web/web-host-adapter.ts` — uses `window.*` (safe: only loaded in WEB_APP/DESKTOP_HOST tiers)
  - `noop/noop-host-adapter.ts` — for SIMULATED/SSR contexts
- Adapter selected via existing `RuntimeTierProvider` — single adapter, no duplicate abstraction

### 3B. Refactor 4 shared hooks to route through adapter
Edit only these 4 (per audit — no scattered defensive null-checks elsewhere):
- `src/hooks/useAppStatePersistence.ts`
- `src/hooks/use-zero-latency.ts`
- `src/hooks/use-session-restore.ts`
- `src/hooks/useSetupOrchestration.ts`

Each replaces direct `window.*` access with `useRuntimeHost()` calls. Behavior preserved in WEB_APP/DESKTOP_HOST; safe no-ops in SIMULATED.

### 3C. Two new portability validators
- `scripts/validation/check-no-browser-trapped-shared-hooks.ts` — scans `src/hooks/**/*.ts` for direct `window.`/`document.` references; allowlists 4 leaf hooks (`use-mobile`, `useReducedMotion`, `useWindowSnap`, `useElectronBridge`); fails BLOCK on new violations
- `scripts/validation/check-runtime-host-abstraction.ts` — asserts the 4 refactored hooks DO import `useRuntimeHost`; asserts no second abstraction file exists

### 3D. Portability boundary model
- `src/runtimes/portability-boundary-model.ts` — typed enum `{leaf-browser-only, shared-portable, shell-specific, adapter-routed}` + per-file classification
- `scripts/validation/check-portability-boundaries.ts` — asserts every file in `src/hooks/`, `src/lib/`, and `src/runtimes/` has a classification

---

## Phase 4 — Generated deliverables (13 files)

`generated/security-and-portability-closure/`:
- 12 markdown audits/models (per Part 5 spec): SECRET_ROTATION_CURRENT_STATE_AUDIT, SECRET_ROTATION_CADENCE_MODEL, SECURITY_ADVERSARIAL_PROOF_AUDIT, ADVERSARIAL_VALIDATION_MODEL, RLS_UNDER_STRESS_VALIDATION, ELECTRON_THREAT_DETECTION_VALIDATION, DEBUGGER_AND_TAMPER_VALIDATION, SESSION_THREAT_BEHAVIOR_VALIDATION, SECURITY_FINDINGS_REGISTER, BROWSER_ONLY_ASSUMPTION_AUDIT, RUNTIME_HOST_EXTRACTION_PLAN, PORTABILITY_BOUNDARY_MODEL
- 1 final verification: SECURITY_AND_PORTABILITY_FINAL_VERIFICATION.md
- 4 JSON status mates: secret-rotation-status, security-adversarial-proof-status, portability-boundary-status, security-and-portability-verification

All audits use LIVE evidence — no stubs.

---

## Phase 5 — UI (1 new truth panel on AI Engineer hub only)

- New `src/components/admin/ai-runtime/SecurityAndPortabilityTruthPanel.tsx` — reads `security-and-portability-verification.json` + queries `secret_rotation_log` table live for cadence freshness; same shape as existing 6 panels (Refresh button, action-oriented per `check-no-museum-boards`)
- Three sections: Secret rotation cadence table | Adversarial findings register | Portability boundary status
- Insert as new `security-portability-truth` module in `AIRuntimeHome.tsx` (after `hardware-operator-truth`)
- **Zero other admin pages touched.**

---

## Phase 6 — Wire 10 new gates into release readiness + npm scripts

### 6A. `scripts/architecture/checks/check-os-release-readiness.ts`
Add 10 new BLOCK gates (171 → 181):
- `secret-rotation-cadence`, `secret-rotation-freshness`
- `security-adversarial-proof`, `rls-under-stress`, `electron-threat-detection-proof`, `debugger-tamper-proof`, `session-threat-behavior`
- `no-browser-trapped-shared-hooks`, `runtime-host-abstraction`, `portability-boundaries`

### 6B. `package.json`
Add 4 scripts:
- `closure:security-portability:emit` (runs the 2 emitters)
- `closure:security-portability:run-all` (runs all 10 validators)
- `security:rotate:dry-run` (calls orchestrator with dryRun)
- `security:rls-stress` (runs RLS stress probe)

Update `final:closure:run-all` to include the new closure.

---

## Honest limits surfaced (no fake green)

- `check-electron-threat-detection-proof` returns `partner-blocked` WARN-tier until Electron build environment captures real drill evidence
- `check-rls-under-stress` returns `pending-execution` WARN until first stress-probe run; the `os/scripts/run-rls-stress-probe.sh` is wired and ready
- `check-secret-rotation-freshness` returns `control-plane-blocked` WARN for `auth`/`storage` classes (Lovable Cloud control plane)
- `check-debugger-tamper-proof` returns `pending-drill` WARN until real-device tamper drill recorded

Every WARN classification is reached by inspecting REAL data (DB rows, evidence files, registry entries) — never hard-coded.

---

## Files touched (final summary)

- **NEW (28):** 12 markdown audits + 4 JSON status files + 1 verification md + 5 adversarial validators + 3 portability validators + 2 cadence validators + 2 emitters + 1 truth panel UI + 1 SQL migration + 1 RLS stress script + 1 cadence registry + 1 host adapter set (3 files counted as 1) + 1 portability boundary model
- **EDITED (8):** `AIRuntimeHome.tsx` (+1 tab), `check-os-release-readiness.ts` (+10 BLOCK gates), `package.json` (+4 scripts), `secret-rotation-orchestrator` (+log writes), 4 shared hooks (refactored to adapter)
- **ZERO edits to:** other admin domains, mobile/AI runtime/connector/hardware closures (preserved GREEN), existing electron security modules (only read-scanned)

After this pass: 181 BLOCK gates total, 1 new live truth panel on AI Engineer hub, real cadence enforcement against DB, real adversarial validators that read real evidence, 4 hooks fully host-abstracted, second abstraction prevented by validator. Honest WARN-tier classification for everything blocked by real-world execution (no synthetic green).

