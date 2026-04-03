import { describe, it, expect } from "vitest";
import {
  initiateHandoff,
  acceptHandoff,
  rejectHandoff,
  completeHandoff,
  getHandoffHistory,
  getPendingHandoffs,
  getActiveMonitoringHandoffs,
  getValidHandoffTargets,
} from "@/lib/advisor-protocol/handoff";

describe("Advisor Handoff Protocol", () => {
  const baseContext = {
    workSummary: "Analyzed pipeline health",
    memoryKeys: ["pipeline-data", "revenue-history"],
    activeRecommendationIds: ["rec-1"],
    entityIds: ["customer-123"],
    confidenceAtHandoff: 72,
    suggestedNextAction: "Review cash impact",
    constraints: [],
    proofChainRef: "proof-abc",
  };

  it("returns valid handoff targets for known advisors", () => {
    const targets = getValidHandoffTargets("business-lead");
    expect(targets).toContain("chief-of-staff");
    expect(targets).toContain("money-lead");
  });

  it("returns empty targets for unknown advisors", () => {
    expect(getValidHandoffTargets("unknown-advisor")).toEqual([]);
  });

  it("initiates a valid handoff", () => {
    const result = initiateHandoff({
      sourceAdvisorId: "business-lead",
      targetAdvisorId: "money-lead",
      reason: "cross-domain-required",
      urgency: "standard",
      context: baseContext,
      tenantId: "t1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.request.sourceAdvisorId).toBe("business-lead");
      expect(result.request.targetAdvisorId).toBe("money-lead");
    }
  });

  it("rejects handoff to invalid target", () => {
    const result = initiateHandoff({
      sourceAdvisorId: "business-lead",
      targetAdvisorId: "household-coordinator",
      reason: "specialist-needed",
      urgency: "low",
      context: baseContext,
      tenantId: "t1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects handoff with empty memory keys", () => {
    const result = initiateHandoff({
      sourceAdvisorId: "business-lead",
      targetAdvisorId: "money-lead",
      reason: "cross-domain-required",
      urgency: "standard",
      context: { ...baseContext, memoryKeys: [] },
      tenantId: "t1",
    });
    expect(result.success).toBe(false);
  });

  it("accepts a handoff and transitions source to monitoring", () => {
    const init = initiateHandoff({
      sourceAdvisorId: "chief-of-staff",
      targetAdvisorId: "business-lead",
      reason: "specialist-needed",
      urgency: "low",
      context: baseContext,
      tenantId: "t2",
    });
    expect(init.success).toBe(true);
    if (!init.success) return;

    const result = acceptHandoff({
      requestId: init.request.id,
      acceptingAdvisorId: "business-lead",
    });
    expect(result.status).toBe("accepted");
    expect(result.sourceMonitoring).toBe(true);
    expect(result.contextReceived).toBe(true);
  });

  it("rejects a handoff with reason", () => {
    const init = initiateHandoff({
      sourceAdvisorId: "chief-of-staff",
      targetAdvisorId: "risk-officer",
      reason: "policy-requires-escalation",
      urgency: "high",
      context: baseContext,
      tenantId: "t3",
    });
    expect(init.success).toBe(true);
    if (!init.success) return;

    const result = rejectHandoff({
      requestId: init.request.id,
      rejectingAdvisorId: "risk-officer",
      reason: "Domain scope mismatch",
    });
    expect(result.status).toBe("rejected");
    expect(result.rejectionReason).toBe("Domain scope mismatch");
  });

  it("completes a handoff", () => {
    const init = initiateHandoff({
      sourceAdvisorId: "money-lead",
      targetAdvisorId: "chief-of-staff",
      reason: "autonomy-ceiling-reached",
      urgency: "standard",
      context: baseContext,
      tenantId: "t4",
    });
    expect(init.success).toBe(true);
    if (!init.success) return;

    acceptHandoff({ requestId: init.request.id, acceptingAdvisorId: "chief-of-staff" });
    completeHandoff(init.request.id);

    const history = getHandoffHistory();
    const completed = history.find(h => h.request.id === init.request.id);
    expect(completed?.result?.status).toBe("completed");
  });

  it("tracks pending and monitoring handoffs", () => {
    const init = initiateHandoff({
      sourceAdvisorId: "chief-of-staff",
      targetAdvisorId: "growth-strategist",
      reason: "specialist-needed",
      urgency: "low",
      context: baseContext,
      tenantId: "t5",
    });
    if (!init.success) return;

    const pending = getPendingHandoffs("growth-strategist");
    expect(pending.length).toBeGreaterThan(0);

    acceptHandoff({ requestId: init.request.id, acceptingAdvisorId: "growth-strategist" });
    const monitoring = getActiveMonitoringHandoffs("chief-of-staff");
    expect(monitoring.length).toBeGreaterThan(0);
  });

  it("throws on duplicate resolution", () => {
    const init = initiateHandoff({
      sourceAdvisorId: "chief-of-staff",
      targetAdvisorId: "business-lead",
      reason: "cross-domain-required",
      urgency: "standard",
      context: baseContext,
      tenantId: "t6",
    });
    if (!init.success) return;

    acceptHandoff({ requestId: init.request.id, acceptingAdvisorId: "business-lead" });
    expect(() => acceptHandoff({ requestId: init.request.id, acceptingAdvisorId: "business-lead" })).toThrow();
  });
});
