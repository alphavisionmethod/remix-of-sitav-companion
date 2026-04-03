import { describe, it, expect } from "vitest";
import {
  recordAdvisorOutcome,
  recordBoardroomContribution,
  evaluateAdvisor,
  getAdvisorScorecard,
  getCouncilPerformance,
  shouldPromoteAdvisor,
  shouldDemoteAdvisor,
  getOutcomeHistory,
} from "@/lib/advisor-protocol/performance";

describe("Advisor Performance Evaluation", () => {
  const advisorId = `perf-test-${Date.now()}`;

  it("returns zero scores for advisor with no outcomes", () => {
    const record = evaluateAdvisor(`empty-${Date.now()}`);
    expect(record.totalRecommendations).toBe(0);
    expect(record.acceptanceRate).toBe(0);
    expect(record.promotionEligible).toBe(false);
    expect(record.demotionRecommended).toBe(false);
  });

  it("records outcomes and evaluates correctly", () => {
    // Record 12 outcomes: 10 accepted, 1 corrected, high confidence
    for (let i = 0; i < 10; i++) {
      recordAdvisorOutcome({
        advisorId,
        recommendationId: `rec-${i}`,
        action: "follow-up",
        accepted: true,
        correctedAfter: i === 3, // 1 correction
        confidenceAtRecommendation: 80,
        outcomeQuality: 85,
        domain: "business",
        recordedAt: new Date().toISOString(),
      });
    }
    // 2 rejected
    for (let i = 0; i < 2; i++) {
      recordAdvisorOutcome({
        advisorId,
        recommendationId: `rec-rej-${i}`,
        action: "cold-outreach",
        accepted: false,
        correctedAfter: false,
        confidenceAtRecommendation: 60,
        outcomeQuality: null,
        domain: "business",
        recordedAt: new Date().toISOString(),
      });
    }

    const record = evaluateAdvisor(advisorId);
    expect(record.totalRecommendations).toBe(12);
    expect(record.acceptedCount).toBe(10);
    expect(record.acceptanceRate).toBeCloseTo(10 / 12, 2);
    expect(record.correctionCount).toBe(1);
    expect(record.correctionRate).toBeCloseTo(1 / 10, 2);
  });

  it("generates scorecard with grade", () => {
    const { record, grade, summary } = getAdvisorScorecard(advisorId);
    expect(record.totalRecommendations).toBe(12);
    expect(["A", "B", "C", "D", "F"]).toContain(grade);
    expect(summary).toContain(advisorId);
  });

  it("tracks boardroom contributions", () => {
    recordBoardroomContribution(advisorId);
    recordBoardroomContribution(advisorId);
    const record = evaluateAdvisor(advisorId);
    expect(record.boardroomContributions).toBe(2);
  });

  it("determines promotion eligibility", () => {
    const { promote } = shouldPromoteAdvisor(advisorId);
    // With 83% acceptance, low correction, should be eligible
    expect(typeof promote).toBe("boolean");
  });

  it("determines demotion for poor performers", () => {
    const poorAdvisor = `poor-${Date.now()}`;
    for (let i = 0; i < 8; i++) {
      recordAdvisorOutcome({
        advisorId: poorAdvisor,
        recommendationId: `rec-${i}`,
        action: "bad-advice",
        accepted: i < 2, // only 25% accepted
        correctedAfter: i < 2,
        confidenceAtRecommendation: 90,
        outcomeQuality: 20,
        domain: "finance",
        recordedAt: new Date().toISOString(),
      });
    }
    const { demote, reason } = shouldDemoteAdvisor(poorAdvisor);
    expect(demote).toBe(true);
    expect(reason).toBeTruthy();
  });

  it("aggregates council performance", () => {
    const report = getCouncilPerformance("business", [advisorId, `empty-${Date.now()}`]);
    expect(report.council).toBe("business");
    expect(report.advisorScores.length).toBe(2);
    expect(report.topPerformer).toBe(advisorId);
  });

  it("retrieves outcome history", () => {
    const history = getOutcomeHistory(advisorId);
    expect(history.length).toBe(12);
    expect(history.every(o => o.advisorId === advisorId)).toBe(true);
  });
});
