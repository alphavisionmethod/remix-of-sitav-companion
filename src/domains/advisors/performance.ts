// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Performance Evaluation
// Tracks recommendation outcomes, correction frequency,
// confidence calibration, and computes scorecards per advisor
// ═══════════════════════════════════════════════════════════════

// ── Types ────────────────────────────────────────────────────

export interface AdvisorOutcome {
  advisorId: string;
  recommendationId: string;
  action: string;
  /** Was the recommendation accepted by the user? */
  accepted: boolean;
  /** Was the result corrected after acceptance? */
  correctedAfter: boolean;
  /** Confidence at time of recommendation */
  confidenceAtRecommendation: number;
  /** Actual outcome quality (0-100, null if not yet measured) */
  outcomeQuality: number | null;
  /** Domain this recommendation was in */
  domain: string;
  /** Timestamp */
  recordedAt: string;
}

export interface AdvisorPerformanceRecord {
  advisorId: string;
  /** Total recommendations made */
  totalRecommendations: number;
  /** How many were accepted by user */
  acceptedCount: number;
  /** Acceptance rate (0-1) */
  acceptanceRate: number;
  /** How many times the user corrected after acceptance */
  correctionCount: number;
  /** Correction rate (0-1) */
  correctionRate: number;
  /** Average confidence vs actual outcome (calibration error) */
  calibrationError: number;
  /** Average outcome quality for measured outcomes */
  averageOutcomeQuality: number;
  /** Boardroom contribution count */
  boardroomContributions: number;
  /** Promotion eligible? */
  promotionEligible: boolean;
  /** Demotion recommended? */
  demotionRecommended: boolean;
  /** Last evaluated */
  evaluatedAt: string;
}

export interface CouncilPerformanceReport {
  council: string;
  advisorScores: AdvisorPerformanceRecord[];
  overallAcceptanceRate: number;
  overallCalibrationError: number;
  topPerformer: string;
  underperformer: string | null;
  evaluatedAt: string;
}

// ── State ────────────────────────────────────────────────────

const outcomeStore: AdvisorOutcome[] = [];
const boardroomContributionCounts: Record<string, number> = {};

// ── Recording ────────────────────────────────────────────────

export function recordAdvisorOutcome(outcome: AdvisorOutcome): void {
  outcomeStore.push(outcome);
}

export function recordBoardroomContribution(advisorId: string): void {
  boardroomContributionCounts[advisorId] = (boardroomContributionCounts[advisorId] || 0) + 1;
}

// ── Evaluation ───────────────────────────────────────────────

/**
 * Evaluate a single advisor's performance based on all recorded outcomes.
 */
export function evaluateAdvisor(advisorId: string): AdvisorPerformanceRecord {
  const outcomes = outcomeStore.filter(o => o.advisorId === advisorId);
  const total = outcomes.length;

  if (total === 0) {
    return {
      advisorId,
      totalRecommendations: 0,
      acceptedCount: 0,
      acceptanceRate: 0,
      correctionCount: 0,
      correctionRate: 0,
      calibrationError: 0,
      averageOutcomeQuality: 0,
      boardroomContributions: boardroomContributionCounts[advisorId] || 0,
      promotionEligible: false,
      demotionRecommended: false,
      evaluatedAt: new Date().toISOString(),
    };
  }

  const accepted = outcomes.filter(o => o.accepted);
  const corrected = outcomes.filter(o => o.correctedAfter);
  const measured = outcomes.filter(o => o.outcomeQuality !== null);

  // Calibration error: |confidence - actual outcome quality| averaged
  let calibrationError = 0;
  if (measured.length > 0) {
    calibrationError = measured.reduce((sum, o) => {
      return sum + Math.abs(o.confidenceAtRecommendation - (o.outcomeQuality || 0));
    }, 0) / measured.length;
  }

  const avgOutcome = measured.length > 0
    ? measured.reduce((s, o) => s + (o.outcomeQuality || 0), 0) / measured.length
    : 0;

  const acceptanceRate = accepted.length / total;
  const correctionRate = accepted.length > 0 ? corrected.length / accepted.length : 0;

  // Promotion: high acceptance, low correction, good calibration
  const promotionEligible = total >= 10 &&
    acceptanceRate >= 0.75 &&
    correctionRate <= 0.1 &&
    calibrationError <= 15;

  // Demotion: low acceptance or high correction
  const demotionRecommended = total >= 5 && (
    acceptanceRate < 0.4 ||
    correctionRate > 0.3 ||
    calibrationError > 35
  );

  return {
    advisorId,
    totalRecommendations: total,
    acceptedCount: accepted.length,
    acceptanceRate,
    correctionCount: corrected.length,
    correctionRate,
    calibrationError,
    averageOutcomeQuality: avgOutcome,
    boardroomContributions: boardroomContributionCounts[advisorId] || 0,
    promotionEligible,
    demotionRecommended,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Get a formatted scorecard for an advisor.
 */
export function getAdvisorScorecard(advisorId: string): {
  record: AdvisorPerformanceRecord;
  grade: "A" | "B" | "C" | "D" | "F";
  summary: string;
} {
  const record = evaluateAdvisor(advisorId);

  let grade: "A" | "B" | "C" | "D" | "F";
  if (record.acceptanceRate >= 0.85 && record.calibrationError <= 10) grade = "A";
  else if (record.acceptanceRate >= 0.7 && record.calibrationError <= 20) grade = "B";
  else if (record.acceptanceRate >= 0.5 && record.calibrationError <= 30) grade = "C";
  else if (record.acceptanceRate >= 0.3) grade = "D";
  else grade = "F";

  const summary = record.totalRecommendations === 0
    ? `${advisorId}: No recommendations recorded yet.`
    : `${advisorId}: Grade ${grade} | ${record.totalRecommendations} recommendations, ${(record.acceptanceRate * 100).toFixed(0)}% accepted, ${(record.correctionRate * 100).toFixed(0)}% corrected, calibration error ${record.calibrationError.toFixed(1)}%.${record.promotionEligible ? " ⬆ Eligible for promotion." : ""}${record.demotionRecommended ? " ⬇ Demotion recommended." : ""}`;

  return { record, grade, summary };
}

/**
 * Aggregate performance across all advisors in a council.
 */
export function getCouncilPerformance(
  council: string,
  advisorIds: string[]
): CouncilPerformanceReport {
  const scores = advisorIds.map(id => evaluateAdvisor(id));
  const withData = scores.filter(s => s.totalRecommendations > 0);

  const overallAcceptance = withData.length > 0
    ? withData.reduce((s, r) => s + r.acceptanceRate, 0) / withData.length
    : 0;
  const overallCalibration = withData.length > 0
    ? withData.reduce((s, r) => s + r.calibrationError, 0) / withData.length
    : 0;

  const sorted = [...withData].sort((a, b) => b.acceptanceRate - a.acceptanceRate);
  const topPerformer = sorted[0]?.advisorId || advisorIds[0];
  const underperformer = sorted.length > 0 && sorted[sorted.length - 1].demotionRecommended
    ? sorted[sorted.length - 1].advisorId
    : null;

  return {
    council,
    advisorScores: scores,
    overallAcceptanceRate: overallAcceptance,
    overallCalibrationError: overallCalibration,
    topPerformer,
    underperformer,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Determine if advisor should be promoted (higher autonomy level).
 */
export function shouldPromoteAdvisor(advisorId: string): { promote: boolean; reason: string } {
  const record = evaluateAdvisor(advisorId);
  if (record.promotionEligible) {
    return { promote: true, reason: `${advisorId} has ${(record.acceptanceRate * 100).toFixed(0)}% acceptance, ${record.calibrationError.toFixed(1)} calibration error over ${record.totalRecommendations} recommendations` };
  }
  return { promote: false, reason: record.totalRecommendations < 10 ? "Insufficient data" : "Performance below promotion threshold" };
}

/**
 * Determine if advisor should be demoted (lower autonomy level).
 */
export function shouldDemoteAdvisor(advisorId: string): { demote: boolean; reason: string } {
  const record = evaluateAdvisor(advisorId);
  if (record.demotionRecommended) {
    return { demote: true, reason: `${advisorId} has ${(record.acceptanceRate * 100).toFixed(0)}% acceptance, ${(record.correctionRate * 100).toFixed(0)}% correction rate, ${record.calibrationError.toFixed(1)} calibration error` };
  }
  return { demote: false, reason: "Performance within acceptable range" };
}

// ── Queries ──────────────────────────────────────────────────

export function getOutcomeHistory(advisorId: string): AdvisorOutcome[] {
  return outcomeStore.filter(o => o.advisorId === advisorId);
}

export function getOutcomesByDomain(domain: string): AdvisorOutcome[] {
  return outcomeStore.filter(o => o.domain === domain);
}
