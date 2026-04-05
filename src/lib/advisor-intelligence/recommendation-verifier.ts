// ═══════════════════════════════════════════════════════════════
// SITA OS — Recommendation Verifier / Critic Layer
// Second-pass verification for advisor recommendations:
// factuality, policy, evidence, contradiction, scope, hallucination
// ═══════════════════════════════════════════════════════════════

import type {
  RecommendationV2,
  CritiqueResult,
  CritiqueType,
  VerificationPass,
  StructuredClaim,
  AdvisorSpecializationContract,
} from "./types";
import { getSpecialization } from "./specializations";

// ── Individual Critique Functions ─────────────────────────

function critiqueFactuality(rec: RecommendationV2, spec: AdvisorSpecializationContract): CritiqueResult {
  const ungroundedFacts = rec.structuredOutput.facts.filter(f => !f.isGrounded);
  if (ungroundedFacts.length > 0) {
    return {
      type: "factuality",
      passed: false,
      severity: "block",
      finding: `${ungroundedFacts.length} fact claim(s) lack evidence grounding: ${ungroundedFacts.map(f => f.statement).join("; ")}`,
      affectedClaims: ungroundedFacts.map(f => f.id),
      suggestedRevision: "Move ungrounded facts to inferences or unknowns",
    };
  }
  return { type: "factuality", passed: true, severity: "info", finding: "All facts grounded", affectedClaims: [] };
}

function critiqueEvidenceSufficiency(rec: RecommendationV2, spec: AdvisorSpecializationContract): CritiqueResult {
  const { evidence } = rec;
  if (evidence.totalSources === 0) {
    return {
      type: "evidence-sufficiency",
      passed: false,
      severity: "block",
      finding: "Recommendation has zero evidence sources",
      affectedClaims: rec.structuredOutput.recommendations.map(r => r.id),
    };
  }

  if (evidence.overallFreshness === "critical" || evidence.overallFreshness === "stale") {
    return {
      type: "evidence-sufficiency",
      passed: false,
      severity: "warning",
      finding: `Evidence freshness is ${evidence.overallFreshness} — recommendations may be unreliable`,
      affectedClaims: [],
    };
  }

  if (evidence.gapsDetected.length > 2) {
    return {
      type: "evidence-sufficiency",
      passed: false,
      severity: "warning",
      finding: `${evidence.gapsDetected.length} evidence gaps detected`,
      affectedClaims: [],
    };
  }

  return { type: "evidence-sufficiency", passed: true, severity: "info", finding: "Evidence sufficient", affectedClaims: [] };
}

function critiquePolicyCompliance(rec: RecommendationV2, spec: AdvisorSpecializationContract): CritiqueResult {
  // Check if recommendations require simulation but none was run
  if (spec.simulationPolicy === "required-for-action" && !rec.simulationBasis.ran) {
    const actionRecs = rec.structuredOutput.recommendations.filter(r =>
      r.type === "recommendation" && r.confidence > 0.6
    );
    if (actionRecs.length > 0) {
      return {
        type: "policy-compliance",
        passed: false,
        severity: "block",
        finding: "Advisor policy requires simulation before action recommendations, but no simulation was run",
        affectedClaims: actionRecs.map(r => r.id),
        suggestedRevision: "Run simulation before issuing action recommendations",
      };
    }
  }
  return { type: "policy-compliance", passed: true, severity: "info", finding: "Policy compliant", affectedClaims: [] };
}

function critiqueContradictions(rec: RecommendationV2): CritiqueResult {
  if (rec.contradictionFlags.length > 0) {
    return {
      type: "contradiction",
      passed: false,
      severity: "warning",
      finding: `${rec.contradictionFlags.length} contradiction(s) flagged: ${rec.contradictionFlags.join("; ")}`,
      affectedClaims: [],
    };
  }
  return { type: "contradiction", passed: true, severity: "info", finding: "No contradictions", affectedClaims: [] };
}

function critiqueScopeViolation(rec: RecommendationV2, spec: AdvisorSpecializationContract): CritiqueResult {
  // Check if recommendation references forbidden context domains
  const forbiddenMentions = spec.forbiddenContext.filter(fc =>
    JSON.stringify(rec.structuredOutput).toLowerCase().includes(fc.toLowerCase().replace(/_/g, " "))
  );
  if (forbiddenMentions.length > 0) {
    return {
      type: "scope-violation",
      passed: false,
      severity: "block",
      finding: `Recommendation references forbidden context: ${forbiddenMentions.join(", ")}`,
      affectedClaims: [],
      suggestedRevision: "Remove references to out-of-scope domains",
    };
  }
  return { type: "scope-violation", passed: true, severity: "info", finding: "Within scope", affectedClaims: [] };
}

function critiqueHallucinationRisk(rec: RecommendationV2, spec: AdvisorSpecializationContract): CritiqueResult {
  // Check for claims about things the advisor must never claim without evidence
  const allClaims = [
    ...rec.structuredOutput.facts,
    ...rec.structuredOutput.inferences,
    ...rec.structuredOutput.recommendations,
  ];

  const riskyUngrounded = allClaims.filter(c => {
    if (c.isGrounded) return false;
    return spec.neverClaimWithoutEvidence.some(nce =>
      c.statement.toLowerCase().includes(nce.toLowerCase().replace(/_/g, " "))
    );
  });

  if (riskyUngrounded.length > 0) {
    return {
      type: "hallucination-risk",
      passed: false,
      severity: "block",
      finding: `${riskyUngrounded.length} claim(s) match "never claim without evidence" rules but lack grounding`,
      affectedClaims: riskyUngrounded.map(c => c.id),
      suggestedRevision: "Remove or explicitly mark as unknown",
    };
  }

  return { type: "hallucination-risk", passed: true, severity: "info", finding: "No hallucination risk detected", affectedClaims: [] };
}

function critiqueTrustSensitivity(rec: RecommendationV2, spec: AdvisorSpecializationContract): CritiqueResult {
  if (spec.trustSensitivity === "critical" || spec.trustSensitivity === "veto-capable") {
    if (rec.confidenceBreakdown.score < spec.confidenceFloor) {
      return {
        type: "trust-sensitivity",
        passed: false,
        severity: "block",
        finding: `Confidence ${rec.confidenceBreakdown.score} below ${spec.trustSensitivity} threshold ${spec.confidenceFloor}`,
        affectedClaims: rec.structuredOutput.recommendations.map(r => r.id),
        suggestedRevision: "Gather more evidence or escalate to user",
      };
    }
  }
  return { type: "trust-sensitivity", passed: true, severity: "info", finding: "Trust threshold met", affectedClaims: [] };
}

// ── Main Verification Pass ────────────────────────────────

export function verifyRecommendation(rec: RecommendationV2): VerificationPass {
  const startTime = Date.now();
  const spec = getSpecialization(rec.advisorId);

  if (!spec) {
    return {
      passId: crypto.randomUUID(),
      recommendation: rec,
      critiques: [{
        type: "factuality",
        passed: false,
        severity: "warning",
        finding: `No specialization contract found for ${rec.advisorId}`,
        affectedClaims: [],
      }],
      overallVerdict: "approved",
      verifiedAt: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
    };
  }

  const critiques: CritiqueResult[] = [
    critiqueFactuality(rec, spec),
    critiqueEvidenceSufficiency(rec, spec),
    critiquePolicyCompliance(rec, spec),
    critiqueContradictions(rec),
    critiqueScopeViolation(rec, spec),
    critiqueHallucinationRisk(rec, spec),
    critiqueTrustSensitivity(rec, spec),
  ];

  const hasBlocking = critiques.some(c => !c.passed && c.severity === "block");
  const hasWarning = critiques.some(c => !c.passed && c.severity === "warning");

  let overallVerdict: VerificationPass["overallVerdict"];
  if (hasBlocking) {
    // Check if it's a trust/hallucination block — needs human
    const trustBlock = critiques.some(c => !c.passed && c.severity === "block" &&
      (c.type === "trust-sensitivity" || c.type === "hallucination-risk")
    );
    overallVerdict = trustBlock ? "needs-human" : "blocked";
  } else if (hasWarning) {
    overallVerdict = "revised";
  } else {
    overallVerdict = "approved";
  }

  return {
    passId: crypto.randomUUID(),
    recommendation: rec,
    critiques,
    overallVerdict,
    verifiedAt: new Date().toISOString(),
    latencyMs: Date.now() - startTime,
  };
}

// ── Batch Verification for Council ────────────────────────

export function verifyCouncilRecommendations(recs: RecommendationV2[]): VerificationPass[] {
  return recs.map(verifyRecommendation);
}

// ── Cross-Advisor Contradiction Check ─────────────────────

export function detectCrossAdvisorContradictions(recs: RecommendationV2[]): CritiqueResult[] {
  const results: CritiqueResult[] = [];
  const allFacts = recs.flatMap(r =>
    r.structuredOutput.facts.map(f => ({ ...f, advisorId: r.advisorId }))
  );

  // Group facts by topic similarity (simplified — production would use embeddings)
  const factsByKeyword = new Map<string, typeof allFacts>();
  for (const fact of allFacts) {
    const words = fact.statement.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length > 4) {
        const existing = factsByKeyword.get(word) || [];
        existing.push(fact);
        factsByKeyword.set(word, existing);
      }
    }
  }

  // Detect conflicting facts from different advisors
  for (const [, facts] of factsByKeyword) {
    const advisorIds = new Set(facts.map(f => f.advisorId));
    if (advisorIds.size > 1 && facts.length >= 2) {
      // Check if confidence differs significantly
      const confidences = facts.map(f => f.confidence);
      const maxDiff = Math.max(...confidences) - Math.min(...confidences);
      if (maxDiff > 0.3) {
        results.push({
          type: "contradiction",
          passed: false,
          severity: "warning",
          finding: `Cross-advisor confidence divergence (${maxDiff.toFixed(2)}) on related claims from ${[...advisorIds].join(", ")}`,
          affectedClaims: facts.map(f => f.id),
        });
      }
    }
  }

  return results;
}
