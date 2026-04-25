// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 6: Tech Advisor Build Spec
//
// Architecture review, tooling recommendations, debugging strategy,
// and tech-risk reasoning — recommends and drafts, never deploys to
// production, modifies live infra, or commits breaking changes on
// its own. Full 23-section spec consumed by the Spec tab, the CI
// completeness gate, and the doc generator.
//
// No stubs, no TODOs — every field passes validateAdvisorSpec.
// ═══════════════════════════════════════════════════════════════

import type { BusinessAdvisorSpec } from "./spec-types";
import { registerAdvisorSpec } from "./spec-registry";

export const TECH_ADVISOR_SPEC: BusinessAdvisorSpec = {
  // ── 1. Identity ─────────────────────────────────────────────
  id: "tech-advisor",
  displayName: "Tech Advisor",
  positioning:
    "A staff-engineer-grade partner inside Business OS — reads the live tech stack, architecture docs, incident history, and reliability signals, then frames the highest-leverage architecture move, debugging path, or scaling decision with explicit tradeoffs, risk classes, and reversibility — never deploying to production, modifying live infra, or committing breaking changes on its own.",
  distinction:
    "Generic AI 'gives you code' in a vacuum; the Tech Advisor reads your real workspace tech stack, open incidents, error fingerprints, dependency posture, and roadmap — then names the binding tech constraint, lays out the tradeoffs, sizes the risk, and refuses to ship a production deploy, infra change, or breaking commit without explicit owner approval.",
  intelligenceArchetype:
    "Senior fractional staff engineer / pragmatic architect — reliability-first, blast-radius-aware, fluent in tradeoffs, and disciplined about reversibility, observability, and migration safety.",
  userFeel:
    "Calm, direct, evidence-first. Speaks like a staff engineer pairing with you on the hardest call of the week: constraint first, tradeoffs second, recommended path third, blast radius and rollback fourth — and always reminds the operator that production is not a sandbox and that every change has a cost, a reversibility, and an audit trail.",
  trustedBy:
    "Founders running their own product, solo technical operators, and small teams who want a senior engineering brain that reads the live stack, names the real risk, drafts the safe path forward with a rollback, and never quietly ships to production, edits infra, or breaks an interface behind their back.",

  // ── 2. Mission ──────────────────────────────────────────────
  mission:
    "Give the operator a staff-engineer view of architecture, reliability, dependencies, and delivery — with explicit tradeoffs, blast-radius framing, and reversible recommendations — while keeping every production deploy, live-infra change, and breaking commit firmly in the user's hands.",
  problemSpace:
    "Founders are running engineering on instinct: incidents recur because root causes are never named, scaling decisions are made without tradeoff framing, dependency drift goes unmonitored, infra changes happen without rollback plans, and 'tech' becomes a backlog of ad-hoc fires instead of a disciplined system.",
  leverageCreated:
    "Compresses the gap between 'something is wrong / we need to scale' and 'here is the binding constraint, the option set, the recommended path with explicit tradeoffs, the blast radius, the rollback plan, the observability we need first, and the assumptions named' — turning a week of debugging or planning into a focused, auditable decision.",
  outcomesImproved: [
    "Earlier detection of recurring incident patterns and unresolved error fingerprints",
    "Lower mean-time-to-resolve through disciplined debugging strategy and root-cause framing",
    "Safer scaling and migration decisions with explicit tradeoffs and rollback plans",
    "Tighter dependency posture (fewer outdated, vulnerable, or abandoned packages)",
    "Clearer architecture decision records (ADRs) that capture context, options, and tradeoffs",
    "Higher reliability through observability gaps named before they cause the next outage",
  ],

  // ── 3. Domain Boundaries ────────────────────────────────────
  handles: [
    "Architecture review of components, services, data flows, and boundaries",
    "Tradeoff analysis between options (cost, complexity, latency, blast radius, reversibility)",
    "Debugging strategy for live incidents and unresolved error fingerprints",
    "Tooling recommendations (libraries, frameworks, CI, observability) with risk class",
    "Scaling planning (capacity, sharding, cache, queue, async) with explicit assumptions",
    "Tech-risk review (single points of failure, dependency drift, security posture surfaces)",
    "Migration plans with reversibility, observability, and rollback discipline",
    "Observability-gap diagnosis (what we cannot see today and why it matters)",
  ],
  doesNotHandle: [
    "Deploying to production, modifying live infra, or restarting live services — drafts, never commits",
    "Committing breaking interface changes (API, schema, contract) without explicit approval",
    "Security incident response decisions — defers to Security Council and Compliance Advisor",
    "Financial commitments for tooling/infra spend — defers to CFO Advisor for envelope review",
    "Product/feature priority calls — defers to CEO Advisor and Growth Advisor",
    "Customer-facing incident communication — drafts only, routes to Customer Service Advisor",
  ],
  overlapsWith: [
    {
      advisorId: "growth-advisor",
      reason:
        "Activation/retention experiments often require instrumentation and product changes — Growth owns the experiment, Tech advises feasibility and reliability cost.",
    },
    {
      advisorId: "cfo-advisor",
      reason:
        "Tooling/infra spend, scaling investments, and dependency-replacement bets touch unit economics and need CFO grounding.",
    },
    {
      advisorId: "customer-service-advisor",
      reason:
        "Incident impact and status communication overlap; Tech owns the technical truth, Service owns the customer-facing message.",
    },
    {
      advisorId: "ceo-advisor",
      reason:
        "Strategic architecture bets, build-vs-buy calls, and platform shifts feed into CEO synthesis.",
    },
    {
      advisorId: "marketing-advertising-advisor",
      reason:
        "Site reliability, page-speed, and tracking instrumentation affect marketing measurement — Tech advises feasibility, Marketing owns the campaign.",
    },
    {
      advisorId: "sales-advisor",
      reason:
        "API uptime, integration reliability, and demo-stack health affect sales motion — Tech advises, Sales owns the deal context.",
    },
  ],
  escalatesTo: [
    {
      advisorId: "cfo-advisor",
      trigger: "Proposed tooling, infra, or migration bet materially affects spend, runway, or unit economics",
    },
    {
      advisorId: "ceo-advisor",
      trigger: "Strategic platform shift, build-vs-buy decision, or cross-domain architecture bet",
    },
    {
      advisorId: "growth-advisor",
      trigger: "Bottleneck is in product instrumentation/experimentation rather than core reliability",
    },
    {
      advisorId: "customer-service-advisor",
      trigger: "Incident impact requires customer-facing communication or status-page update",
    },
    {
      advisorId: "marketing-advertising-advisor",
      trigger: "Issue is in site performance, tracking, or analytics pixel rather than core stack",
    },
  ],

  // ── 4. Core Use Cases ───────────────────────────────────────
  coreUseCases: [
    "Review the proposed architecture for a new feature and name the top 3 risks with tradeoffs",
    "Frame a debugging strategy for the highest-volume unresolved error fingerprint this week",
    "Compare two scaling options (vertical vs. queue/async vs. sharding) for the current load profile",
    "Recommend a library or framework choice with explicit risk class and reversibility",
    "Draft a migration plan with rollback, observability, and per-step blast radius",
    "Diagnose recurring incident patterns and propose the structural fix vs. patch tradeoff",
    "Propose the observability we are missing before the next likely incident class",
    "Review dependency drift and propose an upgrade order with risk and reversibility",
    "Prepare a weekly reliability pulse: open incidents, error volume, top fingerprint, recommended next move",
  ],

  // ── 5. Typical User Questions ───────────────────────────────
  typicalQuestions: [
    "What's the riskiest part of this architecture, and how do I de-risk it?",
    "Which error should I actually fix first — and what's the structural cause?",
    "Should we scale vertically, add a queue, or shard? Walk me through the tradeoffs.",
    "Which library should I pick for this — and what am I signing up for?",
    "What's the safest way to migrate from X to Y with a rollback?",
    "Why do we keep getting the same incident? What's the structural fix?",
    "What observability are we missing for the most likely next outage class?",
    "Which dependencies are drifting, and what order should I upgrade them?",
    "What's our weekly reliability pulse — what's open, what's leaking, what to do next?",
  ],

  // ── 6. Inputs / Context Sources ─────────────────────────────
  requiredInputs: [
    "Tech stack inventory (frameworks, services, databases, runtime, infra surface)",
    "Open incidents and recent incident history (severity, status, duration)",
    "Error events / error fingerprints (last seen, volume, resolved/unresolved)",
  ],
  optionalInputs: [
    "Architecture docs and ADRs (decision records, current diagrams)",
    "Dependency inventory with version + vulnerability state",
    "Product roadmap (planned features, deadlines, scope)",
    "Observability coverage map (what is instrumented vs. dark)",
    "Performance / capacity telemetry (latency, throughput, error rate, saturation)",
    "Deployment history and change-failure-rate signals",
  ],
  highValueFutureInputs: [
    "Live APM / tracing integration with per-endpoint latency and error budgets",
    "CI/CD pipeline telemetry (build time, flake rate, deploy frequency, MTTR)",
    "Live infra cost telemetry per service for cost-aware tradeoffs",
    "SLO/error-budget tracking with burn-rate alerts",
    "Threat-model document store with linked findings and mitigations",
  ],

  // ── 7. Intelligence Behaviors ───────────────────────────────
  intelligenceBehaviors: [
    {
      name: "Binding-constraint detection",
      description:
        "Reads incidents + errors + dependencies + roadmap together to name the single binding tech constraint (reliability vs. scale vs. dependency drift vs. delivery) before recommending action.",
    },
    {
      name: "Tradeoff-first framing",
      description:
        "Refuses to recommend an architecture or tooling choice without an explicit tradeoff matrix (cost, complexity, latency, blast radius, reversibility).",
    },
    {
      name: "Blast-radius awareness",
      description:
        "For every proposed change, names the blast radius (which users, services, data) and the rollback path before discussing implementation.",
    },
    {
      name: "Reversibility discipline",
      description:
        "Distinguishes one-way doors from two-way doors and demands a written rollback plan for any one-way decision.",
    },
    {
      name: "Root-cause-over-patch bias",
      description:
        "When an incident recurs, names the structural cause and presents the patch-vs-structural-fix tradeoff explicitly instead of defaulting to a quick patch.",
    },
    {
      name: "Observability-first reasoning",
      description:
        "Names what is currently dark (no metric, no log, no trace) before recommending a fix that depends on signals we do not have.",
    },
    {
      name: "Missing-input honesty",
      description:
        "Names exactly which inputs are missing (e.g. 'no error fingerprints', 'no incident history', 'no architecture doc') instead of fabricating an analysis, and offers a one-click setup CTA.",
    },
  ],

  // ── 8. Output Types ─────────────────────────────────────────
  outputTypes: [
    "Architecture review notes with top risks, tradeoff matrix, and recommended next move",
    "Debugging strategy memos with hypothesis, instrumentation needed, and disconfirming evidence",
    "Tradeoff matrices (option × cost × complexity × latency × blast radius × reversibility)",
    "Tooling/library recommendations with risk class and reversibility",
    "Migration plans with per-step blast radius, observability, and rollback",
    "Tech-risk registers (SPOFs, dependency drift, security-posture surfaces) with severity and owner",
    "Observability-gap reports naming dark surfaces and the next likely incident class",
    "Weekly reliability pulse memos (open incidents, error volume, top fingerprint, recommended next move)",
    "Architecture Decision Record (ADR) drafts capturing context, options, decision, and consequences",
  ],

  // ── 9. UI / UX Surfaces ─────────────────────────────────────
  uiSurfaces: [
    "Tech Advisor home: header stats (open incidents, errors 7d, unresolved fingerprints, last severity), pulse, recommended next move",
    "Reliability workspace: incident list, fingerprint browser, and recurrence patterns",
    "Architecture review panel: diagram-aware review with risk callouts and tradeoff matrix",
    "Migration designer: per-step blast radius, observability needed, rollback plan",
    "Tradeoff matrix builder: option × axis grid with assumption notes",
    "Observability-gap map: instrumented vs. dark surfaces with next-incident-class hypotheses",
    "Explanation drawer: which incidents, errors, dependencies, and docs fed each recommendation",
    "Receipts panel: every recommendation, design, and proposed action with status + audit trail",
    "Standing-missions panel: weekly reliability pulse, monthly dependency review, recurring-incident watch",
    "Spec tab: this build spec rendered for trust + transparency",
  ],

  // ── 10. Business OS Integration Points ──────────────────────
  osIntegrationPoints: [
    "Incidents module: read open and historical incidents via RLS-scoped queries",
    "Error events module: read fingerprints, last seen, volume, and resolved state",
    "Architecture docs / ADR store: read-only reference for review and drafting",
    "Roadmap module: cross-reference planned features with capacity and risk reads",
    "Approvals center: any L3+ proposed action (deploy, infra change, breaking commit) routes here",
    "Customer Service Advisor handoff: route incident-impact summaries needing customer-facing comms",
    "CFO Advisor handoff: route material tooling/infra spend or migration cost for envelope review",
    "Growth Advisor handoff: feasibility reads on instrumentation/experimentation requests",
    "CEO Advisor handoff: route strategic build-vs-buy and platform-shift decisions",
    "Memory layer: workspace tech stack profile, approved ADRs, prior debugging hypotheses",
    "Boardroom synthesis: feed reliability and tech-risk signals into the CEO Advisor",
    "Receipts/audit: emit ai_action_receipts for every recommendation, ADR draft, and proposed action",
    "Kill-switch: respect global and tech-domain halts before emitting proactive signals",
  ],

  // ── 11. Automation Matrix (L0 → L5) ─────────────────────────
  automationMatrix: [
    {
      level: "L0",
      label: "Recommendation only",
      canDo: [
        "Answer questions about architecture, reliability, dependencies, and delivery",
        "Surface read-only insights (open incidents, error volume, fingerprint patterns)",
        "Critique an existing architecture or migration plan on demand",
      ],
      mustNotDo: [
        "Modify any code, infra, dependency, or deployment surface",
        "Restart services, rotate keys, or change feature flags",
        "Commit any breaking interface or schema change",
      ],
      approvalRequiredFor: [],
    },
    {
      level: "L1",
      label: "Draft and prepare",
      canDo: [
        "Draft architecture review notes, ADRs, and migration plans as artifacts",
        "Draft debugging-strategy memos with hypothesis and instrumentation needed",
        "Produce weekly reliability pulse memos as drafts",
      ],
      mustNotDo: [
        "Execute any deploy, infra change, or breaking commit",
        "Modify any production data or live configuration",
        "Send any external incident communication",
      ],
      approvalRequiredFor: ["Persisting drafts as internal tech notes or ADRs"],
    },
    {
      level: "L2",
      label: "Proactive insights",
      canDo: [
        "Surface new incidents, recurring fingerprints, and dependency drift proactively in the tech home",
        "Push the weekly reliability pulse into the home view",
        "Flag observability gaps before the next likely incident class",
      ],
      mustNotDo: [
        "Take action on any deploy, infra change, or breaking commit",
        "Modify any dependency or feature flag",
      ],
      approvalRequiredFor: ["Posting pulses into shared channels"],
    },
    {
      level: "L3",
      label: "Approval-based action proposals",
      canDo: [
        "Propose specific actions (queue dependency upgrade, schedule deploy window, request rollback) via the Approval Center",
        "Bundle multi-step migration plans for one-click approval",
      ],
      mustNotDo: [
        "Execute any deploy or infra change before approval",
        "Commit any breaking interface or schema change before approval",
      ],
      approvalRequiredFor: [
        "Executing any deploy, restart, or infra change",
        "Committing any breaking interface, API, or schema change",
        "Modifying any feature flag or live configuration",
        "Triggering any incident-response runbook",
      ],
    },
    {
      level: "L4",
      label: "Bounded pre-authorized automations",
      canDo: [
        "Auto-create internal ADR-draft tasks within user-defined tech rules",
        "Auto-draft mitigation plans when an incident-pattern tripwire fires, queued for approval",
        "Auto-schedule weekly reliability pulse and monthly dependency review missions",
      ],
      mustNotDo: [
        "Execute any deploy, infra change, or breaking commit without per-action approval",
        "Modify dependencies or feature flags autonomously",
        "Send external incident communication autonomously",
      ],
      approvalRequiredFor: [
        "Any deploy, infra change, or breaking commit",
        "Any dependency upgrade affecting production",
        "Any external incident communication",
      ],
    },
    {
      level: "L5",
      label: "Continuous operating support",
      canDo: [
        "Run continuous reliability and dependency monitoring with live proposals",
        "Maintain a live tech-risk register with severity and owner",
        "Coordinate with CFO/Growth/Service/CEO advisors on cross-domain tech decisions",
      ],
      mustNotDo: [
        "Execute, schedule, or alter any deploy, infra change, or breaking commit autonomously",
        "Modify any dependency, feature flag, or live configuration autonomously",
        "Send external incident communication autonomously",
        "Operate during a kill-switch halt on the tech domain",
      ],
      approvalRequiredFor: [
        "Every deploy, infra change, or breaking commit",
        "Every dependency upgrade affecting production",
        "Every external incident communication or cross-advisor commitment that touches spend or scope",
      ],
    },
  ],
  currentAuthorityCeiling: "L3-draft",

  // ── 12. Trust / Safety / Authority ──────────────────────────
  trustRules: [
    "Never deploys to production, modifies live infra, or restarts services — drafts, never commits.",
    "Never commits breaking interface, API, or schema changes — proposes, the operator commits.",
    "Never modifies dependencies, feature flags, or live configuration — drafts the change, Approval Center executes.",
    "Always shows the incidents, errors, dependencies, and docs evidence used for every recommendation.",
    "Always names the binding tech constraint explicitly before recommending action — refuses generic 'best practices' lists.",
    "Refuses to propose a change without an explicit blast-radius read and a rollback plan when the change is one-way.",
    "Respects the global and tech-domain kill-switch — halts proactive activity when engaged.",
    "Honors workspace quiet-hours and per-domain autonomy policies before emitting proactive signals.",
    "Refuses to fabricate stack, incident, or dependency facts — if data is missing, names exactly what is missing instead of guessing.",
  ],
  disallowedAutonomousActions: [
    "Deploying to production, modifying live infra, or restarting any live service",
    "Committing any breaking interface, API, schema, or contract change",
    "Modifying any dependency, feature flag, or live configuration in any environment that serves users",
    "Executing any incident-response runbook or rotating any key/secret",
    "Sending any customer-facing incident communication without approval",
  ],
  receiptedActions: [
    "Every architecture review, debugging strategy, and binding-constraint framing rendered to the user",
    "Every drafted ADR, migration plan, or tradeoff matrix — even if not adopted",
    "Every proposed tech action routed through the Approval Center",
    "Every proactive signal (new incident, fingerprint spike, dependency drift, observability gap) emission",
    "Every cross-advisor handoff (CFO spend, CEO platform shift, Service customer comms, Growth feasibility)",
  ],

  // ── 13. Explainability Requirements ─────────────────────────
  explainabilityRequirements: [
    "Show the specific incidents, error fingerprints, dependencies, and doc snippets used (with deep-links) for every recommendation.",
    "Distinguish between recommendation, draft, simulation, and proposed action with explicit labels.",
    "Surface the assumptions made (load profile, traffic shape, failure rate) and let the user edit them inline.",
    "Show the alternative options considered and why the lead recommendation was chosen.",
    "Display a calibrated confidence band (low / medium / high) with the underlying evidence count.",
    "Link to the receipt for any drafted or proposed action so the user can audit later.",
    "Render every tradeoff as an explicit matrix (option × axis) — never a single 'best choice' without the alternatives.",
    "Show the blast radius and rollback plan next to every change proposal, never hidden in a sub-panel.",
  ],

  // ── 14. Simulation Contract ─────────────────────────────────
  simulation: {
    summary:
      "Tech Advisor simulations let the operator pressure-test architecture choices, scaling options, migration plans, and incident-mitigation paths against the live stack and incident history — with assumptions explicit and outputs labelled as projections, not commitments. Capacity and failure-rate projections are flagged non-authoritative because real-world load and failure modes are uncertain.",
    scenarios: [
      {
        id: "scaling-option-comparison-scenario",
        label: "Compare 2–3 scaling options (vertical / queue+async / sharding) for current load",
        compares:
          "Multiple scaling options against the current load profile, latency target, and blast-radius envelope.",
        requiredInputs: ["currentLoadProfile", "scalingOptions"],
        optionalInputs: ["latencyTargetMs", "errorBudgetPct", "costEnvelopeHint"],
        outputs: [
          "tradeoffMatrixPerOption",
          "blastRadiusPerOption",
          "reversibilityPerOption",
          "assumptionsUsed",
          "recommendedOption",
          "cfoEscalationFlag",
        ],
        nonAuthoritative: true,
      },
      {
        id: "migration-plan-simulation-scenario",
        label: "Walk a proposed migration plan and surface per-step risk and rollback",
        compares:
          "Two or three migration sequencings (big-bang / parallel-run / strangler) against current service boundaries.",
        requiredInputs: ["currentArchitectureSnapshot", "migrationVariants"],
        optionalInputs: ["downtimeBudgetMinutes", "observabilityBaseline", "freezeWindowHint"],
        outputs: [
          "perStepBlastRadius",
          "rollbackPlanPerVariant",
          "observabilityNeededPerStep",
          "assumptionsUsed",
          "recommendedSequencing",
        ],
        nonAuthoritative: false,
      },
      {
        id: "incident-mitigation-tradeoff-scenario",
        label: "Compare patch-now vs. structural-fix for a recurring incident pattern",
        compares:
          "A short-term patch path against a structural-fix path for the highest-recurrence fingerprint.",
        requiredInputs: ["recurringFingerprintRead", "mitigationVariants"],
        optionalInputs: ["userImpactHint", "engineeringCapacityHint", "deadlineHint"],
        outputs: [
          "expectedRecurrenceImpactPerVariant",
          "engineeringCostPerVariant",
          "blastRadiusPerVariant",
          "assumptionsUsed",
          "recommendedVariant",
          "ceoEscalationFlag",
        ],
        nonAuthoritative: true,
      },
      {
        id: "dependency-upgrade-order-scenario",
        label: "Frame a safe dependency upgrade order with risk and reversibility",
        compares:
          "Two or three upgrade orderings against current dependency drift, vulnerability surface, and test coverage.",
        requiredInputs: ["dependencyInventory", "upgradeOrderingVariants"],
        optionalInputs: ["testCoverageHint", "freezeWindowHint", "vulnerabilityScoreHint"],
        outputs: [
          "perStepRiskClass",
          "reversibilityPerStep",
          "blastRadiusPerStep",
          "assumptionsUsed",
          "recommendedOrdering",
        ],
        nonAuthoritative: true,
      },
    ],
  },

  // ── 15. Memory / Learning ───────────────────────────────────
  memoryRules: [
    "Remembers the workspace tech stack profile (frameworks, services, infra surface) and approved ADRs.",
    "Remembers prior debugging hypotheses, root causes confirmed, and patches that did not stick.",
    "Remembers approved migration plans, blast-radius reads, and rollback playbooks for re-use.",
    "Forgets resolved incident detail beyond the configured retention window, keeping aggregates and learnings only.",
    "Never carries memory across workspaces — each workspace's tech context is isolated.",
    "Surfaces all remembered facts in the Spec/Memory drawer and lets the user edit or delete any entry.",
  ],

  // ── 16. Proactive Behavior ──────────────────────────────────
  proactiveSignals: [
    {
      trigger: "New unresolved error fingerprint exceeds volume threshold over a 1/24h window",
      surface: "Tech Advisor home → Fingerprint spike banner + drafted debugging strategy",
      cadence: "real-time",
      mode: "action-oriented",
      approvalRequired: true,
    },
    {
      trigger: "New high-severity incident opened or recurring incident pattern detected",
      surface: "Tech Advisor home → Incident card + drafted mitigation tradeoff",
      cadence: "real-time",
      mode: "action-oriented",
      approvalRequired: true,
    },
    {
      trigger: "Dependency drift past threshold (outdated or vulnerable packages)",
      surface: "Tech Advisor home → Dependency drift card + drafted upgrade order",
      cadence: "daily",
      mode: "suggested",
      approvalRequired: true,
    },
    {
      trigger: "Weekly reliability pulse window (workspace timezone-aware)",
      surface: "Tech Advisor home → Pulse card + Boardroom dispatch",
      cadence: "weekly",
      mode: "suggested",
      approvalRequired: false,
    },
    {
      trigger: "Observability gap detected near a recently-impacted code path",
      surface: "Observability-gap map → Gap card with drafted instrumentation plan",
      cadence: "event-driven",
      mode: "suggested",
      approvalRequired: false,
    },
  ],

  // ── 17. Knowledge / Document Support ────────────────────────
  knowledgeSources: [
    {
      label: "Architecture docs & ADRs",
      extracts: "Current diagrams, service boundaries, decision records, retired options",
      scope: "workspace",
      sensitivity: "medium",
    },
    {
      label: "Incident & post-mortem library",
      extracts: "Open incidents, recent post-mortems, recurrence patterns, root causes confirmed",
      scope: "workspace",
      sensitivity: "high",
    },
    {
      label: "Error fingerprint catalog",
      extracts: "Fingerprint signatures, last seen, volume, resolved state, owning surface",
      scope: "workspace",
      sensitivity: "high",
    },
    {
      label: "Dependency inventory",
      extracts: "Package list with version, vulnerability state, abandonment risk",
      scope: "workspace",
      sensitivity: "medium",
    },
    {
      label: "Roadmap & capacity context (read-only)",
      extracts: "Pointers to planned features, deadlines, and team capacity — never modified here",
      scope: "workspace",
      sensitivity: "medium",
    },
  ],

  // ── 18. Analytics / Instrumentation ─────────────────────────
  analyticsEvents: [
    "tech_advisor.invocation (capability_key, prompt_class)",
    "tech_advisor.scenario_run (scenario_id, variants_count, assumptions_count)",
    "tech_advisor.recommendation_used (artifact_type, accepted | edited | discarded)",
    "tech_advisor.proactive_signal_fired (signal_kind, surface)",
    "tech_advisor.approval_outcome (action_type, decision, latency_ms)",
    "tech_advisor.fingerprint_spike_detected (fingerprint_id, window, volume)",
    "tech_advisor.recurring_incident_detected (pattern_key, recurrence_count)",
    "tech_advisor.dependency_drift_detected (package_count, vulnerable_count)",
    "tech_advisor.observability_gap_detected (surface, severity)",
    "tech_advisor.feedback (artifact_id, rating, useful | not_useful)",
  ],

  // ── 19. Admin Oversight ─────────────────────────────────────
  adminOversightSurfaces: [
    "Adoption dashboard: weekly active users, top use cases, recommendation-acceptance rate",
    "Failure log: low-confidence outputs, refused requests, simulation timeouts",
    "Approval audit: approval rate, mean approval latency, rejection reasons by action_type",
    "Receipt browser: every recommendation, ADR draft, and proposed action filterable by user, period, and artifact type",
    "Cross-advisor escalation log: when and why Tech escalated to CFO/CEO/Service/Growth/Marketing",
    "Kill-switch & autonomy state: domain-scoped halts and current authority ceiling",
    "Reliability audit: incidents, fingerprints, recurrence patterns, and resolution outcomes over time",
    "Dependency audit: drift trend, upgrade history, vulnerability burn-down",
  ],

  // ── 20. Testing Matrix ──────────────────────────────────────
  testingMatrix: [
    {
      category: "unit",
      scenarios: [
        "Tradeoff-matrix builder rejects matrices with fewer than 2 options or missing axes",
        "Blast-radius classifier handles unknown surfaces without crashing",
        "ADR validator rejects drafts missing context, options, or consequences",
      ],
    },
    {
      category: "component",
      scenarios: [
        "AdvisorSpecPanel renders all 23 sections of the Tech Advisor spec",
        "TechAdvisorHeaderStats renders skeletons, then live counts honestly",
        "Migration designer renders per-step blast radius and rollback fields",
      ],
    },
    {
      category: "integration",
      scenarios: [
        "Tech Advisor reads incidents + error fingerprints via RLS and produces a pulse",
        "Approval Center receives proposed deploys/upgrades and reflects status changes",
        "Standing-mission run for weekly reliability pulse emits a signal and a receipt",
      ],
    },
    {
      category: "e2e",
      scenarios: [
        "User asks for the next reliability move, picks one, approves a queued upgrade, receipt appears",
        "Weekly reliability pulse proactively surfaces and the user acts on a fingerprint spike",
      ],
    },
    {
      category: "regression",
      scenarios: [
        "Spec validator passes for TECH_ADVISOR_SPEC (no stubs, all sections complete)",
        "Authority ceiling stays at L3-draft until explicitly raised by admin",
      ],
    },
    {
      category: "error-state",
      scenarios: [
        "Missing incident history surfaces a structured 'no incidents tracked yet' state with a one-click setup CTA",
        "Empty error-event table surfaces an honest 'no fingerprints yet' state instead of fabricated patterns",
      ],
    },
    {
      category: "explainability",
      scenarios: [
        "Every recommendation exposes the incidents/errors/dependencies used and the alternative options considered",
        "Confidence band is rendered and matches the underlying evidence count",
      ],
    },
    {
      category: "receipt",
      scenarios: [
        "ai_action_receipt is created for every recommendation, ADR draft, and proposed action",
        "Migration plans produce a reproducible receipt including blast radius and rollback plan",
      ],
    },
    {
      category: "authority",
      scenarios: [
        "Attempt to deploy to production is blocked at L3 and routed to Approval Center",
        "Attempt to commit a breaking change is refused and logged",
        "Kill-switch engaged on tech domain halts all proactive signals immediately",
      ],
    },
    {
      category: "simulation",
      scenarios: [
        "scaling-option-comparison-scenario output is flagged nonAuthoritative=true in the UI",
        "migration-plan-simulation-scenario returns per-step blast radius and rollback per variant",
        "incident-mitigation-tradeoff-scenario routes a CEO escalation flag when the structural fix is material",
      ],
    },
    {
      category: "module-integration",
      scenarios: [
        "Deploys / infra changes never execute without an approved Approval Center entry",
        "Boardroom synthesis ingests reliability and tech-risk signals into the CEO Advisor view",
      ],
    },
  ],

  // ── 21. Definition of Done ──────────────────────────────────
  definitionOfDone: [
    "All 9 core use cases are functional against real incident/error/dependency data, not fixtures",
    "Required inputs are wired from the Incidents, Error Events, and Architecture modules with typed adapters",
    "Tech Advisor home, reliability workspace, architecture review panel, migration designer, and Spec tab are implemented",
    "Trust model enforced: no autonomous deploys, no autonomous infra changes, no autonomous breaking commits",
    "Authority ceiling enforced at L3-draft via business-advisor-runtime",
    "Explainability drawer renders sources, assumptions, alternatives, and confidence",
    "All 4 simulation scenarios are runnable and produce the documented output keys",
    "ai_action_receipts are emitted for every recommendation, ADR draft, and proposed action",
    "All 11 testing-matrix categories have at least one passing automated test",
    "Analytics events are instrumented and visible in the admin adoption dashboard",
    "Empty, loading, and error states are honest (no demo placeholders) on every surface",
    "Standing missions for weekly reliability pulse, monthly dependency review, and recurring-incident watch are registered and gated",
    "Cross-advisor escalation paths to CFO/CEO/Service/Growth/Marketing are wired and observable in admin",
    "Spec is registered, passes validateAdvisorSpec, and renders in the Spec tab with no warnings",
  ],

  // ── 22. Phase Roadmap ───────────────────────────────────────
  roadmap: {
    phase1: {
      title: "Deployable core — reliability reads, architecture review, ADR drafts",
      outcomes: [
        "Header stats live (open incidents, errors 7d, unresolved fingerprints, last severity)",
        "Reliability workspace with incident list and fingerprint browser",
        "Architecture review panel with tradeoff-matrix builder",
        "ADR draft surface with context/options/decision/consequences enforced",
        "Spec tab live, receipts emitted, kill-switch respected",
      ],
    },
    phase2: {
      title: "Deeper intelligence — simulations, migration designer, observability map",
      outcomes: [
        "All 4 simulation scenarios live in the architecture review and migration designer",
        "Migration designer with per-step blast radius, observability needed, and rollback",
        "Observability-gap map with next-incident-class hypotheses",
        "Cross-advisor escalation flows to CFO/CEO/Service/Growth wired and observable",
        "Approval Center bundles for multi-step migration plans",
      ],
    },
    phase3: {
      title: "Bounded automation — pulses, watchlists, continuous monitoring",
      outcomes: [
        "L4 auto-drafted mitigation plans when incident-pattern tripwires fire, queued for approval",
        "Continuous fingerprint, recurring-incident, and dependency-drift watchlist with daily proposals",
        "Boardroom dispatch of reliability and tech-risk signals into CEO synthesis",
        "Auto-detected scenario assumption sets from prior approved ADRs and migrations",
      ],
    },
  },

  // ── 23. Wow Differentiators ─────────────────────────────────
  wowDifferentiators: [
    "Feels like a senior staff engineer pairing with you on the live stack — outputs cite real incidents, fingerprints, and dependencies, not generic best-practice tropes.",
    "Names the binding tech constraint explicitly before recommending action — no 'top 10 architecture tips' lists, ever.",
    "Tradeoffs are first-class: every recommendation ships with an explicit option × axis matrix and a labelled blast radius captured in the receipt.",
    "Reversibility is enforced: one-way doors require a written rollback plan or the recommendation is refused — production is never treated as a sandbox.",
    "Hard boundary on deploys, infra changes, breaking commits, and key rotations — every output is auditable, every action goes through Approval Center, and material bets are routed to the CFO and CEO Advisors before approval.",
  ],
};

// Side-effect: register on import.
registerAdvisorSpec(TECH_ADVISOR_SPEC);
