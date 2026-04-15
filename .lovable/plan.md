

# Runtime Truth Layer — `src/lib/runtime/`

## What This Adds

A single formal runtime truth layer that unifies scattered runtime-like code (surface detection, feature flags, service startup, reality classification, recovery, host bridges) into one canonical location. This layer answers: "What is running, where, in what mode, with what capabilities, and what happens when it fails?"

## Existing Code to Integrate (Not Duplicate)

| Existing Module | What It Does | Runtime Layer Treatment |
|----------------|-------------|------------------------|
| `services/surface-detection/` | Detects Electron/PWA/Capacitor/Mobile/Web | `runtime-detection.ts` re-exports and extends |
| `dual-reality/reality-mode-registry.ts` | real/demo/sandbox modes | `runtime-truth-classification.ts` references, does not duplicate |
| `dual-reality/surface-class-registry.ts` | admin_os/user_app surface classes | `simulated-surface-registry.ts` references |
| `os-services/recovery-levels.ts` | 8-level repair escalation | `recovery-behavior-registry.ts` references |
| `os-services/app-lifecycle.ts` | 12-state app lifecycle | `service-lifecycle-registry.ts` references |
| `core-services/self-healing/fleet-health.ts` | Service health records | `service-failure-consequence-map.ts` references |
| `scripts/generate-startup-order.ts` | Startup phase ordering | `service-startup-order.ts` replaces with importable TS |
| `packages/contracts/runtime/` | SurfaceType, ActiveSurface contracts | All runtime files import from contracts |

## New Files (26 files, 0 duplicates)

```text
src/lib/runtime/
├─ index.ts                          — barrel export
├─ runtime-detection.ts              — extends surface-detection with full RuntimeTarget enum
├─ runtime-context.ts                — unified RuntimeContext (surface + mode + capabilities + trust)
├─ runtime-flags.ts                  — typed runtime feature flags (not feature flags — runtime behavior switches)
├─ runtime-assertions.ts             — runtime invariant checks (assert surface, assert mode, assert capability)
├─ runtime-truth-classification.ts   — maps every route/feature to its truth tier (proven/simulated/presentational)
├─ runtime-capability-matrix.ts      — what capabilities exist per runtime target (web/desktop/mobile/appliance)
├─ runtime-feature-registry.ts       — registry of features with their runtime requirements
├─ product-reality-tiers.ts          — tiered reality classification (T1 proven → T4 presentational)
├─ runtime-message-registry.ts       — canonical message types that flow through the system
├─ runtime-transport-map.ts          — maps message types to transport mechanisms (ws/http/ipc/local)
├─ message-trust-classification.ts   — classifies messages by trust level (verified/standard/untrusted)
├─ message-replay-policy.ts          — replay/idempotency rules per message type
├─ message-failure-policy.ts         — failure handling per message type (retry/drop/dlq/escalate)
├─ service-lifecycle-registry.ts     — canonical service lifecycle states (references os-services/app-lifecycle)
├─ service-startup-order.ts          — importable startup ordering (replaces script-only version)
├─ service-domain-map.ts             — maps every service to its owning domain
├─ service-failure-consequence-map.ts — maps service failure to user-facing impact
├─ system-command-registry.ts        — all system commands with authority requirements
├─ host-bridge-registry.ts           — host bridges (Electron IPC, Capacitor, PWA service worker)
├─ recovery-behavior-registry.ts     — recovery strategies per service/surface (references recovery-levels)
├─ reality-classification-registry.ts — route-level reality classification entries
├─ simulated-surface-registry.ts     — tracks which surfaces are simulated vs real
├─ web/                              — web-specific runtime policies (empty dir, future)
├─ desktop/                          — desktop/Electron-specific runtime policies (empty dir, future)
├─ appliance/                        — appliance-specific runtime policies (empty dir, future)
├─ mobile/                           — mobile-specific runtime policies (empty dir, future)
└─ migration/                        — runtime migration utilities (empty dir, future)
```

## Wiring Strategy

1. **`runtime-detection.ts`** imports from `@/lib/services/surface-detection` and extends with `RuntimeTarget` enum covering all 7 targets (browser, electron, capacitor, pwa, node, deno, docker)
2. **`runtime-context.ts`** composes: surface detection + reality mode + capability matrix + trust state into one `RuntimeContext` object
3. **`service-startup-order.ts`** contains the same data as `scripts/generate-startup-order.ts` but as an importable TypeScript constant with dependency graph
4. **`service-failure-consequence-map.ts`** references `FleetHealthService` types from self-healing
5. **`recovery-behavior-registry.ts`** references `RecoveryLevel` from `os-services/recovery-levels.ts`
6. **`reality-classification-registry.ts`** uses `RealityClassificationRecord` from `reality-records/canonical-records.ts`
7. **`host-bridge-registry.ts`** references `SurfaceType` from contracts
8. **All files** are pure TypeScript — no React, no side effects, no IO

## Integration Points

- **`src/planes/os.ts`** — add re-export of runtime barrel
- **`src/lib/orchestration/shared/orchestration-context.ts`** — import `RuntimeContext` from runtime layer
- **Existing hooks** (`useSurfaceType`) — unchanged, runtime layer is lower-level
- **Admin pages** — can inspect runtime registries for truth dashboards

## Build Verification

Full `tsc --noEmit` after all files created.

## File Summary

| Category | New Files | Modified Files |
|----------|-----------|----------------|
| Runtime layer | 22 source files | 0 |
| Subdirectory stubs | 5 (web/desktop/appliance/mobile/migration `.gitkeep`) | 0 |
| Plane wiring | 0 | 1 (`planes/os.ts`) |
| **Total** | **27** | **1** |

