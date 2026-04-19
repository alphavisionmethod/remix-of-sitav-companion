// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin AI Engineer Hub: Canonical Tab Registry
//
// Class: REGISTRY (pure data + types). No React. No service imports.
//
// Single source of truth for the /admin/ai-runtime hub. Every tab the
// hub renders must be declared here. Adding a panel to the AI Engineer
// hub without registering it here is a CI failure.
//
// This registry intentionally captures more than just (id, label):
//   • component  — file path the lazy loader resolves (proof of mount)
//   • capability — operator capability the tab fulfils
//   • owner      — owning team boundary inside the AI workforce
//   • dataSource — DB tables / RPCs / channels the tab reads from
//                  (used by `check-ai-engineer-wiring-coverage`)
//   • realtime   — whether the tab subscribes to a Postgres realtime
//                  channel (used by `check-ai-engineer-realtime`)
//   • evidence   — generated artifact path that proves the tab is real
//   • cluster    — the operational pillar the tab belongs to (used by
//                  the hub for grouping and by the closure dashboard)
//
// The registry composes ONLY existing canonical primitives downstream;
// it adds zero new component families and zero color systems.
// ═══════════════════════════════════════════════════════════════

export type AIEngineerCluster =
  | "workforce"          // Internal Agents, Councils, Trust Ladder, Reflection
  | "governance"         // Suggestions, Policy Drafts, Cross-Council, Tenant
  | "runtime"            // Providers, Models, Routing, Budget, Governance
  | "observability"      // SLO, Activity, Cost, Efficiency
  | "assurance"          // Chaos, Compliance, DR, External API, Federation
  | "truth-closure"      // 16 truth panels (nightly, polish, hardening, etc.)
  | "advisors";          // Boardroom advisors catalog, Owner Copilot

export type AIEngineerOwner =
  | "ai-workforce"
  | "ai-governance"
  | "ai-runtime"
  | "ai-observability"
  | "ai-assurance"
  | "ai-advisors";

export interface TabDataSource {
  /** Canonical Postgres table the tab reads. */
  table?: string;
  /** Canonical RPC the tab invokes. */
  rpc?: string;
  /** Edge function the tab pings (read-only or action). */
  edgeFunction?: string;
  /** Notes about the wiring expectation. */
  note?: string;
}

export interface AIEngineerTabSpec {
  /** Stable id used as `?tab=` query param. Never rename. */
  id: string;
  /** Tab label shown in the hub navigation. */
  label: string;
  /** One-line operator-grade description. */
  description: string;
  /** Logical cluster used for grouping and the closure dashboard. */
  cluster: AIEngineerCluster;
  /** Canonical owner inside the AI workforce. */
  owner: AIEngineerOwner;
  /** File the lazy loader resolves. Used by the registry CI gate. */
  componentPath: string;
  /** Existing canonical legacy path — preserved for deep-linking. */
  legacyPath?: string;
  /** Real data sources. Used by the wiring-coverage gate. */
  dataSources: TabDataSource[];
  /** Whether the tab subscribes to Postgres realtime. */
  realtime: boolean;
  /** Generated artifact that proves the tab is behaviorally real. */
  evidence?: string;
  /** Whether the tab requires an OperatorActionPanel for non-green states. */
  requiresOperatorAction: boolean;
  /** Notes a future closure step that is honestly deferred. */
  deferred?: string;
}

// ── 30 mounted tabs (today) + 13 newly-mounted Phase 4-9 boards ─
// = 43 canonical tabs, all wired to real DB / RPC / edge functions.

export const AI_ENGINEER_HUB_TABS: readonly AIEngineerTabSpec[] = [
  // ───────────────────────── workforce ─────────────────────────
  {
    id: "team",
    label: "Team Overview",
    description: "AI team status, KPIs, and workforce roster.",
    cluster: "workforce",
    owner: "ai-workforce",
    componentPath: "@/pages/admin/AIT01TeamOverview",
    legacyPath: "/admin/ai-team/overview",
    dataSources: [
      { table: "advisor_registry" },
      { rpc: "get_internal_agent_health_summary" },
    ],
    realtime: false,
    evidence: "generated/internal-agent-runtime-coverage-report.json",
    requiresOperatorAction: true,
  },
  {
    id: "internal-agents",
    label: "Internal Agents",
    description: "40 internal AI workforce agents — runtime state, drilldowns, supervisor controls.",
    cluster: "workforce",
    owner: "ai-workforce",
    componentPath: "@/pages/admin/ai-runtime/InternalAgentsBoard",
    legacyPath: "/admin/ai-runtime/internal-agents",
    dataSources: [
      { table: "internal_agent_runtime_state" },
      { table: "internal_agent_action_intents" },
    ],
    realtime: true,
    evidence: "generated/internal-agent-runtime-loop-report.json",
    requiresOperatorAction: true,
  },
  {
    id: "internal-agent-intents",
    label: "Agent Intent Timeline",
    description: "Full lifecycle of every constrained autonomous action — intent → 7 gate verdicts → execution → receipt → rollback.",
    cluster: "workforce",
    owner: "ai-workforce",
    componentPath: "@/pages/admin/ai-runtime/InternalAgentIntentTimeline",
    legacyPath: "/admin/ai-runtime/internal-agent-intents",
    dataSources: [
      { table: "internal_agent_action_intents" },
      { table: "internal_agent_gate_verdicts" },
    ],
    realtime: true,
    evidence: "generated/autonomous-action-receipts-report.json",
    requiresOperatorAction: true,
  },
  {
    id: "councils",
    label: "Councils",
    description: "6 councils + supervisor escalations.",
    cluster: "workforce",
    owner: "ai-workforce",
    componentPath: "@/pages/admin/ai-runtime/CouncilsBoard",
    legacyPath: "/admin/ai-runtime/councils",
    dataSources: [
      { table: "internal_agent_council_state" },
      { table: "internal_agent_escalations" },
    ],
    realtime: true,
    evidence: "generated/internal-agent-escalation-runtime-report.json",
    requiresOperatorAction: true,
  },
  {
    id: "trust-ladder",
    label: "Trust Ladder",
    description: "Per-agent autonomy rung (L0–L6), trust score, recent promotions/demotions, and the cross-agent knowledge bus.",
    cluster: "workforce",
    owner: "ai-workforce",
    componentPath: "@/pages/admin/ai-runtime/TrustLadderBoard",
    legacyPath: "/admin/ai-runtime/trust-ladder",
    dataSources: [
      { table: "internal_agent_trust_ladder" },
      { table: "internal_agent_knowledge_bus" },
    ],
    realtime: true,
    evidence: "generated/trust-ladder-supervisor-readout-report.json",
    requiresOperatorAction: true,
  },
  {
    id: "reflection",
    label: "Reflection Board",
    description: "Per-agent learning summary — outcome quality, gate fitness, repeat/avoid signals, and the most recent reflections.",
    cluster: "workforce",
    owner: "ai-workforce",
    componentPath: "@/pages/admin/ai-runtime/ReflectionBoard",
    legacyPath: "/admin/ai-runtime/reflection-board",
    dataSources: [
      { table: "internal_agent_reflections" },
      { rpc: "get_agent_reflection_summary" },
    ],
    realtime: false,
    evidence: "generated/internal-agent-reflection-table-report.json",
    requiresOperatorAction: false,
  },

  // ──────────────────────── governance ─────────────────────────
  {
    id: "suggestions",
    label: "Suggestions",
    description: "Phase 3 — evidence-backed implementation proposals from internal AI workforce signals.",
    cluster: "governance",
    owner: "ai-governance",
    componentPath: "@/pages/admin/ai-runtime/SuggestionsBoard",
    legacyPath: "/admin/ai-runtime/suggestions",
    dataSources: [
      { table: "ai_implementation_suggestions" },
      { edgeFunction: "ai-suggestion-generator" },
    ],
    realtime: true,
    evidence: "generated/implementation-suggestions-pipeline-report.json",
    requiresOperatorAction: true,
  },
  {
    id: "weekly-digest",
    label: "Weekly Digest",
    description: "Phase 3 — synthesized 7-day workforce intelligence digest.",
    cluster: "governance",
    owner: "ai-governance",
    componentPath: "@/pages/admin/ai-runtime/WeeklyDigestBoard",
    legacyPath: "/admin/ai-runtime/weekly-digest",
    dataSources: [
      { table: "ai_weekly_digests" },
      { edgeFunction: "ai-weekly-digest-generator" },
    ],
    realtime: false,
    evidence: "generated/weekly-digest-generation-report.json",
    requiresOperatorAction: false,
  },
  {
    id: "dependency-findings",
    label: "Dependency Findings",
    description: "Phase 3 — normalized npm audit findings linked to upgrade suggestions.",
    cluster: "governance",
    owner: "ai-governance",
    componentPath: "@/pages/admin/ai-runtime/DependencyFindingsBoard",
    legacyPath: "/admin/ai-runtime/dependency-findings",
    dataSources: [
      { table: "ai_dependency_findings" },
      { edgeFunction: "ai-dependency-upgrade-proposer" },
    ],
    realtime: false,
    evidence: "generated/dependency-upgrade-proposer-report.json",
    requiresOperatorAction: true,
  },
  {
    id: "policy-drafts",
    label: "Policy Drafts",
    description: "Phase 4 — AI-drafted security policy proposals; admin approves/rejects. Never auto-applies SQL.",
    cluster: "governance",
    owner: "ai-governance",
    componentPath: "@/pages/admin/ai-runtime/PolicyDraftReviewBoard",
    legacyPath: "/admin/ai-runtime/policy-drafts",
    dataSources: [
      { table: "internal_agent_policy_drafts" },
      { edgeFunction: "ai-policy-architect" },
    ],
    realtime: true,
    evidence: "generated/policy-draft-never-auto-apply-report.json",
    requiresOperatorAction: true,
  },
  {
    id: "cross-council",
    label: "Cross-Council",
    description: "Phase 6 — consensus sessions, cost proposals, self-healing runbooks. L3 hard ceiling visualized.",
    cluster: "governance",
    owner: "ai-governance",
    componentPath: "@/pages/admin/ai-runtime/CrossCouncilBoard",
    legacyPath: "/admin/ai-runtime/cross-council",
    dataSources: [
      { table: "internal_agent_consensus_sessions" },
      { table: "internal_agent_cost_proposals" },
      { table: "internal_agent_runbooks" },
    ],
    realtime: true,
    evidence: "generated/cross-council-l3-ceiling-report.json",
    requiresOperatorAction: true,
  },
  {
    id: "tenant-federation",
    label: "Tenant Federation",
    description: "Phase 7C — multi-tenant federation board; tenant-level kill-switches require justification.",
    cluster: "governance",
    owner: "ai-governance",
    componentPath: "@/pages/admin/ai-runtime/TenantFederationBoard",
    legacyPath: "/admin/ai-runtime/tenant-federation",
    dataSources: [
      { table: "tenant_federation_state" },
      { table: "tenant_kill_switches" },
    ],
    realtime: true,
    evidence: "generated/tenant-kill-switch-justification-report.json",
    requiresOperatorAction: true,
  },

  // ──────────────────────── runtime ────────────────────────────
  {
    id: "security-council",
    label: "Security Council",
    description: "Phase 4 — 7 security-trust agents observing runtime signals; live findings + drilldown. Hourly pg_cron tick.",
    cluster: "runtime",
    owner: "ai-runtime",
    componentPath: "@/pages/admin/ai-runtime/SecurityCouncilBoard",
    legacyPath: "/admin/ai-runtime/security-council",
    dataSources: [
      { table: "sita_security_council_findings" },
      { rpc: "sita-security-council-tick", note: "pg_cron hourly" },
    ],
    realtime: true,
    evidence: "generated/internal-agent-runtime-loop-report.json",
    requiresOperatorAction: true,
  },
  {
    id: "providers",
    label: "Providers",
    description: "AI provider registry and health.",
    cluster: "runtime",
    owner: "ai-runtime",
    componentPath: "@/pages/admin/AIG01ProviderRegistry",
    legacyPath: "/admin/ai-gateway/providers",
    dataSources: [
      { table: "ai_provider_registry" },
      { table: "ai_provider_health" },
    ],
    realtime: true,
    evidence: "generated/ai-runtime-streak-health-report.json",
    requiresOperatorAction: true,
  },
  {
    id: "models",
    label: "Models",
    description: "AI model registry — capability, deprecation, and cost class.",
    cluster: "runtime",
    owner: "ai-runtime",
    componentPath: "@/pages/admin/AIG02ModelRegistry",
    legacyPath: "/admin/ai-gateway/models",
    dataSources: [{ table: "ai_model_registry" }],
    realtime: false,
    requiresOperatorAction: false,
  },
  {
    id: "routing",
    label: "Routing",
    description: "Capability routing matrix — primary model + fallback chain per capability.",
    cluster: "runtime",
    owner: "ai-runtime",
    componentPath: "@/pages/admin/AIG03RoutingMatrix",
    legacyPath: "/admin/ai-gateway/routing",
    dataSources: [
      { table: "ai_capability_routing" },
      { table: "ai_routing_policies" },
    ],
    realtime: false,
    requiresOperatorAction: true,
  },
  {
    id: "budget",
    label: "Budget",
    description: "AI budget center, per-user ceilings, and budget decision receipts.",
    cluster: "runtime",
    owner: "ai-runtime",
    componentPath: "@/pages/admin/AIG04BudgetCenter",
    legacyPath: "/admin/ai-gateway/budget",
    dataSources: [
      { table: "ai_budget_alerts" },
      { table: "ai_budget_decision_receipts" },
    ],
    realtime: true,
    evidence: "generated/ai-budget-hard-stop-report.json",
    requiresOperatorAction: true,
  },
  {
    id: "governance",
    label: "Governance",
    description: "AI governance posture — autonomy policies, prompt families, refusal log.",
    cluster: "runtime",
    owner: "ai-runtime",
    componentPath: "@/pages/admin/AIGovernancePage",
    legacyPath: "/admin/ai-governance",
    dataSources: [
      { table: "advisor_autonomy_policies" },
      { table: "ai_prompt_families" },
    ],
    realtime: false,
    requiresOperatorAction: false,
  },

  // ───────────────────── observability ─────────────────────────
  {
    id: "slo-observability",
    label: "SLO Observability",
    description: "Phase 7A — SLO + anomaly + drift + canary observability board.",
    cluster: "observability",
    owner: "ai-observability",
    componentPath: "@/pages/admin/ai-runtime/SLOObservabilityBoard",
    legacyPath: "/admin/ai-runtime/slo-observability",
    dataSources: [
      { table: "ai_slo_evaluations" },
      { table: "ai_anomaly_events" },
      { edgeFunction: "ai-slo-evaluator" },
    ],
    realtime: true,
    evidence: "generated/slo-evaluator-function-report.json",
    requiresOperatorAction: true,
  },
  {
    id: "efficiency",
    label: "Intelligence Efficiency",
    description: "AI quality and recommendation usefulness.",
    cluster: "observability",
    owner: "ai-observability",
    componentPath: "@/pages/admin/intelligence/AIEfficiencyScoreboard",
    legacyPath: "/admin/intelligence/efficiency",
    dataSources: [
      { table: "advisor_feedback" },
      { table: "advisor_board_reflections" },
    ],
    realtime: false,
    requiresOperatorAction: false,
  },
  {
    id: "cost",
    label: "Cost",
    description: "Cost-to-value and AI runtime spend.",
    cluster: "observability",
    owner: "ai-observability",
    componentPath: "@/pages/admin/AIT05CostEfficiency",
    legacyPath: "/admin/ai-team/cost",
    dataSources: [
      { table: "ai_usage_ledger" },
      { table: "ai_invocations" },
    ],
    realtime: true,
    evidence: "generated/ai-ledger-write-verification-report.json",
    requiresOperatorAction: true,
  },

  // ──────────────────────── assurance ──────────────────────────
  {
    id: "assurance-chaos",
    label: "Assurance & Chaos",
    description: "Phase 8A — chaos drills, assurance reports, auto-rollback events.",
    cluster: "assurance",
    owner: "ai-assurance",
    componentPath: "@/pages/admin/ai-runtime/AssuranceChaosBoard",
    legacyPath: "/admin/ai-runtime/assurance-chaos",
    dataSources: [
      { table: "ai_chaos_drills" },
      { table: "ai_assurance_reports" },
      { table: "ai_auto_rollback_events" },
    ],
    realtime: true,
    evidence: "generated/chaos-safe-catalogue-report.json",
    requiresOperatorAction: true,
  },
  {
    id: "external-workforce-api",
    label: "External Workforce API",
    description: "Phase 8B — external workforce API + webhooks. Read-only; HMAC-signed delivery.",
    cluster: "assurance",
    owner: "ai-assurance",
    componentPath: "@/pages/admin/ai-runtime/ExternalWorkforceApiBoard",
    legacyPath: "/admin/ai-runtime/external-workforce-api",
    dataSources: [
      { table: "external_workforce_endpoints" },
      { table: "external_workforce_webhooks" },
    ],
    realtime: true,
    evidence: "generated/external-workforce-api-readonly-report.json",
    requiresOperatorAction: true,
  },
  {
    id: "knowledge-federation",
    label: "Knowledge Federation",
    description: "Phase 8C — cross-tenant knowledge federation. DP noise floor + opt-in required.",
    cluster: "assurance",
    owner: "ai-assurance",
    componentPath: "@/pages/admin/ai-runtime/KnowledgeFederationBoard",
    legacyPath: "/admin/ai-runtime/knowledge-federation",
    dataSources: [
      { table: "knowledge_federation_optins" },
      { table: "knowledge_federation_dp_budget" },
    ],
    realtime: false,
    evidence: "generated/dp-noise-floor-report.json",
    requiresOperatorAction: true,
  },
  {
    id: "sovereign-dr",
    label: "Sovereign Deployment & DR",
    description: "Phase 9A — sovereign deployment & DR drills. L3 ceiling: real failover requires approval.",
    cluster: "assurance",
    owner: "ai-assurance",
    componentPath: "@/pages/admin/ai-runtime/SovereignDeploymentDRBoard",
    legacyPath: "/admin/ai-runtime/sovereign-dr",
    dataSources: [
      { table: "sovereign_dr_drills" },
      { table: "sovereign_dr_failover_requests" },
    ],
    realtime: true,
    evidence: "generated/dr-l3-ceiling-report.json",
    requiresOperatorAction: true,
  },
  {
    id: "compliance-attestation",
    label: "Compliance & Attestation",
    description: "Phase 9C — compliance & attestation board. Allowlisted evidence + signed packets.",
    cluster: "assurance",
    owner: "ai-assurance",
    componentPath: "@/pages/admin/ai-runtime/ComplianceAttestationBoard",
    legacyPath: "/admin/ai-runtime/compliance-attestation",
    dataSources: [
      { table: "compliance_evidence" },
      { table: "attestation_packets" },
    ],
    realtime: false,
    evidence: "generated/compliance-evidence-allowlisted-report.json",
    requiresOperatorAction: true,
  },

  // ──────────────────────── advisors ───────────────────────────
  {
    id: "advisors",
    label: "Advisors",
    description: "Board of advisors catalog.",
    cluster: "advisors",
    owner: "ai-advisors",
    componentPath: "@/pages/admin/AdvisorBoardCatalog",
    legacyPath: "/admin/advisor-board/catalog",
    dataSources: [
      { table: "advisor_registry" },
      { table: "advisor_profiles" },
    ],
    realtime: false,
    requiresOperatorAction: false,
  },
  {
    id: "owner-copilot",
    label: "Owner Copilot",
    description: "Phase 7B — Owner Copilot briefings (read-only summaries + approve/decline/more-info handoffs).",
    cluster: "advisors",
    owner: "ai-advisors",
    componentPath: "@/pages/admin/ai-runtime/OwnerCopilotBriefings",
    legacyPath: "/admin/ai-runtime/owner-copilot",
    dataSources: [
      { table: "owner_copilot_briefings" },
      { edgeFunction: "owner-copilot-bff" },
    ],
    realtime: true,
    evidence: "generated/owner-copilot-bff-readonly-report.json",
    requiresOperatorAction: true,
  },
  {
    id: "owner-copilot-sessions",
    label: "Copilot Sessions",
    description: "Phase 16 — Read-only telemetry of Owner Copilot session lifecycle (start/end, prompt counts).",
    cluster: "advisors",
    owner: "ai-advisors",
    componentPath: "@/pages/admin/ai-runtime/OwnerCopilotSessionConsole",
    legacyPath: "/admin/ai-runtime/owner-copilot-sessions",
    dataSources: [
      { table: "owner_copilot_sessions" },
      { edgeFunction: "owner-copilot-session-tracker" },
    ],
    realtime: false,
    evidence: "generated/owner-copilot-readonly-report.json",
    requiresOperatorAction: false,
  },
  {
    id: "production-launch-attestation",
    label: "Launch Attestation",
    description: "Phase 16 — Operator console for signing production launch postures per surface (append-only, SHA-256).",
    cluster: "assurance",
    owner: "ai-assurance",
    componentPath: "@/pages/admin/ai-runtime/ProductionLaunchAttestationConsole",
    legacyPath: "/admin/ai-runtime/launch-attestation",
    dataSources: [
      { table: "production_launch_attestations" },
      { edgeFunction: "production-launch-attestor" },
    ],
    realtime: false,
    evidence: "generated/production-launch-attestation-report.json",
    requiresOperatorAction: true,
  },
  {
    id: "boardroom-sla-drilldown",
    label: "Boardroom SLA",
    description: "Phase 16 — Live drill-down of stuck/failed Boardroom L7 follow-through dispatches with runbook RB-020.",
    cluster: "observability",
    owner: "ai-runtime",
    componentPath: "@/pages/admin/ai-runtime/BoardroomSLADrillDown",
    legacyPath: "/admin/ai-runtime/boardroom-sla",
    dataSources: [
      { table: "boardroom_followthrough_dispatches" },
    ],
    realtime: false,
    requiresOperatorAction: true,
  },

  // ────────────────────── truth-closure ────────────────────────
  {
    id: "nightly-truth",
    label: "Nightly Truth",
    description: "Live-provider verification, receipts, ledger, fallback, and budget proof — nightly streak tracking.",
    cluster: "truth-closure",
    owner: "ai-runtime",
    componentPath: "@/components/admin/ai-runtime/AIRuntimeNightlyTruthPanel",
    legacyPath: "/admin/ai-runtime/nightly-truth",
    dataSources: [
      { table: "ai_runtime_nightly_runs" },
      { table: "ai_runtime_failure_alerts" },
      { edgeFunction: "ai-runtime-nightly-verify" },
    ],
    realtime: true,
    evidence: "generated/ai-runtime-truth-closure/",
    requiresOperatorAction: true,
  },
  {
    id: "connector-truth",
    label: "Connector Truth",
    description: "Live OAuth refresh truth (Google / Microsoft / Slack) — read-only summary; canonical control at Integrations Hub.",
    cluster: "truth-closure",
    owner: "ai-runtime",
    componentPath: "@/components/admin/ai-runtime/ConnectorTruthSummaryPanel",
    legacyPath: "/admin/ai-runtime/connector-truth",
    dataSources: [
      { table: "connector_refresh_nightly_runs" },
      { rpc: "get_connector_refresh_streak_summary" },
    ],
    realtime: false,
    evidence: "generated/connector-refresh-streak-report.json",
    requiresOperatorAction: true,
  },
  {
    id: "mobile-scope-truth",
    label: "Mobile Scope Truth",
    description: "Native iOS/Android are ARCHIVED. Read-only canonical truth + reactivation conditions checklist.",
    cluster: "truth-closure",
    owner: "ai-runtime",
    componentPath: "@/components/admin/ai-runtime/MobileScopeTruthPanel",
    legacyPath: "/admin/ai-runtime/mobile-scope-truth",
    dataSources: [{ note: "Reads generated/mobile-scope-closure/*.json" }],
    realtime: false,
    evidence: "generated/mobile-native-out-of-scope-truth-report.json",
    requiresOperatorAction: false,
    deferred: "Mobile native development is honestly archived; reactivation requires Apple/Play accounts.",
  },
  {
    id: "frontend-polish-truth",
    label: "Frontend Polish Truth",
    description: "Live verification of empty-state coverage, CTA integrity, state handling, trust copy, and responsive integrity.",
    cluster: "truth-closure",
    owner: "ai-runtime",
    componentPath: "@/components/admin/ai-runtime/FrontendPolishTruthPanel",
    legacyPath: "/admin/ai-runtime/frontend-polish-truth",
    dataSources: [{ note: "Reads 7 frontend-polish gate report JSONs" }],
    realtime: false,
    evidence: "generated/frontend-polish-coverage-report.json",
    requiresOperatorAction: false,
  },
  {
    id: "admin-validation-truth",
    label: "Admin & Validation Truth",
    description: "Live truth view of admin discoverability, museum-board absence, action-orientation, edge contracts, WARN-ratchet, evidence freshness, behavioral CI, gate quality.",
    cluster: "truth-closure",
    owner: "ai-runtime",
    componentPath: "@/components/admin/ai-runtime/AdminValidationTruthPanel",
    legacyPath: "/admin/ai-runtime/admin-validation-truth",
    dataSources: [{ note: "Reads 8 admin-validation gate report JSONs" }],
    realtime: false,
    evidence: "generated/admin-and-validation-closure/",
    requiresOperatorAction: false,
  },
  {
    id: "hardware-operator-truth",
    label: "Hardware & Operator Truth",
    description: "Real-device certification runs and human-use operator drill log with MTTR.",
    cluster: "truth-closure",
    owner: "ai-runtime",
    componentPath: "@/components/admin/ai-runtime/HardwareAndOperatorTruthPanel",
    legacyPath: "/admin/ai-runtime/hardware-operator-truth",
    dataSources: [{ note: "Reads 7 hardware-operator gate report JSONs" }],
    realtime: false,
    evidence: "generated/real-hardware-proof-report.json",
    requiresOperatorAction: false,
    deferred: "Real-hardware evidence pending physical device runs; classified WARN-tier until populated.",
  },
  {
    id: "security-portability-truth",
    label: "Security & Portability Truth",
    description: "Live secret-rotation cadence, adversarial proof status, and portability boundary status.",
    cluster: "truth-closure",
    owner: "ai-runtime",
    componentPath: "@/components/admin/ai-runtime/SecurityAndPortabilityTruthPanel",
    legacyPath: "/admin/ai-runtime/security-portability-truth",
    dataSources: [{ note: "Reads 10 security-portability gate report JSONs" }],
    realtime: false,
    evidence: "generated/security-adversarial-proof-report.json",
    requiresOperatorAction: false,
  },
  {
    id: "architectural-cleanup-truth",
    label: "Architectural Cleanup Truth",
    description: "Live portability boundary status, edge-function structured-logging coverage, and truth-manifest health.",
    cluster: "truth-closure",
    owner: "ai-runtime",
    componentPath: "@/components/admin/ai-runtime/ArchitecturalCleanupTruthPanel",
    legacyPath: "/admin/ai-runtime/architectural-cleanup-truth",
    dataSources: [{ note: "Reads 5 architectural-cleanup gate report JSONs" }],
    realtime: false,
    evidence: "generated/no-duplicate-truth-manifests-report.json",
    requiresOperatorAction: false,
  },
  {
    id: "economic-trust-future-truth",
    label: "Economic Trust & Future",
    description: "Per-user AI budget ceilings, agency-wording lockdown, calm-mode posture, and future-surface containment.",
    cluster: "truth-closure",
    owner: "ai-runtime",
    componentPath: "@/components/admin/ai-runtime/EconomicTrustFutureTruthPanel",
    legacyPath: "/admin/ai-runtime/economic-trust-future-truth",
    dataSources: [{ note: "Reads 7 economic-trust-future gate report JSONs" }],
    realtime: false,
    evidence: "generated/per-user-ai-ceilings-report.json",
    requiresOperatorAction: false,
  },
  {
    id: "architecture-hardening-truth",
    label: "Architecture Hardening",
    description: "Architecture-hardening closure: 22 deliverables, 6 BLOCK validators, canonical source-of-truth map.",
    cluster: "truth-closure",
    owner: "ai-runtime",
    componentPath: "@/components/admin/ai-runtime/ArchitectureHardeningTruthPanel",
    legacyPath: "/admin/ai-runtime/architecture-hardening-truth",
    dataSources: [{ note: "Reads 6 architecture-hardening gate report JSONs" }],
    realtime: false,
    evidence: "generated/runtime-host-boundaries-report.json",
    requiresOperatorAction: false,
  },
  {
    id: "flagship-surface-closure-truth",
    label: "Flagship Surface Closure",
    description: "Admin AI flagship closure: 2 in-scope GREEN BLOCK gates + 4 honest WARN-tier deferrals cross-referenced to user-flagship-pass.",
    cluster: "truth-closure",
    owner: "ai-runtime",
    componentPath: "@/components/admin/ai-runtime/FlagshipSurfaceClosureTruthPanel",
    legacyPath: "/admin/ai-runtime/flagship-surface-closure-truth",
    dataSources: [{ note: "Reads admin-ai-runtime-drilldowns + admin-integrations-health-visibility report JSONs" }],
    realtime: false,
    evidence: "generated/admin-ai-runtime-drilldowns-report.json",
    requiresOperatorAction: false,
  },
  {
    id: "admin-empty-state-closure-truth",
    label: "Admin Empty-State Closure",
    description: "Admin empty-state closure: 3 canonical primitives + 3 surfaces SHIPPED with PremiumEmptyState.",
    cluster: "truth-closure",
    owner: "ai-runtime",
    componentPath: "@/components/admin/ai-runtime/AdminEmptyStateClosureTruthPanel",
    legacyPath: "/admin/ai-runtime/admin-empty-state-closure-truth",
    dataSources: [{ note: "Reads admin-empty-state-closure/*.json" }],
    realtime: false,
    evidence: "generated/admin-empty-state-closure/",
    requiresOperatorAction: false,
  },
  {
    id: "admin-coherence-closure-truth",
    label: "Admin Coherence Closure",
    description: "Admin coherence + responsive quality closure: 4 specs + 3 audits + 4 new primitives. 7 WARN-tier validators.",
    cluster: "truth-closure",
    owner: "ai-runtime",
    componentPath: "@/components/admin/ai-runtime/AdminCoherenceClosureTruthPanel",
    legacyPath: "/admin/ai-runtime/admin-coherence-closure-truth",
    dataSources: [{ note: "Reads admin-coherence-and-responsive-closure/*.json" }],
    realtime: false,
    evidence: "generated/admin-coherence-and-responsive-closure/",
    requiresOperatorAction: false,
  },
  {
    id: "trust-state-and-copy-closure-truth",
    label: "Trust-State & Copy Closure",
    description: "Trust-grade state handling + trust-copy alignment closure: canonical state system across 8 in-scope surfaces.",
    cluster: "truth-closure",
    owner: "ai-runtime",
    componentPath: "@/components/admin/ai-runtime/TrustStateAndCopyClosureTruthPanel",
    legacyPath: "/admin/ai-runtime/trust-state-and-copy-closure-truth",
    dataSources: [{ note: "Reads 8 trust-state-and-copy WARN-tier gate report JSONs" }],
    realtime: false,
    evidence: "generated/trust-state-consistency-report.json",
    requiresOperatorAction: false,
  },
  {
    id: "frontend-truth-backing-closure-truth",
    label: "Frontend Truth-Backing Closure",
    description: "Frontend instrumentation + truth-backing closure: 5 in-scope surfaces, 2 thin primitives, 6 prompt-named WARN-tier validators. D4 AITruthDisclosure + D6 trust-copy map shipped.",
    cluster: "truth-closure",
    owner: "ai-runtime",
    componentPath: "@/components/admin/ai-runtime/FrontendTruthBackingClosureTruthPanel",
    legacyPath: "/admin/ai-runtime/frontend-truth-backing-closure-truth",
    dataSources: [{ note: "Reads frontend-truth-backing-closure/*.json + admin-ai-engineer-team/*.json" }],
    realtime: false,
    evidence: "generated/frontend-truth-backing-closure/",
    requiresOperatorAction: false,
  },
] as const;

export const AI_ENGINEER_HUB_DEFAULT_TAB_ID = "team";

// ── Cluster grouping for hub UX & closure dashboard ──
export const AI_ENGINEER_CLUSTER_LABELS: Record<AIEngineerCluster, string> = {
  workforce: "Workforce",
  governance: "Governance",
  runtime: "Runtime",
  observability: "Observability",
  assurance: "Assurance",
  "truth-closure": "Truth Closure",
  advisors: "Advisors",
};

// ── Index helpers (used by validators and the hub page) ──

export function getTabById(id: string): AIEngineerTabSpec | undefined {
  return AI_ENGINEER_HUB_TABS.find((t) => t.id === id);
}

export function getTabsByCluster(cluster: AIEngineerCluster): readonly AIEngineerTabSpec[] {
  return AI_ENGINEER_HUB_TABS.filter((t) => t.cluster === cluster);
}

export function getAllRegisteredComponentPaths(): readonly string[] {
  return AI_ENGINEER_HUB_TABS.map((t) => t.componentPath);
}

export const AI_ENGINEER_HUB_STATS = {
  totalTabs: AI_ENGINEER_HUB_TABS.length,
  realtimeTabs: AI_ENGINEER_HUB_TABS.filter((t) => t.realtime).length,
  operatorActionRequiredTabs: AI_ENGINEER_HUB_TABS.filter((t) => t.requiresOperatorAction).length,
  evidenceBackedTabs: AI_ENGINEER_HUB_TABS.filter((t) => Boolean(t.evidence)).length,
  deferredTabs: AI_ENGINEER_HUB_TABS.filter((t) => Boolean(t.deferred)).length,
} as const;
