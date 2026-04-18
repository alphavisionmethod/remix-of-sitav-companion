

## Phase 3 audit — what already exists vs. what's missing

**Already real and wired (do not duplicate):**
- ✅ `internal_agent_reflections` table — full schema, RLS, indexes, FK to intents/agents
- ✅ `record_internal_agent_reflection` RPC + EWMA trust roll on `internal_agent_runtime_state`
- ✅ `summarize_internal_agent_learning(_lookback_hours)` RPC
- ✅ `internal-agent-reflect` edge function (real outcome scoring, pattern detection, idempotent)
- ✅ `/admin/ai-runtime/reflection-board` page (gated `audit.view`, manual trigger)
- ✅ 3 Phase-3 BLOCK validators registered

**Missing (the actual Phase 3 prompt scope):**
1. ❌ `ai_implementation_suggestions` table + workflow + admin page
2. ❌ Suggestion generators wired to real signals (drift, error patterns, cost anomalies, dep scans)
3. ❌ `internal_agent_weekly_digests` table + scheduled digest generator + admin visibility
4. ❌ Dependency upgrade proposer (npm audit + outdated → suggestion pipeline)
5. ❌ Cron schedule for `internal-agent-reflect` (function exists but only manually triggered)
6. ❌ 6 required new validators + Phase-3 expansion in `phase3:run-all` and master aggregator

## Phased deployment plan (each phase shipped 100% real, no stubs)

### Phase 3A — Suggestion pipeline foundation (DB + RPCs + admin page)
- **Migration**: `ai_implementation_suggestions` table — `id, source_agent_id, source_council, source_signal_type, source_signal_ref, title, summary, rationale, evidence_refs jsonb, proposed_change_type, estimated_effort, expected_value, priority, status, review_comments, reviewer_user_id, reviewed_at, superseded_by, timestamps`. RLS: admin SELECT, service_role INSERT/UPDATE, block direct authenticated writes.
- **Indexes**: `(status, priority, created_at DESC)`, `(source_council, status)`, `(proposed_change_type)`, `(source_signal_type, source_signal_ref)` UNIQUE for dedupe.
- **RPCs (SECURITY DEFINER, admin-only)**: `propose_implementation_suggestion(...)` (idempotent on signal_ref), `record_implementation_suggestion_decision(_id, _action, _comments)`, `summarize_implementation_suggestions()`.
- **Admin page**: `/admin/ai-runtime/suggestions` — real Supabase queries, filters (status/type/council/source), drilldown drawer, accept/reject/mark in_progress/done buttons calling decision RPC. Wired into `AIRuntimeHome` as a new module tile (admin AI engineering team only).

### Phase 3B — Real suggestion generators (edge function `internal-agent-suggestion-generator`)
Reads from canonical signals **already in the DB** and emits suggestions via the RPC:
- **Drift**: top open `error_patrol_detections` patterns with frequency ≥ 5 → `reliability` suggestion
- **Repeated failures**: agents with ≥ 3 reflections where `should_repeat=false` and same `pattern_tags` → `governance` suggestion
- **Cost anomalies**: `ai_budget_alerts` rows in last 7d not yet linked to a suggestion → `cost` suggestion
- **Cross-council contradictions**: `internal_agent_consensus_sessions` with `conflict_detected=true` → `governance` suggestion
- **Policy drift**: `internal_agent_policy_drafts` in `pending_review` > 14d → `governance` suggestion
Each generator is keyed (idempotent via UNIQUE `source_signal_ref`). Service-role only.

### Phase 3C — Weekly digest (`internal-agent-weekly-digest` edge function + table)
- **Migration**: `internal_agent_weekly_digests` — `id, period_start, period_end, generated_by, summary_markdown, highlights jsonb, top_incidents jsonb, top_suggestions jsonb, top_cost_anomalies jsonb, trust_changes jsonb, escalations jsonb, evidence_refs jsonb, delivery_state, created_at`. Admin SELECT, service_role write, UNIQUE `(period_start, period_end)`.
- **Edge function**: aggregates real data (last 7d) — top error patterns, top suggestions, top reflections, trust deltas, escalation counts, consensus conflicts. Persists synthesized markdown digest. Source agent: `kc-knowledge-coordinator`.
- **Admin page**: `/admin/ai-runtime/weekly-digest` with list + drilldown showing rendered markdown + linked evidence.

### Phase 3D — Dependency upgrade proposer (`internal-agent-dependency-scanner` edge function)
- Reads `package.json` content posted in request body (called by a CI/cron uploader) OR ingests pre-scanned audit JSON via POST. **Real input only — no fake samples.**
- Normalizes findings: package, current, target, severity (critical/high/moderate/low), advisory_id, ecosystem.
- For each finding above `moderate`, calls `propose_implementation_suggestion` with `proposed_change_type=dependency_upgrade`, `source_signal_ref=npm-advisory-{id}` (idempotent).
- Persists raw normalized findings in new `dependency_upgrade_findings` table for operator drilldown.
- **CI hook**: a `scripts/runtime/post-dependency-audit.ts` runs `npm audit --json` and POSTs to the function (documented in `docs/runbooks/dependency-upgrade-proposer.md`).

### Phase 3E — Scheduling, validation, governance
- **Cron** (via Insert tool, project-specific URLs not committed):
  - `sita-internal-agent-reflect`: every 30 min (`*/30 * * * *`)
  - `sita-suggestion-generator`: every 6 hours (`0 */6 * * *`)
  - `sita-weekly-digest`: weekly Mon 07:00 UTC (`0 7 * * 1`)
- **6 new BLOCK validators** in `scripts/validation/`:
  - `check-implementation-suggestions-pipeline.ts` (table + RPCs + RLS + admin page wiring)
  - `check-suggestion-generator-function.ts` (real signal sources, idempotency, no fake data)
  - `check-weekly-digest-generation.ts` (table, edge function, admin page, scheduled)
  - `check-dependency-upgrade-proposer.ts` (function + findings table + suggestion pipeline link)
  - `check-trust-score-update-logic.ts` (EWMA via record RPC, no direct trust writes outside RPC)
  - `check-reflection-to-action-linkage.ts` (FK enforced, no orphan reflections)
- **Aggregator**: register all 6 in `check-os-release-readiness.ts` (gates #119–#124)
- **Package script**: expand `phase3:run-all` to run all 9 Phase-3 validators
- **AIRuntimeHome modules**: add 3 new tiles (Suggestions, Weekly Digest, Dependency Findings) — admin AI engineering team scope only

### Phase 3F — Required output bundle
Generate `generated/internal-ai-runtime-phase3/` with all 11 required files (audit, models, specs, verification, status JSONs).

## Integration safety
- **No duplicate systems**: reuses `internal_agent_action_intents`, `internal_agent_runtime_state`, `error_patrol_detections`, `ai_budget_alerts`, `internal_agent_consensus_sessions`, `record_internal_agent_reflection`, existing `evaluate_action_safety_gates`, existing approval queue.
- **Admin AI Engineering team only**: all new routes gated behind `audit.view` (consistent with siblings), surfaced exclusively under `/admin/ai-runtime/*`.
- **No autonomy expansion**: suggestions are draft-only, never auto-execute; trust updates remain governed by the existing EWMA RPC.
- **No fake content**: every generator reads real DB rows; dependency scanner refuses to run without real audit input; digest aggregates real signals or skips the section.

### Files touched (~25 new, ~3 edited)
- 3 migrations (suggestions table, digest table, dep findings table + RPCs)
- 4 edge functions (suggestion-generator, weekly-digest, dependency-scanner, + reflect cron wiring)
- 3 admin pages + AIRuntimeHome tile additions
- 6 validators + aggregator + package.json
- 11 generated/internal-ai-runtime-phase3/ artifacts
- 1 runbook (dependency upgrade)
- 1 cron schedule install via Insert tool

After deployment: 117 → **123 release gates GREEN**, full Phase 3 acceptance criteria met, zero duplicates, zero stubs, real data end-to-end.

