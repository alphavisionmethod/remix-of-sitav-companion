

# Founder / Admin AI Control Dashboard — Implementation Plan

## Current State Assessment

The codebase already has significant foundation:
- **Founder Orchestrator** (`src/lib/services/founder-orchestrator/index.ts`): Full directive parsing, task decomposition, agent routing, execution plans, cost snapshots, runbooks — 422 lines of real logic, not stubs.
- **FCC01–FCC12 Pages**: Command console, task graph, CI/CD, runbooks, dashboard, programs, cost, sync/storage ops, security, oversight, incidents, knowledge — all exist with real UI.
- **SRE01–SRE08 Pages**: Validation, builder-critic, simulation, standards, chaos, rollback, version intel, optimization — all exist.
- **AdminShell**: Minimal — just a density toggle and trust ribbon. No sidebar, no command bar, no right panel.
- **AdminCommandPalette**: Exists but is a Cmd+K popup, not the always-visible command bar the prompt requires.
- **No unified founder shell** with the 3-panel layout (sidebar + main + right AI panel) described in the prompt.

## What's Missing (Gap Analysis)

1. **Unified Founder Control Shell** — The 3-panel layout (left sidebar, main content, right AI transparency panel) doesn't exist. Pages render inside the generic AdminShell which is just content + a thin utility bar.
2. **Always-Visible Global Command Bar** — No persistent top command bar. Current command input is buried inside FCC01.
3. **Left Sidebar Navigation** — No dedicated admin/founder sidebar with the 18 module sections listed in the prompt.
4. **Right AI Transparency Panel** — No persistent right panel showing live AI reasoning, active tasks, confidence, progress.
5. **Unified Home Dashboard** — MissionControlHome exists but doesn't match the prompt's design (health score + activity feed + AI suggestions + quick actions as described).
6. **Module gap pages** — Several modules from the prompt don't have dedicated pages yet:
   - **Devices** (fleet-level device management with trust/mesh/revoke)
   - **Storage** (blob health, orphans, lifecycle, quota drift)
   - **Users** (platform-level user management with segments, trust history)
   - **Trust & Security** (unified threat view)
   - **Workspaces & Continuity** (restore success, cross-device handoff)
   - **Releases & Updates** (canary control, rollout curve)
   - **AI Control** (unified agent + cost + model router + review conflicts)
   - **Incidents** (severity timeline + mitigations + postmortem)
   - **Logs & Audit** (correlated audit explorer)
   - **Policies & Flags** (dry-run, blast radius preview)
   - **Costs & AI Budgets** (unified cost dashboard)
   - **Jobs & Maintenance** (job queues, stuck jobs, dead letters)
   - **Support** (case queue, diagnostic bundles, safe repair)
   - **Knowledge Base** (living memory, runbooks, AI retrieval)
7. **One-Click Strategic Actions** — Template cards for "Reliability Sprint", "Security Sweep" etc.
8. **Safety UX** — Confirmation dialogs with risk preview, blast radius, rollback availability.
9. **History/Timeline** — Command → plan → execution → outcome timeline view.
10. **Mobile Responsive** — Not addressed for the founder shell.

## Implementation Plan (7 Batches)

### Batch 1: Founder Control Shell (Core Layout)
Build the unified 3-panel shell that wraps all `/admin/*` routes.

**Files to create:**
- `src/components/admin/shells/FounderControlShell.tsx` — The master layout with:
  - Top Global Command Bar (always visible, large input, autocomplete, command history)
  - Left sidebar (collapsible, 18 module groups, alert badges, environment badge)
  - Main content area (renders children/Outlet)
  - Right AI Transparency Panel (collapsible, shows active tasks, reasoning, confidence)
- `src/components/admin/shells/GlobalCommandBar.tsx` — Command bar component with intent parsing, plan preview cards, action buttons (Approve/Edit/Simulate/Cancel)
- `src/components/admin/shells/FounderSidebar.tsx` — 18-section sidebar with icons, badges, keyboard nav, favorites
- `src/components/admin/shells/AITransparencyPanel.tsx` — Right panel showing active AI tasks, reasoning trace, progress, confidence, risk, summary/detailed modes

**Files to modify:**
- `src/App.tsx` — Replace `AdminShellLayout` with `FounderControlShell`
- `src/components/admin/shells/index.ts` — Re-export new shell

### Batch 2: Home Dashboard (Complete Redesign)
Replace or heavily enhance `MissionControlHome.tsx` to match the prompt's dashboard spec.

**Enhance `src/pages/admin/MissionControlHome.tsx`:**
- Platform Health Summary hero (score gauge, sync, security, incidents, release readiness, AI cost efficiency)
- Live Activity Feed (real-time events from audit_events, formatted as timeline)
- AI Suggestions Panel (strategic recommendations with Explain/Simulate/Apply/Dismiss actions)
- Quick Action Cards (one-click strategic templates)
- Pending Approvals strip
- Active Objectives strip

### Batch 3: Module Pages — System Operations (6 pages)
Create the missing module pages that don't exist yet.

**Create:**
- `src/pages/admin/modules/MCDevicesCenter.tsx` — Fleet device management (trust, revoke, mesh, update eligibility)
- `src/pages/admin/modules/MCStorageCenter.tsx` — Blob/object storage health (orphans, lifecycle, quota drift, reconciliation)
- `src/pages/admin/modules/MCUsersCenter.tsx` — Platform user management (search, segments, plan, trust, support timeline)
- `src/pages/admin/modules/MCWorkspacesContinuity.tsx` — Workspace adoption, restore success, cross-device handoff
- `src/pages/admin/modules/MCSyncCloud.tsx` — Sync health, conflicts, repair tools (consolidate/enhance FCC08)
- `src/pages/admin/modules/MCJobsMaintenance.tsx` — Background jobs, queues, retries, stuck jobs, dead letter

### Batch 4: Module Pages — Governance & Intelligence (6 pages)
**Create:**
- `src/pages/admin/modules/MCTrustSecurity.tsx` — Unified trust/risk/security oversight with threat level, trust trends, blocked actions
- `src/pages/admin/modules/MCReleasesUpdates.tsx` — Canary control, rollout curves, crash delta, rollback, release scores
- `src/pages/admin/modules/MCAIControl.tsx` — Unified AI control: active agents, cost, model router, review conflicts, escalations
- `src/pages/admin/modules/MCIncidents.tsx` — Incident response: severity, timeline, mitigations, postmortem, runbook links
- `src/pages/admin/modules/MCPoliciesFlags.tsx` — Policy bundles, dry-run simulation, blast radius, staged changes
- `src/pages/admin/modules/MCCostsAIBudgets.tsx` — AI cost by feature, token trends, local vs cloud, cache hits, forecasts

### Batch 5: Module Pages — Support & Knowledge (4 pages)
**Create:**
- `src/pages/admin/modules/MCLogsAudit.tsx` — Structured audit explorer with correlation, filtering, linked explanations
- `src/pages/admin/modules/MCSupport.tsx` — Support case queue, diagnostic bundles, safe repair, escalation
- `src/pages/admin/modules/MCKnowledgeBase.tsx` — Living memory: architecture docs, runbooks, incident lessons, AI retrieval
- `src/pages/admin/modules/MCSystemHealth.tsx` — Full subsystem health cards with scores, trends, drill-downs

### Batch 6: Strategic Features & Safety UX
**Create:**
- `src/components/admin/shells/CommandTemplateCards.tsx` — Prebuilt strategic templates: Reliability Sprint, Security Sweep, Release Preparation, Cost Reduction, etc.
- `src/components/admin/shells/SafetyConfirmDialog.tsx` — Risk-aware confirmation: what changes, who's affected, risk level, rollback availability, safer alternatives
- `src/components/admin/shells/ExecutionTimeline.tsx` — Beautiful command → plan → execution → outcome timeline
- `src/components/admin/shells/OneClickActions.tsx` — Quick action grid wired to founderOrchestrator
- `src/components/admin/shells/SimulationPreview.tsx` — "What if" simulation preview cards

### Batch 7: Route Wiring, Mobile Responsive, Polish
**Modify:**
- `src/routes/AdminRoutes.tsx` — Register all new MC module routes
- `src/components/admin/AdminCommandPalette.tsx` — Update with new module paths
- `src/components/admin/shells/FounderControlShell.tsx` — Add mobile responsive breakpoints (collapsible sidebar, stacked layout, touch-friendly command bar)

**Create:**
- `src/components/admin/shells/FounderMobileNav.tsx` — Mobile bottom nav for founder shell (health, command, approvals, incidents)

## Technical Approach

- All new pages follow existing glassmorphic dark-first design tokens
- All module pages use `useAuth().isDemo` for reality mode, never hardcoded
- All routes wrapped with `gated()` permission checks
- Data fetches use `fromTable()` + `useQuery` pattern already established
- AI transparency panel consumes `founderOrchestrator` state + audit_events
- Command bar integrates with existing `founderOrchestrator.parseDirective()` and `decomposeToTaskGraph()`
- No new database tables needed — leverages existing `incidents`, `approval_queue`, `audit_events`, etc.
- No stubs — every component renders meaningful UI with demo data fallback via `isDemo`

## Design Language
- Glass panels: `bg-white/[0.03] backdrop-blur-xl border-white/[0.06]`
- Premium spacing, calm transitions, `framer-motion` fade-ups
- Color: green=healthy, yellow=warning, red=critical, blue=action, purple=AI
- Dense data behind expandable sections, plain language by default
- "Why am I seeing this?" tooltips on AI suggestions

