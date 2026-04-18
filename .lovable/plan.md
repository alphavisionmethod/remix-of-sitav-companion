

## Phase 1 Final Closure — Gaps Found

### Verified GREEN (already complete)
- 5/5 DB tables exist (`internal_agent_definitions`, `internal_agent_runtime_state`, `internal_agent_actions`, `council_escalations`, `supervisor_decisions`)
- **40/40 agents seeded across 6 councils**, **40/40 runtime_state rows** backfilled
- `internal-agent-loop` edge function exists (611 lines, real budget/kill-switch/receipt wiring)
- `InternalAgentsBoard` (492 lines), `CouncilsBoard` (334 lines), `AIRuntimeDrilldownPanel` (259 lines) — all real, not stubs
- 6 internal-agent validators + 2 admin-flagship validators in `scripts/validation/`
- `flagship-surface-closure/` 11 deliverables present

### Two real gaps to close

**Gap 1 — 12 of 12 required Phase 1 deliverables are missing** (only `ARCHITECTURE.md`, `RUNTIME_LOOP.md`, `SUPERVISOR_MODEL.md`, `VALIDATORS_INDEX.md`, `seed-payload.json` exist; the 12 prompt-mandated filenames are absent because the earlier pass used different names).

**Gap 2 — `internal-agent-loop` has no `pg_cron` schedule** → "scheduled runtime loop is real" acceptance criterion fails. The function exists and runs on manual trigger, but no cron job invokes it. This is the only true wiring gap.

### Closure work (single deploy)

**A. Add pg_cron schedule for `internal-agent-loop`** (data migration via insert tool — contains anon key, must not be a schema migration):
- Enable `pg_cron` + `pg_net` extensions if not already enabled (verified separately).
- Insert one cron job: `internal-agent-loop-tick` running `*/5 * * * *` (every 5 min). Loop internally evaluates which agents are due based on `schedule_type` (continuous=5m, hourly, daily, on-event=skipped). This matches the prompt's cadence model with one frequent loop + internal due-evaluation (the cleanest project-native option).
- Job calls `https://fctupowhcljejygjfpty.supabase.co/functions/v1/internal-agent-loop` with anon-key bearer + `{"trigger":"cron"}` body.

**B. Generate the 12 missing Phase 1 deliverables** under `generated/internal-ai-runtime-phase1/`:

| File | Content source |
|---|---|
| `INTERNAL_AI_RUNTIME_PHASE1_CURRENT_STATE_AUDIT.md` | Pre-bridge gap inventory (Sys A vs Sys B) |
| `INTERNAL_AI_RUNTIME_PHASE1_TARGET_MODEL.md` | End-state architecture |
| `INTERNAL_AGENT_TABLES_AND_LINKAGE.md` | DB schema + FK lineage to `ai_workforce_invocations`/receipts/approvals |
| `INTERNAL_AGENT_RUNTIME_LOOP_SPEC.md` | Loop algorithm, cron cadence, due-evaluation, safety guards |
| `INTERNAL_AGENT_ADMIN_UI_SPEC.md` | `/admin/ai-runtime/internal-agents` + `/councils` page contracts |
| `INTERNAL_AGENT_SEEDING_MODEL.md` | `seed_internal_agents_from_json` RPC + idempotency via `spec_hash` |
| `SUPERVISOR_RUNTIME_MODEL.md` | 7 supervisors, decision types, escalation routing, meta-supervisor path |
| `INTERNAL_AI_RUNTIME_PHASE1_FINAL_VERIFICATION.md` | Acceptance criteria checklist with evidence per item |
| `internal-agent-phase1-status.json` | Machine-readable status: 40 agents, 6 councils, all gates green, cron active |
| `internal-agent-table-map.json` | Table → row counts → FK targets |
| `internal-agent-runtime-loop.json` | Function path, cron schedule, cadence map, safety tokens |
| `internal-agent-verification.json` | Per-criterion pass/fail snapshot |

**C. Verify by running the 6 internal-agent validators** + confirming the cron job appears in `cron.job` (queryable via service-role helper if needed).

### Cross-cutting (unchanged from approved plan)
- Zero new tables, zero stubs, zero duplicate runtime stacks.
- Cron uses real anon-key insert (per `schedule-jobs-supabase-edge-functions` rule) — not a schema migration.
- All 12 deliverables generated from real DB state + real file inspection (no fabricated numbers).
- No code changes to admin UI, edge function, or registry — those are already complete.

