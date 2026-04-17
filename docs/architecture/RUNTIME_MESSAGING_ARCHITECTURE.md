# Runtime Messaging Architecture

> **Layer:** L3 Platform Service · **Registry:** `src/lib/runtime/runtime-message-registry.ts`, `event-classification-map.ts`

## Purpose

Single canonical eventing model: who can publish, who can subscribe, how long events live, whether they're replayable, and what trust source they originate from.

## Event Classes

The `RUNTIME_MESSAGE_REGISTRY` lists individual *messages* (boot complete, auth issued, kill switch fired, …). The `EVENT_CLASSIFICATION_MAP` groups those messages into *classes* and defines:

| Field | Meaning |
|-------|---------|
| `trustSource` | system / service / edge-function / client / connector / advisor |
| `persistence` | ephemeral / in-memory / durable / durable-replayable |
| `delivery` | best-effort / at-least-once / exactly-once |
| `scope` | global / tenant / user / device / session / advisor |
| `replayable` | can be replayed from log? |
| `publishers` | which services may emit |
| `subscribers` | which services may consume |

## Trusted vs Untrusted Sources

- `system`, `service`, `edge-function` are trusted: signed by `service_role` or kernel.
- `client` is **untrusted**: every client event must be re-validated server-side before any state mutation.
- `advisor` is *attributable but not trusted*: advisor outputs must pass the executor + approval gates.

## Persistence + Replay

Events with `persistence = durable-replayable` are written to append-only event tables (`admin_action_audit`, `flagship_loop_completions`, `recommendation_execution_events`, etc.). They feed projections and the audit log.

## Delivery Guarantees

- `exactly-once` is implemented through idempotency keys + deduplication. Used for security/policy/approval/kill-switch events.
- `at-least-once` is the default for backend-to-client streams.
- `best-effort` is used only for UI telemetry.

## Transports

The Unified WS Client multiplexes 11 event scopes onto one Supabase Realtime channel. Edge functions emit by inserting into the appropriate Postgres event table.

## Enforcement

- `isPublisherAllowed(eventClass, publisherId)` is invoked by the bus before accepting a publish.
- Subscribers register through typed channels — no string-keyed pub/sub.
- Floods are throttled and may trigger `log-flood-kill`.
