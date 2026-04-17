

## Fix C-007: REX Loop end-to-end — what's actually broken

### Live findings (severe — multiple cascading bugs)

I queried the live DB and read every relevant file. The brief understates the problem in 4 important ways:

1. 🔴 **Two parallel approval systems exist, both broken.**
   - User-facing pages (`ApprovalChamber`, `ApprovalsCenter`, `useApprovals`, `useApprovalQueue` in `use-brain-core.ts`, `use-approval-queue-mutations.ts`, even `DailyPulse`) all read/write `approval_queue` — **a table that does not exist** (`relation "approval_queue" does not exist`). Every query fails silently (catch returns `[]`), every mutation throws, and the UI falls back to demo mocks.
   - Admin pages (`HQApprovalQueue`, `REX02ApprovalQueueCompletion`) read `ai_workforce_approval_queue` — **the right table** — but with column names that don't exist (`risk_tier`, `resolved_at`).

2. 🔴 **Edge function inserts fail silently.** `admin-ai-workforce-run/index.ts:411-450` inserts into `ai_workforce_recommendations` and `ai_workforce_approval_queue` using ~10 columns that don't exist (`output_id`, `role_id`, `recommendation_type`, `risk_tier`, `estimated_impact`, `budget_impact_class`, `launch_impact_class`, `evidence_refs`, `queue_type`, `impacted_domain`, `evidence_summary`). Every "AI run" produces 0 persisted recommendations.

3. 🔴 **No execution chain runs.** `recommendation_execution_bindings`, `recommendation_execution_events`, `recommendation_outcome_verifications` all empty. No service ever inserts into them.

4. ✅ Schema for the REX loop is solid (20 tables + `v_recommendation_execution_pipeline` + `v_recommendation_closure_summary` views). RLS correctly user-scoped. Just nothing writes to it.

### The fix — pick ONE canonical table, wire the full loop

Designate **`ai_workforce_approval_queue`** as the single canonical user approval queue and retire the phantom `approval_queue`. Then wire the closed loop end-to-end.

#### 1. New canonical service `src/lib/services/rex/recommendation-engine.ts`

One file, three exported functions:
- `createRecommendation({domain, title, summary, evidence, severity, executionRequired, flagshipLoopKey})` — inserts into `ai_workforce_recommendations` with the **real** column set (`role_key`, `task_key`, `confidence`, `lifecycle_status`, `outcome_verification_required`, etc.).
- `routeToApproval(recommendationId)` — inserts a row into `ai_workforce_approval_queue` with the **real** columns (`recommendation_id`, `title`, `summary`, `priority`, `evidence_links`, `cost_implications`, `launch_implications`).
- `bindExecution(recommendationId, approvalQueueItemId, {bindingType, ownerTeam})` + `recordExecutionEvent(bindingId, eventType, summary)` + `recordOutcomeVerification(recommendationId, bindingId, expected, actual)` — wires the post-approval chain.

All functions emit a `flagship_loop_completions` receipt (`loop_key="admin-truth-recommendation-approval"`, `step_key` = `recommendation_created` / `routed_to_approval` / `execution_bound` / `outcome_verified`). RLS auto-scopes by `auth.uid()`.

#### 2. Replace ALL `approval_queue` reads/writes with `ai_workforce_approval_queue`

Surgical edits to retire the phantom table:

| File | Change |
|---|---|
| `src/hooks/use-sita-data.ts` (`useApprovals`) | `from("approval_queue")` → `from("ai_workforce_approval_queue")`; map columns: `action_summary` → `title`, `decision_reason` → `reviewer_comments`, etc. |
| `src/hooks/use-brain-core.ts` (`useApprovalQueue`) | Same table swap; update shape; mutation uses `decision_at` + `reviewer_user_id` + `reviewer_comments`. |
| `src/hooks/use-approval-queue-mutations.ts` | Same table swap; column rename `reviewed_by` → `reviewer_user_id`, `decision_reason` → `reviewer_comments`, `decided_at` → `decision_at`. |
| `src/pages/admin/REX02ApprovalQueueCompletion.tsx` | Drop `risk_tier` / `resolved_at` references → use `priority` + `decision_at`. |
| `src/pages/admin/HQApprovalQueue.tsx` | Same column corrections. |

#### 3. Fix the AI edge function inserts

`supabase/functions/admin-ai-workforce-run/index.ts` — rewrite the recommendation + approval inserts at lines 411-450 to match the real schema. Use `role_key` (not `role_id`), `severity`, `confidence`, `lifecycle_status`, `evidence`, `execution_required`, `flagship_loop_key`. For approval queue: `recommendation_id`, `title`, `summary`, `priority`, `evidence_links` only.

After this, every AI workforce run actually produces persisted recommendations.

#### 4. Wire ApprovalChamber + ApprovalsCenter to real data

- `ApprovalChamber.tsx` (line 308) — drop the "fall back to mocks when empty" behavior; render real `useApprovals()` rows. Map `priority` → `riskLevel`, `evidence_links` → `impactSummary`. When user clicks Approve, call `useApproveApprovalItem` (already updated) **and** call `bindExecution()` from the new engine if the recommendation has `execution_required=true`. Show a toast when the binding row is created.
- `ApprovalsCenter.tsx` — same: drop demo gate, use real hooks, surface `priority` instead of `risk_level`.

#### 5. Seed-able demo recommendation generator (so the loop is visible immediately)

Add a small "Generate Sample Recommendation" admin button in `ApprovalChamber` (visible only to admins via `has_role`) that calls `createRecommendation({ domain:"finance", title:"Reconcile Stripe payouts", summary:"3 payouts in last 24h need review", severity:"warning", executionRequired:true, flagshipLoopKey:"admin-truth-recommendation-approval", evidence:[{source:"stripe_payouts", count:3}]})` then `routeToApproval()`. Lets QA verify the loop in 1 click without waiting for an AI run.

#### 6. New migration — add minimal indexes & a helper view (only if missing)

A small migration to ensure:
- `decision_at` index on `ai_workforce_approval_queue` (used by Resolved tab order).
- A new view `v_user_pending_approvals` joining `ai_workforce_approval_queue + ai_workforce_recommendations` so the UI hook does one query instead of two. Idempotent `CREATE OR REPLACE VIEW` with `security_invoker=on`.

### Verification (post-deploy, end-to-end)

1. Sign in as a real user → open `/approval-chamber`. Click new "Generate Sample" button.
   - `SELECT * FROM ai_workforce_recommendations WHERE user_id=auth.uid() ORDER BY created_at DESC LIMIT 1` → returns the new row with `lifecycle_status='new'`.
   - `SELECT * FROM ai_workforce_approval_queue WHERE recommendation_id=<id>` → returns the queued approval.
   - Item appears immediately in the UI list (no refresh).
2. Click **Approve**.
   - `ai_workforce_approval_queue.status='approved'`, `decision_at` set, `reviewer_user_id` set.
   - `ai_workforce_recommendations.lifecycle_status` advanced to `approved`.
   - `recommendation_execution_bindings` has 1 new row (`binding_status='bound'`).
   - `recommendation_execution_events` has 1 row (`event_type='created'`).
   - `recommendation_outcome_verifications` has 1 row (`verification_status='pending'`).
   - `flagship_loop_completions` has 4 new rows for this user (created, routed, decision, bound).
3. Refresh `/admin/rex02-*` boards — counts update; no more "0 / silent error".
4. Re-run an AI workforce job from `/admin/ai-runtime` → recommendations actually persist (currently they don't).
5. `useApprovals()` no longer returns `[]` for live users.

### Files

| File | Change |
|---|---|
| `src/lib/services/rex/recommendation-engine.ts` | NEW — canonical create/route/bind/event/verify functions |
| `src/hooks/use-sita-data.ts` | `useApprovals` → `ai_workforce_approval_queue`, column rename |
| `src/hooks/use-brain-core.ts` | `useApprovalQueue` → `ai_workforce_approval_queue`, column rename |
| `src/hooks/use-approval-queue-mutations.ts` | Table + column rename; add `bindExecution` call on approve |
| `src/pages/ApprovalChamber.tsx` | Drop demo fallback; real data; "Generate Sample" admin button |
| `src/pages/ApprovalsCenter.tsx` | Drop demo gate; real data; map new columns |
| `src/pages/admin/HQApprovalQueue.tsx` | Drop `risk_tier`/`resolved_at`; use `priority`/`decision_at` |
| `src/pages/admin/REX02ApprovalQueueCompletion.tsx` | Same column corrections |
| `supabase/functions/admin-ai-workforce-run/index.ts` | Rewrite recommendation + approval insert columns |
| `supabase/migrations/<new>.sql` | Index on `decision_at`; `v_user_pending_approvals` view |

### Acceptance

- `useApprovals` returns real DB rows (no silent fallback)
- One canonical approval table (`ai_workforce_approval_queue`) used by user, admin, edge functions
- AI workforce runs persist recommendations + queue items (today they silently drop)
- Approve click runs the full chain: queue → binding → event → outcome verification → 4 receipts
- C-007 moves 🟡 PARTIAL → ✅ RESOLVED, deployment-ready

