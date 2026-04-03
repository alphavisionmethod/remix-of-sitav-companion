

# SITA OS — Full Product Experience & Implementation Blueprint

---

## 1. PRODUCT EXPERIENCE THESIS

SITA OS is a sovereign operating environment — one shell, one brain, one trust chain — for founders, families, and service businesses who need a calm, premium, AI-native command layer over their entire life and work.

**Emotional state it creates:** Relief. The feeling that someone competent is watching everything, nothing is falling through cracks, and every action is provable. Not excitement — *confidence*.

**What "premium" means:** Every pixel earns its space. No gratuitous decoration. Information density is intentional. Whitespace is structural. Typography carries hierarchy. Motion confirms, never distracts.

**What "calm" means:** The system never shouts. Urgency is conveyed through semantic color shifts and badge weight, not flashing alerts. The default state is quiet readiness.

**What "powerful without chaos" means:** 150+ routes exist, but the user sees 5 primary workspaces. Depth reveals itself through interaction, not upfront complexity.

**What "AI-native but human-friendly" means:** Advisors suggest, simulate, and draft — but proof, receipts, and approval gates are the source of truth. The human always sees *why* before *what happens*.

**What "trust-bearing beauty" means:** Verification badges, proof cards, confidence scores, and approval chains are first-class visual elements with their own design language, elevation, and motion.

---

## 2. VISUAL DESIGN SYSTEM

### Brand Color System (Already Correct)

| Token | HSL | Role |
|-------|-----|------|
| `--sita-purple` | 265 55% 58% | Primary brand, CTAs, active states |
| `--sita-gold` | 38 85% 58% | Opportunity, accent, concierge domain |
| `--trust-safe` | 152 55% 48% | Verified, approved, healthy |
| `--urgency-critical` | 0 65% 52% | Failed, blocked, destructive |

Surface layers (0-3), glass treatment, shadow system, domain accent colors — all already defined in `index.css`. No palette changes needed. Typography (Space Grotesk display, Inter body, JetBrains Mono) is correct. Motion tokens in `design-tokens` are correct.

### New Component Primitives Needed

| Component | Purpose |
|-----------|---------|
| `ConfidenceBar` | Visual 0-100 score with semantic color gradient |
| `ApprovalGate` | Inline simulate/approve/reject widget |
| `ProofReceipt` | Expandable proof artifact with verification badge |
| `AdvisorAvatar` | Advisor identity with status indicator |
| `BoardroomSlide` | Fullscreen presentation-grade content card |
| `DomainHeader` | Workspace header with domain color accent bar |

---

## 3. GLOBAL SHELL REFINEMENTS

### Sidebar (AppSidebar) — Reduce Cognitive Load
- Show 5 primary items by default: Daily Pulse, Business, Money, Concierge, Files
- Collapse Intelligence (Advisors, Inbox, Activity, Opportunities, Approvals) into expandable group
- Collapse System (Workflows, Proof, Boardroom) into expandable group
- Collapse Control (Personalization, Memory, Automation, System) into expandable group
- Keep footer icons: Pack Store, Settings, Mission Control

### Right Contextual Rail — New
- Slide-in panel for entity detail (lead, invoice, task, etc.)
- Shows proof chain, advisor notes, related items
- Extends existing `InspectorPanel` concept

### Context Switcher — New
- Household/org/entity dropdown in top bar
- Switch between personal, family, business entity views

### Display Mode Additions
- **Boardroom mode**: No chrome, fullscreen presentation slides
- **Operator mode**: Dense Mission Control variant
- **Family mode**: Concierge-forward, warm accent

---

## 4. APP-BY-APP DESIGN

### 4A. DAILY PULSE (/) — Enhance
Already 604 lines with mission modes, KPIs, cross-domain intelligence. Add:
- "What changed since last visit" delta section at top
- Inline approval queue (not just badge count)
- Boardroom prep card (next scheduled review)
- Quick actions row (add lead, pay bill, create task, upload file)

### 4B. BUSINESS CENTER (/business/*) — Deepen
15 sub-pages routed. Needs:
- Customer detail with full timeline + health score + communication history
- Lead aging detection with advisor suggestions
- Invoice follow-up automation with approval gates
- Pipeline kanban with drag-drop stages
- Revenue Autopilot playbook builder

### 4C. MONEY CENTER (/money/*) — Deepen
12 sub-pages routed. Needs:
- Safe-to-spend widget (deterministic via sovereign-calculation)
- Bill calendar with countdown and auto-pay status
- Subscription waste detector with cancellation suggestions
- Reserve health visualization (target vs actual)
- Cash timing waterfall chart

### 4D. CONCIERGE CENTER (/concierge/*) — Deepen
16 sub-pages routed. Needs:
- Calendar reconciliation (merge family calendars)
- Task delegation with household member assignment
- Provider management with service history
- Travel itinerary builder
- Events/gifts relationship continuity tracker

### 4E. FILES CENTER (/files/*) — Deepen
8 sub-pages. Needs:
- Universal drag-drop intake box
- Entity extraction display (linked to entity-graph)
- Obligation extraction (due dates from documents)
- Privacy/retention controls
- Graph view of linked entities

### 4F. PRODUCTIVITY HUB — Deepen
Hub + 3 workspaces. Needs:
- Template library from template-registry
- Version history with diff
- Proposal builder connected to business quotes
- Review/approval flow

### 4G. ADVISOR COUNCIL (/advisors/*) — Deepen
AdvisorWorkspace with 7 sub-routes. Needs:
- Single advisor view: what it sees, confidence, reasoning, history
- Multi-advisor comparison for same decision
- Simulation studio with before/after projections
- Disagreement cards when advisors conflict
- Confidence ladder visualization

### 4H. MAIN GUIDE (SitaCompanionBar) — Enhance
Exists as floating companion. Needs:
- Context-aware workspace summaries
- Quick routing suggestions
- Workflow creation assistant
- Never replaces proof as truth

### 4I. BOARDROOM (/boardroom/*) — Deepen
7 sub-routes. Needs:
- Template-driven reviews (weekly business, weekly finance, monthly planning)
- Priorities → Risks → Unresolved → Opportunities → Actions flow
- Decision memory with carryover
- Confidence ladder per decision
- Fullscreen presentation mode
- Advisor disagreement cards

### 4J. PROOF CENTER (/proof/*) — Deepen
4 sub-routes. Needs:
- Real-time receipt stream
- Full execution chain visualization
- Verification state badges
- Rollback history with recovery proof
- Export/audit trail

### 4K. APPROVAL CENTER (/approvals/*) — Deepen
3 sub-routes. Needs:
- Risk context and policy explanation per approval
- Simulation preview before approve
- Batch approve for low-risk items
- Escalation flow

### 4L. PACK STORE (/store/*) — Deepen
6 pages. Needs:
- Featured packs by category
- Trust requirement display
- Trial mode
- Usage analytics

### 4M. MISSION CONTROL (/mission-control/*, /owner/*) — Polish
Extensive sub-routes exist. Needs:
- Clear advisor vs internal agent separation
- Agent status dashboard with confidence + autonomy level
- Incident auto-healing proof timeline
- Cost guardrail visualization
- Plain-language mode for non-technical owners

### 4N. MOBILE COMPANION (/mobile/*) — Continuity Surface
9 pages exist. Needs:
- 3-5 item pulse summary
- Quick approve/reject
- Proof receipt viewer
- Card-based touch-optimized UI

---

## 5. DEVELOPMENT MODEL

### Architecture Law

| Frontend Workspace | Backend Service |
|---|---|
| Business Center | business-os |
| Money Center | finance-os |
| Concierge Center | concierge-os |
| Files Center | memory-service + entity-graph |
| Boardroom | boardroom-service (reads projections) |
| Advisors | brain-core |
| Proof/Approvals | receipt-service + approval-engine |
| Mission Control | All internal services |
| Pack Store | capability-router + billing |
| Productivity | Thin surfaces on projections |

No new peer backend modules. CRM = business-os. Family = concierge-os. Investments = finance-os.

---

## 6. LAUNCH SEQUENCE

### NOW (Sprint 1)
1. Sidebar refinement — collapse to 5 primary + expandable
2. New components (ConfidenceBar, ApprovalGate, ProofReceipt, AdvisorAvatar, DomainHeader)
3. Daily Pulse enhancement — "what changed", inline approvals, boardroom prep
4. Visual polish — glass treatment on overlays, elevation consistency
5. Proof Center depth — receipt detail with execution chain
6. Boardroom templates — weekly business + finance reviews

### NEXT (Sprint 2)
7. Business Center depth — customer timeline, lead aging, invoice automation
8. Money Center depth — safe-to-spend, bill calendar, waste detector
9. Concierge depth — calendar reconciliation, task delegation
10. Advisor workspace — single advisor view, simulation studio
11. Right contextual rail
12. Context switcher

### LATER
13. Files graph view, obligation extraction
14. Productivity template library, version history
15. Investment Office surfaces
16. Mobile biometric approval
17. Boardroom replay mode
18. Desktop/spatial surfaces

---

## 7. IMPLEMENTATION DIRECTIVE

Begin with Sprint 1, items 1-6, in this priority order:
1. Sidebar refinement (fastest UX impact)
2. New component primitives (foundation for everything else)
3. Daily Pulse enhancement (first impression)
4. Visual polish pass (premium feel)
5. Proof Center depth (trust differentiator)
6. Boardroom templates (executive-grade)

All work stays within existing architecture. No new backend services. No new packages. Depth, polish, and premium execution of what's correctly structured.

