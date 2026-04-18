

The user wants Boardroom Layer 7 (post-approval follow-through) fully closed in phases, production-grade. Let me map current canonical state then plan minimal but complete phases.

**Existing canonical pieces (from memory + schema):**
- `boardroom_items`, `boardroom_decision_receipts`, `ai_workforce_recommendations`, `ai_workforce_approval_queue`
- `advisor_board_actions`, `advisor_board_reflections`
- `command_steps`, `timeline_events`, `proofs` (canonical execution + proof tables)
- `agent-executor` edge function (sole orchestration choke point)
- `recommendation-engine.ts` service (REX lifecycle)
- 13-state Boardroom lifecycle (per `architecture/orchestration-pipeline` memory)
- `OrchestrationFacade` (sole entry point)

**Real gap:** Layer 7 chain after `APPROVED` — dispatch→execute→result→proof→outcome→reflection — is not durably linked end-to-end with explicit lifecycle states, operator visibility, or E2E proof.

**Plan: 4 phases, no parallel systems, extend canonical tables.**

---

# Plan — Boardroom Layer 7 Follow-Through Closure

## Phase 1 — Canonical Lifecycle + Linkage Schema (Foundation)
Extend existing canonical tables; no parallel systems.

**DB migration (additive only):**
- Add `followthrough_state` enum to `boardroom_items`: `approved | dispatch_pending | dispatched | executing | executed | receipt_recorded | outcome_pending | outcome_tracked | reflected | closed | failed`
- Add columns to `boardroom_items`: `followthrough_state`, `dispatch_id`, `execution_command_step_id`, `outcome_status`, `outcome_recorded_at`, `reflection_id`, `last_followthrough_event_at`
- New table `boardroom_followthrough_dispatches` (links item ↔ recommendation ↔ approval ↔ command_steps ↔ proofs)
- New table `boardroom_outcome_records` (expected vs actual, success/partial/failed, affected entities, confidence, retry flag)
- Extend `advisor_board_reflections` with `boardroom_item_id`, `outcome_record_id`, `dispatch_id` FKs
- RLS: org-scoped via `is_org_member`; admin override via `has_role`
- Indexes on state, dispatch_id, item_id

**Service layer (extend canonical, no forks):**
- `src/lib/services/boardroom/followthrough-engine.ts` — state machine, transitions, idempotency, timeline emission
- Extend `recommendation-engine.ts` to call followthrough-engine on approval capture
- All transitions emit `timeline_events` with correlation_id

## Phase 2 — Dispatch + Execution + Proof Wiring
Wire approval → real `agent-executor` invocation; persist results; link proofs.

**Edge functions:**
- New `boardroom-followthrough-dispatch` — receives approved recommendation, builds execution payload, calls `agent-executor`, writes `boardroom_followthrough_dispatches`, transitions state `dispatch_pending → dispatched → executing`
- Extend `agent-executor` to write `command_steps` rows and emit `proofs` linked to `dispatch_id`
- New `boardroom-outcome-record` edge function — accepts outcome verification (auto from executor success + manual operator override), writes `boardroom_outcome_records`, transitions `executed → outcome_tracked`

**Hooks:**
- `useBoardroomFollowthrough(itemId)` — real-time subscription on state changes
- `useDispatchBoardroomAction(itemId)` — mutation wrapper

## Phase 3 — Operator + User Visibility
Extend existing admin/user surfaces; no new disconnected pages.

**User-facing (extend Boardroom shell):**
- New tab/subview `BoardroomFollowthroughPanel` inside existing Boardroom shell — chain visualization (approved → dispatched → executed → outcome → reflected), per-state badges, calm aesthetic, proof drilldowns
- Per-item state badge in existing decision/recommendation lists
- Failed/attention-required CTA inline

**Admin-facing (extend existing /admin/approvals + /admin/verification):**
- New panel `Layer7FollowthroughBoard` inside `/admin/approvals` — queues for: stale dispatches, failed executions, missing proofs, missing outcomes, missing reflections
- Drilldown modal with full chain (item → recommendation → approval → dispatch → command_step → proof → outcome → reflection)
- Manual operator actions: retry dispatch, mark outcome, force-close

**Reflection capture:**
- `BoardroomReflectionPrompt` component — surfaces after `outcome_tracked`, captures usefulness/quality/lessons, writes to `advisor_board_reflections` with full linkage, transitions to `reflected → closed`

## Phase 4 — E2E Proof + Validation Guardrails
Real integration tests + CI gates to prevent regression.

**E2E tests (`tests/e2e/boardroom-layer7/`):**
- `boardroom-followthrough-low-risk.spec.ts` — full chain low-risk auto-approve path
- `boardroom-followthrough-dual-approval.spec.ts` — high-risk dual-approval path
- Both assert: item created → recommendation → approval → dispatch row → command_step → proof → outcome record → reflection → state=closed

**Validation scripts (`scripts/validation/`):**
- `check-boardroom-layer7-state-coverage.ts` — every item past APPROVED has terminal state within SLA
- `check-boardroom-followthrough-linkage.ts` — no orphan dispatches/outcomes/reflections
- `check-boardroom-proof-receipt-coverage.ts` — every executed dispatch has proof
- `check-boardroom-outcome-tracking.ts` — outcome record exists for every executed dispatch
- `check-boardroom-reflection-coverage.ts` — reflection coverage rate ≥ threshold
- `check-boardroom-layer7-e2e.ts` — runs the E2E suite as a release gate

**Generated artifacts under `generated/boardroom-layer7-closure/`:**
- All 9 markdown files + 4 JSON files exactly as specified in the prompt
- Wired into `master-release-aggregator` as new BLOCK-level gate `boardroom-layer7-closure`

## Out of scope
- Replacing existing 13-state lifecycle (we map into it)
- Touching other flagship loops
- New approval mechanism (we use canonical `approval_decisions` / `ai_workforce_approval_queue`)
- Mobile surfaces (mobile is honestly archived per memory)

## Deliverables per phase
- Phase 1: 1 migration, 1 service, schema docs
- Phase 2: 2 edge functions, 1 extended edge function, 2 hooks
- Phase 3: 3 new components, 2 extended pages, 1 reflection flow
- Phase 4: 2 E2E specs, 6 validation scripts, 13 generated truth artifacts, 1 master-release gate

