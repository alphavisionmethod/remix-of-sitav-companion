# Phase 5 — Trust Ladder & Cross-Agent Knowledge Bus
**Closure Audit** · Generated 2026-04-18

## Mission
Close the AI Workforce loop: feed reflections back into per-agent **autonomy ladders (L0–L6)**, share learnings across the council via a **knowledge bus**, and give supervisors a single trust-grade readout — all without ever auto-promoting an internal agent past the human-approval ceiling.

## Surfaces shipped
| Layer | Artifact |
|---|---|
| Database | `internal_agent_trust_ladder`, `internal_agent_ladder_history`, `internal_agent_knowledge_bus` (RLS: admin-read-only) |
| RPCs | `evaluate_internal_agent_ladder`, `publish_agent_learning`, `summarize_trust_ladder` (all SECURITY DEFINER) |
| Edge function | `supabase/functions/internal-agent-trust-evaluator` (admin-only, JWT-validated, no DDL) |
| Admin page | `/admin/ai-runtime/trust-ladder` (`TrustLadderBoard.tsx`) |
| Validators | 6 BLOCK gates — see below |
| Aggregator | `check-os-release-readiness.ts` bumped 79 → 85 required gates |
| Script | `phase5:run-all` + wired into `release:readiness:full` |

## Safety invariants (machine-checked)
1. **Never auto-promote past L4** — `evaluate_internal_agent_ladder` clamps `target_rung` to `human_approval_required_above_rung` before any update.
2. **Promotion lock honored** — if `promotion_locked=true`, target rung cannot exceed current.
3. **No self-promotion** — `check-trust-ladder-never-self-promote` scans `src/` and `supabase/functions/` for direct UPDATE/INSERT/UPSERT against `internal_agent_trust_ladder` outside the canonical RPC.
4. **No undisciplined knowledge writes** — `check-knowledge-bus-write-discipline` forbids direct INSERT/UPDATE on `internal_agent_knowledge_bus`; only the RPC may publish.
5. **Single supervisor readout** — `check-trust-ladder-supervisor-readout` blocks the admin page from inlining table queries; must call `summarize_trust_ladder`.
6. **Edge function cannot do DDL** — `check-internal-agent-trust-evaluator-function` regex-rejects `ALTER TABLE`, `DROP TABLE`, `CREATE POLICY`.

## BLOCK gate registry (6)
| Gate | File |
|---|---|
| `internal-agent-trust-ladder-table` | `scripts/validation/check-internal-agent-trust-ladder-table.ts` |
| `internal-agent-trust-evaluator-function` | `scripts/validation/check-internal-agent-trust-evaluator-function.ts` |
| `trust-ladder-board-page` | `scripts/validation/check-trust-ladder-board-page.ts` |
| `trust-ladder-never-self-promote` | `scripts/validation/check-trust-ladder-never-self-promote.ts` |
| `knowledge-bus-write-discipline` | `scripts/validation/check-knowledge-bus-write-discipline.ts` |
| `trust-ladder-supervisor-readout` | `scripts/validation/check-trust-ladder-supervisor-readout.ts` |

## Wiring
- Reflections (Phase 3) → Trust score (EWMA) → `evaluate_internal_agent_ladder` → ladder row + history audit.
- Reflection pattern frequency ≥3 + lesson present → `publish_agent_learning` → cross-agent knowledge bus.
- Admin page reads only via `summarize_trust_ladder` RPC.
- Promotions above L4 require human approval (recorded in `internal_agent_ladder_history.human_approved`).

## Verdict
✅ Phase 5 closed. 6/6 BLOCK gates GREEN. Aggregator at 85 required gates. Loop complete: **reflect → score → ladder → share → supervise**.
