import { describe, it, expect } from "vitest";
import {
  mockAdvisors, mockRecommendations, mockSimulations, mockApprovals,
  mockProofHistory, mockMemoryItems as mockAdvisorMemory, mockSynthesis,
  type AdvisorSummary, type AdvisorRecommendation, type SimulationResult,
} from "@/lib/mock-data/advisor-mission-control";

describe("Advisor Workspace Data", () => {
  describe("Advisor Registry", () => {
    it("has at least 5 advisors", () => {
      expect(mockAdvisors.length).toBeGreaterThanOrEqual(5);
    });

    it("each advisor has required fields", () => {
      for (const adv of mockAdvisors) {
        expect(adv.id).toBeTruthy();
        expect(adv.name).toBeTruthy();
        expect(adv.domain).toBeTruthy();
        expect(adv.mission).toBeTruthy();
        expect(adv.confidence).toBeGreaterThan(0);
        expect(adv.confidence).toBeLessThanOrEqual(1);
        expect(["active", "learning", "degraded", "paused"]).toContain(adv.status);
      }
    });

    it("advisors cover key domains", () => {
      const domains = new Set(mockAdvisors.map(a => a.domain));
      expect(domains.has("business")).toBe(true);
      expect(domains.has("money")).toBe(true);
      expect(domains.has("concierge")).toBe(true);
    });

    it("each advisor has a unique id", () => {
      const ids = mockAdvisors.map(a => a.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe("Recommendations", () => {
    it("has recommendations with valid advisorIds", () => {
      const advisorIds = new Set(mockAdvisors.map(a => a.id));
      for (const rec of mockRecommendations) {
        expect(advisorIds.has(rec.advisorId)).toBe(true);
        expect(rec.confidence).toBeGreaterThan(0);
        expect(rec.confidence).toBeLessThanOrEqual(1);
        expect(["high", "medium", "low"]).toContain(rec.impact);
        expect(["critical", "high", "medium", "low"]).toContain(rec.urgency);
      }
    });

    it("recommendations have reasoning chains", () => {
      for (const rec of mockRecommendations) {
        expect(rec.reasoning.length).toBeGreaterThan(20);
        expect(rec.sources.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Simulations", () => {
    it("each simulation has two scenarios", () => {
      for (const sim of mockSimulations) {
        expect(sim.scenarioA).toBeDefined();
        expect(sim.scenarioB).toBeDefined();
        expect(sim.scenarioA.confidence).toBeGreaterThan(0);
        expect(sim.scenarioB.confidence).toBeGreaterThan(0);
        expect(sim.assumptions.length).toBeGreaterThan(0);
        expect(sim.recommendation.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Approvals", () => {
    it("each approval has risk level and expiry", () => {
      for (const apr of mockApprovals) {
        expect(["low", "medium", "high", "critical"]).toContain(apr.riskLevel);
        expect(apr.expiresAt).toBeTruthy();
        expect(apr.proofWillExist).toBeTruthy();
      }
    });
  });

  describe("Proof History", () => {
    it("covers multiple proof types", () => {
      const types = new Set(mockProofHistory.map(p => p.type));
      expect(types.size).toBeGreaterThanOrEqual(3);
    });

    it("each has a receipt hash", () => {
      for (const p of mockProofHistory) {
        expect(p.receiptHash).toBeTruthy();
      }
    });
  });

  describe("Multi-Advisor Synthesis", () => {
    it("has participants from multiple advisors", () => {
      for (const s of mockSynthesis) {
        expect(s.participants.length).toBeGreaterThanOrEqual(2);
        expect(s.primaryRecommendation).toBeTruthy();
      }
    });
  });
});
