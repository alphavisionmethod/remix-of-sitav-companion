
# Sovereign AI Gateway — Implementation Audit & Gap Plan

## What Already EXISTS (Extensively Built)

### Backend (Edge Function) — COMPLETE
| Component | Location | Status |
|---|---|---|
| **Central AI Gateway** | `supabase/functions/ai-gateway/index.ts` (465 lines) | Full: auth, routing, budget check, Lovable AI calls, fallback, streaming, receipt logging to 5 tables |
| **Budget gate (client)** | `src/lib/ai-gateway/budget-gate.ts` | Full: pre-invocation budget enforcement |
| **AI capability client** | `src/lib/ai/ai-capability-client.ts` | Full: `invokeAICapability`, `invokeSynthesis`, `invokeUtility` — sole frontend entrypoint |
| **AI state types** | `src/lib/ai/ai-state-types.ts` | Full: 18 AI states, launch levels, surface taxonomy |
| **AI hooks** | `src/lib/ai/hooks/` | Full: `useAICapability`, `useAdvisorChat`, `useBoardroomSummary`, etc. |

### Compute Governance Package — COMPLETE (~1,200 lines)
| Module | File | Status |
|---|---|---|
| Model routing engine | `model-routing-engine.ts` | Full: 4-tier routing, cost classes A–D, task classification |
| Budget policy engine | `budget-policy-engine.ts` | Full: 9 budget scopes, hard/soft limits, deep reasoning caps, retry budgets, spend forecasting |
| Margin protection | `margin-protection.ts` | Full: 11 anomaly types, 11 mitigation actions, auto-mitigation selection |
| Context compression | `context-compression.ts` | Full: 8 compression methods, cache integration, deep reasoning escalation |
| Plan entitlements | `plan-entitlements.ts` (596 lines) | Full: 5 plan tiers, 9 upsell add-ons, fair use engine, enterprise custom economics |
| Mission cost tracker | `mission-cost-tracker.ts` | Full: per-mission cost records, invocation tracking, cost analysis |

### Service Layer — COMPLETE
| Service | Location | Status |
|---|---|---|
| Provider registry | `src/lib/services/ai-gateway/provider-registry.service.ts` | Full: Supabase-backed CRUD for `ai_provider_registry`, `ai_model_registry`, `ai_provider_health` |
| Routing service | `routing.service.ts` | Full: routing policies + capability routing queries |
| Budget service | `budget.service.ts` | Full: budget policies, usage ledger, cost ledger, portfolio allocations, budget summary |
| Receipts service | `receipts.service.ts` | Full: inference receipts, receipt records, fallback events |
| Launch honesty | `launch-honesty.service.ts` | Full: capability launch status |
| Diagnostics | `diagnostics.service.ts` | Full: degraded state diagnostics |
| Inference gateway | `inference-gateway.ts` | Full: multi-provider abstraction routing through edge function, cache, persistence |
| SAG data hooks | `use-sag-data.ts` | Full: 15 hooks for all SAG tables |

### SAG Types — COMPLETE
`src/lib/sovereign-ai-gateway/types.ts`: 6 providers, 8 model classes, 14 task classes, 5 cost tiers, 5 latency tiers, 5 verification policies, 7 allocation classes, 8 violation types, 5 fallback strategies, task-to-model mapping, cost-per-model mapping.

### Admin UI Pages — COMPLETE (21 pages across 2 families)
**AIG family (9 pages, all routed):**
AIG01 Provider Registry, AIG02 Model Registry, AIG03 Routing Matrix, AIG04 Budget Center, AIG05 Receipts Explorer, AIG06 Launch Truth, AIG07 Launch Truth Detail, AIG08 Degraded Diagnostics, AIG09 Runtime Verification

**SAG family (12 pages, all routed):**
SAG01 Overview, SAG02 Model Registry, SAG03 Routing Policy, SAG04 Provider Health, SAG05 Prompt Registry, SAG06 Economics Board, SAG07 Cost-Confidence Lab, SAG08 Multi-Stage Explorer, SAG09 Receipt Explorer, SAG10 Fallback Center, SAG11 Builder Console, SAG12 Compliance Gate

### Database Tables — COMPLETE
`ai_provider_registry`, `ai_model_registry`, `ai_provider_health`, `ai_capability_routing`, `ai_routing_policies`, `ai_budget_policies`, `ai_budget_alerts`, `ai_usage_ledger`, `ai_inference_receipts`, `ai_receipt_records`, `ai_fallback_events`, `ai_launch_honesty`, `ai_portfolio_allocations`, `ai_cost_ledger`, `ai_token_usage`, `ai_task_requests`, `ai_prompt_families`, `ai_compliance_violations`, `ai_efficiency_scores`, `ai_self_healing_rules`

## What's MISSING (Gaps to Close)

### 1. SAG Sub-Navigation Bar
No `SAGSubNav.tsx` exists. All 12 SAG pages lack inter-page navigation (unlike CPS/FIP pages which have sub-navs).

### 2. SAG Command Palette Entries
Zero SAG entries in `AdminCommandPalette.tsx`. The 12 SAG pages are not discoverable via keyboard shortcut.

### 3. AIG Sub-Navigation Bar
The 9 AIG pages also lack a sub-nav component.

### 4. AIG Command Palette Entries
Need to verify and add AIG entries to command palette if missing.

### 5. Duplicate AIG/SAG Surface Overlap
AIG01–AIG09 and SAG01–SAG12 cover overlapping concerns (both have model registries, receipts, routing). The AIG pages query `src/lib/services/ai-gateway/` while SAG pages query via `use-sag-data.ts`. Both hit the same underlying DB tables. This needs consolidation or clear delineation.

### 6. Memory Rule for AI Gateway
No `mem://constraints/sovereign-ai-gateway` memory rule exists to enforce that all AI usage goes through the gateway.

## Plan

### Step 1: Create SAG Sub-Navigation Component
Create `src/components/admin/SAGSubNav.tsx` (same pattern as `CPSSubNav.tsx` and `FIPSubNav.tsx`) linking all 12 SAG pages.

### Step 2: Inject SAGSubNav into All 12 SAG Pages
Add the sub-nav import and render to each page in `src/pages/admin/sag/`.

### Step 3: Add SAG + AIG Command Palette Entries
Add ~21 entries to `AdminCommandPalette.tsx` covering all SAG and AIG pages under a "Sovereign AI Gateway" group.

### Step 4: Save Gateway Memory Rule
Create `mem://constraints/sovereign-ai-gateway` with the core rules:
- No direct provider SDK calls from feature code
- All AI usage through `invokeAICapability` / `ai-gateway` edge function
- Capability ID + prompt family required
- Budget/policy check before every invocation
- Receipt/trace mandatory for meaningful actions

Update `mem://index.md` with core rule and memory reference.

### Technical Details
- SAGSubNav: ~60 lines, 12 navigation links
- 12 SAG page edits: ~3 lines each (import + render)
- Command palette: ~30 lines for 21 entries
- Memory files: ~25 lines total
- **No new pages, services, edge functions, or database tables needed**
- Everything is already fully built and wired — this closes discoverability and governance enforcement gaps only
