// ═══════════════════════════════════════════════════════════════
// SITA OS — Approval Service
// Full approval lifecycle with dual-approval, expiry, escalation,
// delegation chains, and decision recording with proof
// ═══════════════════════════════════════════════════════════════

export type ApprovalStatus = "pending" | "approved" | "rejected" | "expired" | "escalated" | "delegated" | "cancelled";

export interface ApprovalRequest {
  id: string;
  correlationId: string;
  title: string;
  description: string;
  requestedBy: string;
  requestedAt: number;
  expiresAt: number;
  status: ApprovalStatus;
  domain: string;
  riskTier: "low" | "medium" | "high" | "critical";
  requiresDualApproval: boolean;
  approvers: string[];          // ordered list of required approvers
  decisions: ApprovalDecision[];
  context: Record<string, unknown>;
  policyRuleId?: string;
  linkedWorkflowId?: string;
  linkedEnvelopeId?: string;
  escalationTarget?: string;
  delegatedTo?: string;
  delegatedBy?: string;
  metadata?: Record<string, unknown>;
}

export interface ApprovalDecision {
  approver: string;
  decision: "approve" | "reject" | "delegate";
  reason?: string;
  timestamp: number;
  delegateTo?: string;
}

export interface ApprovalCreateInput {
  correlationId: string;
  title: string;
  description: string;
  requestedBy: string;
  domain: string;
  riskTier: "low" | "medium" | "high" | "critical";
  requiresDualApproval?: boolean;
  approvers: string[];
  context?: Record<string, unknown>;
  expiryHours?: number;
  policyRuleId?: string;
  linkedWorkflowId?: string;
  linkedEnvelopeId?: string;
  escalationTarget?: string;
}

export class ApprovalService {
  private requests: Map<string, ApprovalRequest> = new Map();

  /** Create a new approval request */
  create(input: ApprovalCreateInput): ApprovalRequest {
    const expiryHours = input.expiryHours ?? (input.riskTier === "critical" ? 4 : input.riskTier === "high" ? 12 : 24);

    const request: ApprovalRequest = {
      id: crypto.randomUUID(),
      correlationId: input.correlationId,
      title: input.title,
      description: input.description,
      requestedBy: input.requestedBy,
      requestedAt: Date.now(),
      expiresAt: Date.now() + expiryHours * 3600000,
      status: "pending",
      domain: input.domain,
      riskTier: input.riskTier,
      requiresDualApproval: input.requiresDualApproval ?? input.riskTier === "critical",
      approvers: input.approvers,
      decisions: [],
      context: input.context ?? {},
      policyRuleId: input.policyRuleId,
      linkedWorkflowId: input.linkedWorkflowId,
      linkedEnvelopeId: input.linkedEnvelopeId,
      escalationTarget: input.escalationTarget,
    };

    this.requests.set(request.id, request);
    return request;
  }

  /** Record a decision on an approval request */
  decide(requestId: string, approver: string, decision: "approve" | "reject" | "delegate", reason?: string, delegateTo?: string): ApprovalRequest | null {
    const request = this.requests.get(requestId);
    if (!request) return null;

    // Check if already resolved
    if (request.status !== "pending" && request.status !== "delegated") return null;

    // Check expiry
    if (Date.now() > request.expiresAt) {
      request.status = "expired";
      return request;
    }

    // Check if this approver is authorized
    const isAuthorized = request.approvers.includes(approver) ||
      (request.delegatedTo === approver);
    if (!isAuthorized) return null;

    const decisionRecord: ApprovalDecision = {
      approver,
      decision,
      reason,
      timestamp: Date.now(),
      delegateTo,
    };
    request.decisions.push(decisionRecord);

    if (decision === "reject") {
      request.status = "rejected";
    } else if (decision === "delegate") {
      request.status = "delegated";
      request.delegatedTo = delegateTo;
      request.delegatedBy = approver;
    } else if (decision === "approve") {
      if (request.requiresDualApproval) {
        const approveCount = request.decisions.filter(d => d.decision === "approve").length;
        if (approveCount >= 2) {
          request.status = "approved";
        }
        // else stays pending for second approval
      } else {
        request.status = "approved";
      }
    }

    return request;
  }

  /** Escalate a pending request */
  escalate(requestId: string, escalatedBy: string, reason: string): ApprovalRequest | null {
    const request = this.requests.get(requestId);
    if (!request || request.status !== "pending") return null;

    request.status = "escalated";
    request.decisions.push({
      approver: escalatedBy,
      decision: "delegate",
      reason: `Escalated: ${reason}`,
      timestamp: Date.now(),
      delegateTo: request.escalationTarget,
    });

    if (request.escalationTarget) {
      request.delegatedTo = request.escalationTarget;
      request.status = "delegated"; // Re-opened to escalation target
    }

    return request;
  }

  /** Cancel an approval request */
  cancel(requestId: string): boolean {
    const request = this.requests.get(requestId);
    if (!request || request.status !== "pending") return false;
    request.status = "cancelled";
    return true;
  }

  /** Check and expire stale requests */
  expireStale(): ApprovalRequest[] {
    const now = Date.now();
    const expired: ApprovalRequest[] = [];

    for (const request of this.requests.values()) {
      if (request.status === "pending" && now > request.expiresAt) {
        request.status = "expired";
        expired.push(request);
      }
    }

    return expired;
  }

  /** Get a specific request */
  get(requestId: string): ApprovalRequest | null {
    return this.requests.get(requestId) ?? null;
  }

  /** Get all pending requests, optionally filtered */
  getPending(options?: { domain?: string; approver?: string; riskTier?: string }): ApprovalRequest[] {
    return Array.from(this.requests.values()).filter(r => {
      if (r.status !== "pending" && r.status !== "delegated") return false;
      if (options?.domain && r.domain !== options.domain) return false;
      if (options?.riskTier && r.riskTier !== options.riskTier) return false;
      if (options?.approver && !r.approvers.includes(options.approver) && r.delegatedTo !== options.approver) return false;
      return true;
    });
  }

  /** Get approval history */
  getHistory(limit?: number): ApprovalRequest[] {
    const all = Array.from(this.requests.values())
      .filter(r => r.status !== "pending" && r.status !== "delegated")
      .sort((a, b) => b.requestedAt - a.requestedAt);
    return limit ? all.slice(0, limit) : all;
  }

  /** Get statistics */
  getStats(): { total: number; pending: number; approved: number; rejected: number; expired: number; escalated: number; avgDecisionTimeMs: number } {
    let total = 0, pending = 0, approved = 0, rejected = 0, expired = 0, escalated = 0;
    let totalDecisionTime = 0;
    let decidedCount = 0;

    for (const r of this.requests.values()) {
      total++;
      if (r.status === "pending" || r.status === "delegated") pending++;
      else if (r.status === "approved") approved++;
      else if (r.status === "rejected") rejected++;
      else if (r.status === "expired") expired++;
      else if (r.status === "escalated") escalated++;

      if (r.decisions.length > 0) {
        totalDecisionTime += r.decisions[0].timestamp - r.requestedAt;
        decidedCount++;
      }
    }

    return { total, pending, approved, rejected, expired, escalated, avgDecisionTimeMs: decidedCount > 0 ? Math.round(totalDecisionTime / decidedCount) : 0 };
  }
}

// ── Factory ─────────────────────────────────────────────────────

export function createApprovalService(): ApprovalService {
  return new ApprovalService();
}
