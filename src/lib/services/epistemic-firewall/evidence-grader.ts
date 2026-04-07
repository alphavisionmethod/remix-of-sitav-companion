// ═══════════════════════════════════════════════════════════════
// SITA OS — Evidence Grader
// Truth Triangle Gate 1: Evidence Freshness & Quality Scoring
// Integrated with ConscienceGate and CritiqueLoop
// ═══════════════════════════════════════════════════════════════

import type { DomainId, RiskTier } from "@/packages/contracts/_contract-scaffold";

// ── Evidence Grade Hierarchy ───────────────────────────────────

export type EvidenceGrade = "A" | "B" | "C" | "D" | "F";

export interface EvidenceGradePolicy {
  grade: EvidenceGrade;
  label: string;
  description: string;
  maxAgeSec: number;
  trustFactor: number; // 0–1
  allowedForHighStakes: boolean;
}

export const EVIDENCE_GRADE_POLICIES: Record<EvidenceGrade, EvidenceGradePolicy> = {
  A: {
    grade: "A",
    label: "Verified / Signed",
    description: "Cryptographically signed receipt, trusted API response, or deterministic tool output. Very fresh.",
    maxAgeSec: 300,
    trustFactor: 1.0,
    allowedForHighStakes: true,
  },
  B: {
    grade: "B",
    label: "Trusted / Cached",
    description: "Trusted cached data within acceptable age. From known reliable source.",
    maxAgeSec: 3600,
    trustFactor: 0.85,
    allowedForHighStakes: true,
  },
  C: {
    grade: "C",
    label: "Observed / Indirect",
    description: "Scraped, inferred, heuristic, low-confidence, or older indirect data.",
    maxAgeSec: 86400,
    trustFactor: 0.5,
    allowedForHighStakes: false,
  },
  D: {
    grade: "D",
    label: "Stale / Unverified",
    description: "Old data, unverified source, or user-reported without confirmation.",
    maxAgeSec: 604800,
    trustFactor: 0.25,
    allowedForHighStakes: false,
  },
  F: {
    grade: "F",
    label: "No Evidence",
    description: "LLM-generated claim with no backing evidence. Weight-based only.",
    maxAgeSec: 0,
    trustFactor: 0,
    allowedForHighStakes: false,
  },
};

// ── Evidence Item ──────────────────────────────────────────────

export interface EvidenceItem {
  id: string;
  sourceType: "api" | "connector" | "file" | "calculation" | "cache" | "user-input" | "llm-generated" | "receipt";
  sourceId: string;
  content: string;
  retrievedAt: string;
  expiresAt?: string;
  signed: boolean;
  provenance: string;
  domain: DomainId;
  metadata?: Record<string, unknown>;
}

export interface GradedEvidence extends EvidenceItem {
  grade: EvidenceGrade;
  gradePolicy: EvidenceGradePolicy;
  ageSec: number;
  trustScore: number;
  usableForDomain: boolean;
  gradingReason: string;
}

// ── Domain Evidence Requirements ───────────────────────────────

export interface DomainEvidencePolicy {
  domain: DomainId;
  minGrade: EvidenceGrade;
  minSources: number;
  requiresSigned: boolean;
  requiresCitation: boolean;
  refuseOnWeakEvidence: boolean;
  maxStalenessSec: number;
}

const HIGH_TRUST_DOMAINS: DomainId[] = ["finance", "legal", "health"];

const DOMAIN_EVIDENCE_POLICIES: Partial<Record<DomainId, DomainEvidencePolicy>> = {
  finance: {
    domain: "finance",
    minGrade: "B",
    minSources: 1,
    requiresSigned: false,
    requiresCitation: true,
    refuseOnWeakEvidence: true,
    maxStalenessSec: 3600,
  },
  legal: {
    domain: "legal",
    minGrade: "B",
    minSources: 1,
    requiresSigned: false,
    requiresCitation: true,
    refuseOnWeakEvidence: true,
    maxStalenessSec: 86400,
  },
  health: {
    domain: "health",
    minGrade: "B",
    minSources: 1,
    requiresSigned: false,
    requiresCitation: true,
    refuseOnWeakEvidence: true,
    maxStalenessSec: 86400,
  },
};

// ── Grading Engine ─────────────────────────────────────────────

export function gradeEvidence(item: EvidenceItem, now?: Date): GradedEvidence {
  const currentTime = now || new Date();
  const retrievedTime = new Date(item.retrievedAt);
  const ageSec = Math.floor((currentTime.getTime() - retrievedTime.getTime()) / 1000);

  let grade: EvidenceGrade;

  if (item.sourceType === "llm-generated") {
    grade = "F";
  } else if (item.signed && item.sourceType === "api" && ageSec <= 300) {
    grade = "A";
  } else if (item.signed || (item.sourceType === "calculation" && ageSec <= 300)) {
    grade = "A";
  } else if (
    ["api", "connector", "receipt", "calculation"].includes(item.sourceType) &&
    ageSec <= 3600
  ) {
    grade = "B";
  } else if (
    ["file", "cache", "user-input"].includes(item.sourceType) &&
    ageSec <= 86400
  ) {
    grade = "C";
  } else if (ageSec <= 604800) {
    grade = "D";
  } else {
    grade = "F";
  }

  // Expired data downgrades
  if (item.expiresAt && new Date(item.expiresAt) < currentTime) {
    grade = grade === "A" ? "C" : grade === "B" ? "D" : "F";
  }

  const gradePolicy = EVIDENCE_GRADE_POLICIES[grade];
  const domainPolicy = DOMAIN_EVIDENCE_POLICIES[item.domain];
  const isHighTrust = HIGH_TRUST_DOMAINS.includes(item.domain);

  const usableForDomain = isHighTrust
    ? gradePolicy.allowedForHighStakes
    : true;

  const gradingReason = buildGradingReason(item, grade, ageSec, usableForDomain);

  return {
    ...item,
    grade,
    gradePolicy,
    ageSec,
    trustScore: gradePolicy.trustFactor,
    usableForDomain,
    gradingReason,
  };
}

export function gradeEvidenceSet(
  items: EvidenceItem[],
  domain: DomainId,
  now?: Date
): GradedEvidenceSet {
  const graded = items.map((item) => gradeEvidence(item, now));
  const domainPolicy = DOMAIN_EVIDENCE_POLICIES[domain];

  const usable = graded.filter((e) => e.usableForDomain);
  const bestGrade = usable.length > 0
    ? usable.reduce((best, e) => (gradeRank(e.grade) < gradeRank(best.grade) ? e : best)).grade
    : "F";

  const avgTrust = usable.length > 0
    ? usable.reduce((sum, e) => sum + e.trustScore, 0) / usable.length
    : 0;

  const meetsMinGrade = domainPolicy
    ? gradeRank(bestGrade) <= gradeRank(domainPolicy.minGrade)
    : true;

  const meetsMinSources = domainPolicy
    ? usable.length >= domainPolicy.minSources
    : usable.length > 0;

  const sufficient = meetsMinGrade && meetsMinSources;

  return {
    items: graded,
    domain,
    bestGrade,
    avgTrustScore: avgTrust,
    totalItems: items.length,
    usableItems: usable.length,
    sufficient,
    meetsMinGrade,
    meetsMinSources,
    domainPolicy: domainPolicy || null,
    gradedAt: (now || new Date()).toISOString(),
  };
}

export interface GradedEvidenceSet {
  items: GradedEvidence[];
  domain: DomainId;
  bestGrade: EvidenceGrade;
  avgTrustScore: number;
  totalItems: number;
  usableItems: number;
  sufficient: boolean;
  meetsMinGrade: boolean;
  meetsMinSources: boolean;
  domainPolicy: DomainEvidencePolicy | null;
  gradedAt: string;
}

// ── Helpers ────────────────────────────────────────────────────

function gradeRank(grade: EvidenceGrade): number {
  const ranks: Record<EvidenceGrade, number> = { A: 1, B: 2, C: 3, D: 4, F: 5 };
  return ranks[grade];
}

function buildGradingReason(
  item: EvidenceItem,
  grade: EvidenceGrade,
  ageSec: number,
  usable: boolean
): string {
  const parts: string[] = [];
  parts.push(`Source: ${item.sourceType} (${item.provenance})`);
  parts.push(`Age: ${ageSec}s`);
  parts.push(`Signed: ${item.signed}`);
  parts.push(`Grade: ${grade}`);
  if (!usable) parts.push("NOT usable for high-trust domain");
  return parts.join(" | ");
}

export function getDomainEvidencePolicy(domain: DomainId): DomainEvidencePolicy | undefined {
  return DOMAIN_EVIDENCE_POLICIES[domain];
}

export function isHighTrustDomain(domain: DomainId): boolean {
  return HIGH_TRUST_DOMAINS.includes(domain);
}
