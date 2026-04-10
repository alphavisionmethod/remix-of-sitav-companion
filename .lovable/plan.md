

# SITA OS — 15 Systems Verification & Gap Closure

## Verification Summary: All 15 Services Exist

| # | System | File | Lines | Status |
|---|--------|------|-------|--------|
| 1 | Personal Operating Graph | `personal-graph/personal-operating-graph.ts` | 335 | Built |
| 2 | Intent Orchestrator | `intent-orchestrator/intent-orchestrator.ts` | 312 | Built |
| 3 | Attention OS | `attention-os/attention-os.ts` | 265 | Built |
| 4 | Continuity Engine | `continuity-engine/continuity-engine.ts` | 253 | Built |
| 5 | Trust-Weighted Actions | `trust-actions/trust-weighted-actions.ts` | 279 | Built |
| 6 | Chief-of-Staff | `chief-of-staff/chief-of-staff.ts` | 282 | Built |
| 7 | Timing Intelligence | `timing-intelligence/timing-intelligence.ts` | 222 | Built |
| 8 | Relationship Intelligence | `relationship-intelligence/index.ts` | 279 | Elevated |
| 9 | Digest Engine | `digest-engine/digest-engine.ts` | 224 | Built |
| 10 | SITA Modes | `sita-modes/index.ts` | 139 | Elevated |
| 11 | Adaptive Interface | `adaptive-interface/adaptive-interface.ts` | 81 | Built |
| 12 | Opportunity Engine | `opportunity-engine/index.ts` | 169 | Elevated |
| 13 | Memory Governance | `memory-governance/memory-governance-engine.ts` | 287 | Built |
| 14 | Boundary Engine | `boundary-engine/boundary-engine.ts` | 66 | Built |
| 15 | Experience Signature | `experience-signature/experience-signature.ts` | 73 | Built |

Barrel export wired: `os-orchestration/index.ts` → `services/index.ts` line 207.

## Critical Gaps Found

### Gap 1: Zero Cross-Wiring Between Services
All 15 services are **isolated**. None call each other. The plan said:
- Intent Orchestrator should wire to AttentionOS, TrustWeightedActions, ChiefOfStaff
- AttentionOS should read from SitaModes, TimingIntelligence, SurfaceDetection
- ChiefOfStaff should wire to AttentionOS, PersonalGraph, RelationshipIntelligence
- DigestEngine should consume OpportunityEngine, RelationshipIntelligence, CompoundLifeScore
- PersonalGraph should federate from EntityGraph, HouseholdGraph, RelationshipIntelligence

**None of this wiring exists.** Each service is a standalone class.

### Gap 2: No Context/Hook Layer — Services Are Unused
Zero imports of any of these 15 services exist in `src/components/`, `src/contexts/`, `src/hooks/`, or `src/pages/`. The services are built but **nothing in the app uses them**.

Need: A `SitaOSContext` or `useOSOrchestration` hook that instantiates and coordinates all 15 services, then exposes them to the component tree.

### Gap 3: Intent Orchestrator Not Wired to Brain Core
The plan explicitly said the Intent Orchestrator should be the canonical entry point wired into `callBrainCore`. Currently `callBrainCore` in `ai-gateway/callable.ts` still uses the old flow. The orchestrator should intercept/enhance intent classification before the edge function call.

### Gap 4: Digest Engine Has No Data Providers
`DigestEngine.registerProvider()` exists but no providers are registered. The daily pulse, weekly boardroom, etc. all produce placeholder sections. Need to wire actual data providers from: finance-os, business-os, relationship-intelligence, opportunity-engine, compound-life-score, ambient-intelligence.

### Gap 5: Adaptive Interface Not Connected to UI
The service computes interface state but nothing reads it. Need a `useAdaptiveInterface` hook that feeds density/animation/fontSize into the UI layer (CSS variables or a context).

---

## Implementation Plan

### Phase 1 — Cross-Service Orchestration Wiring (~40 min)

1. **Create `src/contexts/SitaOSContext.tsx`** — The OS kernel context that:
   - Instantiates all 15 services as singletons
   - Hydrates persisted state on mount
   - Wires cross-service dependencies (e.g., IntentOrchestrator uses AttentionOS for routing, TrustWeightedActions for evaluation, ChiefOfStaff for role selection)
   - Exposes services + convenience methods to the component tree
   - Mounts inside the authenticated provider tree (alongside PlatformInit)

2. **Wire IntentOrchestrator middlewares** — Add middleware that:
   - Calls `attentionOS.addItem()` for each processed intent
   - Calls `trustWeightedActions.evaluateAction()` for non-query intents
   - Calls `chiefOfStaff.selectRole()` to determine which persona handles the response
   - Calls `timingIntelligence.shouldActNow()` to defer non-urgent intents
   - Calls `boundaryEngine.checkBoundary()` for cross-domain intents

3. **Wire PersonalGraph federation** — Add a `federate()` method that pulls nodes from:
   - `entityGraph` (existing service) → person/business/workspace nodes
   - `relationshipIntelligence` → relationship nodes + edges
   - `householdOrgGraph` (existing) → household nodes
   - Device presence (existing) → device nodes

### Phase 2 — Data Provider Wiring (~20 min)

4. **Register DigestEngine providers** — Wire actual data providers:
   - `priority_stack` → from AttentionOS.getAttentionStack()
   - `financial_summary` → from finance-os overview
   - `relationship_updates` → from RelationshipIntelligence
   - `opportunities` → from OpportunityEngine.getNew()
   - `health_readiness` → from CompoundLifeScore
   - `pending_approvals` → from approval-engine
   - `schedule_overview` → placeholder (no calendar service yet)

5. **Wire ChiefOfStaff proactive triggers** — Connect proactive checks to real signals:
   - `cognitiveLoad` from AttentionOS
   - `neglectedContacts` from RelationshipIntelligence
   - `unusualSpend` from finance-os
   - Mode changes from SitaModes

### Phase 3 — UI Integration Hooks (~15 min)

6. **Create `src/hooks/useAdaptiveInterface.ts`** — Hook that:
   - Reads current SitaMode, cognitive load, surface detection
   - Calls AdaptiveInterfaceService.getInterfaceState()
   - Sets CSS custom properties for density/animation/fontSize
   - Returns state for conditional rendering

7. **Create `src/hooks/useExperienceSignature.ts`** — Hook that:
   - Returns current tone, verbosity, visual density
   - Used by assistant UI, notifications, and summary components

8. **Wire `useOSOrchestration` convenience hook** — Thin hook that:
   - Pulls from SitaOSContext
   - Exposes `processIntent()`, `getAttentionStack()`, `getMeetingPrep()`, `generateDigest()`, `getCurrentMode()`
   - Used by CommandPalette, assistant, notification center

### Phase 4 — Final Integration (~10 min)

9. **Mount SitaOSContext in the app** — Add provider in `App.tsx` or the authenticated layout
10. **Wire PlatformInit** — Add OS orchestration hydration to PlatformInit.tsx
11. **Verify build** — `npx tsc --noEmit`

---

## Technical Details

### New Files
- `src/contexts/SitaOSContext.tsx` (~250 lines)
- `src/hooks/useAdaptiveInterface.ts` (~60 lines)
- `src/hooks/useExperienceSignature.ts` (~30 lines)
- `src/hooks/useOSOrchestration.ts` (~40 lines)

### Files to Modify
- `src/lib/services/intent-orchestrator/intent-orchestrator.ts` — add cross-service middleware registration method
- `src/lib/services/personal-graph/personal-operating-graph.ts` — add `federate()` method
- `src/lib/services/digest-engine/digest-engine.ts` — register real data providers
- `src/lib/services/chief-of-staff/chief-of-staff.ts` — wire proactive triggers to real signals
- `src/components/sita/PlatformInit.tsx` — add OS orchestration init
- `src/App.tsx` (or auth layout) — mount SitaOSContext provider

### Architecture Rules Maintained
- No new domains (still 3)
- No new edge functions
- All wiring is client-side orchestration
- Uses existing persistence patterns
- No circular dependencies (context → services, services don't import context)

