

# Revenue Office — Automation Operating System Enhancement Plan

## Current State

The Revenue Office has **39 pages, ~7,500 LOC**, with a full 7-page Automation suite already implemented:

| Page | LOC | Coverage |
|------|:---:|----------|
| AutomationOffice | 307 | Boardroom, 4-level trust, stats, active/at-risk/advisors/leaks/stages tabs |
| AutomationBuilder | 244 | Visual node editor, 13-node sample flow, trust selector, node palette, advisor preview |
| AutomationSimLab | 232 | Full simulation with audience, steps, risks, edge cases, policy checks |
| AutomationPolicy | 216 | Trust levels, escalation rules, compliance, human-vs-AI, audit log |
| AutomationHealth | 145 | Health metrics, advisor insights, per-automation sparklines, fatigue alerts |
| AutomationReceipts | 125 | Audit trail, rollback, impact summary, category filtering |
| AutomationTemplates | 162 | Gallery, combos, recently used, advisor notes |

Supporting pages also exist: **CallDesk** (152 LOC — call queue, prep briefs, talking points, post-call actions, analytics), **QuoteStudio** (155 LOC — pipeline, upsell suggestions, pricing insights, capabilities), **RetentionOffice** (192 LOC — churn prediction, NPS, win-back, health segments), **ClientOnboarding** (136 LOC — journey templates, active clients, step tracking).

## Gap Analysis Against Spec

After comparing the spec's "Automation Operating System" requirements against every page, these are the real gaps:

### 1. AutomationOffice — Missing "Automation Surface Coverage Map"
The spec demands a full map of all 10 automatable domains (lead recovery, calling, quotes, email/SMS, booking, onboarding, churn, reputation, offers/upsells, leak repair) with coverage percentages. The "By Stage" tab partially covers this, but does not show all 10 domains with their specific sub-capabilities and whether each is at L1/L2/L3/L4 or missing entirely.

### 2. AutomationBuilder — Missing "Generate from Advisor" Flow
The builder has a node palette and sample flow, but lacks the ability to auto-generate a workflow from an advisor recommendation (e.g., clicking "Generate lead recovery workflow" in the Office should show a pre-built flow in the Builder). Need a "Generate from Template/Advisor" entry point.

### 3. CallDesk — Missing Post-Call Automation Wiring
Call outcomes don't visually wire to the automation system (e.g., "After call outcome = interested → trigger quote generation automation"). The post-call actions exist as text but aren't shown as automation nodes.

### 4. QuoteStudio — Missing Auto-Generation from Context
The spec demands quote generation from "notes, forms, call transcripts, or booking context." The Capabilities tab describes this, but the actual pipeline tab has no "Generate from CRM context" button per quote.

### 5. RetentionOffice — Missing Automation Integration
Churn predictions show an "Execute" button, but there's no visible link to the Automation Office (e.g., "Launch churn prevention automation for this client"). Win-back campaigns don't link to automation templates.

### 6. ClientOnboarding — Missing Automation Depth
Journey steps show completion rates, but don't show which steps are automated (L1-L4), which have failed automations, or link to the Automation Health monitor.

### 7. Cross-Page Wiring — Missing Automation Trigger Points
Several pages (BookingCenter, ReputationEngine, CampaignOrchestrator, OffersWorkspace) don't have visible "automate this" entry points that link into the Automation Office.

### 8. No Centralized Automation Surface Map Component
There's no single component that shows all 10 automatable domains with their current automation level, coverage, and gaps — a "Commercial Automation Engine" overview.

## Implementation Plan

### Phase 1: Automation Surface Coverage Map (AutomationOffice.tsx)
Replace the "By Stage" tab with a comprehensive "Automation Surface" tab showing all 10 domains from the spec (Lead Recovery, Calling, Quotes, Email/SMS, Booking, Onboarding, Churn/Retention, Reputation, Offers/Upsells, Leak Repair). Each domain shows sub-capabilities, current automation level (L1-L4 or None), coverage percentage, estimated value, and a "Build" button linking to AutomationBuilder.

### Phase 2: Deepen AutomationBuilder with Context-Aware Generation
Add a "Generate" dropdown that pre-populates flows from:
- Advisor recommendations (pre-built lead recovery, no-show rescue, etc.)
- CRM context (stale leads → recovery flow)
- Call outcomes (call completed → quote/follow-up automation)
- Booking events (no-show → rescue flow)

Add a "Post-Activation Monitoring" section showing what happens after activation (links to Health monitor, receipt generation, rollback path).

### Phase 3: Wire Cross-Page Automation Entry Points
Add "Automate" buttons/links to:
- **CallDesk**: Post-call outcome → "Create automation from this outcome pattern"
- **QuoteStudio**: "Generate quote from CRM context" button on each pipeline item
- **RetentionOffice**: Churn prediction "Execute" → links to specific automation template
- **ClientOnboarding**: Show automation level (L1-L4) on each step, link failing steps to Health monitor
- **BookingCenter**: "Automate no-show recovery" and "Automate post-appointment follow-up"
- **ReputationEngine**: "Automate review request" for happy clients

### Phase 4: Enhance AutomationHealth with Domain-Level Health
Add a "By Domain" view showing health per automation domain (lead recovery health, booking automation health, etc.) rather than just per-individual-automation.

### Phase 5: Add Automation Interconnection Diagram to AutomationOffice
Add a visual "Automation OS Map" showing how automations connect across CRM → Booking → Quotes → Campaigns → Retention → Reputation with data flow indicators.

## Files Changed

| File | Change Type | Estimated LOC |
|------|------------|:---:|
| AutomationOffice.tsx | Major enhancement — add Surface Coverage tab, Interconnection map | 307→450 |
| AutomationBuilder.tsx | Add context-aware generation dropdown | 244→300 |
| CallDesk.tsx | Add post-call automation wiring buttons | 152→180 |
| QuoteStudio.tsx | Add "Generate from CRM context" button | 155→180 |
| RetentionOffice.tsx | Wire churn execute to automation templates | 192→210 |
| ClientOnboarding.tsx | Add automation level indicators per step | 136→160 |
| BookingCenter.tsx | Add automation entry points | 239→260 |
| ReputationEngine.tsx | Add review automation trigger | 281→295 |
| AutomationHealth.tsx | Add domain-level health view | 145→190 |
| revenue-office.ts (demo data) | Add surface coverage data, domain health data | +80 LOC |

### Build Verification
Run `tsc --noEmit` after all changes. Zero errors required.

