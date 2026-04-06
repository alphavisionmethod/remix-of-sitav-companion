

# Health/Signal Intel + Notification/Calm + Native Shell → 100/100

## Current State

| Index | Score | What Exists | What's Missing |
|---|---|---|---|
| **Health/Signal Intel** | 90% persisted, 85% DB, 65% hooks | 5 hooks wired (consents, providers, signals, readiness, subsystems), HRS01-06 pages, demo data, DB tables | HRS pages 02-06 mostly use hardcoded demo data, no DB-backed CRUD for visibility policies, interruption posture, or synthetic scenarios |
| **Notification/Calm** | 75% structural, 0% DB, 0% hooks | NRC01-06 pages exist with hardcoded data, contracts defined, DB tables exist (attention_decisions, notification_fatigue_profiles, assistant_role_presences, assistant_role_states, interruption_policies) | Zero data services, zero hooks, zero DB queries — all 6 pages are fully hardcoded |
| **Native Shell Strategy** | 70% structural, 0% DB, 0% hooks | NSS01-04 pages exist with hardcoded data, contracts defined, DB tables exist (capability_surface_bindings) | Zero data services, zero hooks, zero DB queries — all 4 pages are fully hardcoded |

## Plan

### 1. Create Notification/Calm data service + hooks

**New file**: `src/lib/data-services/notification-calm-data-service.ts`
- `fetchAttentionDecisions()` — queries `attention_decisions`
- `fetchFatigueProfiles()` — queries `notification_fatigue_profiles`
- `fetchAssistantRoles()` — queries `assistant_role_presences`
- `fetchAssistantRoleStates()` — queries `assistant_role_states`
- `fetchInterruptionPolicies()` — queries `interruption_policies`
- `fetchDeliveryWaves()` — queries `delivery_waves`
- All mode-aware with demo fallbacks

**New file**: `src/lib/demo-data/notification-calm.ts`
- Demo routing matrix, fatigue signals, suppression actions, overload triggers, channel specs, delivery principles, assistant roles, queue strategies
- Extracted from the hardcoded constants in NRC01-06

**New file**: `src/hooks/use-notification-calm-data.ts`
- `useAttentionDecisions()`
- `useFatigueProfiles()`
- `useAssistantRoles()`
- `useAssistantRoleStates()`
- `useInterruptionPolicies()`
- `useDeliveryWaves()`

### 2. Create Native Shell data service + hooks

**New file**: `src/lib/data-services/native-shell-data-service.ts`
- `fetchCapabilitySurfaceBindings()` — queries `capability_surface_bindings`
- `fetchNativeShellPlatforms()` — returns shell platform data (demo fallback from contracts)
- All mode-aware

**New file**: `src/lib/demo-data/native-shell.ts`
- Demo platform shells, capability matrix, trust continuity flows, mobile action classes
- Extracted from hardcoded constants in NSS01-04

**New file**: `src/hooks/use-native-shell-data.ts`
- `useCapabilitySurfaceBindings()`
- `useNativeShellPlatforms()`
- `useNativeShellLaunchReadiness()`

### 3. Expand Health/Signal Intel data service

Add to existing `health-signal-data-service.ts`:
- `fetchVisibilityPolicies()` — for HRS pages that reference visibility
- `fetchInterruptionPosture()` — readiness → interruption posture mapping

Add to `use-health-signal-data.ts`:
- `useVisibilityPolicies()`
- `useInterruptionPosture()`

### 4. Wire NRC01-06 pages to DB hooks

| Page | Current | After |
|---|---|---|
| NRC01 RoutingStudio | Hardcoded ROUTING_MATRIX, CHANNEL_SPECS | Query `attention_decisions` + demo fallback |
| NRC02 CalmnessCenter | Hardcoded roles + interventions | Query `assistant_role_presences` + `assistant_role_states` |
| NRC03 FatigueBoard | Hardcoded FATIGUE_SIGNALS, SUPPRESSION_ACTIONS | Query `notification_fatigue_profiles` |
| NRC04 QueueInterruptMatrix | Hardcoded queue data | Query `interruption_policies` |
| NRC05 CrossDeviceDelivery | Hardcoded device routing | Query `attention_decisions` + device data |
| NRC06 NotificationLaunchHonesty | Hardcoded SUBSYSTEMS | Query `ecosystem_launch_readiness` like HRS06 |

### 5. Wire NSS01-04 pages to DB hooks

| Page | Current | After |
|---|---|---|
| NSS01 StrategyBoard | Hardcoded PLATFORMS | Query device_families + demo fallback |
| NSS02 CapabilityMatrix | Hardcoded CAPABILITIES | Query `capability_surface_bindings` |
| NSS03 TrustContinuity | Hardcoded flows | Use demo data extracted to module |
| NSS04 MobileLaunchHonesty | Hardcoded TARGETS | Query `ecosystem_launch_readiness` like HRS06 |

### 6. Seed notification + native shell data

Add to `ecosystem-master-seeder.ts`:
- `assistantRoleRows()` — 9 assistant roles (chief_of_staff, operator, strategist, etc.)
- `interruptionPolicyRows()` — 3 default policies (quiet hours, focus mode, sleep)
- `fatigueProfileRows()` — 1 default profile per user
- `capabilitySurfaceBindingRows()` — 13 capability × surface bindings

### 7. Wire HRS04 NotificationInfluence to DB

Currently hardcoded influence rules — wire to readiness states + demo fallback.

## Files Changed

| File | Change |
|---|---|
| `src/lib/demo-data/notification-calm.ts` | **New** — demo data extracted from NRC pages |
| `src/lib/demo-data/native-shell.ts` | **New** — demo data extracted from NSS pages |
| `src/lib/data-services/notification-calm-data-service.ts` | **New** — 6 DB query functions |
| `src/lib/data-services/native-shell-data-service.ts` | **New** — 3 DB query functions |
| `src/hooks/use-notification-calm-data.ts` | **New** — 6 React Query hooks |
| `src/hooks/use-native-shell-data.ts` | **New** — 3 React Query hooks |
| `src/lib/data-services/health-signal-data-service.ts` | Add 2 query functions |
| `src/hooks/use-health-signal-data.ts` | Add 2 hooks |
| `src/lib/seed/ecosystem-master-seeder.ts` | Add seed functions for NRC + NSS tables |
| `src/pages/admin/NRC01RoutingStudio.tsx` | Wire to DB hooks |
| `src/pages/admin/NRC02CalmnessCenter.tsx` | Wire to DB hooks |
| `src/pages/admin/NRC03FatigueBoard.tsx` | Wire to DB hooks |
| `src/pages/admin/NRC04QueueInterruptMatrix.tsx` | Wire to DB hooks |
| `src/pages/admin/NRC05CrossDeviceDelivery.tsx` | Wire to DB hooks |
| `src/pages/admin/NRC06NotificationLaunchHonesty.tsx` | Wire to DB hooks |
| `src/pages/admin/NSS01StrategyBoard.tsx` | Wire to DB hooks |
| `src/pages/admin/NSS02CapabilityMatrix.tsx` | Wire to DB hooks |
| `src/pages/admin/NSS03TrustContinuity.tsx` | Wire to DB hooks |
| `src/pages/admin/NSS04MobileLaunchHonesty.tsx` | Wire to DB hooks |
| `src/pages/admin/HRS04NotificationInfluence.tsx` | Wire to DB hooks |

## No database migration needed
All required tables already exist. This is data services + hooks + seed data + page wiring.

