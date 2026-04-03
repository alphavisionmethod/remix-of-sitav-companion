// ═══════════════════════════════════════════════════════════════
// SITA OS — Approval Requests Service
// Creates/manages ApprovalRequest lifecycle
// ═══════════════════════════════════════════════════════════════

import type { ApprovalRequest, ApprovalStatus, ApprovalDecision } from "@/packages/contracts";

const store = new Map<string, ApprovalRequest>();

export function createApprovalRequest(params: {
  actionId: string;
  actionType: string;
  requestedBy: string;
  context: Record<string, unknown>;
  requiredApprovers: number;
  expiresInMinutes?: number;
}): ApprovalRequest {
  const now = new Date();
  const request: ApprovalRequest = {
    id: crypto.randomUUID(),
    actionId: params.actionId,
    actionType: params.actionType,
    requestedBy: params.requestedBy,
    requestedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + (params.expiresInMinutes || 60) * 60000).toISOString(),
    context: params.context,
    requiredApprovers: params.requiredApprovers,
    currentApprovals: [],
    status: "pending",
  };
  store.set(request.id, request);
  return request;
}

export function addDecision(requestId: string, decision: ApprovalDecision): ApprovalRequest | null {
  const request = store.get(requestId);
  if (!request || request.status !== "pending") return null;

  // Check expiry
  if (new Date(request.expiresAt) < new Date()) {
    request.status = "expired";
    return request;
  }

  // Prevent duplicate approvals from same approver
  if (request.currentApprovals.some((a) => a.approverId === decision.approverId)) return request;

  request.currentApprovals.push(decision);

  if (decision.decision === "reject") {
    request.status = "rejected";
  } else if (request.currentApprovals.filter((a) => a.decision === "approve").length >= request.requiredApprovers) {
    request.status = "approved";
  }

  return request;
}

export function getRequest(id: string): ApprovalRequest | undefined {
  return store.get(id);
}

export function listPending(userId?: string): ApprovalRequest[] {
  const all = Array.from(store.values()).filter((r) => r.status === "pending");
  return userId ? all.filter((r) => r.requestedBy === userId) : all;
}

export function updateStatus(id: string, status: ApprovalStatus): boolean {
  const r = store.get(id);
  if (!r) return false;
  r.status = status;
  return true;
}

export function expireStale(): number {
  const now = new Date();
  let count = 0;
  store.forEach((r) => {
    if (r.status === "pending" && new Date(r.expiresAt) < now) {
      r.status = "expired";
      count++;
    }
  });
  return count;
}
