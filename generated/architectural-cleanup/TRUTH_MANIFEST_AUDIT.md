# Truth Manifest Audit

**Generated:** 2026-04-19
**Method:** Live scan of `generated/` directory contents + grep for consumer references in `src/`, `scripts/`.

## Inventory snapshot

The `generated/` tree contains canonical truth artifacts produced by validators and emitters. This audit categorizes them by health.

### Canonical (preserve)

- `generated/security-and-portability-closure/` — 19 files (12 markdowns + 4 JSON + 2 evidence dirs + register). All consumed by `SecurityAndPortabilityTruthPanel.tsx` and 10 validators.
- `generated/admin-and-validation-closure/` — consumed by `AdminValidationTruthPanel.tsx` and `closure:admin-validation:run-all` script.
- `generated/hardware-and-operator-closure/` — consumed by `HardwareAndOperatorTruthPanel.tsx`.
- `generated/mobile-scope-closure/` — consumed by `MobileScopeTruthPanel.tsx`.
- `generated/architectural-cleanup/` — **NEW** — consumed by `ArchitecturalCleanupTruthPanel.tsx` (this pass).
- All `*-report.json` files at `generated/` root — consumed by `check-os-release-readiness.ts` aggregator.

### Reconciliation candidates (relabel/archive only — no deletion this pass)

Audit found **no duplicate canonical sources** for the same concern. Areas previously suspected of duplication:

- **Plane boundary reports** — single canonical source: `generated/plane-boundary-report.json`.
- **Service topology reports** — single canonical source: `generated/service-topology.json`.
- **Route topology reports** — single canonical source: `generated/route-truth-report.json`.

### Stale-canonical risk

None detected this pass. The Manifest Truth Framework (per memory) already enforces declared owner + source-of-truth + validation-script + CI-gate per artifact.

## Consumers

For each non-trivial generated artifact, the following consumers were verified:

| Artifact pattern | Consumer | Validator/Generator |
|---|---|---|
| `generated/security-and-portability-closure/*.json` | `SecurityAndPortabilityTruthPanel` | `closure:security-portability:run-all` |
| `generated/architectural-cleanup/*.json` | `ArchitecturalCleanupTruthPanel` | `closure:architectural-cleanup:run-all` (NEW) |
| `generated/*-report.json` | `check-os-release-readiness.ts` | individual gate validators |

## Output

`TRUTH_MANIFEST_RECONCILIATION_PLAN.md` records the chosen canonical source for any concern with multiple candidates. Result this pass: **zero rewires needed**.
