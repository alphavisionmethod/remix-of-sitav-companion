

# SITA OS — Intelligent Differentiation Layer Implementation Plan

## Current State Assessment

After thorough codebase analysis, the project already has **significant coverage** of the 30-point prompt. Here's the gap analysis:

### Already Exists (no work needed)
| System | Existing Implementation |
|--------|----------------------|
| Decision Engine | `decision-intelligence/` (203 lines) + `brain-core/` orchestration |
| Intent Engine | `intent-orchestrator/` (full lifecycle: parse → plan → execute → receipt) |
| Context Engine | `ambient-context-engine.ts` (616 lines) + `personal-graph/` |
| Trust Layer | `trust-actions/trust-weighted-actions.ts` (279 lines, multi-surface) |
| Continuity/State Sync | `continuity-engine/` (253 lines, cross-surface handoff) |
| System Memory | `memory-service/` (6 sub-services), `ai-memory-graph/`, `memory-governance/` |
| Automation Engine | `routine-detector.ts`, `council-orchestrator/`, `ecosystem-orchestrator/` |
| Predictive/Zero-Lag | `predictive-intent/`, `background-intelligence.ts`, predictive-prefetch |
| Recommendation | `recommendation-execution/recommendation-loop-service.ts` (332 lines) |
| Workspace/Spatial | `SpatialDesktop.tsx` (5 workspaces, zoom levels, spatial navigation) |
| Admin Control Plane | 434 admin pages, RBAC, feature flags, platform-plane services |
| Capability Router | `capability-router/`, 16 registered capability handlers |
| Chief of Staff | `chief-of-staff/` (interventions, proactive suggestions) |
| Attention OS | `attention-os/` (cognitive load scoring, priority stacking) |
| Digest Engine | `digest-engine/` (morning pulse, weekly summaries) |
| Adaptive Interface | `adaptive-interface/` (context-responsive UI) |
| Boundary Engine | `boundary-engine/` (work/life boundaries) |
| Experience Signature | `experience-signature/` (platform feel/identity) |

### What's Missing (implementation targets)

1. **Device Mesh Service** — No cooperative multi-device fabric (only `device-presence-service` for basic tracking)
2. **Context Graph Service** — Personal Graph exists but no dedicated real-time context graph aggregator
3. **Universal State Sync** — Continuity engine handles handoff but no full UI-state serialization/restore system
4. **Explainability Engine** — No unified "Why?" layer for decisions, suggestions, trust scores
5. **Action Safety Classifier** — Trust-weighted actions exist but no formal safety classification (passive/assisted/active/high-risk)
6. **Privacy Control Center** — No user-facing memory/context/learning controls
7. **Workspace Intelligence** — Spatial desktop exists but no workspace-specific policies, automations, or context rules
8. **Orchestration Graph Visualizer** — No UI showing live action execution plans
9. **Intelligence Dashboard** — No unified user-facing surface showing all intelligent features

---

## Implementation Plan — 5 Batches

### Batch 1: Database — 3 new tables

| Table | Purpose |
|-------|---------|
| `device_mesh_peers` | Cooperative device mesh: device roles, capabilities, trust handshake, proximity |
| `context_graph_snapshots` | Real-time context state snapshots (user, device, workspace, apps, signals) |
| `action_safety_classifications` | Formal safety classification per action type (passive/assisted/active/high-risk) with thresholds |

Seed: 8 device capabilities, 6 action safety classifications, sample context graph schema.

### Batch 2: Core Services — 6 new services in `src/lib/services/`

1. **`device-mesh/index.ts`** (~300 lines) — Device Mesh Fabric
   - `discoverPeers()` — Find nearby/linked devices
   - `advertiseCapabilities()` — Broadcast what this device can do
   - `requestHandoff(taskId, targetDeviceId)` — Cross-device task routing
   - `getDeviceRoles()` — Which device is anchor/sensor/display
   - `getMeshTopology()` — Full mesh visualization data
   - Integrates with `device-presence-service` and `continuity-engine`

2. **`context-graph/index.ts`** (~250 lines) — Real-Time Context Aggregator
   - `getCurrentContext()` — Unified snapshot: user, device, workspace, apps, time, trust, battery
   - `getContextSignals()` — All active signals with freshness
   - `subscribeToContext(callback)` — Live context changes
   - Aggregates from: `ambient-context-engine`, `personal-graph`, `attention-os`, `sita-modes`, `trust-actions`

3. **`universal-state-sync/index.ts`** (~280 lines) — App State Serialization
   - `captureAppState(appId)` — Serialize scroll, form, tab, selection state
   - `restoreAppState(appId, deviceId)` — Hydrate state on new surface
   - `getStateDiff(appId, deviceA, deviceB)` — Show what changed
   - `registerStateAdapter(appId, adapter)` — App-specific serialization
   - Wires into `continuity-engine` for cross-device restore

4. **`explainability/index.ts`** (~220 lines) — Unified Explainability Layer
   - `explainDecision(decisionId)` — Why was this suggested?
   - `explainTrustScore(entityId)` — Why is trust X?
   - `explainAutomation(automationId)` — Why did this run?
   - `explainBlock(blockId)` — Why was this blocked?
   - `getExplanationHistory(userId)` — Recent explanations
   - Sources: `decision-intelligence`, `trust-actions`, `conscience-gate`, `recommendation-execution`

5. **`action-safety/index.ts`** (~200 lines) — Formal Action Safety Classifier
   - `classifyAction(actionId)` — Returns: passive/assisted/active-reversible/high-risk
   - `getSafetyRequirements(classification)` — Trust threshold, confirmation rules, audit level
   - `validatePreExecution(actionId, context)` — Full safety gate check
   - Maps onto existing `trust-weighted-actions` risk tiers

6. **`workspace-intelligence/index.ts`** (~250 lines) — Workspace Context Rules
   - `getWorkspacePolicy(workspaceId)` — Notification, network, app, focus rules
   - `suggestWorkspace(context)` — Recommend workspace based on time/activity
   - `getWorkspaceAutomations(workspaceId)` — Triggers/actions per workspace
   - `applyWorkspaceContext(workspaceId)` — Activate workspace policies
   - Integrates with `sita-modes`, `boundary-engine`, `adaptive-interface`

### Batch 3: Wire Into OS Kernel

- Add all 6 new services to `SitaOSContext.tsx` kernel shape and instantiation
- Update `useOSOrchestration.ts` hook with new APIs
- Wire `context-graph` as the universal context source for `decision-intelligence`, `intent-orchestrator`, and `recommendation-execution`
- Wire `explainability` into `conscience-gate` and `trust-actions`
- Wire `device-mesh` into `continuity-engine` handoff system

### Batch 4: User-Facing UI — 5 new components/pages

1. **`IntelligenceDashboard.tsx`** — Unified "OS Intelligence" surface
   - Decision suggestions with confidence + explain buttons
   - Active context signals (time, workspace, device, mood)
   - Recommendation feed with dismiss/accept/explain
   - Memory summary with edit/delete controls
   - Workspace suggestion cards

2. **`DeviceMeshPanel.tsx`** — Device ecosystem view
   - Visual mesh topology (nodes + connections)
   - Device roles (anchor/sensor/display)
   - Capability badges per device
   - Handoff controls + trust indicators
   - One-tap "Continue on..." actions

3. **`ExplainabilityDrawer.tsx`** — "Why?" side panel
   - Triggered from any trust badge, recommendation, or automation
   - Shows reasoning chain, sources, confidence, alternatives
   - "Was this helpful?" feedback

4. **`PrivacyControlCenter.tsx`** — User intelligence controls
   - Memory on/off per domain
   - Context tracking toggles
   - Recommendation preferences
   - Delete learned patterns
   - Export/review automation history
   - Workspace learning controls

5. **`OrchestrationFlowViewer.tsx`** — Live action execution visualization
   - Shows intent → plan → execute → result pipeline
   - Step-by-step with status indicators
   - Policy decision highlights
   - Rollback controls where available

### Batch 5: Admin Integration + Final Wiring

- **`IntelligenceAdminDashboard.tsx`** — Admin page for intelligence layer observability
  - Decision engine hit rates, confidence distributions
  - Context graph health, signal freshness
  - Device mesh topology across users
  - Action safety classification stats
  - Recommendation acceptance rates
  - Memory growth and governance metrics

- Wire intelligence dashboard into user sidebar
- Wire device mesh into existing device management
- Wire explainability into all trust badges and recommendation cards
- Wire privacy controls into Settings
- Wire workspace intelligence into SpatialDesktop
- Update admin layout with intelligence admin tab

---

## File Summary

| Batch | Type | Count |
|-------|------|-------|
| 1 | Migration | 1 (3 tables + seeds) |
| 2 | Services | 6 new |
| 3 | Kernel Wiring | 3 files updated |
| 4 | User UI | 5 components |
| 5 | Admin + Final Wiring | 1 admin page + ~6 wiring updates |

**Total: ~1 migration, 6 services, 5 user components, 1 admin page, ~9 wiring updates**

All services integrate with existing kernel patterns (factory functions, persistence adapters, typed contracts). All UI follows the glassmorphic dark-first design system with `bg-white/[0.03]`, 30px+ blur, sita-purple/gold accents.

