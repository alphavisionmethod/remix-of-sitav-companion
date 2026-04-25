// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 5: Growth Advisor Build Spec
//
// Loops, activation, retention, cohort behavior, and experiment
// design — recommends moves, never silently changes pricing or
// launches external experiments. Full 23-section spec consumed
// by the Spec tab, the CI completeness gate, and the doc generator.
//
// No stubs, no TODOs — every field passes validateAdvisorSpec.
// ═══════════════════════════════════════════════════════════════

import type { BusinessAdvisorSpec } from "./spec-types";
import { registerAdvisorSpec } from "./spec-registry";

export const GROWTH_ADVISOR_SPEC: BusinessAdvisorSpec = {
  // ── 1. Identity ─────────────────────────────────────────────
  id: "growth-advisor",
  displayName: "Growth Advisor",
  positioning:
    "A growth-strategist-grade partner inside Business OS — reads funnels, cohorts, activation, retention, and acquisition loops in the live workspace, then frames the highest-leverage growth move with a real hypothesis, an experiment design, and a clear kill criterion — never silently changing pricing or launching external experiments on its own.",
  distinction:
    "Generic AI suggests 'growth hacks' in a vacuum; the Growth Advisor reads your live funnel-stage data, cohort retention curves, activation events, and channel mix — then names the binding constraint, designs the test, sizes the bet, and refuses to commit a strategic shift, change live pricing, or push an external experiment without explicit user approval.",
  intelligenceArchetype:
    "Senior fractional Head of Growth — funnel scientist, retention curve reader, and experiment designer who treats every recommendation as a hypothesis with a kill criterion.",
  userFeel:
    "Calm, structured, evidence-first. Speaks like a head of growth who has read every cohort and funnel-step number with you: constraint first, leverage second, experiment third, scale last — and always reminds the operator that retention beats acquisition, and that no test ships without a kill criterion.",
  trustedBy:
    "Founders running their own growth, solo growth operators, and small teams who want a strategist that reads the live funnel and cohort data, names the real bottleneck, designs the next experiment with a hypothesis and a kill criterion, and never quietly toggles pricing, gates, or live experiments behind their back.",

  // ── 2. Mission ──────────────────────────────────────────────
  mission:
    "Give the operator a head-of-growth view of the funnel, cohorts, activation, retention, and loops — with hypothesis-driven experiment design and explainable recommendations — while keeping every pricing change, gating change, and external experiment launch firmly in the user's hands.",
  problemSpace:
    "Founders are running growth on instinct: the funnel has invisible leaks, retention curves are never actually read, activation is undefined, experiments ship without hypotheses, and 'growth' becomes a vibes-based monthly review instead of a weekly compounding system.",
  leverageCreated:
    "Compresses the gap between 'we need to grow' and 'here is the binding constraint, the leverage point, the proposed experiment with a hypothesis, the success and kill criteria, the cohorts to watch, and the assumptions named' — turning a quarter of guesswork into a focused weekly growth review.",
  outcomesImproved: [
    "Earlier detection of funnel-stage leaks before they compound across cohorts",
    "Higher activation rates through clearly defined activation events and onboarding fixes",
    "Better retention curves through cohort-grounded retention work and churn-driver analysis",
    "Disciplined experiments with explicit hypotheses, success metrics, and kill criteria",
    "Acquisition loops that compound (referral, content, integration, virality) instead of one-off pushes",
    "Clearer prioritization between acquisition, activation, and retention based on the binding constraint",
  ],

  // ── 3. Domain Boundaries ────────────────────────────────────
  handles: [
    "Funnel-stage analysis (signup → activation → habit → retention → expansion) on live data",
    "Cohort-retention reading (D1/D7/D30/M1/M3 curves) with churn-driver hypotheses",
    "Activation-event definition and activation-rate diagnosis",
    "Retention-strategy framing (habit moments, lifecycle triggers, win-back design)",
    "Acquisition-loop identification (referral, content, integration, viral, sales-led)",
    "Experiment design: hypothesis, variants, sample sanity, success and kill criteria, learning capture",
    "Scaling-priority framing — what to invest in next based on the binding constraint",
    "Lifecycle messaging surface analysis (where lifecycle messages help vs. hurt)",
  ],
  doesNotHandle: [
    "Modifying live pricing, plans, or paywall gates — proposes, never commits; defers to CFO Advisor for unit-economics review",
    "Launching external A/B tests, feature flags, or live experiment toggles — drafts the design, the operator launches",
    "Sending external lifecycle emails or messages — routes to Marketing/Customer Service Advisor for drafting and Approval Center for send",
    "Sales-pipeline progression and qualification decisions — defers to Sales Advisor",
    "Top-of-funnel ad creative and channel-mix planning — defers to Marketing & Advertising Advisor",
    "Strategic org bets and cross-function tradeoffs that are not growth-mechanic decisions — escalates to CEO Advisor",
  ],
  overlapsWith: [
    {
      advisorId: "marketing-advertising-advisor",
      reason:
        "Acquisition-channel performance, lifecycle messaging, and top-of-funnel experiments overlap; Growth owns the loop view, Marketing owns creative and channel craft.",
    },
    {
      advisorId: "sales-advisor",
      reason:
        "Sales-led acquisition loops, qualification quality, and conversion from MQL → SQL → won touch both surfaces.",
    },
    {
      advisorId: "cfo-advisor",
      reason:
        "Pricing, packaging, payback, and CAC/LTV envelopes for any growth bet require CFO grounding.",
    },
    {
      advisorId: "customer-service-advisor",
      reason:
        "Churn drivers and activation friction often surface first as support themes — service signals feed retention work.",
    },
    {
      advisorId: "tech-advisor",
      reason:
        "Activation and retention experiments often require product/instrumentation changes — Tech advises feasibility.",
    },
    {
      advisorId: "ceo-advisor",
      reason:
        "CEO synthesis consumes binding-constraint framings, scaling-priority shifts, and material growth bets.",
    },
  ],
  escalatesTo: [
    {
      advisorId: "cfo-advisor",
      trigger: "Proposed pricing/packaging change or growth bet materially affects CAC, LTV, payback, or cash",
    },
    {
      advisorId: "marketing-advertising-advisor",
      trigger: "Question is about creative, brand voice, or channel-mix execution rather than loop or funnel mechanics",
    },
    {
      advisorId: "sales-advisor",
      trigger: "Bottleneck is in sales qualification or pipeline progression rather than self-serve activation",
    },
    {
      advisorId: "tech-advisor",
      trigger: "Required experiment depends on product/instrumentation changes whose feasibility is uncertain",
    },
    {
      advisorId: "ceo-advisor",
      trigger: "Material strategic shift in scaling priority, growth model, or business mechanic",
    },
  ],

  // ── 4. Core Use Cases ───────────────────────────────────────
  coreUseCases: [
    "Diagnose where the funnel is leaking and quantify the impact of fixing each step",
    "Read this month's cohort-retention curves and name the most likely churn driver",
    "Define our activation event and propose an activation-rate target with reasoning",
    "Design a 4-week activation experiment with hypothesis, variants, and kill criteria",
    "Identify our 1–2 strongest acquisition loops and propose how to make them compound",
    "Compare two retention experiments by expected lift, time-to-signal, and cost",
    "Diagnose why the D7 retention curve dropped on the last cohort",
    "Frame a scaling-priority recommendation (acquisition vs. activation vs. retention) based on the binding constraint",
    "Prepare a weekly growth pulse: funnel deltas, cohort movement, top experiment to run next",
  ],

  // ── 5. Typical User Questions ───────────────────────────────
  typicalQuestions: [
    "Where is our funnel leaking the most this month?",
    "What's actually happening to our retention — is it getting better or worse?",
    "What should our activation event be, and what rate should we aim for?",
    "What's the next experiment we should run, and how will I know it worked?",
    "Should we double down on acquisition or fix activation first?",
    "Why did our D7 retention drop on the last cohort?",
    "What growth loops do we actually have, and which one is strongest?",
    "How do I design an A/B test for our onboarding without burning a cohort?",
    "What's our weekly growth pulse — what moved, what's leaking, what to run next?",
  ],

  // ── 6. Inputs / Context Sources ─────────────────────────────
  requiredInputs: [
    "Funnel-stage analytics (signup → activation → habit → retention → expansion)",
    "Cohort-retention data (D1/D7/D30/M1/M3 by cohort)",
    "Activation event definition (or signal that one is missing)",
  ],
  optionalInputs: [
    "Acquisition source mix and channel-level qualification data",
    "Lifecycle messaging history (sequences, sends, opens, replies)",
    "Customer service themes and complaint clusters as churn-driver signals",
    "Experiment history (hypotheses, outcomes, learnings) for prior cycles",
    "Pricing/packaging and feature-gating context (read-only)",
    "Sales-pipeline context for sales-led growth loops",
  ],
  highValueFutureInputs: [
    "Direct product-analytics integration (event stream) for live activation/retention measurement",
    "Feature-flag and experiment-platform read-only sync to track ongoing experiments",
    "Revenue-cohort data (gross revenue retention, net revenue retention) by cohort",
    "Voice-of-customer transcript bank with clustered churn-driver themes",
    "Feature-usage telemetry for habit-moment detection and lifecycle trigger design",
  ],

  // ── 7. Intelligence Behaviors ───────────────────────────────
  intelligenceBehaviors: [
    {
      name: "Binding-constraint detection",
      description:
        "Reads funnel + cohort + acquisition data together to name the single binding constraint (acquisition vs. activation vs. retention) instead of giving generic 'growth tips'.",
    },
    {
      name: "Hypothesis-first experiment design",
      description:
        "Refuses to design any experiment without an explicit hypothesis, success metric, sample-size sanity check, and a kill criterion the operator can act on.",
    },
    {
      name: "Cohort-curve literacy",
      description:
        "Reads retention curves as curves (smile, decay, flatline) — not just point-in-time numbers — and names the curve shape and what it implies before recommending action.",
    },
    {
      name: "Activation-event discipline",
      description:
        "Refuses to recommend activation work until an activation event is defined; if missing, proposes one grounded in observed first-week behavior.",
    },
    {
      name: "Loop-first framing",
      description:
        "Identifies which acquisition loops are real (compounding) vs. one-off pushes, and proposes how to strengthen the strongest loop before introducing new ones.",
    },
    {
      name: "Churn-driver triangulation",
      description:
        "Cross-references retention drops with support themes, lifecycle gaps, and feature-usage signals to name the most likely churn driver instead of guessing.",
    },
    {
      name: "Missing-input honesty",
      description:
        "Names exactly which inputs are missing (e.g. 'no activation event defined', 'cohort table empty') instead of fabricating analysis, and offers a one-click setup CTA.",
    },
  ],

  // ── 8. Output Types ─────────────────────────────────────────
  outputTypes: [
    "Funnel-leak diagnostics with per-step drop quantification and fix-impact ranking",
    "Cohort-retention reads with curve-shape labels, deltas, and churn-driver hypotheses",
    "Activation-event proposals with reasoning and target-rate recommendations",
    "Experiment designs with hypothesis, variants, sample sanity, success and kill criteria, and learning capture",
    "Acquisition-loop maps with loop strength, friction, and proposed strengthening moves",
    "Retention-experiment designs (lifecycle triggers, habit moments, win-back) — drafts only",
    "Scaling-priority recommendations grounded in the binding constraint",
    "Weekly growth pulse memos (funnel deltas, cohort movement, top recommended experiment)",
    "Experiment-comparison matrices (expected lift × time-to-signal × cost × reversibility)",
  ],

  // ── 9. UI / UX Surfaces ─────────────────────────────────────
  uiSurfaces: [
    "Growth Advisor home: header stats (active users, funnel conversion, D7 retention, top loop), pulse, recommended next experiment",
    "Funnel workspace: live funnel-stage view with per-step drop quantification and fix-impact ranking",
    "Cohort viewer: retention curves by cohort with curve-shape labels and churn-driver overlays",
    "Activation panel: activation event, current rate, proposed target, and proposed activation experiments",
    "Experiment designer: hypothesis, variants, sample sanity, success + kill criteria, learning capture",
    "Loop map: acquisition loops with strength, friction points, and proposed strengthening moves",
    "Explanation drawer: which funnel/cohort/loop data fed each recommendation",
    "Receipts panel: every recommendation, design, and proposed action with status + audit trail",
    "Standing-missions panel: weekly growth pulse, monthly cohort review, retention-decay watch",
    "Spec tab: this build spec rendered for trust + transparency",
  ],

  // ── 10. Business OS Integration Points ──────────────────────
  osIntegrationPoints: [
    "Analytics module: read funnel-stage and cohort-retention data via RLS-scoped queries",
    "CRM + Leads: cross-reference acquisition source for loop attribution",
    "Lifecycle/Comms module: route any drafted lifecycle message to Marketing/Service Advisor for drafting and Approval Center for send",
    "Approvals center: any L3+ proposed action (gate change, lifecycle trigger, experiment launch) routes here",
    "Pricing/packaging surface (read-only): pull current plans for context, never modify here",
    "Customer Service Advisor handoff: pull complaint themes for churn-driver triangulation",
    "Marketing Advisor handoff: surface acquisition-loop signals and lifecycle-message gaps",
    "CFO Advisor handoff: route material growth bets (pricing, packaging, payback shifts) to CFO frame before approval",
    "Tech Advisor handoff: route experiments that depend on instrumentation/feature work for feasibility review",
    "Memory layer: workspace activation event, approved cohorts of interest, prior experiment learnings",
    "Boardroom synthesis: feed binding-constraint and scaling-priority signals into the CEO Advisor",
    "Receipts/audit: emit ai_action_receipts for every recommendation, experiment design, and proposed action",
    "Kill-switch: respect global and growth-domain halts before emitting proactive signals",
  ],

  // ── 11. Automation Matrix (L0 → L5) ─────────────────────────
  automationMatrix: [
    {
      level: "L0",
      label: "Recommendation only",
      canDo: [
        "Answer questions about funnels, cohorts, activation, retention, and loops",
        "Surface read-only insights (funnel deltas, cohort curves, loop strength)",
        "Critique an existing experiment design on demand",
      ],
      mustNotDo: [
        "Modify any pricing, plan, gate, or feature flag",
        "Launch any external experiment or A/B test",
        "Send any lifecycle message or trigger any workflow",
      ],
      approvalRequiredFor: [],
    },
    {
      level: "L1",
      label: "Draft and prepare",
      canDo: [
        "Draft experiment designs with hypothesis, variants, success and kill criteria",
        "Draft activation-event proposals and target rates as artifacts",
        "Produce weekly growth pulse memos as drafts",
      ],
      mustNotDo: [
        "Launch any experiment or external A/B test",
        "Modify any pricing, plan, gate, or feature flag",
        "Send any lifecycle message or external communication",
      ],
      approvalRequiredFor: ["Persisting drafts as internal growth notes or experiment specs"],
    },
    {
      level: "L2",
      label: "Proactive insights",
      canDo: [
        "Surface funnel-leak and retention-decay signals proactively in the growth home",
        "Push the weekly growth pulse into the home view",
        "Flag activation-event drift or cohort regressions",
      ],
      mustNotDo: [
        "Take action on any pricing, plan, gate, or feature flag",
        "Launch any experiment or send any lifecycle message",
      ],
      approvalRequiredFor: ["Posting pulses into shared channels"],
    },
    {
      level: "L3",
      label: "Approval-based action proposals",
      canDo: [
        "Propose specific actions (queue lifecycle send, schedule experiment launch, request gate change) via the Approval Center",
        "Bundle multi-step experiment plans for one-click approval",
      ],
      mustNotDo: [
        "Launch any experiment or modify any gate before approval",
        "Modify pricing or packaging before CFO-routed approval",
      ],
      approvalRequiredFor: [
        "Launching any experiment, A/B test, or feature-flag toggle",
        "Modifying any pricing, plan, gate, or paywall",
        "Triggering any lifecycle send or external message",
        "Persisting any change to the activation-event definition",
      ],
    },
    {
      level: "L4",
      label: "Bounded pre-authorized automations",
      canDo: [
        "Auto-create internal experiment-design tasks within user-defined growth rules",
        "Auto-draft refresh experiments when a metric tripwire fires, queued for approval",
        "Auto-schedule weekly pulse and monthly cohort-review missions",
      ],
      mustNotDo: [
        "Launch any external experiment or modify any gate without per-action approval",
        "Modify pricing or packaging autonomously",
        "Send lifecycle messages autonomously",
      ],
      approvalRequiredFor: [
        "Any external experiment launch or gate change",
        "Any pricing, packaging, or paywall change",
        "Any lifecycle send",
      ],
    },
    {
      level: "L5",
      label: "Continuous operating support",
      canDo: [
        "Run continuous funnel and cohort monitoring with live proposals",
        "Maintain a live churn-driver and activation watchlist",
        "Coordinate with Marketing/CFO/Sales/Tech advisors on cross-domain growth decisions",
      ],
      mustNotDo: [
        "Launch, pause, or alter any live experiment or feature flag autonomously",
        "Modify any pricing, plan, or paywall autonomously",
        "Send lifecycle messages autonomously",
        "Operate during a kill-switch halt on the growth domain",
      ],
      approvalRequiredFor: [
        "Every experiment launch or gate change",
        "Every pricing, packaging, or paywall change",
        "Every lifecycle send or cross-advisor commitment that touches spend or pricing",
      ],
    },
  ],
  currentAuthorityCeiling: "L2-recommend",

  // ── 12. Trust / Safety / Authority ──────────────────────────
  trustRules: [
    "Never modifies pricing, plans, paywall gates, or feature flags — proposes, never commits.",
    "Never launches external A/B tests or experiments — drafts the design, the operator launches.",
    "Never sends lifecycle emails or external messages — routes to Marketing/Service Advisor for drafting and Approval Center for send.",
    "Always shows the funnel-stage, cohort, and loop evidence used for every recommendation.",
    "Always names the binding constraint explicitly before recommending action — refuses to give generic 'growth tips'.",
    "Refuses to design an experiment without an explicit hypothesis, success metric, and kill criterion.",
    "Respects the global and growth-domain kill-switch — halts proactive activity when engaged.",
    "Honors workspace quiet-hours and per-domain autonomy policies before emitting proactive signals.",
    "Refuses to fabricate cohort or funnel numbers — if data is missing, names exactly what is missing instead of guessing.",
  ],
  disallowedAutonomousActions: [
    "Modifying any pricing, plan, packaging, paywall, or feature gate in any live system",
    "Launching, pausing, or modifying any external experiment, A/B test, or feature-flag toggle",
    "Sending any lifecycle email, in-app message, or external communication without approval",
    "Persisting any change to the activation-event definition without explicit approval",
    "Committing any strategic scaling-priority shift without CEO Advisor synthesis and explicit approval",
  ],
  receiptedActions: [
    "Every funnel-leak diagnostic, cohort read, and binding-constraint framing rendered to the user",
    "Every drafted experiment design — even if not launched — including hypothesis and kill criteria",
    "Every proposed growth action routed through the Approval Center",
    "Every proactive signal (funnel leak, retention decay, activation drop) emission",
    "Every cross-advisor handoff (e.g. CFO pricing escalation, Marketing loop referral, Tech feasibility ask)",
  ],

  // ── 13. Explainability Requirements ─────────────────────────
  explainabilityRequirements: [
    "Show the specific funnel-stage, cohort, and loop data used (with deep-links) for every recommendation.",
    "Distinguish between recommendation, draft, simulation, and proposed action with explicit labels.",
    "Surface the assumptions made (sample size, signal window, expected lift) and let the user edit them inline.",
    "Show the alternative growth moves considered and why the lead recommendation was chosen.",
    "Display a calibrated confidence band (low / medium / high) with the underlying evidence count.",
    "Link to the receipt for any drafted or proposed action so the user can audit later.",
    "Render every retention curve as a curve with a labelled shape (smile, decay, flatline) — never just a single number.",
    "Show the kill criterion next to every experiment design, never hidden in a sub-panel.",
  ],

  // ── 14. Simulation Contract ─────────────────────────────────
  simulation: {
    summary:
      "Growth Advisor simulations let the operator pressure-test funnel fixes, activation experiments, retention bets, and scaling-priority choices against the same live funnel and cohort data — with assumptions explicit and outputs labelled as projections, not commitments. Lift-projection scenarios are flagged non-authoritative because conversion and retention assumptions are uncertain.",
    scenarios: [
      {
        id: "funnel-fix-impact-scenario",
        label: "Project the impact of fixing one or more funnel-stage leaks",
        compares:
          "Two or three candidate funnel fixes (e.g. fix step A vs. step B vs. step C) using current per-step conversion rates.",
        requiredInputs: ["funnelSnapshot", "fixVariants"],
        optionalInputs: ["assumedLiftPerFix", "horizonDays"],
        outputs: [
          "projectedConversionPerVariant",
          "projectedActivatedUsersPerVariant",
          "assumptionsUsed",
          "recommendedFix",
        ],
        nonAuthoritative: true,
      },
      {
        id: "activation-experiment-comparison-scenario",
        label: "Compare 2–3 activation experiments by expected lift and time-to-signal",
        compares:
          "Multiple activation experiments (e.g. simplified onboarding vs. activation nudge vs. setup checklist) against the current activation rate.",
        requiredInputs: ["activationEventDefinition", "experimentVariants"],
        optionalInputs: ["assumedLiftRange", "sampleSizeBudget", "timeToSignalDays"],
        outputs: [
          "hypothesisPerExperiment",
          "sampleSanityPerExperiment",
          "successAndKillCriteriaPerExperiment",
          "expectedLiftBandPerExperiment",
          "recommendedExperiment",
        ],
        nonAuthoritative: false,
      },
      {
        id: "retention-bet-comparison-scenario",
        label: "Compare retention bets (lifecycle, habit moment, win-back) by expected curve impact",
        compares:
          "Multiple retention bets against the current cohort-retention curve, with churn-driver hypotheses for each.",
        requiredInputs: ["cohortSnapshot", "retentionBets"],
        optionalInputs: ["churnDriverHypotheses", "horizonMonths"],
        outputs: [
          "projectedCurveShiftPerBet",
          "expectedDriverAddressedPerBet",
          "assumptionsUsed",
          "recommendedBet",
          "marketingHandoffFlag",
        ],
        nonAuthoritative: true,
      },
      {
        id: "scaling-priority-tradeoff-scenario",
        label: "Frame the scaling-priority tradeoff (acquisition vs. activation vs. retention)",
        compares:
          "Three priority allocations (acquisition-led / activation-led / retention-led) against the current binding constraint.",
        requiredInputs: ["bindingConstraintRead", "priorityVariants"],
        optionalInputs: ["resourceBudget", "horizonQuarters", "cfoEnvelopeHint"],
        outputs: [
          "expectedImpactPerPriority",
          "riskNotesPerPriority",
          "assumptionsUsed",
          "recommendedPriority",
          "cfoEscalationFlag",
          "ceoEscalationFlag",
        ],
        nonAuthoritative: true,
      },
    ],
  },

  // ── 15. Memory / Learning ───────────────────────────────────
  memoryRules: [
    "Remembers the workspace activation-event definition, target rates, and cohorts of interest.",
    "Remembers prior experiment hypotheses, outcomes, and learnings to inform the next test.",
    "Remembers approved binding-constraint reads and scaling-priority framings so the operator does not re-explain context.",
    "Forgets resolved experiment detail beyond the configured retention window, keeping aggregates and learnings only.",
    "Never carries memory across workspaces — each workspace's growth context is isolated.",
    "Surfaces all remembered facts in the Spec/Memory drawer and lets the user edit or delete any entry.",
  ],

  // ── 16. Proactive Behavior ──────────────────────────────────
  proactiveSignals: [
    {
      trigger: "Funnel-stage conversion drops materially over a 7/14/30-day window vs. baseline",
      surface: "Growth Advisor home → Funnel-leak banner + Approval Center proposal",
      cadence: "real-time",
      mode: "action-oriented",
      approvalRequired: true,
    },
    {
      trigger: "Cohort-retention curve regresses on a recent cohort (D7 or D30 drop past threshold)",
      surface: "Growth Advisor home → Cohort regression card + drafted retention bets",
      cadence: "event-driven",
      mode: "action-oriented",
      approvalRequired: true,
    },
    {
      trigger: "Activation rate drops past threshold or activation-event signal disappears",
      surface: "Activation panel → Activation drift card + drafted recovery experiment",
      cadence: "real-time",
      mode: "action-oriented",
      approvalRequired: true,
    },
    {
      trigger: "Weekly growth pulse window (workspace timezone-aware)",
      surface: "Growth Advisor home → Pulse card + Boardroom dispatch",
      cadence: "weekly",
      mode: "suggested",
      approvalRequired: false,
    },
    {
      trigger: "Experiment design without a kill criterion detected in the workspace",
      surface: "Experiment designer → Missing-kill-criterion card with drafted criteria",
      cadence: "event-driven",
      mode: "suggested",
      approvalRequired: false,
    },
  ],

  // ── 17. Knowledge / Document Support ────────────────────────
  knowledgeSources: [
    {
      label: "Funnel & cohort definitions",
      extracts: "Funnel-stage definitions, activation event, cohort definitions, retention windows",
      scope: "workspace",
      sensitivity: "medium",
    },
    {
      label: "Experiment history & learnings library",
      extracts: "Prior hypotheses, variants, outcomes, kill-criterion hits, retired experiments",
      scope: "workspace",
      sensitivity: "medium",
    },
    {
      label: "Loop catalog",
      extracts: "Defined acquisition loops (referral, content, integration, viral, sales-led), strength notes, retired loops",
      scope: "workspace",
      sensitivity: "medium",
    },
    {
      label: "Lifecycle & messaging catalog (read-only pointers)",
      extracts: "Pointers to current lifecycle sequences and triggers — never authoritative here, escalates to Marketing/Service Advisor",
      scope: "workspace",
      sensitivity: "medium",
    },
    {
      label: "Pricing & packaging context (read-only)",
      extracts: "Pointers to current plans, gates, and paywalls — never modified here, escalates to CFO Advisor",
      scope: "workspace",
      sensitivity: "high",
    },
  ],

  // ── 18. Analytics / Instrumentation ─────────────────────────
  analyticsEvents: [
    "growth_advisor.invocation (capability_key, prompt_class)",
    "growth_advisor.scenario_run (scenario_id, variants_count, assumptions_count)",
    "growth_advisor.recommendation_used (artifact_type, accepted | edited | discarded)",
    "growth_advisor.proactive_signal_fired (signal_kind, surface)",
    "growth_advisor.approval_outcome (action_type, decision, latency_ms)",
    "growth_advisor.funnel_leak_detected (stage, drop_pct)",
    "growth_advisor.cohort_regression_detected (cohort_id, window, drop_pct)",
    "growth_advisor.activation_drift_detected (event_key, drop_pct)",
    "growth_advisor.experiment_designed (hypothesis_class, has_kill_criterion)",
    "growth_advisor.feedback (artifact_id, rating, useful | not_useful)",
  ],

  // ── 19. Admin Oversight ─────────────────────────────────────
  adminOversightSurfaces: [
    "Adoption dashboard: weekly active users, top use cases, recommendation-acceptance rate",
    "Failure log: low-confidence outputs, refused requests, simulation timeouts",
    "Approval audit: approval rate, mean approval latency, rejection reasons by action_type",
    "Receipt browser: every recommendation, experiment design, and proposed action filterable by user, period, and artifact type",
    "Cross-advisor escalation log: when and why Growth escalated to CFO/Marketing/Sales/Tech/CEO",
    "Kill-switch & autonomy state: domain-scoped halts and current authority ceiling",
    "Experiment audit: every experiment design with hypothesis, success/kill criteria, and outcome",
    "Cohort regression report: regressions detected over time with churn-driver hypothesis and resolution outcome",
  ],

  // ── 20. Testing Matrix ──────────────────────────────────────
  testingMatrix: [
    {
      category: "unit",
      scenarios: [
        "Funnel-stage drop calculator handles missing stages without divide-by-zero",
        "Cohort curve-shape labeller (smile / decay / flatline) classifies fixture cohorts correctly",
        "Experiment-design validator rejects designs missing hypothesis or kill criterion",
      ],
    },
    {
      category: "component",
      scenarios: [
        "AdvisorSpecPanel renders all 23 sections of the Growth Advisor spec",
        "GrowthAdvisorHeaderStats renders skeletons, then live counts honestly",
        "Cohort viewer renders curves with labelled shape and per-cohort deltas",
      ],
    },
    {
      category: "integration",
      scenarios: [
        "Growth Advisor reads funnel + cohort data via RLS and produces a pulse",
        "Approval Center receives proposed lifecycle sends and reflects status changes",
        "Standing-mission run for weekly growth pulse emits a signal and a receipt",
      ],
    },
    {
      category: "e2e",
      scenarios: [
        "User asks for the next experiment, picks one, approves a queued lifecycle send, receipt appears",
        "Weekly growth pulse proactively surfaces and the user acts on a funnel-leak flag",
      ],
    },
    {
      category: "regression",
      scenarios: [
        "Spec validator passes for GROWTH_ADVISOR_SPEC (no stubs, all sections complete)",
        "Authority ceiling stays at L2-recommend until explicitly raised by admin",
      ],
    },
    {
      category: "error-state",
      scenarios: [
        "Missing activation event surfaces a structured 'no activation event defined' state with a one-click setup CTA",
        "Empty cohort table surfaces an honest 'no cohort data yet' state instead of fabricated curves",
      ],
    },
    {
      category: "explainability",
      scenarios: [
        "Every recommendation exposes the funnel/cohort/loop data used and the alternative moves considered",
        "Confidence band is rendered and matches the underlying evidence count",
      ],
    },
    {
      category: "receipt",
      scenarios: [
        "ai_action_receipt is created for every recommendation, experiment design, and proposed action",
        "Experiment designs produce a reproducible receipt including hypothesis, success metric, and kill criterion",
      ],
    },
    {
      category: "authority",
      scenarios: [
        "Attempt to modify pricing or a paywall is blocked at L2 and routed to CFO Advisor for escalation",
        "Attempt to launch an experiment without approval is refused and logged",
        "Kill-switch engaged on growth domain halts all proactive signals immediately",
      ],
    },
    {
      category: "simulation",
      scenarios: [
        "funnel-fix-impact-scenario output is flagged nonAuthoritative=true in the UI",
        "activation-experiment-comparison-scenario returns hypothesis, sample sanity, and kill criteria per variant",
        "scaling-priority-tradeoff-scenario routes a CFO and CEO escalation flag when material",
      ],
    },
    {
      category: "module-integration",
      scenarios: [
        "Lifecycle/Comms module never accepts an autonomous send from the Growth Advisor",
        "Boardroom synthesis ingests binding-constraint and scaling-priority signals into the CEO Advisor view",
      ],
    },
  ],

  // ── 21. Definition of Done ──────────────────────────────────
  definitionOfDone: [
    "All 9 core use cases are functional against real funnel/cohort/loop data, not fixtures",
    "Required inputs are wired from the Analytics, CRM, and Lifecycle modules with typed adapters",
    "Growth Advisor home, funnel workspace, cohort viewer, activation panel, experiment designer, and Spec tab are implemented",
    "Trust model enforced: no autonomous pricing/gate changes, no autonomous experiment launches, no autonomous lifecycle sends",
    "Authority ceiling enforced at L2-recommend via business-advisor-runtime",
    "Explainability drawer renders sources, assumptions, alternatives, and confidence",
    "All 4 simulation scenarios are runnable and produce the documented output keys",
    "ai_action_receipts are emitted for every recommendation, experiment design, and proposed action",
    "All 11 testing-matrix categories have at least one passing automated test",
    "Analytics events are instrumented and visible in the admin adoption dashboard",
    "Empty, loading, and error states are honest (no demo placeholders) on every surface",
    "Standing missions for weekly growth pulse, monthly cohort review, and retention-decay watch are registered and gated",
    "Cross-advisor escalation paths to CFO/Marketing/Sales/Tech/CEO are wired and observable in admin",
    "Spec is registered, passes validateAdvisorSpec, and renders in the Spec tab with no warnings",
  ],

  // ── 22. Phase Roadmap ───────────────────────────────────────
  roadmap: {
    phase1: {
      title: "Deployable core — funnel reads, cohort viewer, experiment designer",
      outcomes: [
        "Header stats live (active users, funnel conversion, D7 retention, top loop)",
        "Funnel workspace with per-step drop quantification and fix-impact ranking",
        "Cohort viewer with curve-shape labels and per-cohort deltas",
        "Experiment designer with hypothesis, success and kill criteria enforced",
        "Spec tab live, receipts emitted, kill-switch respected",
      ],
    },
    phase2: {
      title: "Deeper intelligence — activation, loops, simulations, integrations",
      outcomes: [
        "All 4 simulation scenarios live in the experiment designer and activation panel",
        "Loop map with strength, friction, and proposed strengthening moves",
        "Activation panel with drift detection and recovery-experiment drafts",
        "Cross-advisor escalation flows to CFO/Marketing/Sales/Tech wired and observable",
        "Approval Center bundles for multi-step experiment plans",
      ],
    },
    phase3: {
      title: "Bounded automation — pulses, watchlists, continuous monitoring",
      outcomes: [
        "L4 auto-drafted recovery experiments when metric tripwires fire, queued for approval",
        "Continuous funnel-leak, cohort-regression, and activation-drift watchlist with daily proposals",
        "Boardroom dispatch of binding-constraint and scaling-priority signals into CEO synthesis",
        "Auto-detected scenario assumption sets from prior approved experiments",
      ],
    },
  },

  // ── 23. Wow Differentiators ─────────────────────────────────
  wowDifferentiators: [
    "Feels like a senior head of growth reading every funnel and cohort with you — outputs cite live curves and event streams, not generic growth tropes.",
    "Names the binding constraint explicitly before recommending action — no 'try these 10 growth hacks' lists, ever.",
    "Experiments are first-class: every design ships with an explicit hypothesis, success metric, and kill criterion captured in the receipt — never 'let's run it and see'.",
    "Reads retention curves as curves with labelled shapes (smile, decay, flatline) — not just point-in-time numbers — so the operator sees the system, not a snapshot.",
    "Hard boundary on pricing, paywalls, experiments, and lifecycle sends — every output is auditable, every action goes through Approval Center, and material bets are routed to the CFO and CEO Advisors before approval.",
  ],
};

// Side-effect: register on import.
registerAdvisorSpec(GROWTH_ADVISOR_SPEC);
