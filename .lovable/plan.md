

# SITA OS — Intelligence & Advisor System Completion Plan

## Audit Summary

After reviewing the entire codebase, SITA OS already has an extraordinarily deep intelligence architecture:

**What exists and is fully implemented:**
- Brain Core with intent parsing, orchestration plans, council voting, advisor selection, simulation builder, approval packaging, explanation builder, boardroom request builder (8 modules)
- Advisor Protocol Engine with 26 advisors across 4 councils (business: 7, finance: 6, concierge: 6, meta: 7), full council protocol with disagreement detection, capability checks, trust threshold validation, mission modes (10 modes), perspective configs (475 lines)
- No-Hallucination Engine with confidence envelopes, staleness tracking, grounding reports, contradiction detection, refusal engine, truth boundaries (35 deterministic field rules), advisor grounding contracts (6 contracts)
- Internal Agent Workforce: 40 agents across 6 councils, 7 supervisors, full rights system with promotion/demotion rules
- Self-Learning Engine: 521 lines with exponential decay, confidence calibration, pattern detection, promotion/demotion recommendations
- Agent Orchestrator: 418 lines with lifecycle management, scheduler, task queue, fleet status, cost budgets
- Self-Healing: immune controller, root cause analysis, auto-remediation capabilities
- Workflow Engine: 11-state canonical state machine with validated transitions
- Core Services Chain Orchestrator: policy → executor → receipt → verification with refusal receipts
- Correction Service: records user corrections and adjusts confidence per domain
- Trust Memory: weighted factor scoring with flags and history

**What is genuinely missing (5 items):**

### 1. Advisor Handoff Protocol
No `handoff` logic exists. When one advisor reaches its autonomy ceiling or a cross-domain issue emerges, there is no formal protocol for transferring context to another advisor.

### 2. Advisor Performance Evaluation Service
The Self-Learning Engine tracks agent performance but there is no advisor-specific performance evaluation that maps to the `kpis` field on each `AdvisorDefinition`. No scoring of advisor recommendations vs actual outcomes.

### 3. Escalation Protocol for Advisor Council
Collections has escalation. Internal agents have escalation targets. But the advisor council itself has no formal escalation chain — what happens when a council vote fails consensus, when confidence is below threshold, or when a meta-advisor disagrees with a domain advisor.

### 4. Negative Receipts (Refusal Proof)
The core-services chain creates `refusalReceipt` on policy deny, but there is no formalized negative receipt type in the proof-model package. The receipt-service in `src/lib/services/receipt-service` only has `ActionReceipt` and `SystemReceipt`.

### 5. Budget-Aware Compute Router
The Model Routing agent exists as a definition but has no actual routing logic. No service maps intent complexity to model tier (cheap/fast vs expensive/accurate).

---

## Implementation Plan

### Task 1: Advisor Handoff Protocol
**File:** `src/lib/advisor-protocol/handoff.ts`

Create a formal handoff protocol with:
- `HandoffRequest` type: source advisor, target advisor, context payload, reason, urgency
- `HandoffResult`: accepted/rejected, context received, proof ID
- `initiateHandoff()`: validates target advisor has capacity and relevant scope
- `acceptHandoff()`: target advisor acknowledges with context receipt
- `rejectHandoff()`: target refuses with reason, triggers escalation
- Rules: context must include all relevant memory keys, proof chain must continue, original advisor remains in "monitoring" state

Export from `src/lib/advisor-protocol/index.ts`.

### Task 2: Advisor Performance Evaluation
**File:** `src/lib/advisor-protocol/performance.ts`

Create evaluation service that:
- `AdvisorPerformanceRecord`: tracks recommendation acceptance rate, correction frequency, confidence calibration accuracy, average response quality, boardroom contribution score
- `evaluateAdvisor()`: computes performance against the advisor's `kpis` field
- `getAdvisorScorecard()`: returns formatted scorecard per advisor
- `getCouncilPerformance()`: aggregates across a council
- `shouldDemoteAdvisor()` / `shouldPromoteAdvisor()`: based on outcome history
- Connects to the Self-Learning Engine for outcome data

Export from `src/lib/advisor-protocol/index.ts`.

### Task 3: Council Escalation Protocol
**File:** `src/lib/advisor-protocol/escalation.ts`

Create escalation logic for the advisor council:
- `EscalationTrigger`: consensus failure, confidence below threshold, blocking disagreement, autonomy ceiling reached, policy violation
- `EscalationTarget`: meta-advisor, owner, trust-policy-advisor, recovery-advisor
- `evaluateEscalation()`: given a `CouncilSynthesis`, determine if escalation is needed
- `routeEscalation()`: select target based on trigger type and domain
- `createEscalationPackage()`: bundle context, disagreements, recommendations, and proof for the escalation target
- Rules: blocking disagreements always escalate to owner; consensus failures escalate to meta-advisor first; policy violations escalate to trust-policy-advisor

Export from `src/lib/advisor-protocol/index.ts`.

### Task 4: Negative Receipt Type in Proof Model
**File:** `src/packages/proof-model/index.ts` — add `RefusalReceipt` type
**File:** `src/lib/services/receipt-service/receipts.service.ts` — add `createRefusalReceipt()`

Add:
- `RefusalReceipt` type: extends base receipt with `refusalReason`, `blockedAction`, `policyId`, `advisorId`, `confidenceAtRefusal`, `requiredForRetry` fields
- `createRefusalReceipt()` in receipt service with hash chaining
- Update `TypedReceipt` union to include `RefusalReceipt`

### Task 5: Budget-Aware Model Router
**File:** `src/lib/services/brain-core/model-router.ts`

Create:
- `ModelTier`: "nano" | "standard" | "premium" | "reasoning"
- `ModelRoutingDecision`: selected tier, estimated cost, estimated latency, reasoning
- `routeToModel()`: given intent complexity, domain risk class, budget remaining, and urgency → select model tier
- Rules: critical-truth domains always use "premium" or "reasoning"; low-risk queries use "nano"; simulations use "standard"; budget exhaustion forces downgrade with caveat
- `getModelBudgetStatus()`: remaining budget, spend rate, projected exhaustion

Export from brain-core index.

### Task 6: Update Registries and Manifests
- Update `generated/advisor-registry.json` to include `handoffTargets`, `escalationBehavior`, and `performanceKpis` per advisor
- Update `generated/capability-index.json` to include model-routing capability
- Verify all new exports compile cleanly

---

## What Does NOT Need Work

These are all fully implemented and correct:
- Intent parsing and orchestration (brain-core)
- Council voting and synthesis (advisor-protocol)
- Disagreement detection (advisor-protocol — `detectCouncilDisagreements`)
- Advisor capability checks and trust validation
- Truth boundaries (35 deterministic rules)
- Confidence/staleness/grounding/contradiction/refusal engines (no-hallucination)
- Advisor grounding contracts (6 advisors)
- Mission modes (10 modes with advisor prominence)
- Workflow state machine (11 states)
- Self-healing immune system
- Self-learning with decay
- Agent orchestrator with fleet management
- 40 internal agents with full definitions
- Correction service with confidence adjustment
- Trust memory with factor scoring

---

## Implementation Order

1. Advisor Handoff Protocol (foundational)
2. Council Escalation Protocol (depends on handoff)
3. Negative Receipt Type (quick, enables proof for refusals)
4. Advisor Performance Evaluation (connects learning → advisors)
5. Budget-Aware Model Router (operationalizes cost control)
6. Registry updates (final sync)

All work stays within existing architecture. No new packages. No new backend services.

