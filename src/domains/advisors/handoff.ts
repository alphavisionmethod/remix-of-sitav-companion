// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Handoff Protocol
// Formal context transfer between advisors when autonomy ceiling
// is reached or cross-domain coordination is required
// ═══════════════════════════════════════════════════════════════

import type { AdvisorDefinition } from "./index";

// ── Types ────────────────────────────────────────────────────

export type HandoffReason =
  | "autonomy-ceiling-reached"
  | "cross-domain-required"
  | "specialist-needed"
  | "confidence-below-threshold"
  | "policy-requires-escalation"
  | "user-requested-transfer";

export type HandoffUrgency = "low" | "standard" | "high" | "critical";

export type HandoffStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "expired"
  | "completed";

export interface HandoffContextPayload {
  /** Summary of work done so far */
  workSummary: string;
  /** Memory keys the source advisor was using */
  memoryKeys: string[];
  /** Active recommendation IDs being worked on */
  activeRecommendationIds: string[];
  /** Relevant entity IDs (customers, accounts, tasks) */
  entityIds: string[];
  /** Confidence at time of handoff */
  confidenceAtHandoff: number;
  /** What the source advisor believes should happen next */
  suggestedNextAction: string;
  /** Any constraints or warnings */
  constraints: string[];
  /** Proof chain reference for continuity */
  proofChainRef: string;
}

export interface HandoffRequest {
  id: string;
  sourceAdvisorId: string;
  targetAdvisorId: string;
  reason: HandoffReason;
  urgency: HandoffUrgency;
  context: HandoffContextPayload;
  requestedAt: string;
  expiresAt: string;
  tenantId: string;
}

export interface HandoffResult {
  requestId: string;
  status: HandoffStatus;
  acceptedBy: string | null;
  contextReceived: boolean;
  proofId: string;
  responseAt: string;
  rejectionReason?: string;
  /** Source advisor transitions to monitoring mode */
  sourceMonitoring: boolean;
}

export interface HandoffRecord {
  request: HandoffRequest;
  result: HandoffResult | null;
  createdAt: string;
}

// ── Handoff Registry ─────────────────────────────────────────

const handoffHistory: HandoffRecord[] = [];

// ── Handoff Target Validation ────────────────────────────────

/**
 * Maps advisor IDs to their valid handoff targets.
 * Handoff is only allowed to advisors with overlapping or
 * adjacent domain scope.
 */
const HANDOFF_TARGET_MAP: Record<string, string[]> = {
  "chief-of-staff":       ["business-lead", "money-lead", "family-lead", "concierge-lead", "risk-officer", "growth-strategist"],
  "business-lead":        ["chief-of-staff", "money-lead", "revenue-analyst", "crm-specialist", "growth-strategist"],
  "money-lead":           ["chief-of-staff", "business-lead", "investment-analyst", "tax-strategist", "family-lead"],
  "family-lead":          ["chief-of-staff", "concierge-lead", "money-lead", "wellness-advisor"],
  "concierge-lead":       ["chief-of-staff", "family-lead", "household-coordinator"],
  "growth-strategist":    ["chief-of-staff", "business-lead", "revenue-analyst"],
  "risk-officer":         ["chief-of-staff", "trust-policy-advisor", "money-lead"],
  "revenue-analyst":      ["business-lead", "money-lead", "crm-specialist"],
  "crm-specialist":       ["business-lead", "revenue-analyst"],
  "investment-analyst":   ["money-lead", "tax-strategist", "risk-officer"],
  "tax-strategist":       ["money-lead", "investment-analyst"],
  "household-coordinator":["concierge-lead", "family-lead"],
  "wellness-advisor":     ["family-lead", "concierge-lead"],
  "trust-policy-advisor": ["chief-of-staff", "risk-officer"],
};

function getHandoffTargets(advisorId: string): string[] {
  return HANDOFF_TARGET_MAP[advisorId] || [];
}

function isValidHandoffTarget(sourceId: string, targetId: string): boolean {
  const targets = getHandoffTargets(sourceId);
  return targets.includes(targetId);
}

// ── Expiration Logic ─────────────────────────────────────────

function computeExpiration(urgency: HandoffUrgency): string {
  const now = Date.now();
  const ttlMs: Record<HandoffUrgency, number> = {
    low: 30 * 60_000,       // 30 min
    standard: 15 * 60_000,  // 15 min
    high: 5 * 60_000,       // 5 min
    critical: 60_000,       // 1 min
  };
  return new Date(now + ttlMs[urgency]).toISOString();
}

// ── Core Protocol ────────────────────────────────────────────

/**
 * Initiate a handoff from source advisor to target advisor.
 * Validates that the target is a legal handoff destination,
 * builds the request, and queues it.
 */
export function initiateHandoff(params: {
  sourceAdvisorId: string;
  targetAdvisorId: string;
  reason: HandoffReason;
  urgency: HandoffUrgency;
  context: HandoffContextPayload;
  tenantId: string;
}): { success: true; request: HandoffRequest } | { success: false; error: string } {
  // Validate target is reachable
  if (!isValidHandoffTarget(params.sourceAdvisorId, params.targetAdvisorId)) {
    return {
      success: false,
      error: `Handoff from ${params.sourceAdvisorId} to ${params.targetAdvisorId} is not permitted. Valid targets: ${getHandoffTargets(params.sourceAdvisorId).join(", ")}`,
    };
  }

  // Validate context completeness
  if (!params.context.memoryKeys.length) {
    return { success: false, error: "Handoff context must include at least one memory key" };
  }

  if (params.context.confidenceAtHandoff < 0 || params.context.confidenceAtHandoff > 100) {
    return { success: false, error: "Confidence must be 0-100" };
  }

  const request: HandoffRequest = {
    id: crypto.randomUUID(),
    sourceAdvisorId: params.sourceAdvisorId,
    targetAdvisorId: params.targetAdvisorId,
    reason: params.reason,
    urgency: params.urgency,
    context: params.context,
    requestedAt: new Date().toISOString(),
    expiresAt: computeExpiration(params.urgency),
    tenantId: params.tenantId,
  };

  handoffHistory.push({ request, result: null, createdAt: request.requestedAt });
  return { success: true, request };
}

/**
 * Target advisor accepts a handoff request.
 * Context is marked as received and source transitions to monitoring.
 */
export function acceptHandoff(params: {
  requestId: string;
  acceptingAdvisorId: string;
}): HandoffResult {
  const record = handoffHistory.find(h => h.request.id === params.requestId);
  if (!record) throw new Error(`Handoff ${params.requestId} not found`);
  if (record.result) throw new Error(`Handoff ${params.requestId} already resolved`);

  // Check expiration
  const expired = new Date(record.request.expiresAt).getTime() < Date.now();

  const result: HandoffResult = {
    requestId: params.requestId,
    status: expired ? "expired" : "accepted",
    acceptedBy: expired ? null : params.acceptingAdvisorId,
    contextReceived: !expired,
    proofId: crypto.randomUUID(),
    responseAt: new Date().toISOString(),
    sourceMonitoring: !expired,
  };

  record.result = result;
  return result;
}

/**
 * Target advisor rejects a handoff request.
 * Rejection reason is recorded; upstream should trigger escalation.
 */
export function rejectHandoff(params: {
  requestId: string;
  rejectingAdvisorId: string;
  reason: string;
}): HandoffResult {
  const record = handoffHistory.find(h => h.request.id === params.requestId);
  if (!record) throw new Error(`Handoff ${params.requestId} not found`);
  if (record.result) throw new Error(`Handoff ${params.requestId} already resolved`);

  const result: HandoffResult = {
    requestId: params.requestId,
    status: "rejected",
    acceptedBy: null,
    contextReceived: false,
    proofId: crypto.randomUUID(),
    responseAt: new Date().toISOString(),
    rejectionReason: params.reason,
    sourceMonitoring: false,
  };

  record.result = result;
  return result;
}

/**
 * Mark a handoff as completed after target advisor finishes the work.
 */
export function completeHandoff(requestId: string): void {
  const record = handoffHistory.find(h => h.request.id === requestId);
  if (!record?.result) throw new Error(`Handoff ${requestId} not accepted yet`);
  record.result.status = "completed";
  record.result.sourceMonitoring = false;
}

// ── Queries ──────────────────────────────────────────────────

export function getHandoffHistory(): HandoffRecord[] {
  return [...handoffHistory];
}

export function getPendingHandoffs(advisorId: string): HandoffRecord[] {
  return handoffHistory.filter(
    h => h.request.targetAdvisorId === advisorId && !h.result
  );
}

export function getActiveMonitoringHandoffs(advisorId: string): HandoffRecord[] {
  return handoffHistory.filter(
    h => h.request.sourceAdvisorId === advisorId &&
         h.result?.status === "accepted" &&
         h.result.sourceMonitoring
  );
}

export function getValidHandoffTargets(advisorId: string): string[] {
  return getHandoffTargets(advisorId);
}
