# Sync & Continuity Model

> **Layer:** L3 Platform Service · **Registry:** `src/lib/platform/sync/sync-topology-registry.ts`

## Purpose

Declares every cross-device / offline-online sync namespace, its conflict strategy, and its degraded-network behavior.

## Namespaces

| Namespace | Direction | Transport | Conflict | Degraded |
|-----------|-----------|-----------|----------|----------|
| `files` | bidirectional | realtime | server-wins | queue-and-retry |
| `approvals` | bidirectional | realtime | server-wins | block-writes |
| `boardroom` | bidirectional | realtime | owner-wins | queue-and-retry |
| `advisor.memory` | bidirectional | edge-fn | merge-crdt | queue-and-retry |
| `settings` | bidirectional | rest | last-write-wins | queue-and-retry |
| `notifications.delivery` | cloud→client | ws-multiplex | server-wins | drop-stale |
| `audit` | client→cloud | rest | server-wins | queue-and-retry |
| `device.heartbeat` | client→cloud | ws-multiplex | server-wins | drop-stale |

## State Machine

```
synced → syncing → (synced | conflict | queued)
queued → (syncing | degraded)
degraded → syncing
syncing → offline → (queued | syncing)
conflict → (synced | error)
```

`SYNC_STATE_TRANSITIONS` declares every legal transition.

## Conflict Strategies

- `last-write-wins` — wall clock decides
- `owner-wins` — owner's device always wins
- `server-wins` — server is authoritative
- `client-wins` — client buffer wins (rare)
- `merge-crdt` — CRDT merge (advisor memory)
- `manual-resolve` — present a UI to the user

## Degraded Network Policies

- `queue-and-retry` — buffer locally, replay when online
- `drop-stale` — discard old items beyond freshness window
- `block-writes` — refuse mutations until online (used by approvals)
- `fall-back-to-cache` — read-only from cache

## Tier Availability

Each namespace declares which runtimes it serves. `device.heartbeat` is desktop/appliance/mobile only.

## Enforcement

- Sync service validates namespace + tier before accepting subscription.
- Per-namespace replay window protects against unbounded buffer growth.
- Kill switches per namespace allow operators to halt sync families independently.
