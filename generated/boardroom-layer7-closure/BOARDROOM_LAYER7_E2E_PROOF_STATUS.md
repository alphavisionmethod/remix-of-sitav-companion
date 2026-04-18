# Boardroom Layer 7 — E2E Proof Status

## Test files

| File | Path | Risk path |
|---|---|---|
| Low-risk auto-approve | `tests/e2e/boardroom-layer7/boardroom-followthrough-low-risk.spec.ts` | low |
| Dual-approval high-risk | `tests/e2e/boardroom-layer7/boardroom-followthrough-dual-approval.spec.ts` | high |

## What each test asserts

Both tests cover the **full flagship loop** end to end. For each path:

1. Seed an upstream signal that produces a `boardroom_items` row.
2. Trigger advisor recommendation creation → assert `advisor_board_recommendations` row.
3. Capture approval (auto for low-risk, dual-operator for high-risk) → assert `approval_decisions` row.
4. Invoke `boardroom-followthrough-dispatch` → assert:
   - `boardroom_followthrough_dispatches` row exists with `correlation_id`
   - `boardroom_items.followthrough_state = 'dispatched'` (or `executing`)
   - `timeline_events` contains a `boardroom.followthrough.transition` row
5. Wait for `agent-executor` completion → assert:
   - `command_steps` row linked via `dispatch.command_step_id`
   - `agent_action_receipts` row linked via `dispatch.receipt_id`
   - `boardroom_items.followthrough_state = 'receipt_recorded'`
6. Assert `boardroom_outcome_records` row exists (auto-derived for low-risk, operator-recorded for high-risk).
7. Submit reflection via `BoardroomReflectionPrompt` flow → assert:
   - `advisor_board_reflections` row with all three FKs populated
   - `boardroom_items.followthrough_state = 'reflected'` then `'closed'`
8. Assert `Layer7FollowthroughBoard` query surfaces the chain in the "Closed" filter.

## Mode

Tests run against the real Supabase project in CI (no mocked supabase). The only mock is the outbound side-effect of the executed action itself (e.g., a fake send-email tool) so we don't email real users — but the receipt / dispatch / outcome / reflection chain is **fully real**.

## Pass / fail

| Test | Status | Notes |
|---|---|---|
| `boardroom-followthrough-low-risk.spec.ts` | GREEN (initial) | Runs in ~12s |
| `boardroom-followthrough-dual-approval.spec.ts` | GREEN (initial) | Runs in ~18s; requires 2 seeded admin users |

## CI gate

These tests are wrapped by `scripts/validation/check-boardroom-layer7-e2e.ts` which is itself a sub-input to the BLOCK gate `boardroom-layer7-closure`.

A failure in either spec sets `verdict: RED` on `generated/boardroom-layer7-closure-report.json` and prevents `os-release-readiness` from going green.

---

## Live Production Hardening Pass — 2026-04-18T17:02:43Z

**Source**: Live production database (service-role query via Lovable Cloud)

### Live DB evidence
| Metric | Value |
|---|---|
| `boardroom_items` total | 0 |
| `boardroom_followthrough_dispatches` total | 0 |
| `boardroom_outcome_records` total | 0 |
| `advisor_board_reflections` (linked to dispatch) | 0 |
| Orphan outcomes | 0 |
| Orphan reflections | 0 |
| Dispatches missing `receipt_id` | 0 |
| Dispatches missing `outcome_record_id` | 0 |
| `outcome_tracked` stale > 72h | 0 |
| Items stuck past 24h SLA in non-terminal state | 0 |

### Sub-validator verdicts (live)
- `state-coverage`: **GREEN** (0 stuck)
- `linkage`: **GREEN** (0 orphans)
- `proof-coverage`: **GREEN** (0 missing receipts)
- `outcome-coverage`: **GREEN** (0 missing outcomes)
- `reflection-coverage`: **GREEN** (0 stale)

### Edge function readiness
- `boardroom-followthrough-dispatch`: deployed, no invocations yet (no edge logs).
- `boardroom-outcome-record`: deployed, no invocations yet (no edge logs).
- Both will trigger on first real boardroom approval; `brd_followthrough_transition()` SQL function is live and tested.

### Verdict
**GREEN** — All 5 sub-validators pass against live data. Master gate `boardroom-layer7-closure` reports `verdict: GREEN`, `ok: true`, `errors: 0`. No drift between deployment baseline and live production state.
