

# SITA OS Admin Control Plane Phase 4 — Implementation Plan

## Audit Summary

After thorough codebase inspection, the admin control plane already has significant coverage:

**Already implemented (keeping):**
- ComputeGovernanceBoard (968 LOC, 10 tabs — fully advanced)
- IntegrationConciergePage (105 LOC — use-case-first connector setup)
- RevenueAutopilotMonitor (101 LOC — basic autopilot + win-back)
- InvestorProofLedger (96 LOC — proof chain + export)
- MemoryContinuityCenter (187 LOC — scoped memory with privacy tiers)
- ActionLineageExplorer (212 LOC — cross-domain action state)
- TrustRibbon component (exists, wired to hooks)
- QuickActionsDock component (exists, 12 actions)
- 5 summary panels in `src/components/admin/panels/` (Revenue, Risk, Connector, Incident, Replay)
- AdminCommandPalette + AdminKeyboardShortcuts (already wired)

**Missing — to be created:**

### A. Shell Components (4 new files)
1. **AdminShell** — Top-level admin container with TrustRibbon, RolloutStatusBanner, breadcrumbs, density toggle, degraded-state banner, error boundary
2. **OwnerModeShell** — Simplified founder-safe wrapper with plain-English labels, SafeModeBanner, large controls, protective defaults
3. **OwnerWorkspaceShell** — Rich owner workspace with sidebar tabs (home/health/pulse/trust/approvals/ai-team/revenue/risks), panel composition region
4. **MissionOpsShell** — Deep operational layout with left registry panel, center content, right detail pane, bottom action log

### B. RolloutStatusBanner (1 new component)
- Active rollout state, warning level, ring/environment, impacted surfaces, confidence

### C. Upgraded Existing Pages (4 pages need depth)

5. **RevenueAutopilotMonitor** — Upgrade from 101 → ~280 LOC: Add tabs for Recovered Value Board, Saved Cost Timeline, Revenue Action Proof, autopilot health/limits, confidence and proof for revenue recommendations
6. **InvestorProofLedger** — Upgrade from 96 → ~300 LOC: Add tabs for Evidence Bundle Composer, Migration Decision Snapshots, Rollback Evidence, Compliance Trail Explorer, exportable bundles
7. **IntegrationConciergePage** — Upgrade from 105 → ~250 LOC: Add tabs for Connector Recommendation Engine, Post-Connect Workflow Composer, Connection Simulation results, trust/approval gating
8. **ComputeGovernanceBoard** — Already 968 LOC with 10 tabs. Add Advisor Efficiency Matrix tab as CG11

### D. New Unification Pages (3 new pages)

9. **TrustStateRegistry** (`/admin/trust-state`) — Cross-domain trust observatory: proof state, approval/receipt link graph, global proof explorer, degraded-state map
10. **ActionStateDriftViewer** (`/admin/action-state`) — Cross-domain action lifecycle: noncanonical action detector, action-state drift, stuck action finder
11. **CrossDomainMemoryExplorer** (`/admin/cross-domain-memory`) — What Changed Across Domains timeline, Memory Scope Visualizer, cross-domain context links

### E. Route Wiring + Shell Integration
- Add 3 new routes in App.tsx
- Wrap admin routes with AdminShell (inject TrustRibbon + RolloutStatusBanner globally)
- Wrap `/owner/*` routes with OwnerWorkspaceShell
- Wrap `/mission/*` routes with MissionOpsShell

## Files Created/Modified

| File | Action | LOC |
|---|---|---|
| `src/components/admin/shells/AdminShell.tsx` | **NEW** | ~120 |
| `src/components/admin/shells/OwnerModeShell.tsx` | **NEW** | ~100 |
| `src/components/admin/shells/OwnerWorkspaceShell.tsx` | **NEW** | ~150 |
| `src/components/admin/shells/MissionOpsShell.tsx` | **NEW** | ~130 |
| `src/components/admin/shells/RolloutStatusBanner.tsx` | **NEW** | ~60 |
| `src/components/admin/shells/index.ts` | **NEW** | barrel |
| `src/pages/admin/TrustStateRegistry.tsx` | **NEW** | ~250 |
| `src/pages/admin/ActionStateDriftViewer.tsx` | **NEW** | ~230 |
| `src/pages/admin/CrossDomainMemoryExplorer.tsx` | **NEW** | ~220 |
| `src/pages/admin/RevenueAutopilotMonitor.tsx` | **UPGRADE** | ~280 |
| `src/pages/admin/InvestorProofLedger.tsx` | **UPGRADE** | ~300 |
| `src/pages/admin/IntegrationConciergePage.tsx` | **UPGRADE** | ~250 |
| `src/pages/admin/ComputeGovernanceBoard.tsx` | **ADD TAB** | +80 |
| `src/App.tsx` | **MODIFY** | +routes |

No duplicates. All new shells integrate existing TrustRibbon, QuickActionsDock, and panel system. Existing good implementations preserved and extended.

