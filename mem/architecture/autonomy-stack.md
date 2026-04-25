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
2. **Per-advisor controllers** — TBD
3. **Budgets + circuit breakers** — `advisor_autonomy_state` already has `consecutive_failures` + `circuit_open_until`.
4. **Dry-run gates** — TBD
5. **JIT approval surface** — TBD
6. **Reflection loop** — TBD
7. **Boardroom Kernel** — TBD
8. **Standing missions** — TBD
9. **Kill-switch console** — Control Center (owner sliders) + Mission Control (admin ops view).

## Tables (Phase 1)

- `os_state_signals` — signal bus, 30d TTL, RLS by user_id, severity-validated.
- `os_state_signal_subscriptions` — advisor → signal-kind subscriptions, unique (user, advisor, kind).
- `advisor_autonomy_state` — runtime state machine per advisor (idle/observing/proposing/awaiting_approval/executing/cooling_down/circuit_open). Updates only by admin/service role.

## Don't do

- Never let an advisor execute irreversible actions without explicit approval.
- Never bypass the signal bus (no controller-direct DB polling).
- Never store roles/autonomy levels on profiles — always on dedicated tables.
