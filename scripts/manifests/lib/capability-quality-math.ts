// SITA OS — Capability Quality Score Computation Helpers
export function computeQualityScore(checks: {
  hasBarrelExport: boolean;
  hasServiceConsumer: boolean;
  hasReceiptBinding: boolean;
  hasTestCoverage: boolean;
  hasContractType: boolean;
}): number {
  let score = 0;
  if (checks.hasBarrelExport) score += 20;
  if (checks.hasServiceConsumer) score += 25;
  if (checks.hasReceiptBinding) score += 20;
  if (checks.hasTestCoverage) score += 20;
  if (checks.hasContractType) score += 15;
  return score;
}

export function qualityTier(score: number): string {
  if (score >= 80) return "production";
  if (score >= 60) return "beta";
  if (score >= 40) return "alpha";
  return "scaffold";
}
