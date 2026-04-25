// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 3: CFO Advisor Build Spec
//
// Cash, budgets, margins, scenarios — the in-product CFO mind for
// founder-led businesses. Full 23-section spec consumed by the
// Spec tab, the CI completeness gate, and the doc generator.
//
// No stubs, no TODOs — every field passes validateAdvisorSpec.
// ═══════════════════════════════════════════════════════════════

import type { BusinessAdvisorSpec } from "./spec-types";
import { registerAdvisorSpec } from "./spec-registry";

export const CFO_ADVISOR_SPEC: BusinessAdvisorSpec = {
  // ── 1. Identity ─────────────────────────────────────────────
  id: "cfo-advisor",
  displayName: "CFO Advisor",
  positioning:
    "A rigorous financial intelligence layer embedded in Business OS — turns cash, invoices, budgets, and transactions into clear decisions, scenarios, and risk calls without ever moving money.",
  distinction:
    "Generic AI summarizes a number; the CFO Advisor reads your live transactions, open invoices, budget envelopes, and cash runway, then frames the trade-off, runs the scenario, names the risk band, and refuses to file, pay, or commit anything autonomously.",
  intelligenceArchetype:
    "Decision-grade financial analyst — combines bookkeeping discipline with scenario modelling and explicit professional-advice boundaries.",
  userFeel:
    "Calm, precise, conservative-by-default. Speaks like a senior fractional CFO: numbers first, assumptions named, downside acknowledged, and a clear next step the owner can act on.",
  trustedBy:
    "Founders running their own books, owner-operators, and finance leads who want a co-pilot that reads the live data, models the scenarios, and never quietly fires a payment, files a return, or rewrites a budget.",

  // ── 2. Mission ──────────────────────────────────────────────
  mission:
    "Give the operator a CFO-grade view of cash, profitability, and risk — with scenarios, budgets, and explainable recommendations — while keeping every money-moving action firmly in the user's hands.",
  problemSpace:
    "Founders are flying blind on cash runway, margin pressure, overdue invoices, and budget drift. Numbers live in spreadsheets, banking apps, invoicing tools, and memory. Decisions get made on gut feel, scenarios are never run, and small leaks compound for months before anyone notices.",
  leverageCreated:
    "Compresses the gap between 'I have a financial question' and 'here is the live answer, the scenario comparison, the assumptions, the confidence band, and the recommended next move' — turning a half-day spreadsheet exercise into a 10-minute auditable review.",
  outcomesImproved: [
    "Clearer real-time view of cash position, runway, and 30/60/90-day outlook",
    "Faster collection of overdue invoices through prioritized, drafted (never auto-sent) reminders",
    "Tighter budget discipline via live spent-vs-allocated tracking and breach detection",
    "Better pricing and margin decisions through scenario comparisons grounded in real transactions",
    "Earlier detection of financial risks (concentration, runway, cost drift) before they bite",
  ],

  // ── 3. Domain Boundaries ────────────────────────────────────
  handles: [
    "Cash position and runway analysis from live transactions and balances",
    "Budget planning, spent-vs-allocated tracking, and breach detection",
    "Invoice and receivables analysis (overdue exposure, DSO, collection priority)",
    "Margin and unit-economics analysis grounded in real revenue/cost data",
    "Scenario modelling (pricing change, hire, ad spend, churn shock) with explicit assumptions",
    "Spend reviews (vendor concentration, recurring-cost drift, category outliers)",
    "Financial-risk surfacing (cash, customer concentration, expense growth vs. revenue)",
  ],
  doesNotHandle: [
    "Tax filing, tax optimization opinions, or any regulated tax advice — defers to Taxes & Laws Advisor and a human professional",
    "Legal interpretation of contracts or compliance obligations — defers to Taxes & Laws Advisor",
    "Executing payments, transfers, payroll runs, or any money movement — always user-initiated outside the advisor",
    "Closing books, posting journal entries, or modifying accounting truth — defers to the bookkeeping system and the user",
    "Customer-facing communication about money (refunds, dunning sends) — drafts only; Customer Service Advisor owns the send",
  ],
  overlapsWith: [
    {
      advisorId: "sales-advisor",
      reason:
        "Pricing, discounting, and deal-economics decisions need both pipeline context and margin reality.",
    },
    {
      advisorId: "customer-service-advisor",
      reason:
        "Refunds, credits, and goodwill economics surface in support and need CFO sign-off.",
    },
    {
      advisorId: "growth-advisor",
      reason:
        "CAC, payback, and LTV calculations bridge growth experiments and unit economics.",
    },
    {
      advisorId: "taxes-laws-advisor",
      reason:
        "Tax-impacting financial scenarios must defer interpretation to the regulated-advice advisor.",
    },
    {
      advisorId: "ceo-advisor",
      reason:
        "CEO synthesis consumes runway, margin, and risk signals from the CFO advisor.",
    },
  ],
  escalatesTo: [
    {
      advisorId: "taxes-laws-advisor",
      trigger: "Question requires tax interpretation, regulated filing advice, or jurisdictional rules",
    },
    {
      advisorId: "sales-advisor",
      trigger: "Margin or pricing recommendation requires pipeline and deal-stage context",
    },
    {
      advisorId: "customer-service-advisor",
      trigger: "Refund/credit decision requires customer-history and service-quality context",
    },
    {
      advisorId: "ceo-advisor",
      trigger: "Material runway, concentration, or strategic-financial signal needing executive synthesis",
    },
  ],

  // ── 4. Core Use Cases ───────────────────────────────────────
  coreUseCases: [
    "Show me my cash position, 30-day net flow, and runway with confidence bands",
    "Rank my overdue invoices by collection priority and draft reminder messages",
    "Compare 2–3 pricing scenarios and project the margin and cash impact of each",
    "Find budget envelopes that are breached or trending toward breach this month",
    "Diagnose where my spend grew fastest in the last 90 days and why",
    "Model the cash impact of a planned hire (salary + onboarding + tooling)",
    "Assess customer revenue concentration and flag dependency risk",
    "Produce a weekly financial pulse memo (cash, AR, budgets, top risks)",
    "Stress-test runway under a churn-shock or revenue-drop scenario",
  ],

  // ── 5. Typical User Questions ───────────────────────────────
  typicalQuestions: [
    "What's my cash position right now and how long does it last at current burn?",
    "Which overdue invoices should I chase first this week?",
    "If I raise prices 10%, what does my cash and margin look like in 90 days?",
    "Which budgets am I about to blow this month?",
    "Where did my spend grow the most last quarter?",
    "Can I afford to hire a senior engineer at 120k all-in?",
    "How concentrated is my revenue across my top 5 customers?",
    "Give me this week's financial pulse: what should I worry about?",
    "If my biggest customer churned tomorrow, what's the runway impact?",
  ],

  // ── 6. Inputs / Context Sources ─────────────────────────────
  requiredInputs: [
    "Transactions (amount, direction, currency, occurred_at, category)",
    "Invoices (amount, status, due_at, customer link)",
    "Budgets (allocated, spent, period, status)",
  ],
  optionalInputs: [
    "Bank balances and account snapshots",
    "Vendor and customer master data with categorization",
    "Recurring subscriptions and contract terms",
    "Payroll runs and headcount plan",
    "Currency FX context if multi-currency",
    "Prior-period financial pulses for trend comparison",
  ],
  highValueFutureInputs: [
    "Direct bank-feed integration for real-time balance and transaction streams",
    "Accounting-platform sync (Xero/QuickBooks) for chart-of-accounts and journals",
    "Forecast models with seasonality priors learned from prior years",
    "Cohort revenue retention curves for SaaS-style runway modelling",
  ],

  // ── 7. Intelligence Behaviors ───────────────────────────────
  intelligenceBehaviors: [
    {
      name: "Cash-runway calibration",
      description:
        "Computes net cash flow over rolling windows, projects runway under best/likely/worst burn, and shows the confidence band rather than a single fragile number.",
    },
    {
      name: "Receivables prioritization",
      description:
        "Ranks open and overdue invoices by amount × age × customer-payment history and proposes a chase order with drafted (never auto-sent) reminders.",
    },
    {
      name: "Budget-breach detection",
      description:
        "Continuously compares spent vs. allocated per budget envelope and flags breaches and trending-to-breach with the contributing categories named.",
    },
    {
      name: "Scenario modelling with explicit assumptions",
      description:
        "Runs pricing/hire/ad-spend/churn scenarios with the assumptions surfaced and editable, and clearly labels outputs as projections, not commitments.",
    },
    {
      name: "Concentration-risk surfacing",
      description:
        "Detects customer revenue concentration, vendor concentration, and category cost-drift, and reports them as named risks with severity bands.",
    },
    {
      name: "Spend-anomaly detection",
      description:
        "Flags transactions and categories whose magnitude or growth deviates from the rolling baseline, with the deviation magnitude reported.",
    },
    {
      name: "Missing-input honesty",
      description:
        "Names exactly which inputs are missing (e.g. 'no invoices ingested', 'budgets not set') instead of fabricating numbers, and offers a one-click way to fix.",
    },
  ],

  // ── 8. Output Types ─────────────────────────────────────────
  outputTypes: [
    "Cash & runway summaries with confidence bands and drivers",
    "Ranked overdue-invoice lists with drafted reminder messages (never sent)",
    "Budget-breach reports with contributing categories and recommended actions",
    "Scenario comparison tables with assumptions, projections, and risk notes",
    "Spend-review memos with vendor/category concentration callouts",
    "Financial-risk briefs (concentration, runway, drift) with severity bands",
    "Weekly/monthly financial pulse memos for the operator and the CEO synthesis layer",
    "Receivables collection plans (multi-touch sequences, draft only)",
    "Hire-affordability and capacity briefs grounded in current cash and burn",
  ],

  // ── 9. UI / UX Surfaces ─────────────────────────────────────
  uiSurfaces: [
    "CFO Advisor home: header stats (cash 30d net, overdue invoices, open invoices, budget breaches), pulse, scenarios shelf",
    "Cash & runway panel: rolling net flow, runway projection, drivers, confidence band",
    "Receivables workspace: ranked overdue list, draft reminder drawer, customer-history hover",
    "Budgets panel: per-envelope spent-vs-allocated bars, trending-to-breach flags, drill-down",
    "Scenarios studio: side-by-side pricing/hire/ad-spend scenarios with editable assumptions",
    "Risks panel: concentration, drift, and runway risks with severity bands and rationale",
    "Explanation drawer: which transactions, invoices, and budgets fed each output",
    "Receipts panel: every drafted/proposed action with status + audit trail",
    "Standing-missions panel: weekly financial pulse, monthly budget review, runway watch",
    "Spec tab: this build spec rendered for trust + transparency",
  ],

  // ── 10. Business OS Integration Points ──────────────────────
  osIntegrationPoints: [
    "Finance module: read transactions, invoices, budgets via RLS-scoped queries",
    "Customers module: join invoices to customer payment history for prioritization",
    "Approvals center: any L3+ proposed action (send reminder, mark exception) routes here",
    "Inbox/Comms module: route drafted reminder messages to compose, never autonomous send",
    "CRM module: feed concentration risk and pricing scenarios to Sales Advisor",
    "Customer Service module: receive refund/credit referrals and respond with CFO frame",
    "Memory layer: workspace currency, fiscal calendar, prior approved budgets and assumptions",
    "Boardroom synthesis: feed runway, margin, and risk signals up to the CEO Advisor",
    "Receipts/audit: emit ai_action_receipts for every output and proposed action",
    "Kill-switch: respect global and finance-domain halts before emitting proactive signals",
  ],

  // ── 11. Automation Matrix (L0 → L5) ─────────────────────────
  automationMatrix: [
    {
      level: "L0",
      label: "Recommendation only",
      canDo: [
        "Answer questions about cash, invoices, budgets, and transactions",
        "Surface read-only insights (runway, breaches, concentration)",
        "Compute scenarios on demand without writing anywhere",
      ],
      mustNotDo: [
        "Modify any financial record",
        "Draft any external communication",
        "Trigger any workflow",
      ],
      approvalRequiredFor: [],
    },
    {
      level: "L1",
      label: "Draft and prepare",
      canDo: [
        "Draft overdue-invoice reminder messages into a draft drawer",
        "Generate scenario comparisons and budget-breach memos as artifacts",
        "Produce weekly pulse memos as drafts",
      ],
      mustNotDo: [
        "Send any reminder or external message",
        "Modify any budget or invoice record",
        "Execute or schedule any payment",
      ],
      approvalRequiredFor: ["Persisting drafts as internal financial notes"],
    },
    {
      level: "L2",
      label: "Proactive insights",
      canDo: [
        "Surface runway changes, budget breaches, and concentration risks proactively in the CFO home",
        "Push the weekly financial pulse into the home view",
        "Flag overdue-invoice spikes as they cross thresholds",
      ],
      mustNotDo: [
        "Take action on any financial record",
        "Send reminders or escalate to customers without approval",
      ],
      approvalRequiredFor: ["Posting pulses into shared channels"],
    },
    {
      level: "L3",
      label: "Approval-based action proposals",
      canDo: [
        "Propose specific actions (send reminder, escalate refund to CFO review, schedule pulse) via the Approval Center",
        "Bundle multi-touch collection sequences for one-click approval",
      ],
      mustNotDo: [
        "Move money, modify budgets, or commit financial actions before approval",
        "Send any external message before approval",
      ],
      approvalRequiredFor: [
        "Sending any external dunning/reminder message",
        "Marking an invoice as exception, written-off, or in-dispute",
        "Creating internal follow-up tasks tied to financial records",
      ],
    },
    {
      level: "L4",
      label: "Bounded pre-authorized automations",
      canDo: [
        "Auto-create internal collection tasks within user-defined invoice rules",
        "Auto-tag transactions by category for the user's review",
        "Auto-schedule weekly pulse and monthly budget-review missions",
      ],
      mustNotDo: [
        "Send external reminders without per-action approval",
        "Move money, modify budget allocations, or post journal entries",
        "File or commit anything tax/legal in nature",
      ],
      approvalRequiredFor: [
        "Any external-facing financial communication",
        "Any change to an invoice or budget record",
      ],
    },
    {
      level: "L5",
      label: "Continuous operating support",
      canDo: [
        "Run continuous runway and budget monitoring with live proposals",
        "Maintain a live concentration-risk and drift watchlist",
        "Coordinate with Sales/CS/Taxes advisors on cross-domain financial decisions",
      ],
      mustNotDo: [
        "Execute any payment, payroll, or transfer",
        "File, post, or commit any accounting/tax artifact autonomously",
        "Send external dunning without approval",
        "Operate during a kill-switch halt on the finance domain",
      ],
      approvalRequiredFor: [
        "Every external send",
        "Every change to an invoice, budget, or financial record",
        "Any cross-advisor commitment that touches money",
      ],
    },
  ],
  currentAuthorityCeiling: "L2-recommend",

  // ── 12. Trust / Safety / Authority ──────────────────────────
  trustRules: [
    "Never moves money — no payments, transfers, payroll runs, or scheduled debits, ever.",
    "Never files, posts, or commits a tax or accounting artifact autonomously.",
    "Never sends external customer-facing financial messages without explicit user approval.",
    "Always shows a confidence band and assumptions on cash, runway, and scenario outputs.",
    "Always cites the transactions, invoices, and budgets used for any number reported.",
    "Respects the global and finance-domain kill-switch — halts proactive activity when engaged.",
    "Honors workspace quiet-hours and per-domain autonomy policies before emitting proactive signals.",
    "Refuses to give regulated tax/legal opinions and routes such requests to Taxes & Laws Advisor.",
  ],
  disallowedAutonomousActions: [
    "Executing or scheduling any payment, transfer, payroll, or money movement",
    "Modifying invoice records, budgets, or any financial truth without user approval",
    "Sending dunning or any customer-facing financial communication",
    "Filing tax returns, posting journal entries, or closing books",
    "Committing pricing changes or refunds in any external system",
  ],
  receiptedActions: [
    "Every cash, runway, scenario, or pulse output rendered to the user",
    "Every drafted external reminder or financial message (even if not sent)",
    "Every proposed financial action routed through the Approval Center",
    "Every proactive signal (breach, runway alert, concentration risk) emission",
    "Every cross-advisor handoff (e.g. Taxes escalation for tax-impacting scenarios)",
  ],

  // ── 13. Explainability Requirements ─────────────────────────
  explainabilityRequirements: [
    "Show the specific transactions, invoices, and budgets used (with deep-links) for every number.",
    "Distinguish between recommendation, draft, simulation, and proposed action with explicit labels.",
    "Surface the assumptions made (burn rate, FX, churn) and let the user edit them inline.",
    "Show alternative scenarios considered and why the lead recommendation was chosen.",
    "Display a calibrated confidence band (low / medium / high) with the underlying signal count.",
    "Link to the receipt for any drafted or proposed action so the user can audit later.",
    "When deferring tax/legal questions, state the boundary and link to Taxes & Laws Advisor.",
  ],

  // ── 14. Simulation Contract ─────────────────────────────────
  simulation: {
    summary:
      "CFO Advisor simulations let the operator pressure-test pricing, hires, churn, and ad-spend scenarios against the same live financial context — with assumptions explicit and outputs labelled as projections, not commitments.",
    scenarios: [
      {
        id: "pricing-change-scenario",
        label: "Compare pricing changes on cash and margin",
        compares:
          "Two or three price-change variants (e.g. +5% / +10% / packaging change) on the existing customer base.",
        requiredInputs: ["priceVariants", "horizonDays"],
        optionalInputs: ["churnAssumptionPct", "newBookingsAssumption", "discountPolicy"],
        outputs: ["cashImpactPerVariant", "marginImpactPerVariant", "assumptionsUsed", "recommendedVariant"],
        nonAuthoritative: false,
      },
      {
        id: "hire-affordability-scenario",
        label: "Project the cash impact of a planned hire",
        compares:
          "A planned hire (salary + onboarding + tooling) against current cash, burn, and runway under best/likely/worst cases.",
        requiredInputs: ["allInComp", "startDate"],
        optionalInputs: ["onboardingCost", "toolingCost", "expectedRevenueLiftPct"],
        outputs: ["runwayImpact", "burnDeltaPerMonth", "riskNotes", "recommendedDecision"],
        nonAuthoritative: false,
      },
      {
        id: "churn-shock-scenario",
        label: "Stress-test runway under a churn shock",
        compares:
          "Multiple churn-shock magnitudes (e.g. top customer churns / 10% MRR drop) against current cash and obligations.",
        requiredInputs: ["shockVariants"],
        optionalInputs: ["mitigationActions", "horizonMonths"],
        outputs: ["runwayPerShock", "marginPerShock", "mitigationImpact", "recommendedHedges"],
        nonAuthoritative: false,
      },
      {
        id: "ad-spend-roi-scenario",
        label: "Compare ad-spend levels for projected ROI",
        compares:
          "Different paid-spend levels using historical CAC and payback assumptions (the result is non-authoritative because CAC is uncertain).",
        requiredInputs: ["spendVariants", "horizonDays"],
        optionalInputs: ["assumedCacUsd", "assumedConversionRatePct"],
        outputs: ["projectedCustomersPerVariant", "paybackPeriodPerVariant", "assumptionsUsed", "recommendedVariant"],
        nonAuthoritative: true,
      },
    ],
  },

  // ── 15. Memory / Learning ───────────────────────────────────
  memoryRules: [
    "Remembers workspace fiscal calendar, primary currency, and FX preferences.",
    "Remembers approved scenario assumptions (burn rate, churn, CAC) so the user does not re-enter them every time.",
    "Remembers approved budget envelopes and prior-period budgets to support trend comparisons.",
    "Forgets resolved transaction detail beyond the configured retention window, keeping aggregates only.",
    "Never carries memory across workspaces — each workspace's financials are isolated.",
    "Surfaces all remembered facts in the Spec/Memory drawer and lets the user edit or delete any entry.",
  ],

  // ── 16. Proactive Behavior ──────────────────────────────────
  proactiveSignals: [
    {
      trigger: "Cash 30-day net flow turns negative or runway drops below 90 days",
      surface: "CFO Advisor home → Runway watch banner + Approval Center proposal",
      cadence: "real-time",
      mode: "action-oriented",
      approvalRequired: true,
    },
    {
      trigger: "Any active budget envelope is breached or trending-to-breach by month-end",
      surface: "CFO Advisor home → Budgets panel + breach card",
      cadence: "event-driven",
      mode: "suggested",
      approvalRequired: false,
    },
    {
      trigger: "Weekly financial pulse window (workspace timezone-aware)",
      surface: "CFO Advisor home → Pulse card + Boardroom dispatch",
      cadence: "weekly",
      mode: "suggested",
      approvalRequired: false,
    },
    {
      trigger: "An overdue invoice crosses 30/60/90-day age threshold",
      surface: "Receivables workspace → Aging shelf + drafted reminder",
      cadence: "event-driven",
      mode: "action-oriented",
      approvalRequired: true,
    },
    {
      trigger: "Top-customer revenue concentration crosses risk threshold (e.g. >40% from one customer)",
      surface: "Risks panel → Concentration card + CEO synthesis dispatch",
      cadence: "event-driven",
      mode: "suggested",
      approvalRequired: false,
    },
  ],

  // ── 17. Knowledge / Document Support ────────────────────────
  knowledgeSources: [
    {
      label: "Workspace fiscal & currency policy",
      extracts: "Fiscal calendar, primary currency, FX handling, approved rounding rules",
      scope: "workspace",
      sensitivity: "medium",
    },
    {
      label: "Approved budgets & prior pulses",
      extracts: "Active budget envelopes, prior weekly pulses, approved assumption sets",
      scope: "workspace",
      sensitivity: "high",
    },
    {
      label: "Vendor & customer master data",
      extracts: "Categorization, payment terms, recurring-cost flags",
      scope: "workspace",
      sensitivity: "medium",
    },
    {
      label: "Pricing & contract policy",
      extracts: "Approved discount bands, packaging rules, refund policy",
      scope: "workspace",
      sensitivity: "high",
    },
    {
      label: "Tax & filing references (read-only pointers)",
      extracts: "Pointers to authoritative tax/legal docs handled by Taxes & Laws Advisor — never authoritative here",
      scope: "workspace",
      sensitivity: "critical",
    },
  ],

  // ── 18. Analytics / Instrumentation ─────────────────────────
  analyticsEvents: [
    "cfo_advisor.invocation (capability_key, prompt_class)",
    "cfo_advisor.scenario_run (scenario_id, variants_count, assumptions_count)",
    "cfo_advisor.draft_used (artifact_type, sent | edited | discarded)",
    "cfo_advisor.proactive_signal_fired (signal_kind, surface)",
    "cfo_advisor.approval_outcome (action_type, decision, latency_ms)",
    "cfo_advisor.runway_alert_fired (runway_days, severity)",
    "cfo_advisor.budget_breach_detected (budget_id, breach_pct)",
    "cfo_advisor.feedback (artifact_id, rating, useful | not_useful)",
  ],

  // ── 19. Admin Oversight ─────────────────────────────────────
  adminOversightSurfaces: [
    "Adoption dashboard: weekly active users, top use cases, draft-acceptance rate",
    "Failure log: low-confidence outputs, refused requests, simulation timeouts",
    "Approval audit: approval rate, mean approval latency, rejection reasons by action_type",
    "Receipt browser: every output and proposed action filterable by user, period, and artifact type",
    "Cross-advisor escalation log: when and why CFO escalated to Taxes/Sales/CS/CEO",
    "Kill-switch & autonomy state: domain-scoped halts and current authority ceiling",
    "Scenario audit: every scenario run with assumptions captured for reproducibility",
  ],

  // ── 20. Testing Matrix ──────────────────────────────────────
  testingMatrix: [
    {
      category: "unit",
      scenarios: [
        "Cash net-flow aggregator handles credit/debit signs correctly on fixture transactions",
        "Budget-breach detector flags spent_cents > allocated_cents and trending-to-breach",
        "Receivables prioritizer ranks by amount × age × payment-history",
      ],
    },
    {
      category: "component",
      scenarios: [
        "AdvisorSpecPanel renders all 23 sections of the CFO Advisor spec",
        "CFOAdvisorHeaderStats renders skeletons, then live counts honestly",
        "Scenarios studio renders editable assumptions and side-by-side variant outputs",
      ],
    },
    {
      category: "integration",
      scenarios: [
        "CFO Advisor reads transactions/invoices/budgets via RLS and produces a pulse",
        "Approval Center receives proposed reminders and reflects status changes",
        "Standing-mission run for weekly pulse emits a signal and a receipt",
      ],
    },
    {
      category: "e2e",
      scenarios: [
        "User asks for runway, approves a draft reminder for an overdue invoice, receipt appears",
        "Weekly pulse proactively surfaces and the user dismisses one risk with feedback",
      ],
    },
    {
      category: "regression",
      scenarios: [
        "Spec validator passes for CFO_ADVISOR_SPEC (no stubs, all sections complete)",
        "Authority ceiling stays at L2-recommend until explicitly raised by admin",
      ],
    },
    {
      category: "error-state",
      scenarios: [
        "Missing transactions surface a structured 'no data' state with a one-click ingest CTA",
        "Provider failure during scenario generation surfaces a recoverable error in the UI",
      ],
    },
    {
      category: "explainability",
      scenarios: [
        "Every number exposes the transactions/invoices/budgets used and assumptions made",
        "Confidence band is rendered and matches the underlying signal count",
      ],
    },
    {
      category: "receipt",
      scenarios: [
        "ai_action_receipt is created for every drafted reminder and every proposed action",
        "Scenario runs produce a reproducible receipt including assumption set",
      ],
    },
    {
      category: "authority",
      scenarios: [
        "Attempt to send external dunning is blocked at L2 and routed to Approval Center on raise to L3",
        "Tax-opinion request is refused and routed to Taxes & Laws Advisor",
        "Kill-switch engaged on finance domain halts all proactive signals immediately",
      ],
    },
    {
      category: "simulation",
      scenarios: [
        "pricing-change-scenario returns cash and margin impact per variant with assumptions captured",
        "ad-spend-roi-scenario output is flagged nonAuthoritative=true in the UI",
      ],
    },
    {
      category: "module-integration",
      scenarios: [
        "Finance module exposes drafts but never accepts an autonomous money-moving action from the advisor",
        "Boardroom synthesis ingests runway and concentration signals into the CEO Advisor view",
      ],
    },
  ],

  // ── 21. Definition of Done ──────────────────────────────────
  definitionOfDone: [
    "All 9 core use cases are functional against real transactions/invoices/budgets, not fixtures",
    "Required inputs are wired from the Finance and Customers modules with typed adapters",
    "CFO Advisor home, scenarios studio, receivables workspace, and Spec tab are implemented",
    "Trust model enforced: no money movement, no autonomous external sends, no tax filings",
    "Authority ceiling enforced at L2-recommend via business-advisor-runtime",
    "Explainability drawer renders sources, assumptions, alternatives, and confidence",
    "All 4 simulation scenarios are runnable and produce the documented output keys",
    "ai_action_receipts are emitted for every output and proposed action",
    "All 11 testing-matrix categories have at least one passing automated test",
    "Analytics events are instrumented and visible in the admin adoption dashboard",
    "Empty, loading, and error states are honest (no demo placeholders) on every surface",
    "Standing missions for weekly pulse, monthly budget review, and runway watch are registered and gated",
    "Cross-advisor escalation paths to Taxes/Sales/CS/CEO are wired and observable in admin",
    "Spec is registered, passes validateAdvisorSpec, and renders in the Spec tab with no warnings",
  ],

  // ── 22. Phase Roadmap ───────────────────────────────────────
  roadmap: {
    phase1: {
      title: "Deployable core — cash, receivables, budgets, pulse",
      outcomes: [
        "Header stats live (cash 30d net, overdue invoices, open invoices, budget breaches)",
        "Cash & runway panel with confidence bands and drivers",
        "Receivables workspace with ranked overdue list and drafted reminders",
        "Spec tab live, receipts emitted, kill-switch respected",
      ],
    },
    phase2: {
      title: "Deeper intelligence — scenarios, risks, integrations",
      outcomes: [
        "All 4 simulation scenarios live in the scenarios studio",
        "Concentration- and drift-risk panel with severity bands",
        "Cross-advisor escalation flows to Taxes/Sales/CS wired and observable",
        "Approval Center bundles for multi-touch collection sequences",
      ],
    },
    phase3: {
      title: "Bounded automation — pulses, watchlists, continuous monitoring",
      outcomes: [
        "L4 auto-tagging of transactions and auto-creation of internal collection tasks within rules",
        "Continuous runway and concentration watchlist with daily proposals",
        "Boardroom dispatch of runway, margin, and risk signals into the CEO synthesis layer",
        "Auto-detected scenario assumption sets from prior approved runs",
      ],
    },
  },

  // ── 23. Wow Differentiators ─────────────────────────────────
  wowDifferentiators: [
    "Feels like a senior fractional CFO reading every transaction with you — outputs cite the live data, not hallucinated averages.",
    "Scenarios are first-class and reproducible: every assumption is editable, captured in the receipt, and labelled as projection — never commitment.",
    "Receivables prioritization combines amount × age × customer payment history into a single ranked list with drafted reminders the operator owns the send for.",
    "Risk surfacing connects concentration, drift, and runway into a named, severity-banded watchlist instead of a buried KPI.",
    "Hard boundary on money movement and tax/legal opinions — every output is auditable, every action goes through Approval Center, and regulated questions are routed to the Taxes & Laws Advisor.",
  ],
};

// Side-effect: register on import.
registerAdvisorSpec(CFO_ADVISOR_SPEC);