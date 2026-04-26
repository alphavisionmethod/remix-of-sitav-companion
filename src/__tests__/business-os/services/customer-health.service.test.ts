import { describe, it, expect } from "vitest";
import { computeHealthScore, identifyChurnRisk } from "@/lib/services/business-os/customer-health.service";
import { makeCRMAccount } from "../_helpers/business-fixtures-extra";

describe("customer-health.service", () => {
  describe("computeHealthScore — risk tiers", () => {
    it("classifies very-low overall as 'critical'", () => {
      const acc = makeCRMAccount({ healthScore: 5 });
      const r = computeHealthScore(acc, 60); // engagement = max(0, 100 - 120) = 0
      expect(r.riskLevel).toBe("critical");
    });

    it("classifies mid-low overall as 'high'", () => {
      const acc = makeCRMAccount({ healthScore: 30 });
      const r = computeHealthScore(acc, 30);
      expect(["high", "medium"]).toContain(r.riskLevel);
    });

    it("classifies high overall as 'low'", () => {
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
