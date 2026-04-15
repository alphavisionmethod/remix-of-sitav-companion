

# Full Advanced Communication Architecture — Implementation Plan

## Current State Assessment

The project already has substantial communication infrastructure:

**Exists and works:**
- `callEdge()` typed edge function client with compile-time safety
- `cloud-device-api` — register, revoke, trust, heartbeat, rename devices
- `cloud-sync-api` — push, pull, checkpoint, conflicts, resolve
- `os-command` — admin command dispatch via agent_signals
- `os-status` — device telemetry reporting
- `system-updates` — version check and update reporting
- `push-dispatch` — VAPID web push delivery with calm routing
- `user-bff-gateway` — dashboard, devices, notifications, support cases
- `UnifiedEventService` — client-side event bus with Supabase Realtime bridge
- `RealtimeGatewayService` — channel management, presence, fan-out
- `EventBus` — kernel-level pub/sub with wildcard, DLQ, replay

**Missing from the prompt requirements:**
1. **Unified API Gateway edge function** — single entrypoint routing to all 16 API domains
2. **Command lifecycle** — full 11-state machine (created→planning→awaiting_approval→approved→dispatched→running→verifying→completed→failed→rolled_back→denied→canceled)
3. **Security/Trust APIs** — approve/deny pending actions, emergency lock, trust posture
4. **Policy Engine APIs** — CRUD policies, effective policy, simulate
5. **AI APIs** — chat, analyze, suggestions, explain (the brain-core/ai-gateway exist but not the unified API surface)
6. **Audit/Timeline APIs** — structured audit history, correlated logs, unified timeline
7. **Notification management APIs** — read/action/preferences
8. **App management APIs** — install, remove, update managed apps
9. **Client SDK layer** — typed React hooks consuming each API domain
10. **WebSocket reconnection/resume** — graceful degradation with queue
11. **Correlation ID propagation** — end-to-end tracing through all layers

## Implementation Plan — 6 Batches

### Batch 1: Unified API Gateway + Command Lifecycle

**Edge function: `api-gateway/index.ts`** — Single entrypoint that routes `/auth/*`, `/devices/*`, `/commands/*`, `/ai/*`, `/system/*`, `/sync/*`, `/security/*`, `/notifications/*`, `/audit/*`, `/updates/*`, `/policies/*`, `/apps/*` to handler modules.

**Edge function: `api-gateway` sub-handlers** — All kept in single `index.ts` per edge function rules. Routes parsed from URL path, dispatched to inline handler functions.

**New tables via migration:**
- `os_commands` — full command lifecycle with 11-state machine, correlation_id, actor, origin, target_device, simulation_first, plan_json, approval_state, verification_state, rollback_available
- `os_command_events` — state transition log per command

**Covers prompt sections:** 1-4 (principles, architecture), 7 (command system)

### Batch 2: Security, Trust, Policy, and Approval APIs

**Extend `api-gateway`** with security and policy routes:
- `GET /security/status` — trust posture from existing trust tables
- `GET /security/approvals/pending` — from approval_queue
- `POST /security/approve` / `POST /security/deny`
- `POST /security/emergency/lock`
- `GET /policies` / `POST /policies` / `PUT /policies/{id}`
- `GET /policies/effective` — resolve effective policy for context
- `POST /policies/simulate`

**New table:** `os_policies` — policy definitions with scope, conditions, actions

**Covers prompt sections:** 5 (auth), 11 (security), 15 (policy engine)

### Batch 3: AI, System Status, Audit/Timeline APIs

**AI routes** wired to existing `ai-gateway` and `brain-core`:
- `POST /ai/chat` — delegates to brain-core
- `POST /ai/analyze` — system analysis with telemetry context
- `GET /ai/suggestions` — from existing recommendation tables
- `POST /ai/suggestions/{id}/apply` — creates command from suggestion
- `POST /ai/explain` — why-explanation for events

**System routes:**
- `GET /system/status` — aggregated health from device_statuses + service health
- `GET /system/metrics` — from telemetry
- `GET /system/health` — subsystem breakdown
- `GET /system/anomalies` — from anomaly detection

**Audit routes:**
- `GET /audit/events` — from audit_logs with pagination
- `GET /timeline` — unified user-facing timeline

**Covers prompt sections:** 8 (AI), 9 (system status), 13 (logs/audit)

### Batch 4: Notifications, Sync Enhancements, Update Control, App Management

**Notification routes:**
- `GET /notifications` — from platform_notifications
- `POST /notifications/read`
- `POST /notifications/{id}/action`
- `GET /notifications/preferences` / `PUT /notifications/preferences`

**Sync enhancements:**
- `POST /sync/pause` / `POST /sync/resume`
- `POST /sync/reindex`
- `GET /sync/history`

**Update control:**
- `POST /updates/install` / `POST /updates/schedule` / `POST /updates/rollback`
- `GET /updates/rollout`

**App management:**
- `GET /apps` / `POST /apps/install` / `POST /apps/remove` / `GET /apps/{id}/health`

**New table:** `managed_apps` — app registry with trust state, health, versions

**Covers prompt sections:** 10 (sync), 12 (notifications), 14 (updates), 16 (app management)

### Batch 5: Client SDK + React Hooks

**`src/lib/api/os-api-client.ts`** — Typed client SDK wrapping `callEdge("api-gateway", ...)` for every API domain. Methods like `osApi.commands.create()`, `osApi.devices.list()`, `osApi.security.approve()`, etc.

**React hooks** in `src/hooks/use-os-api.ts`:
- `useCommands()` — list, create, approve, deny with React Query
- `useDevices()` — list, register, lock, wipe
- `useSystemStatus()` — real-time health dashboard data
- `useSyncControl()` — pause, resume, conflicts
- `useSecurityPosture()` — trust state, pending approvals
- `useNotificationManager()` — inbox, preferences, actions
- `useAuditTimeline()` — paginated audit events
- `usePolicyManager()` — CRUD policies
- `useUpdateControl()` — install, schedule, rollback

### Batch 6: WebSocket Resilience + Correlation Tracing

**`src/lib/services/realtime-gateway/resilient-channel.ts`** — Reconnection with exponential backoff, stream resume from last event ID, offline queue for mutations.

**Correlation ID propagation** — Middleware in the gateway that generates/forwards `X-Correlation-ID` through all operations, stored in command events and audit logs.

**Enhanced `UnifiedEventService`** — Resume support, missed-event replay on reconnect, heartbeat keepalive.

## Technical Details

- All edge function code stays in single `index.ts` files (no subfolders)
- All new tables get RLS policies scoped to authenticated users via `auth.uid() = user_id`
- Command lifecycle uses PostgreSQL trigger for automatic `updated_at`
- API responses follow the prompt's response model: operation_id, status, follow_up_stream, approval_pending, verification_pending, rollback_available
- All mutations include correlation_id in request/response
- Client SDK uses existing `callEdge()` typed infrastructure
- React hooks use React Query with proper cache invalidation

## Files Created/Modified

| File | Action |
|---|---|
| `supabase/functions/api-gateway/index.ts` | Create — unified routing gateway |
| `src/lib/api/os-api-client.ts` | Create — typed SDK for all 16 API domains |
| `src/hooks/use-os-api.ts` | Create — React Query hooks for all domains |
| `src/lib/services/realtime-gateway/resilient-channel.ts` | Create — reconnection + resume |
| Migration for `os_commands`, `os_command_events`, `os_policies`, `managed_apps` | Create |
| `src/lib/core-services/event-bus.ts` | Modify — add correlation propagation |

