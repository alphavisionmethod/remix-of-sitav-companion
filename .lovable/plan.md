

# SITA OS — Runtime Truth Activation & Enhancement Plan

## Audit Findings

### What's Built and Working
1. **15 OS Services** — All instantiated, cross-wired, and persisted via `universal-service-persistence.ts` to `os_service_state` table
2. **23 CAI DB Tables** — Full CRUD via `cai-data-service.ts`, persistence bridge wired in `SitaOSContext`
3. **AI Gateway** — 465-line edge function with auth, budget checking, model routing, fallback chains, receipt logging, streaming support
4. **AI Capability Client** — Canonical `invokeAICapability()` routes all AI through `ai-gateway` edge function
5. **OS Hooks** — `useOSOrchestration`, `useAdaptiveInterface`, `useExperienceSignature` consumed by 8 flagship pages + 15 admin pages
6. **ShellLayout** — Globally applies adaptive CSS variables
7. **Cross-Wiring** — 3 intent middlewares (timing gate, boundary check, attention feed), 7 digest providers, proactive chief-of-staff checks

### Gaps Found (5 issues)

**Gap 1 — `useOSOrchestration` userId is hardcoded placeholder**
Line 51: `const userId = "current-user"` — never reads from `useAuth()`. This means all digest generation, intent processing, and trust evaluations pass a fake user ID to the services.

**Gap 2 — Flagship pages don't query CAI tables for real historical data**
Boardroom, DailyPulse, ConciergeCenter only consume in-memory OS state. They never query `digest_compilations`, `opportunity_signals`, `priority_stacks`, or `relationship_contexts` from Supabase. The CAI React Query hooks (`useCAIData.ts`) exist but are only used by 2 admin pages (CAI02, CAI13).

**Gap 3 — DailyPulse generates `osPulseDigest` state but never calls `os.dailyPulse()`**
Line 148 creates `osPulseDigest` state variable but there's no `useEffect` that actually triggers `os.dailyPulse()` to populate it from the 7 registered digest providers.

**Gap 4 — Boardroom doesn't persist digest compilations when generating briefings**
When a user views the morning briefing, the generated content is never persisted to `digest_compilations` via `persistDigestCompilation()`.

**Gap 5 — Mode changes in SettingsPage don't persist to CAI table**
`os.setMode()` updates in-memory state and persists via `os_service_state`, but doesn't call `persistOperatingMode()` to log to the dedicated `operating_modes` CAI table for audit trail.

## Fix Plan

### Fix 1 — Wire real user ID into `useOSOrchestration`
**File:** `src/hooks/useOSOrchestration.ts`
- Import `useAuth` from `@/contexts/AuthContext`
- Replace `const userId = "current-user"` with `const { user } = useAuth(); const userId = user?.id ?? "anonymous";`

### Fix 2 — Wire CAI data queries into Boardroom
**File:** `src/pages/Boardroom.tsx`
- Import `useOpportunitySignals`, `usePriorityStacks`, `useDigestCompilations` from `useCAIData`
- Display real persisted opportunity signals in the Opportunities tab
- Display real persisted priority snapshots in the Morning Briefing
- Persist digest compilations when briefings are generated

### Fix 3 — Activate DailyPulse digest generation
**File:** `src/pages/DailyPulse.tsx`
- Add `useEffect` that calls `os.dailyPulse(user?.display_name)` when `os.hydrated` becomes true
- Store result in `osPulseDigest` state
- Render the digest sections (priorities, opportunities, relationships, mode context) in the pulse UI
- Persist the generated digest via `persistDigestCompilation()`

### Fix 4 — Wire ConciergeCenter to relationship CAI data
**File:** `src/pages/ConciergeCenter.tsx`
- Import `useRelationshipContexts`, `useHumanObligations` from `useCAIData`
- Display real relationship contexts and overdue obligations

### Fix 5 — Persist mode changes from SettingsPage
**File:** `src/pages/SettingsPage.tsx`
- Import `persistOperatingMode` from `cai-persistence-bridge`
- After `os.setMode(mode)`, call `persistOperatingMode({ mode_key: mode, active: true, metadata: { source: "settings" } })`

### Files Modified (5)
| File | Change |
|------|--------|
| `src/hooks/useOSOrchestration.ts` | Replace placeholder userId with real auth user ID |
| `src/pages/DailyPulse.tsx` | Trigger `os.dailyPulse()`, render digest sections, persist |
| `src/pages/Boardroom.tsx` | Query CAI tables for real data, persist briefing digests |
| `src/pages/ConciergeCenter.tsx` | Query relationship_contexts + human_obligations |
| `src/pages/SettingsPage.tsx` | Persist mode changes to operating_modes table |

### What This Achieves
- Real user ID flows through the entire OS orchestration layer
- Flagship pages display real persisted CAI data alongside live in-memory state
- Daily Pulse actually generates digests from the 7 registered providers
- Mode changes create audit trail records
- Zero new files, services, or domains — pure wiring of existing systems

