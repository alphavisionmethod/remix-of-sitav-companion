// ═══════════════════════════════════════════════════════════════
// SITA Delivery OS — Change Impact Analyzer
// Determines blast radius of proposed changes
// ═══════════════════════════════════════════════════════════════

export interface ChangeProposal {
  title: string;
  changeType: "feature" | "refactor" | "migration" | "schema" | "policy" | "deprecation";
  affectedDomains: string[];
  affectedFeatureIds: string[];
  description: string;
}

export interface ImpactAnalysis {
  changeTitle: string;
  severity: "low" | "medium" | "high" | "critical";
  affectedRoutes: string[];
  affectedContracts: string[];
  affectedProbes: string[];
  affectedJourneys: string[];
  affectedLaunchGates: string[];
  affectedDomains: string[];
  migrationRisks: Array<{ risk: string; severity: string }>;
  rolloutRisks: Array<{ risk: string; severity: string }>;
  bundlePerfRisks: Array<{ risk: string; severity: string }>;
  trustRisks: Array<{ risk: string; severity: string }>;
  recommendations: string[];
}

export function analyzeChangeImpact(proposal: ChangeProposal): ImpactAnalysis {
  const affectedRoutes = proposal.affectedFeatureIds.map(f => `/${proposal.affectedDomains[0] ?? "unknown"}/${f}`);
  const affectedContracts = proposal.affectedFeatureIds.map(f => `${f}-contract`);
  const affectedProbes = proposal.affectedFeatureIds.map(f => `probe-${f}-health`);
  const affectedJourneys = proposal.affectedFeatureIds.map(f => `${f}-journey`);

  const migrationRisks: Array<{ risk: string; severity: string }> = [];
  const rolloutRisks: Array<{ risk: string; severity: string }> = [];
  const trustRisks: Array<{ risk: string; severity: string }> = [];
  const bundlePerfRisks: Array<{ risk: string; severity: string }> = [];

  if (proposal.changeType === "schema") {
    migrationRisks.push({ risk: "Schema migration required — verify backward compatibility", severity: "high" });
    rolloutRisks.push({ risk: "Requires coordinated deploy with frontend", severity: "medium" });
  }
  if (proposal.changeType === "migration") {
    migrationRisks.push({ risk: "Data migration — ensure rollback plan exists", severity: "high" });
    trustRisks.push({ risk: "Historical data integrity must be preserved", severity: "high" });
  }
  if (proposal.changeType === "deprecation") {
    rolloutRisks.push({ risk: "Downstream consumers must migrate first", severity: "high" });
    migrationRisks.push({ risk: "Feature removal — verify no active users", severity: "critical" });
  }
  if (proposal.affectedDomains.length > 2) {
    rolloutRisks.push({ risk: "Cross-domain change — coordinate across teams", severity: "medium" });
  }
  if (proposal.affectedFeatureIds.length > 5) {
    bundlePerfRisks.push({ risk: "Large surface area — may affect bundle size", severity: "low" });
  }

  const severity = migrationRisks.some(r => r.severity === "critical") ? "critical"
    : migrationRisks.some(r => r.severity === "high") || trustRisks.length > 0 ? "high"
    : rolloutRisks.length > 0 ? "medium" : "low";

  const recommendations: string[] = [];
  if (severity === "critical" || severity === "high") recommendations.push("Requires senior review before execution");
  if (migrationRisks.length > 0) recommendations.push("Create rollback plan");
  if (trustRisks.length > 0) recommendations.push("Verify proof/receipt lineage after change");
  if (proposal.affectedDomains.length > 1) recommendations.push("Run cross-domain integration tests");

  return {
    changeTitle: proposal.title,
    severity,
    affectedRoutes,
    affectedContracts,
    affectedProbes,
    affectedJourneys,
    affectedLaunchGates: proposal.affectedFeatureIds.map(f => `${f}-launch-gate`),
    affectedDomains: proposal.affectedDomains,
    migrationRisks,
    rolloutRisks,
    bundlePerfRisks,
    trustRisks,
    recommendations,
  };
}
