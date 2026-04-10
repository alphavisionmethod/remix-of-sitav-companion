

# SITA OS — Runtime Truth Activation: Master Implementation Plan

## Current State Assessment

### What's Already Real and Working
| System | Status |
|--------|--------|
| AI Gateway edge function | 465 lines, LOVABLE_API_KEY, auth, budget check, routing, receipt logging, fallback chains |
| Chat-Advisor edge function | 460 lines, streaming SSE, 8 advisor personalities, auth, correlation IDs |
| AI Capability Client | Canonical `invokeAICapability()`, budget gate, response normalization |
| AI State Types | 17 canonical states, launch honesty levels, surface categories |
| EventBus | Durable — persists to `os_event_log` via `event-bus-persistence` |
| MemoryService | Durable — persists to `os_memory_scoped` via `memory-service-persistence` |
| ReceiptService | Hash-chained, persistence adapter wired |
| OS Kernel (SitaOSContext) | 15 services instantiated, cross-wired, persisted via `universal-service-persistence` |
| RuntimeTruthProbe | Mounted in sidebar, checks OS hydration + gateway + CAI tables |
| DemoGovernanceBanner | Mounted in ShellLayout |
| DataModeContext | localStorage toggle, demo/live modes |
| Streaming Chat | Real SSE hook calling `chat-advisor` edge function with auth |

### Critical Gaps Found (8 items)

**Gap 1 — Boardroom uses raw mock imports unconditionally**
`Boardroom.tsx` line 33 imports `mockAdvisors, mockRecommendations, mockSynthesis, mockApprovals, mockProofHistory` and uses them directly in all sub-components — no `isDemoMode` guard. These mocks render as "live intelligence" regardless of mode.

**Gap 2 — AdvisorWorkspace uses raw mock imports unconditionally**
`AdvisorWorkspace.tsx` line 27 imports the same 7 mock arrays and uses them directly for advisor cards, recommendation panels, synthesis views, approval pipelines. No mode gating. The streaming chat is real, but everything around it is always mock.

**Gap 3 — RevenueCallingPage uses raw mock imports in launch path**
`RevenueCallingPage.tsx` line 26 imports `MOCK_CONTACTS, MOCK_CALL_LOGS, MOCK_CALL_SCRIPTS` and uses them alongside live query hooks — but the mock data is the unconditional fallback with no mode label.

**Gap 4 — ~15 investment-office sub-pages import demo-data unconditionally**
All investment sub-pages import from `@/lib/demo-data/investment` and gate on `isDemoMode` — but in live mode they show empty states without clear "no data yet" messaging.

**Gap 5 — DataModeContext live connector refresh is a stub**
`refreshConnectors` in live mode sets all connectors to "disconnected" — it never queries real `connector_configs` from Supabase.

**Gap 6 — AI gateway has no ping/health endpoint**
`RuntimeTruthProbe` sends `{ ping: true }` to `ai-gateway` but the gateway tries to process it as a full AI request (requires messages), making the health check unreliable.

**Gap 7 — No degraded-state UI component for AI surfaces**
When AI returns `degraded_*` or `unavailable_*` states, there's no reusable component to display this elegantly. Each surface handles it ad-hoc or not at all.

**Gap 8 — RevenueGate uses demo data even in live mode**
`RevenueGate.tsx` line 32-34: `isDemoMode ? DEMO_METRICS : DEMO_METRICS` — identical in both branches. Silent mock contamination.

## Implementation Plan

### Workstream A — AI Runtime Truth (Priority 1)

**A1. Add ping handler to AI gateway**
File: `supabase/functions/ai-gateway/index.ts`
- After parsing `body`, check `if (body.ping)` → return `{ status: "ok", timestamp }` with 200
- Costs zero tokens, validates auth + key presence + function reachability

**A2. Create reusable `AIDegradedState` component**
New file: `src/components/sita/AIDegradedState.tsx`
- Accepts `state: AIState`, `reason?: string`, `onRetry?: () => void`
- Renders elegant, branded degraded messaging using `STATE_LABELS` from `ai-state-types`
- Covers: provider unavailable, budget limited, config missing, rate limited, payment required, unavailable
- Premium feel: icon, explanation, next-step CTA where relevant

**A3. Wire AIDegradedState into AdvisorChat**
File: `src/components/sita/AdvisorChat.tsx`
- When streaming chat returns error states (402, 429, 503), render `AIDegradedState` instead of raw error text

### Workstream B — Flagship Mock Elimination (Priority 2)

**B1. Gate Boardroom mock data behind isDemoMode**
File: `src/pages/Boardroom.tsx`
- Wrap all mock usage in `isDemoMode` checks
- In live mode, replace `mockAdvisors` with empty arrays and show "Connect advisors to see live intelligence" empty states
- The boardroom packet data (from `useBoardroomData`) is already real — only the advisor/recommendation overlays are mock

**B2. Gate AdvisorWorkspace mock data behind isDemoMode**
File: `src/pages/advisors/AdvisorWorkspace.tsx`
- Gate `mockAdvisors`, `mockRecommendations`, `mockSimulations`, `mockApprovals`, `mockProofHistory`, `mockMemoryItems`, `mockSynthesis` behind `isDemoMode`
- In live mode, the real streaming chat panel already works — but the surrounding advisor council, synthesis, and proof panels should show honest empty states
- Keep chat panel functional in both modes

**B3. Gate RevenueCallingPage mock data**
File: `src/pages/RevenueCallingPage.tsx`
- Already has `useCallingContacts` and `useCallLogs` live hooks
- Gate `MOCK_CONTACTS`, `MOCK_CALL_LOGS`, `MOCK_SCRIPTS` behind `isDemoMode`
- In live mode, use the live query results with empty state fallback

**B4. Fix RevenueGate silent demo contamination**
File: `src/pages/revenue-office/RevenueGate.tsx`
- Replace `isDemoMode ? DEMO_METRICS : DEMO_METRICS` with proper gating
- In live mode, query real metrics or show empty state

### Workstream C — DataMode Live Connector Reality (Priority 3)

**C1. Wire live connector status from Supabase**
File: `src/contexts/DataModeContext.tsx`
- In `refreshConnectors`, when mode is "live", query `connector_configs` table from Supabase
- Map results to `ConnectorStatus[]` shape
- If no connectors configured, show empty array (not fake disconnected ones)

### Workstream D — Degraded State Standardization (Priority 4)

**D1. Create canonical degraded state classes**
New file: `src/lib/degraded-state-classes.ts`
- Define `DegradedStateClass` union type: `"unavailable" | "demo" | "internal_only" | "not_configured" | "provider_missing" | "rate_limited" | "setup_required" | "partial" | "stale" | "coming_soon"`
- Export `getDegradedLabel(cls)` and `getDegradedDescription(cls)` helpers
- Export `getDegradedNextAction(cls)` for user guidance

**D2. Create `DegradedStateBanner` component**
New file: `src/components/sita/DegradedStateBanner.tsx`
- Reusable inline banner for any surface to declare its truth state
- Accepts `stateClass`, optional `surfaceName`, optional `onAction`
- Premium, calm design — not alarming, just honest

### Workstream E — Empty State Honesty for Live Mode (Priority 5)

**E1. Enhance EmptyStateCTA for mode-aware messaging**
File: `src/components/sita/EmptyStateCTA.tsx` (if exists, otherwise create)
- Accept optional `mode: "demo" | "live"` prop
- In live mode: "No data yet — this surface activates when real data flows in"
- In demo mode: "Switch to demo mode to see sample data"

### Files Modified (8)
| File | Change |
|------|--------|
| `supabase/functions/ai-gateway/index.ts` | Add ping health check handler |
| `src/pages/Boardroom.tsx` | Gate mock data behind isDemoMode |
| `src/pages/advisors/AdvisorWorkspace.tsx` | Gate mock data behind isDemoMode |
| `src/pages/RevenueCallingPage.tsx` | Gate mock data behind isDemoMode |
| `src/pages/revenue-office/RevenueGate.tsx` | Fix silent demo contamination |
| `src/contexts/DataModeContext.tsx` | Wire live connector query from Supabase |
| `src/components/sita/AdvisorChat.tsx` | Wire AIDegradedState for error states |
| `src/components/sita/EmptyStateCTA.tsx` | Add mode-aware messaging |

### Files Created (3)
| File | Purpose |
|------|---------|
| `src/components/sita/AIDegradedState.tsx` | Reusable AI degraded state display |
| `src/lib/degraded-state-classes.ts` | Canonical degraded state taxonomy |
| `src/components/sita/DegradedStateBanner.tsx` | Generic degraded state banner |

### What This Achieves
- AI gateway becomes health-checkable — RuntimeTruthProbe gets reliable results
- Boardroom and AdvisorWorkspace stop presenting mock intelligence as real in live mode
- Revenue surfaces stop silent mock contamination
- AI degraded states become elegant and honest across all surfaces
- Live mode shows honest empty states instead of fake data
- Degraded state taxonomy becomes reusable across the entire platform
- Zero new services, domains, or edge functions (one ping handler addition)

### What This Does NOT Do
- Does not add new connectors or integrations
- Does not expand device/mobile architecture
- Does not add new admin pages
- Does not change the AI gateway's core routing logic
- Focuses purely on truth, honesty, and mock elimination

