

# SITA OS — Wire the Trust Architecture into the Real Runtime

## The Real Situation

All the epistemic firewall modules exist as substantive code, but **none of them are actually called** in the live AI execution paths. Here is what is happening now:

```text
CURRENT FLOW (what actually runs):
  useAdvisorChat / useAICapability / workforce-executor
    → invokeAICapability() [ai-capability-client.ts]
      → budget-gate check (works)
      → ai-gateway edge function (works: auth, routing, budget DB check, Lovable AI call, receipt logging)
      → response back

UNUSED (exist but never called from any live path):
  - PipelineOrchestrator.execute() — 0 callers
  - gradeEvidence() / gradeEvidenceSet() — 0 callers outside own file
  - citeCheck() — 0 callers outside own file
  - createAssumption() — 0 callers outside own file
  - checkGrounding() — 0 callers outside own file
  - createNegativeReceipt() — only called from tests and self
  - runSentinelChecks() — 0 callers outside own file
  - runCortexLoop() — 0 callers outside own file
```

The ConscienceGate IS wired (called from `callable.ts` and `desk-executor.ts`), and the CritiqueLoop IS wired (called from the pipeline orchestrator — but the pipeline orchestrator itself is never called).

## What Needs to Happen

Wire the existing trust modules into the actual runtime paths. No new modules needed. This is integration work.

### Phase 1 — Wire PipelineOrchestrator as the canonical frontend AI path

**File: `src/lib/ai/ai-capability-client.ts`**
- Before calling the edge function, run `pipelineOrchestrator.execute()` for tasks that have a registered contract
- For simple chat without a contract, keep the direct path but add evidence grading to the response envelope
- The pipeline already calls ConscienceGate, routing, inference (via callAIGateway), critique, and receipt stages

**File: `src/lib/ai/hooks/use-advisor-chat.ts`**
- Add evidence source metadata to the capability request when available
- Surface caveat/block decisions in the chat UI response

**File: `src/lib/ai/hooks/use-ai-capability.ts`**
- Same integration — route through pipeline when contract exists

### Phase 2 — Wire Evidence Grader into retrieval/context assembly

**File: `src/lib/core-services/mnemosyne/context-assembler.ts`** (or create if it's a stub)
- When assembling context for AI calls, grade each evidence source using `gradeEvidence()`
- Pass graded evidence into the pipeline request
- Block or caveat when domain requires higher grade than available

**File: `src/lib/services/canonical-pipeline/pipeline-orchestrator.ts`**
- In the RETRIEVAL stage, call `gradeEvidenceSet()` on assembled sources
- In the CONSCIENCE_GATE stage, pass evidence grades into the gate request
- Generate a negative receipt when evidence is insufficient for the domain

### Phase 3 — Wire Negative Receipts into refusal paths

**File: `src/lib/services/ai-gateway/callable.ts`**
- When ConscienceGate blocks, create a `NegativeReceipt` instead of just returning an error string
- Return the negative receipt structure in the response so the UI can display it

**File: `src/lib/services/canonical-pipeline/pipeline-orchestrator.ts`**
- When pipeline fails at CONSCIENCE_GATE or CRITIQUE stage, emit a negative receipt
- Include the receipt in the pipeline context for admin visibility

**File: `src/lib/services/desk/desk-executor.ts`**
- Same pattern — emit negative receipts on gate refusal

### Phase 4 — Wire Sentinel Engine into pipeline completion

**File: `src/lib/services/canonical-pipeline/pipeline-orchestrator.ts`**
- After RECEIPT stage, run sentinel invariant checks against the completed pipeline context
- Log violations to the sentinel report
- Block execution if critical invariants fail

### Phase 5 — Wire Tool Grounding into finance/tax paths

**File: `src/lib/services/sovereign-calculation/` modules**
- Add grounding verification before returning deterministic results
- Ensure finance/tax calculations are flagged as Grade A evidence

**File: `src/lib/services/canonical-pipeline/pipeline-orchestrator.ts`**
- In INFERENCE stage, when contract `requiresDeterministicVerification` is true, call tool grounding checks
- Block LLM-generated numbers that should come from deterministic tools

### Phase 6 — Wire Assumption Registry into AI response display

**File: `src/lib/ai/ai-capability-client.ts` or pipeline**
- When AI response contains assumptions (detected via prompt engineering or explicit markers), register them in the assumption registry
- Return assumptions as part of the response envelope

**Frontend components:**
- Add assumption disclosure badges to boardroom, finance, and advisor surfaces

### Phase 7 — Wire Admin Board to live data

**File: `src/pages/admin/architecture/EpistemicFirewallBoard.tsx`**
- Currently displays static config data (EVIDENCE_GRADE_POLICIES, GROUNDING_RULES, etc.)
- Wire it to show live runtime data: recent negative receipts, sentinel violations, evidence grade distribution, pipeline traces
- Connect to `getNegativeReceiptStats()`, `pipelineOrchestrator.getTraceLog()`, `conscienceGate.getVerdictStats()`

### Phase 8 — Wire Cortex Loop for boardroom/finance planning flows

**File: New integration in boardroom/finance planning components**
- For multi-step planning workflows (business proposals, financial forecasts), wrap in cortex loop
- Sense → gather evidence → Plan → generate options → Approve → user confirms → Execute → run calculation → Prove → receipt → Learn → log outcome
- Start with 2 flows: boardroom summary and financial forecast only

## What Is NOT Needed (already exists and works)

- ConscienceGate service — already wired into `callable.ts` and `desk-executor.ts`
- AI Gateway edge function — fully functional with auth, routing, budget, receipts
- Budget gate — already enforced in `ai-capability-client.ts`
- Model Router service — code complete, used by routing stage in pipeline
- Global Contracts Registry — 15 contracts defined, consumed by ConscienceGate
- CritiqueLoop — code complete, consumed by pipeline (once pipeline is wired)
- All epistemic firewall module code — complete, just needs callers

## What Should Be Deferred

- Kafka/NATS event bus infrastructure
- Autonomous Cortex Loop across all domains
- Local model infrastructure
- Automated source ingestion pipelines
- Multi-model consensus layer
- Model distillation
- Hyper-personalization / persona chaining

## Anti-Sprawl Rules

- No new service directories — only wire existing modules into existing paths
- No new edge functions — enhance existing `ai-gateway`
- No duplicate gateways — `invokeAICapability` remains the single entry point
- Pipeline orchestrator becomes the canonical orchestration layer beneath `invokeAICapability`, not beside it

## Technical Summary

This is ~8 files modified, ~2 new integration hooks, and ~200-400 lines of wiring code. The architecture modules are already written. The work is connecting them to the actual runtime so they stop being display-only code and start governing real AI execution.

