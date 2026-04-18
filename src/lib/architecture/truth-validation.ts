// ═══════════════════════════════════════════════════════════════
// SITA OS — Truth Validation
// Rule 12: Truth is never model output alone.
// Model output = proposal. Facts require provenance.
// ═══════════════════════════════════════════════════════════════

export type TruthSource =
  | "verified-system-record"
  | "governed-memory"
  | "connector-with-provenance"
  | "user-confirmation"
  | "policy-backed-evidence"
  | "model-proposal"           // NOT truth — must be marked uncertain
  | "inference";               // NOT truth — must be marked uncertain

export type CertaintyLevel = "fact" | "high-confidence" | "uncertain" | "speculative" | "unverified";

export interface TruthEnvelope {
  claimId: string;
  content: string;
  source: TruthSource;
  certainty: CertaintyLevel;
  evidenceGrade: "verified" | "attested" | "observed" | "inferred" | "claimed";
  sourceAttribution: {
    sourceId: string;
    sourceName: string;
    sourceType: string;
    retrievedAt: string;
    proofId?: string;
  };
  modelOrigin?: {
    modelId: string;
    confidence: number;         // model's self-reported confidence
    promptContext: string;
  };
  expiresAt?: string;
  markedUncertain: boolean;     // MUST be true if source is model-proposal or inference
}

export interface ActionRecommendation {
  recommendationId: string;
  action: string;
  evidenceGrade: "verified" | "attested" | "observed" | "inferred" | "claimed";
  sourceAttribution: string[];
  certainty: CertaintyLevel;
  executionAllowed: boolean;    // false if only model confidence supports it
  reason: string;
}

// ── Validation ──────────────────────────────────────────────

export function validateTruthClaim(envelope: TruthEnvelope): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Model output cannot be treated as fact
  if (envelope.source === "model-proposal" && envelope.certainty === "fact") {
    errors.push("Model output cannot be marked as 'fact' — must be 'uncertain' or lower");
  }
  if (envelope.source === "inference" && envelope.certainty === "fact") {
    errors.push("Inference cannot be marked as 'fact'");
  }

  // Model proposals must be marked uncertain
  if ((envelope.source === "model-proposal" || envelope.source === "inference") && !envelope.markedUncertain) {
    errors.push("Model proposals and inferences MUST be marked as uncertain");
  }

  // Source attribution required
  if (!envelope.sourceAttribution.sourceId) {
    errors.push("Source attribution is required for all truth claims");
  }

  return { valid: errors.length === 0, errors };
}

export function canExecuteBasedOnEvidence(recommendation: ActionRecommendation): boolean {
  // No execution based only on raw model confidence
  if (recommendation.evidenceGrade === "claimed" && recommendation.certainty !== "fact") {
    return false;
  }
  if (recommendation.certainty === "speculative" || recommendation.certainty === "unverified") {
    return false;
  }
  return recommendation.executionAllowed;
}

export function wrapModelOutput(
  content: string,
  modelId: string,
  confidence: number,
): TruthEnvelope {
  return {
    claimId: crypto.randomUUID(),
    content,
    source: "model-proposal",
    certainty: confidence > 0.9 ? "high-confidence" : confidence > 0.6 ? "uncertain" : "speculative",
    evidenceGrade: "claimed",
    sourceAttribution: {
      sourceId: modelId,
      sourceName: modelId,
      sourceType: "ai-model",
      retrievedAt: new Date().toISOString(),
    },
    modelOrigin: { modelId, confidence, promptContext: "" },
    markedUncertain: true,
  };
}

export function promoteToFact(
  claim: TruthEnvelope,
  verifiedBy: TruthSource,
  proofId: string,
): TruthEnvelope {
  if (verifiedBy === "model-proposal" || verifiedBy === "inference") {
    throw new Error("Cannot promote to fact using model output or inference");
  }
  return {
    ...claim,
    source: verifiedBy,
    certainty: "fact",
    evidenceGrade: "verified",
    markedUncertain: false,
    sourceAttribution: {
      ...claim.sourceAttribution,
      proofId,
      retrievedAt: new Date().toISOString(),
    },
  };
}
