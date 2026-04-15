

# Unified Real-Time Communication Layer — Implementation Plan

## What Already Exists

| Component | Status |
|---|---|
| `api-gateway` edge function (14 domains) | Complete |
| `os-api-client.ts` typed SDK (16 domains) | Complete |
| `use-os-api.ts` React Query hooks (38 hooks) | Complete |
| `resilient-channel.ts` (reconnect, backoff, queue) | Complete |
| `RealtimeGatewayService` (channel mgmt, presence) | In-memory only |
| `UnifiedEventService` + Realtime bridge | Bridges 3 tables only |
| `EventBus` (wildcard, DLQ, replay, persist) | Complete |
| `CommunicationHub.tsx` admin UI | Complete |
| `os-command` edge function (agent_signals) | Complete |
| Existing event envelope contract | Missing prompt fields |

## What's Missing (Sections 17-35)

1. **Unified WebSocket multiplexer** — A single Supabase Realtime channel that multiplexes all 11 event scopes (system, command, security, sync, device, update, AI, healing, notification, timeline, audit) with typed envelope and selective subscription filtering (Section 17, 19, 21)
2. **Full event envelope standard** — Current `EventEnvelope` lacks `event_id`, `actor_type`, `actor_id`, `source`, `scope`, `risk_level` fields the prompt requires (Section 20)
3. **OS Agent communication protocol** — Structured command/response model with progress streaming, telemetry, and local policy enforcement. Current `os-command` is fire-and-forget via `agent_signals` (Section 22-23)
4. **Internal event bus backend events** — Backend doesn't emit canonical lifecycle events (CommandCreated, ApprovalGranted, DeviceRevoked, etc.) through the event bus for fan-out to WebSocket and push (Section 24)
5. **Communication observability** — No metrics tracking for WebSocket connect rate, event fanout latency, reconnect success, command e2e duration, stale-state corrections (Section 32)
6. **Notification preferences table** — No `notification_preferences` table; gateway returns empty object (Section 12)
7. **Realtime publication** — `os_commands` and `os_command_events` are not added to Supabase Realtime publication, so no live push on status changes (Section 17)
8. **Frontend real-time event stream UI** — CommunicationHub polls via React Query but doesn't show live WebSocket event stream with multiplexed events (Sections 19, 26)

## Implementation Plan — 4 Batches

### Batch 1: Event Envelope Standard + Realtime Publication + Notification Preferences Table

**Migration:**
- `ALTER PUBLICATION supabase_realtime ADD TABLE os_commands, os_command_events;`
- Create `notification_preferences` table (user_id, channel, scope, enabled, quiet_hours, urgency_filter)
- RLS: `auth.uid() = user_id`

**Contract update** — `src/packages/contracts/core/event-envelope.ts`:
- Add `event_id`, `actor_type`, `actor_id`, `source`, `scope`, `risk_level` to the `WsEventEnvelope` type (keep existing `EventEnvelope` untouched for backward compat)

### Batch 2: Unified WebSocket Multiplexer

**New file: `src/lib/services/realtime-gateway/unified-ws-client.ts`**
- Single `UnifiedWsClient` class using one Supabase Realtime channel
- Multiplexes all 11 event scopes via broadcast events
- Selective subscription: `subscribe(scope, handler)` / `unsubscribe(scope)`
- Typed `WsEventEnvelope` on every event
- Bridges DB changes from `os_commands`, `os_command_events`, `agent_signals`, `notifications_queue`, `incidents` into typed broadcast events
- Token refresh awareness (listens to `onAuthStateChange`)
- Forced disconnect on session revoke
- Stream resume from last event ID on reconnect
- Integrates with existing `ResilientChannel` for backoff/heartbeat

**New hook: `src/hooks/use-unified-ws.ts`**
- `useWsSubscription(scope, handler)` — subscribe to specific scope with auto-cleanup
- `useWsEventStream(scopes, maxEvents)` — collect live events matching scopes
- `useWsConnectionStatus()` — returns connection state, latency, last event time
- Auto-starts on auth, auto-stops on logout
- Wires into PlatformInit

### Batch 3: OS Agent Protocol + Backend Event Fan-out

**New edge function: `supabase/functions/os-agent-channel/index.ts`**
- Agent registration endpoint (POST `/register`)
- Agent heartbeat (POST `/heartbeat`)
- Command poll (GET `/commands`) — returns pending structured commands
- Command ack (POST `/commands/:id/ack`) — agent accepts command
- Progress report (POST `/commands/:id/progress`) — streams progress updates into `os_command_events`
- Result report (POST `/commands/:id/result`) — completes or fails command
- Telemetry ingest (POST `/telemetry`)
- All responses update `os_commands` state machine, emit events to `os_command_events`
- Inserts audit_logs for every state transition

**Backend event fan-out** — Add a PostgreSQL trigger on `os_command_events` INSERT that calls `pg_notify` so the Supabase Realtime bridge automatically pushes to subscribed clients. Already handled by adding `os_command_events` to the realtime publication.

**Communication observability table** — Add `communication_metrics` table:
- `metric_type` (ws_connect, ws_disconnect, event_fanout, command_e2e, reconnect, stale_correction)
- `value`, `metadata`, `user_id`, `device_id`, `timestamp`

### Batch 4: Frontend Real-Time Event Stream + Observability Dashboard

**Update `CommunicationHub.tsx`** — Add new "Live Stream" tab:
- Real-time event feed using `useWsEventStream(["*"])`
- Scope filter chips (system, command, security, sync, device, update, AI, healing, notification)
- Event envelope detail panel showing all fields (correlation_id, actor, scope, risk_level)
- Connection health indicator (connected/reconnecting/degraded)
- Event rate sparkline

**Update `CommunicationHub.tsx`** — Add "Observability" tab:
- WebSocket connect/disconnect rate
- Event fanout latency chart
- Command end-to-end duration metrics
- Reconnect success rate
- Active subscriptions by scope
- Stale-state correction counter

**Wire unified WS into existing hooks:**
- `useCommands()` — add real-time invalidation when `command.*` WS events arrive (replace 5s polling)
- `useNotifications()` — invalidate on `notification` scope events
- `useSystemStatus()` — invalidate on `system.status` scope events

## Technical Details

- All new tables get RLS policies: `TO authenticated USING (auth.uid() = user_id)`
- `os-agent-channel` uses service role key for state machine updates
- `WsEventEnvelope` is a superset of existing `EventEnvelope` — no breaking changes
- The unified WS client creates ONE Supabase Realtime channel per authenticated session
- Scoped subscriptions are client-side filters on the single broadcast channel
- Communication metrics are write-only from client; admin reads via gateway
- The OS agent channel is a REST-based pull/push model (agents poll commands, push progress) — not a persistent server-side WebSocket, since edge functions are stateless

## Files Created/Modified

| File | Action |
|---|---|
| `src/packages/contracts/core/ws-event-envelope.ts` | Create — WsEventEnvelope type |
| `src/lib/services/realtime-gateway/unified-ws-client.ts` | Create — multiplexed WS client |
| `src/hooks/use-unified-ws.ts` | Create — React hooks for WS |
| `supabase/functions/os-agent-channel/index.ts` | Create — agent protocol |
| `src/pages/admin/CommunicationHub.tsx` | Modify — add Live Stream + Observability tabs |
| `src/components/sita/PlatformInit.tsx` | Modify — wire unified WS |
| `src/hooks/use-os-api.ts` | Modify — WS-driven cache invalidation |
| Migration for `notification_preferences`, `communication_metrics`, realtime publication | Create |

