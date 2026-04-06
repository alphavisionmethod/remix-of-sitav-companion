
# SITA OS — Five-Prompt Ecosystem Expansion Plan

## What Already Exists

| Layer | Status |
|-------|--------|
| 21 UAO DB tables (device_families, connected_devices, presence_states, etc.) | Done |
| Device family + wearable adapter contracts (TypeScript) | Done |
| Surface strategy matrix + 7-phase roadmap | Done |
| 8 UAO admin pages + 7 DWE admin pages | Done |
| Watch surface adapter, ring signal connector contracts | Done |
| Provider families DB table (empty, no seed data) | Schema exists |
| Wearable providers DB table (empty) | Schema exists |

## What This Plan Adds (Gaps from 5 Prompts)

### 1. Contract Files (TypeScript — no DB changes)

**A. `src/packages/contracts/msa/apple-ecosystem-contract.ts`**
- `AppleProviderRecord` — apple_identity, apple_mobile_shell, apple_watch_surface, apple_health_readiness, apple_push_channel, apple_device_trust
- `AppleIdentityLinkRecord` — Sign in with Apple linkage to unified identity graph
- `AppleDeviceRecord` — iPhone/iPad/Watch with trust escalation model
- `AppleWatchCapabilityRecord` — complication, glance, haptic, quick-action constraints
- `ApplePushRouteRecord` — iPhone push vs Watch push routing
- `AppleTrustRecord` — biometric, device-bound approval, risk-tier escalation
- `AppleHealthConsentRecord` — HealthKit signal types, privacy tiers
- `AppleReadinessIntegrationRecord` — future HealthKit integration state
- `AppleLaunchReadinessRecord` — per-surface (iPhone/iPad/Watch/SignIn/Health) launch honesty
- `AppleMobileSurfaceAdapter` — navigation/task/approval/notification/assistant/boardroom grammars
- `AppleWatchSurfaceAdapter` — extends existing WatchSurfaceAdapter with Apple-specific continuity/handoff

**B. `src/packages/contracts/msa/android-ecosystem-contract.ts`**
- `AndroidProviderRecord` — android_mobile_shell, wearos_surface, android_push_channel, android_device_trust, android_health_readiness
- `AndroidDeviceRecord` — phone/tablet with trust model
- `WearOSCapabilityRecord` — tiles, complications, micro-actions
- `AndroidPushRouteRecord` — FCM routing, DND-aware
- `AndroidTrustRecord` — biometric, device-bound, risk escalation
- `AndroidHealthConsentRecord` — Health Connect signal governance
- `AndroidLaunchReadinessRecord` — per-surface launch honesty
- `AndroidMobileSurfaceAdapter` — grammars mirroring Apple but Android-native

**C. `src/packages/contracts/msa/health-signal-intelligence-contract.ts`**
- `SignalProviderRecord` — apple_health, health_connect, fitbit, garmin, oura, whoop, manual, device_focus
- `RawSignalRecord` — pre-normalization signal
- `NormalizedSignalRecord` — canonical form
- `InterruptionPostureRecord` — derived from readiness
- `SignalInfluenceRecord` — how signal affects routing
- `VisibilityPolicyRecord` — raw/derived/user-only/assistant/boardroom/none
- `SyntheticSignalScenarioRecord` — demo wearable scenarios
- `SignalLaunchReadinessRecord`

**D. `src/packages/contracts/msa/notification-calm-assistant-contract.ts`**
- `AttentionRouteRecord` — full routing decision record
- `NotificationGrammarRecord` — urgency classes, tone, quick-action affordances
- `FatigueProfileRecord` — recent interruptions, ignored, overload risk
- `DeliveryDecisionRecord` — queue vs interrupt vs digest
- `InterruptionHistoryRecord`
- `QueueItemRecord` — silent queue, daily digest, boardroom escalation
- `AssistantRoleRecord` — chief of staff, operator, strategist, money sentinel, etc.
- `AssistantLaunchReadinessRecord`

**E. `src/packages/contracts/msa/native-shell-strategy-contract.ts`**
- `NativeShellRecord` — iPhone/Android/tablet shell with launch stage
- `CapabilitySurfaceFitRecord` — per-capability: mobile_primary / mobile_supported / desktop_primary / wearable_micro / not_mobile
- `MobileActionClassRecord` — push-open, camera capture, swipe, offline
- `DeviceSecureActionRecord` — trusted device + biometric action model
- `NativeContinuityRecord` — web→app, watch→app, app→desktop handoff
- `PushRouteBindingRecord` — calm router → iPhone/Android push mapping
- `MobileLaunchReadinessRecord`

### 2. Edge Function Enhancement

Update `ambient-os-operations` with new seed actions:
- `seed_apple_ecosystem` — Apple provider family + capabilities + launch readiness entries
- `seed_android_ecosystem` — Android provider family + capabilities + launch readiness entries
- `seed_signal_providers` — 8 signal provider records
- `seed_notification_grammar` — urgency classes and routing defaults
- `seed_native_shells` — iPhone + Android shell records with capability fit matrix

All seeds insert into existing UAO/PFA tables (provider_families, provider_capabilities, ambient_launch_readiness, wearable_providers). No new tables needed.

### 3. Admin Pages (27 new pages)

**Prompt A — Apple Ecosystem (6 pages)**
- `APL01AppleEcosystemCenter.tsx` → `/admin/apl/ecosystem`
- `APL02AppleDevicesTrustBoard.tsx` → `/admin/apl/devices-trust`
- `APL03AppleWatchExperience.tsx` → `/admin/apl/watch`
- `APL04AppleIdentityAccounts.tsx` → `/admin/apl/identity`
- `APL05AppleHealthConsent.tsx` → `/admin/apl/health`
- `APL06AppleLaunchReadiness.tsx` → `/admin/apl/launch`

**Prompt B — Android Ecosystem (5 pages)**
- `AND01AndroidEcosystemCenter.tsx` → `/admin/and/ecosystem`
- `AND02WearOSExperience.tsx` → `/admin/and/wearos`
- `AND03AndroidTrustApprovals.tsx` → `/admin/and/trust`
- `AND04AndroidHealthConsent.tsx` → `/admin/and/health`
- `AND05AndroidLaunchReadiness.tsx` → `/admin/and/launch`

**Prompt C — Health / Signal Intelligence (6 pages)**
- `HRS01HealthConsentCenter.tsx` → `/admin/hrs/consent`
- `HRS02SignalSourcesBoard.tsx` → `/admin/hrs/sources`
- `HRS03ReadinessExplanation.tsx` → `/admin/hrs/readiness`
- `HRS04NotificationInfluence.tsx` → `/admin/hrs/influence`
- `HRS05AssistantTimingLogic.tsx` → `/admin/hrs/timing`
- `HRS06SignalLaunchHonesty.tsx` → `/admin/hrs/launch`

**Prompt D — Notification / Calm Assistant (6 pages)**
- `NRC01NotificationRoutingStudio.tsx` → `/admin/nrc/routing`
- `NRC02AssistantCalmnessCenter.tsx` → `/admin/nrc/calmness`
- `NRC03FatigueInterruptionBoard.tsx` → `/admin/nrc/fatigue`
- `NRC04QueueInterruptMatrix.tsx` → `/admin/nrc/queue`
- `NRC05CrossDeviceDelivery.tsx` → `/admin/nrc/delivery`
- `NRC06AttentionLaunchHonesty.tsx` → `/admin/nrc/launch`

**Prompt E — Native Shell Strategy (4 pages combining related surfaces)**
- `NSS01NativeShellStrategyBoard.tsx` → `/admin/nss/strategy`
- `NSS02MobileCapabilityMatrix.tsx` → `/admin/nss/capabilities`
- `NSS03NativeTrustContinuity.tsx` → `/admin/nss/trust`
- `NSS04MobileLaunchHonesty.tsx` → `/admin/nss/launch`

### 4. Barrel Export + Route Wiring

- Update `src/packages/contracts/msa/index.ts` to export all 5 new contract files
- Add 27 lazy imports + routes in `src/App.tsx`

### 5. No New Database Tables

All 5 prompts' data models map to existing UAO/PFA tables. The TypeScript contracts define the shapes; the DB stores them as JSONB or typed columns in existing tables like `provider_families`, `provider_capabilities`, `ambient_launch_readiness`, `connected_devices`, `device_trust_records`, etc.

## Implementation Order

1. Create 5 contract files (parallel)
2. Update barrel export
3. Enhance edge function with 5 seed actions
4. Create 27 admin pages (parallel batches)
5. Wire routes in App.tsx
6. TypeScript build verification

## Technical Notes

- All contracts are pure TypeScript types — no runtime cost, full type safety
- Admin pages follow existing pattern: dark theme, card-based, table displays querying Supabase
- Edge function seeds use existing tables, no schema migration needed
- Each ecosystem page queries the relevant subset of provider_families/capabilities/launch_readiness filtered by provider_key prefix
