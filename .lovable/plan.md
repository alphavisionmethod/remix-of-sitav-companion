

# SITA OS — Runtime Truth, Manifest Governance, Infra Classification & Deployment Topology

## Scope

This is a massive production-hardening effort across 4 areas. Everything must be fully implemented with real logic, no stubs.

## Area 1: Electron Runtime Governance Layer (~10 code files, 4 docs, 6 tests)

**What exists:** `electron/*.cjs` (6 files, ~1195 LOC), contracts in `src/packages/contracts/native/` (desktop-host-runtime.ts, electron-ipc.ts), `useElectronBridge` hook, barrel at `src/runtimes/desktop/index.ts` (empty).

**What gets created:**

```text
src/lib/runtime/desktop/
├─ desktop-host-contract.ts          — Runtime model: what Electron owns, privileges, deployment assumptions
├─ desktop-host-capabilities.ts      — Capability map derived from existing contracts + actual preload API
├─ electron-bridge-contract.ts       — Typed bridge surface matching preload.cjs exactly (13 method groups)
├─ electron-bridge-capabilities.ts   — Maps each bridge method to capability ID, security class, fallback
├─ desktop-feature-gates.ts          — Runtime feature gate: isElectron + per-capability checks
├─ desktop-security-boundaries.ts    — Trust model: preload isolation, FS sandbox, secret handling
├─ desktop-update-contract.ts        — Update lifecycle matching auto-updater.cjs behavior
├─ desktop-release-channel-map.ts    — Channel registry: dev/internal/beta/production + min-version policy
├─ desktop-runtime-detection.ts      — Reliable detection (window.electron presence + platform sniffing)
└─ desktop-fallbacks.ts              — Graceful degradation map for each desktop-only capability
```

**Docs:**
```text
docs/architecture/DESKTOP_HOST_RUNTIME_MODEL.md
docs/architecture/HOST_BRIDGE_BOUNDARIES.md
docs/architecture/DESKTOP_RELEASE_MODEL.md
docs/architecture/DESKTOP_SECURITY_BOUNDARIES.md
```

**Tests:**
```text
src/test/runtime/
├─ electron-bridge.test.ts
├─ electron-capability-gates.test.ts
├─ electron-update-flow.test.ts
├─ electron-security-boundary.test.ts
├─ electron-runtime-detection.test.ts
└─ electron-fallbacks.test.ts
```

**Wiring:** Update `src/runtimes/desktop/index.ts` to re-export all. Wire into `useElectronBridge`, `use-native-shell-data`, and admin runtime views.

## Area 2: Generated Artifact Truth Framework (~11 code files, 4 docs, 7 scripts, 3 metadata outputs, 5 tests)

**What exists:** 57 flat files in `generated/` (manifests, reports, dashboards mixed together). No registry, no metadata, no ownership, no classification.

**What gets created:**

**Registry code:**
```text
src/lib/truth-manifests/
├─ manifest-registry.ts              — Every artifact: id, path, class, owner, source, validator, CI gate
├─ manifest-types.ts                 — Classes: structural, contract, runtime, compliance, informational
├─ manifest-truth-contract.ts        — Contract for what constitutes authoritative vs informational
├─ manifest-source-map.ts            — Maps artifacts to actual source inputs
├─ manifest-validator-map.ts         — Maps artifacts to validation scripts
├─ manifest-ci-gate-map.ts           — Maps critical artifacts to CI workflow gates
├─ manifest-runtime-consequence-map.ts — What breaks if drift occurs
├─ manifest-owner-map.ts             — Domain owner for each artifact
├─ manifest-consumer-map.ts          — Which pages/scripts consume each artifact
├─ manifest-drift-severity.ts        — Severity classification per artifact type
└─ manifest-health-engine.ts         — Summary: missing validators, owners, gates, stale artifacts
```

**Generated structure reorganization** (move existing files into categorized subdirectories):
```text
generated/
├─ manifests/
│  ├─ architecture/    — architecture-compliance-report, contract-manifest, etc.
│  ├─ runtime/         — runtime-conformance, runtime-ports, boot-chain, kernel, etc.
│  ├─ routes/          — route-manifest, route-tier-manifest
│  ├─ services/        — service-manifest, service-consolidation, etc.
│  ├─ capabilities/    — capability-*, feature-integration-index
│  ├─ security/        — security-model, security-review
│  ├─ deployment/      — deployment-unit-map, release-unit-map, build-output-map, ingress-topology
│  ├─ db/              — schema-registry, table-ownership, rls-policy, migration-registry, tenancy-boundary
│  └─ support/         — admin-support-visibility, operational-*
├─ reports/
│  ├─ audits/          — FULL_MASTER_AUDIT, FULL_ISSUES_AND_FIXES
│  ├─ drift/           — drift-report
│  ├─ compliance/      — infra-reality-classification-report
│  ├─ readiness/       — launch-tier-index, release-gate-thresholds, maturity-thresholds
│  └─ scorecards/      — operational-scorecards, validation-summary
├─ truth/
│  ├─ dashboards/      — production-truth-dashboard
│  ├─ runtime/         — first-boot-*, lifecycle-authority-manifest
│  ├─ launch/          — launch-tier-index
│  └─ verification/    — validation-summary
├─ baselines/
│  ├─ accessibility/   — accessibility-summary
│  └─ visual/          — visual-regression-baseline
└─ metadata/
   ├─ manifest-metadata.json
   ├─ manifest-truth-dashboard.json
   └─ manifest-drift-report.json
```

**Validation scripts:**
```text
scripts/validation/check-manifest-authority.ts
scripts/validation/check-manifest-runtime-linkage.ts
scripts/validation/check-manifest-ci-gates.ts
scripts/validation/check-manifest-schema-integrity.ts
scripts/validation/check-manifest-source-truth.ts
scripts/generate/generate-manifest-registry.ts
scripts/generate/generate-manifest-truth-dashboard.ts
```

**Tests:**
```text
src/test/manifest-truth/
├─ manifest-registry.test.ts
├─ manifest-authority.test.ts
├─ manifest-ci-gate-map.test.ts
├─ manifest-runtime-consequence-map.test.ts
└─ manifest-source-truth.test.ts
```

## Area 3: Infra Docs Reality Classification (~4 code files, 3 docs, 1 generated output, 3 tests)

**What exists:** 12 infra docs covering kernel, filesystem, memory, rendering, security, etc. No classification of what's simulated vs production.

**What gets created:**

**Code:**
```text
src/lib/runtime/
├─ reality-classification-registry.ts    — Classifies each infra doc: production/prototype/simulated/spec-only
├─ infra-runtime-classification-map.ts   — Maps doc → runtime tier → code files → tests → admin pages
├─ infra-implementation-coverage-map.ts  — Coverage: which code backs each doc claim
└─ simulated-surface-registry.ts         — Explicit registry of what's simulated-only
```

**Docs:**
```text
docs/architecture/INFRA_REALITY_CLASSIFICATION.md
docs/architecture/INFRA_TO_RUNTIME_TRUTH_MAP.md
docs/architecture/INFRA_IMPLEMENTATION_COVERAGE.md
```

**Generated:**
```text
generated/manifests/infra/infra-implementation-map.json
generated/reports/compliance/infra-reality-classification-report.md
```

**Tests:**
```text
src/test/infra/
├─ infra-reality-classification.test.ts
├─ infra-runtime-map.test.ts
└─ infra-implementation-coverage.test.ts
```

## Area 4: Deployment & Ingress Topology (~11 code files, 5 docs, 4 generated outputs, 4 validation scripts, 4 tests)

**What exists:** docker-compose.yml, Dockerfiles, kong.yml, traefik configs, nginx.conf, deploy YAMLs, ISO/OVA scripts. No unified registry.

**What gets created:**

**Code:**
```text
src/lib/deployment/
├─ deployment-unit-registry.ts       — All deployable units: web, API, brain-core, edge, desktop, mobile, appliance
├─ release-unit-map.ts               — Release units with versioning strategy
├─ rollback-behavior-map.ts          — Rollback model per unit
├─ health-probe-map.ts               — Health check endpoints per unit
├─ package-output-map.ts             — Build artifacts: web assets, Electron packages, ISO/OVA, API images
├─ runtime-deployment-map.ts         — Runtime → deployment target mapping
├─ dependency-chain-map.ts           — Inter-unit dependencies
├─ ingress-topology-registry.ts      — nginx/traefik/kong roles and routing
├─ ingress-owner-map.ts              — Ownership per ingress layer
├─ edge-ingress-classification.ts    — SPA/API/admin/webhook/connector ingress classification
└─ deployment-consequence-map.ts     — What breaks if a unit goes down
```

**Docs:**
```text
docs/architecture/INGRESS_AND_EDGE_TOPOLOGY.md
docs/architecture/DEPLOYMENT_UNIT_MAP.md
docs/architecture/BUILD_OUTPUT_AND_RELEASE_UNIT_MAP.md
docs/architecture/WEB_AND_API_DEPLOYMENT_TOPOLOGY.md
docs/architecture/APPLIANCE_DEPLOYMENT_TOPOLOGY.md
```

**Generated:**
```text
generated/manifests/deployment/deployment-unit-map.json
generated/manifests/deployment/release-unit-map.json
generated/manifests/deployment/build-output-map.json
generated/manifests/deployment/ingress-topology.json
```

**Validation:**
```text
scripts/validation/check-deployment-unit-coverage.ts
scripts/validation/check-ingress-topology.ts
scripts/validation/check-build-output-map.ts
scripts/validation/check-release-unit-completeness.ts
```

**Tests:**
```text
src/test/deployment/
├─ deployment-unit-registry.test.ts
├─ ingress-topology-registry.test.ts
├─ build-output-map.test.ts
└─ release-unit-map.test.ts
```

## Area 5: Runtime Capability & Launch Honesty Wiring (~5 code files)

```text
src/lib/runtime/
├─ product-reality-tiers.ts          — Tier system: production/prototype/simulated/spec-only
├─ runtime-capability-matrix.ts      — Cross-runtime capability matrix (web/desktop/mobile/appliance)
├─ feature-tier-registry.ts          — Every feature classified by implementation tier
├─ runtime-assertions.ts             — Runtime assertion helpers for capability checks
└─ runtime-flags.ts                  — Feature flags tied to runtime detection
```

## Area 6: Admin Visibility (7 admin page barrels + components)

New admin pages wired into existing admin barrel structure:

```text
src/pages/admin/ManifestTruthDashboard.tsx
src/pages/admin/ManifestDriftTriage.tsx
src/pages/admin/InfraRealityClassificationBoard.tsx
src/pages/admin/DeploymentUnitExplorer.tsx
src/pages/admin/IngressTopologyViewer.tsx
src/pages/admin/DesktopHostCapabilityExplorer.tsx
src/pages/admin/RuntimeTruthCoverageDashboard.tsx
```

Each reads from the actual registries in `src/lib/runtime/`, `src/lib/deployment/`, and `src/lib/truth-manifests/`.

Update `src/admin/pages/governance/index.ts` and `src/admin/pages/architecture/index.ts` to include new pages.

## Integration Points

- `src/runtimes/desktop/index.ts` — re-exports all `src/lib/runtime/desktop/*`
- `src/hooks/useElectronBridge.ts` — imports from `desktop-runtime-detection.ts` and `desktop-feature-gates.ts`
- Admin route registration for 7 new pages
- Governance map updates in `directory-organization-map.ts` and `ia-governance.ts`
- Existing `generated/*.json` files get compatibility re-exports from new locations

## File Count Summary

| Category | New Files | Modified Files |
|----------|-----------|----------------|
| Desktop runtime code | 10 | 1 (runtimes/desktop barrel) |
| Desktop docs | 4 | 0 |
| Desktop tests | 6 | 0 |
| Manifest truth code | 11 | 0 |
| Manifest docs | 4 | 0 |
| Manifest scripts | 7 | 0 |
| Manifest tests | 5 | 0 |
| Manifest metadata | 3 | 0 |
| Infra classification code | 4 | 0 |
| Infra docs | 3 | 0 |
| Infra generated outputs | 2 | 0 |
| Infra tests | 3 | 0 |
| Deployment code | 11 | 0 |
| Deployment docs | 5 | 0 |
| Deployment generated | 4 | 0 |
| Deployment validation | 4 | 0 |
| Deployment tests | 4 | 0 |
| Runtime wiring code | 5 | 0 |
| Admin pages | 7 | 2 (barrel updates) |
| Governance updates | 0 | 2 |
| **Total** | **~102** | **~5** |

## Implementation Order

1. Runtime detection + desktop code (foundation everything else builds on)
2. Manifest types + registry (needed by generated artifact reorg)
3. Generated artifact reorganization + metadata outputs
4. Infra classification registry + docs
5. Deployment registry + ingress topology
6. Runtime capability matrix + launch honesty wiring
7. Admin pages (consume all registries)
8. Tests (all areas)
9. Validation scripts
10. Governance map updates + build verification

