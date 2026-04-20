

## Goal
Restore master aggregator to fully GREEN by generating the 3 missing required-gate outputs, then triage the 98 advisory failures into fix / accept / suppress buckets without dropping any of the 21 BLOCK gates.

## Ground truth verified this session
- `public/generated/connector-client-registry-report.json` already exists and reports `ok: true, errorCount: 0`. The required output the aggregator looks for is `generated/connector-client-registry-completeness-report.json` (different path / filename).
- `scripts/architecture/checks/check-runbook-coverage.ts` exists but emits via `ViolationCollector.report()` only — it never writes `generated/runbook-coverage-report.json`, so the aggregator can't find it.
- `scripts/validation/check-runbook-human-use-proof.ts` already uses `emitGateReport`. The pattern is proven; we apply it to the 3 missing emitters.
- No `check-admin-runbook-surface-wiring.ts` exists yet — needs to be authored against the existing tab-registry + runbook-registry.

## Wave 1 — Generate the 3 missing required outputs (unblocks aggregator)

### Fix 1.1 — `runbook-coverage-report.json`
- **File**: `scripts/architecture/checks/check-runbook-coverage.ts` (extend, don't rewrite)
- **Change**: After the existing per-runbook validation loop, emit `generated/runbook-coverage-report.json` via `emitGateReport` with: `gate: "runbook-coverage"`, `ok` (= no errors collected), `extra: { totalRunbooks, subsystemsCovered, mandatorySubsystems, criticalSubsystemCoverage, perRunbook: [{runbookId, subsystem, severity, hasMarkdown, hasValidContext, hasValidKillSwitch, stepCount}] }`, plus `issues` mirrored from the ViolationCollector.
- **No registry/SQL change.**

### Fix 1.2 — `connector-client-registry-completeness-report.json`
- **File**: `scripts/architecture/checks/check-connector-client-registry.ts` (extend)
- **Change**: Add a second write that mirrors the existing `public/generated/connector-client-registry-report.json` to `generated/connector-client-registry-completeness-report.json` with `gate: "connector-client-registry-completeness"` (matching the aggregator's expected gate id) and the same payload shape. Keep the public mirror intact for the existing dashboard.

### Fix 1.3 — `admin-runbook-surface-wiring-report.json` (new validator)
- **New file**: `scripts/architecture/checks/check-admin-runbook-surface-wiring.ts`
- **Asserts**:
  1. Every runbook in `RUNBOOK_REGISTRY` (`src/lib/support/runbook-registry.ts`) has at least one admin surface that references it (search `src/pages/admin/**` + `src/components/admin/**` for the runbook id literal).
  2. Every kill-switch with `runbookRef` resolves to a real surface that links runbook + kill-switch together.
  3. The `tab-registry.ts` declares an entry for the runbook console / safety surface.
- **Emits**: `generated/admin-runbook-surface-wiring-report.json` via `emitGateReport` with per-runbook coverage rows.
- **Aggregator binding**: register the new gate id `admin-runbook-surface-wiring` in `check-os-release-readiness.ts` REQUIRED_GATES list (replacing whatever placeholder currently fails to resolve it).

### Checkpoint A
- Run `npx tsx scripts/architecture/checks/check-os-release-readiness.ts`.
- Expected: all 3 missing-output errors clear; 21/21 BLOCK gates GREEN.
- If any BLOCK gate flips RED → **STOP and report** per gate policy.

## Wave 2 — Triage the 98 advisory failures

Group the 98 into 4 buckets via the aggregator's `architecture-compliance-report.json` (advisory section). For each bucket I will produce a short table (gate id · failure category · proposed disposition · file evidence):

- **Bucket A — Real drift, low-risk auto-fix** (e.g. stale generated artifacts that just need their generator script re-run). Apply fix in-place.
- **Bucket B — Real drift, requires source change** (e.g. tier-disclosure missing on 6 boot components). Apply minimal source edit using established patterns (the boot tier-disclosure work already has a canonical primitive).
- **Bucket C — Known intentional drift** (e.g. `pending-human-execution` classifier in `check-runbook-human-use-proof.ts`). Confirm it stays advisory; no change needed; document in `WAVE2_ADVISORY_DISPOSITION.md`.
- **Bucket D — Suppress with justification** (advisory checks that are obsolete given new architecture). Mark in their own gate report as `intentional` with rationale; never silently delete.

### Checkpoint B
- Re-run aggregator + 6 evidence gates.
- Expected: advisory failure count drops materially; 0 BLOCK regressions.
- Print `WAVE2_ADVISORY_DISPOSITION.md` showing exactly what was fixed vs accepted vs suppressed.

## Wave 3 — Lock the fix in place (prevent re-drift)

- **File**: `scripts/architecture/checks/check-os-release-readiness.ts`
- **Change**: Add a startup assertion that every gate id in `REQUIRED_GATES` has a corresponding `generated/<id>-report.json` writer registered in a new `REQUIRED_OUTPUT_WRITERS` constant (script path + gate id). Fail aggregator with a clear message if any required output is unwritable, instead of the current "missing report" generic error.
- **Doc**: append a one-line correction note to `MASTER_AUDIT.md` Part XII confirming the 3 required outputs are now produced (no rewrite — just the corrected status line).

## Out of scope
- No DB schema / migration changes.
- No new CI gates beyond the one new validator (`check-admin-runbook-surface-wiring.ts`).
- No edits to `src/runtimes/`, `supabase/migrations/`, `types.ts`, or lockfiles.
- No rewrites of `MISSING_AUDIT.md` or `PROJECT_TREE_AUDIT.md`.

## Stop conditions
1. Any of the 21 BLOCK gates flips RED → halt, report, await direction.
2. Wave 1 produces an output whose validator reports `ok: false` for substantive reasons (not just missing emitter) → halt, surface the real issue rather than mask it.
3. Wave 2 advisory count fails to drop by ≥30% → halt and re-bucket with you.

## Files to be created
- `scripts/architecture/checks/check-admin-runbook-surface-wiring.ts`
- `generated/runbook-coverage-report.json` (script output)
- `generated/connector-client-registry-completeness-report.json` (script output)
- `generated/admin-runbook-surface-wiring-report.json` (script output)
- `WAVE2_ADVISORY_DISPOSITION.md` (triage record)

## Files to be edited
- `scripts/architecture/checks/check-runbook-coverage.ts` (add report emitter)
- `scripts/architecture/checks/check-connector-client-registry.ts` (add second mirror to canonical path)
- `scripts/architecture/checks/check-os-release-readiness.ts` (register new gate id + add `REQUIRED_OUTPUT_WRITERS` startup assertion)
- 0–6 source files in Wave 2 Bucket B (boot tier-disclosure), only if flagged
- `MASTER_AUDIT.md` Part XII (one-line correction)

