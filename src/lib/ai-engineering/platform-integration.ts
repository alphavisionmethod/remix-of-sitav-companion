// ═══════════════════════════════════════════════════════════════
// SITA OS — AI Engineering: Platform Integration Layer
// Connects AI Engineering Board to all existing admin, infra,
// and telemetry systems. Cross-references for unified intelligence.
// ═══════════════════════════════════════════════════════════════

// ── Integration Point Registry ──────────────────────────────

export type IntegrationCategory =
  | "admin-control-plane"
  | "core-platform"
  | "infra-telemetry"
  | "release-deployment"
  | "docs-truth";

export interface IntegrationPoint {
  id: string;
  name: string;
  category: IntegrationCategory;
  route?: string;
  description: string;
  dataFlowIn: string[];   // what the AI board reads from this system
  dataFlowOut: string[];  // what the AI board writes/sends to this system
  healthCheck: () => IntegrationHealth;
}

export type IntegrationHealth = "healthy" | "degraded" | "disconnected" | "not-configured";

// ── Admin Control Plane Integrations ────────────────────────

const ADMIN_INTEGRATIONS: IntegrationPoint[] = [
  {
    id: "mission-control",
    name: "Mission Control",
    category: "admin-control-plane",
    route: "/admin/mission-control",
    description: "Primary operator command center — missions surface here",
    dataFlowIn: ["operator-goals", "priority-overrides", "manual-escalations"],
    dataFlowOut: ["mission-status", "engineering-synthesis", "confidence-updates"],
    healthCheck: () => "healthy",
  },
  {
    id: "policy-simulator",
    name: "Policy Simulator",
    category: "admin-control-plane",
    route: "/admin/policy-simulator",
    description: "Simulates policy changes before applying",
    dataFlowIn: ["policy-definitions", "boundary-rules", "autonomy-constraints"],
    dataFlowOut: ["policy-check-results", "boundary-violations", "simulation-requests"],
    healthCheck: () => "healthy",
  },
  {
    id: "incident-command",
    name: "Incident Command Center",
    category: "admin-control-plane",
    route: "/admin/incident-command",
    description: "Active incident management and triage",
    dataFlowIn: ["active-incidents", "incident-timelines", "severity-classifications"],
    dataFlowOut: ["diagnosis-results", "root-cause-hypotheses", "auto-heal-proposals", "incident-correlation"],
    healthCheck: () => "healthy",
  },
  {
    id: "workflow-replay",
    name: "Workflow Replay & Audit",
    category: "admin-control-plane",
    route: "/admin/workflow-replay",
    description: "Replay and audit workflow executions",
    dataFlowIn: ["workflow-traces", "execution-history", "failure-records"],
    dataFlowOut: ["replay-requests", "audit-annotations", "failure-pattern-tags"],
    healthCheck: () => "healthy",
  },
  {
    id: "intelligence-dashboard",
    name: "Intelligence Dashboard",
    category: "admin-control-plane",
    route: "/admin/intelligence",
    description: "AI intelligence overview and advisor metrics",
    dataFlowIn: ["advisor-performance", "token-usage", "cost-data"],
    dataFlowOut: ["agent-metrics", "learning-events", "confidence-calibration"],
    healthCheck: () => "healthy",
  },
  {
    id: "fleet-health",
    name: "Fleet Health Dashboard",
    category: "admin-control-plane",
    route: "/admin/fleet-health",
    description: "Service and connector health monitoring",
    dataFlowIn: ["service-health", "connector-status", "latency-metrics"],
    dataFlowOut: ["health-signals", "degradation-alerts", "auto-heal-triggers"],
    healthCheck: () => "healthy",
  },
  {
    id: "founder-council",
    name: "Founder Council Integration",
    category: "admin-control-plane",
    description: "Strategic decision signals from founder council",
    dataFlowIn: ["strategic-priorities", "risk-appetite", "growth-targets"],
    dataFlowOut: ["engineering-risk-summary", "capacity-utilization", "release-confidence"],
    healthCheck: () => "healthy",
  },
  {
    id: "command-palette",
    name: "Command Palette",
    category: "admin-control-plane",
    description: "Quick-access command interface for operators",
    dataFlowIn: ["operator-commands", "search-queries"],
    dataFlowOut: ["mission-shortcuts", "agent-actions", "quick-approvals"],
    healthCheck: () => "healthy",
  },
  {
    id: "advanced-filter",
    name: "Advanced Filter Builder",
    category: "admin-control-plane",
    description: "Complex filtering for missions, issues, and agents",
    dataFlowIn: ["filter-definitions"],
    dataFlowOut: ["filtered-datasets", "agent-filtered-views", "mission-filters"],
    healthCheck: () => "healthy",
  },
  {
    id: "help-system",
    name: "Help System",
    category: "admin-control-plane",
    description: "Contextual help and documentation links",
    dataFlowIn: ["help-context-signals"],
    dataFlowOut: ["contextual-help-entries", "docs-links", "onboarding-tips"],
    healthCheck: () => "healthy",
  },
  {
    id: "deployment-truth",
    name: "Deployment Truth Center",
    category: "admin-control-plane",
    route: "/admin/deployment-truth",
    description: "Ground truth for deployment state across environments",
    dataFlowIn: ["deployment-records", "version-manifests", "environment-state"],
    dataFlowOut: ["deployment-signals", "drift-detection", "rollback-triggers"],
    healthCheck: () => "healthy",
  },
  {
    id: "proof-coverage",
    name: "Proof Coverage Board",
    category: "admin-control-plane",
    route: "/admin/proof-matrix",
    description: "Evidence and proof coverage tracking",
    dataFlowIn: ["proof-coverage-map", "evidence-gaps"],
    dataFlowOut: ["evidence-bundles", "verification-receipts", "mission-proofs"],
    healthCheck: () => "healthy",
  },
  {
    id: "projection-control",
    name: "Projection Control Center",
    category: "admin-control-plane",
    route: "/admin/projection-control",
    description: "Read model and projection health monitoring",
    dataFlowIn: ["projection-health", "rebuild-status", "cache-hit-rates"],
    dataFlowOut: ["projection-fix-proposals", "cache-invalidation-signals"],
    healthCheck: () => "healthy",
  },
  {
    id: "validation-command",
    name: "Validation Command Center",
    category: "admin-control-plane",
    description: "Data validation and integrity checks",
    dataFlowIn: ["validation-results", "integrity-failures"],
    dataFlowOut: ["validation-fix-proposals", "data-repair-plans"],
    healthCheck: () => "healthy",
  },
  {
    id: "launch-blocker",
    name: "Launch Blocker Registry",
    category: "admin-control-plane",
    route: "/admin/launch-readiness",
    description: "Critical blockers preventing release",
    dataFlowIn: ["blocker-list", "blocker-severity", "unresolved-blockers"],
    dataFlowOut: ["blocker-fix-missions", "release-gate-status"],
    healthCheck: () => "healthy",
  },
  {
    id: "platform-truth",
    name: "Platform Truth Registry",
    category: "admin-control-plane",
    route: "/admin/platform-truth",
    description: "Canonical truth state for all platform entities",
    dataFlowIn: ["entity-truth-state", "schema-registry", "contract-health"],
    dataFlowOut: ["truth-drift-signals", "schema-fix-proposals"],
    healthCheck: () => "healthy",
  },
  {
    id: "approvals",
    name: "Approval Service",
    category: "admin-control-plane",
    description: "Approval queue for risky AI actions",
    dataFlowIn: ["approval-decisions", "rejection-reasons", "approval-sla"],
    dataFlowOut: ["approval-requests", "change-plan-reviews", "evidence-attachments"],
    healthCheck: () => "healthy",
  },
  {
    id: "receipts",
    name: "Receipt Service",
    category: "admin-control-plane",
    description: "Execution and proof receipts",
    dataFlowIn: ["receipt-archive"],
    dataFlowOut: ["execution-receipts", "heal-receipts", "rollback-receipts"],
    healthCheck: () => "healthy",
  },
  {
    id: "timeline",
    name: "Timeline Service",
    category: "admin-control-plane",
    description: "Chronological event tracking",
    dataFlowIn: ["event-timeline"],
    dataFlowOut: ["engineering-events", "mission-events", "heal-events", "learning-events"],
    healthCheck: () => "healthy",
  },
  {
    id: "trust-ribbon",
    name: "Trust Ribbon",
    category: "admin-control-plane",
    description: "Trust and confidence display system",
    dataFlowIn: ["trust-thresholds", "confidence-display-rules"],
    dataFlowOut: ["agent-confidence-scores", "mission-confidence", "release-confidence"],
    healthCheck: () => "healthy",
  },
  {
    id: "evidence-export",
    name: "Evidence Export Systems",
    category: "admin-control-plane",
    description: "Export evidence bundles for compliance and review",
    dataFlowIn: ["export-format-preferences"],
    dataFlowOut: ["json-bundles", "markdown-bundles", "pr-ready-evidence", "compliance-exports"],
    healthCheck: () => "healthy",
  },
];

// ── Core Platform Integrations ──────────────────────────────

const CORE_INTEGRATIONS: IntegrationPoint[] = [
  {
    id: "brain-core",
    name: "Brain Core",
    category: "core-platform",
    description: "Central AI reasoning and coordination engine",
    dataFlowIn: ["reasoning-context", "domain-models", "memory-state"],
    dataFlowOut: ["engineering-signals", "diagnosis-results", "learning-patterns"],
    healthCheck: () => "healthy",
  },
  {
    id: "policy-engine",
    name: "Policy Engine",
    category: "core-platform",
    description: "Runtime policy evaluation and enforcement",
    dataFlowIn: ["policy-definitions", "boundary-rules", "risk-tiers"],
    dataFlowOut: ["policy-check-requests", "boundary-violation-reports"],
    healthCheck: () => "healthy",
  },
  {
    id: "approval-service",
    name: "Approval Service",
    category: "core-platform",
    description: "Manages approval workflows for risky actions",
    dataFlowIn: ["approval-outcomes", "escalation-decisions"],
    dataFlowOut: ["approval-queue-items", "change-plan-reviews"],
    healthCheck: () => "healthy",
  },
  {
    id: "receipt-service",
    name: "Receipt Service",
    category: "core-platform",
    description: "Immutable proof receipts for all actions",
    dataFlowIn: ["receipt-queries"],
    dataFlowOut: ["execution-receipts", "heal-receipts", "rollback-proofs"],
    healthCheck: () => "healthy",
  },
  {
    id: "event-bus",
    name: "Event Bus",
    category: "core-platform",
    description: "Cross-system event distribution",
    dataFlowIn: ["all-domain-events"],
    dataFlowOut: ["engineering-events", "observation-signals", "learning-events"],
    healthCheck: () => "healthy",
  },
  {
    id: "workflow-engine",
    name: "Workflow Engine",
    category: "core-platform",
    description: "Orchestrates multi-step workflows",
    dataFlowIn: ["workflow-state", "run-history", "failure-logs"],
    dataFlowOut: ["workflow-fix-proposals", "retry-signals", "workflow-heal-actions"],
    healthCheck: () => "healthy",
  },
  {
    id: "memory-service",
    name: "Memory Service",
    category: "core-platform",
    description: "Persistent context and learning storage",
    dataFlowIn: ["memory-reads", "context-queries"],
    dataFlowOut: ["learned-patterns", "agent-memory-writes", "confidence-updates"],
    healthCheck: () => "healthy",
  },
  {
    id: "api-gateway",
    name: "API Gateway",
    category: "core-platform",
    description: "Central API routing and rate limiting",
    dataFlowIn: ["request-metrics", "rate-limit-events", "error-rates"],
    dataFlowOut: ["gateway-health-signals", "performance-alerts"],
    healthCheck: () => "healthy",
  },
  {
    id: "executor-service",
    name: "Executor Service",
    category: "core-platform",
    description: "Safe execution of approved change plans",
    dataFlowIn: ["execution-capacity", "execution-results"],
    dataFlowOut: ["execution-requests", "rollback-requests"],
    healthCheck: () => "healthy",
  },
  {
    id: "connector-control",
    name: "Connector Control Plane",
    category: "core-platform",
    description: "External connector lifecycle management",
    dataFlowIn: ["connector-health", "sync-status", "auth-status"],
    dataFlowOut: ["connector-pause-signals", "sync-retry-signals", "connector-heal-actions"],
    healthCheck: () => "healthy",
  },
  {
    id: "admin-service",
    name: "Admin Service",
    category: "core-platform",
    description: "Admin operations and configuration",
    dataFlowIn: ["admin-config", "feature-flags", "operator-preferences"],
    dataFlowOut: ["config-change-proposals", "flag-revert-signals"],
    healthCheck: () => "healthy",
  },
  {
    id: "admin-intelligence",
    name: "Admin Intelligence",
    category: "core-platform",
    description: "AI-powered admin insights and recommendations",
    dataFlowIn: ["admin-usage-patterns", "operator-friction-signals"],
    dataFlowOut: ["ux-improvement-proposals", "admin-optimization-plans"],
    healthCheck: () => "healthy",
  },
  {
    id: "projection-read-models",
    name: "Projection / Read Models",
    category: "core-platform",
    description: "Materialized views and projections",
    dataFlowIn: ["projection-health", "rebuild-logs", "stale-projection-signals"],
    dataFlowOut: ["projection-rebuild-requests", "cache-invalidation-signals"],
    healthCheck: () => "healthy",
  },
];

// ── Infra & Telemetry Integrations ──────────────────────────

const INFRA_INTEGRATIONS: IntegrationPoint[] = [
  {
    id: "ci-cd",
    name: "CI/CD Pipeline",
    category: "infra-telemetry",
    description: "Build, test, and deployment pipeline",
    dataFlowIn: ["build-status", "test-results", "deployment-events", "pipeline-failures"],
    dataFlowOut: ["build-signals", "test-failure-signals", "deployment-signals"],
    healthCheck: () => "healthy",
  },
  {
    id: "test-systems",
    name: "Test Systems",
    category: "infra-telemetry",
    description: "Unit, integration, e2e, and smoke tests",
    dataFlowIn: ["test-results", "coverage-reports", "flaky-test-list"],
    dataFlowOut: ["test-generation-proposals", "coverage-gap-signals", "regression-alerts"],
    healthCheck: () => "healthy",
  },
  {
    id: "traces",
    name: "Distributed Traces",
    category: "infra-telemetry",
    description: "Request tracing across services",
    dataFlowIn: ["trace-data", "span-anomalies", "latency-distributions"],
    dataFlowOut: ["trace-correlation-requests", "anomaly-signals"],
    healthCheck: () => "healthy",
  },
  {
    id: "logs",
    name: "Log Aggregation",
    category: "infra-telemetry",
    description: "Structured log collection and search",
    dataFlowIn: ["error-logs", "warning-logs", "application-logs"],
    dataFlowOut: ["log-pattern-signals", "error-cluster-signals"],
    healthCheck: () => "healthy",
  },
  {
    id: "metrics",
    name: "Metrics & Monitoring",
    category: "infra-telemetry",
    description: "System and application metrics",
    dataFlowIn: ["cpu-memory-metrics", "request-rates", "error-rates", "latency-percentiles"],
    dataFlowOut: ["anomaly-detection-signals", "threshold-alerts", "performance-signals"],
    healthCheck: () => "healthy",
  },
  {
    id: "canary-systems",
    name: "Canary Systems",
    category: "infra-telemetry",
    description: "Canary deployment and progressive rollout",
    dataFlowIn: ["canary-results", "rollout-progress", "canary-health"],
    dataFlowOut: ["canary-promotion-signals", "canary-rollback-signals"],
    healthCheck: () => "healthy",
  },
  {
    id: "deployment-records",
    name: "Deployment Records",
    category: "infra-telemetry",
    description: "Historical deployment log",
    dataFlowIn: ["deployment-history", "version-diffs", "rollback-history"],
    dataFlowOut: ["deployment-correlation-signals", "regression-signals"],
    healthCheck: () => "healthy",
  },
  {
    id: "feature-flags",
    name: "Feature Flags",
    category: "infra-telemetry",
    description: "Feature flag state and change history",
    dataFlowIn: ["flag-state", "flag-change-events", "flag-impact-metrics"],
    dataFlowOut: ["flag-revert-signals", "flag-impact-signals"],
    healthCheck: () => "healthy",
  },
  {
    id: "design-token-registry",
    name: "Design Token Registry",
    category: "infra-telemetry",
    description: "Canonical design token definitions",
    dataFlowIn: ["token-definitions", "token-usage-map"],
    dataFlowOut: ["token-drift-signals", "design-consistency-reports"],
    healthCheck: () => "healthy",
  },
  {
    id: "route-manifest",
    name: "Route Manifest Registry",
    category: "infra-telemetry",
    description: "All registered application routes",
    dataFlowIn: ["route-definitions", "route-health-status"],
    dataFlowOut: ["route-integrity-signals", "broken-route-alerts"],
    healthCheck: () => "healthy",
  },
  {
    id: "schema-contract-registry",
    name: "Schema / Contract Registry",
    category: "infra-telemetry",
    description: "API schemas and service contracts",
    dataFlowIn: ["schema-definitions", "contract-versions", "breaking-changes"],
    dataFlowOut: ["schema-drift-signals", "contract-violation-alerts"],
    healthCheck: () => "healthy",
  },
];

// ── Release & Deployment Integrations ───────────────────────

const RELEASE_INTEGRATIONS: IntegrationPoint[] = [
  {
    id: "release-system",
    name: "Release / Deployment Systems",
    category: "release-deployment",
    description: "Release orchestration and deployment management",
    dataFlowIn: ["release-state", "gate-results", "rollout-status"],
    dataFlowOut: ["go-no-go-signals", "release-confidence-score", "blocker-signals"],
    healthCheck: () => "healthy",
  },
  {
    id: "observability-stack",
    name: "Observability Stack",
    category: "release-deployment",
    description: "Unified observability across services",
    dataFlowIn: ["golden-signals", "slo-status", "alert-state"],
    dataFlowOut: ["observability-signals", "slo-risk-alerts"],
    healthCheck: () => "healthy",
  },
];

// ── Docs / Truth Integrations ───────────────────────────────

const DOCS_INTEGRATIONS: IntegrationPoint[] = [
  {
    id: "docs-truth",
    name: "Docs / Runtime Truth Systems",
    category: "docs-truth",
    description: "Documentation and runtime truth verification",
    dataFlowIn: ["doc-state", "runtime-truth-checks", "stale-doc-signals"],
    dataFlowOut: ["doc-update-proposals", "truth-verification-results", "runbook-refresh-signals"],
    healthCheck: () => "healthy",
  },
];

// ── Full Registry ───────────────────────────────────────────

export const ALL_INTEGRATIONS: IntegrationPoint[] = [
  ...ADMIN_INTEGRATIONS,
  ...CORE_INTEGRATIONS,
  ...INFRA_INTEGRATIONS,
  ...RELEASE_INTEGRATIONS,
  ...DOCS_INTEGRATIONS,
];

// ── Cross-Reference Engine ──────────────────────────────────

export interface CrossReference {
  sourceSystem: string;
  targetSystem: string;
  dataType: string;
  direction: "inbound" | "outbound" | "bidirectional";
  description: string;
}

export function buildCrossReferences(): CrossReference[] {
  const refs: CrossReference[] = [];

  for (const integration of ALL_INTEGRATIONS) {
    for (const dataIn of integration.dataFlowIn) {
      refs.push({
        sourceSystem: integration.id,
        targetSystem: "ai-engineering-board",
        dataType: dataIn,
        direction: "inbound",
        description: `${integration.name} → AI Board: ${dataIn}`,
      });
    }
    for (const dataOut of integration.dataFlowOut) {
      refs.push({
        sourceSystem: "ai-engineering-board",
        targetSystem: integration.id,
        dataType: dataOut,
        direction: "outbound",
        description: `AI Board → ${integration.name}: ${dataOut}`,
      });
    }
  }

  return refs;
}

// ── Integration Health Dashboard ────────────────────────────

export interface IntegrationHealthSummary {
  total: number;
  healthy: number;
  degraded: number;
  disconnected: number;
  notConfigured: number;
  byCategory: Record<IntegrationCategory, { total: number; healthy: number }>;
  crossReferenceCount: number;
  dataFlowsIn: number;
  dataFlowsOut: number;
}

export function getIntegrationHealthSummary(): IntegrationHealthSummary {
  const summary: IntegrationHealthSummary = {
    total: ALL_INTEGRATIONS.length,
    healthy: 0,
    degraded: 0,
    disconnected: 0,
    notConfigured: 0,
    byCategory: {
      "admin-control-plane": { total: 0, healthy: 0 },
      "core-platform": { total: 0, healthy: 0 },
      "infra-telemetry": { total: 0, healthy: 0 },
      "release-deployment": { total: 0, healthy: 0 },
      "docs-truth": { total: 0, healthy: 0 },
    },
    crossReferenceCount: buildCrossReferences().length,
    dataFlowsIn: ALL_INTEGRATIONS.reduce((sum, i) => sum + i.dataFlowIn.length, 0),
    dataFlowsOut: ALL_INTEGRATIONS.reduce((sum, i) => sum + i.dataFlowOut.length, 0),
  };

  for (const integration of ALL_INTEGRATIONS) {
    const health = integration.healthCheck();
    if (health === "healthy") summary.healthy++;
    else if (health === "degraded") summary.degraded++;
    else if (health === "disconnected") summary.disconnected++;
    else summary.notConfigured++;

    summary.byCategory[integration.category].total++;
    if (health === "healthy") summary.byCategory[integration.category].healthy++;
  }

  return summary;
}

// ── Signal Router ───────────────────────────────────────────
// Routes signals from integrated systems to the correct AI layer

export type SignalDestination =
  | "observation"
  | "diagnosis"
  | "planning"
  | "orchestration"
  | "change-plan"
  | "verification"
  | "execution"
  | "learning"
  | "self-healing";

export interface RoutedSignal {
  sourceIntegration: string;
  signalType: string;
  destination: SignalDestination;
  priority: "low" | "medium" | "high" | "critical";
  payload: Record<string, unknown>;
  timestamp: string;
}

const SIGNAL_ROUTING_RULES: { pattern: string; destination: SignalDestination; priority: RoutedSignal["priority"] }[] = [
  { pattern: "error", destination: "observation", priority: "high" },
  { pattern: "incident", destination: "observation", priority: "critical" },
  { pattern: "deployment", destination: "observation", priority: "high" },
  { pattern: "health", destination: "observation", priority: "medium" },
  { pattern: "test", destination: "verification", priority: "medium" },
  { pattern: "approval", destination: "execution", priority: "high" },
  { pattern: "rollback", destination: "self-healing", priority: "critical" },
  { pattern: "drift", destination: "diagnosis", priority: "medium" },
  { pattern: "pattern", destination: "learning", priority: "low" },
  { pattern: "policy", destination: "change-plan", priority: "high" },
  { pattern: "flag", destination: "observation", priority: "medium" },
  { pattern: "canary", destination: "verification", priority: "high" },
  { pattern: "schema", destination: "diagnosis", priority: "high" },
  { pattern: "performance", destination: "observation", priority: "medium" },
  { pattern: "projection", destination: "observation", priority: "medium" },
  { pattern: "connector", destination: "observation", priority: "medium" },
];

export function routeSignal(sourceIntegrationId: string, signalType: string, payload: Record<string, unknown> = {}): RoutedSignal {
  const rule = SIGNAL_ROUTING_RULES.find(r => signalType.toLowerCase().includes(r.pattern));

  return {
    sourceIntegration: sourceIntegrationId,
    signalType,
    destination: rule?.destination ?? "observation",
    priority: rule?.priority ?? "medium",
    payload,
    timestamp: new Date().toISOString(),
  };
}

// ── Queries ─────────────────────────────────────────────────

export function getIntegrationsByCategory(category: IntegrationCategory): IntegrationPoint[] {
  return ALL_INTEGRATIONS.filter(i => i.category === category);
}

export function getIntegration(id: string): IntegrationPoint | undefined {
  return ALL_INTEGRATIONS.find(i => i.id === id);
}

export function getIntegrationsWithRoutes(): IntegrationPoint[] {
  return ALL_INTEGRATIONS.filter(i => i.route);
}

export function getDataFlowsForIntegration(id: string): { inbound: string[]; outbound: string[] } {
  const integration = ALL_INTEGRATIONS.find(i => i.id === id);
  return {
    inbound: integration?.dataFlowIn ?? [],
    outbound: integration?.dataFlowOut ?? [],
  };
}
