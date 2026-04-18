
## Phase 1 Runtime Bridge — Internal AI Workforce → Real Operation

### Verified ground truth
- **40 agents** exist as canonical specs in `src/lib/internal-agents/` (6 councils × P/B/S/R/A/K). Duplicate at `src/packages/internal-agent-config/` — will treat `src/lib/internal-agents/` as sole seed source (no new parallel registry).
- **7 supervisors** + 6 councils already typed and exported.
- **AI runtime tables** already real: `ai_workforce_invocations`, `ai_workforce_approval_queue`, `ai_workforce_budget_classes`, `agent_action_receipts`, `agent_signals`, `runtime_agents`, `agent_signals`. Reuse these — do NOT duplicate.
- **Edge runtime patterns** proven in `agent-executor` (policy + budget + receipts + signals + tracing). The new loop will reuse `_shared/policy.ts`, `_shared/ai-budget-check.ts`, `_shared/ai-receipt-logger.ts`, AI gateway.
- **Admin extension point**: `AIRuntimeHome` is a `DomainHubLayout` hub — adding 2 modules (`internal-agents`, `councils`) is the canonical, drift-free integration.

### Five deployable phases (each green-on-deploy)

---

### Phase 1 — DB Foundation (5 tables, RLS, indexes)
Single migration. **No data writes yet, so can deploy without breaking anything.**

| Table | Purpose | Key linkage |
|---|---|---|
| `internal_agent_definitions` | 40 agents seeded from `ALL_DETAILED_AGENTS` | unique `agent_id` |
| `internal_agent_runtime_state` | Live mutable state per agent | FK → definitions |
| `internal_agent_actions` | Every meaningful action | FK → definitions, `ai_workforce_invocations`, `agent_action_receipts`, `ai_workforce_approval_queue` |
| `council_escalations` | Cross-agent + agent→supervisor | FK → definitions |
| `supervisor_decisions` | Override/suspend/downgrade audit | FK → escalations + actions |

- RLS: admin-only via `has_role(_, 'admin')` for write; admin + service-role for read; service-role bypass for the runtime loop.
- Indexes on `(council, is_active)`, `(agent_id)`, `(status, created_at DESC)`, `(supervisor_key)`.
- Trigger: `update_updated_at_column` reused.
- **Verification**: schema registry regenerates clean; `check-db-truth` passes; admin pages still render unchanged.

---

### Phase 2 — Seed Bridge + Definition Sync
- New script `scripts/seed/seed-internal-agents.ts` reads `ALL_DETAILED_AGENTS` + `SUPERVISORS` and upserts into `internal_agent_definitions` (idempotent, by `agent_id`).
- New service `src/lib/internal-agents/runtime/internal-agent-registry.ts` — single source for the runtime loop + admin UI to read combined `definition + state`.
- Auto-seed migration: SECURITY DEFINER function `seed_internal_agent_definitions()` invoked once via insert, embedding the 40-agent payload generated from spec at build time.
- Empty runtime_state rows auto-created for each definition (one per agent).
- Validators: `check-internal-agent-registry.ts` + `check-internal-agent-seed-integrity.ts` (BLOCK gates) — fail if DB count ≠ spec count, or any `agent_id` missing.
- **Verification**: 40 definitions + 40 runtime_state rows present; admin UI (Phase 4) will read from this even when empty.

---

### Phase 3 — `internal-agent-loop` Edge Function (the bridge core)
Single edge function `supabase/functions/internal-agent-loop/index.ts` with:
- **Due-agent evaluator**: parses `schedule_cron` against `last_run_at` + `cooldown_until`; respects `is_active`, suspension, kill-switches.
- **Per-agent runner** (reuses canonical infra):
  1. Load definition + state (single join query)
  2. Check `automation_kill_switches` for `internal-agents.<council>.<agent_id>` scope
  3. Call existing `checkAIBudget` → respect downgrade
  4. Call AI gateway via existing pattern (no parallel client)
  5. Insert `ai_workforce_invocations` row (canonical receipt)
  6. Insert `internal_agent_actions` row linked to invocation
  7. Decision branch by `current_autonomy_level`:
     - `observe`/`diagnose`/`recommend`/`draft` → record action only
     - `simulate` → record + simulation_result
     - `approval-ready` → also insert into `ai_workforce_approval_queue` with `recommendation_id` link
     - `constrained-action` → execute scoped tool only if confidence ≥ `confidence_threshold_act`
  8. On confidence < threshold OR consecutive failures ≥ 3 → insert `council_escalations` row routed to agent's `escalation_target` supervisor
  9. Update `internal_agent_runtime_state` (last_run_at, last_success_at/last_failure_at, consecutive_failures, total_*, trust_score recalc)
- **pg_cron** every 5 min calls the loop with service role; loop internally evaluates which agents are due.
- Idempotency key: `agent_id + minute-bucket`; rate limit reused from `_shared/rate-limit.ts`.
- **Verification**: invoking the loop with one due agent writes invocation + action + state; second invocation within cooldown is skipped.

---

### Phase 4 — Admin UI: 2 New Hub Modules + Drilldowns
Extend `AIRuntimeHome.tsx` with two new modules (no new shell):
- **`internal-agents` tab**: `InternalAgentsBoard.tsx`
  - Live table from `internal_agent_definitions LEFT JOIN internal_agent_runtime_state`
  - Columns: agent, council, status, current_autonomy/max, trust_score, last_run, consecutive_failures, recent actions count
  - Row drilldown drawer: full definition + last 20 `internal_agent_actions` (linked to invocation/receipt) + escalations
  - Operator actions (gated by `has_admin_permission(_, 'ai_workforce.manage')`): manual trigger (calls `internal-agent-loop` with `agent_id`), suspend/resume, autonomy downgrade
  - Filters: council, status, suspended-only
- **`councils` tab**: `CouncilsBoard.tsx`
  - 6 panels (one per council) — agent count, active/paused, recent actions/escalations, supervisor status from `supervisor_decisions`
  - Per-council drilldown shows pending escalations + last supervisor decisions
- Realtime: subscribe to `internal_agent_runtime_state` + `council_escalations` so the boards reflect loop activity live.
- Route registration in `ADMIN_ROUTE_REGISTRY` (ai-runtime domain).
- **Verification**: `/admin/ai-runtime` shows 2 new tabs, populated with the 40 seeded agents; manual trigger of an agent updates the row in real time.

---

### Phase 5 — Supervisor Runtime + Validators + Final Wiring
- Server-side action helpers in `src/lib/internal-agents/runtime/supervisor-actions.ts` for `approve/reject/override/suspend/downgrade/escalate-meta` — each writes `supervisor_decisions` and mutates target `internal_agent_runtime_state` or `council_escalations` accordingly.
- Meta-supervisor key: `chief-of-staff` already exists; escalations marked `severity='high'` or unresolved >24h auto-route to it via the loop.
- New supervisor section in `CouncilsBoard` for resolving open escalations.
- New BLOCK-level validators wired into master aggregator (50 → 56):
  - `check-internal-agent-registry.ts`
  - `check-internal-agent-runtime-coverage.ts`
  - `check-internal-agent-admin-pages.ts`
  - `check-internal-agent-escalation-runtime.ts`
  - `check-internal-agent-seed-integrity.ts`
  - `check-internal-agent-runtime-loop.ts`
- All 12 deliverable docs + 4 status JSONs written to `generated/internal-ai-runtime-phase1/`.
- Append `internal-agents:run-all` script + integrate into `release:readiness:full`.
- **Verification**: `npm run release:readiness` shows 56/56 green; an injected escalation in DB appears in admin UI; a supervisor "suspend" action sets `current_status='suspended'` and the loop skips that agent next tick.

---

### Cross-cutting rules (enforced every phase)
- **Zero duplication**: reuse `ai_workforce_invocations`, `ai_workforce_approval_queue`, `agent_action_receipts`, existing AI gateway, existing budget check, existing kill-switches, existing admin shell, existing `DomainHubLayout`.
- **Zero stubs**: every new file has full implementation; validators run real checks.
- **Wiring contracts**: `internal_agent_actions.invocation_id` FK enforces canonical receipt linkage; admin pages drill through to the existing receipts viewer.
- **Spec-as-source**: 40 agents come from `src/lib/internal-agents/agents/*.ts` only; the parallel `src/packages/internal-agent-config/` is left untouched (it's a typed sub-package re-export) and explicitly noted in the audit doc as legacy contract types.
- **Safety**: every loop tick is policy-checked, budget-checked, kill-switch-checked, idempotency-keyed; max autonomy `simulate` for any agent declared `simulate`/`draft`/`recommend`/`observe` (no agent in the spec is currently `constrained-action`, so first-day risk surface is observe→approval-ready only).
- **Operator visibility**: every state change emits a `timeline_events` row using existing `brd_followthrough_transition`-style pattern adapted as `internal_agent.transition` so it appears in existing observability streams.
