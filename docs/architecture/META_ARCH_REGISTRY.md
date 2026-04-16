# Meta-Architecture Registry (Phase 7)

> The Phase 7 Meta-Architecture layer is the **read-side aggregator** that
> binds together every prior phase's registry into a single queryable lattice.
> It is the back-end for the three new admin surfaces and the source of truth
> for the `check-registry-integrity` CI gate.

## Source Registries

| Phase | Registry                              | Module                                          | Count |
| ----- | ------------------------------------- | ----------------------------------------------- | ----- |
| 1     | Bounded Contexts                      | `src/lib/architecture/bounded-context-registry.ts` | 13    |
| 4     | Kill Switches                         | `src/lib/control-plane/kill-switch-registry.ts`    | 14    |
| 5     | Runbooks                              | `src/lib/support/runbook-registry.ts`              | 19    |
| 6     | Golden Paths                          | `src/lib/operations/golden-path-registry.ts`       | 15    |

## Public API — `@/lib/meta-arch`

```ts
import {
  computeMetaArchSnapshot,
  validateRegistryIntegrity,
  getKillSwitchesForContext,
  getRunbooksForContext,
  getGoldenPathIdsForContextSafe,
  resolveContextById,
  resolveSwitchById,
  resolveRunbookById,
} from "@/lib/meta-arch";
```

`computeMetaArchSnapshot(armedSwitchIds)` is **pure** — it accepts the
current set of armed kill-switch IDs and returns a snapshot describing,
per bounded context: assigned switches, currently armed switches,
attached runbooks, attached golden paths, and the count of blocked /
degraded paths. Health is derived (no `if (window.…)` checks).

## Live Hook

`useArmedKillSwitches()` reads the runtime `automation_kill_switches`
table and projects active scope strings to canonical `KS-*` IDs using
the kill-switch registry's `target` field as the bridge. The Meta-Arch
admin pages use this hook to feed `computeMetaArchSnapshot` and
`evaluateGoldenPaths`.

## Admin Surfaces

| Page                       | Route                              | Purpose                                                |
| -------------------------- | ---------------------------------- | ------------------------------------------------------ |
| Architecture Atlas         | `/admin/meta-arch/atlas`           | Global counters, integrity report, context lattice    |
| Control Plane Center       | `/admin/meta-arch/control-plane`   | Kill-switch detail with enforcement & impact radius   |
| Golden Path Health         | `/admin/meta-arch/golden-paths`    | Live P0/P1 path status with recovery runbooks         |

All three pages are gated by `audit.view` (read-only). Mutating the
control plane is still owned by `AR08KillSwitchCenter`.

## Integrity Validator

`validateRegistryIntegrity()` walks all four registries and asserts:

1. Every `BoundedContextEntry.killSwitches[]` resolves to a real switch.
2. Every `BoundedContextEntry.supportRunbooks[]` of shape `RB-###`
   resolves to a real runbook.
3. Every `KillSwitchEntry.boundedContextId` / `runbookRef` / `dependsOn`
   resolves.
4. Every `RunbookEntry.boundedContextId` / `killSwitchRef` resolves.
5. Every `GoldenPathEntry.contextIds` / `blockingKillSwitches` /
   `recoveryRunbookRefs` (path-level **and** step-level) resolves.
6. Every bounded context has at least one runbook (warning).

The same function is consumed by:

* The CI gate `scripts/architecture/checks/check-registry-integrity.ts`
* The "Registry Integrity" card on the Architecture Atlas page

so the production surface and the local CI gate can never diverge.

## CI

```bash
tsx scripts/architecture/checks/check-registry-integrity.ts
```

Exits non-zero on any error (cross-link to a non-existent entry).
Warnings (e.g. context without a runbook, golden-path with an unknown
recovery runbook ref) print but do not fail the build — they surface
in the admin UI for incremental cleanup.
