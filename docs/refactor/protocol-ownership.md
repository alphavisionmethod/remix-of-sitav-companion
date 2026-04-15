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

## Rules

1. Only the owning service may **write** canonical state for a protocol.
2. Other planes may **read** protocol state via API/BFF contracts.
3. Protocol types are pure — zero runtime dependencies.
4. The protocol-bridge (`src/lib/services/protocol-bridge/`) maps protocols to service implementations.
