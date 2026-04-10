
# Phase 4 Admin Control Plane — Audit Results & Integration Plan

## Audit Findings

### What IS fully implemented
- **4 Shell components** — AdminShell, OwnerModeShell, OwnerWorkspaceShell, MissionOpsShell (all with TrustRibbon, RolloutStatusBanner, density toggle, breadcrumbs)
- **RolloutStatusBanner** — active rollout state, ring/environment, confidence, impacted surfaces
- **5 Summary Panels** — Revenue, Risk, Connector, Incident (with live Supabase query), Replay
- **Panel barrel export** — `src/components/admin/panels/index.ts` exists
- **Shell barrel export** — `src/components/admin/shells/index.ts` exists
- **AdminCommandPalette** — Cmd+K with fuzzy search, 20+ routes, actions — wired in App.tsx
- **AdminKeyboardShortcuts** — `?` overlay, `G+letter` nav — wired in App.tsx
- **3 Phase 4 Unification pages** — TrustStateRegistry (241 LOC, 4 tabs), ActionStateDriftViewer (159 LOC, 4 tabs), CrossDomainMemoryExplorer (207 LOC, 3 tabs) — all routed
- **ComputeGovernanceBoard** — 1026 LOC, 11 tabs (CG01-CG11 including Advisor Efficiency Matrix)
- **RevenueAutopilotMonitor** — 229 LOC, 6 tabs (Autopilot, Recovered Value, Saved Cost, Win-Back, Health, Proof)
- **InvestorProofLedger** — 217 LOC, 5 tabs (Ledger, Evidence Bundles, Migration Snapshots, Rollback Evidence, Compliance)
- **IntegrationConciergePage** — 201 LOC, 4 tabs (Discover, Recommendations, Workflow Composer, Simulations)
- **QuickActionsDock** — 12 actions, used in OwnerModePage

### What is MISSING — Not wired/integrated

**Critical gap: Shells and panels are orphaned.** They exist as components but are **never imported or used** by any page or route wrapper. This means:

1. **Shells not wrapping routes** — AdminShell, OwnerWorkspaceShell, MissionOpsShell are never used in App.tsx to wrap their respective route groups. Admin pages render without the unified shell chrome (TrustRibbon, RolloutStatusBanner, density toggle).

2. **Summary panels not consumed** — The 5 summary panels (Revenue, Risk, Connector, Incident, Replay) are never imported by MissionControlHome or any other page. They sit unused.

3. **MissionControlHome doesn't use panels** — Despite being the "main operator boardroom," it doesn't import or render any of the summary panels that were built for it.

---

## Implementation Plan

### Step 1 — Wire Summary Panels into MissionControlHome
Import and render all 5 summary panels (RevenueSummaryPanel, RiskSummaryPanel, ConnectorSummaryPanel, IncidentSummaryPanel, ReplaySummaryPanel) in the MissionControlHome page as a "Platform Pulse" grid section.

### Step 2 — Wrap Admin Routes with AdminShell in App.tsx
Wrap the admin route group in App.tsx with `<AdminShell>` so every admin page gets the unified chrome: TrustRibbon, RolloutStatusBanner, density toggle, and degraded-state banner. This replaces the bare `<Suspense>` wrapper for admin routes.

### Step 3 — Wrap Owner Routes with OwnerWorkspaceShell
For `/owner/*` routes, wrap with `<OwnerWorkspaceShell>` to provide the sidebar tabs (Home, Health, Pulse, Trust, AI Team, Revenue, Risks, Launches).

### Files Modified

| File | Change |
|---|---|
| `src/pages/admin/MissionControlHome.tsx` | Import and render 5 summary panels |
| `src/App.tsx` | Wrap admin routes with AdminShell, owner routes with OwnerWorkspaceShell |

No new files needed. No duplicates. All components already exist — this is pure integration wiring.
