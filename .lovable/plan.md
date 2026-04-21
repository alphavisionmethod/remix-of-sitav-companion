

## Wave 21 — Recovery Architecture Closure

### Summary

The recovery layer has a **runbook registry** (22 entries in `src/lib/support/runbook-registry.ts`), a basic **recovery execution engine** (`src/lib/operations/recovery-execution-engine.ts` — step sequencing with receipt emission), **drill status infrastructure** (`src/lib/support/runbook-drill-status.ts` — DB-backed via `runbook_drill_results`), an **incident classifier** (DB-backed subsystem→runbook+kill-switch mapping), and a **runbook subsystem map** (20 mandatory subsystems). What is missing: a formal recovery state machine, dependency graph, drill runner with simulation, metrics model, freshness policy, operator confirmation contracts, postmortem builder, system coverage map, and automation safety governance. This wave creates 10 source files in `src/lib/operations/`, 1 validator, and 11 generated proof artifacts.

### What Already Exists (Preserve, Extend)

| System | Location | Action |
|--------|----------|--------|
| Runbook registry (22 entries) | `src/lib/support/runbook-registry.ts` | Preserve — canonical source of runbook truth |
| Runbook types | `src/lib/support/runbook-types.ts` | Preserve |
| Runbook subsystem map (20 mandatory) | `src/lib/support/runbook-subsystem-map.ts` | Preserve; consumed by system coverage map |
| Runbook resolver (alert→runbook) | `src/lib/support/runbook-resolver.ts` | Preserve |
| Runbook drill status (DB-backed) | `src/lib/support/runbook-drill-status.ts` | Preserve; consumed by drill runner and freshness |
| Recovery execution engine | `src/lib/operations/recovery-execution-engine.ts` | **Extend** — add state machine, operator confirmation, metrics, postmortem hooks |
| Incident classifier (DB-backed) | `src/lib/incidents/incident-classifier.ts` | Preserve; consumed by simulation and dependency graph |
| Drill freshness check (advisory) | `scripts/support/check-recovery-drill-freshness.ts` | Preserve (advisory tier) |
| Operations barrel | `src/lib/operations/index.ts` | Extend with new exports |

No duplicates identified.

### Part 1 — New/Extended Source Files (`src/lib/operations/`)

| # | File | Purpose |
|---|------|---------|
| 1 | `runbook-execution-contract.ts` | Canonical execution state machine: 13 states (REGISTERED → READY → TRIAGED → EXECUTION_PENDING → AWAITING_CONFIRMATION → AUTOMATED_STEP_RUNNING → MANUAL_STEP_REQUIRED → PARTIALLY_REMEDIATED → RECOVERED → FAILED → ESCALATED → POSTMORTEM_PENDING → CLOSED). Step contract types with inputs, preconditions, automation status, safety constraints, rollback semantics |
| 2 | `recovery-execution-engine.ts` | **Extend existing** — add state machine progression, operator confirmation gate, metrics emission, postmortem trigger, escalation path, abort/rollback. Preserve existing `executeRecoveryPlan` signature as a compatibility wrapper |
| 3 | `recovery-dependency-graph.ts` | Directed graph of recovery dependencies per critical subsystem: upstream/downstream services, external providers, kill-switch interactions, sequence constraints. Static declaration consumed by drill runner and postmortem |
| 4 | `recovery-drill-runner.ts` | Simulation drill runner: loads runbook steps, runs in dry-run or live mode, emits typed `DrillReceipt` (drill ID, scenario, timing, confirmations, skipped steps, findings). Wraps `triggerRunbookDrill` from drill-status for DB persistence |
| 5 | `recovery-metrics.ts` | Time-to-recovery metric model: triage, first-remediation, partial-recovery, full-recovery, closure durations. Computed from execution receipts. Includes drill-vs-live distinction |
| 6 | `runbook-freshness-policy.ts` | Per-subsystem freshness windows (critical: 7d, high: 14d, medium: 30d, low: 90d). Stale detection based on last-drilled timestamp from `runbook-drill-status.ts`. Dependency-change invalidation rules |
| 7 | `recovery-operator-confirmation.ts` | Confirmation contract: which steps require confirmation, required roles, dual-control flag, timeout, rationale recording, escalation path on timeout. Mapped to runbook steps by destructive/critical classification |
| 8 | `recovery-postmortem-builder.ts` | Structured postmortem artifact builder: incident/drill ID, impacted systems, timeline, runbook path, step results, metrics, operator actions, follow-up items, evidence references. Generates typed `PostmortemArtifact` |
| 9 | `recovery-simulation-policy.ts` | Simulation scenario registry: 13 canonical scenarios (provider outage, DB degradation, kill-switch incident, shell failure, stuck workflow, connector token, release rollback, config corruption, support pipeline, auth outage, RLS breach, ingress failure, payment auth). Maps each to runbook(s) and required test assertions |
| 10 | `recovery-system-coverage-map.ts` | Maps 13 critical system families (auth, onboarding, app-lifecycle, advisors, AI runtime, payments, connectors, files, desktop, OS/appliance, control-plane, support, release) to their covering runbook(s), gaps, and coverage percentage. Consumes runbook-registry and subsystem-map |

### Part 2 — Extend Existing Engine

The existing `recovery-execution-engine.ts` will be extended (not replaced) with:
- Import and use the new state machine from `runbook-execution-contract.ts`
- Add `executeRecoveryWithGovernance()` — full-lifecycle executor that progresses through the state machine, pauses at `AWAITING_CONFIRMATION` for operator gates, emits metrics, and triggers postmortem on completion
- Preserve `executeRecoveryPlan()` as a lightweight compatibility wrapper
- Add `abortRecovery()` and `escalateRecovery()` functions

### Part 3 — Validator

`scripts/operations/check-recovery-architecture-closure.ts` — BLOCK-tier validator:
- Verifies all 10 source files exist
- Verifies execution contract defines all 13 states
- Verifies dependency graph covers critical-incident subsystems (7 subsystems from subsystem map)
- Verifies simulation policy covers at least 10 scenarios
- Verifies system coverage map covers all mandatory subsystems
- Verifies freshness policy defines windows for all severity tiers
- Verifies operator confirmation covers destructive steps
- Emits `generated/recovery-architecture-closure-report.json`

### Part 4 — Generated Proof Artifacts (11 files in `generated/`)

| # | File |
|---|------|
| 1 | `recovery-architecture-closure-report.json` |
| 2 | `runbook-execution-model.json` |
| 3 | `recovery-dependency-graph.json` |
| 4 | `recovery-metrics-report.json` |
| 5 | `runbook-freshness-report.json` |
| 6 | `recovery-simulation-coverage.json` |
| 7 | `recovery-operator-confirmation-coverage.json` |
| 8 | `recovery-postmortem-coverage.json` |
| 9 | `recovery-system-coverage.json` |
| 10 | `runbook-coverage-gaps.json` |
| 11 | `recovery-automation-safety-report.json` |

All generated by the validator script in a single pass.

### Part 5 — Integration

1. Register `recovery-architecture-closure` as a BLOCK gate in `check-os-release-readiness.ts` REQUIRED_GATES
2. Update `src/lib/operations/index.ts` barrel with all new exports
3. Recovery engine wraps existing `runbook-drill-status.ts` for DB persistence of drill results
4. System coverage map consumes existing `runbook-subsystem-map.ts` for mandatory subsystem list
5. Freshness policy consumes existing `runbook-drill-status.ts` for last-drilled timestamps

### Part 6 — Key Design Decisions

- **Single execution engine**: The existing `recovery-execution-engine.ts` is extended, not replaced. The new `executeRecoveryWithGovernance()` wraps the existing step executor with state machine, confirmations, and metrics.
- **Runbook registry stays in `src/lib/support/`**: The canonical runbook data stays where it is. The new operations files consume it — no second registry.
- **Drill runner wraps drill-status**: The new `recovery-drill-runner.ts` delegates DB persistence to the existing `triggerRunbookDrill()` in `runbook-drill-status.ts`. No duplicate drill storage.
- **Static dependency graph**: Dependencies are declared statically (not discovered at runtime) to ensure they are reviewable and auditable.
- **Metrics are computed, not sampled**: Time-to-recovery metrics are derived from execution receipts, not from external monitoring.

### Verification

- All 10 source files compile with 0 errors
- Validator passes with GREEN
- 11 generated artifacts produced
- BLOCK gate registered in aggregator
- Production build succeeds

