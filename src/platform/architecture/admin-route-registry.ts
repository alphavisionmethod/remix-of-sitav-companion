// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin Route Registry (Single Source of Truth)
//
// This registry is the canonical source of truth for every admin
// route. Phase 1 of the Admin Control Plane Consolidation populates
// it with all 136 currently-mounted admin routes mapped into the
// 12-domain owner workflow IA. Subsequent phases drive nav,
// breadcrumbs, redirects, and the command palette from this file.
//
// Non-negotiable invariants enforced by governance scripts:
//   1. ≤ 12 top-level admin domains (ADMIN_DOMAINS).
//   2. Every admin route in src/routes/AdminRoutes.tsx must appear
//      here (check-admin-route-registry-conformance).
//   3. Every entry must declare a page class
//      (check-admin-page-classification-coverage).
//   4. Deprecated routes must declare `replacedBy`.
// ═══════════════════════════════════════════════════════════════

export const ADMIN_DOMAINS = [
  "overview",
  "alerts",
  "approvals",
  "environments",
  "ai-runtime",
  "integrations",
  "trust-security",
  "health",
  "releases",
  "verification",
  "config",
  "support",
] as const;

export type AdminDomain = (typeof ADMIN_DOMAINS)[number];

export const MAX_ADMIN_DOMAINS = 12;

/**
 * Page classification — drives the consolidation behavior.
 *  PRIMARY_DOMAIN_ENTRY     The canonical hub for a domain (rendered as /admin/<domain>).
 *  SECONDARY_SUBVIEW        First-class sub-page inside a hub's sub-nav.
 *  DETAIL_EXPLORER          Drill-down explorer reachable from a sub-view.
 *  WORKFLOW_TOOL            Operator action surface (approve / triage / replay).
 *  SUPPORT_TOOL             Diagnostics / recovery / maintenance operator surface.
 *  DUPLICATE_MERGE_REQUIRED Conceptually duplicates another page; will be merged.
 *  DEPRECATE_WITH_REDIRECT  Route stays for back-compat; redirects to canonical.
 *  REMOVE_AFTER_SAFE_MIGRATION  Final cleanup target — only after Phase 7 confirms zero refs.
 */
export type AdminPageClass =
  | "PRIMARY_DOMAIN_ENTRY"
  | "SECONDARY_SUBVIEW"
  | "DETAIL_EXPLORER"
  | "WORKFLOW_TOOL"
  | "SUPPORT_TOOL"
  | "DUPLICATE_MERGE_REQUIRED"
  | "DEPRECATE_WITH_REDIRECT"
  | "REMOVE_AFTER_SAFE_MIGRATION";

export type AdminNavVisibility = "primary" | "subnav" | "explorer" | "hidden" | "deprecated";

export interface AdminRouteEntry {
  /** Mounted route path (current production path). */
  path: string;
  /** The owning canonical domain. */
  domain: AdminDomain;
  /** Classification — drives Phase 2-7 behavior. */
  pageClass: AdminPageClass;
  /** Visibility in the consolidated 12-domain nav. */
  nav: AdminNavVisibility;
  /** Source page component name (matches `src/pages/admin/<name>.tsx` where applicable). */
  component?: string;
  /** Breadcrumb chain — first segment is always the domain label. */
  breadcrumb: string[];
  /** Owner team for support routing. */
  owner?: string;
  /** Permission required to render. Mirrors AdminRoutes.tsx. */
  permission?: string;
  /** When pageClass = DEPRECATE_WITH_REDIRECT, the canonical replacement path. */
  replacedBy?: string;
  /** Free-form notes describing the consolidation decision. */
  notes?: string;
  /** Workflow tag — used by owner-workflow-map. */
  workflows?: Array<"daily" | "weekly" | "support" | "release" | "trust-safety">;
}

// ─── Domain hub canonical entry paths ────────────────────────────
export const DOMAIN_HUB_PATHS: Record<AdminDomain, string> = {
  overview: "/admin/overview",
  alerts: "/admin/alerts",
  approvals: "/admin/approvals",
  environments: "/admin/environments",
  "ai-runtime": "/admin/ai-runtime",
  integrations: "/admin/integrations",
  "trust-security": "/admin/trust-security",
  health: "/admin/health",
  releases: "/admin/releases",
  verification: "/admin/verification",
  config: "/admin/config",
  support: "/admin/support",
};

export const DOMAIN_LABELS: Record<AdminDomain, string> = {
  overview: "Overview",
  alerts: "Alerts",
  approvals: "Approvals",
  environments: "Environments",
  "ai-runtime": "AI Runtime",
  integrations: "Integrations",
  "trust-security": "Trust & Security",
  health: "Health",
  releases: "Releases",
  verification: "Verification",
  config: "Config",
  support: "Support",
};

export const DOMAIN_DESCRIPTIONS: Record<AdminDomain, string> = {
  overview: "Daily executive command — alerts, approvals, incidents, release blockers at a glance.",
  alerts: "Single triage center for critical, degraded, AI, integration and incident-linked alerts.",
  approvals: "All owner approvals, history, risky actions, and approval policy review.",
  environments: "User / device / session / setup-state lookup, repair and recovery actions.",
  "ai-runtime": "Advisors, models, providers, routing, prompts, costs, AI workforce health.",
  integrations: "Connectors, providers, OAuth, sync, webhooks, consent graph.",
  "trust-security": "Trust state, policy editors, identity, proofs, audit, sensitive actions.",
  health: "Observability, runtime continuity, fleet, storage, self-healing, incidents, performance.",
  releases: "Launch readiness, deployment rings, rollback, VMware, mobile releases, artifacts.",
  verification: "Implementation truth, launch honesty, reality audit, customer journeys, conformance.",
  config: "Feature flags, templates, content, registries, environment config.",
  support: "Cases, diagnostics, replay, recovery, maintenance mode, stuck-workflow repair.",
};

// ─── Canonical domain hub entries (Phase 2 mounts these) ──────────
const DOMAIN_HUB_ENTRIES: AdminRouteEntry[] = (
  Object.keys(DOMAIN_HUB_PATHS) as AdminDomain[]
).map((d) => ({
  path: DOMAIN_HUB_PATHS[d],
  domain: d,
  pageClass: "PRIMARY_DOMAIN_ENTRY",
  nav: "primary",
  breadcrumb: [DOMAIN_LABELS[d]],
  owner: "platform-admin",
  notes: "Canonical hub — composed in Phase 3-5.",
}));

// ─── Existing 136 admin routes mapped to the 12-domain IA ─────────
//
// Mapping rationale (group → canonical domain):
//   /admin/dashboard, /admin/generated-truth, /admin/truth-indices,
//   /admin/runtime-tier-governance, /admin/intelligence-efficiency
//   /admin/system-intelligence, /admin/ecosystem/command,
//   /admin/os-platform, /admin/communication-hub        → overview
//
//   /admin/founder/incidents                            → alerts
//
//   /admin/ai-team/approvals, /admin/ai-team/approval-queue,
//   /admin/advisor-board/actions                        → approvals
//
//   /admin/users, /admin/team, /admin/system            → environments
//
//   /admin/ai-team/*, /admin/ai-gateway/*, /admin/advisor-board/*,
//   /admin/cai/*, /admin/intelligence/*, /admin/strategic/*,
//   /admin/ai-tokens, /admin/ai-governance,
//   /admin/graph-intelligence, /admin/simulation-center,
//   /admin/mc/ai-control, /admin/mc/costs               → ai-runtime
//
//   /admin/cloud-backbone, /admin/mc/sync-cloud         → integrations
//
//   /admin/security/*, /admin/mc/trust-security,
//   /admin/mc/policies, /admin/mc/authority-matrix,
//   /admin/mc/control-receipts, /admin/mc/state-authority,
//   /admin/mc/emergency                                 → trust-security
//
//   /admin/fleet-health, /admin/backend-topology,
//   /admin/mc/system-health, /admin/mc/storage,
//   /admin/mc/devices, /admin/mc/jobs,
//   /admin/mc/event-routing, /admin/mc/failure-recovery,
//   /admin/mc/incidents, /admin/mc/workspaces,
//   /admin/mc/platform-adaptation                       → health
//
//   /admin/release-engineering, /admin/mc/releases,
//   /admin/mobile-parity                                → releases
//
//   /admin/mc/architecture, /admin/mc/architecture-tests,
//   /admin/mc/feature-ownership, /admin/mc/command-routing,
//   /admin/mc/approval-flow, /admin/engineering/*       → verification
//
//   /admin/mc/policies, /admin/founder/programs,
//   /admin/mc/knowledge, /admin/founder/knowledge       → config
//
//   /admin/mc/support, /admin/mc/logs,
//   /admin/founder/runbooks, /admin/founder/cicd,
//   /admin/founder/cost, /admin/founder/dashboard,
//   /admin/founder/oversight, /admin/founder/security,
//   /admin/founder/sync-ops, /admin/founder/tasks,
//   /admin/founder/command                              → support
//

const LEGACY_ROUTES: AdminRouteEntry[] = [
  // ── Overview cluster ──────────────────────────────────────────
  { path: "/admin/dashboard", domain: "overview", pageClass: "DUPLICATE_MERGE_REQUIRED", nav: "deprecated", component: "AdminDashboard", breadcrumb: ["Overview", "Dashboard"], replacedBy: "/admin/overview", workflows: ["daily"], notes: "Legacy executive dashboard — merged into OverviewHome." },
  { path: "/admin/generated-truth", domain: "overview", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "GeneratedTruthDashboard", breadcrumb: ["Overview", "Generated Truth"], permission: "audit.view", workflows: ["daily", "weekly"] },
  { path: "/admin/truth-indices", domain: "overview", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "TruthIndexDashboard", breadcrumb: ["Overview", "Truth Indices"], permission: "audit.view", workflows: ["weekly"] },
  { path: "/admin/runtime-tier-governance", domain: "overview", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "RuntimeTierGovernanceDashboard", breadcrumb: ["Overview", "Runtime Tier"], permission: "audit.view" },
  { path: "/admin/intelligence-efficiency", domain: "overview", pageClass: "DEPRECATE_WITH_REDIRECT", nav: "deprecated", breadcrumb: ["Overview"], replacedBy: "/admin/ai-runtime/efficiency", notes: "Already redirects to /admin/intelligence/efficiency in AdminRoutes." },
  { path: "/admin/system-intelligence", domain: "overview", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "SYS01SystemIntelligence", breadcrumb: ["Overview", "System Intelligence"] },
  { path: "/admin/ecosystem/command", domain: "overview", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "ECO01EcosystemCommand", breadcrumb: ["Overview", "Ecosystem"] },
  { path: "/admin/os-platform", domain: "overview", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "OS01PlatformCommandCenter", breadcrumb: ["Overview", "OS Platform"] },
  { path: "/admin/communication-hub", domain: "overview", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", breadcrumb: ["Overview", "Communications"] },

  // ── Alerts cluster ────────────────────────────────────────────
  { path: "/admin/founder/incidents", domain: "alerts", pageClass: "WORKFLOW_TOOL", nav: "subnav", breadcrumb: ["Alerts", "Incidents"], workflows: ["daily"] },

  // ── Approvals cluster ─────────────────────────────────────────
  { path: "/admin/ai-team/approvals", domain: "approvals", pageClass: "WORKFLOW_TOOL", nav: "subnav", component: "AIT07ApprovalQueue", breadcrumb: ["Approvals", "AI Team"], permission: "support.grant", workflows: ["daily"] },
  { path: "/admin/ai-team/approval-queue", domain: "approvals", pageClass: "DUPLICATE_MERGE_REQUIRED", nav: "deprecated", component: "HQApprovalQueue", breadcrumb: ["Approvals", "HQ Queue"], permission: "support.grant", replacedBy: "/admin/approvals", notes: "Same concept as ai-team/approvals — merge into Approvals hub." },
  { path: "/admin/advisor-board/actions", domain: "approvals", pageClass: "WORKFLOW_TOOL", nav: "subnav", breadcrumb: ["Approvals", "Advisor Actions"], workflows: ["daily"] },

  // ── Environments cluster ──────────────────────────────────────
  { path: "/admin/users", domain: "environments", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "UserManagement", breadcrumb: ["Environments", "Users"], permission: "users.view", workflows: ["support"] },
  { path: "/admin/team", domain: "environments", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "TeamManagement", breadcrumb: ["Environments", "Teams"], permission: "users.view" },
  { path: "/admin/system", domain: "environments", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "SystemManagement", breadcrumb: ["Environments", "System"], permission: "maintenance.view" },
  { path: "/admin/mc/devices", domain: "environments", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "MCDevicesCenter", breadcrumb: ["Environments", "Devices"], workflows: ["support"] },
  { path: "/admin/mc/users", domain: "environments", pageClass: "DUPLICATE_MERGE_REQUIRED", nav: "deprecated", component: "MCUsersCenter", breadcrumb: ["Environments"], replacedBy: "/admin/environments/users", notes: "Duplicates /admin/users — collapse." },

  // ── AI Runtime cluster ────────────────────────────────────────
  { path: "/admin/ai-team/overview", domain: "ai-runtime", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "AIT01TeamOverview", breadcrumb: ["AI Runtime", "Team"], permission: "flags.view", workflows: ["weekly"] },
  { path: "/admin/ai-team/roles", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "AIT02RoleRegistry", breadcrumb: ["AI Runtime", "Roles"], permission: "flags.view" },
  { path: "/admin/ai-team/invoke", domain: "ai-runtime", pageClass: "WORKFLOW_TOOL", nav: "explorer", component: "AIT03TaskInvocation", breadcrumb: ["AI Runtime", "Invoke"], permission: "flags.rollout" },
  { path: "/admin/ai-team/activity", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "AIT04ActivityFeed", breadcrumb: ["AI Runtime", "Activity"], permission: "audit.view" },
  { path: "/admin/ai-team/cost", domain: "ai-runtime", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "AIT05CostEfficiency", breadcrumb: ["AI Runtime", "Cost"], permission: "flags.view", workflows: ["weekly"] },
  { path: "/admin/ai-team/recommendations", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "AIT06Recommendations", breadcrumb: ["AI Runtime", "Recommendations"], permission: "flags.view" },
  { path: "/admin/ai-team/launch-truth", domain: "ai-runtime", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "AIT08LaunchTruth", breadcrumb: ["AI Runtime", "Launch Truth"], permission: "audit.view", workflows: ["release"] },
  { path: "/admin/ai-team/setup-checklist", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "AITSetupChecklist", breadcrumb: ["AI Runtime", "Setup"], permission: "flags.view" },
  { path: "/admin/ai-tokens", domain: "ai-runtime", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "AITokenDashboard", breadcrumb: ["AI Runtime", "Tokens"], permission: "flags.view" },
  { path: "/admin/ai-governance", domain: "ai-runtime", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "AIGovernancePage", breadcrumb: ["AI Runtime", "Governance"] },
  { path: "/admin/ai-gateway/providers", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "AIG01ProviderRegistry", breadcrumb: ["AI Runtime", "Gateway", "Providers"] },
  { path: "/admin/ai-gateway/models", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "AIG02ModelRegistry", breadcrumb: ["AI Runtime", "Gateway", "Models"] },
  { path: "/admin/ai-gateway/routing", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "AIG03RoutingMatrix", breadcrumb: ["AI Runtime", "Gateway", "Routing"] },
  { path: "/admin/ai-gateway/budget", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "AIG04BudgetCenter", breadcrumb: ["AI Runtime", "Gateway", "Budget"], workflows: ["weekly"] },
  { path: "/admin/ai-gateway/receipts", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "AIG05ReceiptsExplorer", breadcrumb: ["AI Runtime", "Gateway", "Receipts"] },
  { path: "/admin/ai-gateway/honesty", domain: "ai-runtime", pageClass: "DUPLICATE_MERGE_REQUIRED", nav: "deprecated", component: "AIG06LaunchTruth", breadcrumb: ["AI Runtime", "Gateway"], replacedBy: "/admin/ai-gateway/launch-truth", notes: "AIG06 and AIG07 are launch-truth twins — collapse." },
  { path: "/admin/ai-gateway/launch-truth", domain: "ai-runtime", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "AIG07LaunchTruth", breadcrumb: ["AI Runtime", "Gateway", "Launch Truth"], workflows: ["release"] },
  { path: "/admin/ai-gateway/diagnostics", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "AIG08DegradedDiagnostics", breadcrumb: ["AI Runtime", "Gateway", "Diagnostics"] },
  { path: "/admin/ai-gateway/verification", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "AIG09RuntimeVerification", breadcrumb: ["AI Runtime", "Gateway", "Verification"] },
  { path: "/admin/advisor-board/catalog", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "AdvisorBoardCatalog", breadcrumb: ["AI Runtime", "Advisors", "Catalog"] },
  { path: "/admin/advisor-board/recommendations", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "AdvisorRecommendationMonitor", breadcrumb: ["AI Runtime", "Advisors", "Recommendations"] },
  { path: "/admin/advisor-board/memory", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "AdvisorMemoryInspector", breadcrumb: ["AI Runtime", "Advisors", "Memory"] },
  { path: "/admin/advisor-board/profitability", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "AdvisorProfitabilityDashboard", breadcrumb: ["AI Runtime", "Advisors", "Profit"] },
  { path: "/admin/advisor-board/autonomy", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "AdvisorAutonomyPolicyEditor", breadcrumb: ["AI Runtime", "Advisors", "Autonomy"] },
  { path: "/admin/cai/graph", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "CAI01PersonalGraphExplorer", breadcrumb: ["AI Runtime", "CAI", "Graph"] },
  { path: "/admin/cai/intent", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "CAI02IntentTraceBoard", breadcrumb: ["AI Runtime", "CAI", "Intent"] },
  { path: "/admin/cai/attention", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "CAI03AttentionCenter", breadcrumb: ["AI Runtime", "CAI", "Attention"] },
  { path: "/admin/cai/continuity", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "CAI04ContinuityCenter", breadcrumb: ["AI Runtime", "CAI", "Continuity"] },
  { path: "/admin/cai/trust-actions", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "CAI05TrustActionsBoard", breadcrumb: ["AI Runtime", "CAI", "Trust"] },
  { path: "/admin/cai/chief-of-staff", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "CAI06ChiefOfStaffCenter", breadcrumb: ["AI Runtime", "CAI", "Chief of Staff"] },
  { path: "/admin/cai/timing", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "CAI07TimingStudio", breadcrumb: ["AI Runtime", "CAI", "Timing"] },
  { path: "/admin/cai/relationships", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "CAI08RelationshipCenter", breadcrumb: ["AI Runtime", "CAI", "Relationships"] },
  { path: "/admin/cai/digest", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "CAI09DigestConsole", breadcrumb: ["AI Runtime", "CAI", "Digest"] },
  { path: "/admin/cai/modes", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "CAI10ModesCenter", breadcrumb: ["AI Runtime", "CAI", "Modes"] },
  { path: "/admin/cai/interface", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "CAI11InterfaceProfiler", breadcrumb: ["AI Runtime", "CAI", "Interface"] },
  { path: "/admin/cai/opportunities", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "CAI12OpportunityBoard", breadcrumb: ["AI Runtime", "CAI", "Opportunities"] },
  { path: "/admin/cai/memory", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "CAI13MemoryGovernance", breadcrumb: ["AI Runtime", "CAI", "Memory"] },
  { path: "/admin/cai/boundaries", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "CAI14BoundaryControl", breadcrumb: ["AI Runtime", "CAI", "Boundaries"] },
  { path: "/admin/cai/signature", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "CAI15SignatureStudio", breadcrumb: ["AI Runtime", "CAI", "Signature"] },
  { path: "/admin/intelligence/reuse", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "IntelligenceReuseOverview", breadcrumb: ["AI Runtime", "Intelligence", "Reuse"] },
  { path: "/admin/intelligence/assets", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "IntelligenceAssetLibrary", breadcrumb: ["AI Runtime", "Intelligence", "Assets"] },
  { path: "/admin/intelligence/differential", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "DifferentialReasoningExplorer", breadcrumb: ["AI Runtime", "Intelligence", "Differential"] },
  { path: "/admin/intelligence/packets", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "IntelligencePacketInspector", breadcrumb: ["AI Runtime", "Intelligence", "Packets"] },
  { path: "/admin/intelligence/efficiency", domain: "ai-runtime", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "AIEfficiencyScoreboard", breadcrumb: ["AI Runtime", "Intelligence", "Efficiency"], workflows: ["weekly"] },
  { path: "/admin/intelligence/outcomes", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "OutcomeEconomicsBoard", breadcrumb: ["AI Runtime", "Intelligence", "Outcomes"] },
  { path: "/admin/intelligence/escalation", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "EscalationControlCenter", breadcrumb: ["AI Runtime", "Intelligence", "Escalation"] },
  { path: "/admin/intelligence/patterns", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "PatternLearningCenter", breadcrumb: ["AI Runtime", "Intelligence", "Patterns"] },
  { path: "/admin/intelligence/prompts", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "ZeroWastePromptView", breadcrumb: ["AI Runtime", "Intelligence", "Prompts"] },
  { path: "/admin/intelligence/digests", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "SmartDigestCenter", breadcrumb: ["AI Runtime", "Intelligence", "Digests"] },
  { path: "/admin/intelligence/cross-tenant", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "CrossTenantGovernance", breadcrumb: ["AI Runtime", "Intelligence", "Cross-Tenant"] },
  { path: "/admin/intelligence/layer", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "IntelligenceLayerAdmin", breadcrumb: ["AI Runtime", "Intelligence", "Layer"] },
  { path: "/admin/strategic/capital", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "IntelligenceCapitalDashboard", breadcrumb: ["AI Runtime", "Strategic", "Capital"] },
  { path: "/admin/strategic/cost-confidence", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "CostToConfidenceDashboard", breadcrumb: ["AI Runtime", "Strategic", "Cost/Confidence"] },
  { path: "/admin/strategic/quality-floor", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "QualityFloorDashboard", breadcrumb: ["AI Runtime", "Strategic", "Quality"] },
  { path: "/admin/strategic/insurance", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "IntelligenceInsuranceDashboard", breadcrumb: ["AI Runtime", "Strategic", "Insurance"] },
  { path: "/admin/strategic/market", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "IntelligenceMarketDashboard", breadcrumb: ["AI Runtime", "Strategic", "Market"] },
  { path: "/admin/strategic/time-to-truth", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "TimeToTruthDashboard", breadcrumb: ["AI Runtime", "Strategic", "TTT"] },
  { path: "/admin/strategic/reasoning-replay", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "ReasoningReplayDashboard", breadcrumb: ["AI Runtime", "Strategic", "Replay"] },
  { path: "/admin/strategic/decay", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "DecayMonitorDashboard", breadcrumb: ["AI Runtime", "Strategic", "Decay"] },
  { path: "/admin/strategic/portfolio", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "PortfolioAllocationDashboard", breadcrumb: ["AI Runtime", "Strategic", "Portfolio"] },
  { path: "/admin/strategic/benchmark", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "BenchmarkLabDashboard", breadcrumb: ["AI Runtime", "Strategic", "Benchmark"] },
  { path: "/admin/strategic/value-risk", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "ValueRiskDashboard", breadcrumb: ["AI Runtime", "Strategic", "Value/Risk"] },
  { path: "/admin/strategic/operator-taste", domain: "ai-runtime", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "OperatorTasteDashboard", breadcrumb: ["AI Runtime", "Strategic", "Taste"] },
  { path: "/admin/graph-intelligence", domain: "ai-runtime", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", breadcrumb: ["AI Runtime", "Graph"] },
  { path: "/admin/simulation-center", domain: "ai-runtime", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", breadcrumb: ["AI Runtime", "Simulation"] },
  { path: "/admin/mc/ai-control", domain: "ai-runtime", pageClass: "DUPLICATE_MERGE_REQUIRED", nav: "deprecated", component: "MCAIControl", breadcrumb: ["AI Runtime"], replacedBy: "/admin/ai-runtime", notes: "MC AI Control duplicates AI Runtime hub." },
  { path: "/admin/mc/costs", domain: "ai-runtime", pageClass: "DUPLICATE_MERGE_REQUIRED", nav: "deprecated", component: "MCCostsAIBudgets", breadcrumb: ["AI Runtime", "Costs"], replacedBy: "/admin/ai-runtime/costs", notes: "Same as ai-team/cost." },

  // ── Integrations cluster ─────────────────────────────────────
  { path: "/admin/cloud-backbone", domain: "integrations", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "CloudBackboneAdmin", breadcrumb: ["Integrations", "Cloud Backbone"] },
  { path: "/admin/mc/sync-cloud", domain: "integrations", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "MCSyncCloud", breadcrumb: ["Integrations", "Sync"] },

  // ── Trust & Security cluster ─────────────────────────────────
  { path: "/admin/security/sessions", domain: "trust-security", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "SEC01SessionSecrets", breadcrumb: ["Trust & Security", "Sessions"] },
  { path: "/admin/security/foundation", domain: "trust-security", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "SEC02SecurityFoundation", breadcrumb: ["Trust & Security", "Foundation"] },
  { path: "/admin/security/command-center", domain: "trust-security", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "SecurityCommandCenter", breadcrumb: ["Trust & Security", "Command"], workflows: ["trust-safety"] },
  { path: "/admin/mc/trust-security", domain: "trust-security", pageClass: "DUPLICATE_MERGE_REQUIRED", nav: "deprecated", component: "MCTrustSecurity", breadcrumb: ["Trust & Security"], replacedBy: "/admin/trust-security" },
  { path: "/admin/mc/policies", domain: "trust-security", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "MCPoliciesFlags", breadcrumb: ["Trust & Security", "Policies"] },
  { path: "/admin/mc/authority-matrix", domain: "trust-security", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "MCAuthorityMatrix", breadcrumb: ["Trust & Security", "Authority"] },
  { path: "/admin/mc/control-receipts", domain: "trust-security", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "MCControlReceipts", breadcrumb: ["Trust & Security", "Receipts"] },
  { path: "/admin/mc/state-authority", domain: "trust-security", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "MCStateAuthority", breadcrumb: ["Trust & Security", "State"] },
  { path: "/admin/mc/emergency", domain: "trust-security", pageClass: "WORKFLOW_TOOL", nav: "subnav", component: "MCEmergencyAuthority", breadcrumb: ["Trust & Security", "Emergency"], workflows: ["trust-safety"] },

  // ── Health cluster ───────────────────────────────────────────
  { path: "/admin/fleet-health", domain: "health", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "FleetHealthPage", breadcrumb: ["Health", "Fleet"], permission: "maintenance.view", workflows: ["daily"] },
  { path: "/admin/backend-topology", domain: "health", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "BackendTopologyDashboard", breadcrumb: ["Health", "Backend"] },
  { path: "/admin/mc/system-health", domain: "health", pageClass: "DUPLICATE_MERGE_REQUIRED", nav: "deprecated", component: "MCSystemHealth", breadcrumb: ["Health"], replacedBy: "/admin/health", notes: "Duplicates Health hub." },
  { path: "/admin/mc/storage", domain: "health", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "MCStorageCenter", breadcrumb: ["Health", "Storage"] },
  { path: "/admin/mc/jobs", domain: "health", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "MCJobsMaintenance", breadcrumb: ["Health", "Jobs"] },
  { path: "/admin/mc/event-routing", domain: "health", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "MCEventRouting", breadcrumb: ["Health", "Events"] },
  { path: "/admin/mc/failure-recovery", domain: "health", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "MCFailureRecovery", breadcrumb: ["Health", "Recovery"] },
  { path: "/admin/mc/incidents", domain: "health", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "MCIncidents", breadcrumb: ["Health", "Incidents"], workflows: ["daily"] },
  { path: "/admin/mc/workspaces", domain: "health", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "MCWorkspacesContinuity", breadcrumb: ["Health", "Workspaces"] },
  { path: "/admin/mc/platform-adaptation", domain: "health", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "MCPlatformAdaptation", breadcrumb: ["Health", "Adaptation"] },

  // ── Releases cluster ─────────────────────────────────────────
  { path: "/admin/release-engineering", domain: "releases", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", breadcrumb: ["Releases", "Engineering"], workflows: ["release"] },
  { path: "/admin/mc/releases", domain: "releases", pageClass: "DUPLICATE_MERGE_REQUIRED", nav: "deprecated", component: "MCReleasesUpdates", breadcrumb: ["Releases"], replacedBy: "/admin/releases" },
  { path: "/admin/mobile-parity", domain: "releases", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", breadcrumb: ["Releases", "Mobile Parity"], workflows: ["release"] },

  // ── Verification cluster ─────────────────────────────────────
  { path: "/admin/mc/architecture", domain: "verification", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "MCArchitectureDashboard", breadcrumb: ["Verification", "Architecture"] },
  { path: "/admin/mc/architecture-tests", domain: "verification", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "MCArchitectureTests", breadcrumb: ["Verification", "Tests"] },
  { path: "/admin/mc/feature-ownership", domain: "verification", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "MCFeatureOwnership", breadcrumb: ["Verification", "Ownership"] },
  { path: "/admin/mc/command-routing", domain: "verification", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "MCCommandRouting", breadcrumb: ["Verification", "Routing"] },
  { path: "/admin/mc/approval-flow", domain: "verification", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "MCApprovalFlow", breadcrumb: ["Verification", "Approval Flow"] },
  { path: "/admin/engineering/builder-critic", domain: "verification", pageClass: "DETAIL_EXPLORER", nav: "explorer", breadcrumb: ["Verification", "Builder Critic"] },
  { path: "/admin/engineering/chaos", domain: "verification", pageClass: "WORKFLOW_TOOL", nav: "explorer", breadcrumb: ["Verification", "Chaos"] },
  { path: "/admin/engineering/optimization", domain: "verification", pageClass: "DETAIL_EXPLORER", nav: "explorer", breadcrumb: ["Verification", "Optimization"] },
  { path: "/admin/engineering/rollback", domain: "verification", pageClass: "WORKFLOW_TOOL", nav: "explorer", breadcrumb: ["Verification", "Rollback"] },
  { path: "/admin/engineering/simulation", domain: "verification", pageClass: "DETAIL_EXPLORER", nav: "explorer", breadcrumb: ["Verification", "Simulation"] },
  { path: "/admin/engineering/standards", domain: "verification", pageClass: "DETAIL_EXPLORER", nav: "explorer", breadcrumb: ["Verification", "Standards"] },
  { path: "/admin/engineering/validation", domain: "verification", pageClass: "DETAIL_EXPLORER", nav: "explorer", breadcrumb: ["Verification", "Validation"] },
  { path: "/admin/engineering/version-intel", domain: "verification", pageClass: "DETAIL_EXPLORER", nav: "explorer", breadcrumb: ["Verification", "Version"] },

  // ── Config cluster ───────────────────────────────────────────
  { path: "/admin/mc/knowledge", domain: "config", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "MCKnowledgeBase", breadcrumb: ["Config", "Knowledge"] },
  { path: "/admin/founder/programs", domain: "config", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", breadcrumb: ["Config", "Programs"] },
  { path: "/admin/founder/knowledge", domain: "config", pageClass: "DUPLICATE_MERGE_REQUIRED", nav: "deprecated", breadcrumb: ["Config"], replacedBy: "/admin/config/knowledge" },

  // ── Support cluster ──────────────────────────────────────────
  { path: "/admin/mc/support", domain: "support", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "MCSupport", breadcrumb: ["Support", "Cases"], workflows: ["support"] },
  { path: "/admin/mc/logs", domain: "support", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "MCLogsAudit", breadcrumb: ["Support", "Logs"], workflows: ["support"] },
  // Canonical runbook surface (Phase 28 — wired into 12-domain IA)
  { path: "/admin/support/runbooks", domain: "support", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "FCC04RunbookCenter", breadcrumb: ["Support", "Runbooks"], permission: "maintenance.view", workflows: ["support"] },
  { path: "/admin/support/runbooks/:id", domain: "support", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "AdminRunbookViewerPage", breadcrumb: ["Support", "Runbooks", "Detail"], permission: "maintenance.view", workflows: ["support"] },
  { path: "/admin/founder/runbooks", domain: "support", pageClass: "DEPRECATE_WITH_REDIRECT", nav: "deprecated", breadcrumb: ["Support", "Runbooks"], replacedBy: "/admin/support/runbooks" },
  { path: "/admin/founder/cicd", domain: "support", pageClass: "DETAIL_EXPLORER", nav: "explorer", breadcrumb: ["Support", "CI/CD"] },
  { path: "/admin/founder/cost", domain: "support", pageClass: "DETAIL_EXPLORER", nav: "explorer", breadcrumb: ["Support", "Cost"] },
  { path: "/admin/founder/dashboard", domain: "support", pageClass: "DUPLICATE_MERGE_REQUIRED", nav: "deprecated", breadcrumb: ["Support"], replacedBy: "/admin/support" },
  { path: "/admin/founder/oversight", domain: "support", pageClass: "DETAIL_EXPLORER", nav: "explorer", breadcrumb: ["Support", "Oversight"] },
  { path: "/admin/founder/security", domain: "support", pageClass: "DETAIL_EXPLORER", nav: "explorer", breadcrumb: ["Support", "Security"] },
  { path: "/admin/founder/sync-ops", domain: "support", pageClass: "DETAIL_EXPLORER", nav: "explorer", breadcrumb: ["Support", "Sync Ops"] },
  { path: "/admin/founder/tasks", domain: "support", pageClass: "DETAIL_EXPLORER", nav: "explorer", breadcrumb: ["Support", "Tasks"] },
  { path: "/admin/founder/command", domain: "support", pageClass: "WORKFLOW_TOOL", nav: "subnav", breadcrumb: ["Support", "Command"], workflows: ["support"] },

  // ── Phase 25: Orphan routes registered ─────────────────────────
  { path: "/admin/meta/reality", domain: "verification", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "META04ProductReality", breadcrumb: ["Verification", "Reality"], permission: "audit.view", workflows: ["weekly"] },
  { path: "/admin/meta/completeness", domain: "verification", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "META05CompletenessMatrix", breadcrumb: ["Verification", "Completeness"], permission: "audit.view", workflows: ["weekly"] },
  { path: "/admin/meta-arch", domain: "verification", pageClass: "DEPRECATE_WITH_REDIRECT", nav: "deprecated", breadcrumb: ["Verification"], replacedBy: "/admin/meta-arch/atlas" },
  { path: "/admin/meta-arch/atlas", domain: "verification", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "META01ArchitectureAtlas", breadcrumb: ["Verification", "Atlas"], permission: "audit.view" },
  { path: "/admin/meta-arch/control-plane", domain: "verification", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "META02ControlPlaneCenter", breadcrumb: ["Verification", "Control Plane"], permission: "audit.view" },
  { path: "/admin/meta-arch/golden-paths", domain: "verification", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "META03GoldenPathHealth", breadcrumb: ["Verification", "Golden Paths"], permission: "audit.view", workflows: ["weekly"] },
  { path: "/admin/ci/umbrella", domain: "verification", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "CI01CIUmbrellaCenter", breadcrumb: ["Verification", "CI Umbrella"], permission: "audit.view", workflows: ["weekly", "release"] },
  { path: "/admin/db-truth-explorer", domain: "verification", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "DbTruthExplorer", breadcrumb: ["Verification", "DB Truth"], permission: "audit.view" },
  { path: "/admin/edge-functions/health", domain: "health", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "EFH01EdgeFunctionHealthCenter", breadcrumb: ["Health", "Edge Functions"], permission: "maintenance.view", workflows: ["daily"] },
  { path: "/admin/web/deployability", domain: "releases", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "WEB01DeployabilityCenter", breadcrumb: ["Releases", "Web Deployability"], permission: "audit.view", workflows: ["release"] },
  { path: "/admin/desktop/deployability", domain: "releases", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "DSK01DeployabilityCenter", breadcrumb: ["Releases", "Desktop Deployability"], permission: "audit.view", workflows: ["release"] },
  { path: "/admin/appliance/deployability", domain: "releases", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "APP01ApplianceDeployabilityCenter", breadcrumb: ["Releases", "Appliance Deployability"], permission: "audit.view", workflows: ["release"] },
  { path: "/admin/backend-api/deployability", domain: "releases", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "BAP01BackendApiDeployabilityCenter", breadcrumb: ["Releases", "Backend API"], permission: "audit.view", workflows: ["release"] },
  { path: "/admin/mobile/store-readiness", domain: "releases", pageClass: "DETAIL_EXPLORER", nav: "explorer", component: "MOB01StoreReadinessCenter", breadcrumb: ["Releases", "Mobile Store"], permission: "audit.view", workflows: ["release"] },

  // ── Phase 25: Workflow step routes registered ──────────────────
  { path: "/admin/health/incidents", domain: "health", pageClass: "WORKFLOW_TOOL", nav: "subnav", component: "MCIncidents", breadcrumb: ["Health", "Incidents"], permission: "maintenance.view", workflows: ["daily"] },
  { path: "/admin/releases/launch-readiness", domain: "releases", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "LaunchReadinessBoard", breadcrumb: ["Releases", "Launch Readiness"], permission: "audit.view", workflows: ["daily", "release"] },
  { path: "/admin/overview/generated-truth", domain: "overview", pageClass: "DEPRECATE_WITH_REDIRECT", nav: "deprecated", breadcrumb: ["Overview"], replacedBy: "/admin/generated-truth", workflows: ["weekly"] },
  { path: "/admin/ai-runtime/intelligence/efficiency", domain: "ai-runtime", pageClass: "DEPRECATE_WITH_REDIRECT", nav: "deprecated", breadcrumb: ["AI Runtime"], replacedBy: "/admin/intelligence/efficiency", workflows: ["weekly"] },
  { path: "/admin/verification/launch-honesty", domain: "verification", pageClass: "SECONDARY_SUBVIEW", nav: "subnav", component: "LaunchHonestyBoard", breadcrumb: ["Verification", "Launch Honesty"], permission: "audit.view", workflows: ["weekly"] },
  { path: "/admin/ai-runtime/costs", domain: "ai-runtime", pageClass: "DEPRECATE_WITH_REDIRECT", nav: "deprecated", breadcrumb: ["AI Runtime"], replacedBy: "/admin/ai-team/cost", workflows: ["weekly"] },
  { path: "/admin/environments/users", domain: "environments", pageClass: "DEPRECATE_WITH_REDIRECT", nav: "deprecated", breadcrumb: ["Environments"], replacedBy: "/admin/users", workflows: ["support"] },
  { path: "/admin/environments/devices", domain: "environments", pageClass: "DEPRECATE_WITH_REDIRECT", nav: "deprecated", breadcrumb: ["Environments"], replacedBy: "/admin/mc/devices", workflows: ["support"] },
  { path: "/admin/environments/integration-state", domain: "environments", pageClass: "DETAIL_EXPLORER", nav: "explorer", breadcrumb: ["Environments", "Integration State"], permission: "users.view", workflows: ["support"] },
  { path: "/admin/environments/workflow-state", domain: "environments", pageClass: "DETAIL_EXPLORER", nav: "explorer", breadcrumb: ["Environments", "Workflow State"], permission: "users.view", workflows: ["support"] },
  { path: "/admin/support/cases", domain: "support", pageClass: "DEPRECATE_WITH_REDIRECT", nav: "deprecated", breadcrumb: ["Support"], replacedBy: "/admin/mc/support", workflows: ["support"] },
  { path: "/admin/support/replay", domain: "support", pageClass: "DETAIL_EXPLORER", nav: "explorer", breadcrumb: ["Support", "Replay"], permission: "support.view", workflows: ["support"] },
  { path: "/admin/support/recovery", domain: "support", pageClass: "WORKFLOW_TOOL", nav: "subnav", component: "MCFailureRecovery", breadcrumb: ["Support", "Recovery"], permission: "support.view", workflows: ["support"] },
  { path: "/admin/releases/mobile-parity", domain: "releases", pageClass: "DEPRECATE_WITH_REDIRECT", nav: "deprecated", breadcrumb: ["Releases"], replacedBy: "/admin/mobile-parity", workflows: ["release"] },
  { path: "/admin/releases/deployment-rings", domain: "releases", pageClass: "WORKFLOW_TOOL", nav: "subnav", component: "AdminDeploymentRings", breadcrumb: ["Releases", "Deployment Rings"], permission: "flags.rollout", workflows: ["release"] },
  { path: "/admin/releases/rollback", domain: "releases", pageClass: "DEPRECATE_WITH_REDIRECT", nav: "deprecated", breadcrumb: ["Releases"], replacedBy: "/admin/engineering/rollback", workflows: ["release"] },
  { path: "/admin/trust-security/policies", domain: "trust-security", pageClass: "DEPRECATE_WITH_REDIRECT", nav: "deprecated", breadcrumb: ["Trust & Security"], replacedBy: "/admin/mc/policies", workflows: ["trust-safety"] },
  { path: "/admin/trust-security/proofs", domain: "trust-security", pageClass: "DEPRECATE_WITH_REDIRECT", nav: "deprecated", breadcrumb: ["Trust & Security"], replacedBy: "/admin/mc/control-receipts", workflows: ["trust-safety"] },
  { path: "/admin/trust-security/permissions", domain: "trust-security", pageClass: "DEPRECATE_WITH_REDIRECT", nav: "deprecated", breadcrumb: ["Trust & Security"], replacedBy: "/admin/mc/authority-matrix", workflows: ["trust-safety"] },
  { path: "/admin/trust-security/sensitive-actions", domain: "trust-security", pageClass: "DEPRECATE_WITH_REDIRECT", nav: "deprecated", breadcrumb: ["Trust & Security"], replacedBy: "/admin/mc/state-authority", workflows: ["trust-safety"] },
  { path: "/admin/trust-security/audit", domain: "trust-security", pageClass: "WORKFLOW_TOOL", nav: "subnav", component: "AuditComplianceWorkspace", breadcrumb: ["Trust & Security", "Audit"], permission: "audit.view", workflows: ["trust-safety"] },
];

export const ADMIN_ROUTE_REGISTRY: AdminRouteEntry[] = [
  ...DOMAIN_HUB_ENTRIES,
  ...LEGACY_ROUTES,
];

// ─── Lookup helpers ──────────────────────────────────────────────

export function getRouteEntry(path: string): AdminRouteEntry | undefined {
  return ADMIN_ROUTE_REGISTRY.find((r) => r.path === path);
}

export function getRoutesForDomain(domain: AdminDomain): AdminRouteEntry[] {
  return ADMIN_ROUTE_REGISTRY.filter((r) => r.domain === domain);
}

export function getPrimaryNavEntries(): AdminRouteEntry[] {
  return ADMIN_ROUTE_REGISTRY.filter((r) => r.nav === "primary").sort(
    (a, b) => ADMIN_DOMAINS.indexOf(a.domain) - ADMIN_DOMAINS.indexOf(b.domain),
  );
}

export function getSubnavForDomain(domain: AdminDomain): AdminRouteEntry[] {
  return ADMIN_ROUTE_REGISTRY.filter((r) => r.domain === domain && r.nav === "subnav");
}

export function getDeprecatedAliases(): Array<{ from: string; to: string }> {
  return ADMIN_ROUTE_REGISTRY
    .filter((r) => r.pageClass === "DEPRECATE_WITH_REDIRECT" && r.replacedBy)
    .map((r) => ({ from: r.path, to: r.replacedBy! }));
}

export function getMergeTargets(): Array<{ from: string; to: string; notes?: string }> {
  return ADMIN_ROUTE_REGISTRY
    .filter((r) => r.pageClass === "DUPLICATE_MERGE_REQUIRED" && r.replacedBy)
    .map((r) => ({ from: r.path, to: r.replacedBy!, notes: r.notes }));
}

export function validateRegistry(): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  const seen = new Set<string>();
  for (const r of ADMIN_ROUTE_REGISTRY) {
    if (seen.has(r.path)) errors.push(`Duplicate path: ${r.path}`);
    seen.add(r.path);
    if (!ADMIN_DOMAINS.includes(r.domain)) errors.push(`Unknown domain on ${r.path}: ${r.domain}`);
    if ((r.pageClass === "DEPRECATE_WITH_REDIRECT" || r.pageClass === "DUPLICATE_MERGE_REQUIRED") && !r.replacedBy) {
      errors.push(`Deprecated/merged route ${r.path} missing replacedBy`);
    }
  }
  if (ADMIN_DOMAINS.length > MAX_ADMIN_DOMAINS) {
    errors.push(`Domain budget exceeded: ${ADMIN_DOMAINS.length} > ${MAX_ADMIN_DOMAINS}`);
  }
  return { ok: errors.length === 0, errors };
}
