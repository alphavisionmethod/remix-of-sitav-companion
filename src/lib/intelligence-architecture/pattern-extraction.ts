// ═══════════════════════════════════════════════════════════════
// SITA OS — Pattern Extraction Layer (3.4)
// Detects recurring patterns and fingerprints from signals.
// ═══════════════════════════════════════════════════════════════

export type PatternType =
  | "issue_fingerprint" | "workflow_pattern" | "conversion_pattern"
  | "deployment_pattern" | "self_heal_pattern" | "design_pattern"
  | "config_drift" | "incident_cluster" | "release_blocker"
  | "agent_disagreement" | "quote_failure" | "other";

export type PrivacyClass = "tenant_private" | "anonymizable" | "public_safe";

export interface ExtractedPattern {
  patternId: string;
  patternType: PatternType;
  domain: string;
  label: string;
  description: string;
  fingerprint: Record<string, unknown>;
  confidence: number;
  falsePositiveRate: number;
  sourceCount: number;
  privacyClass: PrivacyClass;
  reusableAcrossTenants: boolean;
  createdAt: string;
}

export interface PatternMatch {
  patternId: string;
  matchScore: number;         // 0-1
  signalIds: string[];
  matchedAt: string;
}

export interface PatternExtractionInput {
  signalType: string;
  domain: string;
  fingerprint: Record<string, unknown>;
  tenantId: string;
}

// ── Fingerprint comparison ──────────────────────────────────

function fingerprintSimilarity(a: Record<string, unknown>, b: Record<string, unknown>): number {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  const allKeys = new Set([...keysA, ...keysB]);
  if (allKeys.size === 0) return 0;

  let matches = 0;
  for (const key of allKeys) {
    if (key in a && key in b && JSON.stringify(a[key]) === JSON.stringify(b[key])) {
      matches++;
    }
  }
  return matches / allKeys.size;
}

// ── Privacy classification ──────────────────────────────────

function classifyPrivacy(domain: string, fingerprint: Record<string, unknown>): PrivacyClass {
  // Financial and personal domains are tenant-private
  if (["investment-finance", "concierge-household"].includes(domain)) return "tenant_private";

  // Check for PII-like fields
  const sensitiveKeys = ["email", "name", "phone", "address", "ssn", "account"];
  const hasSensitive = Object.keys(fingerprint).some(k =>
    sensitiveKeys.some(s => k.toLowerCase().includes(s))
  );
  if (hasSensitive) return "tenant_private";

  // Technical patterns are often anonymizable
  if (["engineering", "deployment", "connectors"].includes(domain)) return "anonymizable";

  return "tenant_private";
}

// ── Public API ──────────────────────────────────────────────

export function extractPattern(
  input: PatternExtractionInput,
  existingPatterns: ExtractedPattern[],
): { isNew: boolean; pattern: ExtractedPattern; match?: PatternMatch } {
  // Check for existing similar pattern
  for (const existing of existingPatterns) {
    if (existing.domain !== input.domain) continue;
    const similarity = fingerprintSimilarity(existing.fingerprint, input.fingerprint);

    if (similarity > 0.75) {
      // Update existing pattern
      const updated: ExtractedPattern = {
        ...existing,
        sourceCount: existing.sourceCount + 1,
        confidence: Math.min(100, existing.confidence + 2),
        falsePositiveRate: Math.max(0, existing.falsePositiveRate - 0.5),
      };
      return {
        isNew: false,
        pattern: updated,
        match: {
          patternId: existing.patternId,
          matchScore: similarity,
          signalIds: [],
          matchedAt: new Date().toISOString(),
        },
      };
    }
  }

  // Create new pattern
  const privacy = classifyPrivacy(input.domain, input.fingerprint);
  const newPattern: ExtractedPattern = {
    patternId: `pat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    patternType: inferPatternType(input.signalType),
    domain: input.domain,
    label: `${input.domain} pattern — ${input.signalType}`,
    description: `Auto-extracted from ${input.signalType} signals`,
    fingerprint: input.fingerprint,
    confidence: 40,
    falsePositiveRate: 20,
    sourceCount: 1,
    privacyClass: privacy,
    reusableAcrossTenants: privacy === "anonymizable" || privacy === "public_safe",
    createdAt: new Date().toISOString(),
  };

  return { isNew: true, pattern: newPattern };
}

function inferPatternType(signalType: string): PatternType {
  const map: Record<string, PatternType> = {
    incident: "issue_fingerprint",
    deployment_event: "deployment_pattern",
    self_heal_outcome: "self_heal_pattern",
    design_change: "design_pattern",
    customer_workflow: "workflow_pattern",
    release_outcome: "release_blocker",
  };
  return map[signalType] || "other";
}

export function findMatchingPatterns(
  fingerprint: Record<string, unknown>,
  domain: string,
  patterns: ExtractedPattern[],
  minSimilarity: number = 0.6,
): PatternMatch[] {
  return patterns
    .filter(p => p.domain === domain)
    .map(p => ({
      patternId: p.patternId,
      matchScore: fingerprintSimilarity(p.fingerprint, fingerprint),
      signalIds: [],
      matchedAt: new Date().toISOString(),
    }))
    .filter(m => m.matchScore >= minSimilarity)
    .sort((a, b) => b.matchScore - a.matchScore);
}
