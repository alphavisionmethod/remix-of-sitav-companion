

# CRM Part 2 — Full Advanced Implementation Plan

## Current State Summary

The CRM currently has 14 sub-pages, 10 components, 12 DB tables, 30+ hooks, and full CRUD. What exists is solid but still operates as a "good contact system" rather than a "relationship operating environment." The gaps are in depth, intelligence, cross-domain integration, and premium UX polish.

## Implementation Batches

---

### Batch 1: Visual & UX Enrichment (Contact/Company Dossiers + Pipeline Views)

**Goal:** Transform contact and company detail pages into premium "relationship intelligence dossiers" and add pipeline strategic views.

**Files to modify:**
- `src/components/business/crm/CRMContactDetail.tsx` — Add hero record header with health chip, warmth state, next action zone, advisor insight zone, meeting prep card, relationship timeline with grouped sections, sentiment hints, and proof indicators
- `src/components/business/crm/CRMCompanyDetail.tsx` — Same dossier treatment: hero header, linked contacts via junction table, financial linkage area, support context, advisor summary, boardroom relevance indicator
- `src/pages/business/CRMPipeline.tsx` — Add focus views: stalled opportunities, closing-soon, at-risk, strategic review. Add opportunity heatmap visualization and conversion funnel

**Files to create:**
- `src/components/business/crm/CRMMeetingPrep.tsx` — Meeting/call prep cards with talking points, recent history, proposal/invoice context, risk notes, advisor suggestions
- `src/components/business/crm/CRMNextBestAction.tsx` — Reusable next-best-action engine component that generates call/email/proposal/reactivation suggestions from CRM data

---

### Batch 2: Lifecycle Engine + Relationship Intelligence

**Goal:** Build a proper lifecycle stage engine and deeper relationship scoring.

**Files to create:**
- `src/components/business/crm/CRMLifecycleEngine.tsx` — Full lifecycle management UI with 13 stages (new → contacted → engaged → active opportunity → proposal sent → negotiation → won → dormant → at risk → support-sensitive → collections-sensitive → lost → reactivation candidate), stage transition rules, automation hooks per stage, and next-action recommendations per stage
- `src/components/business/crm/CRMRelationshipIntelligence.tsx` — Explainable scoring dashboard showing health composition (recency, responsiveness, momentum, warmth, support sensitivity, payment sensitivity, boardroom relevance, reactivation potential) with drill-down per contact/company

**Files to modify:**
- `src/pages/business/CRMHealth.tsx` — Integrate the new scoring model, add relationship intelligence panel, add "next best action" suggestions per health bucket
- `src/pages/business/CRMHome.tsx` — Add lifecycle funnel visualization using new stages, add relationship intelligence summary widget

---

### Batch 3: Communication Depth + Timeline Enhancement

**Goal:** Make communications a first-class operational surface rather than just a log.

**Files to create:**
- `src/components/business/crm/CRMCommunicationQueue.tsx` — Communication queue view: waiting-on-reply, no-response, follow-up due, draft suggestions, sensitive communication flagging, approval-needed communication, outcome tracking

**Files to modify:**
- `src/pages/business/CRMTimeline.tsx` — Add grouped timeline sections, communication-type icons, proof indicators, follow-up state markers, draft/approval markers, linked quote/invoice/support events, expandable memory blocks, advisor annotations, sentiment hints
- `src/pages/business/CRMContacts.tsx` — Add "last interaction summary" and "next action" columns to contact list views

**New route:**
- `/business/crm-communications` — Register new CRM Communications page in `BusinessCenter.tsx` and `business-routes.tsx`

---

### Batch 4: Automation Wiring + Workflow Builder

**Goal:** Make automations real, persistent, trust-aware, and deeply integrated with CRM objects.

**Files to modify:**
- `src/pages/business/CRMAutomations.tsx` — Full rebuild: add workflow builder with conditions/triggers/actions/delays/approvals, simulation mode, execution history log, pause/resume, proof/receipt trail. Persist workflow status to DB. Add CRM object integration (act on contacts, companies, opportunities, lifecycle stages, communication status, follow-up status, invoice/quote/support state). Add trust gates: suggested → simulation → approval-required → active → paused modes

**DB migration:**
- Create `crm_automations` table: `id, user_id, title, description, trigger_config (jsonb), conditions (jsonb), actions (jsonb), status (text), trust_gate (text), runs (int), last_run_at, execution_log (jsonb), created_at, updated_at` with RLS

---

### Batch 5: Advisor Deep Integration

**Goal:** Make advisors contextual and embedded throughout CRM, not just a separate board page.

**Files to modify:**
- `src/components/business/crm/CRMAdvisorBoard.tsx` — Expand to support 8 advisor roles (Relationship, Follow-Through, Opportunity, Recovery, Account Health, Communication, Collections Sensitivity, Strategic Account). Each generates context-aware insights with confidence scores, assumptions, recommended actions, escalation conditions, and boardroom relevance logic
- `src/components/business/crm/CRMContactDetail.tsx` — Add inline advisor insight zone per contact
- `src/components/business/crm/CRMCompanyDetail.tsx` — Add inline advisor summary per company
- `src/pages/business/CRMPipeline.tsx` — Add advisor signals on deal cards (at risk, needs follow-up, boardroom-worthy)
- `src/pages/business/CRMImportCenter.tsx` — Add advisor hints during import review (duplicate confidence, suspicious data, quality hints)

---

### Batch 6: Cross-Domain Integration (Finance, Files, Concierge, Boardroom, Follow-Through)

**Goal:** Wire CRM to the rest of SITA OS so it feels central, not isolated.

**Files to create:**
- `src/components/business/crm/CRMFinanceLinkage.tsx` — Show invoice status, collections state, payment behavior, expected receivables per contact/company
- `src/components/business/crm/CRMFilesLinkage.tsx` — Contracts, proposals, files attached to company/opportunity, proof/document lineage
- `src/components/business/crm/CRMConciergeLinkage.tsx` — Meeting/travel prep for important customers, appointment reminders, event prep

**Files to modify:**
- `src/components/business/crm/CRMEscalateToBoardroom.tsx` — Enrich escalation packet with full context: relationship health, opportunity value, communications summary, advisor recommendations, quote/invoice/support context, files/evidence, trust/freshness notes
- `src/components/business/crm/CRMContactDetail.tsx` — Wire Finance, Files, Concierge, Follow-Through tabs using new linkage components
- `src/components/business/crm/CRMCompanyDetail.tsx` — Same cross-domain tabs

---

### Batch 7: Import/Migration Polish + Trust/Proof Layer

**Goal:** Make import world-class and add trust/proof/receipt trails throughout CRM.

**Files to create:**
- `src/components/business/crm/CRMImportTemplates.tsx` — Sample CSV templates (contact-only, company+contacts, opportunity import, industry-specific), download buttons
- `src/components/business/crm/CRMImportQuality.tsx` — Import quality scoring: completeness, dedupe confidence, invalid fields, merge count, custom field coverage, health rating
- `src/components/business/crm/CRMProofTrail.tsx` — Reusable proof/receipt trail component showing source-of-truth, import provenance, sync provenance, merge receipts, communication proof, workflow execution receipts, advisor rationale snapshots, boardroom escalation receipts

**Files to modify:**
- `src/pages/business/CRMImportCenter.tsx` — Add import templates section, quality scoring, migration history with rollback, connection health indicators (stale, conflict, auth expired, field mismatch)
- `src/components/business/CRMImportWizard.tsx` — Add quality meter during import, row confidence scores

---

### Batch 8: Team/Ownership + Premium Empty States + Action Surfaces + Wow

**Goal:** Final polish layer — ownership tracking, beautiful empty states, premium transitions, and action surfaces.

**Files to create:**
- `src/components/business/crm/CRMOwnership.tsx` — Owner assignment, next action owner, team visibility, queue assignment, handoff tracking, accountability timeline, review status

**Files to modify:**
- `src/components/business/crm/CRMEmptyState.tsx` — Expand to cover all new sections with premium guided setup states (no advisors configured, no workflows, no communications, connect CRM, create first pipeline)
- `src/pages/business/CRMHome.tsx` — Add premium action tray (add contact, create opportunity, create quote, send follow-up, assign task, start workflow, import, connect CRM, escalate, ask advisor). Add "resume where you left off" continuity
- `src/components/business/crm/CRMCommandSearch.tsx` — Expand command palette with all new actions (create quote from contact, start workflow, review duplicates, etc.)
- Multiple CRM pages — Add framer-motion page transitions, dossier open animations, import reveal flow

---

## Summary

| Batch | Focus | New Files | Modified Files |
|-------|-------|-----------|----------------|
| 1 | Visual dossiers + pipeline views | 2 | 3 |
| 2 | Lifecycle engine + relationship intelligence | 2 | 2 |
| 3 | Communication depth + timeline | 1 | 3 |
| 4 | Automation wiring + workflow builder | 0 | 1 + migration |
| 5 | Advisor deep integration | 0 | 5 |
| 6 | Cross-domain integration | 3 | 3 |
| 7 | Import polish + trust/proof | 3 | 2 |
| 8 | Ownership + empty states + wow | 1 | 4 |

**Total: ~12 new files, ~23 file modifications, 1 DB migration**

Each batch is independently deployable and builds on the previous. The result transforms CRM from a good contact system into a premium relationship operating environment with intelligence, automation, trust, and full cross-system integration.

