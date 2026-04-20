

## Wave 12 — Full Systems Integration Pass (Production Closure)

### PART 1 — Canonical Systems To Keep (Do Not Duplicate)

These are the authoritative implementations. All new work must extend them, never duplicate.

| System | Canonical Path | Status |
|---|---|---|
| Runtime Detection | `src/runtimes/runtime-detection.ts` | Canonical, 6 consumers |
| Runtime Capability Matrix | `src/runtimes/runtime-capability-matrix.ts` | Canonical, 17 capabilities |
| Feature Runtime Tier Registry | `src/runtimes/feature-runtime-tier-registry.ts` | Canonical, 48 features |
| Desktop Host Contract | `src/runtimes/desktop/desktop-host-contract.ts` | Canonical, 12 privileges |
| Electron Bridge Contract | `src/runtimes/desktop/electron-bridge-contract.ts` | Canonical |
| Appliance Recovery Contract | `src/runtimes/appliance/recovery-contract.ts` | Canonical, 5 actions |
| Appliance First-Boot Contract | `src/runtimes/appliance/first-boot-contract.ts` | Canonical |
| Appliance Runtime Contract | `src/runtimes/appliance-runtime-contract.ts` | Canonical, 11 capabilities |
| App Platform | `src/lib/app-platform/` (22 files) | Canonical |
| Window Manager | `src/hooks/useWindowManager.ts` + `src/contexts/WindowManagerContext.tsx` | Canonical |
| Route Registry | `src/platform/architecture/route-registry.ts` | Canonical |
| Admin Route Registry | `src/platform/architecture/admin-route-registry.ts` | Canonical |
| Kill-Switch Registry | `src/lib/control-plane/kill-switch-registry.ts` | Canonical, 18 entries |
| Golden Path Registry | `src/lib/operations/golden-path-registry.ts` | Canonical, 15 paths |
| Edge Function Owner Map | `src/lib/backend-topology/edge-function-owner-map.ts` | Canonical, 193 functions |
| Bounded Context Registry | `src/platform/architecture/bounded-context-registry.ts` | Canonical |
| Release Readiness Aggregator | `scripts/architecture/checks/check-os-release-readiness.ts` | Canonical, 248 gates |

### PART 2 — Duplicate/Shadow Systems To Eliminate

| Duplicate | Canonical Alternative | Action |
|---|---|---|
| `src/runtimes/appliance/appliance-runtime-contract.ts` | `src/runtimes/appliance-runtime-contract.ts` (root-level) | Consolidate — one is likely a re-export or stale copy. Verify and merge. |
| `src/platform/runtime/index.ts` (barrel of hooks) | `src/runtimes/` (runtime detection layer) | Rename barrel to avoid confusion — this is OS hooks, not runtime detection. |
| `src/platform/support/index.ts` (empty barrel) | No canonical support module exists | Wire support-bundle logic into this barrel or remove |
| `src/platform/proof/index.ts` (barrel) vs `src/lib/platform/proof/` | Verify single canonical path | Consolidate if both exist |

### PART 3 — Full Integration Plan

#### 3.1 Runtime Authority Closure

**Gap**: No single `runtime-authority.ts` facade. Detection, capabilities, and feature-tier mapping are in 3 separate files with no unified closure artifact.

**Files to create**:
- `src/runtimes/runtime-authority.ts` — facade that combines `detectActiveRuntimeTier()`, `getCapabilitiesForSurface()`, and `isFeatureSupportedOn()` into one authoritative API
- `src/runtimes/runtime-surface-contract.ts` — typed contract for all 4 surfaces with fallback/blocked declarations
- `generated/runtime-capability-closure.json` — generated proof showing every feature × surface resolution
- `scripts/architecture/checks/check-runtime-authority.ts` — validator ensuring facade consistency

**Files to modify**:
- `src/runtimes/runtime-capability-matrix.ts` — add `blocked` entries alongside `unavailable` for hard-blocked features
- `src/runtimes/feature-runtime-tier-registry.ts` — add `mobileCapacitor` surface column

**Wiring**: RuntimeProvider context → consumes `runtime-authority.ts` → components query via `useRuntimeAuthority()` hook

#### 3.2 OS / Appliance Boot Chain & Recovery

**Gap**: Boot chain contract exists (`boot-chain-manifest.json` in generated/) but no typed implementation contract. Recovery contract has `implementationLocation: null` for 3 of 5 actions.

**Files to create**:
- `src/runtimes/appliance/boot-chain-contract.ts` — typed boot chain stages (firmware → bootloader → verity → initramfs → systemd → sita-os.service → shell)
- `src/runtimes/appliance/platform-daemon-registry.ts` — registry of healthd/settingsd/crashd/timed/accessibilityd with dependency graph
- `generated/os-boot-proof-bundle.json` — aggregated boot chain evidence
- `generated/recovery-path-verification.json` — maps each RecoveryAction to implementation evidence
- `generated/runtime-degradation-matrix.json` — what happens when each daemon fails
- `scripts/architecture/checks/check-os-boot-recovery-closure.ts` — validates recovery actions have non-null implementations

**Files to modify**:
- `src/runtimes/appliance/recovery-contract.ts` — fill `implementationLocation` for soft-restart, ota-rollback, factory-reset

#### 3.3 Desktop Host / Windowing Closure

**Gap**: Window manager exists as a hook (`useWindowManager.ts`, 161 lines) with localStorage persistence but no typed registry, no crash-safe restore, no permission boundaries, no generated proof.

**Files to create**:
- `src/lib/windowing/window-registry.ts` — typed registry of all launchable windows with app identity, permissions, and default dimensions
- `src/lib/windowing/window-session-store.ts` — sessionStorage-backed state persistence with crash-safe restore (extends current `MEMORY_KEY` pattern)
- `src/lib/windowing/window-recovery.ts` — crash-safe restore: on boot, detect unclean shutdown → offer "Restore previous session?"
- `src/lib/windowing/window-capability-policy.ts` — per-window permission boundaries (which windows can IPC to which)
- `generated/windowing-closure.json` — proof of window lifecycle coverage
- `scripts/runtime/checks/check-desktop-windowing-closure.ts` — validates registry completeness

**Files to modify**:
- `src/hooks/useWindowManager.ts` — import registry for type-safe window creation, add crash-detection flag
- `src/contexts/WindowManagerContext.tsx` — expose recovery state

#### 3.4 App Platform Lifecycle Closure

**Gap**: App platform has 22 files but no generated lifecycle closure proof, no permission audit artifact, no crash recovery manager.

**Files to create**:
- `src/lib/app-platform/app-recovery-manager.ts` — crash detection + restart with state snapshot
- `generated/app-lifecycle-closure.json` — maps each app type (A-D) through install → launch → run → update → remove → recover
- `generated/app-permission-audit.json` — all declared permissions × consent status
- `scripts/architecture/checks/check-app-lifecycle-closure.ts` — validates lifecycle completeness

**Files to modify**:
- `src/lib/app-platform/install-state.ts` — add `crashed` and `recovering` states
- `src/lib/app-platform/launch-resolver.ts` — add crash-recovery launch path

#### 3.5 Route / Shell / Profile Canonicalization

**Gap**: Route registry exists but no route-to-runtime or route-to-profile mapping artifact. Dead pages identified (12) but not quarantined.

**Files to create**:
- `src/platform/architecture/route-runtime-map.ts` — maps each route to supported runtime surfaces
- `src/platform/architecture/route-profile-map.ts` — maps routes to deployment profiles (user/operator)
- `src/platform/architecture/page-owner-map.ts` — maps each page file to domain owner
- `generated/route-closure-matrix.json` — every route × plane × runtime × profile × auth × shell
- `scripts/architecture/checks/check-route-plane-runtime-profile-consistency.ts` — validates matrix completeness

**Files to modify**:
- `src/platform/architecture/route-registry.ts` — add `runtime` and `profile` fields to `RouteEntry`

#### 3.6 Frontend Canonicalization

**Files to create**:
- `src/lib/frontend/truth-surface-registry.ts` — declares which pages require AI truth disclosures
- `src/lib/frontend/page-state-contract.ts` — standard loading/error/empty/retry contract
- `generated/component-duplication-report.json` — identifies duplicate component families
- `generated/frontend-closure-bundle.json` — truth-primitive coverage on all truth-sensitive surfaces
- `scripts/frontend/check-component-canonicalization.ts` — identifies duplicate families
- `scripts/frontend/check-truth-surface-coverage.ts` — validates truth primitives on required pages

#### 3.7 Database Authority & Lineage

**Gap**: 420 tables exist, bounded context registry exists, but no generated authority map, no index coverage audit, no retention policy matrix.

**Files to create**:
- `generated/db-authority-map.json` — tables grouped by bounded context with authority owner
- `generated/db-bounded-context-map.json` — cross-reference of contexts to tables, functions, edge functions
- `generated/db-index-coverage.json` — TTL/expires_at columns with index status
- `generated/db-retention-policy-matrix.json` — retention/archive declarations per table family
- `generated/db-lineage-coverage.json` — receipt/approval/workflow lineage chains
- `scripts/db/checks/check-index-and-retention-coverage.ts` — validates indexes on TTL columns
- `scripts/db/checks/check-lineage-closure.ts` — validates lineage chain completeness

#### 3.8 Edge Function Canonicalization

**Gap**: 193 functions have ownership but no caller-class enforcement, no generated topology v2 with role purity.

**Files to create**:
- `supabase/functions/_shared/function-role-contract.ts` — enum of 8 function roles (PUBLIC_BFF, ADMIN_BFF, DOMAIN, ORCHESTRATION, WEBHOOK, RUNTIME_SYSTEM, VERIFIER, SUPPORT)
- `generated/edge-function-topology-v2.json` — every function with role, callers, DB deps, receipt coverage
- `generated/function-caller-matrix.json` — explicit caller → function map
- `generated/function-proof-coverage.json` — which functions emit receipts

#### 3.9 Integration / Provider Closure

**Gap**: No integration health matrix, no OAuth security closure artifact, no provider refresh proof bundle.

**Files to create**:
- `generated/integration-health-matrix.json` — per-provider health state, refresh lifecycle, kill-switch binding
- `generated/oauth-security-closure.json` — token encryption status, expiry indexing, refresh path proof
- `generated/provider-refresh-closure.json` — refresh success rate, dead-letter path, retry policy
- `scripts/integrations/check-provider-refresh-closure.ts` — validates refresh lifecycle completeness
- `scripts/integrations/check-oauth-security-closure.ts` — validates token security

#### 3.10 AI / Advisor / Boardroom Closure

**Gap**: No advisor permission matrix, no escalation policy, no reversibility map, no capability proof matrix.

**Files to create**:
- `src/lib/ai-platform/runtime/advisor-permission-matrix.ts` — maps advisor roles to allowed action types
- `src/lib/ai-platform/runtime/advisor-escalation-policy.ts` — rules for when advisors escalate to human
- `src/lib/ai-platform/runtime/advisor-reversibility-map.ts` — classifies each advisor action as reversible/irreversible
- `generated/ai-capability-proof-matrix.json` — every AI capability with fallback proof
- `generated/advisor-action-reversibility-report.json` — full reversibility classification
- `generated/boardroom-proof-chain.json` — recommendation → evidence → outcome trace
- `scripts/ai/check-ai-capability-proof.ts` — validates fallback chains exist
- `scripts/ai/check-advisor-reversibility.ts` — validates reversibility declarations

#### 3.11 Admin / Operator / Support Closure

**Gap**: Empty support barrel, no support-bundle builder, no admin surface closure artifact.

**Files to create**:
- `src/platform/support/support-bundle-builder.ts` — collects runtime state, errors, config, recent logs into redacted bundle
- `src/platform/admin/admin-ia-registry.ts` — canonical admin IA with domain → hub → page hierarchy
- `src/platform/admin/operator-workflow-map.ts` — maps 5 workflows (daily/weekly/support/release/trust-safety) to admin routes
- `generated/admin-surface-closure.json` — every admin page links to evidence + runbook + kill-switch
- `generated/support-readiness-report.json` — support bundle generation capability status
- `generated/runbook-linkage-coverage.json` — every runbook linked to systems, switches, and drill receipts
- `scripts/admin/check-admin-surface-canonicalization.ts` — validates admin IA consistency
- `scripts/support/check-runbook-linkage.ts` — validates runbook cross-references

#### 3.12 Runbook / Recovery / Safety

**Files to create**:
- `src/lib/operations/recovery-execution-engine.ts` — programmatic recovery step executor with receipt emission
- `generated/recovery-drill-results.json` — latest drill receipt per runbook
- `generated/runbook-coverage-gaps.json` — systems without runbook coverage
- `scripts/support/check-recovery-drill-freshness.ts` — validates drill recency

#### 3.13 Release / Artifact / Deployment

**Gap**: Desktop signing status exists as `generated/desktop-signing-status.json` but no provenance attestation bundle, no rollback verification proof.

**Files to create**:
- `generated/release-artifact-proof/desktop-signing-report.json` — notarization path status
- `generated/release-artifact-proof/os-boot-ci-matrix.json` — CI validation of bootable artifacts
- `generated/release-provenance-attestation.json` — artifact provenance chain
- `generated/rollback-verification.json` — rollback path declared and tested per surface
- `scripts/release/check-artifact-proof-closure.ts` — validates proof pack completeness
- `scripts/release/check-evidence-graph-completeness.ts` — validates evidence graph covers all critical workflows

#### 3.14 Mobile Honesty Mode

**Gap**: Mobile deferral attestation exists in DB but no generated readiness pack.

**Files to create**:
- `generated/mobile-readiness-pack.json` — code readiness vs store readiness matrix
- `generated/mobile-deferment-honesty-report.json` — explicit distribution blockers with closure path

### PART 4 — End-to-End Wiring Instructions

**Route → Hook → Facade → BFF → DB → Evidence → Admin**:
1. Route declared in `route-registry.ts` with plane/runtime/profile/shell
2. Page component uses domain hook (e.g., `useBusinessData`)
3. Hook calls service facade (`src/services/index.ts`)
4. Facade invokes edge function via `supabase.functions.invoke()`
5. Edge function queries DB with RLS, emits receipt to `ai_action_receipts`
6. Generated evidence flows to `evidence_graph_nodes`
7. Admin board reads receipts via read-only projection

**App Install → Permission → Launch → Lifecycle → Recovery**:
1. `AppPlatformContext` processes manifest via `manifest-schema.ts`
2. `permission-engine.ts` evaluates required permissions
3. `launch-resolver.ts` determines launch strategy (embedded/external/native/trusted)
4. `install-state.ts` tracks lifecycle (installing → installed → running → crashed → recovering)
5. `app-recovery-manager.ts` snapshots state on crash, offers restore on relaunch

**Advisor → Approval → Execution → Receipt → Rollback**:
1. Advisor generates recommendation with confidence score
2. `advisor-permission-matrix.ts` gates by action type
3. `advisor-escalation-policy.ts` checks if human approval needed
4. Execution emits receipt to `ai_action_receipts` via orchestration facade
5. `advisor-reversibility-map.ts` determines if undo path exists
6. Rollback path stored in receipt for operator visibility

**Connector OAuth → Refresh → Sync → Health → Support**:
1. OAuth token stored (encrypted at rest per Wave 8)
2. Hourly pg_cron refresh via `connector-reauth-tracker`
3. Sync result persisted to domain tables
4. Health state exposed in `integration-health-matrix.json`
5. Kill-switch binding via `kill-switch-dependency-map.ts`
6. Support diagnostics included in support bundle

**Desktop Boot → Detection → Shell → Watchdog → Recovery**:
1. `runtime-detection.ts` detects Electron via `isElectronRuntime()`
2. `runtime-authority.ts` resolves capabilities for DESKTOP_HOST
3. `ShellLayout.tsx` mounts `WindowManagerContext`
4. `window-recovery.ts` checks for unclean shutdown
5. Watchdog (Nova SDK `ServiceWatchdog`) monitors heartbeats
6. On failure, crash state persisted, recovery offered on restart

**Build → Validation → Proof → Gate → Deploy**:
1. `npm run build` produces dist/
2. 248 BLOCK gates run via `check-os-release-readiness.ts`
3. Generated proofs emitted to `generated/`
4. Release gate aggregates proof artifacts
5. Deploy artifact published per surface (web CDN / Electron packager / ISO builder)

### PART 5 — Validators and Generated Artifacts

| Validator | Output | Blocking | Owner |
|---|---|---|---|
| `scripts/architecture/checks/check-runtime-authority.ts` | `generated/runtime-capability-closure.json` | BLOCK | Runtime |
| `scripts/architecture/checks/check-route-plane-runtime-profile-consistency.ts` | `generated/route-closure-matrix.json` | BLOCK | Architecture |
| `scripts/frontend/check-component-canonicalization.ts` | `generated/component-duplication-report.json` | Advisory | Frontend |
| `scripts/frontend/check-truth-surface-coverage.ts` | `generated/frontend-closure-bundle.json` | BLOCK | Frontend |
| `scripts/runtime/checks/check-desktop-windowing-closure.ts` | `generated/windowing-closure.json` | Advisory | Desktop |
| `scripts/architecture/checks/check-os-boot-recovery-closure.ts` | `generated/os-boot-proof-bundle.json` | BLOCK | OS |
| `scripts/db/checks/check-index-and-retention-coverage.ts` | `generated/db-index-coverage.json` | Advisory | DB |
| `scripts/db/checks/check-lineage-closure.ts` | `generated/db-lineage-coverage.json` | Advisory | DB |
| `scripts/integrations/check-provider-refresh-closure.ts` | `generated/provider-refresh-closure.json` | BLOCK | Integrations |
| `scripts/integrations/check-oauth-security-closure.ts` | `generated/oauth-security-closure.json` | BLOCK | Security |
| `scripts/ai/check-ai-capability-proof.ts` | `generated/ai-capability-proof-matrix.json` | BLOCK | AI |
| `scripts/ai/check-advisor-reversibility.ts` | `generated/advisor-action-reversibility-report.json` | Advisory | AI |
| `scripts/admin/check-admin-surface-canonicalization.ts` | `generated/admin-surface-closure.json` | Advisory | Admin |
| `scripts/support/check-runbook-linkage.ts` | `generated/runbook-linkage-coverage.json` | BLOCK | Operations |
| `scripts/release/check-artifact-proof-closure.ts` | `generated/release-provenance-attestation.json` | BLOCK | Release |
| `scripts/release/check-evidence-graph-completeness.ts` | `generated/evidence-graph-completeness-v2.json` | BLOCK | Release |
| `scripts/architecture/checks/check-app-lifecycle-closure.ts` | `generated/app-lifecycle-closure.json` | Advisory | App Platform |

### PART 6 — Deployment-Ready Closure Checklist

Before calling the project fully wired and deployment-ready, ALL must be true:

- [ ] Runtime authority facade exists and unifies detection + capabilities + feature gates
- [ ] Every route has plane + runtime + profile + auth + shell mapping
- [ ] Window manager has typed registry, crash-safe restore, and permission boundaries
- [ ] App platform has lifecycle closure proof covering install → crash → recovery
- [ ] Boot chain contract is typed with daemon dependency graph
- [ ] Recovery contract has non-null implementations for all 5 actions
- [ ] Database authority map groups all 420 tables by bounded context
- [ ] Edge function topology v2 classifies all 193 functions by role with caller matrix
- [ ] Integration health matrix covers all providers with refresh/retry/kill-switch
- [ ] AI capability proof matrix validates fallback chains for all capabilities
- [ ] Advisor permission matrix + escalation policy + reversibility map exist
- [ ] Support bundle builder can generate redacted diagnostic package
- [ ] Runbook linkage covers all high-risk subsystems
- [ ] Release provenance attestation exists per deployment surface
- [ ] Mobile deferment is honestly documented with explicit blockers
- [ ] All 17 new validators are wired into aggregator
- [ ] No duplicate system remains active alongside its canonical version
- [ ] MASTER_AUDIT.md v4.0 reflects all new artifacts and gates

### PART 7 — Implementation Rules

1. **Never duplicate canonical code** — search `src/runtimes/`, `src/platform/architecture/`, `src/lib/control-plane/`, `src/lib/operations/`, `src/lib/app-platform/` before creating anything
2. **Always search before creating** — use `code--search_files` for any concept before adding a file
3. **Always wire end-to-end** — no orphan contract without consumer, no consumer without contract
4. **Always add proof artifacts** — every new subsystem emits a `generated/*.json` artifact
5. **Always update validators/gates** — new BLOCK gates must be registered in `check-os-release-readiness.ts`
6. **Always preserve honesty** — if implementation is `null`, mark as `roadmap`, never `real`
7. **Always leave a stronger canonical system** — extend existing registries rather than creating parallel ones
8. **Consolidate the `src/runtimes/appliance/appliance-runtime-contract.ts` duplicate** before adding appliance logic
9. **Wire `src/platform/support/index.ts`** with real exports before using it as an import path
10. **All new generated artifacts must be mirrored** to `public/generated/` if they appear in the audit

### Summary of Scope

- **~50 new files** (contracts, registries, validators, generated artifacts)
- **~15 modified files** (extending existing canonical systems)
- **~3 consolidated duplicates**
- **17 new validators** wired into aggregator
- **~25 new generated proof artifacts**
- **0 new database migrations** (pure architecture/contract/evidence layer)
- **MASTER_AUDIT.md v4.0** reflecting all changes

This will be implemented in sequential sub-waves to avoid conflicts:
1. Runtime authority + OS/appliance contracts (3.1, 3.2)
2. Desktop/windowing + app platform (3.3, 3.4)
3. Routes/frontend canonicalization (3.5, 3.6)
4. DB authority + edge function topology (3.7, 3.8)
5. Integrations + AI/advisor (3.9, 3.10)
6. Admin/support + runbooks + release + mobile (3.11-3.14)
7. All validators + aggregator wiring + MASTER_AUDIT v4.0

