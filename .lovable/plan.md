

# SITA OS — Wire Trust Architecture Into Live Runtime: Enhancement Plan

## Current State (Verified)

**Backend (fully wired and working):**
- `ai-capability-client.ts`: Routes through `PipelineOrchestrator` when contract exists, direct gateway otherwise. Post-hoc grounding checks on finance/business. Sentinel checks on pipeline completion. Negative receipts on block. ✅
- `pipeline-orchestrator.ts`: 9-stage pipeline with evidence grading, cite-check, negative receipts, ConscienceGate, CritiqueLoop. ✅
- `callable.ts`: ConscienceGate pre-flight + negative receipts on block. ✅
- `desk-executor.ts`: ConscienceGate + negative receipts on block. ✅
- `ai-gateway` edge function: Auth, routing, budget, Lovable AI call, receipt logging. ✅
- All 8 epistemic firewall modules: Substantive code with full exports. ✅
- Global contracts registry: 15+ contracts with evidence requirements, risk tiers, routing. ✅

**What is NOT wired (the gap):**
1. **No UI surfaces trust metadata** — `hasCaveats`, `wasBlocked`, `trustMetadata` are exposed from hooks but **zero components** read them. The advisor chat, boardroom, files AI — none display caveats, evidence grades, assumptions, or negative receipt details.
2. **No TrustMetadataBadge component** — The existing `TrustBadge` handles confidence levels but doesn't show epistemic firewall output (evidence grades, grounding status, assumption disclosures, caveat lists, negative receipt details).
3. **Cortex Loop not wired to any flow** — `runCortexLoop` has 0 callers. Boardroom and finance planning don't use it.
4. **EpistemicFirewallBoard shows live stats** but lacks drill-down into individual pipeline traces and negative receipts.

## Implementation Plan

### 1. Create `EpistemicTrustDisplay` component
A reusable component that renders trust metadata from AI responses:
- Evidence grade badge (A-F with color coding)
- Grounding status indicator
- Caveat list (collapsible)
- Assumption disclosures
- Negative receipt details (when blocked)
- Sentinel health indicator

**File:** `src/components/sita/EpistemicTrustDisplay.tsx`

### 2. Wire trust metadata into AdvisorChat
**File:** `src/components/sita/AdvisorChat.tsx`
- Import `EpistemicTrustDisplay`
- When `useAdvisorChat` returns messages with `envelope.trustMetadata`, render the trust display beneath assistant messages
- Show caveats inline, negative receipt details on blocked messages

### 3. Wire trust metadata into boardroom surfaces
**Files:** Boardroom summary components that use `useBoardroomSummary`
- Display evidence grade and assumptions on boardroom synthesis outputs
- Show caveat warnings on finance/business summaries

### 4. Wire trust metadata into Files AI assist
**Files:** Files AI assist components
- Show evidence grade on AI-generated file analysis
- Display grounding status for financial document analysis

### 5. Wire Cortex Loop into boardroom planning
**File:** `src/lib/ai/hooks/use-boardroom-summary.ts` (enhance)
- Wrap boardroom synthesis in a cortex loop: Sense (gather data) → Plan (generate summary options) → Approve (user confirms) → Execute (run synthesis) → Prove (receipt)
- Only for `premium_synthesis` task class

### 6. Enhance EpistemicFirewallBoard with drill-down
**File:** `src/pages/admin/architecture/EpistemicFirewallBoard.tsx`
- Add clickable pipeline trace rows showing full stage-by-stage execution
- Add negative receipt detail view with refusal reasons, suggested actions
- Add evidence grade distribution chart

### 7. Wire assumption registry into finance hooks
**Files:** Finance/money hooks and components
- When finance AI produces assumptions (income stable, expenses constant), register them via `createAssumption` and display them to the user
- Allow user to invalidate assumptions

## What Is NOT Needed
- No new services, edge functions, or directories
- No changes to `ai-gateway` edge function
- No changes to epistemic firewall modules (they're complete)
- No changes to pipeline orchestrator (it's complete)
- No changes to contracts registry

## What Is Deferred
- Kafka/NATS event bus
- Autonomous Cortex Loop across all domains
- Local model infrastructure
- Multi-model consensus
- Automated source ingestion
- Model distillation
- Hyper-personalization

## Anti-Sprawl
- All changes are UI wiring or hook enhancement — no new service directories
- Reuse existing `TrustBadge` patterns, add `EpistemicTrustDisplay` as the single new component
- No duplicate gateways or parallel stacks

## Summary
~6 files modified, 1 new component created. This completes the front-end wiring so users and admins actually see the trust architecture that's already running in the backend.

