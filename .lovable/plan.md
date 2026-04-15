

# Control Domain Hardening — Final Wiring & Integration

## Audit Summary

All 5 control domains exist with full contract packages and engines:

| Domain | Contracts | Engine | Consumed By |
|--------|-----------|--------|-------------|
| Protocols (12 files) | Complete | Protocol Bridge (5/12 wired) | useProtocolBridge hook |
| Release (6 files) | Complete | release-engine.ts | **NOT consumed anywhere** |
| Graph (6 files) | Complete | graph-engine.ts | **NOT consumed anywhere** |
| AI (8 files) | Complete | ai-governance-engine.ts | **NOT consumed anywhere** |
| Simulations (6 files) | Complete | simulation-engine.ts | **NOT consumed anywhere** |

**Critical gaps:**
1. **Protocol Bridge only bridges 5 of 12 protocols** — missing: receipt, websocket, notification, sync, update, timeline, compatibility
2. **4 engines (Release, Graph, AI-Gov, Simulation) are never imported** by any hook, page, or service — they are dead code
3. **Dependency matrix doc** does not include the 5 control domains as rows
4. **No admin pages** expose Release, Graph, AI Governance, or Simulation engine capabilities
5. **OSRuntimeProvider** does not register the 4 new engines
6. **CI boundary checks** do not validate control domain import rules

---

## Implementation Plan

### Task 1: Wire Protocol Bridge for remaining 7 protocols

Expand `src/lib/services/protocol-bridge/index.ts` with bridge functions for:
- **Receipt protocol** → receipt-service (create/query/verify receipt envelopes)
- **WebSocket protocol** → UnifiedWsClient (typed subscription, reconnect, backpressure)
- **Notification protocol** → notification-router (route by category/urgency)
- **Sync protocol** → sync state helpers (checkpoint, conflict resolution)
- **Update protocol** → update-service bridge (manifest, install state, rollback)
- **Timeline protocol** → timeline-service bridge (emit events, query feed)
- **Compatibility protocol** → release-intelligence (version check, degradation)

Update `src/lib/services/index.ts` and `src/hooks/useProtocolBridge.ts` to export new bridge functions.

### Task 2: Wire engines into OSRuntimeProvider and create hooks

Create 4 new hooks:
- `src/hooks/useReleaseEngine.ts` — exposes rollout planner, health scorer, compatibility checker
- `src/hooks/useGraphEngine.ts` — exposes node/edge CRUD, lineage queries, evidence packs
- `src/hooks/useAIGovernance.ts` — exposes prompt safety eval, budget check, tool policy, action gating, audit log
- `src/hooks/useSimulationEngine.ts` — exposes scenario runner, dry-run executor, what-if analyzer, chaos orchestrator

Register all 4 engines in `src/lib/engines/index.ts` (already done) and ensure the OSRuntimeProvider initializes them.

### Task 3: Create admin pages for control domains

Create 4 admin dashboard pages consuming the new hooks:
- `/admin/release-engineering` — rollout planner, health dashboard, compatibility matrix, regression tracker
- `/admin/graph-intelligence` — node/edge explorer, lineage viewer, drift report, privacy audit
- `/admin/ai-governance` — prompt safety dashboard, budget tracker, tool policy viewer, audit log, governance reports
- `/admin/simulation-center` — scenario runner, dry-run executor, chaos orchestrator, twin manager, verification dashboard

Register routes in `AdminRoutes.tsx` with appropriate permission gates.

### Task 4: Update dependency matrix and docs

Update `docs/refactor/dependency-matrix.md`:
- Add rows for protocols, release, graph, ai, simulations
- Document that they are part of `shared` layer (zero dependencies on implementations)

Update `docs/refactor/protocol-ownership.md`:
- Add entries for the 7 newly bridged protocols

### Task 5: Strengthen CI boundary validation

Update `scripts/validation/check-no-runtime-in-shared.ts`:
- Add `src/packages/ai-contracts`, `src/packages/release-contracts`, `src/packages/graph-contracts`, `src/packages/simulation-contracts` to the scanned directories (currently only scans 5 hardcoded dirs)

Update `scripts/validation/check-protocol-purity.ts`:
- Extend to also scan all 4 new contract packages for purity

Add new check: `scripts/validation/check-engine-no-io.ts`:
- Verify engines in `src/lib/engines/` don't import from `@/integrations/supabase` or make network calls

### Task 6: TypeScript build verification

Full `tsc --noEmit` to confirm 0 errors.

---

## File Summary

| Category | New Files | Modified Files |
|----------|-----------|----------------|
| Hooks | 4 | 1 (useProtocolBridge.ts) |
| Protocol Bridge | 0 | 1 (protocol-bridge/index.ts) |
| Admin Pages | 4 | 1 (AdminRoutes.tsx) |
| CI Scripts | 1 | 2 (check-no-runtime, check-protocol-purity) |
| Docs | 0 | 2 (dependency-matrix, protocol-ownership) |
| Service barrel | 0 | 1 (services/index.ts) |
| **Total** | **9** | **8** |

