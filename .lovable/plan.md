

# Recommendation-to-Execution Closure + Service-Layer Unification + Flagship Loop Discipline

## Current State

**What EXISTS (strong foundation):**
- `ai_workforce_recommendations` table with `linked_approval_queue_item_id` and `linked_remediation_program_id` columns already
- `approval_queue` table with approve/reject/dismiss mutations
- `remediation_suggestions` table (basic gap → fix tracking)
- `execution_envelopes` table
- `ai_workforce_recommendation_scores` table
- Remediation engine (`remediation-engine.ts`) and recommendation verifier (`recommendation-verifier.ts`)
- 160 service domain directories, 38 customer journey entries

**What's MISSING:**
- No `remediation_programs` table (column exists on recommendations but target table doesn't)
- No `outcome_verification` table
- No recommendation lifecycle beyond new/accepted/rejected/deferred
- No execution binding from approved recommendations
- No REX/SERV/FL admin boards
- No flagship loop registry
- No service ownership model or route-to-service traceability
- No anti-sprawl diagnostics

## Implementation Plan

### Phase 1: Database Migration (1 migration)

Create 3 new tables:

**`remediation_programs`** — groups of recommendations into strategic work programs
- id, user_id, program_key, title, focus_area, status (draft/active/completed/archived), linked_flagship_loop, open_items_count, completed_items_count, created_at, updated_at
- RLS: users manage own rows

**`outcome_verifications`** — post-execution truth checks
- id, user_id, recommendation_id (FK → ai_workforce_recommendations), execution_ref, expected_improvement, actual_improvement, journey_delta, launch_truth_delta, score_adjustment, verified (boolean), verified_at, verifier_notes, created_at
- RLS: users manage own rows

**`flagship_loops`** — the 5 flagship product loops as first-class objects
- id, user_id, loop_key, title, owner, target_persona, routes (jsonb), capabilities (jsonb), primary_services (jsonb), cj_entries (jsonb), launch_blockers (jsonb), proof_status (text), ux_quality (text), launch_claim_status (text), demo_vs_real (text), created_at, updated_at
- RLS: users manage own rows

Also ALTER `ai_workforce_recommendations`:
- Add `execution_binding_status` (text, default 'unbound')
- Add `outcome_verification_id` (uuid, nullable FK)

### Phase 2: Recommendation Loop Service (1 file)

**`src/lib/services/recommendation-execution/recommendation-loop-service.ts`**

Canonical service with:
- `advanceRecommendationLifecycle(id, newStatus)` — enforces valid state transitions
- `bindToExecution(recommendationId, executionRef)` — links approved recommendation to remediation task
- `bindToRemediationProgram(recommendationId, programId)` — group linkage
- `verifyOutcome(recommendationId, verification)` — writes outcome verification
- `scoreFromOutcome(recommendationId)` — adjusts quality score based on outcome

### Phase 3: Flagship Loop Seed Service (1 file)

**`src/lib/services/flagship-loops/flagship-loop-service.ts`**

Seeds and manages 5 loops:
1. **sign-in-dashboard-pulse** — auth → dashboard → pulse
2. **files-ai-assist** — files → AI assistance → results
3. **boardroom-summary-decision** — boardroom → synthesis → action
4. **connected-services-sync** — connector hub → connect → health
5. **admin-truth-recommendation-approval** — admin → review → approve → execute

Each includes: routes, capabilities, primary services, CJ entries, launch blockers.

### Phase 4: Service Ownership Registry (1 file)

**`src/lib/services/service-registry/service-ownership-registry.ts`**

Static registry mapping 12 major domains to their primary services, routes, and capabilities:
- auth, dashboard, files, assistant, boardroom, connectors, approvals, settings, admin-truth, notifications, ai-runtime, recommendation-execution

Each entry: domain, primaryService, dependentServices, routes[], launchCriticality, flagshipLoop.

### Phase 5: Admin Boards (8 new pages)

**REX01 — Recommendation Intelligence Board** (`src/pages/admin/REX01RecommendationIntelligence.tsx`)
- Volume, quality scores, accepted/rejected/executed/outcome-verified rates by domain

**REX02 — Approval Queue Completion Board** (`src/pages/admin/REX02ApprovalQueueCompletion.tsx`)
- Pending, aging, high-risk, decision latency, bound-to-remediation stats

**REX03 — Recommendation → Execution Board** (`src/pages/admin/REX03RecommendationExecution.tsx`)
- Per-recommendation: status, approval, remediation program, execution state, outcome, score

**REX04 — Remediation Program Board** (`src/pages/admin/REX04RemediationPrograms.tsx`)
- Programs list with progress, linked recommendations, blocker count, CJ impact

**REX05 — Outcome Verification Board** (`src/pages/admin/REX05OutcomeVerification.tsx`)
- Executed items with expected vs actual improvement, journey delta, score adjustment

**FL01 — Flagship Loops Executive Board** (`src/pages/admin/FL01FlagshipLoopsExecutive.tsx`)
- 5 loops: health, proof status, blocker count, launch readiness, demo vs real

**FL02 — Flagship Loop Detail View** (`src/pages/admin/FL02FlagshipLoopDetail.tsx`)
- Single loop: steps, routes, services, proof coverage, UX gaps, blockers

**SERV01 — Domain Service Ownership Board** (`src/pages/admin/SERV01ServiceOwnership.tsx`)
- 12 domains: primary services, route count, duplicate risk, shadow-service risk

### Phase 6: Route Wiring + CJ Entries

**`src/App.tsx`** — Add lazy imports and routes for all 8 new admin pages under `/admin/rex/`, `/admin/flagship/`, `/admin/services/`

**`src/lib/customer-journey/journey-registry.ts`** — Add 3 entries:
- `admin.recommendation_approve_bind_execute`
- `admin.flagship_loop_inspect`
- `admin.outcome_verification_review`

## Files Summary

| File | Action |
|---|---|
| Migration SQL | **New** — 3 tables + 2 ALTER columns |
| `src/lib/services/recommendation-execution/recommendation-loop-service.ts` | **New** |
| `src/lib/services/flagship-loops/flagship-loop-service.ts` | **New** |
| `src/lib/services/service-registry/service-ownership-registry.ts` | **New** |
| `src/pages/admin/REX01RecommendationIntelligence.tsx` | **New** |
| `src/pages/admin/REX02ApprovalQueueCompletion.tsx` | **New** |
| `src/pages/admin/REX03RecommendationExecution.tsx` | **New** |
| `src/pages/admin/REX04RemediationPrograms.tsx` | **New** |
| `src/pages/admin/REX05OutcomeVerification.tsx` | **New** |
| `src/pages/admin/FL01FlagshipLoopsExecutive.tsx` | **New** |
| `src/pages/admin/FL02FlagshipLoopDetail.tsx` | **New** |
| `src/pages/admin/SERV01ServiceOwnership.tsx` | **New** |
| `src/App.tsx` | Update — add 8 routes |
| `src/lib/customer-journey/journey-registry.ts` | Update — add 3 entries |

## Database migration required
3 new tables + 2 ALTER columns on `ai_workforce_recommendations`.

## Deliberately excluded from this phase
- SERV02/SERV03 (route trace + sprawl audit) — deferred to avoid more sprawl while building anti-sprawl tools
- FL03 (prioritization board) — covered by FL01 executive view initially
- Automated anti-shadow cleanup — diagnostics first, cleanup later

