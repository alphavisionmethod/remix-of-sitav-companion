

# SITA OS — Complete Wiring Audit

## Project Scale (Updated)

| Metric | Count |
|--------|-------|
| Routes in App.tsx | 749 |
| Lazy imports | 554 |
| Page files | 697 (including sub-components & tests) |
| Services | 178 |
| Engines | 23 |
| Edge Functions | 51 |
| Database Migrations | 116 |
| Registered Capabilities | 142 |
| TypeScript Errors | **0** |
| Dangling references | **0** |

---

## Already Wired & Verified (No Action Needed)

- All 554 lazy imports resolve to existing files
- All edge functions are referenced from frontend code
- All page files are referenced by at least one other file (no truly orphaned pages)
- `AdminShell`, `OwnerWorkspaceShell`, `RevenueOfficeModeProvider` all correctly wrapping routes
- `PlatformInit` mounted in App.tsx (Electron bridge + offline sync)
- `SitaKernelProvider`, `OSRuntimeProvider`, `AppPlatformProvider` all mounted in App.tsx
- 4 services wired to UI in previous session: anomaly-alert, fraud-sentinel, client-sentiment, competitive-intelligence
- Sidebar now has Digital Presence, ATLAS, App Platform, Investment Office links
- Deleted shells (`MissionOpsShell`, `OwnerModeShell`) have zero dangling references
- Zero TypeScript errors

---

## What's Still Unwired

### Gap 1 — 171 Services Never Imported by Pages/Components

All 178 services in `src/lib/services/` are unused by pages/components except for 7:
- `anomaly-alert` → IncidentCommandCenter
- `fraud-sentinel` → RiskSummaryPanel
- `client-sentiment` → RelationshipCenter
- `competitive-intelligence` → GrowthBoardroom
- `finance-os/investment-memory.service` → 3 investment pages
- `setup` → OSSetupExperience

**However**: Per the project's own architecture rule (`services/index.ts` comments), pages SHOULD NOT import services directly — they should use `engines/` or `hooks/`. The 7 current direct imports technically violate this rule. The remaining 171 are backend-ready infrastructure.

**Recommendation**: This is **by design**. Services are meant to be consumed via engines and hooks, not pages. No wiring needed now. When production data flows are built, services will be wired through the engine/hook layer.

### Gap 2 — 18 of 23 Engines Never Used by Pages/Components

These engines exist but are not consumed:

| Engine | Natural Consumer |
|--------|-----------------|
| `action-state-machine` | Workflow pages |
| `advisor-orchestration` | Advisor workspace |
| `delegation-engine` | Task delegation UI |
| `enterprise-maturity` | EnterpriseMaturityDashboard (has its own inline logic) |
| `execution-debt-engine` | Proof/receipt pages |
| `founder-bottleneck-engine` | Owner dashboard |
| `invisible-labor-engine` | AI Economics |
| `memory-governance` | Memory management pages |
| `meta-governance-engine` | Governance pages |
| `policy-depth-engine` | Policy simulator |
| `replay-recovery` | Workflow replay |
| `revenue-opportunity` | Revenue Office |
| `setup-phase-definitions` | Onboarding |
| `token-governance` | AI token budget pages |
| `trust-debt-engine` | Trust/governance pages |
| `workspace-view-engine` | Workspace pages |
| `drag-engine` | Drag-and-drop UI |
| `entity-role-graph` | Entity management |

**Recommendation**: Wire the **5 highest-impact** engines to their natural pages.

### Gap 3 — 4 Unused Hooks

| Hook | Purpose |
|------|---------|
| `use-kernel-mutation` | Wraps writes through canonical execution chain |
| `use-kernel-query` | Routes reads through kernel projection layer |
| `use-optimistic-mutation` | Optimistic UI mutation pattern |
| `use-revenue-memory` | Revenue memory domain queries |

**Recommendation**: `use-kernel-mutation` and `use-kernel-query` are the canonical data hooks — they should be adopted by admin/mission pages that currently use raw Supabase or demo data. `use-revenue-memory` should be wired to Revenue Office pages.

### Gap 4 — `useConnectivity` Provider Mounted but Never Consumed

`ConnectivityProvider` wraps the entire app in `App.tsx`, but `useConnectivity()` is never called in any page or component (only in tests). This means offline state is tracked but never surfaced to users.

**Recommendation**: Wire `useConnectivity` into the main layout to show an offline banner when `isOnline === false`.

### Gap 5 — Only 28 of ~590 Pages Query Supabase

~260 pages use hardcoded demo data. This is architectural by design (demo mode). No action needed for MVP.

### Gap 6 — Only ~16 Pages Use `useOSRuntime`

The kernel/runtime is wired for admin and observability pages. The remaining ~574 pages operate independently. This is expected — kernel adoption is a Phase 5+ effort.

---

## Implementation Plan

### Step 1 — Wire 5 High-Impact Engines to Pages
Connect engines that have clear, existing page consumers:
- `founder-bottleneck-engine` → Owner Home dashboard
- `revenue-opportunity` → Revenue Office GrowthBoardroom
- `trust-debt-engine` → Owner Trust Center
- `token-governance` → AI Economics page
- `replay-recovery` → Workflow Replay Hub

### Step 2 — Wire Unused Hooks
- `use-revenue-memory` → Revenue Office pages (Boardroom, Pipeline)
- `use-kernel-query` → Mission Control (replace raw demo reads)

### Step 3 — Surface Offline State
- Create an `OfflineBanner` component
- Wire `useConnectivity()` in the main layout
- Show a toast/banner when `isOnline` flips to false

### Files Modified

| File | Change |
|------|--------|
| `src/pages/owner/OwnerHome.tsx` | Import + render founder-bottleneck-engine data |
| `src/pages/revenue-office/GrowthBoardroom.tsx` | Import revenue-opportunity engine |
| `src/pages/owner/TrustCenter.tsx` | Import trust-debt-engine |
| `src/pages/AIEconomicsPage.tsx` | Import token-governance engine |
| `src/pages/WorkflowReplayHub.tsx` | Import replay-recovery engine |
| `src/pages/revenue-office/RevenueBoardroom.tsx` | Use `use-revenue-memory` hook |
| `src/components/sita/OfflineBanner.tsx` | **New** — offline indicator |
| `src/layouts/AppLayout.tsx` or equivalent | Wire `useConnectivity` + `OfflineBanner` |

### What NOT to Do
- Do NOT wire all 171 services directly to pages — architecture says use engines/hooks
- Do NOT wire all 18 engines — focus on the 5 with clear page consumers
- Do NOT expand `useOSRuntime` to all pages — Phase 5+ effort
- Do NOT migrate 260 demo-data pages to Supabase — demo mode is intentional

