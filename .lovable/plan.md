

# Boardroom Decision Chamber — Full Completion Plan

## Current State

The Boardroom has 8 views (Executive, Pulse, Synthesis, Council, Simulation, Approval, Memory) with cinematic talking avatars, sparklines, seal stamps, and animated counters. But it operates on **hardcoded mock data** with no formal session lifecycle, no structured issue framing, no centralized evidence panel, and no real backend models. The anti-hallucination system exists in `src/lib/no-hallucination/` but is not wired into the Boardroom UI.

## What This Plan Delivers

A phased approach across **3 implementation rounds** to transform the Boardroom from a visual prototype into a real decision chamber.

---

## PHASE 1 — Session Lifecycle + Issue Frame + Evidence Panel (Priority)

### Database: New Tables

**`boardroom_sessions`** — Formal session lifecycle
- `id`, `user_id`, `session_type` (business/finance/concierge/executive/opportunity), `scope`, `status` (assembling/in-progress/paused/awaiting-evidence/ready-for-approval/adjourned), `opened_at`, `closed_at`, `current_issue_id`, `participating_advisors` (jsonb), `session_mode`, `decision_receipt_ids` (jsonb)

**`boardroom_items`** — Issues that enter the room
- `id`, `user_id`, `session_id`, `title`, `description`, `domain`, `severity` (critical/high/medium/low), `source_signals` (jsonb), `escalation_reason`, `advisor_summaries` (jsonb), `recommendation_state`, `simulation_state`, `confidence_state` (jsonb), `evidence_refs` (jsonb), `freshness_state` (jsonb), `blocking_conditions` (jsonb), `status` (new/under-review/simulated/approved/deferred/carried-over)

**`boardroom_evidence`** — Centralized evidence records
- `id`, `user_id`, `item_id`, `source_type` (verified/inferred/assumption/stale), `source_name`, `content`, `confidence`, `freshness`, `last_updated`, `lineage_chain` (jsonb), `proof_receipt_id`

**`boardroom_recommendations`** — Structured recommendations
- `id`, `user_id`, `item_id`, `session_id`, `summary`, `rationale`, `evidence_basis` (jsonb), `confidence_score`, `scenario_basis`, `domain_impacts` (jsonb), `urgency`, `reversibility`, `conditions_for_approval` (jsonb), `next_best_alternative`, `status`

**`boardroom_decision_receipts`** — Formal receipts
- `id`, `user_id`, `session_id`, `item_id`, `recommendation_id`, `approved_motion`, `rationale_summary`, `evidence_snapshot` (jsonb), `simulation_snapshot` (jsonb), `approval_conditions` (jsonb), `status`, `expected_outcome`, `follow_up_review_date`, `linked_execution_items` (jsonb), `proof_trail` (jsonb)

All tables with RLS: `auth.uid() = user_id`.

### UI Components — Phase 1

**`BoardroomSessionBar.tsx`** (new) — Replaces simple header state with formal session lifecycle strip showing: session state badge (Assembling → In Progress → Ready for Approval → Adjourned), stage progress indicator (5 dots), session timer, "Open Session" / "Adjourn" controls.

**`BoardroomIssueFrame.tsx`** (new) — Central issue card at top of Executive view: issue title, originating domain, why it entered the Boardroom, priority/consequence level, current recommendation summary, approval requirement, simulation state, confidence state, freshness indicators, blocking conditions. Styled as the "matter before the room."

**`BoardroomEvidencePanel.tsx`** (new) — Slide-out right panel (400px) accessible from any view via "Show Evidence" button. Contains: evidence cards grouped by type (verified/inferred/assumption/stale), source-of-truth panel, freshness indicators, assumptions list, unresolved unknowns, lineage chain visualization, proof receipts, trust posture summary.

**`BoardroomAppShell.tsx`** (modify) — Add session state management, wire session lifecycle to header, add evidence panel slide-out trigger.

**`BoardroomExecutiveView.tsx`** (modify) — Replace hardcoded AGENDA_ITEMS with data from `boardroom_items` table (demo mode keeps mocks). Add IssueFrame at top.

---

## PHASE 2 — Advisor Stance States + Simulation Integrity + Approval Ceremony

### UI Components — Phase 2

**Advisor stance visualization upgrades** (`BoardroomSynthesisView.tsx`, `BoardroomAdvisorCouncil.tsx`):
- Add visual stance badges: Agree (green check), Caution (amber shield), Dissent (red x), Unresolved (gray ?), Blocked (lock), Simulation-Only Confidence (dashed border), Verified Confidence (solid border)
- Glanceable "room tension map" — a horizontal bar showing proportion of agree/caution/dissent across all advisors
- Each advisor card gets a small colored dot overlay matching their stance

**Simulation integrity layer** (`BoardroomSimulationView.tsx`):
- Add "Simulation Contract" panel showing: what is computed vs estimated vs assumption-heavy vs blocked-by-missing-data
- Add confidence intervals as shaded bands on the timeline
- Add "What Is Not Modeled" disclosure section
- Wire anti-hallucination `TruthWrappedOutput` from `src/lib/no-hallucination/types.ts` into simulation outputs

**Approval ceremony upgrade** (`BoardroomApprovalView.tsx`):
- Add pre-approval checklist: final recommendation, confidence, risks-if-approved, risks-if-deferred, conditions, simulation preview, action scope, expected receipt, follow-up timing, rollback path
- Lock approval to a specific recommendation snapshot (prevent approving a moving target)
- Post-approval: generate formal `boardroom_decision_receipts` record
- Enhanced closure moment: decision seal card with what was approved, why, by whom, what happens next, when it returns for review, outcome tracking link

**Entry/exit ceremony** (`BoardroomAppShell.tsx`):
- Entry: issue comes into focus (scale-up), advisor stances load (staggered fade), room context assembles, recommendation settles in
- Exit: decision summarized (card rises), receipt created (seal stamp), follow-through registered, session closes with "adjourned" state

---

## PHASE 3 — Decision Lineage + Cross-App Dependencies + Session Replay

### UI Components — Phase 3

**`BoardroomLineageView.tsx`** (new) — Full provenance visualization: signal → advisor → boardroom → simulation → approval → receipt → execution → outcome. Rendered as a horizontal connected node graph.

**`BoardroomCrossAppImpact.tsx`** (new) — Visual dependency map showing how a boardroom decision ripples across domains. Example: "Collections action → Finance receivable timing changes → Concierge burden shifts." Rendered as connected domain cards with animated ripple lines.

**`BoardroomDecisionMemory.tsx`** (modify) — Add session replay: view prior session state, prior recommendation, prior evidence, prior simulations, final motion, and what actually happened after. Add "Pattern Detection" upgrades: advisor accuracy over time, decision quality trends.

**Anti-hallucination visual layer** (across all views):
- Trust state badges: verified, evidence-backed, inferred, simulation-only, stale, source-missing, needs-human-review, blocked-by-connector, mathematically-constrained, advisory-only
- Confidence ladder component showing exactly where confidence comes from and what would raise/lower it
- "What would invalidate this?" disclosure on every recommendation

**`BoardroomExplainability.tsx`** (new) — Answerable questions panel: "Why was this recommended?", "Which data points drove this?", "What assumptions were used?", "What is missing?", "What changed?", "Which advisors agreed/disagreed?", "Why is confidence low/high?", "What would invalidate this?"

---

## Technical Approach

- All animations: `framer-motion` (already installed)
- Database: 5 new tables via migration tool, all with user_id RLS
- Data hooks: new `useBoardroomSession` hook managing session lifecycle and CRUD
- Anti-hallucination: wire existing `ConfidenceEnvelope`, `GroundingReport`, `StalenessState` types into boardroom data flow
- Demo mode: all new hooks fallback to mock data when `isDemoMode === true`
- No new dependencies

## File Summary

| Phase | File | Action |
|-------|------|--------|
| 1 | 5 new DB tables | Migration |
| 1 | `BoardroomSessionBar.tsx` | New |
| 1 | `BoardroomIssueFrame.tsx` | New |
| 1 | `BoardroomEvidencePanel.tsx` | New |
| 1 | `BoardroomAppShell.tsx` | Modify — session state, evidence panel |
| 1 | `BoardroomExecutiveView.tsx` | Modify — issue frame, data wiring |
| 1 | `useBoardroomSession.ts` | New hook |
| 2 | `BoardroomSynthesisView.tsx` | Modify — stance badges, tension map |
| 2 | `BoardroomAdvisorCouncil.tsx` | Modify — stance dot overlays |
| 2 | `BoardroomSimulationView.tsx` | Modify — contract panel, anti-hallucination |
| 2 | `BoardroomApprovalView.tsx` | Modify — ceremony, receipt generation, checklist |
| 3 | `BoardroomLineageView.tsx` | New |
| 3 | `BoardroomCrossAppImpact.tsx` | New |
| 3 | `BoardroomExplainability.tsx` | New |
| 3 | `BoardroomDecisionMemory.tsx` | Modify — replay, patterns |

~15 files across 3 phases. 5 database tables. No new dependencies.

