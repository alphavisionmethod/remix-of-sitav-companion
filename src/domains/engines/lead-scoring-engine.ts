// ═══════════════════════════════════════════════════════════════
// SITA OS — Lead Scoring & Prioritization Engine
//
// ARCHITECTURE ROLE:
//   Stateless scoring engine that transforms raw lead data into
//   explainable, weighted priority scores. Business-mode-aware.
//
//   ✅ Pure computation — no I/O or side effects
//   ✅ Deterministic — same inputs = same outputs
//   ✅ Explainable — every score has reasoning
// ═══════════════════════════════════════════════════════════════

import type {
  ProfileArchetype,
  PriorityTier,
  UrgencyBand,
  HeatStatus,
  ConfidenceLevel,
  ConversionBand,
  ScoreFactor,
  LeadScoreResult,
  ScoreableLead,
} from "@/domains/business";

// Re-export the canonical contracts so existing import paths
// (`from "@/domains/engines/lead-scoring-engine"`) keep working.
// Source of truth lives in `@/domains/business`.
export type {
  PriorityTier,
  UrgencyBand,
  HeatStatus,
  ConfidenceLevel,
  ConversionBand,
  ScoreFactor,
  LeadScoreResult,
  ScoreableLead,
};

// ── Business-Mode Weight Profiles ─────────────────────────────

interface WeightProfile {
  sourceQuality: number;
  responseSpeed: number;
  recency: number;
  engagement: number;
  fit: number;
  valuePotential: number;
  appointmentStatus: number;
  quoteIntent: number;
  communicationQuality: number;
  ownerResponsiveness: number;
  businessProfileRelevance: number;
  urgencyWindow: number;
  leadAge: number;
  priorHistory: number;
  reactivationPotential: number;
}

const WEIGHT_PROFILES: Record<string, WeightProfile> = {
  service: {
    sourceQuality: 0.08, responseSpeed: 0.09, recency: 0.07, engagement: 0.08,
    fit: 0.08, valuePotential: 0.07, appointmentStatus: 0.10, quoteIntent: 0.10,
    communicationQuality: 0.07, ownerResponsiveness: 0.06, businessProfileRelevance: 0.04,
    urgencyWindow: 0.06, leadAge: 0.04, priorHistory: 0.03, reactivationPotential: 0.03,
  },
  ecommerce: {
    sourceQuality: 0.07, responseSpeed: 0.06, recency: 0.10, engagement: 0.12,
    fit: 0.06, valuePotential: 0.09, appointmentStatus: 0.03, quoteIntent: 0.04,
    communicationQuality: 0.05, ownerResponsiveness: 0.04, businessProfileRelevance: 0.05,
    urgencyWindow: 0.08, leadAge: 0.06, priorHistory: 0.08, reactivationPotential: 0.07,
  },
  "brick-and-mortar": {
    sourceQuality: 0.07, responseSpeed: 0.08, recency: 0.09, engagement: 0.07,
    fit: 0.06, valuePotential: 0.06, appointmentStatus: 0.12, quoteIntent: 0.06,
    communicationQuality: 0.06, ownerResponsiveness: 0.05, businessProfileRelevance: 0.08,
    urgencyWindow: 0.08, leadAge: 0.05, priorHistory: 0.04, reactivationPotential: 0.03,
  },
  "employee-based": {
    sourceQuality: 0.06, responseSpeed: 0.07, recency: 0.06, engagement: 0.07,
    fit: 0.07, valuePotential: 0.07, appointmentStatus: 0.07, quoteIntent: 0.07,
    communicationQuality: 0.06, ownerResponsiveness: 0.10, businessProfileRelevance: 0.05,
    urgencyWindow: 0.07, leadAge: 0.05, priorHistory: 0.06, reactivationPotential: 0.07,
  },
  hybrid: {
    sourceQuality: 0.07, responseSpeed: 0.07, recency: 0.07, engagement: 0.08,
    fit: 0.07, valuePotential: 0.07, appointmentStatus: 0.07, quoteIntent: 0.07,
    communicationQuality: 0.06, ownerResponsiveness: 0.06, businessProfileRelevance: 0.06,
    urgencyWindow: 0.07, leadAge: 0.05, priorHistory: 0.06, reactivationPotential: 0.07,
  },
};

function getWeights(mode: string): WeightProfile {
  // Map various archetype names to weight profiles
  if (mode.includes("ecommerce") || mode.includes("marketplace")) return WEIGHT_PROFILES.ecommerce;
  if (mode.includes("brick") || mode.includes("local") || mode.includes("location")) return WEIGHT_PROFILES["brick-and-mortar"];
  if (mode.includes("employee") || mode.includes("team")) return WEIGHT_PROFILES["employee-based"];
  if (mode.includes("service") || mode.includes("agency") || mode.includes("professional") || mode.includes("appointment")) return WEIGHT_PROFILES.service;
  return WEIGHT_PROFILES.hybrid;
}

// ── Source Quality Map ────────────────────────────────────────

const SOURCE_QUALITY: Record<string, number> = {
  referral: 90, partner: 88, message: 75, website: 70,
  "crm-sync": 65, social: 55, campaign: 50, import: 35,
  manual: 60, email: 60, webhook: 55, voice: 65,
};

// ── Factor Computation ────────────────────────────────────────

function computeFactors(lead: ScoreableLead, weights: WeightProfile): ScoreFactor[] {
  const factors: ScoreFactor[] = [];
  const now = Date.now();
  const createdMs = new Date(lead.created_at).getTime();
  const ageHours = (now - createdMs) / 3600000;
  const lastActivityMs = lead.last_activity_at ? new Date(lead.last_activity_at).getTime() : createdMs;
  const silenceHours = (now - lastActivityMs) / 3600000;

  // 1. Source Quality
  const srcScore = SOURCE_QUALITY[lead.source] ?? 50;
  factors.push({
    key: "sourceQuality", label: "Source Quality",
    rawValue: srcScore, normalizedScore: srcScore, weight: weights.sourceQuality,
    polarity: srcScore >= 70 ? "positive" : srcScore >= 50 ? "neutral" : "negative",
    explanation: srcScore >= 80 ? `${lead.source} source — historically strong conversion` : srcScore >= 60 ? `${lead.source} source — moderate quality` : `${lead.source} source — lower initial confidence`,
  });

  // 2. Response Speed
  const respTime = lead.response_time_minutes;
  let respScore = 50;
  if (respTime != null) {
    if (respTime <= 5) respScore = 100;
    else if (respTime <= 15) respScore = 90;
    else if (respTime <= 60) respScore = 75;
    else if (respTime <= 240) respScore = 55;
    else if (respTime <= 1440) respScore = 35;
    else respScore = 15;
  }
  factors.push({
    key: "responseSpeed", label: "Response Speed",
    rawValue: respTime ?? -1, normalizedScore: respScore, weight: weights.responseSpeed,
    polarity: respScore >= 70 ? "positive" : respScore >= 40 ? "neutral" : "negative",
    explanation: respTime == null ? "No response recorded yet" : respTime <= 15 ? "Fast response — strong signal" : respTime > 240 ? "Slow response — opportunity may degrade" : "Moderate response time",
  });

  // 3. Recency
  let recencyScore = 100;
  if (silenceHours < 1) recencyScore = 100;
  else if (silenceHours < 4) recencyScore = 90;
  else if (silenceHours < 12) recencyScore = 75;
  else if (silenceHours < 24) recencyScore = 60;
  else if (silenceHours < 72) recencyScore = 40;
  else if (silenceHours < 168) recencyScore = 25;
  else recencyScore = 10;
  factors.push({
    key: "recency", label: "Recency",
    rawValue: silenceHours, normalizedScore: recencyScore, weight: weights.recency,
    polarity: recencyScore >= 60 ? "positive" : recencyScore >= 30 ? "neutral" : "negative",
    explanation: silenceHours < 4 ? "Very recent activity" : silenceHours < 24 ? "Active within last day" : silenceHours < 72 ? "Aging — no recent activity" : "Going stale",
  });

  // 4. Engagement
  const engEvents = lead.engagement_events ?? 0;
  const replied = lead.replied_to_outreach ?? false;
  let engScore = Math.min(100, engEvents * 20 + (replied ? 30 : 0));
  if (lead.engagement_quality === "high") engScore = Math.min(100, engScore + 20);
  factors.push({
    key: "engagement", label: "Engagement",
    rawValue: engEvents, normalizedScore: engScore, weight: weights.engagement,
    polarity: engScore >= 50 ? "positive" : engScore > 0 ? "neutral" : "negative",
    explanation: engScore >= 70 ? "Strong engagement signals" : engScore >= 30 ? "Some engagement observed" : "No engagement yet",
  });

  // 5. Fit (derived from completeness + quality hints)
  const fitScore = Math.min(100, lead.completeness_score * 0.6 + lead.quality_hints.length * 12);
  factors.push({
    key: "fit", label: "Business Fit",
    rawValue: fitScore, normalizedScore: fitScore, weight: weights.fit,
    polarity: fitScore >= 65 ? "positive" : fitScore >= 40 ? "neutral" : "negative",
    explanation: fitScore >= 75 ? "Strong fit with business model" : fitScore >= 50 ? "Moderate fit" : "Weak or uncertain fit",
  });

  // 6. Value Potential
  const estValue = lead.estimated_value ?? 0;
  let valueScore = 30; // default moderate
  if (estValue >= 100000) valueScore = 100;
  else if (estValue >= 50000) valueScore = 90;
  else if (estValue >= 10000) valueScore = 75;
  else if (estValue >= 5000) valueScore = 60;
  else if (estValue >= 1000) valueScore = 45;
  else if (estValue > 0) valueScore = 30;
  // Boost from quality hints
  if (lead.quality_hints.some(h => h.toLowerCase().includes("budget"))) valueScore = Math.min(100, valueScore + 15);
  if (lead.quality_hints.some(h => h.toLowerCase().includes("enterprise"))) valueScore = Math.min(100, valueScore + 20);
  factors.push({
    key: "valuePotential", label: "Value Potential",
    rawValue: estValue, normalizedScore: valueScore, weight: weights.valuePotential,
    polarity: valueScore >= 60 ? "positive" : valueScore >= 35 ? "neutral" : "negative",
    explanation: valueScore >= 80 ? "High commercial value opportunity" : valueScore >= 50 ? "Moderate value potential" : "Low or unconfirmed value",
  });

  // 7. Appointment / Booked Consult
  const apptScore = lead.appointment_booked ? 100 : 0;
  factors.push({
    key: "appointmentStatus", label: "Appointment Booked",
    rawValue: apptScore, normalizedScore: apptScore, weight: weights.appointmentStatus,
    polarity: apptScore > 0 ? "positive" : "neutral",
    explanation: apptScore > 0 ? "Consult or appointment booked — strong intent" : "No appointment scheduled",
  });

  // 8. Quote Intent
  const quoteScore = lead.quote_requested ? 100 : (lead.suggested_route === "quote" ? 60 : 0);
  factors.push({
    key: "quoteIntent", label: "Quote/Proposal Intent",
    rawValue: quoteScore, normalizedScore: quoteScore, weight: weights.quoteIntent,
    polarity: quoteScore >= 60 ? "positive" : "neutral",
    explanation: quoteScore >= 80 ? "Explicit quote/proposal request — high conversion readiness" : quoteScore >= 40 ? "Suggested for quote routing" : "No quote intent detected",
  });

  // 9. Communication Quality
  const commCount = lead.communication_count ?? 0;
  let commScore = Math.min(100, commCount * 25);
  if (lead.inquiry_text && lead.inquiry_text.length > 100) commScore = Math.min(100, commScore + 20);
  if (lead.inquiry_text && (lead.inquiry_text.includes("budget") || lead.inquiry_text.includes("deadline") || lead.inquiry_text.includes("proposal"))) {
    commScore = Math.min(100, commScore + 15);
  }
  factors.push({
    key: "communicationQuality", label: "Communication Quality",
    rawValue: commCount, normalizedScore: commScore, weight: weights.communicationQuality,
    polarity: commScore >= 50 ? "positive" : commScore > 0 ? "neutral" : "negative",
    explanation: commScore >= 70 ? "Clear, detailed communication with commitment signals" : commScore >= 30 ? "Some communication history" : "Minimal or no communication",
  });

  // 10. Owner Responsiveness
  let ownerScore = 40;
  if (lead.owner_assigned) {
    ownerScore = 60;
    if (lead.owner_last_action_at) {
      const ownerSilence = (now - new Date(lead.owner_last_action_at).getTime()) / 3600000;
      if (ownerSilence < 4) ownerScore = 95;
      else if (ownerSilence < 12) ownerScore = 80;
      else if (ownerSilence < 24) ownerScore = 65;
      else ownerScore = 35;
    }
  } else {
    ownerScore = 20;
  }
  factors.push({
    key: "ownerResponsiveness", label: "Owner Responsiveness",
    rawValue: ownerScore, normalizedScore: ownerScore, weight: weights.ownerResponsiveness,
    polarity: ownerScore >= 60 ? "positive" : ownerScore >= 35 ? "neutral" : "negative",
    explanation: !lead.owner_assigned ? "No owner assigned — unserved lead" : ownerScore >= 70 ? "Owner is actively engaged" : "Owner response is delayed",
  });

  // 11. Business Profile Relevance (use completeness as proxy)
  const bprScore = lead.completeness_score;
  factors.push({
    key: "businessProfileRelevance", label: "Profile Relevance",
    rawValue: bprScore, normalizedScore: bprScore, weight: weights.businessProfileRelevance,
    polarity: bprScore >= 70 ? "positive" : bprScore >= 50 ? "neutral" : "negative",
    explanation: bprScore >= 80 ? "Complete profile — high data confidence" : bprScore >= 50 ? "Partial data available" : "Sparse record — needs enrichment",
  });

  // 12. Urgency Window
  const urgMap: Record<string, number> = { critical: 100, high: 80, medium: 50, low: 20 };
  const urgScore = urgMap[lead.urgency] ?? 30;
  factors.push({
    key: "urgencyWindow", label: "Urgency Window",
    rawValue: urgScore, normalizedScore: urgScore, weight: weights.urgencyWindow,
    polarity: urgScore >= 70 ? "positive" : urgScore >= 40 ? "neutral" : "negative",
    explanation: urgScore >= 80 ? "Narrow action window — time-critical" : urgScore >= 50 ? "Moderate urgency" : "No pressing timeline",
  });

  // 13. Lead Age
  let ageScore = 100;
  if (ageHours < 1) ageScore = 100;
  else if (ageHours < 4) ageScore = 90;
  else if (ageHours < 12) ageScore = 75;
  else if (ageHours < 24) ageScore = 60;
  else if (ageHours < 72) ageScore = 40;
  else if (ageHours < 168) ageScore = 25;
  else ageScore = 10;
  factors.push({
    key: "leadAge", label: "Lead Freshness",
    rawValue: ageHours, normalizedScore: ageScore, weight: weights.leadAge,
    polarity: ageScore >= 60 ? "positive" : ageScore >= 30 ? "neutral" : "negative",
    explanation: ageScore >= 80 ? "Fresh lead — recently arrived" : ageScore >= 50 ? "Moderate age" : "Aging lead — may require recovery approach",
  });

  // 14. Prior History
  let histScore = 30;
  if (lead.prior_customer) histScore = 90;
  if (lead.quality_hints.some(h => h.toLowerCase().includes("returning") || h.toLowerCase().includes("repeat"))) histScore = Math.min(100, histScore + 30);
  factors.push({
    key: "priorHistory", label: "Prior History",
    rawValue: histScore, normalizedScore: histScore, weight: weights.priorHistory,
    polarity: histScore >= 60 ? "positive" : "neutral",
    explanation: histScore >= 70 ? "Known account with prior relationship" : "No significant prior history",
  });

  // 15. Reactivation Potential
  let reactivation = 0;
  if (lead.triage_status === "snoozed" || (silenceHours > 72 && engEvents > 0)) {
    reactivation = 60;
    if (lead.prior_customer) reactivation += 20;
    if (lead.quote_requested) reactivation += 15;
    if (lead.estimated_value && lead.estimated_value > 5000) reactivation += 10;
  }
  reactivation = Math.min(100, reactivation);
  factors.push({
    key: "reactivationPotential", label: "Reactivation Potential",
    rawValue: reactivation, normalizedScore: reactivation, weight: weights.reactivationPotential,
    polarity: reactivation >= 50 ? "positive" : "neutral",
    explanation: reactivation >= 60 ? "Worth re-engaging — prior signals were strong" : "Not a current reactivation candidate",
  });

  return factors;
}

// ── Derived Computations ──────────────────────────────────────

function computePriorityScore(factors: ScoreFactor[]): number {
  let weighted = 0;
  let totalWeight = 0;
  for (const f of factors) {
    weighted += f.normalizedScore * f.weight;
    totalWeight += f.weight;
  }
  return totalWeight > 0 ? Math.round(weighted / totalWeight) : 0;
}

function derivePriorityTier(score: number, lead: ScoreableLead): PriorityTier {
  if (lead.suggested_route === "spam") return "low-priority";
  if (score >= 85 || (score >= 75 && lead.urgency === "critical")) return "critical-now";
  if (score >= 70) return "high-priority";
  if (score >= 55) return "active-watch";
  if (score >= 40) return "nurture";
  if (score >= 25 && lead.triage_status !== "rejected") return "recovery-candidate";
  return "low-priority";
}

function deriveConversionBand(score: number, factors: ScoreFactor[]): ConversionBand {
  const engagement = factors.find(f => f.key === "engagement")?.normalizedScore ?? 0;
  const intent = factors.find(f => f.key === "quoteIntent")?.normalizedScore ?? 0;
  const combined = score * 0.5 + engagement * 0.25 + intent * 0.25;
  if (combined >= 80) return "very-likely";
  if (combined >= 60) return "likely";
  if (combined >= 40) return "possible";
  if (combined >= 20) return "unlikely";
  return "insufficient-data";
}

function deriveUrgencyBand(factors: ScoreFactor[], lead: ScoreableLead): UrgencyBand {
  const urgency = factors.find(f => f.key === "urgencyWindow")?.normalizedScore ?? 0;
  const recency = factors.find(f => f.key === "recency")?.normalizedScore ?? 0;
  const age = factors.find(f => f.key === "leadAge")?.normalizedScore ?? 0;

  if (urgency >= 80 && recency >= 70) return "heating-up";
  if (urgency >= 60 || (lead.urgency === "critical")) return "needs-response-today";
  if (recency < 40 && age < 40) return "at-risk-of-cooling";
  if (recency < 30) return "quiet-but-recoverable";
  return "stable";
}

function deriveHeatStatus(score: number, recency: number, engagement: number): HeatStatus {
  if (score >= 75 && recency >= 70) return "hot";
  if (score >= 55 && recency >= 50) return "warm";
  if (recency < 30 && engagement > 20) return "recovering";
  if (recency < 30) return "cold";
  return "cooling";
}

function deriveStaleRisk(factors: ScoreFactor[]): number {
  const recency = factors.find(f => f.key === "recency")?.normalizedScore ?? 50;
  const age = factors.find(f => f.key === "leadAge")?.normalizedScore ?? 50;
  const owner = factors.find(f => f.key === "ownerResponsiveness")?.normalizedScore ?? 50;
  return Math.round(Math.max(0, 100 - (recency * 0.4 + age * 0.3 + owner * 0.3)));
}

function deriveConfidence(lead: ScoreableLead): { level: ConfidenceLevel; score: number } {
  let score = 30;
  if (lead.contact_email) score += 8;
  if (lead.contact_phone) score += 7;
  if (lead.company) score += 8;
  if (lead.inquiry_text && lead.inquiry_text.length > 20) score += 10;
  if (lead.quality_hints.length > 0) score += lead.quality_hints.length * 4;
  if (lead.engagement_events && lead.engagement_events > 0) score += 8;
  if (lead.communication_count && lead.communication_count > 0) score += 7;
  if (lead.estimated_value) score += 6;
  if (lead.appointment_booked) score += 8;
  score = Math.min(100, score);
  const level: ConfidenceLevel = score >= 75 ? "strong" : score >= 50 ? "moderate" : "low";
  return { level, score };
}

function deriveNextBestAction(lead: ScoreableLead, tier: PriorityTier, factors: ScoreFactor[]): { action: string; type: LeadScoreResult["nextBestActionType"] } {
  if (lead.suggested_route === "spam") return { action: "Archive as spam", type: "archive" };
  if (lead.duplicate_status !== "none") return { action: "Review duplicate match before proceeding", type: "review" };
  if (lead.missing_fields.length >= 3) return { action: "Enrich record — too many missing fields for confident routing", type: "enrich" };

  if (tier === "critical-now") {
    if (!lead.owner_assigned && !lead.suggested_owner) return { action: "Assign immediately — critical unowned lead", type: "assign" };
    if (lead.quote_requested || lead.suggested_route === "quote") return { action: "Send proposal/quote today", type: "respond" };
    if (lead.appointment_booked) return { action: "Prepare for scheduled consultation", type: "schedule" };
    return { action: "Respond now — this lead requires immediate attention", type: "respond" };
  }

  if (tier === "high-priority") {
    if (lead.suggested_route === "boardroom") return { action: "Escalate to Boardroom for strategic review", type: "escalate" };
    if (lead.appointment_booked) return { action: "Confirm and prepare for consultation", type: "schedule" };
    return { action: "Follow up within 4 hours", type: "follow-up" };
  }

  if (tier === "recovery-candidate") return { action: "Consider re-engagement — this lead may still have potential", type: "recover" };
  if (tier === "nurture") return { action: "Add to nurture sequence for periodic touch", type: "follow-up" };

  const ownerFactor = factors.find(f => f.key === "ownerResponsiveness");
  if (ownerFactor && ownerFactor.normalizedScore < 30) return { action: "Reassign — current owner is unresponsive", type: "assign" };

  return { action: "Review and route appropriately", type: "review" };
}

function deriveValueBand(factors: ScoreFactor[]): LeadScoreResult["valuePotentialBand"] {
  const val = factors.find(f => f.key === "valuePotential")?.normalizedScore ?? 0;
  const history = factors.find(f => f.key === "priorHistory")?.normalizedScore ?? 0;
  if (history >= 70) return "repeat-value";
  if (val >= 85) return "strategic";
  if (val >= 65) return "high-value";
  if (val >= 40) return "moderate";
  return "low";
}

function deriveTimingSensitivity(factors: ScoreFactor[]): LeadScoreResult["timingSensitivity"] {
  const urgency = factors.find(f => f.key === "urgencyWindow")?.normalizedScore ?? 0;
  const recency = factors.find(f => f.key === "recency")?.normalizedScore ?? 0;
  if (urgency >= 80) return "narrow-window";
  if (urgency >= 60 || recency >= 80) return "time-sensitive";
  if (urgency >= 40) return "standard";
  return "flexible";
}

function buildExplanation(tier: PriorityTier, positives: ScoreFactor[], negatives: ScoreFactor[], confidence: ConfidenceLevel): string {
  const pos = positives.slice(0, 2).map(f => f.explanation).join(". ");
  const neg = negatives.length > 0 ? ` However: ${negatives[0].explanation}.` : "";
  const conf = confidence === "low" ? " Confidence is limited due to sparse data." : "";
  const tierLabel = tier.replace(/-/g, " ");
  return `${tierLabel.charAt(0).toUpperCase() + tierLabel.slice(1)} — ${pos}.${neg}${conf}`;
}

// ── Main Scoring Function ─────────────────────────────────────

export function computeLeadScore(lead: ScoreableLead, businessMode: string = "hybrid"): LeadScoreResult {
  const weights = getWeights(businessMode);
  const factors = computeFactors(lead, weights);
  const priorityScore = computePriorityScore(factors);
  const tier = derivePriorityTier(priorityScore, lead);
  const conversionLikelihood = deriveConversionBand(priorityScore, factors);

  const recencyFactor = factors.find(f => f.key === "recency")!;
  const engagementFactor = factors.find(f => f.key === "engagement")!;

  const urgencyBand = deriveUrgencyBand(factors, lead);
  const heatStatus = deriveHeatStatus(priorityScore, recencyFactor.normalizedScore, engagementFactor.normalizedScore);
  const staleRisk = deriveStaleRisk(factors);
  const reactivation = factors.find(f => f.key === "reactivationPotential")!.normalizedScore;
  const confidence = deriveConfidence(lead);
  const { action, type } = deriveNextBestAction(lead, tier, factors);

  const sorted = [...factors].sort((a, b) => (b.normalizedScore * b.weight) - (a.normalizedScore * a.weight));
  const positives = sorted.filter(f => f.polarity === "positive").slice(0, 3);
  const negatives = sorted.filter(f => f.polarity === "negative").slice(0, 3);

  const boardroomWorthy = lead.suggested_route === "boardroom" || (priorityScore >= 85 && (factors.find(f => f.key === "valuePotential")?.normalizedScore ?? 0) >= 80);

  return {
    leadId: lead.id,
    priorityScore,
    priorityTier: tier,
    conversionLikelihood,
    urgencyBand,
    heatStatus,
    staleRisk,
    recoveryPotential: reactivation,
    boardroomWorthy,
    confidenceLevel: confidence.level,
    confidenceScore: confidence.score,
    nextBestAction: action,
    nextBestActionType: type,
    topPositiveFactors: positives,
    topNegativeFactors: negatives,
    allFactors: factors,
    explanation: buildExplanation(tier, positives, negatives, confidence.level),
    whatChanged: [],
    valuePotentialBand: deriveValueBand(factors),
    timingSensitivity: deriveTimingSensitivity(factors),
    businessModeUsed: businessMode,
  };
}

// ── Batch Scoring ─────────────────────────────────────────────

export function computeBatchScores(leads: ScoreableLead[], businessMode: string = "hybrid"): LeadScoreResult[] {
  return leads
    .map(lead => computeLeadScore(lead, businessMode))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

// ── Tier Labels & Colors ──────────────────────────────────────

export const PRIORITY_TIER_META: Record<PriorityTier, { label: string; color: string; icon: string }> = {
  "critical-now": { label: "Critical Now", color: "hsl(var(--urgency-critical))", icon: "🔴" },
  "high-priority": { label: "High Priority", color: "hsl(var(--urgency-high))", icon: "🟠" },
  "active-watch": { label: "Active Watch", color: "hsl(var(--sita-gold))", icon: "🟡" },
  "nurture": { label: "Nurture", color: "hsl(var(--trust-safe))", icon: "🟢" },
  "recovery-candidate": { label: "Recovery", color: "hsl(var(--accent))", icon: "🔵" },
  "low-priority": { label: "Low Priority", color: "hsl(var(--muted-foreground))", icon: "⚪" },
};

export const HEAT_STATUS_META: Record<HeatStatus, { label: string; color: string }> = {
  hot: { label: "Heating Up", color: "hsl(var(--urgency-critical))" },
  warm: { label: "Warm", color: "hsl(var(--urgency-high))" },
  cooling: { label: "Cooling", color: "hsl(var(--sita-gold))" },
  cold: { label: "Cold", color: "hsl(var(--muted-foreground))" },
  recovering: { label: "Recovering", color: "hsl(var(--accent))" },
};

export const URGENCY_BAND_META: Record<UrgencyBand, { label: string; color: string }> = {
  "heating-up": { label: "Heating Up", color: "hsl(var(--urgency-critical))" },
  "needs-response-today": { label: "Needs Response Today", color: "hsl(var(--urgency-high))" },
  "at-risk-of-cooling": { label: "At Risk of Cooling", color: "hsl(var(--sita-gold))" },
  "quiet-but-recoverable": { label: "Quiet but Recoverable", color: "hsl(var(--accent))" },
  "stable": { label: "Stable", color: "hsl(var(--trust-safe))" },
};

export const CONFIDENCE_META: Record<ConfidenceLevel, { label: string; description: string }> = {
  strong: { label: "Strong Confidence", description: "Supported by multiple direct engagement signals" },
  moderate: { label: "Moderate Confidence", description: "Some inferred fit, but interaction history is limited" },
  low: { label: "Low Confidence", description: "Imported or sparse lead with weak context" },
};
