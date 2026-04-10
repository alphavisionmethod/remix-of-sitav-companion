

# SITA OS — Runtime Truth Activation: Remaining Gaps & Enhancement Plan

## Audit Summary: What's Done vs What's Missing

### Already Implemented and Working

| System | Status | Evidence |
|--------|--------|----------|
| **OS Orchestration Hook** | Real auth user ID wired | `useAuth()` in `useOSOrchestration.ts` line 52-53 |
| **Intent Orchestrator** | Full 312-line service with 3 middlewares | Classifies, routes, builds execution plans, persists to CAI |
| **Attention OS** | Wired into 6 flagship pages | Cognitive load, priority stacks, attention routing all active |
| **Digest Engine** | 7 registered providers, DailyPulse triggers + persists | `useEffect` in DailyPulse.tsx calls `os.dailyPulse()` |
| **Experience Signature** | Computes tone/verbosity from mode + cognitive load | Used by Boardroom, PersonalBrain, ConciergeCenter |
| **Adaptive Interface** | CSS variables applied globally via ShellLayout | Density, animation, font scale all reactive |
| **EventBus Durability** | Full Supabase persistence via `event-bus-persistence.ts` | Persists events, dead letters, supports replay |
| **Memory Service Durability** | Full Supabase persistence via `memory-service-persistence.ts` | Insert, supersede, forget, fetch all durable |
| **Universal Service Persistence** | All 15 OS services persist to `os_service_state` | Upsert/load/delete per user per service |
| **CAI Persistence Bridge** | 23 persist functions for 23 CAI tables | All fire-and-forget, debounced where appropriate |
| **AI Gateway** | 465-line edge function with auth, budget, receipts | `invokeAICapability()` canonical client routes all AI |
| **AI Budget Policies** | DB functions for daily/weekly/monthly budget checks | `check_ai_budget_policies()` + `update_ai_budget_usage()` |
| **PersonalBrain** | Routes through intent orchestrator + edge function | Passes OS mode + tone to backend |
| **SettingsPage** | 12-mode selector persists to `operating_modes` CAI table | Audit trail via `persistOperatingMode()` |
| **Boardroom** | Queries `opportunity_signals`, `priority_stacks`, `digest_compilations` | CAI React Query hooks wired |
| **ConciergeCenter** | Queries `relationship_contexts`, `human_obligations` | CAI hooks wired |
| **Sidebar** | Mode badge + cognitive load indicator | Visual OS presence |
| **Receipt Service** | Hash-chained receipts with persistence adapter | Tests verify chain integrity |
| **Policy Engine** | Evaluates policies, risk tiers, constraints | Used by canonical chain orchestrator |

### Remaining Gaps (5 items)

**Gap 1 — BusinessCenter has zero OS wiring**
The BusinessCenter page (15 sub-pages, core domain) has no `useOSOrchestration`, no `useExperienceSignature`, no `useAdaptiveInterface`, no CAI data queries. It's the only major center completely disconnected from the OS layer.

**Gap 2 — ConciergeCenter queries CAI data but doesn't pass it to sub-pages**
`caiRelationships` and `caiObligations` are fetched (line 74-75) but never passed to `PageComponent` — the data is queried and discarded.

**Gap 3 — Boardroom queries CAI data but doesn't render it**
`caiOpportunities`, `caiPriorities`, `caiDigests` are fetched (lines 983-985) but never passed to `PacketView` or any child component — the data is queried and discarded.

**Gap 4 — No runtime truth probe for launch readiness**
There's no client-side health check that validates: "Are OS services hydrated? Is the AI gateway reachable? Are CAI tables accessible?" The launch-truth-audit script only checks generated JSON files.

**Gap 5 — ApprovalChamber/ApprovalsCenter not wired to OS trust evaluation**
The approval pages exist but don't use `os.evaluateAction()` for trust-weighted decisions before approvals execute.

## Fix Plan

### Fix 1 — Wire BusinessCenter to OS Layer
**File:** `src/pages/BusinessCenter.tsx`
- Import `useOSOrchestration`, `useExperienceSignature`, `useAdaptiveInterface`
- Consume attention stack for business-domain priority sorting
- Apply experience signature for tone consistency
- Query `opportunity_signals` filtered by domain="business" from CAI

### Fix 2 — Pass CAI data from ConciergeCenter to sub-pages
**File:** `src/pages/ConciergeCenter.tsx`
- Create a React context or pass `caiRelationships` and `caiObligations` as props to `PageComponent`
- At minimum, pass as context so ConciergeOverview can display real relationship data

### Fix 3 — Pass CAI data from Boardroom to child components
**File:** `src/pages/Boardroom.tsx`
- Pass `caiOpportunities` to the opportunity-board PacketView
- Pass `caiPriorities` to the morning-briefing PacketView
- Pass `caiDigests` to show historical digest compilations

### Fix 4 — Add runtime truth probe component
**New file:** `src/components/sita/RuntimeTruthProbe.tsx`
- Small utility component that checks: OS hydrated, AI gateway reachable (via a lightweight ping), CAI table accessible
- Shows a subtle status indicator in the sidebar or settings
- Logs results to console for debugging

### Fix 5 — Wire ApprovalChamber to OS trust evaluation
**File:** `src/pages/ApprovalChamber.tsx`
- Import `useOSOrchestration`
- Before executing an approved action, call `os.evaluateAction()` to get trust-weighted routing
- Display trust class and risk tier on approval cards

### Files Modified (5)
| File | Change |
|------|--------|
| `src/pages/BusinessCenter.tsx` | Add OS hooks + CAI opportunity queries |
| `src/pages/ConciergeCenter.tsx` | Pass CAI relationship data to sub-pages via context |
| `src/pages/Boardroom.tsx` | Pass CAI data to PacketView children |
| `src/pages/ApprovalChamber.tsx` | Wire trust evaluation from OS |

### Files Created (1)
| File | Purpose |
|------|---------|
| `src/components/sita/RuntimeTruthProbe.tsx` | Lightweight runtime health check component |

### What This Achieves
- BusinessCenter (the largest domain center) joins the OS orchestration layer
- CAI data actually flows to the components that render it (not just queried and discarded)
- Runtime truth is verifiable at startup
- Approval flows respect trust-weighted action evaluation
- Zero new services, domains, or edge functions

