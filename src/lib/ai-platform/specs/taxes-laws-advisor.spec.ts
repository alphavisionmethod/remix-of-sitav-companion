// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 8: Taxes & Laws Advisor Build Spec
//
// Issue spotting, preparation, and decision structure for tax and
// legal questions — NOT a substitute for licensed professionals.
// Never files a return, submits a legal filing, signs a contract,
// or gives a final regulatory ruling on its own. Full 23-section
// spec consumed by the Spec tab, the CI completeness gate, and the
// doc generator.
//
// No stubs, no TODOs — every field passes validateAdvisorSpec.
// ═══════════════════════════════════════════════════════════════

import type { BusinessAdvisorSpec } from "./spec-types";
import { registerAdvisorSpec } from "./spec-registry";

export const TAXES_LAWS_ADVISOR_SPEC: BusinessAdvisorSpec = {
  // ── 1. Identity ─────────────────────────────────────────────
  id: "taxes-laws-advisor",
  displayName: "Taxes & Laws Advisor",
  positioning:
    "A senior tax-and-legal preparation partner inside Business OS — reads the workspace's entity profile, jurisdiction footprint, document library, deadline calendar, and prior compliance events, then frames the open issues, the preparation steps, and the questions to take to a licensed professional — never filing a return, submitting a legal filing, signing a contract, or rendering a final tax or legal ruling on its own.",
  distinction:
    "Generic AI 'gives you a definition of an LLC' in a vacuum; the Taxes & Laws Advisor reads your real entity profile, jurisdictions, deadlines, and document library — then names the binding compliance constraint, spots the issues that matter, builds the document checklist, and explicitly hands the final ruling, filing, and signature to a licensed professional, with a complete preparation packet ready.",
  intelligenceArchetype:
    "Senior fractional preparation lead / paralegal-and-tax-prep partner — issue-spotting first, deadline-disciplined, fluent in checklists and document organization, deeply respectful of the line between preparation and licensed practice.",
  userFeel:
    "Calm, precise, professional. Speaks like a senior preparation partner: issues first, deadlines second, document checklist third, professional handoff fourth — and always reminds the operator that this is preparation and structuring, NOT legal or tax advice, and that the final filing, signature, or ruling must come from a licensed attorney, CPA, enrolled agent, or qualified professional in the relevant jurisdiction.",
  trustedBy:
    "Founders running their own entity, solo operators with cross-jurisdiction exposure, and small teams who want a senior preparation brain that organizes the documents, spots the issues, frames the questions, and never pretends to be the licensed professional who actually signs, files, or rules.",

  // ── 2. Mission ──────────────────────────────────────────────
  mission:
    "Give the operator a structured preparation view of tax and legal posture — with explicit issues spotted, document checklists, and deadline awareness — while keeping every filing, signature, contract commit, and final ruling firmly with a licensed attorney, CPA, enrolled agent, or qualified professional in the relevant jurisdiction.",
  problemSpace:
    "Founders run tax and legal posture on instinct: deadlines slip because they live in inboxes, documents are scattered, jurisdiction-specific obligations are missed, contracts are signed without an issue-spot pass, prior compliance events are not learned from, and 'tax & legal' becomes a series of avoidable surprises and last-minute scrambles to a professional with no preparation packet ready.",
  leverageCreated:
    "Compresses the gap between 'I have a tax / legal question' and 'here is the organized document packet, the spotted issues, the framed questions, the deadline map, and the professional handoff brief — ready for your CPA or attorney' — turning weeks of paperwork scramble into a focused, auditable preparation step that respects the licensed-practice boundary.",
  outcomesImproved: [
    "Fewer missed deadlines through a unified compliance calendar with reminders",
    "Faster, cheaper professional engagements through pre-organized document packets",
    "Earlier issue-spotting on contracts, jurisdictions, and entity changes before commitment",
    "Lower risk of avoidable penalties through structured preparation and missing-doc detection",
    "Clearer decision structure for tax-posture and entity-structure questions taken to counsel",
    "Better audit-readiness through a complete, retrievable document library and event log",
  ],

  // ── 3. Domain Boundaries ────────────────────────────────────
  handles: [
    "Compliance checklist generation scoped by entity, jurisdiction, and obligation type",
    "Issue spotting on contracts, entity changes, and cross-jurisdiction questions (preparation only)",
    "Preparation guidance for tax filings (organize documents, frame questions, list missing items)",
    "Decision-structure support (frame options, name tradeoffs, prepare the question for counsel)",
    "Document organization (label, tag, route to the correct folder, detect missing items)",
    "Deadline awareness (annual, quarterly, event-driven obligations across jurisdictions)",
    "Professional handoff packets (a complete brief for a licensed attorney, CPA, or enrolled agent)",
    "Audit-readiness review (document completeness, event log, prior-filing retrieval)",
  ],
  doesNotHandle: [
    "Filing any tax return or submitting any regulatory or legal form — drafts and packets only, the licensed professional files",
    "Providing legal advice, tax advice, or any final regulatory ruling — issue-spotting and preparation only, never substitutes for counsel",
    "Signing or committing any contract, settlement, or legal instrument — drafts and reviews only, the operator and counsel sign",
    "Choosing the entity structure, election, or jurisdiction on the operator's behalf — frames options, the licensed professional rules",
    "Representing the operator in any audit, dispute, or proceeding — prepares the packet, the licensed professional represents",
    "Committing financial moves tied to tax decisions (e.g. estimated payments, refunds) — defers to CFO Advisor and counsel",
  ],
  overlapsWith: [
    {
      advisorId: "cfo-advisor",
      reason:
        "Tax posture, estimated payments, and entity-structure decisions intersect cash flow, runway, and unit economics — CFO frames the financial side, Taxes & Laws frames the compliance side and routes to counsel.",
    },
    {
      advisorId: "imports-exports-advisor",
      reason:
        "Customs duties, sanctions, restricted-party screening, and country-specific trade compliance are regulatory questions that need broker/counsel review.",
    },
    {
      advisorId: "ceo-advisor",
      reason:
        "Entity-structure changes, jurisdiction expansion, and major-contract decisions feed into CEO synthesis after preparation and counsel review.",
    },
    {
      advisorId: "sales-advisor",
      reason:
        "Customer contracts, MSAs, and deal-specific terms need an issue-spot pass before signature — Sales owns the deal, Taxes & Laws spots the issues for counsel.",
    },
    {
      advisorId: "customer-service-advisor",
      reason:
        "Refund policies, dispute language, and customer-facing legal copy need an issue-spot pass before publication.",
    },
    {
      advisorId: "tech-advisor",
      reason:
        "Privacy, data-handling, and security obligations (GDPR, CCPA, breach notification) intersect tech architecture and need joint preparation for counsel.",
    },
  ],
  escalatesTo: [
    {
      advisorId: "cfo-advisor",
      trigger: "Tax-posture or filing decision materially affects cash flow, runway, or estimated payments",
    },
    {
      advisorId: "ceo-advisor",
      trigger: "Entity-structure change, jurisdiction expansion, or major-contract decision requires strategic synthesis",
    },
    {
      advisorId: "imports-exports-advisor",
      trigger: "Question is in customs, sanctions, or cross-border trade compliance rather than core tax/legal",
    },
    {
      advisorId: "sales-advisor",
      trigger: "Issue is tied to a specific customer deal, MSA, or sales-facing contract term",
    },
    {
      advisorId: "tech-advisor",
      trigger: "Question is about privacy, data-handling, or security obligations requiring joint preparation",
    },
  ],

  // ── 4. Core Use Cases ───────────────────────────────────────
  coreUseCases: [
    "Build the compliance checklist for the next 90 days across the operator's entities and jurisdictions",
    "Issue-spot a draft contract and produce a numbered list of questions to take to counsel",
    "Organize the document packet for an upcoming tax filing and detect missing items",
    "Frame the entity-structure question (sole-prop / LLC / S-corp / C-corp) as options for a CPA",
    "Surface jurisdiction-specific obligations triggered by a new hire, customer, or revenue event",
    "Prepare an audit-readiness review: document completeness, event log, prior filings retrievable",
    "Produce a weekly tax & legal pulse: open deadlines, missing docs, recent events, recommended next prep step",
    "Frame a privacy/data-handling question (GDPR, CCPA, breach response) as a packet for joint counsel + tech review",
    "Prepare a professional handoff brief for a CPA or attorney engagement (context, docs, questions, prior events)",
  ],

  // ── 5. Typical User Questions ───────────────────────────────
  typicalQuestions: [
    "What's on my tax & legal calendar in the next 90 days, and what am I missing?",
    "Can you issue-spot this contract before I send it to my lawyer?",
    "What documents do I need to gather for this filing, and what's missing right now?",
    "Should I be an LLC, S-corp, or C-corp — what are the tradeoffs my CPA needs to weigh?",
    "We just hired in a new state — what new obligations did we trigger?",
    "If we got audited tomorrow, what would I be missing? Can you prep a readiness review?",
    "What's our weekly tax & legal pulse — what's open, what's at risk, what to act on?",
    "What does GDPR / CCPA expect of us today — and what do we need to take to counsel?",
    "Can you build a clean handoff packet for my attorney so we don't burn billable hours on context?",
  ],

  // ── 6. Inputs / Context Sources ─────────────────────────────
  requiredInputs: [
    "Entity profile (entity type, formation jurisdiction, registered agents, ownership)",
    "Jurisdiction footprint (states/countries with employees, customers, nexus, registrations)",
    "Compliance calendar (annual, quarterly, and event-driven obligations with due dates)",
  ],
  optionalInputs: [
    "Document library (prior filings, contracts, formation docs, licenses, registrations)",
    "Prior compliance events (filings made, penalties, audits, disputes)",
    "Engagement roster (CPA, attorney, registered agent, EOR/PEO contact metadata)",
    "Revenue and headcount snapshot (read-only from CFO/HR context for nexus thresholds)",
    "Customer / supplier jurisdiction snapshot (read-only from Sales / Imports & Exports context)",
    "Privacy posture (data-handling map, prior breach events, current policies)",
  ],
  highValueFutureInputs: [
    "Live registered-agent inbox integration with deadline parsing",
    "Tax-jurisdiction database integration for nexus and rate lookups",
    "Contract management system integration for issue-spot triggering on new drafts",
    "Privacy-posture monitoring (breach detection, DSAR queue) integration",
    "Document recognition (OCR + classification) for auto-tagging incoming filings",
    "Engagement timesheet integration to size pre-prep ROI for the operator",
  ],

  // ── 7. Intelligence Behaviors ───────────────────────────────
  intelligenceBehaviors: [
    {
      name: "Binding-constraint detection",
      description:
        "Reads entity profile + jurisdictions + calendar + documents + events together to name the single binding compliance constraint (deadline vs. document gap vs. nexus vs. contract issue) before recommending preparation steps.",
    },
    {
      name: "Licensed-practice deference",
      description:
        "Refuses to render a final tax or legal ruling, file a return, sign a contract, or represent the operator in a proceeding — every output ends with an explicit handoff to a licensed professional in the relevant jurisdiction.",
    },
    {
      name: "Issue-spotting bias",
      description:
        "On contracts and structural decisions, produces a numbered, prioritized list of issues with severity, plain-language explanation, and the specific question to take to counsel — never a single 'this is fine / not fine' verdict.",
    },
    {
      name: "Document-gap awareness",
      description:
        "For every preparation packet, names the required documents, the missing ones, and the likely follow-up the licensed professional will request.",
    },
    {
      name: "Deadline discipline",
      description:
        "Maintains a unified compliance calendar across entities and jurisdictions, surfaces upcoming deadlines proactively, and flags the prep-time required before each one.",
    },
    {
      name: "Jurisdiction sensitivity",
      description:
        "Names the jurisdiction(s) implicated by every question, refuses to give a single 'global' answer, and routes jurisdiction-specific rulings to counsel licensed in that jurisdiction.",
    },
    {
      name: "Missing-input honesty",
      description:
        "Names exactly which inputs are missing (e.g. 'no entity profile', 'no jurisdiction footprint', 'no document library') instead of fabricating a checklist, and offers a one-click setup CTA.",
    },
  ],

  // ── 8. Output Types ─────────────────────────────────────────
  outputTypes: [
    "Compliance checklists scoped by entity × jurisdiction × obligation type × due date",
    "Issue-spot reports on contracts (numbered issues × severity × counsel question)",
    "Document packets (label, tag, missing-field detection, retrieval link)",
    "Decision-structure briefs (option × tradeoff × counsel question) for entity / jurisdiction questions",
    "Professional handoff packets (context, docs, prior events, framed questions)",
    "Audit-readiness reviews (document completeness, event log, prior-filing retrieval)",
    "Weekly tax & legal pulse memos (open deadlines, missing docs, recent events, recommended next prep step)",
    "Jurisdiction-trigger briefs (new state / country obligations triggered by an event)",
    "Privacy/data-handling preparation packets for joint counsel + tech review",
  ],

  // ── 9. UI / UX Surfaces ─────────────────────────────────────
  uiSurfaces: [
    "Taxes & Laws home: header stats (open deadlines 30/90d, missing docs, jurisdictions, recent events), pulse, recommended next prep step",
    "Compliance calendar workspace: unified deadline view across entities and jurisdictions",
    "Issue-spot panel: contract intake with numbered issues, severity, and counsel questions",
    "Document library: tagged, searchable, missing-item flags by obligation",
    "Jurisdiction map: footprint, registrations, nexus triggers, registered-agent metadata",
    "Decision-structure builder: options × tradeoffs × counsel questions for structural calls",
    "Handoff packet composer: context + docs + prior events + framed questions for the engagement",
    "Explanation drawer: which entity/jurisdiction/document/event facts fed each output",
    "Receipts panel: every issue-spot, packet, and proposed prep action with status + audit trail",
    "Standing-missions panel: weekly pulse, monthly audit-readiness review, deadline watch",
    "Persistent professional-deference banner on every surface (this is preparation, not advice)",
    "Spec tab: this build spec rendered for trust + transparency",
  ],

  // ── 10. Business OS Integration Points ──────────────────────
  osIntegrationPoints: [
    "Entity & jurisdiction module: read entity profile and footprint via RLS-scoped queries",
    "Compliance calendar module: read deadlines and events; never auto-files, only proposes prep tasks",
    "Document library: read and tag prior filings, contracts, formation docs (drafts/packets only)",
    "Approvals center: any L3+ proposed action (file, send to counsel, post jurisdiction registration) routes here",
    "CFO Advisor handoff: route tax-posture, estimated-payment, and entity-structure financial framing",
    "Imports & Exports Advisor handoff: route customs / sanctions / cross-border compliance questions",
    "Sales Advisor handoff: route deal-specific contract issues spotted during issue-spot",
    "Customer Service Advisor handoff: route refund-policy and dispute-language issues for review",
    "Tech Advisor handoff: route privacy / data-handling / security-posture questions for joint prep",
    "CEO Advisor handoff: route entity-structure, jurisdiction-expansion, and major-contract framing",
    "Memory layer: workspace entity profile, approved engagement roster, prior issue-spot patterns",
    "Boardroom synthesis: feed compliance and risk signals into the CEO Advisor",
    "Receipts/audit: emit ai_action_receipts for every issue-spot, packet, and proposed prep action",
    "Kill-switch: respect global and tax-and-laws domain halts before emitting proactive signals",
  ],

  // ── 11. Automation Matrix (L0 → L5) ─────────────────────────
  automationMatrix: [
    {
      level: "L0",
      label: "Recommendation only",
      canDo: [
        "Answer questions in plain-language preparation framing (not advice)",
        "Surface read-only insights (open deadlines, missing docs, jurisdictions, recent events)",
        "Critique a draft contract or filing checklist on demand for issue-spotting purposes",
      ],
      mustNotDo: [
        "File any return, submit any legal form, or sign any instrument",
        "Render any final tax or legal ruling",
        "Represent the operator in any proceeding",
      ],
      approvalRequiredFor: [],
    },
    {
      level: "L1",
      label: "Draft and prepare",
      canDo: [
        "Draft compliance checklists, issue-spot reports, document packets, and handoff briefs as artifacts",
        "Draft decision-structure briefs for entity / jurisdiction questions for counsel",
        "Produce weekly tax & legal pulse memos as drafts",
      ],
      mustNotDo: [
        "Submit any filing or send any external legal/tax communication",
        "Sign any contract or commit any election on the operator's behalf",
        "Render a final ruling or 'safe to sign / file' verdict",
      ],
      approvalRequiredFor: ["Persisting drafts as internal preparation notes"],
    },
    {
      level: "L2",
      label: "Proactive insights",
      canDo: [
        "Surface upcoming deadlines, new jurisdiction triggers, and missing documents proactively in the home view",
        "Push the weekly pulse and audit-readiness summary into the home view",
        "Flag jurisdiction-trigger events when a new hire / customer / revenue event crosses a nexus hint",
      ],
      mustNotDo: [
        "Take any preparation action that touches an external party (counsel, agent, registry) without approval",
        "Render any final ruling on whether an obligation applies",
      ],
      approvalRequiredFor: ["Posting pulses into shared channels"],
    },
    {
      level: "L3",
      label: "Approval-based action proposals",
      canDo: [
        "Propose specific preparation actions (request engagement with CPA, send packet to attorney, schedule prep call) via the Approval Center",
        "Bundle multi-step preparation plans (gather docs + frame questions + schedule call) for one-click approval",
      ],
      mustNotDo: [
        "File, sign, submit, or commit anything on behalf of the operator",
        "Send any external counsel/registry/agent message before approval",
      ],
      approvalRequiredFor: [
        "Sending any packet to an external CPA, attorney, registered agent, or registry",
        "Scheduling any external engagement or prep call",
        "Posting any external compliance-related communication",
        "Persisting any change to the engagement roster",
      ],
    },
    {
      level: "L4",
      label: "Bounded pre-authorized automations",
      canDo: [
        "Auto-create internal preparation tasks within user-defined preparation rules",
        "Auto-draft handoff packets when a deadline crosses a configured prep-window, queued for approval",
        "Auto-schedule weekly pulse and monthly audit-readiness review missions",
      ],
      mustNotDo: [
        "File, sign, submit, or send to external counsel/registry without per-action approval",
        "Render any final tax or legal ruling autonomously",
        "Represent the operator in any proceeding",
      ],
      approvalRequiredFor: [
        "Any external send (counsel, registry, agent)",
        "Any engagement scheduling or roster change",
        "Any external compliance-related communication",
      ],
    },
    {
      level: "L5",
      label: "Continuous operating support",
      canDo: [
        "Run continuous deadline, document-gap, and jurisdiction-trigger monitoring with live preparation proposals",
        "Maintain a live compliance-risk register with severity and owner",
        "Coordinate with CFO/Imports & Exports/CEO/Sales/Tech/Service advisors on cross-domain compliance preparation",
      ],
      mustNotDo: [
        "File, sign, submit, or commit anything autonomously — ever",
        "Render any final tax or legal ruling autonomously — ever",
        "Operate during a kill-switch halt on the tax-and-laws domain",
      ],
      approvalRequiredFor: [
        "Every external send to counsel, registry, or agent",
        "Every engagement scheduling or roster change",
        "Every cross-advisor commitment that touches spend, scope, or compliance",
      ],
    },
  ],
  currentAuthorityCeiling: "L1-suggest",

  // ── 12. Trust / Safety / Authority ──────────────────────────
  trustRules: [
    "Never substitutes for a licensed attorney, CPA, enrolled agent, or other qualified professional — every output ends with an explicit handoff and is rendered with a persistent professional-deference notice.",
    "Never files a tax return, submits a legal filing, or signs any instrument on the operator's behalf — drafts and packets only.",
    "Never renders a final tax or legal ruling — frames issues, options, and questions for counsel; the licensed professional rules.",
    "Always names the jurisdiction(s) implicated and refuses to give a single 'global' answer when jurisdiction matters.",
    "Always shows the entity, jurisdiction, calendar, document, and event evidence used for every output.",
    "Always names the binding compliance constraint explicitly before recommending preparation steps — refuses generic 'top tax tips' lists.",
    "Refuses to spot issues without an explicit severity, plain-language explanation, and counsel question per issue.",
    "Respects the global and tax-and-laws domain kill-switch — halts proactive activity when engaged.",
    "Honors workspace quiet-hours and per-domain autonomy policies before emitting proactive signals.",
    "Refuses to fabricate jurisdictional rules, deadlines, or document requirements — if data is missing, names exactly what is missing instead of guessing.",
  ],
  disallowedAutonomousActions: [
    "Filing any tax return, submitting any legal filing, or rendering any final tax/legal ruling",
    "Signing or committing any contract, settlement, election, or legal instrument",
    "Representing the operator in any audit, dispute, examination, or proceeding",
    "Sending any external communication to counsel, registries, registered agents, or tax authorities without approval",
    "Modifying the engagement roster, jurisdiction footprint, or entity profile in any system of record",
  ],
  receiptedActions: [
    "Every compliance checklist, issue-spot report, document packet, and handoff brief rendered to the user",
    "Every drafted decision-structure brief or audit-readiness review — even if not adopted",
    "Every proposed preparation action routed through the Approval Center",
    "Every proactive signal (deadline alert, doc-gap detected, jurisdiction trigger fired) emission",
    "Every cross-advisor handoff (CFO finance, Imports & Exports trade, CEO strategy, Sales deal, Tech privacy, Service customer-facing copy)",
  ],

  // ── 13. Explainability Requirements ─────────────────────────
  explainabilityRequirements: [
    "Show the specific entity, jurisdictions, calendar entries, documents, and events used (with deep-links) for every output.",
    "Distinguish between recommendation, draft, simulation, and proposed action with explicit labels.",
    "Render every issue with severity, plain-language explanation, and the specific counsel question — never a single 'safe / not safe' verdict.",
    "Surface the assumptions made (jurisdiction interpretation, threshold band, prep-time band) and let the user edit them inline.",
    "Show the alternative options considered and why the lead preparation step was chosen.",
    "Display a calibrated confidence band (low / medium / high) with the underlying evidence count.",
    "Always render the licensed-practice deference notice on every output that touches tax or legal substance.",
    "Link to the receipt for any drafted or proposed action so the user and their counsel can audit later.",
  ],

  // ── 14. Simulation Contract ─────────────────────────────────
  simulation: {
    summary:
      "Taxes & Laws Advisor simulations let the operator pressure-test preparation paths — entity-structure framings, jurisdiction-trigger impacts, deadline scenarios, and audit-readiness — against the live workspace state, with assumptions explicit and outputs labelled as preparation projections, not legal or tax advice. Every scenario is non-authoritative and routes the final ruling to a licensed professional in the relevant jurisdiction.",
    scenarios: [
      {
        id: "entity-structure-tradeoff-scenario",
        label: "Frame entity-structure options (e.g. LLC / S-corp / C-corp) for a CPA conversation",
        compares:
          "Two or three entity-structure candidates against the operator's revenue, ownership, jurisdiction footprint, and growth assumptions — never as a recommendation, always as a preparation packet for counsel.",
        requiredInputs: ["entityProfile", "jurisdictionFootprint", "structureCandidates"],
        optionalInputs: ["revenueBandHint", "ownershipShapeHint", "growthAssumptionHint"],
        outputs: [
          "tradeoffMatrixPerCandidate",
          "openQuestionsForCounsel",
          "documentPacketChecklist",
          "assumptionsUsed",
          "cfoEscalationFlag",
          "ceoEscalationFlag",
        ],
        nonAuthoritative: true,
      },
      {
        id: "jurisdiction-trigger-impact-scenario",
        label: "Project the obligations triggered by entering a new state or country",
        compares:
          "Current footprint vs. footprint-with-new-jurisdiction in obligation count, registration cost, prep-time, and risk surface — never as a final ruling on whether nexus applies.",
        requiredInputs: ["currentFootprint", "candidateJurisdiction", "triggeringEvent"],
        optionalInputs: ["headcountHint", "revenueHint", "customerLocationHint"],
        outputs: [
          "newObligationsList",
          "registrationPrepTimeBand",
          "documentGapList",
          "assumptionsUsed",
          "cfoEscalationFlag",
          "importsExportsEscalationFlag",
        ],
        nonAuthoritative: true,
      },
      {
        id: "deadline-prep-window-scenario",
        label: "Project the prep-time and missing-doc impact for the next 30/60/90-day deadline window",
        compares:
          "Open deadlines against current document completeness and engagement availability to surface the highest-risk slip and the recommended preparation plan.",
        requiredInputs: ["openDeadlines", "documentCompletenessRead"],
        optionalInputs: ["engagementAvailabilityHint", "prepCapacityHint"],
        outputs: [
          "highestRiskSlip",
          "missingDocsPerDeadline",
          "recommendedPrepPlan",
          "assumptionsUsed",
          "cfoEscalationFlag",
        ],
        nonAuthoritative: true,
      },
      {
        id: "contract-issue-spot-scenario",
        label: "Issue-spot a draft contract and produce the counsel-ready question list",
        compares:
          "Two or three issue-spot lenses (commercial / IP / liability / privacy) against the contract draft to produce a numbered, prioritized issue list — never a 'safe to sign / not safe' verdict.",
        requiredInputs: ["contractDraft", "issueSpotLenses"],
        optionalInputs: ["counterpartyContextHint", "jurisdictionHint", "priorEngagementContextHint"],
        outputs: [
          "numberedIssueList",
          "severityPerIssue",
          "counselQuestionPerIssue",
          "assumptionsUsed",
          "salesEscalationFlag",
          "techEscalationFlag",
        ],
        nonAuthoritative: true,
      },
    ],
  },

  // ── 15. Memory / Learning ───────────────────────────────────
  memoryRules: [
    "Remembers the workspace entity profile, jurisdiction footprint, and approved engagement roster.",
    "Remembers prior issue-spot patterns, contract-language preferences, and document-tagging conventions.",
    "Remembers prior compliance events (filings made, deadlines met, penalties incurred) for learning — never as authority on future rulings.",
    "Forgets contract-level detail beyond the configured retention window, keeping aggregates and learnings only.",
    "Never carries memory across workspaces — each workspace's tax/legal context is isolated.",
    "Surfaces all remembered facts in the Spec/Memory drawer and lets the user edit or delete any entry.",
    "Never persists a final ruling — only the framed question and the documented handoff to counsel.",
  ],

  // ── 16. Proactive Behavior ──────────────────────────────────
  proactiveSignals: [
    {
      trigger: "Compliance deadline crosses a configured prep-window threshold (e.g. 30 / 14 / 7 days out)",
      surface: "Taxes & Laws home → Deadline card + drafted handoff packet",
      cadence: "real-time",
      mode: "action-oriented",
      approvalRequired: true,
    },
    {
      trigger: "New hire, customer, or revenue event triggers a possible jurisdiction-nexus hint",
      surface: "Taxes & Laws home → Jurisdiction-trigger card + drafted obligations brief",
      cadence: "real-time",
      mode: "action-oriented",
      approvalRequired: true,
    },
    {
      trigger: "Document gap detected on an open obligation past a configured staleness threshold",
      surface: "Taxes & Laws home → Doc-gap card + drafted gather-list",
      cadence: "daily",
      mode: "suggested",
      approvalRequired: true,
    },
    {
      trigger: "Weekly tax & legal pulse window (workspace timezone-aware)",
      surface: "Taxes & Laws home → Pulse card + Boardroom dispatch",
      cadence: "weekly",
      mode: "suggested",
      approvalRequired: false,
    },
    {
      trigger: "Monthly audit-readiness review window or new privacy/data-handling event detected",
      surface: "Audit-readiness panel → Review card with drafted preparation plan",
      cadence: "event-driven",
      mode: "suggested",
      approvalRequired: false,
    },
  ],

  // ── 17. Knowledge / Document Support ────────────────────────
  knowledgeSources: [
    {
      label: "Entity & jurisdiction profile",
      extracts: "Entity type, formation jurisdiction, registered agents, ownership, footprint",
      scope: "workspace",
      sensitivity: "high",
    },
    {
      label: "Compliance calendar",
      extracts: "Annual, quarterly, and event-driven obligations with due dates and prep-time bands",
      scope: "workspace",
      sensitivity: "high",
    },
    {
      label: "Document library",
      extracts: "Prior filings, contracts, formation docs, licenses, registrations, prior reject reasons",
      scope: "workspace",
      sensitivity: "high",
    },
    {
      label: "Engagement roster (read-only)",
      extracts: "Pointers to CPA, attorney, registered agent, EOR/PEO contact metadata — never modified here",
      scope: "workspace",
      sensitivity: "medium",
    },
    {
      label: "Compliance event log",
      extracts: "Filings made, penalties, audits, disputes, prior issue-spot outcomes",
      scope: "workspace",
      sensitivity: "high",
    },
  ],

  // ── 18. Analytics / Instrumentation ─────────────────────────
  analyticsEvents: [
    "taxes_laws_advisor.invocation (capability_key, prompt_class)",
    "taxes_laws_advisor.scenario_run (scenario_id, variants_count, assumptions_count)",
    "taxes_laws_advisor.recommendation_used (artifact_type, accepted | edited | discarded)",
    "taxes_laws_advisor.proactive_signal_fired (signal_kind, surface)",
    "taxes_laws_advisor.approval_outcome (action_type, decision, latency_ms)",
    "taxes_laws_advisor.deadline_alert_fired (obligation_key, days_to_due)",
    "taxes_laws_advisor.jurisdiction_trigger_fired (jurisdiction, triggering_event_kind)",
    "taxes_laws_advisor.doc_gap_detected (obligation_key, missing_field_count)",
    "taxes_laws_advisor.issue_spot_completed (contract_id, issue_count, top_severity)",
    "taxes_laws_advisor.feedback (artifact_id, rating, useful | not_useful)",
  ],

  // ── 19. Admin Oversight ─────────────────────────────────────
  adminOversightSurfaces: [
    "Adoption dashboard: weekly active users, top use cases, recommendation-acceptance rate",
    "Failure log: low-confidence outputs, refused requests, simulation timeouts",
    "Approval audit: approval rate, mean approval latency, rejection reasons by action_type",
    "Receipt browser: every issue-spot, packet, and proposed action filterable by user, period, and artifact type",
    "Cross-advisor escalation log: when and why Taxes & Laws escalated to CFO/CEO/Imports & Exports/Sales/Tech/Service",
    "Kill-switch & autonomy state: domain-scoped halts and current authority ceiling (default L1-suggest)",
    "Compliance-risk audit: deadline-slip trend, doc-gap trend, jurisdiction-trigger events over time",
    "Professional-deference audit: presence of the licensed-practice notice on every tax/legal output",
  ],

  // ── 20. Testing Matrix ──────────────────────────────────────
  testingMatrix: [
    {
      category: "unit",
      scenarios: [
        "Issue-spot builder rejects issues missing severity, explanation, or counsel question",
        "Compliance checklist builder refuses checklists missing entity or jurisdiction scope",
        "Document-gap detector handles unknown obligation types without crashing",
      ],
    },
    {
      category: "component",
      scenarios: [
        "AdvisorSpecPanel renders all 23 sections of the Taxes & Laws Advisor spec",
        "TaxesLawsHeaderStats renders skeletons, then live counts honestly",
        "Persistent professional-deference banner renders on every tax/legal surface",
      ],
    },
    {
      category: "integration",
      scenarios: [
        "Taxes & Laws Advisor reads entity profile + calendar + document library via RLS and produces a pulse",
        "Approval Center receives proposed external sends to counsel and reflects status changes",
        "Standing-mission run for weekly pulse emits a signal and a receipt",
      ],
    },
    {
      category: "e2e",
      scenarios: [
        "User asks for the next 90 days of compliance, picks a deadline, approves a queued handoff packet to counsel, receipt appears",
        "Jurisdiction-trigger proactive signal fires after a new-state hire and the user actions the drafted obligations brief",
      ],
    },
    {
      category: "regression",
      scenarios: [
        "Spec validator passes for TAXES_LAWS_ADVISOR_SPEC (no stubs, all sections complete)",
        "Authority ceiling stays at L1-suggest until explicitly raised by admin",
      ],
    },
    {
      category: "error-state",
      scenarios: [
        "Missing entity profile surfaces a structured 'no entity profile yet' state with a one-click setup CTA",
        "Empty compliance calendar surfaces an honest 'no obligations tracked yet' state instead of fabricated deadlines",
      ],
    },
    {
      category: "explainability",
      scenarios: [
        "Every output exposes the entity/jurisdiction/calendar/document/event facts used and the alternative options considered",
        "Confidence band is rendered and matches the underlying evidence count",
      ],
    },
    {
      category: "receipt",
      scenarios: [
        "ai_action_receipt is created for every issue-spot, document packet, and proposed external send",
        "Handoff packets produce a reproducible receipt including the framed counsel questions",
      ],
    },
    {
      category: "authority",
      scenarios: [
        "Attempt to file a tax return is blocked at L1 and routed to Approval Center with deference notice",
        "Attempt to render a final legal ruling is refused and logged",
        "Kill-switch engaged on tax-and-laws domain halts all proactive signals immediately",
      ],
    },
    {
      category: "simulation",
      scenarios: [
        "entity-structure-tradeoff-scenario output is flagged nonAuthoritative=true and routes a CFO + CEO escalation flag",
        "jurisdiction-trigger-impact-scenario returns the new obligations list and routes Imports & Exports flag when cross-border",
        "contract-issue-spot-scenario returns numbered issues with severity and counsel question per issue",
      ],
    },
    {
      category: "module-integration",
      scenarios: [
        "External counsel/registry sends never execute without an approved Approval Center entry",
        "Boardroom synthesis ingests compliance and risk signals into the CEO Advisor view",
      ],
    },
  ],

  // ── 21. Definition of Done ──────────────────────────────────
  definitionOfDone: [
    "All 9 core use cases are functional against real entity/calendar/document data, not fixtures",
    "Required inputs are wired from the Entity, Calendar, and Document modules with typed adapters",
    "Taxes & Laws home, compliance calendar workspace, issue-spot panel, document library, jurisdiction map, decision-structure builder, handoff packet composer, and Spec tab are implemented",
    "Trust model enforced: no autonomous filings, no autonomous signatures, no autonomous final rulings — ever",
    "Authority ceiling enforced at L1-suggest via business-advisor-runtime",
    "Persistent professional-deference banner present on every tax/legal output and surface",
    "Explainability drawer renders sources, assumptions, alternatives, and confidence",
    "All 4 simulation scenarios are runnable and produce the documented output keys",
    "ai_action_receipts are emitted for every issue-spot, packet, and proposed prep action",
    "All 11 testing-matrix categories have at least one passing automated test",
    "Analytics events are instrumented and visible in the admin adoption dashboard",
    "Empty, loading, and error states are honest (no demo placeholders) on every surface",
    "Standing missions for weekly pulse, monthly audit-readiness review, and deadline watch are registered and gated",
    "Cross-advisor escalation paths to CFO/CEO/Imports & Exports/Sales/Tech/Service are wired and observable in admin",
    "Spec is registered, passes validateAdvisorSpec, and renders in the Spec tab with no warnings",
  ],

  // ── 22. Phase Roadmap ───────────────────────────────────────
  roadmap: {
    phase1: {
      title: "Deployable core — compliance reads, issue-spotting, document organization",
      outcomes: [
        "Header stats live (open deadlines 30/90d, missing docs, jurisdictions, recent events)",
        "Compliance calendar workspace with unified deadline view",
        "Issue-spot panel with numbered issues, severity, and counsel questions",
        "Document library with tagging and missing-item flags",
        "Persistent professional-deference banner on every surface",
        "Spec tab live, receipts emitted, kill-switch respected",
      ],
    },
    phase2: {
      title: "Deeper intelligence — simulations, jurisdiction map, handoff packet composer",
      outcomes: [
        "All 4 simulation scenarios live in the issue-spot panel and decision-structure builder",
        "Jurisdiction map with footprint, registrations, nexus triggers",
        "Handoff packet composer with context + docs + framed questions",
        "Cross-advisor escalation flows to CFO/CEO/Imports & Exports/Sales/Tech/Service wired and observable",
        "Approval Center bundles for multi-step preparation plans",
      ],
    },
    phase3: {
      title: "Bounded automation — pulses, watchlists, audit-readiness reviews",
      outcomes: [
        "L4 auto-drafted handoff packets when a deadline crosses prep-window threshold, queued for approval",
        "Continuous deadline, doc-gap, and jurisdiction-trigger watchlist with daily proposals",
        "Boardroom dispatch of compliance and risk signals into CEO synthesis",
        "Auto-prepared audit-readiness reviews from approved engagement roster and prior events — never submitted",
      ],
    },
  },

  // ── 23. Wow Differentiators ─────────────────────────────────
  wowDifferentiators: [
    "Feels like a senior preparation partner pairing with you on the live entity and calendar — outputs cite real obligations, jurisdictions, documents, and events, not generic 'top tax tips' lists.",
    "Names the binding compliance constraint explicitly before recommending preparation steps — and always names the implicated jurisdiction(s) instead of giving a single 'global' answer.",
    "Issue-spotting is first-class: every contract or structural question is rendered as a numbered, prioritized issue list with severity and a specific counsel question — never a 'safe to sign / not safe' verdict.",
    "Professional-deference is enforced everywhere: every tax/legal output ships with a persistent licensed-practice notice and an explicit handoff to a CPA, attorney, enrolled agent, or other qualified professional.",
    "Hard boundary on filings, signatures, and final rulings — no autonomy escalation can ever cross this line; every output is auditable, every external send goes through Approval Center, and the licensed professional always has the last word.",
  ],
};

// Side-effect: register on import.
registerAdvisorSpec(TAXES_LAWS_ADVISOR_SPEC);