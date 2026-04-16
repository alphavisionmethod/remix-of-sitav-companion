# Phase 8 — CI Manifests Umbrella

The CI Umbrella is the canonical registry of every validation gate that
protects SITA OS. It unifies Phase 1–7 enforcement under a single typed
surface, exposes a release-readiness evaluator, and emits a master
manifest (`generated/ci-umbrella-manifest.json`) for admin surfaces and
the release pipeline.

## Why a registry?

Before Phase 8, CI gates lived only as scripts in
`scripts/architecture/checks/`. There was no programmatic way to ask:

- *Which gates protect the Boardroom context?*
- *Which gates block a production release vs. a PR merge?*
- *Are all phase-1–7 gates wired to a real script on disk?*
- *Has the CI umbrella drifted from the registry?*

Phase 8 answers all of these by promoting CI gates to first-class,
typed data with cross-links into bounded contexts (Phase 1) and the
release pipeline.

## Layout

```
src/lib/ci/
├─ ci-gate-types.ts            # Pure types (CIGateEntry, CIPhase, …)
├─ ci-gate-registry.ts         # Canonical registry of every gate
├─ ci-umbrella-evaluator.ts    # Pure functions: snapshot, readiness
├─ ci-umbrella-integrity.ts    # Pure validator (used by CI + admin)
└─ index.ts                    # Barrel
```

```
scripts/architecture/checks/
└─ check-ci-umbrella-integrity.ts   # PR-blocking gate; emits manifest
```

```
src/pages/admin/
└─ CI01CIUmbrellaCenter.tsx     # Admin surface (gated: audit.view)
```

## Registry shape

Every gate declares:

| Field | Purpose |
|-------|---------|
| `gateId` | Stable kebab-case ID (`CI-RUNBOOK-COVERAGE`) |
| `phase` | `phase-1` … `phase-8` or `cross-cutting` |
| `severity` | `blocker` · `high` · `medium` · `advisory` |
| `trigger` | `pr-required` · `nightly` · `release-gate` · `deploy-gate` · `manual` |
| `scriptPath` | Path to the validator on disk |
| `producesArtifact` | Generated JSON/MD this gate emits, if any |
| `readsArtifacts` | Other artifacts this gate consumes |
| `boundedContextId` | Phase 1 cross-link |
| `blocksRelease` / `blocksMerge` | Pipeline semantics |

## Release readiness

```ts
import { evaluateReleaseReadiness } from "@/lib/ci";

const failing = new Set(["CI-PROOF-COVERAGE"]);
const result = evaluateReleaseReadiness(failing);
// → { canRelease: false, blockingReleaseGates: [ … ], … }
```

This is the same evaluator used by the META Control Plane surface and
the deploy-gate orchestration scripts.

## Integrity gate

`scripts/architecture/checks/check-ci-umbrella-integrity.ts` is wired as
PR-required and:

1. Verifies every registered gate has an existing script
2. Detects duplicate IDs
3. Confirms bounded-context references resolve
4. Flags trigger/blocking mismatches
5. Parses every produced JSON artifact (when present)
6. Emits `generated/ci-umbrella-manifest.json`

## Admin surface

`/admin/ci/umbrella` (CI01) renders the live snapshot, grouped by phase,
with severity badges, owner attribution, and direct links to the
underlying scripts. Failing gates surface as blocking the
release/merge banners.

## Cross-registry contract

Phase 8 closes the loop with Phase 7:

- META02 (Control Plane Center) now also surfaces CI release-readiness.
- META01 (Architecture Atlas) links each bounded context to its
  protecting CI gates via `getGatesForContext()`.
- The Phase 7 integrity validator continues to ensure cross-registry
  references resolve; the Phase 8 integrity validator ensures every
  gate **has a real script on disk**.

## Adding a new gate

1. Write the validator in `scripts/architecture/checks/`.
2. Append a `CIGateEntry` to `CI_GATE_REGISTRY`.
3. Run `npx tsx scripts/architecture/checks/check-ci-umbrella-integrity.ts`.
4. Wire the script into `infra/ci/pipeline.yaml` for the appropriate
   trigger (PR / nightly / release-gate / deploy-gate).

The PR-blocking integrity gate will reject pushes that skip step 2.
