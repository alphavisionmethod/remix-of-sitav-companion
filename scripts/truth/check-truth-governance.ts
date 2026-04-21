#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Truth Governance Validator (BLOCK-tier)
// Verifies dimensional readiness, contradiction management,
// claim-proof mappings, and stale artifact invalidation.
// Generates 10 proof artifacts in generated/
// ═══════════════════════════════════════════════════════════════

import { writeFileSync, mkdirSync, existsSync, statSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  READINESS_DIMENSIONS,
  SCORED_SUBSYSTEMS,
  verdictFromScore,
  buildSubsystemScoreboard,
} from "../../src/lib/truth/readiness-dimension-model";
import type { DimensionScore, SubsystemScoreboard, ReadinessDimension } from "../../src/lib/truth/readiness-claim-contract";
import { CLAIM_PROOF_REGISTRY, getClaimsForSubsystem } from "../../src/lib/truth/claim-proof-registry";
import { CONTRADICTION_LEDGER, getOpenContradictions, hasUnmitigatedHighSeverity } from "../../src/lib/truth/contradiction-ledger";
import { evaluateAdvisoryBurden, DIMENSION_DOWNGRADE_TRIGGERS, CONTRADICTION_DOWNGRADE_RULES } from "../../src/lib/truth/advisory-interpretation-policy";
import { INVALIDATION_RULES, getRulesForArtifact } from "../../src/lib/truth/stale-artifact-invalidation";
import { STATUS_LANGUAGE_POLICY, getLanguageForVerdict } from "../../src/lib/truth/status-language-policy";

const GEN = "generated";
mkdirSync(GEN, { recursive: true });

const now = new Date();
const errors: string[] = [];
const warnings: string[] = [];

// ─── 1. Readiness Dimension Scoreboard ───────────────────────

// Subsystem → dimension scoring based on claim verdicts and proof availability
function scoreSubsystem(subsystem: string): SubsystemScoreboard {
  const claims = getClaimsForSubsystem(subsystem);
  const dimensionScores: DimensionScore[] = READINESS_DIMENSIONS.map(dim => {
    const relevantClaims = claims.filter(c => c.dimensions.includes(dim.dimension));
    const totalProofs = relevantClaims.reduce((sum, c) => sum + c.proofArtifacts.length, 0);
    const existingProofs = relevantClaims.reduce((sum, c) =>
      sum + c.proofArtifacts.filter(p => existsSync(p)).length, 0);
    
    const proofCoverage = totalProofs > 0 ? (existingProofs / totalProofs) * 100 : 0;
    
    // Confidence penalty
    const lowConfidence = relevantClaims.filter(c => c.confidence === "low" || c.confidence === "unverified").length;
    const confidencePenalty = lowConfidence * 10;
    
    // Contradiction penalty
    const contradictions = CONTRADICTION_LEDGER.filter(
      ctr => ctr.status === "open" && ctr.impactedDimensions.includes(dim.dimension)
    );
    const contradictionPenalty = contradictions.reduce((sum, c) => {
      if (c.severity === "critical") return sum + 30;
      if (c.severity === "high") return sum + 15;
      if (c.severity === "medium") return sum + 5;
      return sum + 2;
    }, 0);
    
    const rawScore = Math.max(0, Math.min(100, proofCoverage - confidencePenalty - contradictionPenalty));
    const score = Math.round(rawScore);
    
    return {
      dimension: dim.dimension,
      score,
      verdict: verdictFromScore(score, dim.dimension),
      passingGates: existingProofs,
      totalGates: totalProofs,
      openContradictions: contradictions.length,
      advisoryCount: relevantClaims.filter(c => c.advisorySensitivity === "high").length,
    };
  });

  return buildSubsystemScoreboard(subsystem, dimensionScores);
}

const scoreboards: SubsystemScoreboard[] = SCORED_SUBSYSTEMS.map(s => scoreSubsystem(s));

writeFileSync(join(GEN, "readiness-dimension-scoreboard.json"), JSON.stringify({
  generatedAt: now.toISOString(),
  gate: "truth-governance",
  dimensions: READINESS_DIMENSIONS.map(d => d.dimension),
  subsystems: scoreboards,
}, null, 2));

// ─── 2. Contradiction Ledger ─────────────────────────────────

const openContradictions = getOpenContradictions();
const contradictionsWithoutMitigation = CONTRADICTION_LEDGER.filter(
  c => c.status === "open" && (!c.mitigationPath || c.mitigationPath.trim() === "")
);

if (contradictionsWithoutMitigation.length > 0) {
  errors.push(`${contradictionsWithoutMitigation.length} open contradiction(s) have no mitigation path`);
}

writeFileSync(join(GEN, "contradiction-ledger.json"), JSON.stringify({
  generatedAt: now.toISOString(),
  gate: "truth-governance",
  totalContradictions: CONTRADICTION_LEDGER.length,
  openCount: openContradictions.length,
  mitigatedCount: CONTRADICTION_LEDGER.filter(c => c.status === "mitigated").length,
  acceptedCount: CONTRADICTION_LEDGER.filter(c => c.status === "accepted").length,
  closedCount: CONTRADICTION_LEDGER.filter(c => c.status === "closed").length,
  hasUnmitigatedHighSeverity: hasUnmitigatedHighSeverity(),
  entries: CONTRADICTION_LEDGER,
}, null, 2));

// ─── 3. Claim-Proof Registry ─────────────────────────────────

const claimsWithMissingProofs = CLAIM_PROOF_REGISTRY.filter(c =>
  c.proofArtifacts.some(p => !existsSync(p))
);
const proofGaps = claimsWithMissingProofs.map(c => ({
  claimId: c.claimId,
  claim: c.claim,
  subsystem: c.subsystem,
  missingProofs: c.proofArtifacts.filter(p => !existsSync(p)),
  existingProofs: c.proofArtifacts.filter(p => existsSync(p)),
  confidencePenalty: c.proofArtifacts.filter(p => !existsSync(p)).length * 5,
  impactedDimensions: c.dimensions,
}));

writeFileSync(join(GEN, "claim-proof-registry.json"), JSON.stringify({
  generatedAt: now.toISOString(),
  gate: "truth-governance",
  totalClaims: CLAIM_PROOF_REGISTRY.length,
  claimsWithFullProof: CLAIM_PROOF_REGISTRY.length - claimsWithMissingProofs.length,
  claimsWithGaps: claimsWithMissingProofs.length,
  claims: CLAIM_PROOF_REGISTRY.map(c => ({
    ...c,
    proofPresent: c.proofArtifacts.filter(p => existsSync(p)),
    proofMissing: c.proofArtifacts.filter(p => !existsSync(p)),
    proofCoverage: c.proofArtifacts.length > 0
      ? Math.round((c.proofArtifacts.filter(p => existsSync(p)).length / c.proofArtifacts.length) * 100)
      : 0,
  })),
}, null, 2));

// ─── 4. Proof Gap Register ───────────────────────────────────

writeFileSync(join(GEN, "proof-gap-register.json"), JSON.stringify({
  generatedAt: now.toISOString(),
  gate: "truth-governance",
  totalGaps: proofGaps.reduce((s, g) => s + g.missingProofs.length, 0),
  subsystemsWithGaps: proofGaps.length,
  gaps: proofGaps,
}, null, 2));

// ─── 5. Advisory-Heavy Readiness Report ──────────────────────

let advisoryCount = 0;
try {
  const readinessPath = join(GEN, "os-release-readiness-report.json");
  if (existsSync(readinessPath)) {
    const report = JSON.parse(readFileSync(readinessPath, "utf8"));
    advisoryCount = report.totalWarnings ?? 0;
  }
} catch { /* ignore */ }

const advisoryBurden = evaluateAdvisoryBurden(advisoryCount);
const activeConditions = [
  "notarization-pending",
  "mobile-archived",
  "encryption-pending",
  "no-e2e-boot",
  "high-advisory-count",
];
const activeTriggers = DIMENSION_DOWNGRADE_TRIGGERS.filter(t =>
  activeConditions.includes(t.trigger)
);

writeFileSync(join(GEN, "advisory-heavy-readiness-report.json"), JSON.stringify({
  generatedAt: now.toISOString(),
  gate: "truth-governance",
  advisoryCount,
  advisoryEffect: advisoryBurden.effect,
  advisoryDescription: advisoryBurden.description,
  activeTriggers: activeTriggers.map(t => ({
    dimension: t.dimension,
    trigger: t.trigger,
    condition: t.condition,
    resultingVerdict: t.resultingVerdict,
  })),
  contradictionDowngradeRules: CONTRADICTION_DOWNGRADE_RULES,
}, null, 2));

// ─── 6. Stale Artifact Invalidations ─────────────────────────

const invalidations = INVALIDATION_RULES.map(rule => {
  // Check representative artifact existence/age
  const examplePath = rule.artifactPattern.replace(/\*/g, "EXAMPLE");
  // For patterns, check if any matching file is stale via glob-free heuristic
  const baseDir = rule.artifactPattern.split("/")[0];
  let state: "valid" | "stale" | "invalid" = "valid";
  let ageHours = 0;

  // Check the most common concrete artifact for the pattern
  const concreteExamples: Record<string, string> = {
    "generated/ai-*-report.json": "generated/ai-runtime-streak-health-report.json",
    "generated/connector-*-report.json": "generated/connector-refresh-streak-report.json",
    "generated/route-*-report.json": "generated/route-plane-coverage-report.json",
    "generated/oauth-security-closure-report.json": "generated/oauth-security-closure-report.json",
    "generated/advisor-boardroom-proof/**": "generated/advisor-boardroom-proof/advisor-identity-closure-check.json",
    "generated/os-release-readiness-report.json": "generated/os-release-readiness-report.json",
    "generated/truth-governance-report.json": "generated/truth-governance-report.json",
    "generated/component-canonicalization-report.json": "generated/component-canonicalization-report.json",
    "generated/app-*-report.json": "generated/app-identity-closure-report.json",
    "generated/no-shell-only-production-pages-report.json": "generated/no-shell-only-production-pages-report.json",
  };

  const concrete = concreteExamples[rule.artifactPattern] ?? "";
  if (concrete && existsSync(concrete)) {
    const stat = statSync(concrete);
    ageHours = (Date.now() - stat.mtimeMs) / 3_600_000;
    if (ageHours > rule.maxAgeHours) state = "stale";
  } else if (concrete) {
    state = "invalid";
  }

  return {
    ruleId: rule.ruleId,
    artifactPattern: rule.artifactPattern,
    category: rule.category,
    maxAgeHours: rule.maxAgeHours,
    concreteArtifact: concrete,
    state,
    ageHours: Math.round(ageHours * 10) / 10,
    acknowledged: false,
  };
});

writeFileSync(join(GEN, "stale-artifact-invalidations.json"), JSON.stringify({
  generatedAt: now.toISOString(),
  gate: "truth-governance",
  totalRules: INVALIDATION_RULES.length,
  validCount: invalidations.filter(i => i.state === "valid").length,
  staleCount: invalidations.filter(i => i.state === "stale").length,
  invalidCount: invalidations.filter(i => i.state === "invalid").length,
  invalidations,
}, null, 2));

// ─── 7. Structural vs Behavioral Gap Report ─────────────────

const structuralVsBehavioral = SCORED_SUBSYSTEMS.map(sub => {
  const sb = scoreboards.find(s => s.subsystem === sub)!;
  const structural = sb.dimensions.find(d => d.dimension === "structural");
  const behavioral = sb.dimensions.find(d => d.dimension === "behavioral");
  return {
    subsystem: sub,
    structuralScore: structural?.score ?? 0,
    structuralVerdict: structural?.verdict ?? "DEFERRED",
    behavioralScore: behavioral?.score ?? 0,
    behavioralVerdict: behavioral?.verdict ?? "DEFERRED",
    gap: (structural?.score ?? 0) - (behavioral?.score ?? 0),
    gapSeverity: Math.abs((structural?.score ?? 0) - (behavioral?.score ?? 0)) > 30 ? "high" : "low",
  };
});

writeFileSync(join(GEN, "structural-vs-behavioral-gap-report.json"), JSON.stringify({
  generatedAt: now.toISOString(),
  gate: "truth-governance",
  subsystems: structuralVsBehavioral,
  highGapCount: structuralVsBehavioral.filter(s => s.gapSeverity === "high").length,
}, null, 2));

// ─── 8. Readiness Language Audit ─────────────────────────────

// Check generated summary for prohibited language
const languageViolations: Array<{ file: string; matchedSynonym: string; forVerdict: string }> = [];
const summaryPath = join(GEN, "os-release-readiness-summary.md");
if (existsSync(summaryPath)) {
  const content = readFileSync(summaryPath, "utf8");
  for (const entry of STATUS_LANGUAGE_POLICY) {
    for (const syn of entry.prohibitedSynonyms) {
      // Only flag if used without proper qualification
      const regex = new RegExp(`\\b${syn}\\b`, "gi");
      if (regex.test(content) && entry.verdict !== "READY") {
        languageViolations.push({
          file: summaryPath,
          matchedSynonym: syn,
          forVerdict: entry.verdict,
        });
      }
    }
  }
}

writeFileSync(join(GEN, "readiness-language-audit.json"), JSON.stringify({
  generatedAt: now.toISOString(),
  gate: "truth-governance",
  filesAudited: existsSync(summaryPath) ? 1 : 0,
  violationsFound: languageViolations.length,
  violations: languageViolations,
  approvedVocabulary: STATUS_LANGUAGE_POLICY.map(e => e.verdict),
}, null, 2));

// ─── 9. Claim Confidence Report ──────────────────────────────

writeFileSync(join(GEN, "claim-confidence-report.json"), JSON.stringify({
  generatedAt: now.toISOString(),
  gate: "truth-governance",
  totalClaims: CLAIM_PROOF_REGISTRY.length,
  byConfidence: {
    high: CLAIM_PROOF_REGISTRY.filter(c => c.confidence === "high").length,
    medium: CLAIM_PROOF_REGISTRY.filter(c => c.confidence === "medium").length,
    low: CLAIM_PROOF_REGISTRY.filter(c => c.confidence === "low").length,
    unverified: CLAIM_PROOF_REGISTRY.filter(c => c.confidence === "unverified").length,
  },
  claims: CLAIM_PROOF_REGISTRY.map(c => ({
    claimId: c.claimId,
    claim: c.claim,
    subsystem: c.subsystem,
    confidence: c.confidence,
    dimensions: c.dimensions,
    currentVerdict: c.currentVerdict,
    proofCoverage: c.proofArtifacts.length > 0
      ? Math.round((c.proofArtifacts.filter(p => existsSync(p)).length / c.proofArtifacts.length) * 100)
      : 0,
  })),
}, null, 2));

// ─── 10. Truth Governance Report (gate output) ──────────────

// Validate
const allDimensionsScored = READINESS_DIMENSIONS.every(dim =>
  scoreboards.every(sb => sb.dimensions.some(d => d.dimension === dim.dimension))
);
if (!allDimensionsScored) errors.push("Not all subsystems have all 5 dimensions scored");

if (CLAIM_PROOF_REGISTRY.length < 10) errors.push("Claim registry has fewer than 10 entries");

const unacknowledgedInvalid = invalidations.filter(i => i.state === "invalid" && !i.acknowledged);
if (unacknowledgedInvalid.length > 0) {
  warnings.push(`${unacknowledgedInvalid.length} artifact(s) in INVALID state without acknowledgment`);
}

const ok = errors.length === 0;

const report = {
  generatedAt: now.toISOString(),
  gate: "truth-governance",
  level: "block",
  ok,
  errors,
  warnings,
  summary: {
    dimensions: READINESS_DIMENSIONS.length,
    subsystems: SCORED_SUBSYSTEMS.length,
    totalClaims: CLAIM_PROOF_REGISTRY.length,
    totalContradictions: CONTRADICTION_LEDGER.length,
    openContradictions: openContradictions.length,
    highSeverityOpen: hasUnmitigatedHighSeverity(),
    invalidationRules: INVALIDATION_RULES.length,
    proofGaps: proofGaps.reduce((s, g) => s + g.missingProofs.length, 0),
    advisoryEffect: advisoryBurden.effect,
    languageViolations: languageViolations.length,
  },
  artifactsGenerated: [
    "readiness-dimension-scoreboard.json",
    "contradiction-ledger.json",
    "claim-proof-registry.json",
    "proof-gap-register.json",
    "advisory-heavy-readiness-report.json",
    "stale-artifact-invalidations.json",
    "structural-vs-behavioral-gap-report.json",
    "readiness-language-audit.json",
    "claim-confidence-report.json",
    "truth-governance-report.json",
  ],
};

writeFileSync(join(GEN, "truth-governance-report.json"), JSON.stringify(report, null, 2));

// ─── Console Output ──────────────────────────────────────────

if (ok) {
  console.log(`✅ Truth governance: PASS (${CLAIM_PROOF_REGISTRY.length} claims, ${CONTRADICTION_LEDGER.length} contradictions, ${READINESS_DIMENSIONS.length} dimensions)`);
} else {
  for (const e of errors) console.log(`❌ ${e}`);
}
for (const w of warnings) console.log(`⚠ ${w}`);
console.log(`   Generated 10 artifacts in ${GEN}/`);

process.exit(ok ? 0 : 1);