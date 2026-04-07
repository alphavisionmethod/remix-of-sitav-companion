import { describe, it, expect } from "vitest";
import { ApprovalService, createApprovalService } from "../approval-service";

function makeRequest(svc: ApprovalService, overrides: Record<string, unknown> = {}) {
  return svc.create({
    correlationId: "c1",
    title: "Test Approval",
    description: "desc",
    requestedBy: "user1",
    domain: "finance",
    riskTier: "medium",
    approvers: ["approver1", "approver2"],
    ...overrides,
  } as never);
}

describe("ApprovalService", () => {
  it("creates a pending request", () => {
    const svc = createApprovalService();
    const req = makeRequest(svc);
    expect(req.status).toBe("pending");
    expect(req.approvers).toHaveLength(2);
  });

  it("approves with single approval when not dual", () => {
    const svc = createApprovalService();
    const req = makeRequest(svc, { requiresDualApproval: false });
    const result = svc.decide(req.id, "approver1", "approve", "looks good");
    expect(result?.status).toBe("approved");
  });

  it("requires two approvals for dual-approval", () => {
    const svc = createApprovalService();
    const req = makeRequest(svc, { requiresDualApproval: true });
    const r1 = svc.decide(req.id, "approver1", "approve");
    expect(r1?.status).toBe("pending"); // still pending after first
    const r2 = svc.decide(req.id, "approver2", "approve");
    expect(r2?.status).toBe("approved");
  });

  it("rejects immediately", () => {
    const svc = createApprovalService();
    const req = makeRequest(svc);
    const result = svc.decide(req.id, "approver1", "reject", "too risky");
    expect(result?.status).toBe("rejected");
  });

  it("delegates to another approver", () => {
    const svc = createApprovalService();
    const req = makeRequest(svc);
    const result = svc.decide(req.id, "approver1", "delegate", "need expert", "expert1");
    expect(result?.status).toBe("delegated");
    expect(result?.delegatedTo).toBe("expert1");
  });

  it("prevents unauthorized approvers", () => {
    const svc = createApprovalService();
    const req = makeRequest(svc);
    const result = svc.decide(req.id, "random-user", "approve");
    expect(result).toBeNull();
  });

  it("cancels a pending request", () => {
    const svc = createApprovalService();
    const req = makeRequest(svc);
    expect(svc.cancel(req.id)).toBe(true);
    expect(svc.get(req.id)?.status).toBe("cancelled");
  });

  it("escalates to escalation target", () => {
    const svc = createApprovalService();
    const req = makeRequest(svc, { escalationTarget: "manager1" });
    const result = svc.escalate(req.id, "approver1", "urgent");
    expect(result?.delegatedTo).toBe("manager1");
  });

  it("returns correct stats", () => {
    const svc = createApprovalService();
    makeRequest(svc);
    makeRequest(svc);
    const stats = svc.getStats();
    expect(stats.total).toBe(2);
    expect(stats.pending).toBe(2);
  });

  it("getPending filters by domain", () => {
    const svc = createApprovalService();
    makeRequest(svc, { domain: "finance" });
    makeRequest(svc, { domain: "business" });
    expect(svc.getPending({ domain: "finance" })).toHaveLength(1);
  });
});
