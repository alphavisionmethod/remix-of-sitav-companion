

# SITA OS — Deployment Readiness Audit & Activation Plan

## Current Reality (Evidence-Based)

| Metric | Value | Assessment |
|--------|-------|------------|
| Total pages | 779 | Massive surface area |
| Admin pages | 241 | Governance heavy |
| User-facing pages | 88 | Core experience |
| Pages with real DB data | 190 (24%) | **76% of pages run on demo/static data** |
| User pages with real data | ~30 of 88 | **66% of user pages are demo-only** |
| OS hooks consumed outside admin | **0** | The 15 OS services are invisible to users |
| Services with Supabase calls | 149 | Good backend wiring |
| Edge functions | 53 | Strong server layer |
| TypeScript errors | 0 | Clean build |
| Auth | Real Supabase + demo mode | Working |
| Flagship pages (Boardroom, Dashboard, ConciergeCenter, BusinessCenter) | 0 real data calls | **All demo-backed** |

## The Core Problem

SITA has 779 pages, 435 services, 53 edge functions, 15 OS orchestration services, 23 CAI DB tables, and 15 admin consoles. But:

1. **Zero user-facing pages consume the OS orchestration layer** — `useSitaOS()`, `useOSOrchestration()`, `useAdaptiveInterface()`, `useExperienceSignature()` are only used by the 15 CAI admin pages
2. **Flagship pages are demo-only** — Boardroom, Dashboard, ConciergeCenter, BusinessCenter have zero real data calls
3. **The "ambient OS" is invisible to users** — no attention routing, no timing intelligence, no experience signature affects what users actually see

## What Needs to Happen (5 Phases)

### Phase 1 — Wire OS Layer Into Flagship Pages (~8 files)

Connect the OS orchestration hooks to the pages users actually see:

- **DailyPulse** — wire `useOSOrchestration().dailyPulse()` to generate real digest content from the DigestEngine's 7 registered providers
- **Boardroom** — wire `useOSOrchestration().getAttentionStack()` + experience signature for tone
- **PersonalBrain** — wire `useOSOrchestration().processIntent()` so the AI assistant flows through the intent orchestrator
- **NotificationCenter** — wire `useAdaptiveInterface()` to adapt density based on cognitive load
- **ConciergeCenter** — wire `useExperienceSignature()` for tone/style
- **ConnectorHub** — already has real data, add mode-awareness from `useSitaOS().sitaModes`
- **TasksWorkflowsCenter** — wire attention priority from AttentionOS
- **SettingsPage** — add operating mode selector from `useSitaOS().sitaModes`

### Phase 2 — Activate Flagship Pages With Real Data (~6 files)

Convert key demo-only pages to pull from Supabase:

- **Boardroom** — query `digest_compilations`, `opportunity_signals`, `priority_stacks` tables
- **BusinessCenter** — query real business entities from entity graph tables
- **ConciergeCenter** — query `relationship_contexts`, `human_obligations` for real recommendations
- **Dashboard/Home route** — create or wire a real dashboard that shows live attention stack + current mode + digest summary

### Phase 3 — Experience Signature Activation (~3 files)

Make the experience signature actually affect UI globally:

- Wire `useAdaptiveInterface` CSS variables into the root layout (they're computed but never applied to non-admin pages)
- Wire `useExperienceSignature` into the assistant/chat UI for tone control
- Apply operating mode effects to notification routing (already modeled, just not connected)

### Phase 4 — Launch Honesty Cleanup (~2 files)

- Update `generated/production-truth-dashboard.md` to reflect actual service health percentages
- Add a runtime truth check that flags pages still using `__DEMO_SOURCE__` when `?mode=real` is active

### Phase 5 — Build Verification

- Run `npx tsc --noEmit` to confirm zero errors
- Verify all new imports resolve correctly
- Confirm no circular dependencies between OS context and pages

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/DailyPulse.tsx` | Wire `useOSOrchestration().dailyPulse()` |
| `src/pages/Boardroom.tsx` | Wire attention stack + digest data from DB |
| `src/pages/PersonalBrain.tsx` | Route queries through intent orchestrator |
| `src/pages/NotificationCenter.tsx` | Add adaptive interface density |
| `src/pages/ConciergeCenter.tsx` | Wire relationship contexts + experience signature |
| `src/pages/TasksWorkflowsCenter.tsx` | Wire attention priority sorting |
| `src/pages/SettingsPage.tsx` | Add operating modes selector |
| `src/components/sita/AppSidebar.tsx` | Show current mode badge + cognitive load indicator |

## Files to Create

None — this is pure wiring of existing systems into existing pages.

## Architecture Rules Maintained

- No new domains, services, or edge functions
- No duplication — only connecting what exists
- All changes use existing hooks and services
- No new admin pages — focus is user-facing activation

## What This Achieves

After this phase, the 15 OS services will be **visibly active** in the pages users see every day. The system will actually feel like an ambient OS rather than a collection of admin dashboards inspecting dormant services.

