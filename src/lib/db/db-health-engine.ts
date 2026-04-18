// ═══════════════════════════════════════════════════════════════
// SITA OS — DB Health Engine
// Health queries and scoring functions
// ═══════════════════════════════════════════════════════════════

import { DB_SCHEMA_REGISTRY } from "./schema-registry";
import { DB_AUDIT_REGISTRY } from "./db-audit-registry";
import { DB_RUNTIME_CONSEQUENCE_MAP } from "./db-runtime-consequence-map";
import { DB_DEPENDENCY_MAP } from "./db-dependency-map";

export interface DbHealthReport {
  readonly totalTables: number;
  readonly rlsCoverage: number;
  readonly auditedTables: number;
  readonly criticalTables: number;
  readonly dependencyEdges: number;
  readonly healthScore: number;
  readonly issues: readonly string[];
}

export function computeDbHealth(): DbHealthReport {
  const totalTables = DB_SCHEMA_REGISTRY.length;
  const rlsCovered = DB_SCHEMA_REGISTRY.filter(t => t.hasRls).length;
  const auditedTables = DB_AUDIT_REGISTRY.length;
  const criticalTables = Object.values(DB_RUNTIME_CONSEQUENCE_MAP)
    .filter(c => c.criticality === "critical").length;
  const dependencyEdges = DB_DEPENDENCY_MAP.length;

  const issues: string[] = [];

  // Check RLS coverage
  const rlsCoverage = totalTables > 0 ? (rlsCovered / totalTables) * 100 : 0;
  if (rlsCoverage < 100) {
    const unprotected = DB_SCHEMA_REGISTRY.filter(t => !t.hasRls).map(t => t.name);
    issues.push(`Tables without RLS: ${unprotected.join(", ")}`);
  }

  // Check critical tables have consequence map entries
  const criticalTableNames = ["profiles", "user_roles", "capabilities", "execution_envelopes", "receipts"];
  for (const name of criticalTableNames) {
    if (!DB_RUNTIME_CONSEQUENCE_MAP[name]) {
      issues.push(`Critical table "${name}" missing from consequence map`);
    }
  }

  // Calculate health score (0-100)
  let healthScore = 0;
  healthScore += rlsCoverage >= 100 ? 30 : (rlsCoverage / 100) * 30;
  healthScore += auditedTables >= 10 ? 20 : (auditedTables / 10) * 20;
  healthScore += criticalTables >= 3 ? 15 : (criticalTables / 3) * 15;
  healthScore += dependencyEdges >= 20 ? 15 : (dependencyEdges / 20) * 15;
  healthScore += totalTables >= 100 ? 20 : (totalTables / 100) * 20;

  return {
    totalTables,
    rlsCoverage: Math.round(rlsCoverage),
    auditedTables,
    criticalTables,
    dependencyEdges,
    healthScore: Math.round(healthScore),
    issues,
  };
}

export function getDbHealthSummary(): string {
  const report = computeDbHealth();
  const lines = [
    `DB Health Score: ${report.healthScore}/100`,
    `Tables: ${report.totalTables}`,
    `RLS Coverage: ${report.rlsCoverage}%`,
    `Audited Tables: ${report.auditedTables}`,
    `Critical Tables: ${report.criticalTables}`,
    `Dependency Edges: ${report.dependencyEdges}`,
  ];
  if (report.issues.length > 0) {
    lines.push(`Issues: ${report.issues.length}`);
  }
  return lines.join("\n");
}
