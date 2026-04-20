# Execution Model

> **Layer:** L3 Platform Service · **Registry:** `src/lib/platform/execution/execution-registry.ts`, `execution-policy-map.ts`

## Purpose

The canonical action-taking layer. Every state-changing operation in SITA OS flows through one of the executors below — there is no bypass.

## Executors

| Executor | Mode | Risk | Concurrent | Timeout | Rollback |
|----------|------|------|------------|---------|----------|
| `core.action-executor` | sync | high | 32 | 30s | yes |
| `core.workflow-runner` | async | medium | 16 | 120s | yes |
| `advisor.action-runner` | queued | high | 8 | 60s | yes |
| `connector.runner` | async | medium | 24 | 45s | no |
| `system.kill-switch` | sync | critical | 1 | 5s | yes |
| `scheduled.cron` | scheduled | low | 4 | 300s | no |

## State Machine

```
queued → validating → (running | awaiting-approval | failed)
running → (completed | compensating | killed)
awaiting-approval → (running | cancelled)
compensating → (rolled-back | failed)
```

Transitions are declared in `EXECUTION_STATE_TRANSITIONS`; only legal transitions are accepted by the runner.

## Action → Executor Binding

`EXECUTION_POLICY_MAP` binds every action class to its executor, applicable policies, kill-switch targets, retry policy, and compensation strategy.

## Compensation Strategies

- `automatic-rollback` — runner rewinds on postcondition failure
- `compensating-action` — runs an inverse action (e.g. offsetting transfer)
- `manual-rollback` — operator must initiate
- `no-rollback` — irreversible (sent SMS, etc.)

## Postcondition Checks

For risk-tier `medium`+ actions, runner re-reads the affected rows and verifies the predicate before marking `completed`. Failures move the execution into `compensating`.

## Kill-Switch Awareness

Each executor declares its kill-switch target. When a switch is fired, in-flight executions move to `killed` and a `negative-receipt` is emitted.

## Enforcement

- One execution chain. The executor is the **sole** state-mutating choke point.
- Direct DB writes that bypass an executor are flagged by `check-executor-bypass.ts`.
