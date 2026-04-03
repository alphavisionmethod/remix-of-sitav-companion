
# SITA OS — Full Product Experience & Implementation Blueprint

---

## 1. PRODUCT EXPERIENCE THESIS

SITA OS is a sovereign operating environment — one shell, one brain, one trust chain — for founders, families, and service businesses who need a calm, premium, AI-native command layer over their entire life and work.

**Emotional state it creates:** Relief. The feeling that someone competent is watching everything, nothing is falling through cracks, and every action is provable. Not excitement — *confidence*.

**What "premium" means:** Every pixel earns its space. No gratuitous decoration. Information density is intentional. Whitespace is structural. Typography carries hierarchy. Motion confirms, never distracts.

**What "calm" means:** The system never shouts. Urgency is conveyed through semantic color shifts and badge weight, not flashing alerts. The default state is quiet readiness.

**What "powerful without chaos" means:** 150+ routes exist, but the user sees 5 primary workspaces. Depth reveals itself through interaction, not upfront complexity. The sidebar shows only what matters for the user's role and installed packs.

**What "AI-native but human-friendly" means:** Advisors suggest, simulate, and draft — but proof, receipts, and approval gates are the source of truth. The human always sees *why* before *what happens*.

**What "trust-bearing beauty" means:** Verification badges, proof cards, confidence scores, and approval chains are not utility afterthoughts — they are first-class visual elements with their own design language, elevation, and motion.

---

## 2. VISUAL DESIGN SYSTEM

### 2A. Brand Color System (Already Implemented — Refine)

The current system uses SITA Purple (265°) + Gold (38°) + Trust Green (152°). This is correct and unique. Refinements:

| Token | HSL | Role |
|-------|-----|------|
| `--sita-purple` | 265 55% 58% | Primary brand, CTAs, active states |
| `--sita-purple-light` | 265 65% 68% | Hover, glow, selection |
| `--sita-purple-dark` | 265 50% 42% | Pressed, depth |
| `--sita-gold` | 38 85% 58% | Opportunity, accent, concierge domain |
| `--trust-safe` | 152 55% 48% | Verified, approved, healthy |
| `--urgency-critical` | 0 65% 52% | Failed, blocked, destructive |
| `--domain-business` | 265 55% 58% | Business workspace tint |
| `--domain-money` | 152 55% 48% | Money workspace tint |
| `--domain-concierge` | 38 85% 58% | Concierge workspace tint |
| `--domain-boardroom` | 215 55% 55% | Boardroom workspace tint |

**Already correct in `index.css`.** No changes needed to the palette. It is unique, premium, and not derivative.

### 2B. Typography (Already Implemented)

- Display: Space Grotesk — geometric, modern, premium
- Body: Inter — legible, professional
- Mono: JetBrains Mono — technical surfaces

### 2C. Spacing, Radius, Shadows, Motion

All defined in `packages/design-tokens`. Current values are correct. Key additions needed:

- **Glass treatment**: Already has `--glass-bg` and `--glass-border`. Apply to command palette, overlays, and companion bar.
- **Elevation hierarchy**: surface-0 (base) → surface-1 (card) → surface-2 (elevated card) → surface-3 (popover/panel). Already defined.
- **Motion language**: Already in `MOTION` tokens. Enforce: entry = slideUp, exit = fadeOut, state change = scaleIn, navigation = crossfade.

### 2D. Component Grammar Additions

Current primitives (`SitaCard`, `SitaMetric`, `KPITile`, `OpportunityCard`, `RiskCard`, `ProofCard`, `TrustBadge`, `StateBadge`) are solid. Missing:

| Component | Purpose | Package |
|-----------|---------|---------|
| `SitaLane` | Semantic content lane (action/opportunity/unresolved/changed) | `components/sita` |
| `ConfidenceBar` | Visual confidence score 0-100 with semantic color | `components/sita` |
| `ApprovalGate` | Inline approval widget with simulate/approve/reject | `components/sita` |
| `ProofReceipt` | Expandable proof artifact with verification badge | `components/sita` |
| `AdvisorAvatar` | Consistent advisor identity with status dot | `components/sita` |
| `BoardroomSlide` | Presentation-grade fullscreen content card | `components/sita` |
| `TimelineEvent` | Universal event with domain color, proof link, timestamp | `components/sita` |
| `DomainHeader` | Workspace header with domain color accent bar | `components/sita` |

---

## 3. GLOBAL SHELL / OS GRAMMAR

### Current State
- `ShellLayout` wraps all protected routes with `SitaTopBar` + `AppSidebar` + content area
- `SitaTopBar` has clock, notifications, display mode toggles, command palette, mission mode
- `AppSidebar` has 6 nav groups (main, intelligence, workspace, system, control, bottom)
- `CommandPalette`, `NotificationPanel`, `UniversalTimeline`, `InspectorPanel`, `AdvisorChat`, `KeyboardShortcuts` all present

### What Needs Refinement

**A. Sidebar Architecture** — Currently has too many visible items (25+ nav items). Fix:
- Show only 5 primary workspaces by default: Daily Pulse, Business, Money, Concierge, Files
- Collapse Intelligence, System, Control into a "More" expandable section
- Move Pack Store, Settings, Mission Control, Owner to sidebar footer icons only
- Respect `showBusinessNav()` and `showConciergeNav()` preferences (already coded)

**B. Right Contextual Rail** — Not yet implemented. Add:
- Slide-in panel triggered by clicking any entity (lead, invoice, task, etc.)
- Shows entity detail, proof chain, advisor notes, related items
- Reuse `InspectorPanel` concept but make it the standard detail surface

**C. Context Switcher** — Add household/org/entity context switching to top bar. Currently only has user profile. Needs:
- Dropdown showing current household/org context
- Switch between personal, family, business entity views
- Backed by `household-org-graph` service

**D. Display Modes** — Already implemented (calm/standard/focus/analyst/presentation). Add:
- **Boardroom mode**: Presentation frame, no chrome, fullscreen slides
- **Operator mode**: Mission Control variant with dense operational UI
- **Family mode**: Concierge-forward, warm accent, simplified nav

**E. Universal Timeline** — Already exists. Enhance with:
- Domain color-coded entries
- Proof links on every action
- "What changed since last session" summary at top
- Filterable by domain, type, urgency

---

## 4. APP-BY-APP DESIGN

### 4A. DAILY PULSE (/)

**Purpose:** The operating view. What matters right now.
**Current state:** Fully implemented with 604 lines, mission modes, KPI tiles, cross-domain intelligence, advisor cards, approvals, opportunities, proof, boardroom preview.
**What's needed:**
- Role-aware layout (founder sees business KPIs first, family user sees household first) — partially implemented via mission modes
- "What changed" section at top showing delta since last visit
- Approval queue inline (not just count badge)
- Boardroom prep card showing next scheduled review
- Quick actions row (add lead, pay bill, create task, upload file)

### 4B. BUSINESS CENTER (/business/*)

**Purpose:** CRM + revenue operations + client management
**Current state:** 15 sub-pages fully routed. BusinessCenter parent handles tab routing.
**Pages:** Overview, Leads, Customers, Opportunities, Quotes, Invoices, Collections, Revenue Autopilot, Communications, Boardroom, Proof
**Backend:** business-os service, projections, receipt-service
**What's needed:**
- Customer detail page with full timeline, health score, communication history, linked proof
- Lead aging detection with advisor suggestions
- Invoice follow-up automation with approval gates
- Revenue Autopilot workspace with playbook builder
- Business boardroom with weekly pipeline review template

**Primitives needed:**
- `LeadCard` — status, source, age, advisor suggestion
- `CustomerHealthBar` — composite score from engagement, revenue, recency
- `InvoiceRow` — amount, status, days outstanding, follow-up action
- `PipelineStage` — kanban column with drag-drop
- `QuoteBuilder` — line items, terms, approval flow

### 4C. MONEY CENTER (/money/*)

**Purpose:** Family office + financial command center
**Current state:** 12 sub-pages routed. MoneyCenter parent handles tabs.
**Pages:** Overview, Bills, Subscriptions, Reserves, Cash Timing, Receivables, Investment Office, Approvals, Proof, Documents, Boardroom
**Backend:** finance-os, sovereign-calculation, projections, receipt-service
**What's needed:**
- Safe-to-spend widget using deterministic calculation (sovereign-calculation service)
- Bill calendar with due-date countdown and auto-pay status
- Subscription waste detector with cancellation suggestions
- Reserve health with target vs actual visualization
- Cash timing waterfall chart
- Investment Office with regime/risk/thesis surfaces (later phase)

**Critical rule:** All money calculations MUST use `sovereign-calculation` service, never LLM approximation. Already architected correctly.

### 4D. CONCIERGE CENTER (/concierge/*)

**Purpose:** Household COO — family coordination, tasks, calendar, providers
**Current state:** 16 sub-pages routed. ConciergeCenter parent handles tabs.
**Pages:** Overview, Calendar, Tasks, School, Grocery, Appointments, Travel, Providers, Events/Gifts, Workflows, Proof, Files, Boardroom
**Backend:** concierge-os, projections, receipt-service
**What's needed:**
- Calendar reconciliation view (merge family calendars)
- Task delegation with household member assignment
- Grocery recurring list with provider integration
- Travel planning workspace with itinerary builder
- Provider management with rating, contact, service history
- Events/gifts relationship continuity tracker

### 4E. FILES CENTER (/files/*)

**Purpose:** Knowledge management, document intake, memory
**Current state:** 8 sub-pages (Overview, All, Processing, Review, Search, Memory Review, Sensitive, Settings)
**Backend:** memory-service, entity-graph, projections
**What's needed:**
- Universal intake box (drag-drop upload → processing queue)
- Classification review with suggested categories
- Entity extraction display (names, dates, amounts linked to graph)
- Linked entities graph view
- Obligation extraction (due dates, commitments found in documents)
- Privacy/retention/redaction controls
- Boardroom attachment linking

### 4F. PRODUCTIVITY HUB (/productivity/*, /docs, /sheets, /slides)

**Purpose:** AI-native docs, sheets, presentations
**Current state:** Hub page + 3 workspace pages (DocsWorkspace, SheetsWorkspace, SlidesWorkspace)
**What's needed:**
- Template library connected to `template-registry` package
- Version history with diff view
- Share/export with watermark options
- Proposal builder connected to business quotes
- Report generator connected to boardroom data
- Review/approval flow for shared documents

### 4G. ADVISOR COUNCIL (/advisors/*)

**Purpose:** Advisor transparency, simulation, comparison
**Current state:** AdvisorWorkspace + AdvisorRegistry. Sub-routes for overview, compare, simulations, approvals, proof, memory, individual advisor.
**Backend:** brain-core, advisor-config package, memory-service
**What's needed:**
- Single advisor workspace showing: what it sees, confidence level, reasoning, history
- Multi-advisor comparison view for same decision
- Simulation studio: "what if" scenarios with before/after projections
- Disagreement cards showing when advisors conflict
- Advisor memory transparency (what it remembers about you)
- Confidence ladder visualization

**Advisors defined in advisor-config:** Business, Money, Concierge, Family, Growth, Trust/Policy, Scenario, Opportunity, Recovery, Boardroom Meta

### 4H. MAIN GUIDE (SitaCompanionBar)

**Purpose:** OS conductor — orients, summarizes, routes
**Current state:** `SitaCompanionBar` component exists as floating companion
**What's needed:**
- Contextual awareness of current workspace
- Summary of "what matters now" in current context
- Quick routing suggestions
- Explanation mode for any visible element
- Workflow creation assistance
- Pack discovery suggestions
- Never replaces proof as truth — always defers to proof chain

### 4I. BOARDROOM (/boardroom/*)

**Purpose:** Executive review, weekly planning, decision memory
**Current state:** Boardroom page with sub-routes (business, finance, family, opportunity, morning, weekly, incidents)
**Backend:** boardroom-service, projections, memory-service
**Generated:** boardroom-template-index.json
**What's needed:**
- Template-driven review sessions (weekly business, weekly finance, monthly planning)
- Priorities → Risks → Unresolved → Opportunities → Actions flow
- Advisor tracks per domain
- Decision memory with carryover (what was decided last week, what's still open)
- Confidence ladder per decision
- Fullscreen presentation mode (uses `DisplayMode.presentation`)
- Replay mode (later phase)

### 4J. PROOF CENTER (/proof/*)

**Purpose:** Trust anchor — all receipts, verifications, rollbacks
**Current state:** ProofCenter with sub-routes (receipts, executions, verifications, rollbacks)
**Backend:** receipt-service, verification-engine
**Package:** proof-model
**What's needed:**
- Receipt stream with real-time updates
- Proof artifact detail view with full execution chain
- Verification state badges
- Rollback history with reason and recovery proof
- Domain-filtered views
- Export/audit trail generation

### 4K. APPROVAL CENTER (/approvals/*)

**Purpose:** Approval queue, simulation review, policy context
**Current state:** ApprovalsCenter with sub-routes (pending, simulated, history)
**Backend:** approval-engine, policy-engine
**What's needed:**
- Pending approvals with risk context and policy explanation
- Simulation preview before approval
- Batch approve/reject for low-risk items
- Approval history with proof links
- Escalation flow

### 4L. PACK STORE (/store/*)

**Purpose:** Install operating intelligence, not plugins
**Current state:** 6 pages (home, installed, analytics, detail, app detail, category)
**Backend:** capability-router, billing
**Packages:** pack-manifests, store-metadata, entitlements
**Generated:** capability-index.json, connector-catalog.json
**What's needed:**
- Featured packs curated by category (founders, families, service business, finance)
- Pack detail page with capabilities, trust requirements, pricing
- Trial mode with limited features
- Pack analytics showing usage and value
- Connector packs with integration status

### 4M. MISSION CONTROL (/mission-control/*, /owner/*)

**Purpose:** Internal AI workforce management, system health, cost oversight
**Current state:** MissionControlPage + OwnerCenter with extensive sub-routes (agents, incidents, connectors, workflows, costs, policies, releases, safe-mode, permissions, fleet, council, audit, trust-center, model-routing, diagnostics)
**Backend:** All internal services, internal-agent-config, self-healing-service, fleet-health, immune-controller
**What's needed:**
- Clear separation: customer advisors (advisor workspace) vs internal agents (mission control)
- Agent registry with status, last action, confidence, autonomy level
- Incident timeline with auto-healing proof
- Connector health dashboard
- Cost guardrail visualization
- Plain-language explanations for non-technical owners

### 4N. MOBILE TRUST COMPANION (/mobile/*)

**Purpose:** Continuity + trust surface, not full app clone
**Current state:** 9 mobile pages (home, approvals, proof, alerts, boardroom, workflow detail, receipt detail, approval detail, settings)
**What's needed:**
- Pulse summary (3-5 most important items)
- Quick approve/reject with biometric intent (later)
- Proof receipt viewer
- Alert stream with snooze
- Boardroom highlights (key decisions only)
- Minimal, card-based UI optimized for touch

---

## 5. DEVELOPMENT MODEL

### Architecture Law (Enforced)

All surfaces map into the three canonical domain modules:

| Frontend Workspace | Backend Service | Why |
|---|---|---|
| Business Center (CRM, leads, invoices, collections, revenue) | business-os | All business domain logic |
| Money Center (bills, reserves, cash, investments) | finance-os | All financial domain logic |
| Concierge Center (household, calendar, tasks, travel, providers) | concierge-os | All concierge domain logic |
| Files Center | memory-service + entity-graph | Knowledge is a platform capability |
| Boardroom | boardroom-service (reads projections from all 3 domains) | Cross-domain synthesis |
| Advisors | brain-core | Central intelligence |
| Proof/Approvals | receipt-service + approval-engine + verification-engine | Platform trust organs |
| Mission Control | All internal services | Platform operations |
| Pack Store | capability-router + billing | Platform commerce |
| Productivity | Thin surfaces consuming projections from domain services | No new backend |

**No new peer backend modules.** CRM capabilities live in business-os. Family capabilities live in concierge-os. Investment office lives in finance-os. Files live in memory-service.

### Frontend Development Approach

Each workspace page should:
1. Import from `packages/*` for types and contracts
2. Use `components/sita/*` for UI primitives
3. Use `hooks/use-sita-data` for data fetching
4. Use `lib/domain-engines/*` for client-side calculations
5. Use `lib/services/*` for service integration patterns
6. Reference `generated/*.json` for registries and manifests

### Package/Registry Integration Map

| Package | Consumed By |
|---------|------------|
| `packages/contracts` | All workspaces |
| `packages/business-contracts` | Business Center |
| `packages/finance-contracts` | Money Center |
| `packages/concierge-contracts` | Concierge Center |
| `packages/proof-model` | Proof Center, all proof displays |
| `packages/advisor-config` | Advisor workspace, companion bar |
| `packages/shell-grammar` | ShellLayout, all display modes |
| `packages/design-tokens` | All components |
| `packages/policy-contracts` | Approvals, Mission Control |
| `packages/event-types` | Timeline, activity stream |
| `packages/workflow-primitives` | Workflows Center |
| `packages/client-sdk` | All service calls |
| `packages/pack-manifests` | Pack Store |
| `packages/entitlements` | Feature gating |
| `packages/internal-agent-config` | Mission Control, Owner Center |

---

## 6. INTERNAL AI ENGINEERING WORKFORCE

Already defined: 40 agents across 6 councils with 7 supervisors in `internal-agent-config`.

Key agents and their frontend visibility in Mission Control:

| Agent | Council | What It Does | Max Autonomy | Visible In |
|-------|---------|-------------|--------------|------------|
| Reliability Agent | reliability-ops | Monitors uptime, triggers recovery | L6 (constrained action) | Incidents panel |
| Incident Triage | reliability-ops | Classifies and routes incidents | L4 (simulate) | Incidents panel |
| Connector Health | reliability-ops | Watches connector status | L6 | Connectors panel |
| Workflow Recovery | reliability-ops | Unsticks stuck workflows | L5 (approval ready) | Workflows panel |
| Cost Guardrail | runtime-cost | Monitors token spend, switches models | L6 | Costs panel |
| Security Watch | security-trust | Detects anomalies, enforces policy | L4 | Trust panel |
| Release Safety | security-trust | Validates deployments | L5 | Releases panel |
| Architecture Consistency | architecture-governance | Checks import boundaries, contracts | L2 (recommend) | Diagnostics |
| Knowledge/Runbook | knowledge-coordination | Updates docs, fills gaps | L3 (draft) | Knowledge panel |

All actions generate proof receipts. No agent may: delete user data, bypass approval chains, modify trust state without proof, or exceed its defined autonomy ceiling.

---

## 7. LAUNCH SEQUENCE

### NOW (Current Sprint)
1. **Visual polish pass** — Apply glass treatment to command palette, companion bar, overlays. Ensure consistent card elevation hierarchy.
2. **Sidebar refinement** — Collapse to 5 primary + expandable sections. Respect user preferences.
3. **Component additions** — Build `ConfidenceBar`, `ApprovalGate`, `ProofReceipt`, `AdvisorAvatar`, `DomainHeader`.
4. **Daily Pulse enhancement** — Add "what changed" section, inline approval queue, boardroom prep card.
5. **Proof Center depth** — Full receipt detail view with execution chain visualization.
6. **Boardroom templates** — Implement weekly business and weekly finance review templates.

### NEXT (Following Sprint)
7. **Business Center depth** — Customer detail timeline, lead aging, invoice follow-up automation.
8. **Money Center depth** — Safe-to-spend widget, bill calendar, subscription waste detector.
9. **Concierge depth** — Calendar reconciliation, task delegation, provider management.
10. **Advisor workspace depth** — Single advisor view, simulation studio, disagreement cards.
11. **Right contextual rail** — Entity detail slide-in panel.
12. **Context switcher** — Household/org switching in top bar.

### LATER
13. Files: Graph view, obligation extraction, privacy controls
14. Productivity: Template library, version history, report generator
15. Investment Office: Regime/risk/thesis surfaces
16. Mobile: Biometric approval, offline proof cache
17. Boardroom replay mode
18. Desktop app shell (Electron/Tauri)
19. Spatial/immersive surfaces

---

## 8. CONCRETE IMPLEMENTATION DIRECTIVE

Begin implementation now with Sprint NOW items 1-6. Priority order:

1. **Sidebar refinement** — Fastest UX impact, reduces cognitive load
2. **New components** (`ConfidenceBar`, `ApprovalGate`, `ProofReceipt`, `AdvisorAvatar`, `DomainHeader`) — Foundation for all workspace upgrades
3. **Daily Pulse enhancement** — Home screen is the first impression
4. **Visual polish pass** — Glass treatment, elevation consistency
5. **Proof Center depth** — Trust is the product's differentiator
6. **Boardroom templates** — Executive-grade presentation surfaces

All work stays within the existing architecture. No new backend services. No new packages. Just depth, polish, and premium execution of what's already correctly structured.
