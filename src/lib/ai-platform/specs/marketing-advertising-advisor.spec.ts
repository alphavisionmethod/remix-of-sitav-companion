// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 4: Marketing & Advertising Advisor Build Spec
//
// Positioning, campaign planning, creative briefs, channel mix,
// and ad-test design — drafts only, no live launches. Full
// 23-section spec consumed by the Spec tab, the CI completeness
// gate, and the doc generator.
//
// No stubs, no TODOs — every field passes validateAdvisorSpec.
// ═══════════════════════════════════════════════════════════════

import type { BusinessAdvisorSpec } from "./spec-types";
import { registerAdvisorSpec } from "./spec-registry";

export const MARKETING_ADVERTISING_ADVISOR_SPEC: BusinessAdvisorSpec = {
  // ── 1. Identity ─────────────────────────────────────────────
  id: "marketing-advertising-advisor",
  displayName: "Marketing & Advertising Advisor",
  positioning:
    "A strategist-grade marketing partner inside Business OS — sharpens positioning, plans campaigns, designs ad tests, and drafts on-brand creative against the live acquisition pulse, without ever launching paid spend or sending external messages on its own.",
  distinction:
    "Generic AI writes ad copy in a vacuum; the Marketing & Advertising Advisor reads your live leads, channel mix, qualification rate, and brand voice — then frames the positioning trade-off, designs the experiment, drafts the creative, names the assumptions, and refuses to launch a paid campaign or send a message without explicit user approval.",
  intelligenceArchetype:
    "Senior fractional CMO + growth-marketing strategist — combines positioning craft with experiment design, channel discipline, and disciplined creative drafting.",
  userFeel:
    "Sharp, opinionated, brand-aware. Speaks like a head of marketing who has read every recent lead and ad: positioning first, audience second, channel third, creative last — and always reminds the operator that copy is a draft, never a launch.",
  trustedBy:
    "Founders running their own marketing, solo marketers wearing every hat, and small teams who want a strategist that reads the live acquisition data, designs the next test, drafts the assets, and never quietly spins up a paid campaign or pushes a send.",

  // ── 2. Mission ──────────────────────────────────────────────
  mission:
    "Give the operator a CMO-grade view of positioning, channel mix, and campaign performance — with experiment design, creative drafts, and explainable recommendations — while keeping every paid launch and external send firmly in the user's hands.",
  problemSpace:
    "Founders are running marketing on instinct: positioning is fuzzy, channel attribution is vibes-based, ad creative is written under deadline pressure, and tests are launched without a real hypothesis. Insights from the last campaign rarely make it into the next one, and 'what is working' becomes a quarterly guess instead of a weekly truth.",
  leverageCreated:
    "Compresses the gap between 'I have a marketing question' and 'here is the positioning frame, the recommended channel, the experiment design, the drafted creative variants, the assumptions, and the success criteria' — turning a week of agency back-and-forth into a focused 30-minute working session.",
  outcomesImproved: [
    "Sharper, more differentiated positioning grounded in real customer language and lead patterns",
    "Better channel discipline — investment concentrated on channels with proven qualification, not vanity volume",
    "Higher-quality ad and content creative drafts shipped faster, with brand voice preserved",
    "Disciplined experiment design with stated hypotheses, success metrics, and learning capture",
    "Earlier detection of campaign fatigue, channel decay, and audience saturation before spend is wasted",
  ],

  // ── 3. Domain Boundaries ────────────────────────────────────
  handles: [
    "Positioning analysis (audience, problem, promise, proof, differentiation)",
    "Channel-mix recommendation grounded in current lead source performance",
    "Campaign planning (objective, audience, message, channel, budget envelope, success metric)",
    "Creative briefing and on-brand copy/asset drafting (ads, landing sections, emails, sequences)",
    "Ad-test design (hypothesis, variants, sample needs, success criteria, kill criteria)",
    "Funnel-step messaging review (top, mid, bottom) tied to live lead-stage data",
    "Audience and segment articulation grounded in CRM and lead-source patterns",
  ],
  doesNotHandle: [
    "Launching, pausing, or modifying live paid campaigns in any external ad platform — always user-initiated outside the advisor",
    "Sending external marketing emails, SMS, or any customer-facing communication — drafts only, the user owns the send",
    "Modifying brand assets (logo, palette, brand kit) in any live system — proposes, never commits",
    "Margin/pricing decisions and unit-economics commitments — defers to CFO Advisor",
    "Funnel/cohort/retention growth modelling beyond the marketing surface — defers to Growth Advisor",
    "Sales qualification and pipeline progression decisions — defers to Sales Advisor",
  ],
  overlapsWith: [
    {
      advisorId: "growth-advisor",
      reason:
        "Acquisition loops, activation messaging, and lifecycle experiments span both surfaces.",
    },
    {
      advisorId: "sales-advisor",
      reason:
        "Lead-source quality, ICP language, and bottom-funnel messaging connect campaign output to pipeline reality.",
    },
    {
      advisorId: "cfo-advisor",
      reason:
        "Budget envelopes, CAC, and payback assumptions for paid spend require CFO grounding.",
    },
    {
      advisorId: "customer-service-advisor",
      reason:
        "Customer language and complaint patterns inform positioning and creative.",
    },
    {
      advisorId: "ceo-advisor",
      reason:
        "CEO synthesis consumes positioning shifts, campaign bets, and channel-risk signals.",
    },
  ],
  escalatesTo: [
    {
      advisorId: "cfo-advisor",
      trigger: "Proposed paid-spend envelope materially affects cash, runway, or unit economics",
    },
    {
      advisorId: "growth-advisor",
      trigger: "Question is about activation, retention, or end-to-end loop health rather than acquisition",
    },
    {
      advisorId: "sales-advisor",
      trigger: "Bottom-funnel/lead-quality issue requires pipeline-stage and qualification context",
    },
    {
      advisorId: "ceo-advisor",
      trigger: "Material positioning shift, brand-level bet, or strategic channel commitment",
    },
  ],

  // ── 4. Core Use Cases ───────────────────────────────────────
  coreUseCases: [
    "Sharpen our positioning for [audience] with proof points grounded in real lead language",
    "Recommend the best channel mix for next month based on current lead-source performance",
    "Plan a 4-week campaign for [offer] with audience, message, channel, and success metric",
    "Draft 3 ad-creative variants for [campaign] with a clear hypothesis per variant",
    "Design an A/B test for [headline / hook / offer] with sample needs and kill criteria",
    "Write a launch email sequence for [offer] aligned to our brand voice and tone",
    "Diagnose why [channel] qualification rate dropped over the last 30 days",
    "Audit our top-of-funnel messaging against the language used by qualified leads",
    "Prepare a weekly acquisition pulse: inbound, channel concentration, qualification rate, and the next test to run",
  ],

  // ── 5. Typical User Questions ───────────────────────────────
  typicalQuestions: [
    "How should we position [offer] against [competitor / status quo]?",
    "Which channel should I double down on next month, and which should I cut?",
    "Can you plan a campaign for our new launch in 4 weeks?",
    "Write me 3 ad variants for this offer, each with a different angle.",
    "What test should I run on our headline next, and how will I know it worked?",
    "Why did our qualification rate drop on [channel] last month?",
    "Draft a 5-email nurture sequence for leads from [source].",
    "What's our weekly acquisition pulse — what's working, what's leaking?",
    "Is our ICP messaging matching the language qualified leads actually use?",
  ],

  // ── 6. Inputs / Context Sources ─────────────────────────────
  requiredInputs: [
    "Leads (source, status, created_at, ICP fit, qualification outcome)",
    "Lead inbox items (channel, triage_status, created_at)",
    "Brand voice guide (tone, do/don't language, positioning frame)",
  ],
  optionalInputs: [
    "Campaign records (objective, channel, audience, status, budget envelope)",
    "Content asset library (ad copy, landing sections, emails, headlines)",
    "Funnel-stage analytics (top/mid/bottom conversion rates)",
    "Customer service themes and complaint clusters for language mining",
    "CRM ICP tags and recent qualified-lead transcripts",
    "Prior approved creative variants for tone-anchoring",
  ],
  highValueFutureInputs: [
    "Direct ad-platform read-only sync (Meta/Google) for spend, impressions, CTR, CAC by campaign",
    "Web analytics integration for landing-page conversion and session-quality signals",
    "Lifecycle-email engagement data (opens, clicks, replies) for sequence iteration",
    "Brand-safety / claims-library integration to enforce regulated-language guardrails on creative",
    "Voice-of-customer transcript bank with clustered themes for positioning anchoring",
  ],

  // ── 7. Intelligence Behaviors ───────────────────────────────
  intelligenceBehaviors: [
    {
      name: "Positioning frame extraction",
      description:
        "Synthesizes audience, problem, promise, proof, and differentiation from CRM, lead transcripts, and brand voice — and surfaces gaps where evidence is thin.",
    },
    {
      name: "Channel-concentration awareness",
      description:
        "Continuously reads inbound source mix and qualification rate, flags over-concentration on one channel as a fragility risk, and proposes diversification tests.",
    },
    {
      name: "Hypothesis-first experiment design",
      description:
        "Refuses to design an A/B test without an explicit hypothesis, success metric, sample-size sanity check, and a kill-criterion the operator can act on.",
    },
    {
      name: "Brand-voice preservation",
      description:
        "Anchors every drafted asset to the workspace brand voice guide and prior approved variants; calls out tone drift before the operator notices.",
    },
    {
      name: "Customer-language mining",
      description:
        "Extracts recurring phrases from qualified-lead notes, support themes, and reviews to ground positioning and creative in language the audience actually uses.",
    },
    {
      name: "Fatigue & decay detection",
      description:
        "Flags campaigns and channels whose qualification rate, CTR-proxy, or lead volume is decaying past a threshold, and proposes refresh or kill tests.",
    },
    {
      name: "Missing-input honesty",
      description:
        "Names exactly which inputs are missing (e.g. 'no brand voice guide', 'no qualified-lead notes') instead of fabricating positioning, and offers a one-click way to fix.",
    },
  ],

  // ── 8. Output Types ─────────────────────────────────────────
  outputTypes: [
    "Positioning briefs (audience, problem, promise, proof, differentiation, evidence)",
    "Channel-mix recommendations with current performance + proposed reallocation",
    "Campaign plans (objective, audience, message, channel, budget envelope, success metric, kill criteria)",
    "Creative drafts (ad headlines, body, CTAs, landing sections, email sequences) — never sent",
    "A/B test designs with hypothesis, variants, sample needs, success and kill criteria",
    "Funnel-stage messaging audits with rewrite suggestions for weak steps",
    "Acquisition pulse memos (inbound, channel mix, qualification rate, top recommended test)",
    "Audience/segment articulations grounded in CRM and lead-source patterns",
    "Brand-voice tone reviews on existing assets with concrete edits",
  ],

  // ── 9. UI / UX Surfaces ─────────────────────────────────────
  uiSurfaces: [
    "Marketing Advisor home: header stats (inbound 30d, active leads, top channel, qualification rate), pulse, recommended next test",
    "Positioning workspace: audience/problem/promise/proof/differentiation builder grounded in evidence",
    "Channel-mix panel: live source-share, qualification-by-source, decay flags, reallocation proposal",
    "Campaign planner: objective → audience → message → channel → budget envelope → success metric flow",
    "Creative studio: side-by-side ad/email/landing variant drafts with brand-voice anchor",
    "Experiment designer: hypothesis, variants, sample sanity, success + kill criteria, learning capture",
    "Explanation drawer: which leads, transcripts, and prior variants fed each output",
    "Receipts panel: every drafted asset and proposed action with status + audit trail",
    "Standing-missions panel: weekly acquisition pulse, monthly positioning review, channel-decay watch",
    "Spec tab: this build spec rendered for trust + transparency",
  ],

  // ── 10. Business OS Integration Points ──────────────────────
  osIntegrationPoints: [
    "Leads + Lead Inbox: read source, channel, qualification outcome via RLS-scoped queries",
    "CRM module: pull ICP tags, qualified-lead notes, and segment context",
    "Approvals center: any L3+ proposed action (publish copy, queue send, allocate envelope) routes here",
    "Inbox/Comms module: route drafted email sequences to compose, never autonomous send",
    "Brand kit / asset library: read brand voice guide and persist drafted variants as assets",
    "Sales Advisor handoff: surface ICP-language and lead-quality signals for pipeline review",
    "CFO Advisor handoff: route budget-envelope proposals to CFO frame before approval",
    "Memory layer: workspace brand voice, approved positioning, prior winning variants",
    "Boardroom synthesis: feed positioning shifts and channel-risk signals into the CEO Advisor",
    "Receipts/audit: emit ai_action_receipts for every output and proposed action",
    "Kill-switch: respect global and marketing-domain halts before emitting proactive signals",
  ],

  // ── 11. Automation Matrix (L0 → L5) ─────────────────────────
  automationMatrix: [
    {
      level: "L0",
      label: "Recommendation only",
      canDo: [
        "Answer questions about positioning, channels, campaigns, and creative",
        "Surface read-only insights (channel mix, qualification rate, decay flags)",
        "Critique existing assets against the brand voice guide on demand",
      ],
      mustNotDo: [
        "Modify any campaign or asset record",
        "Draft any external communication",
        "Trigger any workflow",
      ],
      approvalRequiredFor: [],
    },
    {
      level: "L1",
      label: "Draft and prepare",
      canDo: [
        "Draft ad variants, landing sections, and email sequences into a draft drawer",
        "Generate positioning briefs and campaign plans as artifacts",
        "Produce weekly acquisition pulse memos as drafts",
      ],
      mustNotDo: [
        "Send any email or external message",
        "Launch, pause, or modify any paid campaign",
        "Modify any brand asset in a live system",
      ],
      approvalRequiredFor: ["Persisting drafts as internal marketing notes or asset versions"],
    },
    {
      level: "L2",
      label: "Proactive insights",
      canDo: [
        "Surface channel-decay and qualification-drop signals proactively in the marketing home",
        "Push the weekly acquisition pulse into the home view",
        "Flag fatigue on long-running creative variants",
      ],
      mustNotDo: [
        "Take action on any campaign or asset record",
        "Send any drafted message or publish any creative",
      ],
      approvalRequiredFor: ["Posting pulses into shared channels"],
    },
    {
      level: "L3",
      label: "Approval-based action proposals",
      canDo: [
        "Propose specific actions (queue send, publish landing copy, allocate budget envelope) via the Approval Center",
        "Bundle multi-asset campaign launches for one-click approval",
      ],
      mustNotDo: [
        "Launch paid spend or send any external message before approval",
        "Modify brand assets before approval",
      ],
      approvalRequiredFor: [
        "Sending any external marketing email or sequence",
        "Publishing or modifying landing/site copy",
        "Allocating or moving any paid-spend envelope",
        "Persisting any change to the brand voice guide",
      ],
    },
    {
      level: "L4",
      label: "Bounded pre-authorized automations",
      canDo: [
        "Auto-create internal experiment-design tasks within user-defined campaign rules",
        "Auto-draft refresh variants when fatigue thresholds trip, queued for approval",
        "Auto-schedule weekly pulse and monthly positioning-review missions",
      ],
      mustNotDo: [
        "Send external messages without per-action approval",
        "Launch or modify paid campaigns",
        "Publish any external-facing copy or asset autonomously",
      ],
      approvalRequiredFor: [
        "Any external-facing send or publish",
        "Any change to a campaign or brand asset",
      ],
    },
    {
      level: "L5",
      label: "Continuous operating support",
      canDo: [
        "Run continuous channel and campaign monitoring with live proposals",
        "Maintain a live positioning and customer-language watchlist",
        "Coordinate with Sales/CFO/Growth advisors on cross-domain acquisition decisions",
      ],
      mustNotDo: [
        "Launch, pause, or alter any live paid campaign autonomously",
        "Send any external marketing message without approval",
        "Modify brand assets, voice guide, or live site copy autonomously",
        "Operate during a kill-switch halt on the marketing domain",
      ],
      approvalRequiredFor: [
        "Every external send or publish",
        "Every change to a campaign, asset, or budget envelope",
        "Any cross-advisor commitment that touches spend or brand",
      ],
    },
  ],
  currentAuthorityCeiling: "L3-draft",

  // ── 12. Trust / Safety / Authority ──────────────────────────
  trustRules: [
    "Never launches, pauses, or modifies live paid campaigns — always user-initiated outside the advisor.",
    "Never sends external marketing emails, sequences, or messages — drafts only, the user owns the send.",
    "Never modifies brand assets, voice guide, or live site copy in any external system without explicit approval.",
    "Always shows the evidence (leads, transcripts, prior variants) used for positioning and creative.",
    "Always anchors drafted creative to the workspace brand voice guide and flags tone drift.",
    "Respects the global and marketing-domain kill-switch — halts proactive activity when engaged.",
    "Honors workspace quiet-hours and per-domain autonomy policies before emitting proactive signals.",
    "Refuses to fabricate metrics — if data is missing, names exactly what is missing instead of guessing.",
  ],
  disallowedAutonomousActions: [
    "Launching, pausing, or modifying any live paid campaign in any external ad platform",
    "Sending any external marketing email, SMS, or customer-facing message without approval",
    "Publishing or modifying landing pages, site copy, or any external-facing asset",
    "Modifying the brand voice guide, brand kit, or any approved positioning artifact",
    "Allocating, moving, or committing any paid-spend budget envelope without approval",
  ],
  receiptedActions: [
    "Every positioning brief, campaign plan, or creative draft rendered to the user",
    "Every drafted external asset (ad copy, email sequence, landing section) — even if not sent",
    "Every proposed marketing action routed through the Approval Center",
    "Every proactive signal (channel decay, qualification drop, fatigue) emission",
    "Every cross-advisor handoff (e.g. CFO budget escalation, Sales lead-quality referral)",
  ],

  // ── 13. Explainability Requirements ─────────────────────────
  explainabilityRequirements: [
    "Show the specific leads, transcripts, brand-voice rules, and prior variants used (with deep-links) for every output.",
    "Distinguish between recommendation, draft, simulation, and proposed action with explicit labels.",
    "Surface the assumptions made (CAC range, audience size, channel decay) and let the user edit them inline.",
    "Show alternative angles considered and why the lead recommendation was chosen.",
    "Display a calibrated confidence band (low / medium / high) with the underlying evidence count.",
    "Link to the receipt for any drafted or proposed action so the user can audit later.",
    "Flag tone drift against the brand voice guide explicitly when drafting creative.",
  ],

  // ── 14. Simulation Contract ─────────────────────────────────
  simulation: {
    summary:
      "Marketing Advisor simulations let the operator pressure-test ad angles, channel reallocations, and campaign envelopes against the same live acquisition context — with assumptions explicit and outputs labelled as projections, not commitments. Spend-projection scenarios are flagged non-authoritative because CAC and conversion assumptions are uncertain.",
    scenarios: [
      {
        id: "ad-angle-comparison-scenario",
        label: "Compare 2–3 ad-creative angles against a target audience",
        compares:
          "Two or three ad angles (e.g. pain-led / outcome-led / proof-led) for the same offer and audience, anchored to brand voice.",
        requiredInputs: ["offer", "targetAudience", "angleVariants"],
        optionalInputs: ["channel", "brandVoiceOverrides", "priorWinnerRefs"],
        outputs: [
          "draftedVariantsPerAngle",
          "hypothesisPerAngle",
          "successCriteriaPerAngle",
          "brandVoiceFitNotes",
          "recommendedAngle",
        ],
        nonAuthoritative: false,
      },
      {
        id: "channel-mix-reallocation-scenario",
        label: "Project the impact of reallocating spend across channels",
        compares:
          "Multiple reallocation variants (e.g. shift 20% from channel A to channel B) using current qualification rates by source.",
        requiredInputs: ["currentMix", "reallocationVariants"],
        optionalInputs: ["assumedCacByChannel", "horizonDays"],
        outputs: [
          "projectedQualifiedLeadsPerVariant",
          "concentrationRiskPerVariant",
          "assumptionsUsed",
          "recommendedVariant",
        ],
        nonAuthoritative: true,
      },
      {
        id: "campaign-envelope-sizing-scenario",
        label: "Size a campaign budget envelope against goals and CAC bands",
        compares:
          "Different campaign envelope sizes (e.g. lean / base / stretch) against a target qualified-lead count using CAC bands.",
        requiredInputs: ["targetQualifiedLeads", "envelopeVariants"],
        optionalInputs: ["assumedCacRange", "horizonWeeks", "channelMixHint"],
        outputs: [
          "projectedLeadsPerEnvelope",
          "cashImpactPerEnvelope",
          "assumptionsUsed",
          "recommendedEnvelope",
          "cfoEscalationFlag",
        ],
        nonAuthoritative: true,
      },
      {
        id: "positioning-frame-comparison-scenario",
        label: "Compare positioning frames against real customer language",
        compares:
          "Two or three positioning frames (audience × problem × promise) scored against language extracted from qualified leads and support themes.",
        requiredInputs: ["frameVariants"],
        optionalInputs: ["evidenceWindowDays", "competitorContext", "icpRefs"],
        outputs: [
          "evidenceMatchPerFrame",
          "differentiationNotesPerFrame",
          "weakestProofPointPerFrame",
          "recommendedFrame",
        ],
        nonAuthoritative: false,
      },
    ],
  },

  // ── 15. Memory / Learning ───────────────────────────────────
  memoryRules: [
    "Remembers workspace brand voice guide, approved positioning frames, and prior winning creative variants.",
    "Remembers approved channel mix, target ICPs, and recurring campaign templates so the operator does not re-explain context.",
    "Remembers prior experiment hypotheses and outcomes to inform the next test.",
    "Forgets resolved campaign detail beyond the configured retention window, keeping aggregates and learnings only.",
    "Never carries memory across workspaces — each workspace's marketing context is isolated.",
    "Surfaces all remembered facts in the Spec/Memory drawer and lets the user edit or delete any entry.",
  ],

  // ── 16. Proactive Behavior ──────────────────────────────────
  proactiveSignals: [
    {
      trigger: "Top-channel concentration crosses risk threshold (e.g. >60% of inbound from one channel)",
      surface: "Marketing Advisor home → Channel concentration banner + Approval Center proposal",
      cadence: "event-driven",
      mode: "action-oriented",
      approvalRequired: true,
    },
    {
      trigger: "Qualification rate on any active channel drops materially over a 14/30-day window",
      surface: "Marketing Advisor home → Channel decay card + drafted refresh variants",
      cadence: "real-time",
      mode: "action-oriented",
      approvalRequired: true,
    },
    {
      trigger: "Weekly acquisition pulse window (workspace timezone-aware)",
      surface: "Marketing Advisor home → Pulse card + Boardroom dispatch",
      cadence: "weekly",
      mode: "suggested",
      approvalRequired: false,
    },
    {
      trigger: "Creative variant exceeds fatigue threshold (long run-time + decaying engagement proxy)",
      surface: "Creative studio → Fatigue shelf + drafted refresh angles",
      cadence: "event-driven",
      mode: "suggested",
      approvalRequired: false,
    },
    {
      trigger: "Material positioning drift detected between drafted creative and brand voice guide",
      surface: "Creative studio → Tone-drift card with concrete edits",
      cadence: "event-driven",
      mode: "suggested",
      approvalRequired: false,
    },
  ],

  // ── 17. Knowledge / Document Support ────────────────────────
  knowledgeSources: [
    {
      label: "Brand voice guide & positioning library",
      extracts: "Tone, do/don't language, approved positioning frames, proof points, claim guardrails",
      scope: "workspace",
      sensitivity: "high",
    },
    {
      label: "Qualified-lead notes & customer-language bank",
      extracts: "Phrases used by qualified leads, recurring objections, ICP signals",
      scope: "workspace",
      sensitivity: "medium",
    },
    {
      label: "Prior approved campaigns & creative variants",
      extracts: "Approved templates, prior winners, retired angles, experiment outcomes",
      scope: "workspace",
      sensitivity: "medium",
    },
    {
      label: "Channel & lead-source catalog",
      extracts: "Defined channels, source taxonomy, attribution rules, qualification expectations",
      scope: "workspace",
      sensitivity: "medium",
    },
    {
      label: "Compliance & claims policy (read-only pointers)",
      extracts: "Pointers to regulated-claim and disclosure rules — never authoritative here, escalates to Taxes & Laws Advisor",
      scope: "workspace",
      sensitivity: "critical",
    },
  ],

  // ── 18. Analytics / Instrumentation ─────────────────────────
  analyticsEvents: [
    "marketing_advisor.invocation (capability_key, prompt_class)",
    "marketing_advisor.scenario_run (scenario_id, variants_count, assumptions_count)",
    "marketing_advisor.draft_used (artifact_type, sent | edited | discarded)",
    "marketing_advisor.proactive_signal_fired (signal_kind, surface)",
    "marketing_advisor.approval_outcome (action_type, decision, latency_ms)",
    "marketing_advisor.channel_decay_detected (channel, drop_pct)",
    "marketing_advisor.fatigue_detected (variant_id, age_days)",
    "marketing_advisor.tone_drift_flagged (asset_id, drift_score)",
    "marketing_advisor.feedback (artifact_id, rating, useful | not_useful)",
  ],

  // ── 19. Admin Oversight ─────────────────────────────────────
  adminOversightSurfaces: [
    "Adoption dashboard: weekly active users, top use cases, draft-acceptance rate",
    "Failure log: low-confidence outputs, refused requests, simulation timeouts",
    "Approval audit: approval rate, mean approval latency, rejection reasons by action_type",
    "Receipt browser: every output and proposed action filterable by user, period, and artifact type",
    "Cross-advisor escalation log: when and why Marketing escalated to CFO/Sales/Growth/CEO",
    "Kill-switch & autonomy state: domain-scoped halts and current authority ceiling",
    "Brand-voice drift report: tone-drift incidents over time with resolution outcome",
    "Experiment audit: every experiment design with hypothesis, success/kill criteria, and outcome",
  ],

  // ── 20. Testing Matrix ──────────────────────────────────────
  testingMatrix: [
    {
      category: "unit",
      scenarios: [
        "Channel-share aggregator computes source mix correctly on fixture leads",
        "Qualification-rate calculator handles zero-volume channels without divide-by-zero",
        "Fatigue detector flips when run-time + decay thresholds are crossed on a fixture variant",
      ],
    },
    {
      category: "component",
      scenarios: [
        "AdvisorSpecPanel renders all 23 sections of the Marketing Advisor spec",
        "MarketingAdvisorHeaderStats renders skeletons, then live counts honestly",
        "Creative studio renders side-by-side variants with brand-voice anchor",
      ],
    },
    {
      category: "integration",
      scenarios: [
        "Marketing Advisor reads leads + lead_inbox_items via RLS and produces a pulse",
        "Approval Center receives proposed sends and reflects status changes",
        "Standing-mission run for weekly acquisition pulse emits a signal and a receipt",
      ],
    },
    {
      category: "e2e",
      scenarios: [
        "User asks for 3 ad angles, picks one, approves a queued send, receipt appears",
        "Weekly acquisition pulse proactively surfaces and the user acts on a channel-decay flag",
      ],
    },
    {
      category: "regression",
      scenarios: [
        "Spec validator passes for MARKETING_ADVERTISING_ADVISOR_SPEC (no stubs, all sections complete)",
        "Authority ceiling stays at L3-draft until explicitly raised by admin",
      ],
    },
    {
      category: "error-state",
      scenarios: [
        "Missing brand voice guide surfaces a structured 'no voice anchor' state with a one-click setup CTA",
        "Provider failure during creative generation surfaces a recoverable error in the UI",
      ],
    },
    {
      category: "explainability",
      scenarios: [
        "Every creative draft exposes the leads/transcripts/voice-rules used and tone-fit notes",
        "Confidence band is rendered and matches the underlying evidence count",
      ],
    },
    {
      category: "receipt",
      scenarios: [
        "ai_action_receipt is created for every drafted asset and every proposed action",
        "Experiment designs produce a reproducible receipt including hypothesis and kill criteria",
      ],
    },
    {
      category: "authority",
      scenarios: [
        "Attempt to launch a paid campaign is blocked at L3 and routed to Approval Center on raise to L4",
        "Attempt to publish landing copy without approval is refused and logged",
        "Kill-switch engaged on marketing domain halts all proactive signals immediately",
      ],
    },
    {
      category: "simulation",
      scenarios: [
        "ad-angle-comparison-scenario returns drafted variants per angle with brand-voice fit notes",
        "channel-mix-reallocation-scenario output is flagged nonAuthoritative=true in the UI",
        "campaign-envelope-sizing-scenario routes a CFO escalation flag when envelope is material",
      ],
    },
    {
      category: "module-integration",
      scenarios: [
        "Leads/Inbox modules expose drafts but never accept an autonomous external send from the advisor",
        "Boardroom synthesis ingests positioning shifts and channel-risk signals into the CEO Advisor view",
      ],
    },
  ],

  // ── 21. Definition of Done ──────────────────────────────────
  definitionOfDone: [
    "All 9 core use cases are functional against real leads/inbox/CRM data, not fixtures",
    "Required inputs are wired from the Leads, Inbox, and CRM modules with typed adapters",
    "Marketing Advisor home, creative studio, channel-mix panel, and Spec tab are implemented",
    "Trust model enforced: no live launches, no autonomous external sends, no brand-asset edits",
    "Authority ceiling enforced at L3-draft via business-advisor-runtime",
    "Explainability drawer renders sources, assumptions, alternatives, and confidence",
    "All 4 simulation scenarios are runnable and produce the documented output keys",
    "ai_action_receipts are emitted for every output and proposed action",
    "All 11 testing-matrix categories have at least one passing automated test",
    "Analytics events are instrumented and visible in the admin adoption dashboard",
    "Empty, loading, and error states are honest (no demo placeholders) on every surface",
    "Standing missions for weekly acquisition pulse, monthly positioning review, and channel-decay watch are registered and gated",
    "Cross-advisor escalation paths to CFO/Sales/Growth/CEO are wired and observable in admin",
    "Spec is registered, passes validateAdvisorSpec, and renders in the Spec tab with no warnings",
  ],

  // ── 22. Phase Roadmap ───────────────────────────────────────
  roadmap: {
    phase1: {
      title: "Deployable core — pulse, channel insight, drafted creative",
      outcomes: [
        "Header stats live (inbound 30d, active leads, top channel, qualification rate)",
        "Channel-mix panel with qualification-by-source and decay flags",
        "Creative studio with brand-voice-anchored ad/email variant drafts",
        "Spec tab live, receipts emitted, kill-switch respected",
      ],
    },
    phase2: {
      title: "Deeper intelligence — experiments, positioning, integrations",
      outcomes: [
        "All 4 simulation scenarios live in the experiment designer and creative studio",
        "Positioning workspace with evidence-grounded frames and competitor context",
        "Cross-advisor escalation flows to CFO/Sales/Growth wired and observable",
        "Approval Center bundles for multi-asset campaign launches",
      ],
    },
    phase3: {
      title: "Bounded automation — pulses, watchlists, continuous monitoring",
      outcomes: [
        "L4 auto-drafted refresh variants when fatigue thresholds trip, queued for approval",
        "Continuous channel-decay and concentration watchlist with daily proposals",
        "Boardroom dispatch of positioning shifts and channel-risk signals into CEO synthesis",
        "Auto-detected scenario assumption sets from prior approved experiments",
      ],
    },
  },

  // ── 23. Wow Differentiators ─────────────────────────────────
  wowDifferentiators: [
    "Feels like a senior fractional CMO reading every recent lead with you — outputs cite live transcripts and brand voice, not generic copywriting tropes.",
    "Experiments are first-class: every test ships with an explicit hypothesis, success metric, and kill criterion captured in the receipt — never 'let's run it and see'.",
    "Channel discipline is built in: concentration risk, decay, and qualification-rate drops surface as named signals with drafted refresh variants ready to review.",
    "Brand voice is preserved by default: drafted creative is anchored to the workspace voice guide and tone drift is flagged with concrete edits, not vibes.",
    "Hard boundary on paid spend and external sends — every output is auditable, every action goes through Approval Center, and material budget envelopes are routed to the CFO Advisor before approval.",
  ],
};

// Side-effect: register on import.
registerAdvisorSpec(MARKETING_ADVERTISING_ADVISOR_SPEC);
