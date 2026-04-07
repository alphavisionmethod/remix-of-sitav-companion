

# SITA OS — God-Tier Architecture Integration Plan

## Current Reality Assessment

SITA already has **most of the God-Tier modules in partial or complete form**:

| Proposed Module | Current SITA Equivalent | Status |
|---|---|---|
| Brain Core | `src/lib/services/brain-core/` (10 files) + `brain-core` edge function | **Exists — needs elevation** |
| ConscienceGate | `groundedness-gate/` + `no-hallucination/` types + launch honesty systems | **Partial — needs unification** |
| ModelRouter | `model-router/` (210 lines, full routing logic) + `ai-gateway` edge function | **Exists — needs formalization** |
| InferenceEngine | `inference-gateway/` (193 lines) + `ai-gateway` edge function | **Exists — already the canonical inference path** |
| Mnemosyne | `mnemosyne/` (34 lines, basic memory service) | **Stub — needs real implementation** |
| Math-OS | `sovereign-calculation/` (formulas, regime, risk, scenario, reserves, receivables) | **Exists — rename only** |
| Desk / Tool Executor | `executor-service/` + `recommendation-execution/` + `connector-runners/` | **Fragmented — needs consolidation** |
| Journeys / Autopilot | `operating-autopilot/` + customer journey + workflow-engine | **Exists — needs consolidation** |
| Event Bus | `event-bus/` (envelope, publish, subscribe) + `event-broker/` | **Exists — dual service needs merge** |

**Key finding: SITA does NOT need new modules. It needs consolidation, elevation, and wiring of what already exists.**

---

## Implementation Plan

### Phase 1: God-Tier Integration Engine + Admin Board (Immediate)

**File 1: `src/lib/services/architecture/god-tier-integration-engine.ts`** (~600 lines)

The definitive integration report as executable data, containing:

1. **Module Mapping Matrix** — All 9 proposed modules mapped to current SITA equivalents with `integrate_now | elevate | consolidate | defer | reject` classifications
2. **Integrate/Defer/Reject/Rename Matrix** — For every proposed concept with strategic value, launch value, complexity cost, sprawl risk, rationale, and exact next step
3. **Flagship Loop Impact Matrix** — How each God-Tier concept maps to the 5 flagship loops
4. **Security/Governance Impact Matrix** — Per-module safety, traceability, leakage risk, blast radius assessment
5. **Complexity vs Leverage Matrix** — Effort vs value for each proposed integration
6. **Anti-Sprawl Risk Matrix** — Whether each concept reduces or increases sprawl (critical given 160+ service directories)
7. **Task Type Mapping** — Math/Proof, Tool Execution, Vision/OCR, Draft/Rewrite, Deep Reasoning, Embeddings, On-device — each classified as `immediate | near_term | later | avoid`
8. **Phased Implementation Plan** — Phase A (immediate high-leverage), Phase B (near-term strengthening), Phase C (advanced intelligence), Phase D (long-term evolution)
9. **Contract Map Analysis** — Which contracts already exist, which new ones are needed, where contract sprawl would be dangerous
10. **What to Integrate Now vs What Not to Integrate Yet** — Explicit, opinionated sections

**Key integration recommendations encoded in the engine:**
- **Brain Core**: Already canonical. Elevate `orchestrate-intent.ts` as the single intelligence entry point. Do NOT create a second brain.
- **ConscienceGate**: Rename `groundedness-gate` → formalize as ConscienceGate. Wire it as a pre-response validation step. Merge with existing no-hallucination types.
- **ModelRouter**: Already complete (210 lines, routing, fallback, health, cost). Just formalize as the canonical model selection layer.
- **InferenceEngine**: Already exists as `inference-gateway`. Keep as-is. Do NOT create a second inference layer.
- **Mnemosyne**: Exists as stub. Expand to include file context assembly, profile retrieval, conversation history. Defer advanced embeddings/reranking.
- **Math-OS**: Rename `sovereign-calculation` → acknowledge as Math-OS. Already has formulas, regime, risk, scenario. No rebuild needed.
- **Desk**: Consolidate `executor-service` + `recommendation-execution` + `connector-runners` into one Desk concept. Defer autonomous tool execution.
- **Autopilot**: Consolidate `operating-autopilot` + `workflow-engine`. Defer fully autonomous flows until approval/proof hardened.
- **Event Bus**: Merge `event-bus` + `event-broker` into single canonical event system. Already has envelopes.
- **CritiqueLoop**: NEW concept — add as a lightweight post-inference validation step that feeds back to ConscienceGate. Not a full module, just a pattern.

**What NOT to integrate yet:**
- Local/on-device model support (no runtime need)
- Vision/OCR task routing (no flagship loop needs it now)
- Advanced LoRA orchestration
- Multi-agent debate as a runtime system (already has `multi-agent-debate/` directory — leave as-is)
- Full autonomous autopilot (approval/proof discipline not ready)

**File 2: `src/pages/admin/architecture/GodTierIntegrationBoard.tsx`**

Admin board (GOD01) displaying:
- Module mapping with current SITA equivalents
- Integrate/Defer/Reject classification with rationale
- Flagship loop impact view
- Anti-sprawl risk assessment
- Phased implementation timeline
- Security/governance impact per module
- Missing-to-safe-integration matrix

### Phase 2: Route Wiring

**File 3: `src/App.tsx`** — Add lazy import and route for `/admin/architecture/god-tier-integration`

---

## Technical Details

### Files Created/Modified

| File | Action | Lines |
|---|---|---|
| `src/lib/services/architecture/god-tier-integration-engine.ts` | CREATE | ~600 |
| `src/pages/admin/architecture/GodTierIntegrationBoard.tsx` | CREATE | ~350 |
| `src/App.tsx` | MODIFY | +4 lines (lazy import + route) |

### No Database Changes Required
All data is static architecture analysis in TypeScript.

### Success Criteria
1. All 9 proposed modules mapped to current SITA equivalents
2. Integrate/Defer/Reject matrix with rationale for every concept
3. 5 flagship loops mapped with God-Tier component impact
4. Anti-sprawl risk explicitly assessed for each module
5. Phased implementation plan (A/B/C/D) with clear boundaries
6. Task type mapping with maturity classification
7. Contract map analysis identifying existing vs needed contracts
8. Security/governance impact per module
9. Admin board with `data-testid` attributes
10. 0 TypeScript errors

