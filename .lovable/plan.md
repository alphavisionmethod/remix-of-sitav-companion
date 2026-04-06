

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

## What This Plan Adds

### 1. Five New Contract Files (TypeScript types — no DB changes)

**A. `apple-ecosystem-contract.ts`** — Apple provider family, Sign in with Apple identity link, iPhone/iPad/Watch device records, Apple Watch capability model, push routing, trust/biometric escalation, HealthKit consent, Apple continuity/handoff, per-surface launch honesty (iPhone/iPad/Watch/SignIn/Health)

**B. `android-ecosystem-contract.ts`** — Android provider family, phone/tablet device records, Wear OS tiles/complications/micro-actions, FCM push routing, biometric trust, Health Connect consent, per-surface launch honesty

**C. `health-signal-intelligence-contract.ts`** — Signal provider registry (apple_health, health_connect, fitbit, garmin, oura, whoop, manual, device_focus), raw/normalized signals, interruption posture derivation, signal→routing influence rules, visibility policies (raw/derived/user-only/assistant/boardroom), synthetic demo scenarios, signal launch readiness

**D. `notification-calm-assistant-contract.ts`** — Attention route decisions, notification grammar (urgency/tone/affordances), fatigue profiles, delivery decisions (queue vs interrupt vs digest), interruption history, queue items, assistant role definitions (chief of staff, operator, strategist, money sentinel, boardroom curator), assistant launch readiness

**E. `native-shell-strategy-contract.ts`** — Native shell registry (iPhone/Android/tablet), capability-surface-fit mapping (mobile_primary/supported/desktop_primary/wearable_micro/not_mobile), mobile action classes, device secure actions, continuity model (web↔app↔watch↔desktop), push route bindings, mobile launch readiness

### 2. Edge Function Enhancement

Add 5 seed actions to `ambient-os-operations`:
- `seed_apple_ecosystem` — Apple provider family + capabilities + launch readiness
- `seed_android_ecosystem` — Android equivalents
- `seed_signal_providers` — 8 signal provider records
- `seed_notification_grammar` — urgency classes and routing defaults
- `seed_native_shells` — shell records with capability fit matrix

All seeds insert into existing tables (no new DB tables needed).

### 3. Twenty-Seven Admin Pages

| Group | Pages | Route Prefix |
|-------|-------|-------------|
| Apple Ecosystem | 6 (Ecosystem Center, Devices/Trust, Watch Experience, Identity/Accounts, Health Consent, Launch Readiness) | `/admin/apl/*` |
| Android Ecosystem | 5 (Ecosystem Center, Wear OS, Trust/Approvals, Health Consent, Launch Readiness) | `/admin/and/*` |
| Health/Signal Intelligence | 6 (Consent Center, Signal Sources, Readiness Explanation, Notification Influence, Assistant Timing, Launch Honesty) | `/admin/hrs/*` |
| Notification/Calm Assistant | 6 (Routing Studio, Calmness Center, Fatigue Board, Queue/Interrupt Matrix, Cross-Device Delivery, Launch Honesty) | `/admin/nrc/*` |
| Native Shell Strategy | 4 (Strategy Board, Capability Matrix, Trust/Continuity, Launch Honesty) | `/admin/nss/*` |

### 4. Wiring

- Update MSA barrel to export 5 new contracts
- Add 27 lazy imports + routes in App.tsx
- TypeScript build verification

### 5. No Database Migration Required

All data models map to existing UAO/PFA tables. TypeScript contracts define shapes; DB stores them in provider_families, provider_capabilities, ambient_launch_readiness, connected_devices, device_trust_records, etc.

## Implementation Order

1. Create 5 contract files (parallel)
2. Update barrel + edge function
3. Create 27 admin pages (batched)
4. Wire routes
5. Build check

