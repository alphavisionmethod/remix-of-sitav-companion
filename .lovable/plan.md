

# SITA OS — Distributed Ecosystem: OS + Cloud + Mobile Control Layers (Admin-Only)

## Scope Clarification

This is an **admin-only** subsystem. It lives entirely within the `/admin/*` route hierarchy, protected by `AdminRoute`. The user OS (desktop shell, mobile `/mobile/*`) is untouched. This gives the admin/founder a full distributed ecosystem command center for managing OS execution, cloud truth, and mobile app control across their device fleet.

## Current State

**Already built:**
- `FleetService` (fleet node management, heartbeats)
- `CloudControlPlaneService` (multi-region, failover, routing)
- `TrustedDeviceService` (device attestation, trust levels, revocation)
- `DevicePresenceService` (browser heartbeats, real-time presence)
- `ControlCenterDaemon` (IPC routing, policy preflight, elevation)
- `DWE01-07` pages (connected devices, presence, trust, wearables)
- `FleetHealthPage` (fleet inventory, anomalies, predictions)
- `AdminDashboard` (metrics, system health overview)
- Admin shell with `AdminRoute` guard + `AdminShell` layout

**Missing:**
1. **Command Routing Engine** — No structured command parser, intent engine, risk evaluator, or multi-layer routing
2. **Ecosystem Orchestrator** — No unified OS↔Cloud↔App layer coordination daemon
3. **Dual Authority / Approval Flow** — No out-of-band approval challenge for critical admin actions
4. **System Guarantee Engine** — No pre-action guarantee validation (data loss, rollback, trust)
5. **Command Memory** — No persistent command history with context, risk, outcome, learning
6. **Ecosystem Dashboard UI** — No unified admin page showing all three layers with live status
7. **Remote Command Center UI** — No admin page for issuing, routing, and tracking cross-layer commands
8. **Ecosystem Security Shield UI** — No admin page showing trust fabric, dual-auth approvals, threat posture across layers

## Implementation Plan — 5 Batches

### Batch 1: Ecosystem Orchestrator Engine (~450 lines)

**Create `src/lib/services/ecosystem-orchestrator/index.ts`**

Core engine that coordinates OS, Cloud, and App layers:

- **Layer Registry**: Tracks OS layer status (execution health, local state), Cloud layer status (sync, identity, policy), App layer status (connected control surfaces, pending approvals)
- **Command Routing Engine**: Full pipeline — `parse → intent → risk/trust eval → route → execute → verify → report`
  - Intent extraction from structured command objects
  - Risk classification (low/medium/high/critical)
  - Layer routing decision (OS-only, Cloud-only, Cloud+App approval, Cloud+OS execution, all three)
  - Approval requirement evaluation based on action sensitivity + policy
  - Verification step confirming execution outcome
- **Dual Authority System**: Critical actions (device revoke, fleet wipe, security downgrade, force rollout) require explicit approval flow with challenge/response
- **System Guarantee Engine**: Pre-action validation checking rollback availability, data-loss risk, trust impact, verification paths
- **Command Memory**: Stores full command lifecycle — input, intent, risk, routing decision, approval, execution result, verification, duration — with pattern learning for future routing optimization
- **Event Bus Integration**: Emits typed ecosystem events (`command.requested`, `command.routed`, `command.approved`, `command.executed`, `command.verified`, `layer.status.changed`, `trust.alert`)
- Singleton pattern: `getEcosystemOrchestrator()`
- Persistence via `universal-service-persistence`

### Batch 2: Ecosystem State Contracts + Types (~200 lines)

**Create `src/lib/services/ecosystem-orchestrator/types.ts`**

All typed contracts:

- `EcosystemLayer` enum: `os | cloud | app`
- `CommandIntent`: intent, scope, targets, urgency, risk class, trust requirement, approval mandatory, simulation required, rollback available
- `CommandRouteDecision`: selected layers, approval flow, execution plan, guarantee checks
- `CommandLifecycle`: 10-state machine (submitted → parsed → evaluated → routed → pending_approval → approved → dispatched → executing → verifying → completed/failed/rolled_back)
- `DualAuthorityChallenge`: action, risk level, source, challenge token, expiry, response
- `SystemGuarantee`: guarantee type (no_data_loss, rollback_available, no_trust_downgrade, verification_path_exists), status, explanation
- `LayerHealthReport`: per-layer metrics, service count, active/degraded/offline, last heartbeat
- `EcosystemEvent`: versioned event schema with correlation IDs
- `CommandMemoryEntry`: full command record with context, result, risk, user preferences, duration

### Batch 3: Database Migration (~8 tables)

- `ecosystem_commands` — command_id, user_id, intent, scope, risk_class, target_layers, approval_required, status (lifecycle state), created_at, completed_at, result_summary
- `command_routing_decisions` — decision_id, command_id, route_layers, approval_flow, guarantee_checks_json, decided_at, user_id
- `dual_authority_challenges` — challenge_id, command_id, action, risk_level, challenge_token, expires_at, response, responded_at, user_id
- `system_guarantees` — guarantee_id, command_id, guarantee_type, status, explanation, checked_at, user_id
- `command_memory` — memory_id, command_id, intent, context_json, risk, outcome, user_preferences_json, duration_ms, learned_at, user_id
- `ecosystem_events` — event_id, event_type, correlation_id, source_layer, payload_json, emitted_at, user_id
- `layer_health_snapshots` — snapshot_id, layer, services_total, services_healthy, services_degraded, health_score, captured_at, user_id
- `ecosystem_contracts` — contract_id, feature_name, os_ownership, cloud_ownership, app_ownership, failure_behavior, approval_required, rollback_exists, user_id

All tables RLS-protected with `auth.uid() = user_id`.

### Batch 4: Admin Ecosystem Dashboard UI (~500 lines)

**Create `src/pages/admin/ECO01EcosystemCommand.tsx`** — Ecosystem Command Center

Three-column layout showing all three layers simultaneously:

- **Header**: Ecosystem health ribbon — OS layer (green/amber/red), Cloud layer, App layer — with live scores
- **Tab 1 — Layers Overview**: Three glassmorphic cards showing each layer's responsibilities, active services, health metrics, and current status. Visual architecture diagram matching the prompt's ASCII layout.
- **Tab 2 — Command Center**: Command input with intent preview, risk evaluation display, routing decision visualization (which layers get involved), approval status tracker, execution progress, verification result. Command history table with full lifecycle replay.
- **Tab 3 — Dual Authority**: Pending approval challenges, challenge/response flow, approval history, risk explanations.
- **Tab 4 — Guarantees & Contracts**: System guarantee checks per command, feature contract registry showing OS/Cloud/App ownership for each feature.
- **Tab 5 — Command Memory**: Historical command patterns, user preference learning, routing optimization insights.

**Create `src/components/admin/ECOSubNav.tsx`** — Subnav for ecosystem pages

### Batch 5: Route Registration + Wiring (~100 lines)

**Modify `src/routes/AdminRoutes.tsx`**: Register `/admin/ecosystem/command` route

**Modify `src/lib/os-security/index.ts`**: Boot `EcosystemOrchestrator` after `controlcenterd` in dependency order

**Modify `src/pages/admin/AdminDashboard.tsx`**: Add ecosystem health summary card linking to `/admin/ecosystem/command`

## Design Language

- Follows existing admin glassmorphic style: `bg-white/[0.04]`, `backdrop-blur-xl`, `border-white/[0.06]`
- Uses `framer-motion` for staggered card animations (same `fadeUp` + `stagger` pattern as `AdminDashboard`)
- Three-layer color coding: OS = emerald, Cloud = sita-purple, App = amber
- Command lifecycle uses timeline visualization with state dots
- Risk levels use existing severity badge patterns (green/amber/orange/red)

## File Summary

- **Create**: `ecosystem-orchestrator/index.ts`, `ecosystem-orchestrator/types.ts`, `ECO01EcosystemCommand.tsx`, `ECOSubNav.tsx`, migration SQL (5 files)
- **Modify**: `AdminRoutes.tsx`, `os-security/index.ts`, `AdminDashboard.tsx` (3 files)
- **Total**: ~8 files, ~1,250 lines

