

## Audit Summary

**Already exists (will extend, not recreate):**
- `src/lib/control-plane/kill-switch-registry.ts` (10 switches, 163 lines) + admin page `AR08KillSwitchCenter`
- `src/lib/support/runbook-registry.ts` (10 runbooks, 189 lines) + admin page `FCC04RunbookCenter` at `/admin/founder/runbooks`
- `src/lib/policy/unified-policy-matrix.ts` (cross-domain policy entries) + `PolicySimulator`, `PolicyDecisionLedger`
- `src/lib/runtime/runtime-capability-matrix.ts` (17 capabilities × 4 surfaces) + `MSA03CapabilityPortability`, `NSS02CapabilityMatrix`
- `src/lib/backend-topology/edge-function-bounded-contexts.ts` (86 fns mapped to 13 contexts)
- `src/lib/architecture/owner-workflow-map.ts` + `route-registry.ts` + `canonical-service-registry.ts`
- 50+ architecture validation scripts incl. `check-policy-coverage.ts`, `check-policy-mapping.ts`, `check-owner-workflow-map.ts`

**Genuinely missing (must be added):**
1. No first-class **bounded-context registry** unifying frontend + backend (only edge-function map exists)
2. No **golden-path journey registry** in `src/lib/journeys/` (folder empty)
3. No **meta-architecture umbrella** (`src/lib/meta-architecture/`) tying all six systems together
4. Existing kill-switch/runbook/policy registries are **not cross-linked** to bounded contexts or journeys
5. No `docs/runbooks/*.md` per-subsystem files; no `docs/architecture/BOUNDED_CONTEXT_MAP.md`, `RUNTIME_CAPABILITY_MATRIX.md`, `KILL_SWITCH_REGISTRY.md`, `GOLDEN_PATH_JOURNEYS.md`
6. No **registry-integrity validator** asserting cross-references resolve
7. Missing admin surfaces: Bounded Context Explorer, Golden Path Explorer, Runtime Capability Explorer
8. No CI generators for context/journey/capability manifests in `generated/`

## Phased Implementation Plan

### Phase 1 — Bounded Context Registry (foundation everything else binds to)

**New code (`src/lib/architecture/`):**
- `bounded-context-types.ts` — `BoundedContext`, `BoundedContextEntry` with all 18 metadata fields from spec
- `bounded-context-registry.ts` — 13 canonical contexts (Business OS, Finance OS, Concierge OS, Investment Office, Boardroom, Mission Control, Setup/Identity, Cloud Control Plane, Integrations, Proof/Trust, Runtime/Kernel, Mobile, Admin) populated from real routes/services/edge-functions/tables
- `context-owner-map.ts`, `context-dependency-map.ts`, `context-runtime-map.ts`, `context-surface-map.ts` — derived views

**Wiring:**
- Re-export from `src/lib/architecture/index.ts`
- Update `edge-function-bounded-contexts.ts` to reference canonical context IDs
- Add `boundedContextId` field to `canonical-service-registry.ts` entries
- New script `scripts/architecture/checks/check-bounded-context-coverage.ts` — assert every route/service/edge-function/critical-table maps to a context
- New manifest generator `scripts/manifests/generate/generate-bounded-context-manifest.ts` → `generated/bounded-context-manifest.json`
- Doc: `docs/architecture/BOUNDED_CONTEXT_MAP.md`

### Phase 2 — Runtime Capability Matrix (extend existing)

**Extend existing files:**
- Expand `runtime-capability-matrix.ts` from 4 surfaces to 8 (add iOS, Android, offline, demo, real as sub-dimensions of existing surfaces)
- New `src/lib/runtime/feature-capability-registry.ts` — map app features (not just hardware capabilities) to surfaces with simulated/degraded/prohibited/roadmap states
- New `src/lib/runtime/capability-fallbacks.ts` — fallback handlers per `(capability, surface)`
- New `src/lib/runtime/capability-launch-honesty-map.ts` — bind to existing `launch-honesty-rules.ts`
- New `src/lib/runtime/surface-types.ts` — canonical surface enum

**Wiring:**
- New `check-runtime-capability-completeness.ts`
- Generator → `generated/runtime-capability-matrix.json` (extend existing generator)
- Doc: `docs/architecture/RUNTIME_CAPABILITY_MATRIX.md`

### Phase 3 — Unified Permission & Policy Matrix (extend existing)

**Extend `src/lib/policy/`:**
- Expand `unified-policy-matrix.ts` to add the 9 dimensions from spec (actor/domain/surface/trust/proof/reversibility/approval/sensitivity/tenant)
- New `policy-actor-registry.ts`, `policy-domain-map.ts`, `policy-surface-map.ts`, `policy-proof-requirements.ts`, `policy-reversibility-map.ts`, `policy-trust-thresholds.ts`, `policy-approval-map.ts`
- Re-export via `src/lib/policy/index.ts`

**Wiring:**
- Extend `check-policy-coverage.ts` to assert every privileged action has full matrix entry
- Hook into existing trust governor and approval engine import sites
- Doc: `docs/architecture/UNIFIED_PERMISSION_AND_POLICY_MATRIX.md`

### Phase 4 — Kill Switch Registry (extend & cross-link)

**Extend existing `src/lib/control-plane/`:**
- New `kill-switch-types.ts` (extract types from existing registry)
- Expand `kill-switch-registry.ts` from 10 → 14+ switches (add: model providers, workflow classes, simulations, release rollout, appliance update channels, self-healing, provider-family ingestion)
- New `kill-switch-enforcement-map.ts` — declarative enforcement points (which edge fn / service checks each switch)
- New `kill-switch-dependency-map.ts` — switch-to-switch dependencies
- New `kill-switch-runtime-consequence.ts` — what UI/runtime does on activation

**Wiring:**
- Add runtime enforcement helper `useKillSwitchGate(switchId)` consumed by edge functions and services
- New `check-kill-switch-coverage.ts` — assert high-risk subsystems have switches
- Doc: `docs/architecture/KILL_SWITCH_REGISTRY.md`

### Phase 5 — Production Runbooks (per-subsystem markdown + extend registry)

**New files:**
- `docs/runbooks/{auth-outage,provider-outage,sync-lag,stuck-workflow,proof-mismatch,generated-vs-runtime-drift,push-failure,vmware-boot-failure,release-rollback,ai-provider-degradation,connector-token-failure,setup-checkpoint-corruption,approval-queue-jam,db-restore-failure,rls-misconfig,desktop-host-bridge-failure,mobile-push-registration,runtime-probe-failure,support-escalation-failure}.md` (≈19 files)
- `docs/architecture/RUNBOOK_INDEX.md`
- New `src/lib/support/runbook-types.ts` (extract types)
- New `src/lib/support/runbook-subsystem-map.ts` — link each subsystem to its runbook IDs
- Expand `runbook-registry.ts` with `markdownRef` field pointing to docs file

**Wiring:**
- New `check-runbook-coverage.ts` — assert every kill switch has runbook ref, every critical incident class has runbook
- Bind into `FCC04RunbookCenter` admin page (already exists, just needs richer data)

### Phase 6 — Golden Path Journeys (entirely new)

**New `src/lib/journeys/`:**
- `golden-path-types.ts` — full metadata interface
- `golden-path-registry.ts` — 15 journeys (first boot, sign in, restore, connect CRM, recover stale leads, approve outbound, review proof, mobile approval, owner intervention, setup continuation, push-to-approval, OAuth+sync, workflow replay, launch readiness, env recovery)
- `journey-service-map.ts`, `journey-route-map.ts`, `journey-db-map.ts`, `journey-test-map.ts`, `journey-release-gate-map.ts`

**Wiring:**
- New `check-golden-path-coverage.ts`
- Generator → `generated/golden-path-manifest.json`
- Doc: `docs/architecture/GOLDEN_PATH_JOURNEYS.md`

### Phase 7 — Meta-Architecture Umbrella + Admin Surfaces

**New `src/lib/meta-architecture/`:**
- `index.ts` re-exporting all six registries
- `registry-integrity-validator.ts` — runtime assertion that cross-refs (context↔switch, switch↔runbook, journey↔context, etc.) resolve
- `registry-dependency-map.ts` — graph of registry interconnections
- `ownership-registry.ts` — unified owner/team map across all registries

**New admin pages (in `src/pages/admin/`):**
- `META01BoundedContextExplorer.tsx` — contexts, owners, APIs, services, tables, dependencies
- `META02RuntimeCapabilityExplorer.tsx` — feature × surface matrix with launch-honesty
- `META03GoldenPathExplorer.tsx` — journeys, screens, APIs, tables, tests, release gates, blocker state
- (Reuse existing `AR08KillSwitchCenter`, `FCC04RunbookCenter`, `PolicyDecisionLedger`)

**Wiring:**
- Register new pages in `admin-route-registry.ts` under appropriate domains
- Add to `AdminRoutes.tsx` with permission gates
- New `scripts/architecture/checks/check-registry-integrity.ts` runs all six coverage checks + cross-link integrity
- Add to CI pipeline via `package.json` script

### Phase 8 — CI Validation, Generated Manifests, Drift Gates

- Generators: `bounded-context-manifest.json`, `golden-path-manifest.json`, `runtime-capability-matrix.json` (extend), `kill-switch-manifest.json`, `runbook-index.json`, `meta-architecture-integrity.json`
- New scripts in `scripts/architecture/checks/`:
  - `check-bounded-context-coverage.ts`
  - `check-runtime-capability-completeness.ts`
  - `check-kill-switch-coverage.ts`
  - `check-runbook-coverage.ts`
  - `check-golden-path-coverage.ts`
  - `check-registry-integrity.ts`
- Wire all into existing `architecture-report.ts`
- Update `package.json` with `meta:audit` command running all six

## Technical Notes (for engineers)

- All registries follow existing `readonly`/`as const` immutable pattern used by `kill-switch-registry.ts`
- Use existing `ViolationCollector` from `scripts/architecture/lib/utils.ts` for new checks
- Bounded context IDs become foreign keys: `KillSwitchEntry.boundedContextId`, `RunbookEntry.boundedContextId`, `GoldenPathEntry.primaryContextId`, `CanonicalService.boundedContextId`
- Admin pages use `AdminControlPlaneShell` and follow registry-driven nav pattern
- New routes added under domains: `Trust-Security` (kill-switches, policy), `Health` (runbooks, capability), `Verification` (bounded-context, golden-paths)
- Permission gates use existing granular system: `system.kill_switch`, `policy.manage`, `architecture.view`, `runbook.view`
- Zero stubs: every registry entry must point to a real file path verified to exist; coverage checks fail CI on dangling refs
- Total new files: ~58 (6 docs/architecture + 19 docs/runbooks + 28 src/lib + 3 admin pages + 6 scripts + 2 generators)

## Deliverables per Phase

| Phase | Files | LoC est. | CI Check |
|---|---|---|---|
| 1. Bounded Contexts | 7 lib + 1 doc + 1 script + 1 generator | ~1200 | `check-bounded-context-coverage` |
| 2. Capability Matrix | 4 lib (extend 1) + 1 doc + 1 script | ~800 | `check-runtime-capability-completeness` |
| 3. Policy Matrix | 7 lib (extend 1) + 1 doc | ~900 | extend `check-policy-coverage` |
| 4. Kill Switches | 4 lib (extend 1) + 1 doc + 1 script | ~700 | `check-kill-switch-coverage` |
| 5. Runbooks | 19 md + 3 lib + 1 doc + 1 script | ~1500 | `check-runbook-coverage` |
| 6. Golden Paths | 6 lib + 1 doc + 1 script + 1 generator | ~1100 | `check-golden-path-coverage` |
| 7. Meta-Arch + Admin | 4 lib + 3 pages + route updates | ~1800 | `check-registry-integrity` |
| 8. CI/Manifests | 6 generators + report integration | ~600 | `meta:audit` umbrella |

