

# SITA OS — Admin Backend: Three-Layer Architecture Implementation Plan

## Current State

The admin backend is already substantial:
- **OwnerCenter** (1883 lines, 18 tabs): Overview, Incidents, Intelligence, Policies, Fleet, Council, Audit, Workforce, Connectors, Costs, Trust, Releases, Model Routing, Knowledge, Support, Changes, Rollback, System Map
- **MissionControl** (1020+ lines, 12 tabs): Agents, Incidents, Connectors, Workflows, Costs, Policies, Releases, Permissions, Safe Mode, Activity Feed, Self-Healing, Trust
- **AdvisorCouncilDashboard**: Scorecards, Escalations, Handoffs, Budget

## What Is Missing

The user wants three distinct admin layers with specific gaps filled:

### Layer 1: Owner Mode (personal premium dashboard) — GAPS
1. **"What Matters Now" card** — not present; overview has KPIs but no prioritized "today's decisions" card
2. **Revenue summary card** — not on owner overview
3. **Risk summary card** — not on owner overview
4. **Platform maturity gauge** — not present
5. **Undo last admin change** — no undo mechanism exists
6. **Preview-before-publish mode** — not implemented
7. **Plain-English policy controls** — current policy editor uses raw JSON conditions
8. **One-click workflow enable/disable** — not on owner, only in automation center
9. **Pricing editor** — does not exist
10. **Pack editor** — store exists but no admin pack management
11. **Advisor configuration panel** — not in owner mode

### Layer 2: Mission Control (internal ops) — GAPS
Already strong. Missing:
1. **Correlation IDs** — not surfaced in incident or workflow views
2. **Environment controls** — no env switching (staging/prod)
3. **Support diagnostics export** — not implemented

### Layer 3: Enterprise/Family Office Control Plane — MISSING ENTIRELY
No dedicated enterprise admin surface exists. Needs:
1. **Org admin console** with team/member management
2. **Role and permission editor** (visual, not code)
3. **Trust environment dashboard**
4. **Compliance vault** (ISO/SOC/NIST attestation viewer)
5. **SLA panel**
6. **Deployment health** per org
7. **Fleet visibility** for enterprise

### UX Rule (applies to every control)
Every admin action card must show: what it changes, risk level, what happens next, how to undo, what proof is logged. This is not currently implemented for any controls.

---

## Implementation Plan

### Task 1: Owner Mode — "What Matters Now" Hero Redesign

Replace the current Owner overview with a premium personal cockpit:

**File:** `src/pages/OwnerCenter.tsx` — rewrite the `activePage === "overview"` section

New layout:
- **What Matters Now** — a prioritized list of 3-5 decisions needing owner attention, pulled from incidents, pending council votes, budget alerts, and connector issues. Each item shows: plain-English summary, risk badge, one-click action, and "what happens if I ignore this"
- **Revenue/Risk/AI Spend** — three hero metric cards in a row with sparkline trends
- **Platform Maturity** — circular gauge (0-100) computed from: test coverage, agent health, connector coverage, policy completeness
- **Safe Mode switch** — prominent toggle with confirmation dialog that explains consequences
- **Undo Last Admin Change** — button that queries the most recent audit log entry with `actor = owner` and offers to reverse it

### Task 2: Plain-English Policy Editor

**File:** `src/components/sita/PlainEnglishPolicyEditor.tsx`

Replace the raw JSON policy editor with a natural-language builder:
- Sentence-based rules: "When [domain] action [verb] exceeds [amount], require [approval/deny/flag]"
- Dropdown selectors for domain, action type, threshold type
- Visual preview of what the policy does
- "Test this policy" button (uses existing policy simulator)
- Shows: what this changes, risk it carries, how to undo, proof that will be logged

### Task 3: Admin Action Card Wrapper

**File:** `src/components/sita/AdminActionCard.tsx`

A reusable wrapper component that wraps every owner/admin control with:
- `whatChanges: string` — plain-English description
- `riskLevel: "low" | "medium" | "high" | "critical"` — color-coded badge
- `whatHappensNext: string` — consequence preview
- `undoAction?: () => void` — undo handler
- `proofNote: string` — what will be logged
- Confirmation dialog with all five fields visible before execution
- Apply this wrapper to: Safe Mode toggle, Policy create/edit, Agent pause/resume, Connector disable, Workflow toggle

### Task 4: Pricing & Pack Editor

**File:** `src/pages/owner/PricingEditor.tsx`

Simple pricing management:
- Service/product list with price, currency, billing cycle
- Edit inline with preview-before-save
- Change history with undo
- AdminActionCard wrapper on every save

**File:** `src/pages/owner/PackEditor.tsx`

Pack management for installed packs:
- Pack list with status (active/paused/disabled)
- Toggle switches with AdminActionCard confirmation
- Pack dependency visualization
- Install/uninstall with preview of what changes

### Task 5: Advisor Configuration Panel

**File:** `src/pages/owner/AdvisorConfig.tsx`

Visual configuration for the 26 advisors:
- Per-advisor: name, prominence level (primary/supporting/hidden), autonomy ceiling, allowed domains
- Toggle advisor on/off per mission mode
- Plain-English description of what each advisor does
- "Preview" mode to see how a change affects daily pulse recommendations

### Task 6: Enterprise / Family Office Control Plane

**File:** `src/pages/enterprise/EnterpriseControlPlane.tsx`

New top-level page with tabs:

1. **Organization** — team members, invite flow, role assignment (using existing user_roles pattern)
2. **Roles & Permissions** — visual matrix editor: role × capability grid with toggle switches
3. **Trust Environment** — trust scores per member, permission drift alerts, anomaly timeline
4. **Compliance Vault** — ISO 27001, SOC 2, NIST checklist with attestation status and evidence links
5. **SLA Dashboard** — uptime, response time, resolution time vs targets
6. **Deployment Health** — per-environment status (staging/production), recent deploys, rollback options
7. **Fleet Overview** — org-wide device/service fleet with health aggregation

### Task 7: Route Registration & Navigation

**File:** `src/App.tsx` — add routes:
- `/owner/pricing` → PricingEditor
- `/owner/packs` → PackEditor  
- `/owner/advisors` → AdvisorConfig
- `/enterprise` → EnterpriseControlPlane
- `/enterprise/roles`, `/enterprise/compliance`, `/enterprise/sla`, `/enterprise/fleet`

**File:** `src/components/sita/AppSidebar.tsx` — add Enterprise section under Control group

### Task 8: Mission Control Enhancements

**File:** `src/pages/mission-control/MissionControlPage.tsx`

Add to existing tabs:
- **Correlation IDs** in incident and workflow cards — display as monospace badges, clickable to filter all related events
- **Environment selector** — staging/production toggle in top bar affecting which data is displayed
- **Diagnostics Export** — button that bundles: last 24h incidents, agent telemetry, connector health, audit logs into a downloadable JSON (sanitized of secrets)

---

## Implementation Order

1. AdminActionCard wrapper (foundation — used by everything else)
2. Owner Mode overview redesign (highest UX impact)
3. Plain-English Policy Editor (replaces JSON editor)
4. Pricing & Pack editors (fills obvious gap)
5. Advisor Configuration panel (connects to existing advisor system)
6. Enterprise Control Plane (new surface)
7. Mission Control enhancements (incremental)
8. Route registration & sidebar updates (final wiring)

## Technical Notes

- All new pages use existing `SitaCard`, `SitaPageHeader`, `KPITile`, `glass-panel` primitives
- Enterprise control plane reuses existing `useAdminIncidents`, `useFleetHealth`, `useAdminAuditLogs` hooks
- Pricing/Pack editors use Supabase tables (new migration for `pricing_items` and `pack_configs`)
- Every admin action generates an audit log entry via existing audit infrastructure
- No new backend services needed — all data comes from existing hooks, edge functions, and demo data fallbacks

