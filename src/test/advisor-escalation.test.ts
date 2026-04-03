import { describe, it, expect } from "vitest";
import {
  evaluateEscalation,
  routeEscalation,
  createEscalationPackage,
  acknowledgeEscalation,
  resolveEscalation,
  overrideEscalation,
  getEscalationLog,
  getPendingEscalations,
} from "@/lib/advisor-protocol/escalation";
import type { CouncilRecommendation } from "@/lib/advisor-protocol";

const makeRec = (overrides: Partial<CouncilRecommendation> = {}): CouncilRecommendation => ({
  advisorId: "business-lead",
  advisorName: "Business Lead",
  council: "business",
  recommendation: "Follow up with client",
  confidence: 75,
  concerns: [],
  opportunities: ["revenue growth"],
  constraints: [],
  preferredAction: "send-followup",
  riskAssessment: "low",
  dataSources: ["crm"],
  assumptions: [],
  ...overrides,
});

describe("Council Escalation Protocol", () => {
  describe("evaluateEscalation", () => {
    it("detects no escalation for healthy recommendations", () => {
      const result = evaluateEscalation({
        recommendations: [makeRec({ confidence: 80 }), makeRec({ confidence: 75 })],
        confidenceThreshold: 60,
        council: "business",
      });
      expect(result.needsEscalation).toBe(false);
    });

    it("detects confidence below threshold", () => {
      const result = evaluateEscalation({
        recommendations: [makeRec({ confidence: 30 }), makeRec({ confidence: 25 })],
        confidenceThreshold: 60,
        council: "business",
      });
      expect(result.needsEscalation).toBe(true);
      expect(result.triggers).toContain("confidence-below-threshold");
    });

    it("detects consensus failure from high variance", () => {
      const result = evaluateEscalation({
        recommendations: [makeRec({ confidence: 90 }), makeRec({ confidence: 20 })],
        confidenceThreshold: 40,
        council: "business",
      });
      expect(result.triggers).toContain("consensus-failure");
    });

    it("detects blocking disagreement", () => {
      const result = evaluateEscalation({
        recommendations: [makeRec({ riskAssessment: "critical", confidence: 30 })],
        confidenceThreshold: 60,
        council: "business",
      });
      expect(result.triggers).toContain("blocking-disagreement");
    });

    it("detects policy violation from concerns", () => {
      const result = evaluateEscalation({
        recommendations: [makeRec({ concerns: ["policy violation detected"] })],
        confidenceThreshold: 60,
        council: "business",
      });
      expect(result.triggers).toContain("policy-violation");
    });
  });

  describe("routeEscalation", () => {
    it("routes blocking-disagreement to owner", () => {
      const pkg = routeEscalation({
        trigger: "blocking-disagreement",
        sourceCouncil: "business",
        sourceAdvisorId: "business-lead",
        recommendations: [makeRec()],
        tenantId: "t1",
      });
      expect(pkg.target.role).toBe("owner");
      expect(pkg.severity).toBe("urgent");
    });

    it("routes policy-violation to trust-policy-advisor", () => {
      const pkg = routeEscalation({
        trigger: "policy-violation",
        sourceCouncil: "finance",
        sourceAdvisorId: "money-lead",
        recommendations: [makeRec()],
        tenantId: "t1",
      });
      expect(pkg.target.role).toBe("trust-policy-advisor");
      expect(pkg.severity).toBe("critical");
    });

    it("routes consensus-failure to meta-advisor", () => {
      const pkg = routeEscalation({
        trigger: "consensus-failure",
        sourceCouncil: "business",
        sourceAdvisorId: "business-lead",
        recommendations: [makeRec()],
        tenantId: "t1",
      });
      expect(pkg.target.role).toBe("meta-advisor");
    });
  });

  describe("createEscalationPackage", () => {
    it("returns empty array when no escalation needed", () => {
      const pkgs = createEscalationPackage({
        recommendations: [makeRec({ confidence: 80 })],
        council: "business",
        sourceAdvisorId: "business-lead",
        confidenceThreshold: 60,
        tenantId: "t1",
      });
      expect(pkgs).toEqual([]);
    });

    it("creates multiple packages for multiple triggers", () => {
      const pkgs = createEscalationPackage({
        recommendations: [
          makeRec({ confidence: 90, riskAssessment: "critical" }),
          makeRec({ confidence: 10 }),
        ],
        council: "business",
        sourceAdvisorId: "business-lead",
        confidenceThreshold: 60,
        tenantId: "t1",
      });
      expect(pkgs.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Escalation lifecycle", () => {
    it("acknowledges and resolves an escalation", () => {
      const pkg = routeEscalation({
        trigger: "autonomy-ceiling-reached",
        sourceCouncil: "concierge",
        sourceAdvisorId: "concierge-lead",
        recommendations: [makeRec()],
        tenantId: "t2",
      });
      expect(pkg.status).toBe("pending");

      acknowledgeEscalation(pkg.id);
      const log = getEscalationLog();
      const found = log.find(e => e.id === pkg.id);
      expect(found?.status).toBe("acknowledged");

      resolveEscalation(pkg.id);
      const updated = getEscalationLog().find(e => e.id === pkg.id);
      expect(updated?.status).toBe("resolved");
    });

    it("overrides an escalation", () => {
      const pkg = routeEscalation({
        trigger: "handoff-rejected",
        sourceCouncil: "meta",
        sourceAdvisorId: "chief-of-staff",
        recommendations: [makeRec()],
        tenantId: "t3",
      });
      overrideEscalation(pkg.id);
      const found = getEscalationLog().find(e => e.id === pkg.id);
      expect(found?.status).toBe("overridden");
    });

    it("queries pending escalations by target", () => {
      routeEscalation({
        trigger: "repeated-correction",
        sourceCouncil: "business",
        sourceAdvisorId: "crm-specialist",
        recommendations: [makeRec()],
        tenantId: "t4",
      });
      const pending = getPendingEscalations("chief-of-staff");
      expect(pending.length).toBeGreaterThan(0);
    });
  });
});
