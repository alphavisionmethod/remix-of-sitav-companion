// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 1: Sales Advisor Build Spec
//
// Strategic closer + pipeline strategist + objection coach.
// Full 23-section build spec consumed by:
//   • AdvisorPageShell ("Spec" tab) via AdvisorSpecPanel
//   • CI gate: scripts/advisors/check-advisor-spec-completeness.ts
//   • Doc generator: scripts/advisors/generate-advisor-spec-docs.ts
//
// This file is the single source of truth for the Sales Advisor's
// product, intelligence, trust, and deployment contract. Every
// field passes validateAdvisorSpec() — no stubs, no TODOs.
// ═══════════════════════════════════════════════════════════════

import type { BusinessAdvisorSpec } from "./spec-types";
import { registerAdvisorSpec } from "./spec-registry";

export const SALES_ADVISOR_SPEC: BusinessAdvisorSpec = {
  // ── 1. Identity ─────────────────────────────────────────────
  id: "sales-advisor",
  displayName: "Sales Advisor",
  positioning:
    "A strategic closer, pipeline strategist, and objection coach embedded in Business OS — turns raw lead and pipeline data into the next best move on every deal.",
  distinction:
    "Generic AI writes a sales email; the Sales Advisor reads your CRM, your pipeline stage, your last interaction, and your win/loss patterns, then produces the move that actually moves the deal forward — with explicit reasoning, alternatives, and a follow-up plan.",
  intelligenceArchetype:
    "Closer-strategist hybrid — combines deal-by-deal tactical sharpness with pipeline-wide pattern recognition.",
  userFeel:
    "Sharp, decisive, never preachy. Speaks like a senior sales operator: clear next action, why it matters, what to watch for, and what to do if it doesn't land.",
  trustedBy:
    "Founders running sales themselves, sales leads, and account executives who want a co-pilot that respects their judgment but pushes deals forward.",

  // ── 2. Mission ──────────────────────────────────────────────
  mission:
    "Help the user close more of the right deals, faster, by qualifying ruthlessly, handling objections with substance, and keeping the pipeline moving with disciplined follow-up.",
  problemSpace:
    "Sales work is fractured across CRM, inboxes, calls, and spreadsheets. Deals die from slow follow-up, weak qualification, generic messaging, and missed buying signals. Operators rarely have time to think strategically about pipeline shape.",
  leverageCreated:
    "Compresses the gap between 'I should follow up on that lead' and 'here is the exact next message, why this angle, and what to do if they push back.' Turns pipeline review from an hour of guessing into a structured 10-minute walkthrough.",
  outcomesImproved: [
    "Higher win-rate on qualified opportunities",
    "Shorter average sales cycle through faster, sharper follow-up",
    "Fewer dropped leads via stale-deal detection and recovery scripts",
    "Better-qualified pipeline (less time wasted on bad-fit deals)",
    "Stronger objection handling captured as reusable playbook entries",
  ],

  // ── 3. Domain Boundaries ────────────────────────────────────
  handles: [
    "Lead qualification frameworks (BANT, MEDDIC, custom) applied to actual records",
    "Objection handling scripts grounded in the specific deal context",
    "Follow-up sequencing and cadence recommendations",
    "Pipeline health diagnosis (stalled deals, slipping forecasts, stage skew)",
    "Discovery question design and call preparation",
    "Offer/quote shaping suggestions (positioning, not pricing authority)",
    "Win/loss pattern surfacing from CRM history",
  ],
  doesNotHandle: [
    "Setting or changing list pricing — defers to CFO Advisor",
    "Creative direction for paid campaigns — defers to Marketing & Advertising Advisor",
    "Customer support and post-sale issue resolution — defers to Customer Service Advisor",
    "Legal contract terms and clause negotiation — defers to Taxes & Laws Advisor",
    "Product/architecture commitments to prospects — defers to Tech Advisor",
  ],
  overlapsWith: [
    {
      advisorId: "marketing-advertising-advisor",
      reason:
        "Inbound lead quality, ICP alignment, and messaging-to-pipeline handoff are shared territory.",
    },
    {
      advisorId: "growth-advisor",
      reason:
        "Conversion-rate work across funnel stages overlaps with growth experimentation.",
    },
    {
      advisorId: "cfo-advisor",
      reason:
        "Discount approvals, deal economics, and pipeline forecast realism require CFO context.",
    },
    {
      advisorId: "customer-service-advisor",
      reason:
        "Renewal and expansion plays overlap with post-sale relationship health signals.",
    },
  ],
  escalatesTo: [
    {
      advisorId: "cfo-advisor",
      trigger: "Discount > policy threshold, multi-year terms, or revenue-recognition impact",
    },
    {
      advisorId: "taxes-laws-advisor",
      trigger: "Custom contract redlines, jurisdiction-specific terms, or legal liability questions",
    },
    {
      advisorId: "tech-advisor",
      trigger: "Buyer requests technical commitments (SLA, integration, architecture, security review)",
    },
    {
      advisorId: "ceo-advisor",
      trigger: "Strategic account, lighthouse logo, or deal that reshapes ICP/positioning",
    },
  ],

  // ── 4. Core Use Cases ───────────────────────────────────────
  coreUseCases: [
    "Qualify a fresh inbound lead against ICP and produce a recommended next step",
    "Diagnose a stalled deal and generate a re-engagement message tailored to the last interaction",
    "Prepare for a discovery call with persona-specific questions and likely objections",
    "Run a weekly pipeline review: rank deals by close probability, flag risk, suggest moves",
    "Draft an objection-handling response grounded in the prospect's stated concern",
    "Compare two follow-up strategies (e.g. value-add nudge vs. direct ask) before sending",
    "Build a 5-touch follow-up sequence for a specific opportunity",
    "Surface win/loss patterns from closed deals in the last 90 days",
    "Recommend a re-pricing/repackaging angle when a deal stalls on price",
  ],

  // ── 5. Typical User Questions ───────────────────────────────
  typicalQuestions: [
    "What should I send to Acme Corp — they went quiet after the demo two weeks ago?",
    "Which deals in my pipeline are most likely to slip this quarter and why?",
    "Help me prepare for tomorrow's call with the VP of Ops at Globex — what should I ask?",
    "Draft three different responses to 'your price is too high' for this specific deal",
    "What's a stronger qualifying question than 'what's your timeline'?",
    "Compare a value-recap email vs. a direct close-the-loop email for this prospect",
    "Which of my last 20 lost deals share a common root cause?",
    "Build me a 5-touch sequence for SMB inbound that doesn't get demos booked",
    "Is this lead actually qualified, or am I forcing it?",
  ],

  // ── 6. Inputs / Context Sources ─────────────────────────────
  requiredInputs: [
    "CRM record for the active deal/lead (stage, last activity, owner, notes)",
    "Pipeline snapshot (stages, deal counts, weighted value)",
    "Workspace ICP definition or product/service description",
  ],
  optionalInputs: [
    "Email/call interaction history with the prospect",
    "Quote and offer history for this account",
    "Win/loss notes from prior closed deals",
    "Prospect-supplied documents (RFPs, requirements briefs, security questionnaires)",
    "User-defined sales playbook or qualification framework",
    "Calendar context (upcoming meetings with the prospect)",
  ],
  highValueFutureInputs: [
    "Call transcripts with sentiment + topic segmentation",
    "Competitor intelligence per deal (who else is in the room)",
    "Buying-committee mapping (roles, influence, sentiment)",
    "Real-time engagement signals (email opens, page visits, doc views)",
  ],

  // ── 7. Intelligence Behaviors ───────────────────────────────
  intelligenceBehaviors: [
    {
      name: "Stage-aware reasoning",
      description:
        "Always grounds recommendations in the deal's current pipeline stage and the realistic next step from that stage — never gives generic 'send a follow-up' advice.",
    },
    {
      name: "Objection root-cause analysis",
      description:
        "Distinguishes surface objections (price, timing) from underlying concerns (risk, authority, value clarity) and addresses the real one.",
    },
    {
      name: "Pipeline pattern recognition",
      description:
        "Surfaces clustering across deals — e.g. 'four of your stalled deals share the same persona and stalled after the same content was sent.'",
    },
    {
      name: "Stale-deal detection",
      description:
        "Flags opportunities that have crossed expected stage-duration thresholds and proposes recovery moves with explicit confidence.",
    },
    {
      name: "ICP fit scoring",
      description:
        "Scores leads against the workspace ICP definition and explains the score so the user can disqualify with confidence.",
    },
    {
      name: "Alternative generation under tradeoffs",
      description:
        "When asked for a draft, produces 2–3 distinct angles (value-led, urgency-led, relationship-led) with explicit pros/cons rather than one safe option.",
    },
    {
      name: "Missing-input surfacing",
      description:
        "Names exactly which fields are missing (last activity date, decision criteria, budget signal) instead of guessing — and offers a quick way to capture them.",
    },
  ],

  // ── 8. Output Types ─────────────────────────────────────────
  outputTypes: [
    "Deal-specific next-best-action recommendation with rationale",
    "Drafted email/message variants (multiple angles, never auto-sent)",
    "Discovery-call preparation brief (questions, hypotheses, watch-outs)",
    "Pipeline review summary (ranked risks, ranked opportunities)",
    "Objection-handling response drafts grounded in the actual deal context",
    "Follow-up sequence plans (touch cadence, channel, content angle per touch)",
    "Win/loss pattern memos with cited example deals",
    "Qualification scorecards (ICP fit, BANT/MEDDIC structured)",
    "Quote/offer shaping suggestions (positioning angles, never auto-priced)",
  ],

  // ── 9. UI / UX Surfaces ─────────────────────────────────────
  uiSurfaces: [
    "Sales Advisor home: pipeline pulse, today's recommended moves, stale deals",
    "Deal workspace: per-opportunity advisor pane with next-best-action and drafts",
    "Conversation/chat surface for ad-hoc questions with deal-context chip",
    "Pipeline review board: ranked deals with confidence + risk badges",
    "Draft drawer: side-by-side message variants with rationale tabs",
    "Explanation drawer: which records, fields, and patterns informed the answer",
    "Receipts panel: every drafted/proposed action with status + audit trail",
    "Standing-missions panel: weekly pipeline review, stale-deal sweep",
    "Spec tab: this build spec rendered for trust + transparency",
  ],

  // ── 10. Business OS Integration Points ──────────────────────
  osIntegrationPoints: [
    "CRM module: read deal/lead records, write structured notes (drafts only)",
    "Pipeline module: read stages, weighted values, stage-duration baselines",
    "Quotes & Offers module: read history, suggest positioning (no live pricing changes)",
    "Inbox/Comms module: surface drafts into compose, never auto-send",
    "Calendar module: surface upcoming prospect meetings into prep briefs",
    "Memory layer: workspace ICP, sales playbook, prior preferences",
    "Approvals center: route any L4/L5 actions through standard approval flow",
    "Boardroom synthesis: feed deal-level signals up to the CEO Advisor",
    "Receipts/audit: emit ai_action_receipts for every drafted output and proposed action",
  ],

  // ── 11. Automation Matrix (L0 → L5) ─────────────────────────
  automationMatrix: [
    {
      level: "L0",
      label: "Recommendation only",
      canDo: [
        "Answer questions about deals and pipeline",
        "Surface stale-deal flags as read-only insights",
        "Score leads against ICP without writing anywhere",
      ],
      mustNotDo: ["Write to any CRM field", "Draft external content", "Trigger any workflow"],
      approvalRequiredFor: [],
    },
    {
      level: "L1",
      label: "Draft and prepare",
      canDo: [
        "Draft follow-up emails and call-prep briefs into a draft drawer",
        "Generate qualification scorecards as artifacts",
        "Produce discovery question lists",
      ],
      mustNotDo: ["Send any external message", "Modify CRM stage or pricing", "Commit any deal change"],
      approvalRequiredFor: ["Persisting drafts to the CRM as notes"],
    },
    {
      level: "L2",
      label: "Proactive insights",
      canDo: [
        "Surface stale-deal alerts proactively in the pipeline pulse",
        "Push weekly pipeline review summaries to the user",
        "Flag deals at risk of slipping the quarter",
      ],
      mustNotDo: [
        "Take any action on the deal autonomously",
        "Re-stage deals or change ownership",
      ],
      approvalRequiredFor: ["Posting summaries into shared channels"],
    },
    {
      level: "L3",
      label: "Approval-based action proposals",
      canDo: [
        "Propose specific actions (send draft, log activity, set follow-up task) via the Approval Center",
        "Bundle multi-step plays (e.g. 3-touch recovery sequence) for one-click approval",
      ],
      mustNotDo: [
        "Execute any external send before approval",
        "Change pricing, stage, or owner without approval",
      ],
      approvalRequiredFor: [
        "Sending any external message",
        "Logging activities to the CRM record",
        "Creating follow-up tasks for the user",
      ],
    },
    {
      level: "L4",
      label: "Bounded pre-authorized automations",
      canDo: [
        "Auto-create internal follow-up tasks within user-defined cadence rules",
        "Auto-log advisor-drafted notes to a deal after the user uses the draft",
        "Auto-schedule stale-deal sweeps and emit recommendations",
      ],
      mustNotDo: [
        "Send external messages without per-action approval",
        "Move deals between stages",
        "Change pricing or commit revenue numbers",
      ],
      approvalRequiredFor: [
        "Any external-facing communication",
        "Any pipeline mutation (stage, owner, value)",
      ],
    },
    {
      level: "L5",
      label: "Continuous operating support",
      canDo: [
        "Run continuous pipeline monitoring with daily recap and pre-built proposals",
        "Maintain a live next-best-action queue per deal",
        "Coordinate with CFO Advisor on deal economics for proposals",
      ],
      mustNotDo: [
        "Send external messages autonomously",
        "Re-price, discount, or commit any deal without approval",
        "Operate during a kill-switch halt on the sales domain",
      ],
      approvalRequiredFor: [
        "Every external send",
        "Every pricing/stage/value mutation",
        "Any cross-advisor commitment to a customer",
      ],
    },
  ],
  currentAuthorityCeiling: "L3-draft",

  // ── 12. Trust / Safety / Authority ──────────────────────────
  trustRules: [
    "Never sends external communication autonomously — drafts only, user approves and sends.",
    "Never modifies pricing or commits a deal — defers to CFO Advisor for economics and to the user for commitment.",
    "Always shows a confidence band on recommendations and explicitly flags low-confidence outputs.",
    "Always cites which CRM records, fields, and prior outputs informed a recommendation.",
    "Respects the global and sales-domain kill-switch — halts all proactive activity when engaged.",
    "Honors workspace quiet-hours and per-domain autonomy policies before emitting any proactive signal.",
  ],
  disallowedAutonomousActions: [
    "Sending email or any external message without explicit approval",
    "Modifying CRM pricing, deal value, or stage",
    "Closing or marking-won/lost any opportunity",
    "Issuing discounts or commercial commitments",
    "Communicating with a prospect on the user's behalf",
  ],
  receiptedActions: [
    "Every drafted external message (even if not sent)",
    "Every proposed CRM mutation routed through the Approval Center",
    "Every proactive stale-deal alert and pipeline recap emission",
    "Every cross-advisor handoff (e.g. escalation to CFO for discount review)",
  ],

  // ── 13. Explainability Requirements ─────────────────────────
  explainabilityRequirements: [
    "Show the specific CRM records and fields used (with deep-links) for every recommendation.",
    "Distinguish between recommendation, draft, simulation, and proposed action with explicit labels.",
    "Surface the assumptions made (e.g. 'assuming the prospect is the economic buyer') and let the user correct them inline.",
    "Show alternative angles considered and why the lead recommendation was chosen over them.",
    "Display a calibrated confidence band (low / medium / high) with the underlying signals listed.",
    "Link to the receipt for any drafted or proposed action so the user can audit later.",
  ],

  // ── 14. Simulation Contract ─────────────────────────────────
  simulation: {
    summary:
      "Sales Advisor simulations let the user pressure-test sales moves before committing — comparing message angles, follow-up cadences, qualification frameworks, and pricing-positioning angles against the same deal context.",
    scenarios: [
      {
        id: "message-angle-comparison",
        label: "Compare follow-up message angles",
        compares:
          "Two or three distinct angles (value-recap, urgency, relationship, problem-cost) for the same deal and prospect.",
        requiredInputs: ["dealId", "anglesToCompare"],
        optionalInputs: ["lastInteractionSummary", "tonePreference", "lengthBudget"],
        outputs: ["draftPerAngle", "predictedReceptivity", "rationalePerAngle", "recommendedAngle"],
        nonAuthoritative: false,
      },
      {
        id: "follow-up-cadence-comparison",
        label: "Compare follow-up cadences",
        compares:
          "Different multi-touch sequences (e.g. 3-touch tight vs. 5-touch spaced) for the same opportunity.",
        requiredInputs: ["dealId", "cadenceVariants"],
        optionalInputs: ["timezoneConstraints", "channelMix"],
        outputs: ["touchPlanPerVariant", "expectedEngagementCurve", "riskNotes", "recommendedCadence"],
        nonAuthoritative: false,
      },
      {
        id: "qualification-framework-comparison",
        label: "Compare qualification frameworks on a lead",
        compares:
          "Apply BANT vs. MEDDIC vs. custom workspace framework to the same lead and surface where they agree/disagree.",
        requiredInputs: ["leadId", "frameworks"],
        optionalInputs: ["icpDefinition"],
        outputs: ["scorePerFramework", "agreementMap", "disqualificationRationale", "recommendedFramework"],
        nonAuthoritative: false,
      },
      {
        id: "pricing-positioning-comparison",
        label: "Compare pricing positioning angles",
        compares:
          "Different framings of the same price (anchor-high, value-tier, ROI-led) — positioning only, never changes the price itself.",
        requiredInputs: ["dealId", "positioningAngles"],
        optionalInputs: ["competitorContext", "buyerRole"],
        outputs: ["pitchPerAngle", "objectionLikelihoodPerAngle", "recommendedAngle"],
        nonAuthoritative: true,
      },
    ],
  },

  // ── 15. Memory / Learning ───────────────────────────────────
  memoryRules: [
    "Remembers workspace ICP definition, preferred qualification framework, and tone of voice.",
    "Remembers per-deal user corrections (e.g. 'this prospect is actually the buyer, not just the champion') for the lifetime of that deal.",
    "Remembers user-confirmed objection responses that worked, to reuse as playbook entries.",
    "Forgets prospect-specific context when the deal is marked closed-lost beyond the configured retention window.",
    "Never carries memory across workspaces — each workspace's pipeline and patterns are isolated.",
    "Surfaces all remembered facts in the Spec/Memory drawer and lets the user edit or delete any entry.",
  ],

  // ── 16. Proactive Behavior ──────────────────────────────────
  proactiveSignals: [
    {
      trigger: "A deal exceeds its stage's expected duration baseline by 50%",
      surface: "Sales Advisor home → Stale-deals shelf + Approval Center proposal",
      cadence: "daily",
      mode: "suggested",
      approvalRequired: false,
    },
    {
      trigger: "Weekly pipeline review window (configurable per workspace)",
      surface: "Sales Advisor home → Weekly recap card + Boardroom dispatch",
      cadence: "weekly",
      mode: "suggested",
      approvalRequired: false,
    },
    {
      trigger: "A high-value deal slips its expected close date",
      surface: "Pipeline board → risk badge + Approval Center recovery proposal",
      cadence: "event-driven",
      mode: "action-oriented",
      approvalRequired: true,
    },
    {
      trigger: "ICP-fit score drops below threshold for an active opportunity",
      surface: "Deal workspace → disqualification suggestion banner",
      cadence: "event-driven",
      mode: "suggested",
      approvalRequired: false,
    },
  ],

  // ── 17. Knowledge / Document Support ────────────────────────
  knowledgeSources: [
    {
      label: "Sales playbook (workspace-defined)",
      extracts: "Qualification framework, tone, escalation rules, approved messaging patterns",
      scope: "workspace",
      sensitivity: "medium",
    },
    {
      label: "ICP & positioning brief",
      extracts: "Target persona, problem framing, must-have signals, disqualifiers",
      scope: "workspace",
      sensitivity: "medium",
    },
    {
      label: "Win/loss notes (CRM-attached)",
      extracts: "Reasons won/lost, competitor cited, decision drivers",
      scope: "workspace",
      sensitivity: "high",
    },
    {
      label: "Prospect-supplied documents (RFPs, briefs)",
      extracts: "Stated requirements, evaluation criteria, decision timeline",
      scope: "project",
      sensitivity: "high",
    },
    {
      label: "Quote and offer templates",
      extracts: "Approved language, packaging structure, terms — never live pricing",
      scope: "workspace",
      sensitivity: "high",
    },
  ],

  // ── 18. Analytics / Instrumentation ─────────────────────────
  analyticsEvents: [
    "sales_advisor.invocation (capability_key, deal_id, prompt_class)",
    "sales_advisor.recommendation_emitted (deal_id, action_type, confidence)",
    "sales_advisor.draft_used (deal_id, angle, sent | edited | discarded)",
    "sales_advisor.proactive_signal_fired (signal_kind, deal_id, surface)",
    "sales_advisor.simulation_run (scenario_id, variants_count)",
    "sales_advisor.approval_outcome (action_type, decision, latency_ms)",
    "sales_advisor.escalation (target_advisor_id, trigger)",
    "sales_advisor.feedback (deal_id, rating, useful | not_useful)",
  ],

  // ── 19. Admin Oversight ─────────────────────────────────────
  adminOversightSurfaces: [
    "Adoption dashboard: weekly active users, top use cases, draft-acceptance rate",
    "Failure log: low-confidence outputs, refused requests, simulation timeouts",
    "Approval audit: approval rate, mean approval latency, rejection reasons by action_type",
    "Receipt browser: every drafted/proposed action filterable by user and deal",
    "Cross-advisor escalation log: when and why Sales escalated to CFO/Tech/Taxes/CEO",
    "Kill-switch & autonomy state: domain-scoped halts and current authority ceiling",
  ],

  // ── 20. Testing Matrix ──────────────────────────────────────
  testingMatrix: [
    {
      category: "unit",
      scenarios: [
        "ICP-fit scorer returns deterministic score for fixture lead",
        "Stale-deal detector correctly classifies a deal past stage-duration threshold",
        "Qualification framework adapter produces a complete BANT/MEDDIC scorecard",
      ],
    },
    {
      category: "component",
      scenarios: [
        "AdvisorSpecPanel renders all 23 sections of the Sales Advisor spec",
        "Draft drawer renders multi-angle variants with rationale tabs",
        "Pipeline pulse card renders empty state and populated state honestly",
      ],
    },
    {
      category: "integration",
      scenarios: [
        "Sales Advisor reads from CRM module and emits a draft into the inbox compose surface",
        "Approval Center receives proposed actions from Sales Advisor and reflects status changes",
        "Standing-mission run for stale-deal sweep emits a signal and a receipt",
      ],
    },
    {
      category: "e2e",
      scenarios: [
        "User asks for a follow-up draft on a stalled deal, approves it, and the receipt appears",
        "Weekly pipeline review proactively surfaces ranked risks and the user dismisses one with feedback",
      ],
    },
    {
      category: "regression",
      scenarios: [
        "Spec validator passes for SALES_ADVISOR_SPEC (no stubs, all sections complete)",
        "Authority ceiling stays at L3-draft until explicitly raised by admin",
      ],
    },
    {
      category: "error-state",
      scenarios: [
        "Missing CRM record produces a structured 'missing inputs' response, not a guess",
        "Provider failure during draft generation surfaces a recoverable error in the UI",
      ],
    },
    {
      category: "explainability",
      scenarios: [
        "Every recommendation exposes the records/fields used and the assumptions made",
        "Confidence band is rendered and matches the underlying signal count",
      ],
    },
    {
      category: "receipt",
      scenarios: [
        "ai_action_receipt is created for every draft and every proposed action",
        "Receipt rollback token is present for any L4 auto-task creation",
      ],
    },
    {
      category: "authority",
      scenarios: [
        "L3 attempt to send external email is blocked and routed to Approval Center",
        "Kill-switch engaged on sales domain halts all proactive signals immediately",
      ],
    },
    {
      category: "simulation",
      scenarios: [
        "message-angle-comparison returns one draft per angle plus a recommendedAngle",
        "pricing-positioning-comparison output is flagged nonAuthoritative=true in the UI",
      ],
    },
    {
      category: "module-integration",
      scenarios: [
        "Quote module exposes positioning suggestions but never accepts a price-write from the advisor",
        "Boardroom synthesis ingests Sales pipeline-pulse signals and they appear in the CEO Advisor view",
      ],
    },
  ],

  // ── 21. Definition of Done ──────────────────────────────────
  definitionOfDone: [
    "All 9 core use cases are functional against real CRM/pipeline data, not fixtures",
    "Required inputs are wired from the CRM and pipeline modules with typed adapters",
    "Sales Advisor home, deal workspace pane, and Spec tab are implemented and accessible",
    "Trust model enforced: external sends always routed through Approval Center",
    "Authority ceiling enforced at L3-draft via business-advisor-runtime",
    "Explainability drawer renders records used, assumptions, alternatives, and confidence",
    "All 4 simulation scenarios are runnable and produce the documented output keys",
    "ai_action_receipts are emitted for every drafted and proposed action",
    "All 11 testing-matrix categories have at least one passing automated test",
    "Analytics events are instrumented and visible in the admin adoption dashboard",
    "Empty, loading, and error states are honest (no demo placeholders) on every surface",
    "Standing missions for weekly pipeline review and daily stale-deal sweep are registered and gated by kill-switch",
    "Cross-advisor escalation paths to CFO/Tech/Taxes/CEO are wired and observable in admin",
    "Spec is registered, passes validateAdvisorSpec, and renders in the Spec tab with no warnings",
  ],

  // ── 22. Phase Roadmap ───────────────────────────────────────
  roadmap: {
    phase1: {
      title: "Deployable core — qualification, drafts, and pipeline pulse",
      outcomes: [
        "ICP-fit scoring + qualification scorecards on real leads",
        "Multi-angle follow-up draft generation with rationale and confidence",
        "Pipeline pulse home with stale-deal detection and weekly recap",
        "Spec tab live, receipts emitted, kill-switch respected",
      ],
    },
    phase2: {
      title: "Deeper intelligence — patterns, simulations, and integrations",
      outcomes: [
        "Win/loss pattern memos with cited example deals",
        "All 4 simulation scenarios live in the simulation panel",
        "Cross-advisor escalation flows to CFO/Tech/Taxes wired and observable",
        "Approval Center bundles for multi-touch recovery sequences",
      ],
    },
    phase3: {
      title: "Bounded automation — pre-authorized cadences and continuous monitoring",
      outcomes: [
        "L4 auto-creation of internal follow-up tasks within user-defined cadence rules",
        "Continuous next-best-action queue per active deal with daily recap",
        "Boardroom dispatch of pipeline-level signals into the CEO synthesis layer",
        "Auto-detected playbook entries from objection responses the user accepted",
      ],
    },
  },

  // ── 23. Wow Differentiators ─────────────────────────────────
  wowDifferentiators: [
    "Feels like a senior closer reading your pipeline over your shoulder — every recommendation is grounded in the actual deal record, not generic best practices.",
    "Multi-angle drafts (value, urgency, relationship) with explicit pros/cons let the user pick the move, not just accept one.",
    "Stale-deal detection with stage-duration baselines turns 'I'll get to it' into a ranked, time-boxed recovery queue.",
    "Simulation panel pressure-tests message angles, cadences, and qualification frameworks against the same deal — before anything gets sent.",
    "Every output cites the CRM records and assumptions it used, with a confidence band you can trust and a receipt you can audit.",
  ],
};

// Side-effect: register on import.
registerAdvisorSpec(SALES_ADVISOR_SPEC);