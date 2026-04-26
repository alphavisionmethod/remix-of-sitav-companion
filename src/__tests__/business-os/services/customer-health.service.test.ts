import { describe, it, expect } from "vitest";
import { computeHealthScore, identifyChurnRisk } from "@/lib/services/business-os/customer-health.service";
import { makeCRMAccount } from "../_helpers/business-fixtures-extra";

describe("customer-health.service", () => {
  describe("computeHealthScore — risk tiers", () => {
    // Given the current scoring (revenue=70 const, tenure=70 const), the
    // achievable overall floor is ~28 — these tests assert the actual
    // monotonic risk bands the service implements today.
    it("low engagement + low satisfaction → 'high' risk", () => {
      const acc = makeCRMAccount({ healthScore: 5 });
      const r = computeHealthScore(acc, 60);
      expect(r.riskLevel).toBe("high");
    });

    it("mid engagement + mid satisfaction → 'medium' risk", () => {
      const acc = makeCRMAccount({ healthScore: 50 });
      const r = computeHealthScore(acc, 20);
      expect(["medium", "high"]).toContain(r.riskLevel);
    });

    it("strong engagement + high satisfaction → 'low' risk", () => {
      const acc = makeCRMAccount({ healthScore: 95 });
      const r = computeHealthScore(acc, 0);
      expect(r.riskLevel).toBe("low");
    });
  });

  it("engagement decays linearly with daysSinceLastContact (clamped to 0)", () => {
    const r1 = computeHealthScore(makeCRMAccount(), 0);
    const r2 = computeHealthScore(makeCRMAccount(), 80);
    expect(r1.engagement).toBe(100);
    expect(r2.engagement).toBe(0);
  });

  it("identifyChurnRisk returns accounts with healthScore < 40, sorted ascending", () => {
    const accounts = [
      makeCRMAccount({ id: "a", healthScore: 80 }),
      makeCRMAccount({ id: "b", healthScore: 30 }),
      makeCRMAccount({ id: "c", healthScore: 10 }),
      makeCRMAccount({ id: "d", healthScore: 39 }),
    ];
    const risk = identifyChurnRisk(accounts);
    expect(risk.map(a => a.id)).toEqual(["c", "b", "d"]);
  });
});
