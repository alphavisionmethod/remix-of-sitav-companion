// ═══════════════════════════════════════════════════════════════
// SITA OS — Deployment Confidence Model
// Replaces validator-theater with scored behavioral confidence
// ═══════════════════════════════════════════════════════════════

import { CRITICAL_PATH_MATRIX, getCoverageScore, type CoverageStatus } from "./critical-path-matrix";
import { DOMAIN_COVERAGE_TARGETS } from "./testing-strategy";

export interface DomainConfidence {
  domain: string;
  coveragePercent: number;
  criticalPathsCovered: number;
  criticalPathsTotal: number;
  status: "green" | "yellow" | "red";
}

export interface DeploymentConfidenceReport {
  overallScore: number;
  criticalJourneyCoverage: number;
  safetyDrillStatus: "current" | "overdue" | "never-run";
  domainConfidence: DomainConfidence[];
  untestedCriticalPaths: string[];
  deploymentRecommendation: "go" | "caution" | "block";
  generatedAt: string;
}

export function computeDomainConfidence(): DomainConfidence[] {
  return DOMAIN_COVERAGE_TARGETS.map((target) => {
    const paths = CRITICAL_PATH_MATRIX.filter((p) => p.owner === target.owner);
    const covered = paths.filter((p) => p.currentCoverage === "covered" || p.currentCoverage === "partial").length;
    const pct = paths.length > 0 ? Math.round((covered / paths.length) * 100) : 0;
    return {
      domain: target.domain,
      coveragePercent: pct,
      criticalPathsCovered: covered,
      criticalPathsTotal: paths.length,
      status: pct >= target.minimumCoverage ? "green" : pct >= target.minimumCoverage * 0.6 ? "yellow" : "red",
    };
  });
}

export function generateConfidenceReport(
  drillStatus: "current" | "overdue" | "never-run" = "never-run"
): DeploymentConfidenceReport {
  const domainConfidence = computeDomainConfidence();
  const criticalJourneyCoverage = getCoverageScore();
  const untestedCriticalPaths = CRITICAL_PATH_MATRIX
    .filter((p) => p.currentCoverage === "uncovered" && p.riskLevel === "critical")
    .map((p) => `${p.id}: ${p.feature}`);

  const redDomains = domainConfidence.filter((d) => d.status === "red").length;
  const overallScore = Math.round(
    criticalJourneyCoverage * 0.5 +
    (redDomains === 0 ? 30 : redDomains <= 2 ? 15 : 0) +
    (drillStatus === "current" ? 20 : drillStatus === "overdue" ? 10 : 0)
  );

  let deploymentRecommendation: "go" | "caution" | "block" = "go";
  if (overallScore < 40 || untestedCriticalPaths.length > 3) deploymentRecommendation = "block";
  else if (overallScore < 70) deploymentRecommendation = "caution";

  return {
    overallScore,
    criticalJourneyCoverage,
    safetyDrillStatus: drillStatus,
    domainConfidence,
    untestedCriticalPaths,
    deploymentRecommendation,
    generatedAt: new Date().toISOString(),
  };
}