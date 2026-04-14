

# Business OS — Advisor & Boardroom Integration Layer

## What Exists Today
- **Business Home**: Has `AdvisorSynthesisZone` (hardcoded per business mode) and `BoardroomEntryZone` (hardcoded candidates) — good UX but static, no real engine
- **Lead Inbox**: Has `LeadAdvisorWhisper` (11 lines, just a text blurb), `ModuleAdvisorInsight` used on the page, `LeadScoringDashboard` with `boardroomWorthy` flag — partial wiring
- **Lead Recovery**: Has `advisorInsight` string field on each candidate, `boardroomCandidate` flag — data exists but no advisor panel or escalation UI
- **Business Boardroom**: Has `DomainAdvisorBoard` + `AdvisorCouncilShell` + KPIs — works as strategic review but doesn't receive structured escalation packets from modules
- **CRM**: Has a full `CRMAdvisorBoard` (408 lines) with insight generation — good pattern to follow
- **Shared components**: `ModuleAdvisorInsight` (compact advisor card), `DomainAdvisorBoard` (full council with 5 modes)
- **No advisor engine**: No structured advisor output model, no cross-module synthesis engine, no escalation packet builder

## Implementation Plan

### File 1: Business Advisor Intelligence Engine
**Create `src/lib/engines/business-advisor-engine.ts`** (~400 lines)

Core structured advisor output model and all 18 advisor functions:
- `AdvisorOutput` type: advisorName, module, summary, rationale, positiveSignals, negativeSignals, confidence, assumptions, suggestedActions, escalationRecommendation, urgency, relatedObjects, timestamp
- `EscalationPacket` type: title, objectContext, leadContext, stageContext, communicationHistory, advisorRationale, confidence, assumptions, recoveryOptions, recommendedMotion, disagreements
- `BoardSynthesisTheme` type: themeId, title, description, severity, modules, advisorAgreement, escalationCandidate, metrics

**Module advisor functions** (each returns `AdvisorOutput`):
- Business Home: `runSummaryAdvisor`, `runPressureAdvisor`, `runPriorityAdvisor`
- Leads: `runLeadPrioritizationAdvisor`, `runOpportunityAdvisor`, `runQualificationAdvisor`
- Lead Inbox: `runTriageAdvisor`, `runDuplicateReviewAdvisor`, `runOwnerSuggestionAdvisor`
- Scoring: `runScoringAdvisor`, `runConversionAdvisor`, `runTimingAdvisor`
- Stages: `runProgressionAdvisor`, `runStuckStageAdvisor`, `runLifecycleAdvisor`
- Recovery: `runRecoveryAdvisor`, `runCommunicationRecoveryAdvisor`, `runRevenueRescueAdvisor`

**Board synthesis**: `synthesizeBusinessBoard` — groups module outputs into cross-cutting themes
**Escalation builder**: `buildEscalationPacket` — creates Boardroom-ready packets
**Disagreement detector**: `detectAdvisorDisagreements` — finds conflicting advisor positions

All functions are pure/stateless, consuming module data and returning structured outputs.

### File 2: Business Advisor Board Panel
**Create `src/components/business/advisor-board/BusinessAdvisorBoardPanel.tsx`** (~350 lines)

Premium synthesis dashboard showing cross-module intelligence:
- **Theme cards**: Grouped strategic themes (Revenue Risk, Operational Weakness, Opportunity Concentration, etc.) with severity badges and contributing module tags
- **Advisor agreement/disagreement visualization**: Side-by-side rationale chips, confidence split bars, "why advisors differ" expandable drawer
- **Escalation queue**: Cards for Boardroom-worthy items with preview, packet builder button, and severity indicators
- **Module contribution grid**: Shows which modules are feeding insights, with health dots and last-updated timestamps
- **"What changed since last review"** section: Delta summary of new themes and resolved items
- Animated entry with Framer Motion, glassmorphic dark surface treatment

### File 3: Module Advisor Panels (per-module inline advisor UI)
**Create `src/components/business/advisor-board/ModuleAdvisorPanel.tsx`** (~250 lines)

Reusable multi-advisor panel for embedding in any module page:
- Takes an array of `AdvisorOutput` objects
- Renders them as stacked advisor cards with: name, role icon, summary, confidence ring, positive/negative signal chips, suggested actions tray, escalation badge
- Supports collapsed (show top advisor only) and expanded (all advisors) modes
- Disagreement indicator when advisors conflict
- "Send to Board" action on individual insights
- Beautiful tabbed view when 3+ advisors (e.g., Recovery tab shows Recovery Advisor, Communication Recovery Advisor, Revenue Rescue Advisor)

### File 4: Escalation Packet Preview
**Create `src/components/business/advisor-board/EscalationPacketPreview.tsx`** (~200 lines)

Premium briefing-style preview of a Boardroom escalation packet:
- Sections A-J matching the spec: Title, Object Context, Lead/Account Context, Stage Context, Communication History (timeline), Advisor Rationale (multi-advisor cards with agreement/dissent markers), Confidence gauge, Assumptions list, Recovery/Action Options (radio-selectable), Recommended Motion
- "Send to Boardroom" CTA button with confirmation
- Print-ready layout feel — high-end briefing document design
- Glassmorphic card with gold/purple accent borders for strategic gravitas

### File 5: Advisor Disagreement View
**Create `src/components/business/advisor-board/AdvisorDisagreementCard.tsx`** (~120 lines)

Side-by-side advisor comparison when positions conflict:
- Two advisor cards placed side by side with a "vs" divider
- Each shows: advisor name, position summary, confidence level, key factors
- Confidence split bar showing relative strength
- "Why they differ" expandable explanation
- Optional "Escalate disagreement" action
- Calm, non-alarming visual treatment — purple/amber tones

### File 6: Wire Advisors into Lead Recovery
**Modify `src/pages/business/LeadRecovery.tsx`** and **`src/components/business/LeadRecoveryPane.tsx`**

- Add `ModuleAdvisorPanel` to the Recovery overview tab showing outputs from Recovery Advisor, Communication Recovery Advisor, Revenue Rescue Advisor
- In detail pane: replace static `advisorInsight` string with structured multi-advisor section showing all 3 advisor outputs with confidence, actions, and escalation recommendations
- Add "Escalate to Boardroom" button that opens `EscalationPacketPreview` for boardroom candidates
- Wire recovery candidates through `runRecoveryAdvisor()` etc. to generate live structured outputs

### File 7: Wire Advisors into Lead Inbox
**Modify `src/pages/business/LeadsInbox.tsx`** and **`src/components/business/lead-inbox/LeadDetailPanel.tsx`**

- Add collapsible `ModuleAdvisorPanel` to the inbox sidebar showing Triage Advisor, Duplicate/Quality Advisor, Owner Suggestion Advisor outputs
- In detail panel: add advisor section below lead info with triage recommendation, quality assessment, and suggested owner
- Wire through `runTriageAdvisor()` etc. with inbox item data

### File 8: Wire Advisors into Business Home
**Modify `src/components/business/home/AdvisorSynthesisZone.tsx`**

- Replace hardcoded `MODE_SYNTHESIS` with calls to `runSummaryAdvisor`, `runPressureAdvisor`, `runPriorityAdvisor`
- Show multi-advisor view instead of single synthesis: three advisor cards for Summary, Pressure, and Priority with individual confidence levels
- Add disagreement indicator when advisors conflict
- Add "View Full Board" link that navigates to the Business Advisor Board page

### File 9: Business Advisor Board Page
**Create `src/pages/business/BusinessAdvisorBoardPage.tsx`** (~150 lines)

Full-page workspace for the Business Advisor Board synthesis layer:
- Uses `BusinessAdvisorBoardPanel` as the main content
- Top: strategic summary hero with total themes, escalation candidates count, board health score
- Tabs: Themes | Escalation Queue | Module Health | History
- Wired into BusinessAppShell navigation

### File 10: Register in BusinessAppShell
**Modify `src/components/sita/apps/business/BusinessAppShell.tsx`**

- Add "Advisor Board" navigation entry under Intelligence section
- Route to `BusinessAdvisorBoardPage`
- Ensure the existing "Advisors" entry (DomainAdvisorBoard) and new "Advisor Board" (synthesis layer) are both accessible

## Design Language
- Dark glassmorphic: `bg-[hsl(0_0%_9%)]`, borders `hsl(0_0%_100%/0.06)`
- Accent purple `hsl(265 55% 58%)` for advisor elements, gold `hsl(38 85% 58%)` for escalation/urgency, green `hsl(152 55% 48%)` for confidence/agreement
- Advisor cards use subtle radial accent glows matching `ModuleAdvisorInsight` pattern
- Disagreement uses amber/violet split treatment
- Escalation packets use gold borders with formal briefing aesthetic
- Framer Motion enter/exit on all panels
- Follows existing `CRMAdvisorBoard` quality bar

## File Summary
- **Create**: business-advisor-engine.ts, BusinessAdvisorBoardPanel.tsx, ModuleAdvisorPanel.tsx, EscalationPacketPreview.tsx, AdvisorDisagreementCard.tsx, BusinessAdvisorBoardPage.tsx (6 files)
- **Modify**: LeadRecovery.tsx, LeadRecoveryPane.tsx, LeadsInbox.tsx, LeadDetailPanel.tsx, AdvisorSynthesisZone.tsx, BusinessAppShell.tsx (6 files)
- **Total**: 12 files, ~2,200 lines

