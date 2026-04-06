import { describe, it, expect } from "vitest";
import { ApprovalService } from "@/lib/core-services/approval-service";

describe("Approval Engine Flow — Integration", () => {
  it("creates and approves a single-approval request", () => {
    const svc = new ApprovalService();
    const req = svc.create({
      correlationId: "corr-1",
      title: "Pay invoice",
      description: "Invoice #42",
      requestedBy: "user-a",
      domain: "finance",
      riskTier: "medium",
      approvers: ["approver-1"],
    });

    expect(req.status).toBe("pending");
    expect(req.riskTier).toBe("medium");

    const decided = svc.decide(req.id, "approver-1", "approve", "Looks good");
    expect(decided?.status).toBe("approved");
    expect(decided?.decisions).toHaveLength(1);
  });

  it("rejects a request", () => {
    const svc = new ApprovalService();
    const req = svc.create({
      correlationId: "corr-2",
      title: "Delete records",
      description: "Bulk delete",
      requestedBy: "user-a",
      domain: "business",
      riskTier: "high",
      approvers: ["approver-1"],
    });

    const decided = svc.decide(req.id, "approver-1", "reject", "Not authorized");
    expect(decided?.status).toBe("rejected");
  });

  it("enforces dual approval for critical requests", () => {
    const svc = new ApprovalService();
    const req = svc.create({
      correlationId: "corr-3",
      title: "Critical transfer",
      description: "Large sum",
      requestedBy: "user-a",
      domain: "finance",
      riskTier: "critical",
      approvers: ["approver-1", "approver-2"],
    });

    expect(req.requiresDualApproval).toBe(true);

    // First approval — should still be pending
    const first = svc.decide(req.id, "approver-1", "approve");
    expect(first?.status).toBe("pending");

    // Second approval — now approved
    const second = svc.decide(req.id, "approver-2", "approve");
    expect(second?.status).toBe("approved");
  });

  it("blocks unauthorized approvers", () => {
    const svc = new ApprovalService();
    const req = svc.create({
      correlationId: "corr-4",
      title: "Test",
      description: "Test",
      requestedBy: "user-a",
      domain: "business",
      riskTier: "low",
      approvers: ["approver-1"],
    });

    const result = svc.decide(req.id, "random-user", "approve");
    expect(result).toBeNull();
  });

  it("handles delegation", () => {
    const svc = new ApprovalService();
    const req = svc.create({
      correlationId: "corr-5",
      title: "Delegated task",
      description: "Needs delegation",
      requestedBy: "user-a",
      domain: "business",
      riskTier: "medium",
      approvers: ["approver-1"],
    });

    const delegated = svc.decide(req.id, "approver-1", "delegate", "Delegating", "approver-2");
    expect(delegated?.status).toBe("delegated");

    const approved = svc.decide(req.id, "approver-2", "approve");
    expect(approved?.status).toBe("approved");
  });

  it("returns null for nonexistent request", () => {
    const svc = new ApprovalService();
    expect(svc.decide("nonexistent", "user", "approve")).toBeNull();
  });
});
