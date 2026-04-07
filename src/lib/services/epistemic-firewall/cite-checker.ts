// ═══════════════════════════════════════════════════════════════
// SITA OS — Cite-Checker / Adversarial Verification
// Truth Triangle Gate 2: Validates claims against evidence
// ═══════════════════════════════════════════════════════════════

import type { DomainId } from "@/packages/contracts/_contract-scaffold";
import type { GradedEvidence, GradedEvidenceSet, EvidenceGrade } from "./evidence-grader";

export type ClaimVerdict = "supported" | "partially-supported" | "unsupported" | "contradicted" | "unverifiable";

export interface ExtractedClaim {
  claimId: string;
  text: string;
  claimType: "factual" | "numeric" | "temporal" | "comparative" | "procedural" | "recommendation";
  requiresEvidence: boolean;
  domain: DomainId;
}

export interface ClaimVerification {
  claim: ExtractedClaim;
  verdict: ClaimVerdict;
  supportingEvidence: GradedEvidence[];
  contradictingEvidence: GradedEvidence[];
  bestEvidenceGrade: EvidenceGrade | null;
  confidence: number;
  reason: string;
}

export interface CiteCheckResult {
  checkId: string;
  totalClaims: number;
  verifiedClaims: number;
  supportedClaims: number;
  unsupportedClaims: number;
  contradictedClaims: number;
  unverifiableClaims: number;
  claims: ClaimVerification[];
  overallVerdict: "pass" | "caveat" | "block";
  overallConfidence: number;
  shouldBlock: boolean;
  blockReasons: string[];
  domain: DomainId;
  checkedAt: string;
  durationMs: number;
}

interface CiteCheckPolicy {
  enabled: boolean;
  blockOnUnsupported: boolean;
  blockOnContradicted: boolean;
  minSupportedRatio: number;
  claimTypesRequiringEvidence: string[];
}

const DEFAULT_CITE_POLICY: CiteCheckPolicy = {
  enabled: false,
  blockOnUnsupported: false,
  blockOnContradicted: true,
  minSupportedRatio: 0.5,
  claimTypesRequiringEvidence: ["numeric"],
};

const CITE_CHECK_POLICIES: Partial<Record<DomainId, CiteCheckPolicy>> = {
  finance: { enabled: true, blockOnUnsupported: true, blockOnContradicted: true, minSupportedRatio: 0.8, claimTypesRequiringEvidence: ["factual", "numeric", "temporal"] },
  business: { enabled: true, blockOnUnsupported: false, blockOnContradicted: true, minSupportedRatio: 0.6, claimTypesRequiringEvidence: ["numeric", "factual"] },
};

export function extractClaims(responseText: string, domain: DomainId): ExtractedClaim[] {
  const claims: ExtractedClaim[] = [];
  const sentences = responseText.split(/[.!?\n]/).map((s) => s.trim()).filter((s) => s.length > 10);

  for (let i = 0; i < sentences.length; i++) {
    const text = sentences[i];
    const claimType = classifyClaimType(text);
    const policy = CITE_CHECK_POLICIES[domain] || DEFAULT_CITE_POLICY;
    claims.push({ claimId: `claim-${i + 1}`, text, claimType, requiresEvidence: policy.claimTypesRequiringEvidence.includes(claimType), domain });
  }
  return claims;
}

function classifyClaimType(text: string): ExtractedClaim["claimType"] {
  const lower = text.toLowerCase();
  if (/\$[\d,.]+|€[\d,.]+|[\d,.]+\s*(?:usd|eur|gbp)|[\d,.]+%/i.test(text)) return "numeric";
  if (/\b(january|february|march|april|may|june|july|august|september|october|november|december|\d{4}|\d{1,2}\/\d{1,2})\b/i.test(text)) return "temporal";
  if (/\b(more than|less than|greater|higher|lower|compared to|versus|vs)\b/.test(lower)) return "comparative";
  if (/\b(should|recommend|suggest|advise|consider)\b/.test(lower)) return "recommendation";
  if (/\b(step \d|first|then|next|finally|process|procedure)\b/.test(lower)) return "procedural";
  return "factual";
}

export function verifyClaim(claim: ExtractedClaim, evidenceSet: GradedEvidenceSet): ClaimVerification {
  const supporting: GradedEvidence[] = [];
  const contradicting: GradedEvidence[] = [];

  for (const evidence of evidenceSet.items) {
    if (!evidence.usableForDomain) continue;
    const match = computeEvidenceMatch(claim.text, evidence.content);
    if (match.supports) supporting.push(evidence);
    else if (match.contradicts) contradicting.push(evidence);
  }

  let verdict: ClaimVerdict;
  let confidence: number;
  let reason: string;

  if (contradicting.length > 0) {
    verdict = "contradicted"; confidence = 0.9;
    reason = `Evidence contradicts claim: ${contradicting.length} contradicting source(s)`;
  } else if (supporting.length > 0) {
    const bestGrade = supporting.reduce((best, e) => gradeRank(e.grade) < gradeRank(best.grade) ? e : best);
    if (supporting.length >= 2 || gradeRank(bestGrade.grade) <= 2) {
      verdict = "supported"; confidence = bestGrade.trustScore;
      reason = `Supported by ${supporting.length} source(s), best grade: ${bestGrade.grade}`;
    } else {
      verdict = "partially-supported"; confidence = bestGrade.trustScore * 0.7;
      reason = `Partially supported: only ${supporting.length} source(s), grade ${bestGrade.grade}`;
    }
  } else if (!claim.requiresEvidence) {
    verdict = "unverifiable"; confidence = 0.3;
    reason = "No evidence available, but claim type does not require verification";
  } else {
    verdict = "unsupported"; confidence = 0;
    reason = "No supporting evidence found for evidence-requiring claim";
  }

  return {
    claim, verdict, supportingEvidence: supporting, contradictingEvidence: contradicting,
    bestEvidenceGrade: supporting.length > 0 ? supporting.reduce((best, e) => gradeRank(e.grade) < gradeRank(best.grade) ? e : best).grade : null,
    confidence, reason,
  };
}

function computeEvidenceMatch(claimText: string, evidenceContent: string): { supports: boolean; contradicts: boolean } {
  const claimLower = claimText.toLowerCase();
  const evidenceLower = evidenceContent.toLowerCase();
  const stopWords = ["that", "this", "with", "from", "have", "been", "will", "would", "should", "could"];
  const claimTerms = claimLower.split(/\s+/).filter((t) => t.length > 3).filter((t) => !stopWords.includes(t));
  const matchingTerms = claimTerms.filter((t) => evidenceLower.includes(t));
  const matchRatio = claimTerms.length > 0 ? matchingTerms.length / claimTerms.length : 0;
  const hasNegation = /\b(not|never|no|incorrect|false|wrong|invalid)\b/.test(evidenceLower) !== /\b(not|never|no|incorrect|false|wrong|invalid)\b/.test(claimLower);
  return { supports: matchRatio >= 0.4 && !hasNegation, contradicts: matchRatio >= 0.3 && hasNegation };
}

export function runCiteCheck(responseText: string, domain: DomainId, evidenceSet: GradedEvidenceSet): CiteCheckResult {
  const start = Date.now();
  const policy = CITE_CHECK_POLICIES[domain] || DEFAULT_CITE_POLICY;
  const claims = extractClaims(responseText, domain);
  const verifications = claims.map((c) => verifyClaim(c, evidenceSet));

  const evidenceRequiringClaims = verifications.filter((v) => v.claim.requiresEvidence);
  const supportedCount = verifications.filter((v) => v.verdict === "supported" || v.verdict === "partially-supported").length;
  const unsupportedCount = verifications.filter((v) => v.verdict === "unsupported").length;
  const contradictedCount = verifications.filter((v) => v.verdict === "contradicted").length;
  const unverifiableCount = verifications.filter((v) => v.verdict === "unverifiable").length;

  const blockReasons: string[] = [];
  if (policy.blockOnContradicted && contradictedCount > 0) blockReasons.push(`${contradictedCount} claim(s) contradicted by evidence`);
  if (policy.blockOnUnsupported && unsupportedCount > 0 && evidenceRequiringClaims.length > 0) {
    const unsupportedRatio = unsupportedCount / evidenceRequiringClaims.length;
    if (unsupportedRatio > (1 - policy.minSupportedRatio)) blockReasons.push(`${unsupportedCount} evidence-requiring claim(s) unsupported`);
  }

  const shouldBlock = policy.enabled && blockReasons.length > 0;

  return {
    checkId: `cite-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    totalClaims: claims.length, verifiedClaims: verifications.filter((v) => v.verdict !== "unverifiable").length,
    supportedClaims: supportedCount, unsupportedClaims: unsupportedCount,
    contradictedClaims: contradictedCount, unverifiableClaims: unverifiableCount,
    claims: verifications, overallVerdict: shouldBlock ? "block" : blockReasons.length > 0 ? "caveat" : "pass",
    overallConfidence: verifications.length > 0 ? verifications.reduce((sum, v) => sum + v.confidence, 0) / verifications.length : 0,
    shouldBlock, blockReasons, domain, checkedAt: new Date().toISOString(), durationMs: Date.now() - start,
  };
}

function gradeRank(grade: EvidenceGrade): number {
  return { A: 1, B: 2, C: 3, D: 4, F: 5 }[grade];
}

export function getCiteCheckPolicy(domain: DomainId): CiteCheckPolicy | undefined {
  return CITE_CHECK_POLICIES[domain];
}
