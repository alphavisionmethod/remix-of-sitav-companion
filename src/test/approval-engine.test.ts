import { describe, it, expect } from "vitest";
import {
  createApprovalRequest,
  addDecision,
  getRequest,
  listPending,
  expireStale,
} from "@/lib/services/approval-engine/approval-requests.service";
import {
  routeApproval,
  canDelegate,
  getNextDelegate,
} from "@/lib/services/approval-engine/approval-routing.service";
import {
  getEscalationConfig,
  shouldEscalate,
  getNextEscalationTarget,
  createMultiStepApproval,
  advanceMultiStep,
} from "@/lib/services/approval-engine/escalation-rules.service";
import {
  recordApproval,
  computeMetrics,
} from "@/lib/services/approval-engine/approval-history.service";

describe("Approval Engine — Requests", () => {
  it("creates an approval request with correct defaults", () => {
    const req = createApprovalRequest({
      actionId: "act-1",
      actionType: "payment",
      requestedBy: "user-1",
      context: { domain: "finance", amount: 5000 },
      requiredApprovers: 1,
    });
    expect(req.id).toBeDefined();
    expect(req.status).toBe("pending");
    expect(req.requiredApprovers).toBe(1);
    expect(req.currentApprovals).toHaveLength(0);
  });

  it("approves when required approvers met", () => {
    const req = createApprovalRequest({
      actionId: "act-2",
      actionType: "payment",
      requestedBy: "user-1",
      context: {},
      requiredApprovers: 1,
    });
    const updated = addDecision(req.id, {
      approverId: "approver-1",
      decision: "approve",
      decidedAt: new Date().toISOString(),
    });
    expect(updated!.status).toBe("approved");
  });

  it("rejects immediately on rejection", () => {
    const req = createApprovalRequest({
      actionId: "act-3",
      actionType: "payment",
      requestedBy: "user-1",
      context: {},
      requiredApprovers: 2,
    });
    const updated = addDecision(req.id, {
      approverId: "approver-1",
      decision: "reject",
      reason: "Not authorized",
      decidedAt: new Date().toISOString(),
    });
    expect(updated!.status).toBe("rejected");
  });

  it("prevents duplicate approvals from same approver", () => {
    const req = createApprovalRequest({
      actionId: "act-4",
      actionType: "transfer",
      requestedBy: "user-1",
      context: {},
      requiredApprovers: 2,
    });
    addDecision(req.id, { approverId: "approver-1", decision: "approve", decidedAt: new Date().toISOString() });
    addDecision(req.id, { approverId: "approver-1", decision: "approve", decidedAt: new Date().toISOString() });
    const current = getRequest(req.id);
    expect(current!.currentApprovals).toHaveLength(1);
    expect(current!.status).toBe("pending"); // Still needs 2nd approver
  });

  it("lists pending requests", () => {
    const pending = listPending();
    expect(Array.isArray(pending)).toBe(true);
  });
});

describe("Approval Engine — Routing", () => {
  it("routes critical finance to owner only", () => {
    const result = routeApproval("finance", "critical", 600000);
    expect(result.approverRoles).toContain("owner");
    expect(result.requiredCount).toBe(2);
  });

  it("routes medium business to admin/member", () => {
    const result = routeApproval("business", "medium");
    expect(result.approverRoles).toContain("admin");
    expect(result.requiredCount).toBe(1);
  });

  it("supports delegation chains", () => {
    const result = routeApproval("concierge", "medium");
    expect(result.delegationAvailable).toBe(true);
    expect(result.delegationChain.length).toBeGreaterThan(0);
  });

  it("canDelegate respects max depth", () => {
    const rule = { domain: "test", riskLevel: "medium" as const, approverRoles: ["admin"], delegationChain: ["member"], maxDelegationDepth: 1 };
    expect(canDelegate(rule, 0)).toBe(true);
    expect(canDelegate(rule, 1)).toBe(false);
  });

  it("getNextDelegate returns correct delegate", () => {
    const rule = { domain: "test", riskLevel: "medium" as const, approverRoles: ["admin"], delegationChain: ["member", "viewer"], maxDelegationDepth: 2 };
    expect(getNextDelegate(rule, 0)).toBe("member");
    expect(getNextDelegate(rule, 1)).toBe("viewer");
    expect(getNextDelegate(rule, 2)).toBeNull();
  });
});

describe("Approval Engine — Escalation", () => {
  it("returns escalation config for finance critical", () => {
    const config = getEscalationConfig("finance", "critical");
    expect(config).toBeDefined();
    expect(config!.initialTimeoutMinutes).toBe(15);
    expect(config!.finalAction).toBe("system-hold");
  });

  it("shouldEscalate returns true after timeout", () => {
    const config = getEscalationConfig("finance", "critical")!;
    const oldTime = new Date(Date.now() - 20 * 60000).toISOString(); // 20 min ago
    expect(shouldEscalate(oldTime, config, 0)).toBe(true);
  });

  it("shouldEscalate returns false before timeout", () => {
    const config = getEscalationConfig("finance", "critical")!;
    const recentTime = new Date(Date.now() - 5 * 60000).toISOString(); // 5 min ago
    expect(shouldEscalate(recentTime, config, 0)).toBe(false);
  });

  it("getNextEscalationTarget returns correct role", () => {
    const config = getEscalationConfig("finance", "critical")!;
    expect(getNextEscalationTarget(config, 0)).toBe("admin");
    expect(getNextEscalationTarget(config, 1)).toBe("owner");
    expect(getNextEscalationTarget(config, 2)).toBeNull();
  });

  it("creates multi-step approval with correct structure", () => {
    const approval = createMultiStepApproval("act-ms-1", [
      { role: "admin", timeoutMinutes: 30 },
      { role: "owner", timeoutMinutes: 15 },
    ]);
    expect(approval.steps).toHaveLength(2);
    expect(approval.currentStep).toBe(0);
    expect(approval.status).toBe("in-progress");
  });

  it("advances multi-step approval through steps", () => {
    const approval = createMultiStepApproval("act-ms-2", [
      { role: "admin", timeoutMinutes: 30 },
      { role: "owner", timeoutMinutes: 15 },
    ]);
    const step1 = advanceMultiStep(approval, "approved", "Looks good");
    expect(step1.steps[0].status).toBe("approved");
    expect(step1.currentStep).toBe(1);
    expect(step1.status).toBe("in-progress");

    const step2 = advanceMultiStep(step1, "approved");
    expect(step2.status).toBe("approved");
    expect(step2.completedAt).toBeDefined();
  });

  it("rejects multi-step on any rejection", () => {
    const approval = createMultiStepApproval("act-ms-3", [
      { role: "admin", timeoutMinutes: 30 },
      { role: "owner", timeoutMinutes: 15 },
    ]);
    const rejected = advanceMultiStep(approval, "rejected", "Unauthorized spend");
    expect(rejected.status).toBe("rejected");
    expect(rejected.steps[0].reason).toBe("Unauthorized spend");
  });
});

describe("Approval Engine — History & Metrics", () => {
  it("computes metrics from recorded approvals", () => {
    // Record some approvals
    recordApproval(createApprovalRequest({
      actionId: "hist-1", actionType: "payment", requestedBy: "u1",
      context: { domain: "finance" }, requiredApprovers: 1,
    }));

    const metrics = computeMetrics();
    expect(metrics.totalDecisions).toBeGreaterThan(0);
    expect(metrics.approvalRate).toBeGreaterThanOrEqual(0);
    expect(metrics.approvalRate).toBeLessThanOrEqual(1);
  });
});
