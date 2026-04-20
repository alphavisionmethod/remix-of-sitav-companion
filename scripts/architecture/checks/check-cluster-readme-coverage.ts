// ============================================================================
// BLOCK Gate #27 — Cluster README Coverage
// ----------------------------------------------------------------------------
// Asserts that every folder in AMBIGUOUS_CLUSTERS has a README.md containing
// the required canonical headings. Prevents folder-browsing cognitive risk
// from regressing once anchors are in place.
//
// Required headings (case-sensitive, must appear as Markdown headings):
//   - "## Purpose"
//   - "## Layer"
//   - "## Canonical neighbors"
//
// BLOCK tier. Emits generated/cluster-readme-coverage-report.json.
// ============================================================================
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { emitGateReport, type GateIssue } from "../../validation/_lib/emit-gate-report";

const AMBIGUOUS_CLUSTERS = [
  "src/lib/services",
  "src/lib/core-services",
  "src/lib/platform",
  "src/lib/platform-law",
  "src/lib/platform-plane",
  "src/lib/web-platform",
  "src/lib/observability",
  "src/lib/incidents",
  "src/lib/ai-platform",
];

const REQUIRED_HEADINGS = ["## Purpose", "## Layer", "## Canonical neighbors"];

const issues: GateIssue[] = [];
const perCluster: Array<{ cluster: string; ok: boolean; missingHeadings: string[]; readmePath: string; exists: boolean }> = [];

for (const cluster of AMBIGUOUS_CLUSTERS) {
  const readmePath = join(cluster, "README.md");
  const exists = existsSync(readmePath);
  if (!exists) {
    issues.push({
      severity: "error",
      area: cluster,
      message: `Missing required README.md at ${readmePath}. Ambiguous clusters MUST have a canonical anchor README.`,
    });
    perCluster.push({ cluster, ok: false, missingHeadings: REQUIRED_HEADINGS, readmePath, exists: false });
    continue;
  }
  const body = readFileSync(readmePath, "utf8");
  const missingHeadings = REQUIRED_HEADINGS.filter(h => !body.includes(h));
  if (missingHeadings.length > 0) {
    issues.push({
      severity: "error",
      area: cluster,
      message: `${readmePath} missing required heading(s): ${missingHeadings.join(", ")}`,
    });
  }
  perCluster.push({ cluster, ok: missingHeadings.length === 0, missingHeadings, readmePath, exists: true });
}

const ok = issues.filter(i => i.severity === "error").length === 0;

emitGateReport({
  gate: "cluster-readme-coverage",
  ok,
  issues,
  extra: {
    totalClusters: AMBIGUOUS_CLUSTERS.length,
    okCount: perCluster.filter(c => c.ok).length,
    failCount: perCluster.filter(c => !c.ok).length,
    perCluster,
    requiredHeadings: REQUIRED_HEADINGS,
  },
});

console.log(
  `cluster-readme-coverage: ${ok ? "OK" : "FAIL"} (${perCluster.filter(c => c.ok).length}/${AMBIGUOUS_CLUSTERS.length} clusters anchored)`,
);
if (!ok) {
  for (const i of issues) console.log(`  [${i.severity}] ${i.area}: ${i.message}`);
}
process.exit(ok ? 0 : 1);
