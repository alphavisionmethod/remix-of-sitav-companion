#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SELF-HEALING — Root-Cause Grouping
// Clusters N downstream symptoms → ≤K root-cause repair units.
// Cluster key = (class, top-impacted-file OR subsystem)
// ═══════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const REPORT = path.resolve("generated/self-healing/failure-report.json");
const OUT = path.resolve("generated/self-healing/root-cause-clusters.json");

if (!existsSync(REPORT)) {
  console.error(`[group] missing ${REPORT}`); process.exit(1);
}
const report = JSON.parse(readFileSync(REPORT, "utf8"));

const clusters = new Map();
for (const f of report.failures) {
  const anchor = f.impactedFiles[0] || f.subsystem || "global";
  const key = `${f.normalizedClass}::${anchor}`;
  if (!clusters.has(key)) {
    clusters.set(key, {
      clusterId: "cluster_" + crypto.randomBytes(6).toString("hex"),
      class: f.normalizedClass,
      anchor,
      repairFamily: f.repairFamily,
      severity: f.severity,
      symptoms: [],
      impactedFiles: new Set(),
      impactedOwners: new Set(),
      maxConfidence: 0,
    });
  }
  const c = clusters.get(key);
  c.symptoms.push(f.failureId);
  f.impactedFiles.forEach(x => c.impactedFiles.add(x));
  f.impactedOwners.forEach(x => c.impactedOwners.add(x));
  c.maxConfidence = Math.max(c.maxConfidence, f.rootCauseConfidence);
  if (severityRank(f.severity) > severityRank(c.severity)) c.severity = f.severity;
}

function severityRank(s) {
  return { critical: 3, high: 2, normal: 1, low: 0 }[s] ?? 0;
}

const out = {
  schema: "self-healing/root-cause-clusters@1",
  generatedAt: new Date().toISOString(),
  totals: { symptoms: report.failures.length, clusters: clusters.size },
  clusters: [...clusters.values()].map(c => ({
    ...c,
    impactedFiles: [...c.impactedFiles],
    impactedOwners: [...c.impactedOwners],
    symptomCount: c.symptoms.length,
  })),
};
writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log(`[group] ${report.failures.length} symptoms → ${clusters.size} clusters → ${OUT}`);