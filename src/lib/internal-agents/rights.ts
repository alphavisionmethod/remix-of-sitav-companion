import type { AgentRightsLevel } from "./types";

// ═══════════════════════════════════════════════════
// Autonomy Tiers (Section 6.1)
// ═══════════════════════════════════════════════════

export interface AutonomyTier {
  level: number;
  name: string;
  rightsLevel: AgentRightsLevel;
  description: string;
  canWriteProduction: boolean;
  productionScope: string;
}

export const AUTONOMY_TIERS: AutonomyTier[] = [
  { level: 0, name: "Observe Only", rightsLevel: "observe", description: "Inspect logs, metrics, state, configs, docs, registries within scope", canWriteProduction: false, productionScope: "None" },
  { level: 1, name: "Suggest", rightsLevel: "diagnose", description: "Summarize likely causes and attach evidence", canWriteProduction: false, productionScope: "None" },
  { level: 2, name: "Draft & Simulate", rightsLevel: "recommend", description: "Propose actions or changes", canWriteProduction: false, productionScope: "None" },
  { level: 3, name: "Auto-Safe", rightsLevel: "draft", description: "Prepare runbooks, patches, policy edits, registry updates for review", canWriteProduction: true, productionScope: "Single record" },
  { level: 4, name: "Auto-Service", rightsLevel: "simulate", description: "Run policy-safe simulations, dry runs, diff previews", canWriteProduction: true, productionScope: "Single service" },
  { level: 5, name: "Auto-Cross-Service", rightsLevel: "approval_ready", description: "Package proposed actions for human approval across services", canWriteProduction: true, productionScope: "Multi-service (requires approval)" },
  { level: 6, name: "Emergency Override", rightsLevel: "constrained_action_ready", description: "Perform narrowly scoped actions in emergency scenarios", canWriteProduction: true, productionScope: "System-wide (requires approval)" },
];

// ═══════════════════════════════════════════════════
// Section 8 — Never-Allowed Actions
// ═══════════════════════════════════════════════════

export const NEVER_ALLOWED = [
  "Delete tenant data",
  "Modify billing without owner",
  "Disable audit log",
  "Bypass policy engine",
  "Grant admin role",
  "Exfiltrate secrets",
  "Modify auth keys",
  "Disable receipt service",
  "Circumvent approval chain",
  "Access other tenant",
] as const;

// ═══════════════════════════════════════════════════
// Section 7.1 — Must Require Human Approval
// ═══════════════════════════════════════════════════

export const MUST_REQUIRE_HUMAN_APPROVAL = [
  "Production deployments",
  "Permission widening",
  "Policy relaxation",
  "Sensitive connectors",
  "Destructive data ops",
  "Trust changes",
  "Privacy changes",
  "Irreversible migrations",
] as const;

// ═══════════════════════════════════════════════════
// Section 7.2 — May Be Auto-Executed if Explicitly Allowed
// ═══════════════════════════════════════════════════

export const MAY_AUTO_EXECUTE = [
  "Incident triage",
  "Diagnostics",
  "Recommendations",
  "Drafts",
  "Validation",
  "Maintenance",
] as const;

export const MAY_AUTO_EXECUTE_DETAILS: Record<typeof MAY_AUTO_EXECUTE[number], string[]> = {
  "Incident triage": ["Draft incident summaries", "Classify alerts"],
  "Diagnostics": ["Generate diagnostic bundles", "Correlation reports"],
  "Recommendations": ["Propose rollback", "Suggest optimization"],
  "Drafts": ["Release notes", "Registry updates (non-semantic)"],
  "Validation": ["Non-destructive validation checks", "Test runs"],
  "Maintenance": ["Cache refresh", "Manifest regeneration (no semantic change)"],
};

// ═══════════════════════════════════════════════════
// Section 7.3 — Must Be Simulation-First
// ═══════════════════════════════════════════════════

export const MUST_SIMULATE_FIRST = [
  "Recovery",
  "Release",
  "Routing",
  "Pack management",
  "Connector ops",
  "Policy changes",
] as const;

export const MUST_SIMULATE_FIRST_DETAILS: Record<typeof MUST_SIMULATE_FIRST[number], string[]> = {
  "Recovery": ["Rollback plans", "Compensation workflows"],
  "Release": ["Release freezes", "Canary promotions"],
  "Routing": ["Route/workspace migrations"],
  "Pack management": ["Pack enable/disable migrations"],
  "Connector ops": ["Connector recovery sequences"],
  "Policy changes": ["Policy modification proposals"],
};

// ═══════════════════════════════════════════════════
// Section 10 — Design Drift Monitoring
// ═══════════════════════════════════════════════════

export const DESIGN_DRIFT_CHECKLIST = [
  "Inconsistent token usage",
  "Shell grammar violations",
  "One-off UI component creation",
  "Visual inconsistency across routes",
  "Bad empty/loading/error states",
  "Broken trust-state visual language",
  "Broken proof/receipt UI conventions",
  "Accessibility regressions",
  "Cluttered workspace layouts",
  "Adaptive density failures",
] as const;

// ═══════════════════════════════════════════════════
// Section 9.3 — Watchdog Concerns
// ═══════════════════════════════════════════════════

export const WATCHDOG_CONCERNS = [
  { concern: "Trust incidents", agentId: "aw-security-monitor", response: "Immediate escalation + auto-block" },
  { concern: "Bad release suspicion", agentId: "aw-release-safety", response: "Release freeze recommendation" },
  { concern: "Uncontrolled cost spikes", agentId: "aw-ai-spend-control", response: "Budget cap enforcement" },
  { concern: "Architecture drift", agentId: "aw-arch-consistency", response: "Boundary violation report" },
  { concern: "Design drift", agentId: "aw-design-system", response: "Token/grammar violation report" },
  { concern: "Memory anomaly", agentId: "aw-privacy-boundary", response: "Memory scope investigation" },
] as const;

// ═══════════════════════════════════════════════════
// Section 6.2 — Promotion Rules
// ═══════════════════════════════════════════════════

export interface PromotionRule {
  fromLevel: number;
  toLevel: number;
  requires: ("supervisor-approval" | "chief-of-staff-signoff" | "policy-engine-validation" | "human-confirmation")[];
  timeConstraint: string | null;
  auditRequired: boolean;
}

export const PROMOTION_RULES: PromotionRule[] = [
  { fromLevel: 0, toLevel: 1, requires: ["supervisor-approval"], timeConstraint: null, auditRequired: true },
  { fromLevel: 1, toLevel: 2, requires: ["supervisor-approval"], timeConstraint: null, auditRequired: true },
  { fromLevel: 2, toLevel: 3, requires: ["supervisor-approval", "chief-of-staff-signoff"], timeConstraint: null, auditRequired: true },
  { fromLevel: 3, toLevel: 4, requires: ["supervisor-approval", "chief-of-staff-signoff", "policy-engine-validation"], timeConstraint: null, auditRequired: true },
  { fromLevel: 4, toLevel: 5, requires: ["supervisor-approval", "chief-of-staff-signoff", "policy-engine-validation"], timeConstraint: null, auditRequired: true },
  { fromLevel: 5, toLevel: 6, requires: ["chief-of-staff-signoff", "human-confirmation"], timeConstraint: "5 minutes", auditRequired: true },
];

// ═══════════════════════════════════════════════════
// Section 6.2 — Demotion Triggers
// ═══════════════════════════════════════════════════

export interface DemotionTrigger {
  triggerId: string;
  name: string;
  description: string;
  severity: "automatic" | "review-required";
  targetLevel: number | "previous";
}

export const DEMOTION_TRIGGERS: DemotionTrigger[] = [
  { triggerId: "false-positive-rate", name: "False Positive Rate Exceeded", description: "Agent's false positive rate exceeds configured threshold", severity: "automatic", targetLevel: "previous" },
  { triggerId: "cost-exceeded", name: "Cost Budget Exceeded", description: "Agent exceeded its token/compute budget", severity: "automatic", targetLevel: "previous" },
  { triggerId: "policy-violation", name: "Policy Violation Detected", description: "Agent violated a policy-engine rule", severity: "automatic", targetLevel: 0 },
  { triggerId: "human-override", name: "Human Override (Explicit Downgrade)", description: "Owner explicitly downgraded agent autonomy", severity: "review-required", targetLevel: "previous" },
  { triggerId: "incident-attribution", name: "Incident Attributed to Agent", description: "An incident was attributed to this agent's actions", severity: "automatic", targetLevel: 0 },
];

// ═══════════════════════════════════════════════════
// Section 10.1 — Agent Metrics
// ═══════════════════════════════════════════════════

export interface AgentMetricDefinition {
  metricId: string;
  name: string;
  description: string;
  unit: string;
  scope: "per-agent" | "per-council" | "per-supervisor";
}

export const AGENT_METRICS: AgentMetricDefinition[] = [
  { metricId: "agent.invocation.count", name: "Invocation Count", description: "How often each agent runs", unit: "count", scope: "per-agent" },
  { metricId: "agent.action.count", name: "Action Count", description: "Actions taken per agent", unit: "count", scope: "per-agent" },
  { metricId: "agent.escalation.count", name: "Escalation Count", description: "Escalations per agent", unit: "count", scope: "per-agent" },
  { metricId: "agent.confidence.avg", name: "Confidence Average", description: "Average confidence score", unit: "percentage", scope: "per-agent" },
  { metricId: "agent.cost.tokens", name: "Token Cost", description: "Token consumption per agent", unit: "tokens", scope: "per-agent" },
  { metricId: "agent.cost.compute", name: "Compute Cost", description: "Compute consumption per agent", unit: "usd", scope: "per-agent" },
  { metricId: "agent.latency.p50", name: "Latency P50", description: "Agent execution time (50th percentile)", unit: "ms", scope: "per-agent" },
  { metricId: "agent.latency.p95", name: "Latency P95", description: "Agent execution time (95th percentile)", unit: "ms", scope: "per-agent" },
  { metricId: "agent.failure.count", name: "Failure Count", description: "Failed actions per agent", unit: "count", scope: "per-agent" },
  { metricId: "agent.rollback.count", name: "Rollback Count", description: "Rollbacks per agent", unit: "count", scope: "per-agent" },
  { metricId: "council.quorum.met", name: "Quorum Met", description: "How often quorum is achieved", unit: "percentage", scope: "per-council" },
  { metricId: "supervisor.override.count", name: "Supervisor Overrides", description: "Supervisor overrides", unit: "count", scope: "per-supervisor" },
];

// ═══════════════════════════════════════════════════
// Utility Functions
// ═══════════════════════════════════════════════════

export function getAutonomyTier(level: number): AutonomyTier | undefined {
  return AUTONOMY_TIERS.find(t => t.level === level);
}

export function getAutonomyLevel(rights: AgentRightsLevel): number {
  const map: Record<AgentRightsLevel, number> = {
    observe: 0, diagnose: 1, recommend: 2, draft: 3,
    simulate: 4, approval_ready: 5, constrained_action_ready: 6,
  };
  return map[rights];
}

export function canAutoApply(level: number): boolean {
  return level >= 3;
}

export function getPromotionRequirements(fromLevel: number, toLevel: number): PromotionRule | undefined {
  return PROMOTION_RULES.find(r => r.fromLevel === fromLevel && r.toLevel === toLevel);
}

export function getDemotionTrigger(triggerId: string): DemotionTrigger | undefined {
  return DEMOTION_TRIGGERS.find(d => d.triggerId === triggerId);
}

export function isAutoExecutable(category: string): boolean {
  return (MAY_AUTO_EXECUTE as readonly string[]).includes(category);
}

export function requiresSimulation(category: string): boolean {
  return (MUST_SIMULATE_FIRST as readonly string[]).includes(category);
}
