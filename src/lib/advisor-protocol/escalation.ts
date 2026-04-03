// ═══════════════════════════════════════════════════════════════
// SITA OS — Council Escalation Protocol
// Formal escalation chain when advisor councils fail consensus,
// hit confidence floor, or encounter policy violations
// ═══════════════════════════════════════════════════════════════

import type { CouncilRecommendation } from "./index";

// ── Escalation Types ─────────────────────────────────────────

export type EscalationTrigger =
  | "consensus-failure"
  | "confidence-below-threshold"
  | "blocking-disagreement"
  | "autonomy-ceiling-reached"
  | "policy-violation"
  | "cross-domain-conflict"
  | "handoff-rejected"
  | "repeated-correction";

export type EscalationTargetRole =
  | "meta-advisor"
  | "owner"
  | "trust-policy-advisor"
  | "recovery-advisor"
  | "chief-of-staff";

export type EscalationSeverity = "informational" | "standard" | "urgent" | "critical";

export interface EscalationTarget {
  role: EscalationTargetRole;
  advisorId: string;
  reason: string;
}

export interface EscalationPackage {
  id: string;
  trigger: EscalationTrigger;
  severity: EscalationSeverity;
  target: EscalationTarget;
  sourceCouncil: string;
  sourceAdvisorId: string;
  context: {
    recommendations: CouncilRecommendation[];
    disagreements: EscalationDisagreement[];
    confidenceScores: Record<string, number>;
    policyViolations: string[];
    proofRefs: string[];
  };
  suggestedResolution: string;
  createdAt: string;
  tenantId: string;
  status: "pending" | "acknowledged" | "resolved" | "overridden";
}

export interface EscalationDisagreement {
  advisorA: string;
  advisorB: string;
  topic: string;
  positionA: string;
  positionB: string;
  isBlocking: boolean;
}

// ── Escalation History ───────────────────────────────────────

const escalationLog: EscalationPackage[] = [];

// ── Routing Rules ────────────────────────────────────────────

/**
 * Determines escalation target based on trigger type and domain.
 * 
 * Rules:
 * - blocking-disagreement → always owner (human must decide)
 * - consensus-failure → meta-advisor first
 * - policy-violation → trust-policy-advisor
 * - cross-domain-conflict → chief-of-staff
 * - confidence-below-threshold → meta-advisor
 * - autonomy-ceiling-reached → owner
 * - handoff-rejected → chief-of-staff
 * - repeated-correction → meta-advisor
 */
function resolveEscalationTarget(trigger: EscalationTrigger): EscalationTarget {
  switch (trigger) {
    case "blocking-disagreement":
      return { role: "owner", advisorId: "owner", reason: "Blocking disagreement requires human decision" };
    case "consensus-failure":
      return { role: "meta-advisor", advisorId: "chief-of-staff", reason: "Council failed consensus — meta-advisor synthesis needed" };
    case "policy-violation":
      return { role: "trust-policy-advisor", advisorId: "trust-policy-advisor", reason: "Policy violation detected — trust review required" };
    case "cross-domain-conflict":
      return { role: "chief-of-staff", advisorId: "chief-of-staff", reason: "Cross-domain conflict needs chief-of-staff arbitration" };
    case "confidence-below-threshold":
      return { role: "meta-advisor", advisorId: "chief-of-staff", reason: "Confidence too low for autonomous action" };
    case "autonomy-ceiling-reached":
      return { role: "owner", advisorId: "owner", reason: "Advisor autonomy ceiling reached — owner approval required" };
    case "handoff-rejected":
      return { role: "chief-of-staff", advisorId: "chief-of-staff", reason: "Handoff rejected — chief-of-staff must reroute" };
    case "repeated-correction":
      return { role: "meta-advisor", advisorId: "chief-of-staff", reason: "Repeated corrections indicate advisor needs recalibration" };
  }
}

function computeSeverity(trigger: EscalationTrigger, confidenceScores: Record<string, number>): EscalationSeverity {
  // Policy violations and blocking disagreements are always urgent+
  if (trigger === "policy-violation") return "critical";
  if (trigger === "blocking-disagreement") return "urgent";

  // Low overall confidence is urgent
  const scores = Object.values(confidenceScores);
  const avgConfidence = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  if (avgConfidence < 30) return "urgent";
  if (avgConfidence < 50) return "standard";

  // Everything else
  if (trigger === "autonomy-ceiling-reached" || trigger === "cross-domain-conflict") return "standard";
  return "informational";
}

// ── Core Escalation Functions ────────────────────────────────

/**
 * Evaluate whether a council synthesis result requires escalation.
 */
export function evaluateEscalation(params: {
  recommendations: CouncilRecommendation[];
  confidenceThreshold: number;
  council: string;
}): { needsEscalation: boolean; triggers: EscalationTrigger[] } {
  const triggers: EscalationTrigger[] = [];

  // Check for blocking disagreements
  const hasBlocking = params.recommendations.some(
    r => r.riskAssessment === "critical" && r.confidence < 40
  );
  if (hasBlocking) triggers.push("blocking-disagreement");

  // Check for consensus failure (high variance in recommendations)
  if (params.recommendations.length >= 2) {
    const confidences = params.recommendations.map(r => r.confidence);
    const max = Math.max(...confidences);
    const min = Math.min(...confidences);
    if (max - min > 40) triggers.push("consensus-failure");
  }

  // Check for confidence below threshold
  const avgConfidence = params.recommendations.length > 0
    ? params.recommendations.reduce((s, r) => s + r.confidence, 0) / params.recommendations.length
    : 0;
  if (avgConfidence < params.confidenceThreshold) {
    triggers.push("confidence-below-threshold");
  }

  // Check for policy violations flagged in caveats
  const hasPolicyViolation = params.recommendations.some(
    r => r.caveats?.some(c => c.toLowerCase().includes("policy") || c.toLowerCase().includes("violation"))
  );
  if (hasPolicyViolation) triggers.push("policy-violation");

  return { needsEscalation: triggers.length > 0, triggers };
}

/**
 * Route an escalation to the appropriate target and create the package.
 */
export function routeEscalation(params: {
  trigger: EscalationTrigger;
  sourceCouncil: string;
  sourceAdvisorId: string;
  recommendations: CouncilRecommendation[];
  disagreements?: EscalationDisagreement[];
  policyViolations?: string[];
  proofRefs?: string[];
  tenantId: string;
}): EscalationPackage {
  const target = resolveEscalationTarget(params.trigger);

  const confidenceScores: Record<string, number> = {};
  params.recommendations.forEach(r => {
    confidenceScores[r.advisorId] = r.confidence;
  });

  const severity = computeSeverity(params.trigger, confidenceScores);

  const pkg: EscalationPackage = {
    id: crypto.randomUUID(),
    trigger: params.trigger,
    severity,
    target,
    sourceCouncil: params.sourceCouncil,
    sourceAdvisorId: params.sourceAdvisorId,
    context: {
      recommendations: params.recommendations,
      disagreements: params.disagreements || [],
      confidenceScores,
      policyViolations: params.policyViolations || [],
      proofRefs: params.proofRefs || [],
    },
    suggestedResolution: buildResolutionSuggestion(params.trigger, params.recommendations),
    createdAt: new Date().toISOString(),
    tenantId: params.tenantId,
    status: "pending",
  };

  escalationLog.push(pkg);
  return pkg;
}

/**
 * Create a complete escalation package from a full council evaluation.
 */
export function createEscalationPackage(params: {
  recommendations: CouncilRecommendation[];
  council: string;
  sourceAdvisorId: string;
  confidenceThreshold: number;
  tenantId: string;
}): EscalationPackage[] {
  const { needsEscalation, triggers } = evaluateEscalation({
    recommendations: params.recommendations,
    confidenceThreshold: params.confidenceThreshold,
    council: params.council,
  });

  if (!needsEscalation) return [];

  return triggers.map(trigger =>
    routeEscalation({
      trigger,
      sourceCouncil: params.council,
      sourceAdvisorId: params.sourceAdvisorId,
      recommendations: params.recommendations,
      tenantId: params.tenantId,
    })
  );
}

/**
 * Acknowledge an escalation (target has seen it).
 */
export function acknowledgeEscalation(escalationId: string): void {
  const pkg = escalationLog.find(e => e.id === escalationId);
  if (!pkg) throw new Error(`Escalation ${escalationId} not found`);
  pkg.status = "acknowledged";
}

/**
 * Resolve an escalation with a decision.
 */
export function resolveEscalation(escalationId: string): void {
  const pkg = escalationLog.find(e => e.id === escalationId);
  if (!pkg) throw new Error(`Escalation ${escalationId} not found`);
  pkg.status = "resolved";
}

/**
 * Owner overrides an escalation — bypasses normal resolution.
 */
export function overrideEscalation(escalationId: string): void {
  const pkg = escalationLog.find(e => e.id === escalationId);
  if (!pkg) throw new Error(`Escalation ${escalationId} not found`);
  pkg.status = "overridden";
}

// ── Queries ──────────────────────────────────────────────────

export function getEscalationLog(): EscalationPackage[] {
  return [...escalationLog];
}

export function getPendingEscalations(targetAdvisorId: string): EscalationPackage[] {
  return escalationLog.filter(
    e => e.target.advisorId === targetAdvisorId && e.status === "pending"
  );
}

export function getEscalationsByTenant(tenantId: string): EscalationPackage[] {
  return escalationLog.filter(e => e.tenantId === tenantId);
}

// ── Helpers ──────────────────────────────────────────────────

function buildResolutionSuggestion(
  trigger: EscalationTrigger,
  recommendations: CouncilRecommendation[]
): string {
  const topRec = [...recommendations].sort((a, b) => b.confidence - a.confidence)[0];
  const topAction = topRec?.preferredAction || "gather more data";

  switch (trigger) {
    case "consensus-failure":
      return `Council could not reach consensus. Top recommendation (${topRec?.confidence || 0}% confidence): ${topAction}. Consider requesting additional data or owner input.`;
    case "blocking-disagreement":
      return `Blocking disagreement detected. Present both positions to owner for decision.`;
    case "confidence-below-threshold":
      return `Overall confidence is below threshold. Recommend gathering additional data before acting. Top suggestion: ${topAction}.`;
    case "policy-violation":
      return `Policy violation detected. Action blocked. Trust-policy-advisor must review before any execution.`;
    case "autonomy-ceiling-reached":
      return `Advisor has reached its autonomy ceiling. Owner approval required to proceed with: ${topAction}.`;
    case "cross-domain-conflict":
      return `Cross-domain conflict between councils. Chief-of-staff arbitration needed.`;
    case "handoff-rejected":
      return `Handoff was rejected by target advisor. Chief-of-staff must find alternative routing.`;
    case "repeated-correction":
      return `Advisor has been repeatedly corrected. Recommend recalibration or temporary demotion.`;
  }
}
