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
   - **Phase 4 — Simulation receipts** (`src/lib/autonomy/simulation.ts` + `autonomy_simulation_receipts` table). Every plan that survives the dry-run gate (auto-execute, queue, or blocked) gets a persisted receipt with: projected outcomes, side-effect inventory (db_write/queue_insert/client_message/financial_move/etc, each tagged reversible), rollback plan + human summary, and policy warnings (confidence < threshold, financial cap, irreversible, missing policy). Receipts link to the queue row via `queue_id`. The JIT approval card renders an inline collapsible simulation panel from these. 60-day TTL via `expires_at`. RLS: user reads/inserts own; admin reads all.
5. **JIT approval surface** (`src/components/autonomy/AutonomyApprovalQueue.tsx`) — Realtime list of `advisor_action_queue` rows in `awaiting_approval`. Approve → executed; Reject → rejected. Mounted at `/control-center/autonomy` (owner) and `/admin/autonomy` (admin).
6. **Reflection loop** (`src/lib/autonomy/reflection.ts` + `advisor_board_reflections` table). After every terminal queue transition (auto-execute, owner approve, owner reject, failure), `recordReflectionForQueueRow()` builds an input from the queue row + simulation receipt and calls `scoreReflection()` (pure). Three scores in [0,1]: outcomeQuality, executionFitness, recommendationQuality. Plus `shouldRepeat` boolean, `lessonLearned` string, `pattern_tags` (risk/decision/owner/client-facing/draft-only/financial/policy-breach). `AutonomyReflectionTimeline.tsx` renders the live feed via realtime channel; surfaced as a tab in Mission Control and a card in the owner Control Center. Wiring points: controller auto-execute branch + AutonomyApprovalQueue approve/reject handlers.
7. **Boardroom Kernel** (`src/lib/autonomy/boardroom-kernel.ts` + `useBoardroomKernel` hook + `BoardroomKernelPanel`). Pure cross-advisor synthesis — reads recent queue items (48h), reflections (72h), and open breakers; emits ranked `BoardroomTheme[]` of five kinds: **consensus** (≥2 advisors queue same action), **conflict** (same domain, different actions, different advisors), **stalled** (awaiting_approval > 6h), **emergent** (≥3 rejections = calibration drift; ≥4 should_repeat = promotion candidate; any policy-breach tag = priority 1.0), **breaker_storm** (≥2 open breakers). Themes are derived/read-only — they never trigger execution; the owner acts via the existing JIT queue or advisor settings. Mounted as a tab in `/admin/autonomy` and a card in `/control-center/autonomy`.
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
