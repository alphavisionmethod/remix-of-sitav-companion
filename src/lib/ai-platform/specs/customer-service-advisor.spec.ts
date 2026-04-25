// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 2: Customer Service Advisor Build Spec
//
// Service-quality intelligence + escalation strategist + CSAT
// guardian. Full 23-section spec consumed by the Spec tab, the CI
// completeness gate, and the doc generator.
//
// No stubs, no TODOs — every field passes validateAdvisorSpec.
// ═══════════════════════════════════════════════════════════════

import type { BusinessAdvisorSpec } from "./spec-types";
import { registerAdvisorSpec } from "./spec-registry";

export const CUSTOMER_SERVICE_ADVISOR_SPEC: BusinessAdvisorSpec = {
  // ── 1. Identity ─────────────────────────────────────────────
  id: "customer-service-advisor",
  displayName: "Customer Service Advisor",
  positioning:
    "A service-quality intelligence and issue-detection layer embedded in Business OS — turns support cases, customer health signals, and SLA pressure into the next best resolution move.",
  distinction:
    "Generic AI writes a polite reply; the Customer Service Advisor reads the case history, the customer's health score, prior complaints, the SLA clock, and your tone-of-voice rules — then drafts the response, names the right escalation, and flags churn risk before it lands.",
  intelligenceArchetype:
    "Service-quality strategist + issue-pattern detector — combines case-by-case empathy with workspace-wide quality and risk pattern recognition.",
  userFeel:
    "Calm, precise, customer-first. Speaks like a senior support lead: clear acknowledgement, structured resolution path, explicit escalation criteria, and a recovery plan if the first move misses.",
  trustedBy:
    "Founders running their own support inbox, support leads, and CX managers who want a co-pilot that protects tone, catches risk early, and never auto-fires a refund.",

  // ── 2. Mission ──────────────────────────────────────────────
  mission:
    "Resolve customer issues faster and with higher quality, raise CSAT, and protect customer trust by surfacing risk early and routing escalations correctly — without ever acting on the customer's account autonomously.",
  problemSpace:
    "Support work is reactive, fragmented across inboxes, ticket queues, chat, and notes. SLAs slip, repeat issues go undetected, escalations are inconsistent, and tone drifts under pressure. At-risk customers churn because no one connected the dots in time.",
  leverageCreated:
    "Compresses the gap between 'a case landed' and 'here is the right reply, the right escalation path, the SLA risk, and a churn-risk flag if relevant' — turning a 30-minute triage into a structured 5-minute review with audit trail.",
  outcomesImproved: [
    "Faster first-response and resolution times within SLA targets",
    "Higher CSAT/NPS through tone-aligned, context-aware responses",
    "Earlier detection of at-risk and churn-likely customers",
    "More consistent escalation decisions (right person, right urgency)",
    "Reusable resolution playbook entries built from successful handlings",
  ],

  // ── 3. Domain Boundaries ────────────────────────────────────
  handles: [
    "Drafting customer responses grounded in case history, tone rules, and SLA context",
    "Triage and prioritization of incoming cases by urgency, sentiment, and customer value",
    "Escalation routing recommendations (engineering, billing, account exec, legal)",
    "CSAT and customer health analysis (trends, drivers, at-risk cohorts)",
    "Support workflow diagnosis (queue shape, SLA pressure, repeat-issue clustering)",
    "Knowledge-base gap detection (recurring questions without canonical answers)",
    "Post-resolution follow-up planning (recovery touch, satisfaction check)",
  ],
  doesNotHandle: [
    "Issuing refunds, credits, or any account-level commercial concession — defers to the user / CFO Advisor",
    "Renegotiating contract terms or SLAs — defers to Taxes & Laws Advisor and Sales Advisor",
    "Diagnosing or committing to product/engineering fixes — defers to Tech Advisor",
    "Marketing or upsell messaging in a service context — defers to Marketing Advisor",
    "Closing or marking-resolved any case autonomously — always user-confirmed",
  ],
  overlapsWith: [
    {
      advisorId: "sales-advisor",
      reason:
        "Renewal-risk, expansion conversations, and post-sale relationship health overlap with sales pipeline signals.",
    },
    {
      advisorId: "cfo-advisor",
      reason:
        "Refunds, credits, and goodwill economics require CFO context and authority.",
    },
    {
      advisorId: "tech-advisor",
      reason:
        "Recurring product issues and bug-driven case clusters need engineering escalation.",
    },
    {
      advisorId: "growth-advisor",
      reason:
        "CSAT trends and churn-risk cohorts feed retention/growth experiments.",
    },
  ],
  escalatesTo: [
    {
      advisorId: "cfo-advisor",
      trigger: "Refund, credit, or any monetary concession proposed or requested",
    },
    {
      advisorId: "tech-advisor",
      trigger: "Cluster of cases sharing a likely product defect, outage, or integration failure",
    },
    {
      advisorId: "taxes-laws-advisor",
      trigger: "Customer mentions legal action, regulator, GDPR/CCPA right-to-erasure, or contract breach",
    },
    {
      advisorId: "sales-advisor",
      trigger: "At-risk customer signals churn before renewal, or expansion opportunity surfaces",
    },
    {
      advisorId: "ceo-advisor",
      trigger: "Strategic account at-risk, public-facing complaint, or pattern threatening brand trust",
    },
  ],

  // ── 4. Core Use Cases ───────────────────────────────────────
  coreUseCases: [
    "Draft a tone-aligned response to an incoming complaint with full case context",
    "Triage today's queue: rank cases by urgency × customer value × SLA pressure",
    "Detect and cluster recurring issues across the last 30/90 days",
    "Recommend the right escalation path with named owner role and rationale",
    "Identify at-risk customers from health-score trends and case sentiment",
    "Compare two response strategies (direct fix vs. acknowledge + investigate)",
    "Produce a weekly service-quality recap (CSAT drift, top issue clusters, SLA misses)",
    "Draft a recovery plan after a poor CSAT score, including follow-up cadence",
    "Surface knowledge-base gaps (questions asked >N times without a canonical answer)",
  ],

  // ── 5. Typical User Questions ───────────────────────────────
  typicalQuestions: [
    "Draft a response to this angry email from Acme — they're threatening to leave.",
    "Which open cases should I personally handle today and why?",
    "Are we seeing a spike in any one issue category this week?",
    "Should this billing dispute go to me, the AE, or Finance?",
    "Which of my customers look most at-risk of churning right now?",
    "Compare a 'we're investigating' reply vs. a 'here's exactly what happened' reply for this incident.",
    "What's driving the CSAT drop in the last two weeks?",
    "Build me a 3-touch recovery plan for this customer who scored a 2/5.",
    "Which questions are we answering over and over without a help-doc article?",
  ],

  // ── 6. Inputs / Context Sources ─────────────────────────────
  requiredInputs: [
    "Support case record (subject, body, status, priority, channel, customer link)",
    "Customer record (plan tier, lifetime value or proxy, health score, prior cases)",
    "Workspace tone-of-voice and escalation policy (or a sensible default)",
  ],
  optionalInputs: [
    "Full case history thread (previous messages on the same case)",
    "SLA policy and current breach distance per case",
    "Prior CSAT/NPS scores from this customer",
    "Account notes from sales/CS handoff",
    "Knowledge-base articles relevant to the issue",
    "Public status-page incidents that may correlate with the issue",
  ],
  highValueFutureInputs: [
    "Sentiment-scored conversation transcripts (chat/voice)",
    "Product-usage telemetry indicating the customer's actual experience",
    "Cross-channel customer view (email + chat + social)",
    "Real-time outage/feature-flag context for incident-driven cases",
  ],

  // ── 7. Intelligence Behaviors ───────────────────────────────
  intelligenceBehaviors: [
    {
      name: "Tone-and-context calibration",
      description:
        "Calibrates response tone to the customer's emotional state, plan tier, and prior history — never sends a templated 'sorry for any inconvenience' to a high-value at-risk account.",
    },
    {
      name: "Escalation routing intelligence",
      description:
        "Recommends the correct escalation owner with an explicit reason, naming the role rather than guessing a person, and flags when escalation should be skipped.",
    },
    {
      name: "Issue-cluster detection",
      description:
        "Groups semantically similar cases into clusters and surfaces likely root causes (product defect, billing logic, onboarding friction) for engineering or ops follow-up.",
    },
    {
      name: "SLA-aware prioritization",
      description:
        "Ranks the queue by combining urgency, customer value, sentiment, and time-to-SLA-breach so the user always knows what to touch next.",
    },
    {
      name: "Churn-risk surfacing",
      description:
        "Flags customers whose case sentiment, frequency, and health-score trend cross a churn-risk threshold, with the contributing signals listed.",
    },
    {
      name: "Knowledge-gap detection",
      description:
        "Identifies repeat questions without canonical answers and proposes draft KB articles, marked as drafts requiring user approval.",
    },
    {
      name: "Missing-input surfacing",
      description:
        "Names exactly which fields are missing (last reply, plan tier, prior CSAT) instead of guessing — and offers a one-click way to capture them.",
    },
  ],

  // ── 8. Output Types ─────────────────────────────────────────
  outputTypes: [
    "Drafted customer responses (multiple tone variants, never auto-sent)",
    "Triage queue with ranked priority and per-case rationale",
    "Escalation suggestions with named owner role and trigger reason",
    "Issue-cluster reports with cited example case ids",
    "At-risk customer lists with contributing signals and recommended actions",
    "Service-quality recap memos (weekly/monthly) with trend lines",
    "Recovery plans for low-CSAT cases (touch cadence + content per touch)",
    "Knowledge-base draft articles for recurring questions",
    "Internal handoff notes for engineering, billing, or AE escalations",
  ],

  // ── 9. UI / UX Surfaces ─────────────────────────────────────
  uiSurfaces: [
    "Customer Service Advisor home: header stats (open / urgent / escalated / at-risk), today's triage, issue clusters",
    "Case workspace: per-case advisor pane with drafts, escalation suggestion, SLA badge, churn-risk flag",
    "Triage board: ranked queue with priority chips and rationale on hover",
    "Cluster view: grouped cases with cluster summary and proposed escalation",
    "At-risk customers panel: ranked list with contributing signals and recommended touch",
    "Draft drawer: side-by-side response variants (acknowledge / investigate / resolve) with rationale tabs",
    "Explanation drawer: which case fields, customer history, and policies informed the draft",
    "Receipts panel: every drafted/proposed action with status + audit trail",
    "Standing-missions panel: daily triage sweep, weekly service-quality recap",
    "Spec tab: this build spec rendered for trust + transparency",
  ],

  // ── 10. Business OS Integration Points ──────────────────────
  osIntegrationPoints: [
    "Support module: read support_cases, surface drafts into the case reply composer (never auto-send)",
    "Customers module: read customer health_score, plan tier, prior cases",
    "Inbox/Comms module: route drafted replies to compose, never autonomous send",
    "Approvals center: any L3+ proposed action (send, escalate, mark-resolved) routes here",
    "CRM module: notify Sales Advisor when a churn-risk signal involves a sales-owned account",
    "Engineering/Issue tracker (when wired): create draft issues from issue clusters, never auto-create",
    "Knowledge base module: propose draft articles, never publish autonomously",
    "Memory layer: workspace tone-of-voice, escalation policy, prior approved playbook entries",
    "Boardroom synthesis: feed CSAT trends and at-risk cohorts up to the CEO Advisor",
    "Receipts/audit: emit ai_action_receipts for every drafted output and proposed action",
  ],

  // ── 11. Automation Matrix (L0 → L5) ─────────────────────────
  automationMatrix: [
    {
      level: "L0",
      label: "Recommendation only",
      canDo: [
        "Answer questions about cases, customers, and queue health",
        "Surface at-risk customers and issue clusters as read-only insights",
        "Score case priority without writing anywhere",
      ],
      mustNotDo: [
        "Modify any case field",
        "Draft a customer-facing reply",
        "Trigger any escalation workflow",
      ],
      approvalRequiredFor: [],
    },
    {
      level: "L1",
      label: "Draft and prepare",
      canDo: [
        "Draft customer responses into a draft drawer (multiple tone variants)",
        "Generate triage queues and escalation recommendations as artifacts",
        "Produce recovery-plan outlines for low-CSAT cases",
      ],
      mustNotDo: [
        "Send any external message",
        "Mark a case resolved or change priority",
        "Issue refunds, credits, or commercial concessions",
      ],
      approvalRequiredFor: ["Persisting drafts as internal case notes"],
    },
    {
      level: "L2",
      label: "Proactive insights",
      canDo: [
        "Surface daily triage and at-risk cohorts proactively in the home view",
        "Push weekly service-quality recap summaries",
        "Flag SLA-at-risk cases as they approach breach",
      ],
      mustNotDo: [
        "Take action on a case autonomously",
        "Re-route or reassign cases without approval",
      ],
      approvalRequiredFor: ["Posting recaps into shared channels"],
    },
    {
      level: "L3",
      label: "Approval-based action proposals",
      canDo: [
        "Propose specific actions (send draft, escalate, schedule follow-up) via the Approval Center",
        "Bundle multi-step recovery plays for one-click approval",
      ],
      mustNotDo: [
        "Execute any external send before approval",
        "Mark resolved, refund, or credit without approval",
      ],
      approvalRequiredFor: [
        "Sending any external message to the customer",
        "Escalating a case to another team or person",
        "Creating internal follow-up tasks tied to a customer",
      ],
    },
    {
      level: "L4",
      label: "Bounded pre-authorized automations",
      canDo: [
        "Auto-create internal triage tasks within user-defined queue rules",
        "Auto-tag and cluster incoming cases for the user's review",
        "Auto-schedule the daily triage and weekly recap missions",
      ],
      mustNotDo: [
        "Send external messages without per-action approval",
        "Mark cases resolved or close them",
        "Issue any refund, credit, or commercial concession",
      ],
      approvalRequiredFor: [
        "Any external-facing communication",
        "Any case-state mutation (status, owner, priority changes)",
      ],
    },
    {
      level: "L5",
      label: "Continuous operating support",
      canDo: [
        "Run continuous queue monitoring with live triage and pre-built proposals",
        "Maintain a live at-risk customer queue with recommended outreach",
        "Coordinate with CFO/Tech advisors on escalations and concession proposals",
      ],
      mustNotDo: [
        "Send external messages autonomously",
        "Refund, credit, close, or commit on the customer's account without approval",
        "Operate during a kill-switch halt on the support domain",
      ],
      approvalRequiredFor: [
        "Every external send",
        "Every case-state mutation",
        "Any cross-advisor commitment that touches the customer",
      ],
    },
  ],
  currentAuthorityCeiling: "L3-draft",

  // ── 12. Trust / Safety / Authority ──────────────────────────
  trustRules: [
    "Never sends external customer communication autonomously — drafts only, user approves and sends.",
    "Never issues refunds, credits, or commercial concessions — defers to CFO Advisor and the user.",
    "Never marks a case resolved or closes it without explicit user action.",
    "Always shows a confidence band on recommendations and flags low-confidence outputs (especially on tone-sensitive replies).",
    "Always cites which case fields, customer history, and policies informed a draft or escalation.",
    "Respects the global and support-domain kill-switch — halts all proactive activity when engaged.",
    "Honors workspace quiet-hours and per-domain autonomy policies before emitting any proactive signal.",
  ],
  disallowedAutonomousActions: [
    "Sending email or any external message to a customer without explicit approval",
    "Marking a case resolved, closed, or reassigning ownership",
    "Issuing refunds, credits, discounts, or any commercial concession",
    "Creating or modifying SLA terms",
    "Posting to public channels (status page, social) on the workspace's behalf",
  ],
  receiptedActions: [
    "Every drafted customer-facing message (even if not sent)",
    "Every proposed case mutation routed through the Approval Center",
    "Every proactive at-risk signal and SLA-breach alert emission",
    "Every cross-advisor handoff (e.g. escalation to CFO for refund review)",
  ],

  // ── 13. Explainability Requirements ─────────────────────────
  explainabilityRequirements: [
    "Show the specific case fields and prior messages used (with deep-links) for every draft.",
    "Distinguish between recommendation, draft, simulation, and proposed action with explicit labels.",
    "Surface the assumptions made (e.g. 'assuming the customer is on the Pro plan') and let the user correct them inline.",
    "Show alternative response angles considered and why the lead recommendation was chosen.",
    "Display a calibrated confidence band (low / medium / high) with the underlying signals listed.",
    "Link to the receipt for any drafted or proposed action so the user can audit later.",
    "When proposing escalation, name the role, the trigger, and the policy that justifies it.",
  ],

  // ── 14. Simulation Contract ─────────────────────────────────
  simulation: {
    summary:
      "Customer Service Advisor simulations let the user pressure-test response strategies, escalation policies, and recovery cadences against the same case context — before anything goes to the customer.",
    scenarios: [
      {
        id: "response-tone-comparison",
        label: "Compare response tones for a case",
        compares:
          "Two or three tone variants (empathetic-acknowledge, direct-resolve, investigative-transparent) for the same customer message.",
        requiredInputs: ["caseId", "tonesToCompare"],
        optionalInputs: ["customerHealthScore", "lastCsat", "lengthBudget"],
        outputs: ["draftPerTone", "predictedSentimentImpact", "rationalePerTone", "recommendedTone"],
        nonAuthoritative: false,
      },
      {
        id: "escalation-policy-comparison",
        label: "Compare escalation policies on the queue",
        compares:
          "Different escalation thresholds (e.g. by plan tier vs. by sentiment vs. hybrid) applied to today's open queue.",
        requiredInputs: ["policyVariants"],
        optionalInputs: ["windowDays", "includeResolved"],
        outputs: ["caseRoutingPerPolicy", "expectedEscalationVolume", "missedRiskCases", "recommendedPolicy"],
        nonAuthoritative: false,
      },
      {
        id: "recovery-cadence-comparison",
        label: "Compare recovery cadences after a low CSAT",
        compares:
          "Different multi-touch recovery sequences (e.g. 24h call + 7d check vs. 48h email + 14d survey) for a recently scored case.",
        requiredInputs: ["caseId", "cadenceVariants"],
        optionalInputs: ["customerTimezone", "channelMix"],
        outputs: ["touchPlanPerVariant", "expectedRecoveryLikelihood", "riskNotes", "recommendedCadence"],
        nonAuthoritative: false,
      },
      {
        id: "refund-vs-goodwill-framing",
        label: "Compare framings for a goodwill response (no refund authority)",
        compares:
          "Different framings of a goodwill acknowledgement that DO NOT commit money — the advisor never authorizes a refund, only frames the message.",
        requiredInputs: ["caseId", "framingAngles"],
        optionalInputs: ["pastConcessions", "accountValueTier"],
        outputs: ["draftPerFraming", "objectionLikelihood", "recommendedFraming"],
        nonAuthoritative: true,
      },
    ],
  },

  // ── 15. Memory / Learning ───────────────────────────────────
  memoryRules: [
    "Remembers workspace tone-of-voice rules, escalation policy, and SLA targets.",
    "Remembers per-customer corrections (e.g. 'this customer prefers direct, no preamble') for the lifetime of the account.",
    "Remembers user-confirmed response patterns that earned high CSAT, to reuse as playbook entries.",
    "Forgets resolved-case detail beyond the configured retention window, keeping only structural patterns.",
    "Never carries memory across workspaces — each workspace's customers and policies are isolated.",
    "Surfaces all remembered facts in the Spec/Memory drawer and lets the user edit or delete any entry.",
  ],

  // ── 16. Proactive Behavior ──────────────────────────────────
  proactiveSignals: [
    {
      trigger: "An open high/urgent case crosses the 24-hour age threshold",
      surface: "Customer Service Advisor home → Urgent shelf + Approval Center proposal",
      cadence: "real-time",
      mode: "action-oriented",
      approvalRequired: true,
    },
    {
      trigger: "Daily triage window (workspace timezone-aware)",
      surface: "Customer Service Advisor home → Triage card + ranked queue",
      cadence: "daily",
      mode: "suggested",
      approvalRequired: false,
    },
    {
      trigger: "Weekly service-quality recap window",
      surface: "Customer Service Advisor home → Weekly recap + Boardroom dispatch",
      cadence: "weekly",
      mode: "suggested",
      approvalRequired: false,
    },
    {
      trigger: "A customer's health score drops below 40 with an open case",
      surface: "Case workspace → at-risk banner + recommended outreach",
      cadence: "event-driven",
      mode: "action-oriented",
      approvalRequired: true,
    },
    {
      trigger: "A new issue cluster reaches >=3 cases within 7 days",
      surface: "Cluster view → cluster card + escalation suggestion to Tech Advisor",
      cadence: "event-driven",
      mode: "suggested",
      approvalRequired: false,
    },
  ],

  // ── 17. Knowledge / Document Support ────────────────────────
  knowledgeSources: [
    {
      label: "Tone-of-voice & escalation policy",
      extracts: "Approved phrasing, forbidden phrases, escalation thresholds and named owner roles",
      scope: "workspace",
      sensitivity: "medium",
    },
    {
      label: "SLA policy & response targets",
      extracts: "Per-tier first-response and resolution targets, breach handling rules",
      scope: "workspace",
      sensitivity: "medium",
    },
    {
      label: "Knowledge-base articles",
      extracts: "Canonical answers, troubleshooting steps, known-issues coverage",
      scope: "workspace",
      sensitivity: "low",
    },
    {
      label: "Customer account notes (CRM/CS)",
      extracts: "Plan tier, prior incidents, sales-to-CS handoff context",
      scope: "workspace",
      sensitivity: "high",
    },
    {
      label: "Incident / status-page history",
      extracts: "Recent outages or degradations relevant to the case timeframe",
      scope: "workspace",
      sensitivity: "medium",
    },
  ],

  // ── 18. Analytics / Instrumentation ─────────────────────────
  analyticsEvents: [
    "cs_advisor.invocation (capability_key, case_id, prompt_class)",
    "cs_advisor.draft_used (case_id, tone, sent | edited | discarded)",
    "cs_advisor.escalation_proposed (case_id, target_role, accepted | rejected)",
    "cs_advisor.proactive_signal_fired (signal_kind, case_id | customer_id, surface)",
    "cs_advisor.simulation_run (scenario_id, variants_count)",
    "cs_advisor.approval_outcome (action_type, decision, latency_ms)",
    "cs_advisor.cluster_detected (cluster_id, case_count, root_cause_hypothesis)",
    "cs_advisor.feedback (case_id, rating, useful | not_useful)",
  ],

  // ── 19. Admin Oversight ─────────────────────────────────────
  adminOversightSurfaces: [
    "Adoption dashboard: weekly active users, top use cases, draft-acceptance rate",
    "Failure log: low-confidence outputs, refused requests, simulation timeouts",
    "Approval audit: approval rate, mean approval latency, rejection reasons by action_type",
    "Receipt browser: every drafted/proposed action filterable by user, customer, and case",
    "Cross-advisor escalation log: when and why CS escalated to CFO/Tech/Taxes/Sales/CEO",
    "Kill-switch & autonomy state: domain-scoped halts and current authority ceiling",
    "Cluster review queue: detected issue clusters awaiting engineering acknowledgement",
  ],

  // ── 20. Testing Matrix ──────────────────────────────────────
  testingMatrix: [
    {
      category: "unit",
      scenarios: [
        "Priority scorer combines urgency × value × SLA distance deterministically on fixture cases",
        "At-risk classifier flags health_score < 40 with an open case",
        "Escalation router maps trigger → owner role per workspace policy",
      ],
    },
    {
      category: "component",
      scenarios: [
        "AdvisorSpecPanel renders all 23 sections of the Customer Service Advisor spec",
        "CustomerServiceHeaderStats renders skeletons, then live counts honestly",
        "Draft drawer renders multi-tone variants with rationale tabs",
      ],
    },
    {
      category: "integration",
      scenarios: [
        "Customer Service Advisor reads support_cases and emits a draft into the case composer",
        "Approval Center receives proposed escalations and reflects status changes",
        "Standing-mission run for daily triage emits a signal and a receipt",
      ],
    },
    {
      category: "e2e",
      scenarios: [
        "User asks for a response draft on an urgent case, approves it, and the receipt appears",
        "Daily triage proactively surfaces ranked queue and the user dismisses one with feedback",
      ],
    },
    {
      category: "regression",
      scenarios: [
        "Spec validator passes for CUSTOMER_SERVICE_ADVISOR_SPEC (no stubs, all sections complete)",
        "Authority ceiling stays at L3-draft until explicitly raised by admin",
      ],
    },
    {
      category: "error-state",
      scenarios: [
        "Missing case record produces a structured 'missing inputs' response, not a guess",
        "Provider failure during draft generation surfaces a recoverable error in the UI",
      ],
    },
    {
      category: "explainability",
      scenarios: [
        "Every draft exposes the case fields and customer history used and the assumptions made",
        "Confidence band is rendered and matches the underlying signal count",
      ],
    },
    {
      category: "receipt",
      scenarios: [
        "ai_action_receipt is created for every draft and every proposed escalation",
        "Receipt rollback token is present for any L4 auto-task creation",
      ],
    },
    {
      category: "authority",
      scenarios: [
        "L3 attempt to send external email is blocked and routed to Approval Center",
        "Refund/credit attempt is blocked and routed to CFO Advisor escalation",
        "Kill-switch engaged on support domain halts all proactive signals immediately",
      ],
    },
    {
      category: "simulation",
      scenarios: [
        "response-tone-comparison returns one draft per tone plus a recommendedTone",
        "refund-vs-goodwill-framing output is flagged nonAuthoritative=true in the UI",
      ],
    },
    {
      category: "module-integration",
      scenarios: [
        "Support module exposes drafts in the case composer but never accepts an autonomous send from the advisor",
        "Boardroom synthesis ingests CSAT-trend signals and they appear in the CEO Advisor view",
      ],
    },
  ],

  // ── 21. Definition of Done ──────────────────────────────────
  definitionOfDone: [
    "All 9 core use cases are functional against real support_cases / customers data, not fixtures",
    "Required inputs are wired from the Support and Customers modules with typed adapters",
    "Customer Service Advisor home, case workspace pane, and Spec tab are implemented and accessible",
    "Trust model enforced: external sends and refunds always routed through Approval Center / CFO escalation",
    "Authority ceiling enforced at L3-draft via business-advisor-runtime",
    "Explainability drawer renders fields used, assumptions, alternatives, and confidence",
    "All 4 simulation scenarios are runnable and produce the documented output keys",
    "ai_action_receipts are emitted for every drafted and proposed action",
    "All 11 testing-matrix categories have at least one passing automated test",
    "Analytics events are instrumented and visible in the admin adoption dashboard",
    "Empty, loading, and error states are honest (no demo placeholders) on every surface",
    "Standing missions for daily triage and weekly service-quality recap are registered and gated by kill-switch",
    "Cross-advisor escalation paths to CFO/Tech/Taxes/Sales/CEO are wired and observable in admin",
    "Spec is registered, passes validateAdvisorSpec, and renders in the Spec tab with no warnings",
  ],

  // ── 22. Phase Roadmap ───────────────────────────────────────
  roadmap: {
    phase1: {
      title: "Deployable core — triage, drafts, and at-risk surfacing",
      outcomes: [
        "Triage queue with priority scoring and rationale on real cases",
        "Multi-tone response drafts with rationale and confidence",
        "Header stats + at-risk customer surfacing with contributing signals",
        "Spec tab live, receipts emitted, kill-switch respected",
      ],
    },
    phase2: {
      title: "Deeper intelligence — clusters, simulations, and integrations",
      outcomes: [
        "Issue-cluster detection with cited case ids and proposed root cause",
        "All 4 simulation scenarios live in the simulation panel",
        "Cross-advisor escalation flows to CFO/Tech/Taxes wired and observable",
        "Approval Center bundles for multi-touch recovery sequences",
      ],
    },
    phase3: {
      title: "Bounded automation — pre-authorized triage and continuous monitoring",
      outcomes: [
        "L4 auto-tagging and clustering of incoming cases within user-defined rules",
        "Continuous at-risk customer queue with recommended outreach and daily recap",
        "Boardroom dispatch of CSAT and at-risk signals into the CEO synthesis layer",
        "Auto-detected playbook entries from response patterns the user accepted",
      ],
    },
  },

  // ── 23. Wow Differentiators ─────────────────────────────────
  wowDifferentiators: [
    "Feels like a senior support lead reading every case with you — drafts are calibrated to the customer's history, plan tier, and emotional state, not a generic apology template.",
    "Multi-tone drafts (empathetic / direct / investigative) with explicit pros/cons let the user pick the move instead of accepting one safe reply.",
    "At-risk surfacing connects health scores, sentiment, and case patterns into a ranked recovery queue — no more discovering churn after the fact.",
    "Issue-cluster detection turns scattered tickets into named root-cause hypotheses ready for engineering escalation, with cited example cases.",
    "Every output cites the case fields and policies it used, with a confidence band you can trust and a receipt you can audit — and refunds are always routed to CFO, never auto-issued.",
  ],
};

// Side-effect: register on import.
registerAdvisorSpec(CUSTOMER_SERVICE_ADVISOR_SPEC);
