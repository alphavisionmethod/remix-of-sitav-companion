# Phase 6 Closure Audit — Cross-Council Coordination, Cost Optimization, Self-Healing

**Status**: ✅ DEPLOYABLE
**Sealed**: 2026-04-18
**Autonomy ceiling**: L3 hard cap (cross-council, cost proposals, self-healing)

---

## Scope delivered

### 6A. Cross-Council Consensus Engine
- Tables: `internal_agent_consensus_sessions`, `internal_agent_consensus_votes` (RLS, admin-read, RPC-write)
- RPCs: `open_internal_agent_consensus`, `cast_internal_agent_consensus_vote`, `resolve_internal_agent_consensus`
- Edge function: `internal-agent-consensus-engine` (open / vote / resolve)
- L3 ceiling: clamped at the RPC layer (`v_effective_level := 3` when `proposed_autonomy_level > 3`)
- Quorum + conflict detection: any mix of approve+reject or any escalate vote sets `conflict_detected=true`

### 6B. Autonomous Cost Optimization Drafter
- Table: `internal_agent_cost_proposals` (RLS, admin-read + admin-update for decisions)
- RPC: `propose_internal_cost_optimization` — **always** writes `status='draft_pending_review'`
- Edge function: `internal-agent-cost-optimizer` — scans `ai_usage_ledger` (last 30d), drafts:
  - **prompt_cache** proposals (high-volume, low-token capabilities → ~35% savings est.)
  - **model_downgrade** proposals (>$50/mo capabilities → ~40% savings est.)
- Hard rule: **no surface in the codebase mutates routing/budget tables based on a proposal**. Enforced by `check-cost-proposals-never-auto-apply.ts`.

### 6C. Self-Healing Runbook Executor
- Tables: `internal_agent_runbook_bindings`, `internal_agent_runbook_executions` (RLS, admin-read)
- RPC: `record_internal_runbook_execution` — enforces both per-binding cap **and** L3 global cap via `LEAST(requested, binding_max, 3)`
- Edge function: `internal-agent-self-healer` — only executes runbooks in the `SAFE_RUNBOOKS` catalogue (4 reversible runbooks):
  - `rb.cache.warm`, `rb.queue.drain-stale`, `rb.health.refresh-providers`, `rb.observability.collect-snapshot`
- All steps are observation/reversible; `rollback_data` recorded on every run.
- Dry-run flag supported.

### Admin surface
- `/admin/ai-runtime/cross-council` → `CrossCouncilBoard.tsx`
  - 3 tabs: Consensus / Cost Proposals / Self-Healing
  - L3 ceiling banner + "never auto-applied" disclosure on cost tab
  - Approve/reject decisions write back to DB; never trigger config changes

---

## BLOCK gates added (7)

| Gate | Validator |
|---|---|
| `internal-agent-consensus-tables` | `check-internal-agent-consensus-tables.ts` |
| `internal-agent-cost-proposals-table` | `check-internal-agent-cost-proposals-table.ts` |
| `internal-agent-runbook-tables` | `check-internal-agent-runbook-tables.ts` |
| `cross-council-l3-ceiling` | `check-cross-council-l3-ceiling.ts` |
| `cost-proposals-never-auto-apply` | `check-cost-proposals-never-auto-apply.ts` |
| `self-healer-safe-catalogue` | `check-self-healer-safe-catalogue.ts` |
| `cross-council-board-page` | `check-cross-council-board-page.ts` |

**Aggregator**: `check-os-release-readiness.ts` extended (now 86 total gates).
**npm script**: `npm run phase6:run-all` (added to `release:readiness:full` chain).

---

## Safety invariants (verified by gates)

1. **L3 hard ceiling** — every cross-council session, every runbook execution, capped at L3. Verified by AST-style scan of the migration SQL.
2. **No auto-apply** — cost proposals never mutate routing/budget tables in any code path. Codebase-wide regex scan blocks any `cost_proposal → routing.update` flow.
3. **No raw SQL** — self-healer rejects any runbook outside the in-code whitelist; explicitly blocks `execute_sql` and arbitrary DDL RPCs.
4. **RLS on every new table** — admin-read only; service role writes via `SECURITY DEFINER` RPCs.
5. **Per-binding caps** — runbook bindings carry their own `max_autonomy_level` (also bounded to 0..3 by CHECK constraint).

---

## Verification

```
✅ Phase 6 consensus tables present.
✅ Phase 6 cost-proposal table present.
✅ Phase 6 runbook tables present.
✅ Phase 6 L3 hard ceiling enforced at DB layer.
✅ Cost proposals never auto-apply.
✅ Self-healer locked to safe runbook catalogue.
✅ Cross-council board page wired.
```

All 7 Phase 6 BLOCK gates: **GREEN**.
Combined with phases 1-5: the AI workforce now has a complete loop —
**observe → act → learn → ladder → share → coordinate → optimize → self-heal**, all under explicit human-in-the-loop ceilings.

## Active Caveats

- Cross-council actions are clamped to L3 hard ceiling at the DB layer — no trigger or RPC path can elevate beyond L3 without human dual-approval.
- Cost-saving proposals never auto-apply; they always enter the implementation suggestions pipeline as `proposed`.
- Self-healer is locked to a curated safe runbook catalogue; arbitrary runbook execution is rejected.
- Consensus-engine outputs are advisory only and feed the suggestion pipeline — they cannot bypass approval queues.
