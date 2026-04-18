// ═══════════════════════════════════════════════════════════════
// SITA OS — Cross-Tenant Pattern Generalization Layer (3.11)
// Safely generalizes patterns across tenants with privacy controls.
// ═══════════════════════════════════════════════════════════════

import type { ExtractedPattern, PrivacyClass } from "./pattern-extraction";

export interface GeneralizedPattern {
  generalizedPatternId: string;
  sourcePatternType: string;
  domain: string;
  label: string;
  description: string;
  anonymizedFingerprint: Record<string, unknown>;
  confidence: number;
  sourceTenantCount: number;
  anonymizationMethod: "k_anonymity" | "differential_privacy" | "aggregation" | "redaction";
  restrictions: string[];
  approvedForUse: boolean;
  privacyGatesPassed: string[];
  createdAt: string;
}

export interface GeneralizationDecision {
  canGeneralize: boolean;
  reason: string;
  requiredAnonymization: string;
  privacyRisk: "none" | "low" | "medium" | "high";
}

// ── Privacy gating ──────────────────────────────────────────

export function evaluateGeneralizationEligibility(
  pattern: ExtractedPattern,
  minSourceCount: number = 3,
  minConfidence: number = 70,
): GeneralizationDecision {
  if (pattern.privacyClass === "tenant_private") {
    return { canGeneralize: false, reason: "Pattern is tenant-private — cannot generalize", requiredAnonymization: "none", privacyRisk: "high" };
  }

  if (pattern.sourceCount < minSourceCount) {
    return { canGeneralize: false, reason: `Insufficient sources (${pattern.sourceCount}/${minSourceCount})`, requiredAnonymization: "none", privacyRisk: "none" };
  }

  if (pattern.confidence < minConfidence) {
    return { canGeneralize: false, reason: `Confidence too low (${pattern.confidence}/${minConfidence})`, requiredAnonymization: "none", privacyRisk: "none" };
  }

  if (pattern.falsePositiveRate > 15) {
    return { canGeneralize: false, reason: `False positive rate too high (${pattern.falsePositiveRate}%)`, requiredAnonymization: "none", privacyRisk: "low" };
  }

  return {
    canGeneralize: true,
    reason: "Pattern meets all generalization criteria",
    requiredAnonymization: pattern.privacyClass === "anonymizable" ? "k_anonymity" : "aggregation",
    privacyRisk: "none",
  };
}

// ── Anonymization ───────────────────────────────────────────

export function anonymizeFingerprint(
  fingerprint: Record<string, unknown>,
  method: GeneralizedPattern["anonymizationMethod"],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  const sensitiveKeys = ["tenant", "user", "email", "name", "account", "token", "key", "secret", "password", "id"];

  for (const [key, value] of Object.entries(fingerprint)) {
    const isSensitive = sensitiveKeys.some(s => key.toLowerCase().includes(s));

    if (isSensitive) {
      if (method === "redaction") {
        result[key] = "[REDACTED]";
      } else if (method === "k_anonymity") {
        result[key] = typeof value === "string" ? `[${typeof value}]` : `[${typeof value}]`;
      }
      // Skip entirely for differential_privacy and aggregation
    } else {
      result[key] = value;
    }
  }

  return result;
}

// ── Generalization ──────────────────────────────────────────

export function generalizePattern(
  pattern: ExtractedPattern,
  tenantCount: number,
): GeneralizedPattern | null {
  const decision = evaluateGeneralizationEligibility(pattern);
  if (!decision.canGeneralize) return null;

  const method = decision.requiredAnonymization as GeneralizedPattern["anonymizationMethod"];

  return {
    generalizedPatternId: `gp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sourcePatternType: pattern.patternType,
    domain: pattern.domain,
    label: pattern.label,
    description: `Generalized: ${pattern.description}`,
    anonymizedFingerprint: anonymizeFingerprint(pattern.fingerprint, method),
    confidence: Math.round(pattern.confidence * 0.9), // slight confidence reduction for generalization
    sourceTenantCount: tenantCount,
    anonymizationMethod: method,
    restrictions: ["enterprise_opt_out", "confidence_gated"],
    approvedForUse: pattern.confidence >= 80,
    privacyGatesPassed: ["no_pii", "min_source_count", "min_confidence", "low_false_positive"],
    createdAt: new Date().toISOString(),
  };
}
