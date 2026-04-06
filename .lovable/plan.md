

# Android Ecosystem + Health/Signal Intelligence → 100% Advanced

## Current Reality

### Android Ecosystem (AND01)
**Stale finding** — already DB-connected with 7 hooks, seed button, loading/empty states. BUT missing two tabs that Apple has:
- No Wearable Configs tab (hook `useEcosystemWearableConfigs("android")` exists but isn't wired)
- No Push Routes tab (hook `useEcosystemPushRoutes("android")` exists but isn't wired)
- No Continuity Events tab

### Health/Signal Intelligence (HRS01–HRS06)
**Truly contracts-only** — all 6 pages use hardcoded inline arrays with zero DB queries:
- `HRS01HealthConsentCenter` — hardcoded `CONSENT_CATEGORIES`, no DB consent read/write
- `HRS02SignalSourcesBoard` — hardcoded `PROVIDERS` array, no `wearable_providers` query
- `HRS03ReadinessExplanation` — hardcoded readiness rules, no `readiness_states` query
- `HRS05AssistantTimingBoard` — hardcoded timing rules, no DB
- `HRS06SignalLaunchHonesty` — hardcoded `SUBSYSTEMS`, no `ecosystem_launch_readiness` query

**Existing DB tables** (already in Supabase, unused by HRS pages): `wearable_providers`, `wearable_signals`, `health_signal_consents`, `readiness_states`

---

## Fix 1: Android Ecosystem — Add Missing Tabs

Add 3 tabs to `AND01AndroidEcosystemCenter.tsx` matching Apple's pattern:

1. **Wearable Configs tab** — render `useEcosystemWearableConfigs("android")` data (device → config cards)
2. **Push Routes tab** — render `useEcosystemPushRoutes("android")` data (routing priority table)
3. **Continuity Events tab** — render `useEcosystemContinuityEvents("android")` data (event timeline)

All hooks already exist and are imported. Just needs UI tabs.

## Fix 2: Create Health Signal Data Service

New file: `src/lib/data-services/health-signal-data-service.ts`

Functions:
- `fetchWearableProviders()` — queries `wearable_providers` with demo fallback
- `fetchHealthSignalConsents()` — queries `health_signal_consents` with demo fallback
- `fetchWearableSignals(limit)` — queries `wearable_signals` with demo fallback
- `fetchReadinessStates(limit)` — queries `readiness_states` with demo fallback
- `fetchSignalSubsystemReadiness()` — queries `ecosystem_launch_readiness` where target LIKE `hrs_%` with demo fallback

Each returns real Supabase data in real mode, demo arrays in demo mode.

## Fix 3: Create Health Signal Hooks

New file: `src/hooks/use-health-signal-data.ts`

React Query hooks wrapping each data service function:
- `useWearableProviders()`
- `useHealthSignalConsents()`
- `useWearableSignals(limit?)`
- `useReadinessStates(limit?)`
- `useSignalSubsystemReadiness()`

## Fix 4: Extract Demo Data

New file: `src/lib/demo-data/health-signals.ts`

Move all inline arrays from HRS pages:
- `DEMO_CONSENT_CATEGORIES` (from HRS01)
- `DEMO_SIGNAL_PROVIDERS` (from HRS02)
- `DEMO_READINESS_FACTORS` (from HRS03)
- `DEMO_TIMING_RULES` (from HRS05)
- `DEMO_SIGNAL_SUBSYSTEMS` (from HRS06)
- `DEMO_REVOCATION_ACTIONS` (from HRS01)

## Fix 5: Wire HRS Pages to Hooks

### HRS01HealthConsentCenter
- Import `useHealthSignalConsents()` hook
- Query real consent records from DB
- Keep `CONSENT_CATEGORIES` as display config (it's a UI schema, not data)
- Add toggle that writes to `health_signal_consents` table
- Add loading/empty states

### HRS02SignalSourcesBoard
- Import `useWearableProviders()` hook
- Replace hardcoded `PROVIDERS` with DB data, fallback to demo
- Show real provider connection status
- Add loading/empty states

### HRS03ReadinessExplanation
- Import `useReadinessStates()` hook
- Show real readiness derivation records alongside explanation
- Keep explanatory text as static content

### HRS05AssistantTimingBoard
- Import `useReadinessStates()` for real timing data display
- Keep timing rules as reference documentation
- Add real-data panel showing latest readiness → timing decisions

### HRS06SignalLaunchHonesty
- Import `useSignalSubsystemReadiness()` hook
- Replace hardcoded `SUBSYSTEMS` with DB `ecosystem_launch_readiness` records where target starts with `hrs_`
- Add seed button using `useSeedEcosystemData()` for health subsystem initialization
- Add loading/empty states

---

## Implementation Order

1. Extract demo data to `src/lib/demo-data/health-signals.ts`
2. Create `src/lib/data-services/health-signal-data-service.ts`
3. Create `src/hooks/use-health-signal-data.ts`
4. Add 3 missing tabs to AND01
5. Wire HRS01–HRS06 to hooks (5 pages)
6. Build verification

## Files Changed

| File | Action |
|---|---|
| `src/lib/demo-data/health-signals.ts` | New — extracted demo arrays |
| `src/lib/data-services/health-signal-data-service.ts` | New — mode-aware DB service |
| `src/hooks/use-health-signal-data.ts` | New — React Query hooks |
| `src/pages/admin/AND01AndroidEcosystemCenter.tsx` | Add 3 tabs (wearable, push, continuity) |
| `src/pages/admin/HRS01HealthConsentCenter.tsx` | Wire to DB hooks |
| `src/pages/admin/HRS02SignalSourcesBoard.tsx` | Wire to DB hooks |
| `src/pages/admin/HRS03ReadinessExplanation.tsx` | Wire to DB hooks |
| `src/pages/admin/HRS05AssistantTimingBoard.tsx` | Wire to DB hooks |
| `src/pages/admin/HRS06SignalLaunchHonesty.tsx` | Wire to DB hooks + seed button |

