// ═══════════════════════════════════════════════════════════════
// SITA OS — Admin View Models: Complete typed contracts
// Used by Owner Mode, Owner Workspace, Mission Ops, Global Tools
// ═══════════════════════════════════════════════════════════════

import type {
  SystemHealthStatus, TrustPosture, MissionControlSummaryView,
  WhatMattersItem, ConnectorSummaryView, IncidentSummaryView,
  TrustSummaryView, FounderCostSummaryView, RecoverySummaryView,
  ReleaseSummaryView, AITeamSummaryView, DiagnosticsSummaryView,
  SystemActivityEntry, PermissionMatrixView, PackSummaryView,
} from "./mission-control.types";

// ── Owner Mode (Layer 1) ────────────────────────────────────────
export interface OwnerModeView {
  summary: MissionControlSummaryView;
  whatMattersNow: WhatMattersItem[];
  revenue: RevenueSummaryView;
  cost: FounderCostSummaryView;
  risk: RiskSummaryView;
  trust: TrustSummaryView;
  health: HealthSummaryView;
  connectors: ConnectorSummaryView[];
  incidents: IncidentSummaryView[];
  aiTeam: AITeamSummaryView;
  maturity: PlatformMaturityView;
  rollout: RolloutStateView;
}

// ── Revenue ─────────────────────────────────────────────────────
export interface RevenueSummaryView {
  monthlyRevenue: number;
  annualRunRate: number;
  pipelineValue: number;
  pipelineDeals: number;
  churnRisk: number;
  churnAccounts: number;
  trend: "up" | "flat" | "down";
  growthPercent: number;
  bySegment: { segment: string; revenue: number; growth: number }[];
  topCustomers: { name: string; revenue: number; health: string }[];
}

// ── Risk ────────────────────────────────────────────────────────
export interface RiskSummaryView {
  openIncidents: number;
  criticalIncidents: number;
  stuckWorkflows: number;
  degradedServices: number;
  exposedPII: number;
  silentPolicyWidening: number;
  riskScore: number;
  topRisks: { label: string; severity: "critical" | "high" | "medium"; domain: string }[];
}

// ── Health ───────────────────────────────────────────────────────
export interface HealthSummaryView {
  overallScore: number;
  status: SystemHealthStatus;
  byModule: ModuleHealthView[];
  degradationPatterns: { module: string; trend: "improving" | "stable" | "worsening"; since: string }[];
}

export interface ModuleHealthView {
  name: string;
  score: number;
  status: SystemHealthStatus;
  latencyMs: number;
  errorRate: number;
  uptime: number;
  lastIncident?: string;
}

// ── Rollout ─────────────────────────────────────────────────────
export interface RolloutStateView {
  currentVersion: string;
  targetVersion: string;
  strategy: "canary" | "ring" | "blue-green" | "immediate";
  rolloutPercent: number;
  canaryHealth: number;
  rings: RingView[];
  rollbackAvailable: boolean;
  rollbackTarget?: string;
  safeModeActive: boolean;
  lastDeploy: string;
}

export interface RingView {
  ring: number;
  name: string;
  version: string;
  health: number;
  userPercent: number;
  status: "stable" | "deploying" | "rolled-back" | "canary";
}

// ── Platform Maturity ───────────────────────────────────────────
export interface PlatformMaturityView {
  overallScore: number;
  areas: { area: string; score: number; status: "production" | "beta" | "alpha" | "planned"; blockers: string[] }[];
  readinessGates: { gate: string; passed: boolean; details: string }[];
}

// ── Proof Ledger ────────────────────────────────────────────────
export interface ProofLedgerView {
  totalReceipts: number;
  verifiedPercent: number;
  pendingVerification: number;
  chainIntegrity: "intact" | "broken" | "degraded";
  recentReceipts: ProofReceiptView[];
}

export interface ProofReceiptView {
  id: string;
  type: "execution" | "approval" | "verification" | "rollback" | "policy-change";
  action: string;
  actor: string;
  timestamp: string;
  verified: boolean;
  chainPosition: number;
}

// ── Observability ───────────────────────────────────────────────
export interface ObservabilityView {
  services: ServiceReliabilityView[];
  connectorLatency: ConnectorLatencyView[];
  eventThroughput: { hour: number; count: number }[];
  anomalies: AnomalyView[];
  costOverlay: { service: string; cost: number; latency: number }[];
}

export interface ServiceReliabilityView {
  name: string;
  uptime: number;
  latencyP50: number;
  latencyP99: number;
  errorRate: number;
  throughput: number;
  status: SystemHealthStatus;
}

export interface ConnectorLatencyView {
  id: string;
  name: string;
  latencyP50: number;
  latencyP99: number;
  errorRate: number;
  health: number;
  status: string;
}

export interface AnomalyView {
  id: string;
  type: "latency-spike" | "error-burst" | "auth-anomaly" | "cost-anomaly";
  service: string;
  description: string;
  severity: "info" | "warning" | "critical";
  timestamp: string;
  correlationIds: string[];
}

// ── Users Admin ─────────────────────────────────────────────────
export interface UsersAdminView {
  totalUsers: number;
  byTier: { tier: string; count: number }[];
  supportFlags: number;
  pendingApprovals: number;
  users: UserRowView[];
}

export interface UserRowView {
  id: string;
  name: string;
  email: string;
  org: string;
  tier: "starter" | "professional" | "enterprise";
  trustState: "verified" | "review" | "new";
  connectorCount: number;
  incidentExposure: number;
  approvalBurden: number;
  supportFlags: number;
  lastActive: string;
}

// ── Workflow Replay ─────────────────────────────────────────────
export interface WorkflowReplayQueueView {
  failed: number;
  replayable: number;
  risky: number;
  inQueue: number;
  workflows: ReplayableWorkflowView[];
}

export interface ReplayableWorkflowView {
  id: string;
  name: string;
  domain: string;
  status: "replayable" | "failed" | "risky" | "completed";
  failedAt?: string;
  stuckReason?: string;
  replayCount: number;
  lastReplay?: string;
  riskLevel: "low" | "medium" | "high";
}

// ── Replay Safety ───────────────────────────────────────────────
export interface ReplaySafetyView {
  workflowId: string;
  safeToReplay: boolean;
  riskAssessment: "low" | "medium" | "high" | "critical";
  warnings: string[];
  requiredApprovals: string[];
  estimatedImpact: string;
  rollbackAvailable: boolean;
  simulationAvailable: boolean;
}

// ── High-Trust Action Models ────────────────────────────────────
export interface HighTrustAction<T = unknown> {
  id: string;
  type: "rollback" | "deploy" | "policy-change" | "connector-toggle" | "safe-mode" | "budget-change" | "permission-change";
  label: string;
  description: string;
  preview: T;
  affectedAreas: string[];
  trustImpact: "none" | "minor" | "significant" | "critical";
  rollbackAvailable: boolean;
  requiresApproval: boolean;
  requiresProof: boolean;
}

export interface ActionPreviewResult {
  approved: boolean;
  preview: Record<string, unknown>;
  affectedEntities: string[];
  estimatedDowntime?: string;
  costDelta?: number;
  trustDelta?: number;
}

export interface UndoAdminChangeView {
  recentChanges: AdminChangeView[];
  undoableCount: number;
}

export interface AdminChangeView {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  reversible: boolean;
  domain: string;
  description: string;
  impact: "low" | "medium" | "high";
}
