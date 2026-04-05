// ═══════════════════════════════════════════════════════════════
// SITA OS — Enhanced Council Deliberation Engine
// Specialization-weighted voting, critique loops, learning signals
// ═══════════════════════════════════════════════════════════════

import type {
  RecommendationV2,
  CouncilDeliberationV2,
  CouncilVoteV2,
  CritiqueResult,
  AdvisorCalibrationUpdate,
  RecommendationOutcome,
  FeedbackSignal,
} from "./types";
import { getSpecialization, getAdvisorPairs } from "./specializations";
import { verifyRecommendation, detectCrossAdvisorContradictions } from "./recommendation-verifier";

// ── Weighted Vote Scoring ─────────────────────────────────

interface WeightedScore {
  advisorId: string;
  rawWeight: number;
  calibrationMultiplier: number;
  specialistBonus: number;
  finalWeight: number;
}

function computeAdvisorWeight(
  advisorId: string,
  topic: string,
  calibrations: Map<string, AdvisorCalibrationUpdate>,
): WeightedScore {
  const spec = getSpecialization(advisorId);
  const cal = calibrations.get(advisorId);

  let rawWeight = 1.0;

  // Tier-based base weight
  if (spec) {
    const tierWeights = { primary: 1.0, specialist: 1.2, meta: 0.8, governance: 1.5 };
    rawWeight = tierWeights[spec.tier];
  }

  // Calibration multiplier — penalize overconfident, boost well-calibrated
  let calibrationMultiplier = 1.0;
  if (cal) {
    if (cal.calibrationDelta > 0.1) calibrationMultiplier = 0.85; // overconfident
    else if (cal.calibrationDelta < -0.1) calibrationMultiplier = 0.9; // underconfident
    else calibrationMultiplier = 1.1; // well-calibrated

    // Penalize high hallucination rate
    if (cal.hallucinationIncidents > 0) {
      calibrationMultiplier *= Math.max(0.5, 1 - cal.hallucinationIncidents * 0.1);
    }
  }

  // Specialist bonus — if topic matches specialization tags
  let specialistBonus = 0;
  if (spec) {
    const topicWords = topic.toLowerCase().split(/\s+/);
    const tagMatches = spec.specializationTags.filter(t =>
      topicWords.some(w => t.includes(w) || w.includes(t))
    );
    specialistBonus = tagMatches.length * 0.15;
  }

  return {
    advisorId,
    rawWeight,
    calibrationMultiplier,
    specialistBonus,
    finalWeight: rawWeight * calibrationMultiplier + specialistBonus,
  };
}

// ── Council Deliberation ──────────────────────────────────

export function runCouncilDeliberation(
  topic: string,
  domain: string,
  recommendations: RecommendationV2[],
  calibrations: Map<string, AdvisorCalibrationUpdate> = new Map(),
): CouncilDeliberationV2 {
  const startTime = Date.now();
  const participants = recommendations.map(r => r.advisorId);

  // Phase 1: Individual verification
  const verifications = recommendations.map(r => verifyRecommendation(r));

  // Phase 2: Cross-advisor contradiction check
  const crossContradictions = detectCrossAdvisorContradictions(recommendations);

  // Phase 3: Build votes with weighted scoring
  const votes: CouncilVoteV2[] = recommendations.map(rec => {
    const verification = verifications.find(v => v.recommendation.advisorId === rec.advisorId);
    const weight = computeAdvisorWeight(rec.advisorId, topic, calibrations);
    const blocked = verification?.overallVerdict === "blocked";

    return {
      advisorId: rec.advisorId,
      position: blocked ? "abstain" : rec.confidenceBreakdown.score > 0.7 ? "support" : "conditional",
      confidence: rec.confidenceBreakdown.score * weight.finalWeight,
      reasoning: rec.structuredOutput.recommendations.length > 0
        ? rec.structuredOutput.recommendations
        : rec.structuredOutput.facts,
      conditions: rec.requiredConfirmations,
      risks: rec.structuredOutput.risksDetected.map(r => r.statement),
      evidenceRefs: rec.evidenceBundle.references.map(r => r.sourceId),
      dissent: blocked ? {
        from: "verifier",
        severity: "material" as const,
        alternativeProposal: verification?.critiques.find(c => c.suggestedRevision)?.suggestedRevision || "Gather more evidence",
      } : undefined,
    };
  });

  // Phase 4: Resolve
  const supportVotes = votes.filter(v => v.position === "support");
  const opposeVotes = votes.filter(v => v.position === "oppose");
  const conditionalVotes = votes.filter(v => v.position === "conditional");

  const totalWeight = votes.reduce((s, v) => s + v.confidence, 0);
  const supportWeight = supportVotes.reduce((s, v) => s + v.confidence, 0);
  const consensusScore = totalWeight > 0 ? supportWeight / totalWeight : 0;

  const allCritiques = [
    ...verifications.flatMap(v => v.critiques),
    ...crossContradictions,
  ];

  // Evidence quality assessment
  const avgEvidenceSources = recommendations.reduce((s, r) => s + r.evidenceBundle.totalSources, 0) / Math.max(recommendations.length, 1);
  const evidenceQuality: CouncilDeliberationV2["resolution"]["evidenceQuality"] =
    avgEvidenceSources >= 5 ? "strong" :
    avgEvidenceSources >= 3 ? "moderate" :
    avgEvidenceSources >= 1 ? "weak" : "insufficient";

  let outcome: CouncilDeliberationV2["resolution"]["outcome"];
  if (consensusScore > 0.8) outcome = "consensus";
  else if (consensusScore > 0.5) outcome = "majority";
  else if (conditionalVotes.length > supportVotes.length) outcome = "conditional";
  else if (opposeVotes.length >= supportVotes.length) outcome = "deadlocked";
  else outcome = "majority";

  // Trust-governance veto check
  const trustAdvisorVote = votes.find(v => {
    const spec = getSpecialization(v.advisorId);
    return spec?.trustSensitivity === "veto-capable" && v.position === "oppose";
  });
  if (trustAdvisorVote) outcome = "escalated";

  return {
    id: crypto.randomUUID(),
    topic,
    domain,
    convener: "brain-core",
    participants,
    votes,
    critiqueResults: allCritiques,
    resolution: {
      outcome,
      consensusScore: Math.round(consensusScore * 100) / 100,
      summary: `Council ${outcome} with ${consensusScore.toFixed(2)} consensus across ${participants.length} advisors`,
      conditions: conditionalVotes.flatMap(v => v.conditions),
      dissents: votes.filter(v => v.dissent).map(v => v.dissent!.alternativeProposal),
      evidenceQuality,
    },
    startedAt: new Date(startTime).toISOString(),
    concludedAt: new Date().toISOString(),
    durationMs: Date.now() - startTime,
    replayable: true,
  };
}

// ── Learning Loop ─────────────────────────────────────────

export function computeCalibrationUpdate(
  advisorId: string,
  outcomes: RecommendationOutcome[],
  period: string,
): AdvisorCalibrationUpdate {
  const total = outcomes.length;
  if (total === 0) {
    return {
      advisorId, period, totalRecommendations: 0,
      acceptanceRate: 0, executionSuccessRate: 0, rollbackRate: 0,
      avgConfidenceWhenAccepted: 0, avgConfidenceWhenRejected: 0,
      hallucinationIncidents: 0, calibrationDelta: 0, weightAdjustment: 0,
      updatedAt: new Date().toISOString(),
    };
  }

  const accepted = outcomes.filter(o => o.signal === "accepted" || o.signal === "executed-successfully");
  const rejected = outcomes.filter(o => o.signal === "rejected");
  const rolledBack = outcomes.filter(o => o.signal === "rolled-back");
  const corrected = outcomes.filter(o => o.signal === "corrected");

  const acceptanceRate = accepted.length / total;
  const executionSuccess = outcomes.filter(o => o.signal === "executed-successfully");
  const executionSuccessRate = executionSuccess.length / Math.max(accepted.length, 1);
  const rollbackRate = rolledBack.length / Math.max(accepted.length, 1);

  // Calibration: are we overconfident or underconfident?
  // Positive delta = overconfident (high confidence but often rejected)
  // Negative delta = underconfident (low confidence but often accepted)
  const calibrationDelta = acceptanceRate < 0.5 ? 0.1 : acceptanceRate > 0.8 ? -0.05 : 0;

  return {
    advisorId,
    period,
    totalRecommendations: total,
    acceptanceRate: Math.round(acceptanceRate * 100) / 100,
    executionSuccessRate: Math.round(executionSuccessRate * 100) / 100,
    rollbackRate: Math.round(rollbackRate * 100) / 100,
    avgConfidenceWhenAccepted: 0, // would come from joined recommendation data
    avgConfidenceWhenRejected: 0,
    hallucinationIncidents: corrected.length,
    calibrationDelta,
    weightAdjustment: calibrationDelta * -1,
    updatedAt: new Date().toISOString(),
  };
}
