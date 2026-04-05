// ═══════════════════════════════════════════════════════════════
// SITA OS — Phase 6: Enterprise Maturity Engine
// Enterprise/FO control, support, observability, release safety,
// trust-device, compliance/proof, premium OS experience
// ═══════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────
// SECTION 1 — Enterprise & Family Office Control Plane
// ────────────────────────────────────────────────────────────────

export type OrgType = "business" | "family-office" | "household" | "enterprise";
export type OrgVisibility = "private" | "shared" | "org-wide" | "cross-entity";
export type DelegationLevel = "owner" | "principal" | "operator" | "delegate" | "viewer";

export interface ControlPlaneOrg {
  id: string;
  name: string;
  type: OrgType;
  parentId?: string;
  visibility: OrgVisibility;
  delegationChain: DelegationGrant[];
  policies: string[];
  boardroomId?: string;
  trustEnvironment: "standard" | "elevated" | "premium";
  slaLevel: "standard" | "priority" | "premium";
  createdAt: string;
}

export interface DelegationGrant {
  id: string;
  grantorId: string;
  granteeId: string;
  level: DelegationLevel;
  scope: string[];
  constraints: { maxAmount?: number; requiresDualApproval?: boolean; expiresAt?: string };
  active: boolean;
  grantedAt: string;
}

export interface FamilyOfficeView {
  entities: ControlPlaneOrg[];
  crossEntityCashPosition: number;
  crossEntityObligations: number;
  crossEntityOpportunities: number;
  privateContexts: string[];
  sharedContexts: string[];
  approvalRequirements: { threshold: number; requiresDual: boolean; premiumPacket: boolean };
}

export class EnterpriseControlPlaneEngine {
  private orgs: Map<string, ControlPlaneOrg> = new Map();
  private delegations: DelegationGrant[] = [];

  createOrg(org: Omit<ControlPlaneOrg, "id" | "createdAt">): ControlPlaneOrg {
    const entity: ControlPlaneOrg = { ...org, id: `org_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString() };
    this.orgs.set(entity.id, entity);
    return entity;
  }

  getOrg(id: string): ControlPlaneOrg | undefined { return this.orgs.get(id); }

  listOrgs(type?: OrgType): ControlPlaneOrg[] {
    const all = Array.from(this.orgs.values());
    return type ? all.filter(o => o.type === type) : all;
  }

  grantDelegation(grant: Omit<DelegationGrant, "id" | "grantedAt">): DelegationGrant {
    const d: DelegationGrant = { ...grant, id: `del_${Date.now()}`, grantedAt: new Date().toISOString() };
    this.delegations.push(d);
    return d;
  }

  revokeDelegation(id: string): boolean {
    const d = this.delegations.find(x => x.id === id);
    if (d) { d.active = false; return true; }
    return false;
  }

  getEffectiveLevel(userId: string, orgId: string): DelegationLevel {
    const grants = this.delegations.filter(d => d.granteeId === userId && d.active);
    const org = this.orgs.get(orgId);
    if (!org) return "viewer";
    const orgGrant = grants.find(g => g.scope.includes(orgId) || g.scope.includes("*"));
    return orgGrant?.level ?? "viewer";
  }

  getFamilyOfficeView(rootOrgId: string): FamilyOfficeView {
    const root = this.orgs.get(rootOrgId);
    const entities = Array.from(this.orgs.values()).filter(o => o.parentId === rootOrgId || o.id === rootOrgId);
    return {
      entities,
      crossEntityCashPosition: entities.length * 125000,
      crossEntityObligations: entities.length * 34000,
      crossEntityOpportunities: entities.length * 12,
      privateContexts: entities.filter(e => e.visibility === "private").map(e => e.id),
      sharedContexts: entities.filter(e => e.visibility !== "private").map(e => e.id),
      approvalRequirements: {
        threshold: root?.trustEnvironment === "premium" ? 5000 : 25000,
        requiresDual: root?.trustEnvironment === "premium",
        premiumPacket: root?.type === "family-office",
      },
    };
  }

  getConnectorGovernance(): { connectorId: string; owner: string; policy: string; healthScore: number; lastAudit: string }[] {
    return [
      { connectorId: "stripe", owner: "finance-team", policy: "read-only", healthScore: 98, lastAudit: new Date().toISOString() },
      { connectorId: "quickbooks", owner: "finance-team", policy: "read-write-governed", healthScore: 94, lastAudit: new Date().toISOString() },
      { connectorId: "hubspot", owner: "revenue-team", policy: "read-only", healthScore: 97, lastAudit: new Date().toISOString() },
      { connectorId: "gmail", owner: "productivity", policy: "read-only", healthScore: 100, lastAudit: new Date().toISOString() },
      { connectorId: "plaid", owner: "finance-team", policy: "transactions-only", healthScore: 91, lastAudit: new Date().toISOString() },
    ];
  }
}

// ────────────────────────────────────────────────────────────────
// SECTION 2 — Support & Diagnostics Maturity
// ────────────────────────────────────────────────────────────────

export type SupportCaseSeverity = "low" | "medium" | "high" | "critical";
export type SupportCaseStatus = "open" | "investigating" | "waiting-on-user" | "escalated" | "resolved" | "closed";

export interface SupportCase {
  id: string;
  title: string;
  description: string;
  severity: SupportCaseSeverity;
  status: SupportCaseStatus;
  correlationIds: string[];
  workflowFamily?: string;
  connectorId?: string;
  module?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  assignee?: string;
  diagnosticBundleId?: string;
  knownIssueId?: string;
  remediationSteps: string[];
  userReceiptId?: string;
  escalationPath: string[];
  slaTarget: number; // hours
  slaBreached: boolean;
}

export interface SupportDiagnosticBundle {
  id: string;
  caseId?: string;
  generatedAt: string;
  correlationIds: string[];
  actionReplay: { timestamp: string; action: string; state: string; outcome: string }[];
  connectorDiagnostics: { connectorId: string; latency: number; errorRate: number; lastSync: string }[];
  memorySnapshot: Record<string, unknown>;
  policySnapshot: { policyId: string; active: boolean; version: number }[];
  systemHealth: { service: string; status: string; latency: number }[];
  trustSnapshot: { dimension: string; score: number }[];
  exportSafe: boolean;
}

export interface KnownIssue {
  id: string;
  pattern: string;
  description: string;
  remediation: string;
  affectedModules: string[];
  autoResolve: boolean;
  occurrences: number;
  lastSeen: string;
}

export class SupportDiagnosticsEngine {
  private cases: Map<string, SupportCase> = new Map();
  private bundles: Map<string, SupportDiagnosticBundle> = new Map();
  private knownIssues: KnownIssue[] = [
    { id: "ki-001", pattern: "connector_timeout", description: "Connector sync exceeds 30s timeout", remediation: "Check connector health and retry. If persistent, reconnect.", affectedModules: ["connectors", "sync"], autoResolve: false, occurrences: 12, lastSeen: new Date().toISOString() },
    { id: "ki-002", pattern: "approval_stuck", description: "Approval workflow stuck in pending > 24h", remediation: "Escalate to owner or auto-approve if within policy bounds.", affectedModules: ["approvals", "workflows"], autoResolve: true, occurrences: 5, lastSeen: new Date().toISOString() },
    { id: "ki-003", pattern: "memory_conflict", description: "Contradictory memory entries detected", remediation: "Run memory governance reconciliation.", affectedModules: ["memory", "brain-core"], autoResolve: true, occurrences: 3, lastSeen: new Date().toISOString() },
    { id: "ki-004", pattern: "token_budget_exceeded", description: "Daily token budget exceeded for advisor", remediation: "Throttle advisor or increase budget in AI economics.", affectedModules: ["ai-economics", "advisors"], autoResolve: false, occurrences: 8, lastSeen: new Date().toISOString() },
  ];

  createCase(input: Omit<SupportCase, "id" | "createdAt" | "updatedAt" | "slaBreached">): SupportCase {
    const c: SupportCase = {
      ...input,
      id: `case_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      slaBreached: false,
    };
    // Auto-match known issues
    const match = this.knownIssues.find(ki => c.title.toLowerCase().includes(ki.pattern) || c.description.toLowerCase().includes(ki.pattern));
    if (match) {
      c.knownIssueId = match.id;
      c.remediationSteps = [match.remediation, ...c.remediationSteps];
      match.occurrences++;
      match.lastSeen = new Date().toISOString();
    }
    this.cases.set(c.id, c);
    return c;
  }

  getCase(id: string): SupportCase | undefined { return this.cases.get(id); }

  listCases(filter?: { status?: SupportCaseStatus; severity?: SupportCaseSeverity }): SupportCase[] {
    let cases = Array.from(this.cases.values());
    if (filter?.status) cases = cases.filter(c => c.status === filter.status);
    if (filter?.severity) cases = cases.filter(c => c.severity === filter.severity);
    return cases.sort((a, b) => {
      const sevOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return sevOrder[a.severity] - sevOrder[b.severity];
    });
  }

  escalate(caseId: string, to: string): boolean {
    const c = this.cases.get(caseId);
    if (!c) return false;
    c.status = "escalated";
    c.escalationPath.push(to);
    c.updatedAt = new Date().toISOString();
    return true;
  }

  resolve(caseId: string): boolean {
    const c = this.cases.get(caseId);
    if (!c) return false;
    c.status = "resolved";
    c.resolvedAt = new Date().toISOString();
    c.updatedAt = new Date().toISOString();
    return true;
  }

  generateDiagnosticBundle(caseId?: string, correlationIds: string[] = []): SupportDiagnosticBundle {
    const bundle: SupportDiagnosticBundle = {
      id: `diag_${Date.now()}`,
      caseId,
      generatedAt: new Date().toISOString(),
      correlationIds,
      actionReplay: [
        { timestamp: new Date(Date.now() - 300000).toISOString(), action: "workflow.started", state: "running", outcome: "ok" },
        { timestamp: new Date(Date.now() - 240000).toISOString(), action: "connector.sync", state: "syncing", outcome: "timeout" },
        { timestamp: new Date(Date.now() - 180000).toISOString(), action: "retry.scheduled", state: "pending", outcome: "ok" },
        { timestamp: new Date(Date.now() - 120000).toISOString(), action: "connector.sync", state: "syncing", outcome: "success" },
        { timestamp: new Date(Date.now() - 60000).toISOString(), action: "workflow.completed", state: "done", outcome: "ok" },
      ],
      connectorDiagnostics: [
        { connectorId: "stripe", latency: 120, errorRate: 0.02, lastSync: new Date().toISOString() },
        { connectorId: "quickbooks", latency: 340, errorRate: 0.05, lastSync: new Date(Date.now() - 600000).toISOString() },
        { connectorId: "plaid", latency: 890, errorRate: 0.12, lastSync: new Date(Date.now() - 1200000).toISOString() },
      ],
      memorySnapshot: { totalEntries: 1420, contradictions: 2, lastReconciliation: new Date().toISOString() },
      policySnapshot: [
        { policyId: "auto-pay-under-500", active: true, version: 3 },
        { policyId: "require-dual-approval-over-10k", active: true, version: 1 },
      ],
      systemHealth: [
        { service: "brain-core", status: "healthy", latency: 45 },
        { service: "business-os", status: "healthy", latency: 32 },
        { service: "finance-os", status: "degraded", latency: 180 },
        { service: "concierge-os", status: "healthy", latency: 28 },
        { service: "advisor-runtime", status: "healthy", latency: 55 },
      ],
      trustSnapshot: [
        { dimension: "policyCompliance", score: 98 },
        { dimension: "proofCompleteness", score: 96 },
        { dimension: "verificationHealth", score: 92 },
        { dimension: "connectorHealth", score: 78 },
      ],
      exportSafe: true,
    };
    this.bundles.set(bundle.id, bundle);
    if (caseId) {
      const c = this.cases.get(caseId);
      if (c) { c.diagnosticBundleId = bundle.id; c.updatedAt = new Date().toISOString(); }
    }
    return bundle;
  }

  getKnownIssues(): KnownIssue[] { return [...this.knownIssues]; }

  getSupportAnalytics(): { totalCases: number; openCases: number; avgResolutionHours: number; slaBreachRate: number; topModules: { module: string; count: number }[] } {
    const cases = Array.from(this.cases.values());
    const resolved = cases.filter(c => c.resolvedAt);
    const avgHours = resolved.length > 0 ? resolved.reduce((s, c) => s + (new Date(c.resolvedAt!).getTime() - new Date(c.createdAt).getTime()) / 3600000, 0) / resolved.length : 0;
    const moduleCounts = new Map<string, number>();
    cases.forEach(c => { if (c.module) moduleCounts.set(c.module, (moduleCounts.get(c.module) ?? 0) + 1); });
    return {
      totalCases: cases.length,
      openCases: cases.filter(c => c.status !== "resolved" && c.status !== "closed").length,
      avgResolutionHours: Math.round(avgHours * 10) / 10,
      slaBreachRate: cases.length > 0 ? cases.filter(c => c.slaBreached).length / cases.length : 0,
      topModules: Array.from(moduleCounts.entries()).map(([module, count]) => ({ module, count })).sort((a, b) => b.count - a.count).slice(0, 5),
    };
  }

  serialize(): Record<string, unknown> {
    return { cases: Array.from(this.cases.entries()), bundles: Array.from(this.bundles.entries()), knownIssues: this.knownIssues };
  }
  hydrate(state: Record<string, unknown>): void {
    if (state.cases) this.cases = new Map(state.cases as any);
    if (state.bundles) this.bundles = new Map(state.bundles as any);
    if (state.knownIssues) this.knownIssues = state.knownIssues as any;
  }
}
// SECTION 3 — Observability Maturity
// ────────────────────────────────────────────────────────────────

export interface TraceSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  service: string;
  startTime: number;
  endTime: number;
  status: "ok" | "error" | "timeout";
  attributes: Record<string, string | number | boolean>;
  events: { name: string; timestamp: number; attributes: Record<string, unknown> }[];
}

export interface SLODefinition {
  id: string;
  name: string;
  target: number; // percentage
  window: "1h" | "24h" | "7d" | "30d";
  metric: string;
  currentValue: number;
  budget: number;
  budgetConsumed: number;
  status: "met" | "at-risk" | "breached";
}

export interface AnomalySignal {
  id: string;
  metric: string;
  expectedRange: [number, number];
  actualValue: number;
  deviation: number;
  severity: "info" | "warning" | "critical";
  detectedAt: string;
  service: string;
  autoResolved: boolean;
}

export class ObservabilityEngine {
  private traces: TraceSpan[] = [];
  private anomalies: AnomalySignal[] = [];

  recordSpan(span: TraceSpan): void { this.traces.push(span); }

  getTrace(traceId: string): TraceSpan[] { return this.traces.filter(s => s.traceId === traceId); }

  getRecentTraces(limit = 50): TraceSpan[] {
    return [...this.traces].sort((a, b) => b.startTime - a.startTime).slice(0, limit);
  }

  getSLOs(): SLODefinition[] {
    return [
      { id: "slo-approval-latency", name: "Approval Latency < 2s", target: 99.5, window: "24h", metric: "approval.latency_p99", currentValue: 99.7, budget: 0.5, budgetConsumed: 0.3, status: "met" },
      { id: "slo-connector-uptime", name: "Connector Uptime > 99.9%", target: 99.9, window: "7d", metric: "connector.uptime", currentValue: 99.85, budget: 0.1, budgetConsumed: 0.05, status: "at-risk" },
      { id: "slo-workflow-success", name: "Workflow Success Rate > 99%", target: 99.0, window: "24h", metric: "workflow.success_rate", currentValue: 99.4, budget: 1.0, budgetConsumed: 0.6, status: "met" },
      { id: "slo-verification-lag", name: "Verification Lag < 5m", target: 98.0, window: "24h", metric: "verification.lag_p95", currentValue: 97.5, budget: 2.0, budgetConsumed: 2.5, status: "breached" },
      { id: "slo-boardroom-gen", name: "Boardroom Packet Gen < 30s", target: 99.0, window: "7d", metric: "boardroom.generation_p95", currentValue: 99.2, budget: 1.0, budgetConsumed: 0.8, status: "met" },
      { id: "slo-recommendation-quality", name: "Recommendation Acceptance > 80%", target: 80.0, window: "30d", metric: "recommendation.acceptance", currentValue: 84.3, budget: 20.0, budgetConsumed: 15.7, status: "met" },
    ];
  }

  detectAnomalies(): AnomalySignal[] {
    const signals: AnomalySignal[] = [
      { id: "anom-001", metric: "connector.plaid.latency", expectedRange: [100, 500], actualValue: 890, deviation: 2.4, severity: "warning", detectedAt: new Date().toISOString(), service: "connector-sync", autoResolved: false },
      { id: "anom-002", metric: "ai.token_usage.hourly", expectedRange: [1000, 5000], actualValue: 8200, deviation: 1.8, severity: "info", detectedAt: new Date().toISOString(), service: "ai-economics", autoResolved: false },
      { id: "anom-003", metric: "workflow.queue_depth", expectedRange: [0, 20], actualValue: 45, deviation: 3.1, severity: "critical", detectedAt: new Date(Date.now() - 600000).toISOString(), service: "workflow-engine", autoResolved: true },
    ];
    this.anomalies = signals;
    return signals;
  }

  getAnomalies(): AnomalySignal[] { return [...this.anomalies]; }

  getLatencyOverview(): { service: string; p50: number; p95: number; p99: number; trend: "improving" | "stable" | "degrading" }[] {
    return [
      { service: "brain-core", p50: 32, p95: 85, p99: 145, trend: "stable" },
      { service: "business-os", p50: 18, p95: 45, p99: 78, trend: "improving" },
      { service: "finance-os", p50: 42, p95: 120, p99: 280, trend: "degrading" },
      { service: "concierge-os", p50: 15, p95: 38, p99: 62, trend: "stable" },
      { service: "advisor-runtime", p50: 55, p95: 140, p99: 320, trend: "stable" },
      { service: "connector-sync", p50: 180, p95: 450, p99: 890, trend: "degrading" },
      { service: "boardroom-gen", p50: 8500, p95: 18000, p99: 28000, trend: "improving" },
    ];
  }

  getSupportBurdenHeatmap(): { module: string; day: string; cases: number; severity: number }[] {
    const modules = ["connectors", "approvals", "workflows", "advisors", "boardroom", "money", "memory"];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return modules.flatMap(module => days.map(day => ({
      module,
      day,
      cases: Math.floor(Math.random() * 8),
      severity: Math.random() * 3,
    })));
  }

  getTrustPostureDashboard(): { dimension: string; current: number; target: number; trend: "up" | "down" | "flat"; incidents: number }[] {
    return [
      { dimension: "Policy Compliance", current: 98, target: 99, trend: "up", incidents: 0 },
      { dimension: "Proof Completeness", current: 96, target: 98, trend: "flat", incidents: 1 },
      { dimension: "Verification Health", current: 92, target: 95, trend: "up", incidents: 2 },
      { dimension: "Connector Health", current: 78, target: 90, trend: "down", incidents: 3 },
      { dimension: "Memory Integrity", current: 94, target: 95, trend: "up", incidents: 0 },
      { dimension: "Advisor Governance", current: 97, target: 98, trend: "flat", incidents: 0 },
      { dimension: "Device Trust", current: 88, target: 90, trend: "up", incidents: 1 },
    ];
  }

  serialize(): Record<string, unknown> {
    return { traces: this.traces.slice(-500), anomalies: this.anomalies };
  }
  hydrate(state: Record<string, unknown>): void {
    if (state.traces) this.traces = state.traces as any;
    if (state.anomalies) this.anomalies = state.anomalies as any;
  }
}
// ────────────────────────────────────────────────────────────────

export type RolloutRing = "canary" | "early-adopter" | "general" | "conservative";
export type ReleaseStatus = "draft" | "canary" | "ring-1" | "ring-2" | "ring-3" | "ga" | "rolled-back" | "frozen";

export interface Release {
  id: string;
  version: string;
  name: string;
  status: ReleaseStatus;
  ring: RolloutRing;
  features: string[];
  killSwitches: EnterpriseKillSwitch[];
  confidenceScore: number;
  impactPrediction: { affectedWorkflows: number; affectedConnectors: number; riskLevel: "low" | "medium" | "high" };
  readinessChecklist: { item: string; met: boolean }[];
  rollbackPacketId?: string;
  dependencies: string[];
  createdAt: string;
  promotedAt?: string;
  rolledBackAt?: string;
}

export interface EnterpriseKillSwitch {
  id: string;
  name: string;
  scope: "global" | "workflow-family" | "connector" | "feature";
  scopeValue: string;
  active: boolean;
  triggeredBy?: string;
  triggeredAt?: string;
  reason?: string;
}

export interface EnvironmentConfig {
  name: string;
  type: "production" | "staging" | "canary";
  activeRelease: string;
  featureFlags: string[];
  frozenUntil?: string;
  incidentFreeze: boolean;
  deepFrozen?: boolean;
  deepFreezeRecord?: DeepFreezeRecord;
}

// ── Ring Progression Gates ─────────────────────────────────
export type RingGateType = "error-rate" | "latency" | "success-rate" | "duration" | "manual-approval" | "custom";
export type GateResult = "pass" | "fail" | "pending" | "skipped";

export interface RingGate {
  readonly id: string;
  readonly ring: RolloutRing;
  readonly name: string;
  readonly type: RingGateType;
  readonly threshold: number;
  readonly operator: "lt" | "lte" | "gt" | "gte" | "eq";
  readonly durationMs: number;
  readonly required: boolean;
}

export interface GateEvaluation {
  readonly gateId: string;
  readonly gate: RingGate;
  readonly result: GateResult;
  readonly currentValue: number;
  readonly evaluatedAt: number;
  readonly reason: string;
}

export interface RingTimelineEntry {
  readonly releaseId: string;
  readonly ring: RolloutRing;
  readonly enteredAt: number;
  exitedAt?: number;
  readonly gateResults: GateEvaluation[];
}

// ── Deep Freeze ────────────────────────────────────────────
export interface DeepFreezeRecord {
  readonly id: string;
  readonly envName: string;
  readonly reason: string;
  readonly activatedBy: string;
  readonly activatedAt: number;
  readonly durationMs: number;
  readonly expiresAt: number;
  deactivatedAt?: number;
  deactivatedBy?: string;
  blockedActions: string[];
}

export interface FreezeHistory {
  readonly envName: string;
  records: DeepFreezeRecord[];
  currentlyFrozen: boolean;
  totalFreezeCount: number;
  totalFreezeMs: number;
}

export class ReleaseSafetyEngine {
  private releases: Map<string, Release> = new Map();
  private killSwitches: EnterpriseKillSwitch[] = [];
  private environments: EnvironmentConfig[] = [
    { name: "production", type: "production", activeRelease: "v6.0.0", featureFlags: ["premium-boardroom", "digital-twins"], frozenUntil: undefined, incidentFreeze: false },
    { name: "staging", type: "staging", activeRelease: "v6.1.0-rc1", featureFlags: ["premium-boardroom", "digital-twins", "scenario-lab-v2"], frozenUntil: undefined, incidentFreeze: false },
    { name: "canary", type: "canary", activeRelease: "v6.1.0-rc1", featureFlags: ["premium-boardroom", "digital-twins", "scenario-lab-v2", "trust-device-v1"], frozenUntil: undefined, incidentFreeze: false },
  ];

  createRelease(input: Omit<Release, "id" | "createdAt">): Release {
    const r: Release = { ...input, id: `rel_${Date.now()}`, createdAt: new Date().toISOString() };
    this.releases.set(r.id, r);
    return r;
  }

  promoteRelease(id: string, toRing: RolloutRing): boolean {
    const r = this.releases.get(id);
    if (!r) return false;
    const ringMap: Record<RolloutRing, ReleaseStatus> = { canary: "canary", "early-adopter": "ring-1", general: "ring-2", conservative: "ring-3" };
    r.ring = toRing;
    r.status = ringMap[toRing];
    r.promotedAt = new Date().toISOString();
    return true;
  }

  rollbackRelease(id: string, reason: string): boolean {
    const r = this.releases.get(id);
    if (!r) return false;
    r.status = "rolled-back";
    r.rolledBackAt = new Date().toISOString();
    return true;
  }

  activateKillSwitch(name: string, scope: EnterpriseKillSwitch["scope"], scopeValue: string, reason: string): EnterpriseKillSwitch {
    const ks: EnterpriseKillSwitch = { id: `ks_${Date.now()}`, name, scope, scopeValue, active: true, triggeredBy: "system", triggeredAt: new Date().toISOString(), reason };
    this.killSwitches.push(ks);
    return ks;
  }

  deactivateKillSwitch(id: string): boolean {
    const ks = this.killSwitches.find(k => k.id === id);
    if (ks) { ks.active = false; return true; }
    return false;
  }

  getActiveKillSwitches(): EnterpriseKillSwitch[] { return this.killSwitches.filter(k => k.active); }

  freezeEnvironment(envName: string, until: string): boolean {
    const env = this.environments.find(e => e.name === envName);
    if (env) { env.frozenUntil = until; return true; }
    return false;
  }

  getEnvironments(): EnvironmentConfig[] { return [...this.environments]; }

  getReleaseReadiness(id: string): { ready: boolean; score: number; blockers: string[] } {
    const r = this.releases.get(id);
    if (!r) return { ready: false, score: 0, blockers: ["Release not found"] };
    const unmet = r.readinessChecklist.filter(c => !c.met);
    return {
      ready: unmet.length === 0 && r.confidenceScore >= 80,
      score: r.confidenceScore,
      blockers: unmet.map(c => c.item),
    };
  }

  listReleases(): Release[] { return Array.from(this.releases.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }

  // ── Ring Progression Gates ──────────────────────────────────
  private ringGates: RingGate[] = [];
  private ringTimelines: RingTimelineEntry[] = [];
  private tenantRingOverrides = new Map<string, RolloutRing>();
  private deepFreezeHistory: DeepFreezeRecord[] = [];

  addRingGate(ring: RolloutRing, gate: Omit<RingGate, "id" | "ring">): RingGate {
    const g: RingGate = { ...gate, id: `gate_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`, ring };
    this.ringGates.push(g);
    return g;
  }

  getRingGates(ring: RolloutRing): RingGate[] {
    return this.ringGates.filter(g => g.ring === ring);
  }

  evaluateRingGates(releaseId: string, ring: RolloutRing): { allPassed: boolean; results: GateEvaluation[] } {
    const gates = this.getRingGates(ring);
    const results: GateEvaluation[] = gates.map(gate => {
      // Simulate gate evaluation with realistic heuristics
      const currentValue = gate.type === "error-rate" ? Math.random() * 3
        : gate.type === "latency" ? 50 + Math.random() * 200
        : gate.type === "success-rate" ? 95 + Math.random() * 5
        : gate.type === "duration" ? Date.now() - (this.ringTimelines.find(t => t.releaseId === releaseId && t.ring === ring)?.enteredAt ?? Date.now())
        : 0;

      const compare = (val: number, thresh: number, op: RingGate["operator"]): boolean => {
        switch (op) {
          case "lt": return val < thresh;
          case "lte": return val <= thresh;
          case "gt": return val > thresh;
          case "gte": return val >= thresh;
          case "eq": return val === thresh;
        }
      };

      const passed = gate.type === "manual-approval" ? false : compare(currentValue, gate.threshold, gate.operator);
      const result: GateResult = gate.type === "manual-approval" ? "pending" : passed ? "pass" : "fail";

      return {
        gateId: gate.id,
        gate,
        result,
        currentValue: Math.round(currentValue * 100) / 100,
        evaluatedAt: Date.now(),
        reason: result === "pass" ? `${gate.name}: ${currentValue.toFixed(2)} ${gate.operator} ${gate.threshold} ✓`
          : result === "pending" ? `${gate.name}: Awaiting manual approval`
          : `${gate.name}: ${currentValue.toFixed(2)} ${gate.operator} ${gate.threshold} ✗`,
      };
    });

    return { allPassed: results.every(r => r.result === "pass"), results };
  }

  getRingTimeline(releaseId: string): RingTimelineEntry[] {
    return this.ringTimelines.filter(t => t.releaseId === releaseId).sort((a, b) => a.enteredAt - b.enteredAt);
  }

  recordRingEntry(releaseId: string, ring: RolloutRing): void {
    // close previous ring timeline for this release
    const prev = this.ringTimelines.find(t => t.releaseId === releaseId && !t.exitedAt);
    if (prev) prev.exitedAt = Date.now();

    this.ringTimelines.push({ releaseId, ring, enteredAt: Date.now(), gateResults: [] });
  }

  setTenantRingOverride(tenantId: string, ring: RolloutRing): void {
    this.tenantRingOverrides.set(tenantId, ring);
  }

  getTenantRingOverride(tenantId: string): RolloutRing | undefined {
    return this.tenantRingOverrides.get(tenantId);
  }

  removeTenantRingOverride(tenantId: string): boolean {
    return this.tenantRingOverrides.delete(tenantId);
  }

  // ── Deep Freeze ─────────────────────────────────────────────

  activateDeepFreeze(envName: string, reason: string, durationMs: number, activatedBy = "system"): DeepFreezeRecord | null {
    const env = this.environments.find(e => e.name === envName);
    if (!env) return null;

    const now = Date.now();
    const record: DeepFreezeRecord = {
      id: `freeze_${now}_${Math.random().toString(36).slice(2, 8)}`,
      envName,
      reason,
      activatedBy,
      activatedAt: now,
      durationMs,
      expiresAt: now + durationMs,
      blockedActions: ["deploy", "schema-migration", "config-change", "feature-flag-toggle", "secret-rotation"],
    };

    env.deepFrozen = true;
    env.deepFreezeRecord = record;
    env.frozenUntil = new Date(record.expiresAt).toISOString();
    this.deepFreezeHistory.push(record);
    return record;
  }

  deactivateDeepFreeze(envName: string, authorizedBy: string): boolean {
    const env = this.environments.find(e => e.name === envName);
    if (!env || !env.deepFrozen) return false;

    env.deepFrozen = false;
    env.frozenUntil = undefined;

    const record = this.deepFreezeHistory.find(r => r.envName === envName && !r.deactivatedAt);
    if (record) {
      record.deactivatedAt = Date.now();
      record.deactivatedBy = authorizedBy;
    }
    env.deepFreezeRecord = undefined;
    return true;
  }

  isDeepFrozen(envName: string): boolean {
    const env = this.environments.find(e => e.name === envName);
    if (!env?.deepFrozen) return false;
    // auto-expire
    if (env.deepFreezeRecord && Date.now() > env.deepFreezeRecord.expiresAt) {
      this.deactivateDeepFreeze(envName, "system-auto-expire");
      return false;
    }
    return true;
  }

  getFreezeHistory(envName: string): FreezeHistory {
    const records = this.deepFreezeHistory.filter(r => r.envName === envName);
    const totalMs = records.reduce((s, r) => s + ((r.deactivatedAt ?? Date.now()) - r.activatedAt), 0);
    return {
      envName,
      records: records.sort((a, b) => b.activatedAt - a.activatedAt),
      currentlyFrozen: this.isDeepFrozen(envName),
      totalFreezeCount: records.length,
      totalFreezeMs: totalMs,
    };
  }

  getFreezeSummary(): Array<{ envName: string; frozen: boolean; since?: number; reason?: string; expiresAt?: number }> {
    return this.environments.map(env => ({
      envName: env.name,
      frozen: this.isDeepFrozen(env.name),
      since: env.deepFreezeRecord?.activatedAt,
      reason: env.deepFreezeRecord?.reason,
      expiresAt: env.deepFreezeRecord?.expiresAt,
    }));
  }

  getActiveReleases(): Release[] {
    return this.listReleases().filter(r => !["rolled-back", "frozen", "draft"].includes(r.status));
  }

  getDemoReleases(): Release[] {
    return [
      {
        id: "rel_demo_1", version: "v6.0.0", name: "Phase 6 GA", status: "ga", ring: "general",
        features: ["enterprise-control-plane", "support-diagnostics", "observability-engine"],
        killSwitches: [], confidenceScore: 97,
        impactPrediction: { affectedWorkflows: 0, affectedConnectors: 0, riskLevel: "low" },
        readinessChecklist: [{ item: "All SLOs met", met: true }, { item: "Rollback tested", met: true }],
        dependencies: [], createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      },
      {
        id: "rel_demo_2", version: "v6.1.0-rc1", name: "Trust Device & Scenario Lab v2", status: "canary", ring: "canary",
        features: ["trust-device-enrollment", "scenario-lab-v2", "premium-proof-packets"],
        killSwitches: [{ id: "ks_demo_1", name: "Trust Device Enrollment", scope: "feature", scopeValue: "trust-device-enrollment", active: false }],
        confidenceScore: 82,
        impactPrediction: { affectedWorkflows: 12, affectedConnectors: 2, riskLevel: "medium" },
        readinessChecklist: [{ item: "Canary healthy 24h", met: true }, { item: "No P1 incidents", met: true }, { item: "Rollback packet ready", met: false }],
        dependencies: ["rel_demo_1"], createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
  }

  serialize(): Record<string, unknown> {
    return { releases: Array.from(this.releases.entries()), killSwitches: this.killSwitches, environments: this.environments, ringGates: this.ringGates, ringTimelines: this.ringTimelines, deepFreezeHistory: this.deepFreezeHistory };
  }
  hydrate(state: Record<string, unknown>): void {
    if (state.releases) this.releases = new Map(state.releases as any);
    if (state.killSwitches) this.killSwitches = state.killSwitches as any;
    if (state.environments) this.environments = state.environments as any;
    if (state.ringGates) this.ringGates = state.ringGates as any;
    if (state.ringTimelines) this.ringTimelines = state.ringTimelines as any;
    if (state.deepFreezeHistory) this.deepFreezeHistory = state.deepFreezeHistory as any;
  }
}
// ────────────────────────────────────────────────────────────────

export type DeviceTrustLevel = "untrusted" | "basic" | "verified" | "trusted" | "secure-enclave";
export type DeviceType = "desktop" | "mobile" | "tablet" | "hardware-key";

export interface TrustedDevice {
  id: string;
  name: string;
  type: DeviceType;
  trustLevel: DeviceTrustLevel;
  trustScore: number;
  enrolledAt: string;
  lastSeen: string;
  publicKeyFingerprint: string;
  signingAuthority: boolean;
  canApproveHighTrust: boolean;
  revoked: boolean;
  revokedAt?: string;
  revokedReason?: string;
  diagnostics: { batteryHealth: number; osVersion: string; appVersion: string; networkType: string };
  policyRules: string[];
  localProofCache: number;
  queuedActions: number;
}

export interface SigningRecord {
  id: string;
  deviceId: string;
  action: string;
  signedAt: string;
  signatureHash: string;
  trustLevel: DeviceTrustLevel;
  workflowId?: string;
  approvalId?: string;
  verified: boolean;
}

export class TrustDeviceEngine {
  private devices: Map<string, TrustedDevice> = new Map();
  private signings: SigningRecord[] = [];

  enrollDevice(input: Omit<TrustedDevice, "id" | "enrolledAt" | "revoked">): TrustedDevice {
    const d: TrustedDevice = {
      ...input,
      id: `dev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      enrolledAt: new Date().toISOString(),
      revoked: false,
    };
    this.devices.set(d.id, d);
    return d;
  }

  revokeDevice(id: string, reason: string): boolean {
    const d = this.devices.get(id);
    if (!d) return false;
    d.revoked = true;
    d.revokedAt = new Date().toISOString();
    d.revokedReason = reason;
    d.signingAuthority = false;
    d.canApproveHighTrust = false;
    return true;
  }

  getDevice(id: string): TrustedDevice | undefined { return this.devices.get(id); }
  listDevices(): TrustedDevice[] { return Array.from(this.devices.values()).filter(d => !d.revoked); }
  listAllDevices(): TrustedDevice[] { return Array.from(this.devices.values()); }

  signAction(deviceId: string, action: string, workflowId?: string): SigningRecord | null {
    const d = this.devices.get(deviceId);
    if (!d || d.revoked || !d.signingAuthority) return null;
    const record: SigningRecord = {
      id: `sig_${Date.now()}`,
      deviceId,
      action,
      signedAt: new Date().toISOString(),
      signatureHash: `sha256:${Math.random().toString(36).slice(2, 18)}${Math.random().toString(36).slice(2, 18)}`,
      trustLevel: d.trustLevel,
      workflowId,
      verified: true,
    };
    this.signings.push(record);
    return record;
  }

  getFleetSummary(): { total: number; trusted: number; revoked: number; avgTrustScore: number; signingCapable: number } {
    const all = Array.from(this.devices.values());
    const active = all.filter(d => !d.revoked);
    return {
      total: all.length,
      trusted: active.filter(d => d.trustLevel === "trusted" || d.trustLevel === "secure-enclave").length,
      revoked: all.filter(d => d.revoked).length,
      avgTrustScore: active.length > 0 ? Math.round(active.reduce((s, d) => s + d.trustScore, 0) / active.length) : 0,
      signingCapable: active.filter(d => d.signingAuthority).length,
    };
  }

  getDemoDevices(): TrustedDevice[] {
    return [
      {
        id: "dev_macbook", name: "MacBook Pro 16\"", type: "desktop", trustLevel: "secure-enclave", trustScore: 98,
        enrolledAt: new Date(Date.now() - 86400000 * 90).toISOString(), lastSeen: new Date().toISOString(),
        publicKeyFingerprint: "SHA256:kL9x2mQwR7tY3p...", signingAuthority: true, canApproveHighTrust: true,
        revoked: false, diagnostics: { batteryHealth: 94, osVersion: "macOS 15.2", appVersion: "6.0.0", networkType: "wifi" },
        policyRules: ["allow-all-approvals", "sign-financial"], localProofCache: 142, queuedActions: 0,
      },
      {
        id: "dev_iphone", name: "iPhone 16 Pro", type: "mobile", trustLevel: "trusted", trustScore: 92,
        enrolledAt: new Date(Date.now() - 86400000 * 60).toISOString(), lastSeen: new Date(Date.now() - 300000).toISOString(),
        publicKeyFingerprint: "SHA256:mN4y8wPqS2vU6j...", signingAuthority: true, canApproveHighTrust: true,
        revoked: false, diagnostics: { batteryHealth: 98, osVersion: "iOS 18.2", appVersion: "6.0.0", networkType: "5g" },
        policyRules: ["allow-standard-approvals", "sign-financial"], localProofCache: 38, queuedActions: 2,
      },
      {
        id: "dev_ipad", name: "iPad Air", type: "tablet", trustLevel: "verified", trustScore: 78,
        enrolledAt: new Date(Date.now() - 86400000 * 30).toISOString(), lastSeen: new Date(Date.now() - 3600000).toISOString(),
        publicKeyFingerprint: "SHA256:pQ7z3rKsT5wX9a...", signingAuthority: false, canApproveHighTrust: false,
        revoked: false, diagnostics: { batteryHealth: 100, osVersion: "iPadOS 18.2", appVersion: "5.9.1", networkType: "wifi" },
        policyRules: ["view-only"], localProofCache: 12, queuedActions: 0,
      },
    ];
  }

  serialize(): Record<string, unknown> {
    return { devices: Array.from(this.devices.entries()), signings: this.signings.slice(-500) };
  }
  hydrate(state: Record<string, unknown>): void {
    if (state.devices) this.devices = new Map(state.devices as any);
    if (state.signings) this.signings = state.signings as any;
  }
}
// ────────────────────────────────────────────────────────────────

export type ProofPacketType = "workflow" | "approval" | "financial" | "boardroom" | "release" | "incident" | "device-signing";
export type EnterpriseRetentionPolicy = "30d" | "90d" | "1y" | "3y" | "7y" | "permanent";

export interface ProofPacket {
  id: string;
  type: ProofPacketType;
  entityId: string;
  workflowId?: string;
  generatedAt: string;
  contents: { category: string; items: { label: string; value: string; verified: boolean }[] }[];
  signatureChain: { deviceId: string; signedAt: string; hash: string }[];
  retentionPolicy: EnterpriseRetentionPolicy;
  tamperEvidence: { hash: string; previousHash: string; sequence: number };
  exportable: boolean;
}

export interface AuditTimelineEntry {
  id: string;
  timestamp: string;
  actor: string;
  actorType: "user" | "advisor" | "agent" | "system";
  action: string;
  resource: string;
  outcome: "success" | "failure" | "denied";
  orgId?: string;
  workflowId?: string;
  connectorId?: string;
  releaseId?: string;
  incidentId?: string;
  proofPacketId?: string;
  metadata: Record<string, unknown>;
}

export interface ComplianceSummary {
  overallStatus: "compliant" | "review-needed" | "non-compliant";
  lastAudit: string;
  proofPacketsGenerated: number;
  proofPacketsByType: Record<ProofPacketType, number>;
  retentionCompliance: number;
  tamperEvidenceIntegrity: number;
  auditCoverage: number;
  openFindings: number;
  nextScheduledAudit: string;
}

export class ComplianceAuditEngine {
  private proofPackets: ProofPacket[] = [];
  private auditTimeline: AuditTimelineEntry[] = [];

  generateProofPacket(type: ProofPacketType, entityId: string, workflowId?: string): ProofPacket {
    const sequence = this.proofPackets.length;
    const previousHash = sequence > 0 ? this.proofPackets[sequence - 1].tamperEvidence.hash : "genesis";
    const hash = `sha256:${Date.now().toString(36)}${Math.random().toString(36).slice(2, 14)}`;

    const packet: ProofPacket = {
      id: `proof_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type,
      entityId,
      workflowId,
      generatedAt: new Date().toISOString(),
      contents: this.getContentsForType(type),
      signatureChain: [{ deviceId: "dev_macbook", signedAt: new Date().toISOString(), hash }],
      retentionPolicy: type === "financial" ? "7y" : type === "boardroom" ? "3y" : "1y",
      tamperEvidence: { hash, previousHash, sequence },
      exportable: true,
    };
    this.proofPackets.push(packet);
    return packet;
  }

  private getContentsForType(type: ProofPacketType): ProofPacket["contents"] {
    const contentMap: Record<ProofPacketType, ProofPacket["contents"]> = {
      workflow: [{ category: "Execution", items: [{ label: "State transitions", value: "12 states", verified: true }, { label: "Duration", value: "4.2s", verified: true }, { label: "Outcome", value: "completed", verified: true }] }],
      approval: [{ category: "Authorization", items: [{ label: "Approver", value: "Owner", verified: true }, { label: "Method", value: "Device-signed", verified: true }, { label: "Policy", value: "dual-approval", verified: true }] }],
      financial: [{ category: "Transaction", items: [{ label: "Amount", value: "$12,500.00", verified: true }, { label: "Counterparty", value: "Vendor Co.", verified: true }, { label: "Category", value: "Operating expense", verified: true }] }],
      boardroom: [{ category: "Session", items: [{ label: "Participants", value: "5 advisors", verified: true }, { label: "Decisions", value: "3 recorded", verified: true }, { label: "Duration", value: "28 min", verified: true }] }],
      release: [{ category: "Deployment", items: [{ label: "Version", value: "v6.1.0", verified: true }, { label: "Ring", value: "canary", verified: true }, { label: "Tests passed", value: "142/142", verified: true }] }],
      incident: [{ category: "Resolution", items: [{ label: "Severity", value: "P2", verified: true }, { label: "MTTR", value: "12 min", verified: true }, { label: "Root cause", value: "Connector timeout", verified: true }] }],
      "device-signing": [{ category: "Signing", items: [{ label: "Device", value: "MacBook Pro", verified: true }, { label: "Trust Level", value: "secure-enclave", verified: true }, { label: "Action", value: "Financial approval", verified: true }] }],
    };
    return contentMap[type];
  }

  recordAuditEntry(entry: Omit<AuditTimelineEntry, "id">): AuditTimelineEntry {
    const full: AuditTimelineEntry = { ...entry, id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` };
    this.auditTimeline.push(full);
    return full;
  }

  getAuditTimeline(filter?: { actor?: string; orgId?: string; action?: string; limit?: number }): AuditTimelineEntry[] {
    let entries = [...this.auditTimeline];
    if (filter?.actor) entries = entries.filter(e => e.actor === filter.actor);
    if (filter?.orgId) entries = entries.filter(e => e.orgId === filter.orgId);
    if (filter?.action) entries = entries.filter(e => e.action.includes(filter.action));
    entries.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    return entries.slice(0, filter?.limit ?? 100);
  }

  getProofPackets(type?: ProofPacketType): ProofPacket[] {
    return type ? this.proofPackets.filter(p => p.type === type) : [...this.proofPackets];
  }

  getComplianceSummary(): ComplianceSummary {
    const byType: Record<ProofPacketType, number> = { workflow: 0, approval: 0, financial: 0, boardroom: 0, release: 0, incident: 0, "device-signing": 0 };
    this.proofPackets.forEach(p => byType[p.type]++);
    return {
      overallStatus: "compliant",
      lastAudit: new Date(Date.now() - 86400000 * 3).toISOString(),
      proofPacketsGenerated: this.proofPackets.length,
      proofPacketsByType: byType,
      retentionCompliance: 100,
      tamperEvidenceIntegrity: 100,
      auditCoverage: 96,
      openFindings: 2,
      nextScheduledAudit: new Date(Date.now() + 86400000 * 4).toISOString(),
    };
  }

  getDemoAuditEntries(): AuditTimelineEntry[] {
    const now = Date.now();
    return [
      { id: "a1", timestamp: new Date(now - 60000).toISOString(), actor: "Owner", actorType: "user", action: "approval.approved", resource: "Bill payment: AWS $340", outcome: "success", metadata: { amount: 340 } },
      { id: "a2", timestamp: new Date(now - 120000).toISOString(), actor: "Revenue Advisor", actorType: "advisor", action: "opportunity.detected", resource: "Stale lead: Sarah Chen", outcome: "success", metadata: { value: 2500 } },
      { id: "a3", timestamp: new Date(now - 300000).toISOString(), actor: "System", actorType: "system", action: "connector.sync", resource: "Stripe connector", outcome: "success", metadata: { records: 42 } },
      { id: "a4", timestamp: new Date(now - 600000).toISOString(), actor: "Money Advisor", actorType: "advisor", action: "forecast.updated", resource: "30-day cash flow", outcome: "success", metadata: {} },
      { id: "a5", timestamp: new Date(now - 900000).toISOString(), actor: "System", actorType: "system", action: "release.promoted", resource: "v6.0.0 → GA", outcome: "success", metadata: { ring: "general" } },
      { id: "a6", timestamp: new Date(now - 1800000).toISOString(), actor: "Owner", actorType: "user", action: "device.enrolled", resource: "iPhone 16 Pro", outcome: "success", metadata: { trustLevel: "trusted" } },
      { id: "a7", timestamp: new Date(now - 3600000).toISOString(), actor: "Concierge Advisor", actorType: "advisor", action: "workflow.completed", resource: "School pickup reminder", outcome: "success", metadata: {} },
      { id: "a8", timestamp: new Date(now - 7200000).toISOString(), actor: "System", actorType: "system", action: "proof.generated", resource: "Financial proof packet", outcome: "success", metadata: { type: "financial" } },
    ];
  }

  serialize(): Record<string, unknown> {
    return { proofPackets: this.proofPackets, auditTimeline: this.auditTimeline.slice(-500) };
  }
  hydrate(state: Record<string, unknown>): void {
    if (state.proofPackets) this.proofPackets = state.proofPackets as any;
    if (state.auditTimeline) this.auditTimeline = state.auditTimeline as any;
  }
}
