#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Persistence Coverage Check
// Fails when any persistence-critical domain has 0 backing tables.
// ═══════════════════════════════════════════════════════════════
import { ViolationCollector, readJsonSafe } from "../../architecture/lib/utils";

const vc = new ViolationCollector();
const audit = readJsonSafe<any>("generated/persistence-audit.json");

if (!audit) {
  vc.add("generated/persistence-audit.json", "missing", "Run generate-persistence-audit first", "error");
  vc.report("check-persistence-coverage");
  vc.exitIfErrors();
  process.exit(1);
}

for (const d of audit.domains as any[]) {
  if (d.required && d.status === "missing") {
    vc.add("generated/persistence-audit.json", "missing-domain", `Persistence domain "${d.label}" has 0 backing tables`, "error");
  } else if (d.required && d.status === "thin") {
    vc.add("generated/persistence-audit.json", "thin-domain", `Persistence domain "${d.label}" has only ${d.coverage} table(s)`, "warning");
  }
}

console.log(`  📊 Domains: ${audit.summary.totalDomains} | Covered: ${audit.summary.covered} | Thin: ${audit.summary.thin} | Missing: ${audit.summary.missing}`);

vc.report("check-persistence-coverage");
vc.exitIfErrors();
