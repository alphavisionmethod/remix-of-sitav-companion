// ═══════════════════════════════════════════════════════════════
// SITA OS — Business Action Execution Pipeline
// Connects advisor recommendations to governed execution
// ═══════════════════════════════════════════════════════════════

export type ActionStatus = "proposed" | "simulated" | "approval-ready" | "approved" | "executing" | "completed" | "verified" | "rejected" | "rolled-back";

export interface BusinessAction {
  id: string;
  advisorId: string;
  advisorName: string;
  title: string;
  description: string;
  domain: string;
  status: ActionStatus;
  riskLevel: "low" | "medium" | "high" | "critical";
  estimatedImpact: string;
  estimatedValue: number;
  confidence: number;
  simulationResult: SimulationResult | null;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  executedAt: string | null;
  proofReceipt: ProofReceipt | null;
  rollbackAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SimulationResult {
  predictedOutcome: string;
  risks: string[];
  benefits: string[];
  affectedEntities: string[];
  reversible: boolean;
  confidenceInOutcome: number;
}

export interface ProofReceipt {
  id: string;
  actionId: string;
  advisorId: string;
  reason: string;
  sourceSignals: string[];
  result: string;
  timestamp: string;
}

// ── Action creation ────────────────────────────────────────────

export function createAction(params: {
  advisorId: string;
  advisorName: string;
  title: string;
  description: string;
  domain: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  estimatedImpact: string;
  estimatedValue: number;
  confidence: number;
}): BusinessAction {
  const now = new Date().toISOString();
  return {
    id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...params,
    status: "proposed",
    simulationResult: null,
    approvedBy: null,
    approvedAt: null,
    rejectedReason: null,
    executedAt: null,
    proofReceipt: null,
    rollbackAvailable: params.riskLevel !== "critical",
    createdAt: now,
    updatedAt: now,
  };
}

// ── State transitions ──────────────────────────────────────────

export function simulateAction(action: BusinessAction): BusinessAction {
  const simulation: SimulationResult = {
    predictedOutcome: `Executing "${action.title}" is expected to ${action.estimatedImpact}`,
    risks: action.riskLevel === "low" ? ["Minimal risk"] : [`${action.riskLevel} risk — monitor closely`],
    benefits: [`Estimated $${action.estimatedValue.toLocaleString()} impact`],
    affectedEntities: [action.domain],
    reversible: action.rollbackAvailable,
    confidenceInOutcome: action.confidence,
  };

  return { ...action, status: "simulated", simulationResult: simulation, updatedAt: new Date().toISOString() };
}

export function requestApproval(action: BusinessAction): BusinessAction {
  if (action.status !== "proposed" && action.status !== "simulated") return action;
  return { ...action, status: "approval-ready", updatedAt: new Date().toISOString() };
}

export function approveAction(action: BusinessAction, approver: string): BusinessAction {
  if (action.status !== "approval-ready") return action;
  return {
    ...action,
    status: "approved",
    approvedBy: approver,
    approvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function rejectAction(action: BusinessAction, reason: string): BusinessAction {
  return {
    ...action,
    status: "rejected",
    rejectedReason: reason,
    updatedAt: new Date().toISOString(),
  };
}

export function executeAction(action: BusinessAction): BusinessAction {
  if (action.status !== "approved") return action;
  const proof: ProofReceipt = {
    id: `proof-${Date.now()}`,
    actionId: action.id,
    advisorId: action.advisorId,
    reason: action.description,
    sourceSignals: [action.domain],
    result: "Executed successfully",
    timestamp: new Date().toISOString(),
  };

  return {
    ...action,
    status: "completed",
    executedAt: new Date().toISOString(),
    proofReceipt: proof,
    updatedAt: new Date().toISOString(),
  };
}

export function rollbackAction(action: BusinessAction): BusinessAction {
  if (!action.rollbackAvailable || action.status !== "completed") return action;
  return { ...action, status: "rolled-back", updatedAt: new Date().toISOString() };
}

// ── Queue helpers ──────────────────────────────────────────────

export function getActionsByStatus(queue: BusinessAction[], status: ActionStatus): BusinessAction[] {
  return queue.filter(a => a.status === status);
}

export function getPendingApprovals(queue: BusinessAction[]): BusinessAction[] {
  return queue.filter(a => a.status === "approval-ready");
}

export function getActionStats(queue: BusinessAction[]) {
  return {
    total: queue.length,
    proposed: queue.filter(a => a.status === "proposed").length,
    awaitingApproval: queue.filter(a => a.status === "approval-ready").length,
    approved: queue.filter(a => a.status === "approved").length,
    completed: queue.filter(a => a.status === "completed").length,
    rejected: queue.filter(a => a.status === "rejected").length,
    totalValue: queue.filter(a => a.status === "completed").reduce((s, a) => s + a.estimatedValue, 0),
  };
}
