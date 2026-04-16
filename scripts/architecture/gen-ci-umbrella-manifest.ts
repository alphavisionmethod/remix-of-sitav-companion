/* eslint-disable no-console */
import { writeFileSync, existsSync } from "node:fs";
import { CI_GATE_REGISTRY } from "../../src/lib/ci/ci-gate-registry";

const byPhase: Record<string, number> = {};
const bySeverity: Record<string, number> = {};
const fileIssues: { gateId: string; missing: string }[] = [];

for (const g of CI_GATE_REGISTRY) {
  byPhase[g.phase] = (byPhase[g.phase] ?? 0) + 1;
  bySeverity[g.severity] = (bySeverity[g.severity] ?? 0) + 1;
  if (!existsSync(g.script)) fileIssues.push({ gateId: g.id, missing: g.script });
}

const manifest = {
  generatedAt: new Date().toISOString(),
  gateCount: CI_GATE_REGISTRY.length,
  byPhase,
  bySeverity,
  registry: CI_GATE_REGISTRY,
  integrity: {
    checkedAt: new Date().toISOString(),
    gateCount: CI_GATE_REGISTRY.length,
    issues: fileIssues.map((f) => ({
      severity: "error" as const, gateId: f.gateId, message: `Script not found: ${f.missing}`,
    })),
    errorCount: fileIssues.length,
    warningCount: 0,
    ok: fileIssues.length === 0,
  },
  fileIssues,
  ok: fileIssues.length === 0,
};
writeFileSync("generated/ci-umbrella-manifest.json", JSON.stringify(manifest, null, 2));
console.log(`✅ Wrote umbrella: ${CI_GATE_REGISTRY.length} gates,`, byPhase);
