---
name: autonomy-stack
description: Advisor autonomy roadmap (9 phases). L3 ceiling — execute reversible only; irreversible always require approval. OS-state sensor bus → controllers → budgets → dry-run → JIT approvals → reflection → boardroom kernel → standing missions → kill-switch. UI surfaces in Control Center (owner) + Mission Control (admin).
type: feature
---

## Hard rules

- **Authority ceiling = L3** (execute reversible only). Irreversible actions (sends, payments, external comms) ALWAYS require human approval, even at L4 standing missions. Enforced server-side.
- All 9 advisors share one runtime: signal bus → controllers → budgets → dry-run → JIT → reflection.
- Kill-switch is global and instant. When tripped, all advisor controllers halt at next state check.

## Layers (Phase 1 onwards)

1. **OS-state sensor bus** (`src/lib/autonomy/signal-bus.ts`, `os_state_signals` table). Canonical SIGNAL_KINDS map; emitters in `emitters.ts`; `useSignalBus` hook; bootstrapped in `useAutonomyBootstrap` from RuntimeProvider. Default subs seeded per-user lazily.
2. **Per-advisor controllers** (`src/lib/autonomy/controller.ts`) — `runControllerCycle(advisorId)` drives signal → propose → dry_run → state transition, persisting through `advisor_autonomy_state`. State machine in `state-machine.ts` with legal-transition guards. Bootstrap loop runs `runControllersForAdvisors(DEFAULT_CONTROLLED_ADVISORS)` after each emitter pass (10 min). One auto-execute max per cycle (blast-radius cap).
3. **Budgets + circuit breakers** (`src/lib/autonomy/budgets.ts`) — `decideBudget()` enforces daily token budget (advisor_agents.budget_daily_tokens), hourly invocation cap × 24, per-action $ cap (advisor_autonomy_policies.max_financial_impact_cents), and a daily $ ceiling (DEFAULT_DAILY_FINANCIAL_CEILING_CENTS = $500). Overage → `tripCircuitBreakerForBudget()` writes circuit_open + breaker_reason in metadata. Generic failure threshold = 3, breaker open 30 min, cooldown 5 min after execute.
4. **Dry-run gates** (`src/lib/autonomy/dry-run.ts`) — `decideExecutionMode(plan, policy)` enforces hard L3 ceiling: irreversible ALWAYS queues, risky-but-reversible queues, only `reversible_safe` plans within domain/financial/confidence/quiet-hours bounds auto-execute. Plans declare `riskClass + rollback` up-front in `proposers.ts`.
5. **JIT approval surface** (`src/components/autonomy/AutonomyApprovalQueue.tsx`) — Realtime list of `advisor_action_queue` rows in `awaiting_approval`. Approve → executed; Reject → rejected. Mounted at `/control-center/autonomy` (owner) and `/admin/autonomy` (admin).
6. **Reflection loop** — TBD
7. **Boardroom Kernel** — TBD
8. **Standing missions** — TBD
9. **Kill-switch console** (`src/pages/admin/AutonomyMissionControl.tsx` + `useAutonomyFleet`) — Live fleet view: state badges, breaker reset (`resetCircuitBreaker`), `Run cycle now`, global `Reset all breakers`. Owner mini-version at `/control-center/autonomy`. Both auto-refresh via realtime channels on `advisor_autonomy_state` + `advisor_action_queue`.

## Tables (Phase 1)

- `os_state_signals` — signal bus, 30d TTL, RLS by user_id, severity-validated.
- `os_state_signal_subscriptions` — advisor → signal-kind subscriptions, unique (user, advisor, kind).
- `advisor_autonomy_state` — runtime state machine per advisor (idle/observing/proposing/awaiting_approval/executing/cooling_down/circuit_open). Updates only by admin/service role.

## Don't do

- Never let an advisor execute irreversible actions without explicit approval.
- Never bypass the signal bus (no controller-direct DB polling).
- Never store roles/autonomy levels on profiles — always on dedicated tables.
