# SITA OS — Mobile Platform System

## Status
Phase 1 — canonical layer scaffolded. iOS + Android contracts, runtime detection, adapters, offline sync engine, security, analytics, navigation, migration maps all live under `src/lib/mobile-platform/`.

## Ownership
Domain: `platform`
Service: `mobile-platform-layer`
Layer: `runtimes/mobile`
Trust posture: authority device — biometric-gated approvals on iOS + Android.

## Architecture Layers

### Layer 1 — Contracts (`contracts/`)
Machine-readable truth. No runtime side effects.
- `mobile-platform-contract.ts` — canonical OS, host, channel, capability ids
- `ios-capability-matrix.ts` / `android-capability-matrix.ts` — per-capability status, min version, fallback, note
- `permission-matrix.ts` — per-permission rationale, denial fallback, re-request policy, UI copy
- `push-contract.ts` — APNs / FCM / web-push payload, delivery receipt, registration, transport priority
- `deep-link-contract.ts` — route, auth requirement, resolution, error codes
- `lifecycle-contract.ts` — phase transitions + snapshot
- `background-task-contract.ts` — registry of allowed background work + constraints
- `secure-storage-contract.ts` — keychain / keystore abstraction
- `biometric-contract.ts` — availability, prompt, kinds, auth token
- `offline-sync-contract.ts` — domain policies, mutation shape, conflict policy
- `state-restore-contract.ts` — cold / warm / deep-link / push-open restore semantics
- `network-degradation-contract.ts` — tier → policy (lite, queue, banner, stale hints)

### Layer 2 — Runtime (`runtime/`)
- `mobile-runtime-detection.ts` — pure detection (no React)
- `mobile-runtime-context.tsx` — `MobileRuntimeProvider`, `useMobileRuntime`, `useMobileCapability`
- `mobile-platform-flags.ts` — kill switches (APNs deferred, FCM planned)
- `mobile-capability-resolver.ts` — single answer to "can mobile do X right now?"
- `mobile-permission-resolver.ts` — effective permission posture per OS
- `mobile-parity-resolver.ts` — parity truth vs desktop/web

### Layer 3 — Adapters (`ios/`, `android/`)
Per-platform implementations: runtime, push, secure storage, biometric, deep-link, background tasks, lifecycle, release channel.

### Layer 4 — Sync (`sync/`)
- `sync-queue-manager.ts` — durable mutation queue with persistence hook + subscribers
- `mobile-offline-sync-engine.ts` — drain loop with backoff, conflict, abandonment
- `sync-conflict-policy.ts` — server / client / last-write / manual-merge resolvers
- `retry-policy.ts` — exponential backoff with jitter
- `degraded-network-policy.ts` — UI-facing degradation flags
- `mobile-sync-health.ts` — admin / settings sync snapshot

### Layer 5 — Security (`security/`)
- `mobile-device-trust.ts` — composite trust score
- `mobile-local-encryption.ts` — AES-GCM envelope
- `mobile-key-management.ts` — key handles + rotation events
- `mobile-privacy-guards.ts` — screenshot block / blur-on-background / log redaction policy

### Layer 6 — Analytics (`analytics/`)
Mobile partition kept separable from web/desktop. Push, lifecycle, diagnostics buffer.

### Layer 7 — Navigation (`navigation/`)
- `mobile-route-registry.ts` — every mobile route + domain + biometric/stale flags
- `mobile-deep-link-map.ts` — sita:// + Universal/App Link resolver
- `mobile-state-restore.ts` — centralized restore decisions
- `mobile-navigation-guards.ts` — auth + biometric + stale gating

### Layer 8 — Migration (`migration/`)
Feature classification, runtime conflict map, deprecation map for honest audits.

## Capability Truth (current)
| Area | iOS | Android | Notes |
|------|-----|---------|-------|
| APNs | roadmap | n/a | Apple Developer membership pending |
| FCM | n/a | roadmap | Service-account credentials pending |
| Web push | fallback (PWA, iOS 16.4+) | fallback | Active per platform constraint |
| Biometric | Face ID / Touch ID | BiometricPrompt | Real adapter wires native; web uses WebAuthn probe |
| Secure storage | Keychain | Keystore | Web fallback honestly unhardened |
| Background tasks | BGTaskScheduler | WorkManager | 5 task kinds registered |
| Offline sync | durable | durable | Per-domain mutation policy |
| Deep links | Universal Links + sita:// | App Links + sita:// | Centralized resolver |
| Device trust | App Attest | Play Integrity | Composite score |

## Anti-Patterns Forbidden
- Mobile pages MUST NOT import `useElectronBridge` or any DESKTOP_HOST module.
- No page-local push registration — route through `push-contract` + adapters.
- No page-local offline state — use `mobileSyncQueue`.
- No `window.confirm` as biometric proof — use `BiometricContract`.

## Phase Roadmap
- **Phase 1 (DONE)** — contracts, runtime, adapters, sync, security, navigation, analytics, migration maps, plane export, docs.
- **Phase 2** — mobile-safe domain clients (`clients/mobile/*`), hook rewiring (`use-push-notifications`, `useOfflineStore`, `useSessionRestore`), mobile parity admin dashboard.
- **Phase 3** — Capacitor wiring (real Keychain/Keystore, BiometricPrompt, BGTaskScheduler/WorkManager, Universal/App Links), APNs + FCM credential provisioning.
- **Phase 4** — release-channel CI, privacy-guard enforcement, parity governance check in CI.

## Public Surface
Import from a single canonical path:
```ts
import { useMobileRuntime, useMobileCapability, mobileSyncQueue, resolveDeepLink } from "@/lib/mobile-platform";
// or via the plane:
import { useMobileRuntime } from "@/planes/mobile";
```
