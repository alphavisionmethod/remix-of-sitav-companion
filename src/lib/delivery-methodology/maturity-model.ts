// ═══════════════════════════════════════════════════════════════
// SITA Delivery OS — Platform Maturity Model
// Track maturity by domain, feature family, truth level
// ═══════════════════════════════════════════════════════════════

export interface MaturityScore {
  scopeType: "domain" | "feature" | "system";
  scopeId: string;
  scopeLabel: string;
  truthLevel: number;        // 0-100
  automationLevel: number;   // 0-100
  persistenceLevel: number;  // 0-100
  proofLevel: number;        // 0-100
  launchReadiness: number;   // 0-100
  interactionCoverage: number; // 0-100
  contractCoverage: number;  // 0-100
  compositeScore: number;    // 0-100
}

export function computeCompositeScore(score: Omit<MaturityScore, "compositeScore">): number {
  const weights = {
    truthLevel: 0.20,
    persistenceLevel: 0.20,
    proofLevel: 0.15,
    launchReadiness: 0.15,
    interactionCoverage: 0.10,
    contractCoverage: 0.10,
    automationLevel: 0.10,
  };
  return Math.round(
    score.truthLevel * weights.truthLevel +
    score.persistenceLevel * weights.persistenceLevel +
    score.proofLevel * weights.proofLevel +
    score.launchReadiness * weights.launchReadiness +
    score.interactionCoverage * weights.interactionCoverage +
    score.contractCoverage * weights.contractCoverage +
    score.automationLevel * weights.automationLevel
  );
}

export type MaturityGrade = "F" | "D" | "C" | "B" | "A" | "S";

export function getMaturityGrade(compositeScore: number): MaturityGrade {
  if (compositeScore >= 95) return "S";
  if (compositeScore >= 80) return "A";
  if (compositeScore >= 65) return "B";
  if (compositeScore >= 50) return "C";
  if (compositeScore >= 30) return "D";
  return "F";
}

export function getMaturityLabel(grade: MaturityGrade): string {
  const labels: Record<MaturityGrade, string> = {
    S: "Production-Proven", A: "Launch-Ready", B: "Verified",
    C: "Implemented", D: "Scaffolded", F: "Early / Presentational",
  };
  return labels[grade];
}

export function computeDomainMaturity(metrics: {
  totalRoutes: number; routesWithPersistence: number; routesWithProofs: number;
  totalContracts: number; contractsImplemented: number;
  totalInteractions: number; interactionsVerified: number;
  totalJourneys: number; journeysPass: number;
  automatedFlows: number; totalFlows: number;
}): MaturityScore {
  const { totalRoutes: tr, routesWithPersistence: rp, routesWithProofs: rpf,
    totalContracts: tc, contractsImplemented: ci,
    totalInteractions: ti, interactionsVerified: iv,
    totalJourneys: tj, journeysPass: jp,
    automatedFlows: af, totalFlows: tf } = metrics;

  const persistence = tr > 0 ? Math.round((rp / tr) * 100) : 0;
  const proof = tr > 0 ? Math.round((rpf / tr) * 100) : 0;
  const contract = tc > 0 ? Math.round((ci / tc) * 100) : 0;
  const interaction = ti > 0 ? Math.round((iv / ti) * 100) : 0;
  const journey = tj > 0 ? Math.round((jp / tj) * 100) : 0;
  const automation = tf > 0 ? Math.round((af / tf) * 100) : 0;
  const truth = Math.round((persistence + proof + journey) / 3);
  const launch = Math.round((truth + contract + interaction) / 3);

  const partial: Omit<MaturityScore, "compositeScore"> = {
    scopeType: "domain", scopeId: "", scopeLabel: "",
    truthLevel: truth, automationLevel: automation, persistenceLevel: persistence,
    proofLevel: proof, launchReadiness: launch,
    interactionCoverage: interaction, contractCoverage: contract,
  };

  return { ...partial, compositeScore: computeCompositeScore(partial) };
}
