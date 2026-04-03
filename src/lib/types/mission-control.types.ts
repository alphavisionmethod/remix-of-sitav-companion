// ═══════════════════════════════════════════════════════════════
// SITA OS — Mission Control View Models & Typed Contracts
// Shared across Owner Mode + Advanced Ops surfaces
// ═══════════════════════════════════════════════════════════════

// ── System Health ───────────────────────────────────────────────
export type SystemHealthStatus = "healthy" | "warning" | "critical" | "degraded" | "paused";
export type TrustPosture = "verified" | "review" | "degraded" | "compromised";
export type ControlMode = "owner" | "advanced";

export interface MissionControlSummaryView {
  systemScore: number;
  status: SystemHealthStatus;
  trustPosture: TrustPosture;
  agentsSummary: { total: number; healthy: number; degraded: number; paused: number; error: number };
  incidentsSummary: { open: number; critical: number; total: number };
  connectorsSummary: { total: number; connected: number; degraded: number; disconnected: number; avgHealth: number };
  workflowsSummary: { total: number; running: number; stuck: number; failed: number };
  costSummary: { tokensToday: number; costToday: number; budget: number; utilization: number };
  releaseSummary: { currentVersion: string; ringStatus: string; canaryHealth: number };
  safeModeActive: boolean;
  lastUpdated: string;
}

// ── What Matters Now — Founder Panel ────────────────────────────
export type UrgencyLevel = "critical" | "high" | "medium" | "low" | "info";
export interface WhatMattersItem {
  id: string;
  title: string;
  description: string;
  urgency: UrgencyLevel;
  domain: "incidents" | "costs" | "trust" | "connectors" | "workflows" | "releases" | "approvals";
  actionLabel?: string;
  actionRoute?: string;
  timestamp: string;
}

// ── Connector Views ─────────────────────────────────────────────
export type ConnectorStatus = "connected" | "degraded" | "disconnected" | "error" | "paused";
export interface ConnectorSummaryView {
  id: string;
  name: string;
  status: ConnectorStatus;
  healthScore: number;
  authState: "valid" | "expiring" | "expired" | "none";
  lastSync: string;
  errorRate: number;
  latencyMs: number;
  trustScore: number;
  affectedWorkflows: number;
  recommendation?: string;
}

export interface ConnectorDetailView extends ConnectorSummaryView {
  scopes: string[];
  environment: "sandbox" | "live";
  retryQueue: number;
  recentFailures: ConnectorLogEntry[];
  associatedIncidents: string[];
  syncQuality: number;
  uptimePercent: number;
}

export interface ConnectorHealthView {
  connectorId: string;
  latencyP50: number;
  latencyP99: number;
  retryQueueDepth: number;
  syncFailureRate: number;
  authExpiresIn: string | null;
  idempotencyIssues: number;
  timeoutPatterns: { hour: number; count: number }[];
  degradationTrend: "improving" | "stable" | "worsening";
  trustWarnings: string[];
}

export interface ConnectorLogEntry {
  id: string;
  timestamp: string;
  type: "auth" | "sync" | "retry" | "failure" | "verification" | "execution";
  message: string;
  severity: "info" | "warning" | "error";
  correlationId?: string;
  incidentId?: string;
}

// ── Incident Views ──────────────────────────────────────────────
export type IncidentSeverity = "critical" | "high" | "medium" | "low";
export type IncidentStatus = "open" | "investigating" | "mitigating" | "resolved";

export interface IncidentSummaryView {
  id: string;
  title: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  affectedModules: string[];
  trustImpact: "none" | "minor" | "significant" | "critical";
  recoveryStatus: string;
  createdAt: string;
  ttc?: string; // time to containment
}

export interface IncidentDetailView extends IncidentSummaryView {
  timeline: { time: string; event: string; actor: string }[];
  rootCauseHypothesis: string;
  impactedUsers: number;
  relatedReleases: string[];
  relatedConnectors: string[];
  relatedWorkflows: string[];
  mitigationActions: { label: string; status: "pending" | "in_progress" | "done" }[];
  rollbackCandidates: { id: string; label: string; risk: "low" | "medium" | "high" }[];
  resolutionSummary?: string;
}

// ── Trust Views ─────────────────────────────────────────────────
export interface TrustSummaryView {
  posture: TrustPosture;
  approvalHealth: "clean" | "delayed" | "stalled";
  policyConfidence: number;
  verificationHealth: number;
  rollbackReadiness: number;
  proofCompleteness: number;
  uncertaintyExposure: number;
  sensitiveWorkflows: number;
  trustIncidents: number;
  lastAudit: string;
}

// ── Cost Views ──────────────────────────────────────────────────
export interface FounderCostSummaryView {
  totalTokensToday: number;
  totalCostToday: number;
  dailyBudget: number;
  budgetUtilization: number;
  anomalyCount: number;
  topSpenders: { name: string; tokens: number; cost: number; invocations: number }[];
  byModule: { module: string; tokens: number; cost: number }[];
  byConnector: { connector: string; tokens: number; cost: number }[];
  forecast: { day: string; projected: number; budget: number }[];
  recommendations: string[];
}

// ── Recovery Views ──────────────────────────────────────────────
export interface RecoverySummaryView {
  failedWorkflows: number;
  stuckWorkflows: number;
  degradedServices: number;
  unresolvedPostconditions: number;
  replayQueue: number;
  rollbackQueue: number;
  items: RecoveryItem[];
}

export interface RecoveryItem {
  id: string;
  workflowName: string;
  status: "stuck" | "failed" | "degraded";
  stuckSince: string;
  suggestedAction: "retry" | "rollback" | "escalate" | "manual";
  domain: string;
  impact: string;
}

// ── Release Views ───────────────────────────────────────────────
export interface ReleaseSummaryView {
  currentVersion: string;
  canaryHealth: number;
  rolloutPercent: number;
  ringStatus: { ring: string; version: string; health: number; status: string }[];
  rollbackCandidates: string[];
  unstableModules: string[];
  trustWarnings: string[];
  latestDeployments: { version: string; when: string; ring: string; status: string }[];
  releaseNotes: string;
}

// ── Permission Views ────────────────────────────────────────────
export interface PermissionMatrixView {
  advisors: PermissionEntry[];
  agents: PermissionEntry[];
  lastChanged: { entity: string; change: string; when: string }[];
  riskyChanges: string[];
}

export interface PermissionEntry {
  name: string;
  level: string;
  allowedActions: string[];
  blockedActions: string[];
  memoryScope: string;
}

// ── Policy Simulation ───────────────────────────────────────────
export interface PolicySimulationView {
  scenarios: PolicyScenario[];
  results: PolicySimulationResult[];
}

export interface PolicyScenario {
  id: string;
  domain: string;
  capabilityId: string;
  riskTier: "low" | "medium" | "high" | "critical";
  amount?: number;
  isSimulation?: boolean;
}

export interface PolicySimulationResult {
  scenarioId: string;
  label: string;
  effect: "allow" | "deny" | "escalate" | "simulate";
  trustImpact: string;
  connectorImpact: string;
  executionImpact: string;
  rollbackRisk: "low" | "medium" | "high";
  confidence: number;
  notes: string[];
}

// ── AI Team Views ───────────────────────────────────────────────
export interface AITeamSummaryView {
  totalAgents: number;
  healthyCount: number;
  degradedCount: number;
  pausedCount: number;
  totalTokens24h: number;
  totalInvocations24h: number;
  stuckTasks: number;
  governanceState: "compliant" | "warning" | "violation";
  pods: AIPodView[];
}

export interface AIPodView {
  name: string;
  agents: AIAgentView[];
}

export interface AIAgentView {
  id: string;
  name: string;
  role: string;
  health: SystemHealthStatus;
  autonomyLevel: string;
  tokens24h: number;
  invocations24h: number;
  currentTasks: string[];
  recentFindings: string[];
  lastAction: string;
}

// ── Pack Views ──────────────────────────────────────────────────
export interface PackSummaryView {
  id: string;
  name: string;
  status: "active" | "disabled" | "draft";
  trustLevel: "verified" | "standard" | "unverified";
  permissions: string[];
  revenueContribution: number;
  usage: number;
  publicationState: "published" | "unpublished" | "review";
}

// ── Diagnostics Views ───────────────────────────────────────────
export interface DiagnosticsSummaryView {
  recentFailures: number;
  affectedModules: string[];
  connectorTimeouts: number;
  authAnomalies: number;
  releaseLinkedFailures: number;
  correlationIds: string[];
  exportReady: boolean;
}

// ── Activity Feed ───────────────────────────────────────────────
export interface SystemActivityEntry {
  id: string;
  timestamp: string;
  type: "advisor" | "agent" | "connector" | "workflow" | "policy" | "release" | "trust" | "cost" | "approval";
  event: string;
  severity: "info" | "success" | "warning" | "error";
  domain?: string;
  actor?: string;
}
