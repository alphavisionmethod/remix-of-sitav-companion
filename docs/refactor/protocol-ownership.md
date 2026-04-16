> ⚠️ **Status: Future Monorepo Target — Aspirational Reference**
> This document describes a post-Lovable monorepo migration design. The current platform remains a **single Vite SPA + Lovable Cloud** deployment. Treat as reference architecture, not current state.

# SITA OS — Protocol Ownership Map

> Maps each protocol to its authoritative owning service.

| Protocol | Owner Service | Consumed By |
|----------|--------------|-------------|
| `command-lifecycle` | `executor-service` | All planes via protocol-bridge |
| `approval-protocol` | `approval-engine` | Admin, Founder, Mobile |
| `trust-evaluation` | `trust-governor` | OS, Admin, Mobile |
| `agent-communication` | `os-agent-channel` (edge fn) | OS Agent, Backend |
| `rollout-protocol` | `release-intelligence` | Admin, Founder |
| `receipt-protocol` | `receipt-service` | All planes (read) |
| `websocket-protocol` | `ws-gateway` / `UnifiedWsClient` | All client planes |
| `notification-protocol` | `notification-service` | Mobile, Admin, Product |
| `sync-protocol` | `sync-service` | Mobile, OS |
| `update-protocol` | `update-service` / OS executor | OS, Mobile |
| `timeline-protocol` | `timeline-service` | Product, Admin, Founder |
| `compatibility-protocol` | `release-intelligence` | Release engine, Admin |

## Protocol Bridge Coverage

All 12 protocols are fully bridged in `src/lib/services/protocol-bridge/index.ts`:

| Protocol | Bridge Function(s) | Status |
|----------|-------------------|--------|
| Command | `executeCommand()` | ✅ Wired |
| Approval | `initiateProtocolApproval()`, `resolveProtocolApproval()` | ✅ Wired |
| Trust | `evaluateTrustClaim()` | ✅ Wired |
| Agent | `createAgentCommand()`, `acknowledgeAgentCommand()` | ✅ Wired |
| Rollout | `evaluateRolloutReadiness()` | ✅ Wired |
| Receipt | `createReceiptEnvelope()`, `queryReceipts()`, `verifyReceiptChain()` | ✅ Wired |
| WebSocket | `subscribeWebSocket()`, `unsubscribeWebSocket()`, `getWebSocketConnectionState()`, `sendWebSocketMessage()` | ✅ Wired |
| Notification | `routeNotification()`, `getNotificationPreferences()` | ✅ Wired |
| Sync | `createSyncCheckpoint()`, `resolveSyncConflict()` | ✅ Wired |
| Update | `checkForUpdates()`, `getUpdateInstallState()`, `initiateUpdateRollback()` | ✅ Wired |
| Timeline | `emitTimelineEvent()`, `queryTimeline()` | ✅ Wired |
| Compatibility | `checkComponentCompatibility()` | ✅ Wired |

## Rules

1. Only the owning service may **write** canonical state for a protocol.
2. Other planes may **read** protocol state via API/BFF contracts.
3. Protocol types are pure — zero runtime dependencies.
4. The protocol-bridge (`src/lib/services/protocol-bridge/`) maps protocols to service implementations.
5. React components access protocols via `useProtocolBridge()` hook — never directly.
