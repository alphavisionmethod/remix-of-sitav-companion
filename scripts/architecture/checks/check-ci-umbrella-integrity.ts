/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// CI Gate — CI Umbrella Integrity (Phase 8)
// Asserts every registered gate has a real script on disk and emits
// the master manifest at generated/ci-umbrella-manifest.json.
// ═══════════════════════════════════════════════════════════════

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import { CI_GATE_REGISTRY } from "../../../src/lib/ci/ci-gate-registry";
import { validateCIUmbrellaIntegrity } from "../../../src/lib/ci/ci-umbrella-integrity";

const integrity = validateCIUmbrellaIntegrity();
const fileIssues: string[] = [];

for (const gate of CI_GATE_REGISTRY) {
  if (!existsSync(gate.script)) {
    fileIssues.push(`${gate.id}: script missing on disk → ${gate.script}`);
  }
}

const manifest = {
  generatedAt: new Date().toISOString(),
  gateCount: CI_GATE_REGISTRY.length,
  byPhase: CI_GATE_REGISTRY.reduce<Record<string, number>>((acc, g) => {
    acc[g.phase] = (acc[g.phase] ?? 0) + 1;
    return acc;
  }, {}),
  bySeverity: CI_GATE_REGISTRY.reduce<Record<string, number>>((acc, g) => {
    acc[g.severity] = (acc[g.severity] ?? 0) + 1;
    return acc;
  }, {}),
  registry: CI_GATE_REGISTRY,
  integrity,
  fileIssues,
  ok: integrity.ok && fileIssues.length === 0,
};

const out = "generated/ci-umbrella-manifest.json";
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(manifest, null, 2), "utf-8");

console.log(`CI Umbrella: ${CI_GATE_REGISTRY.length} gates registered`);
console.log(`  registry errors: ${integrity.errorCount}, file issues: ${fileIssues.length}`);
console.log(`  → ${out}`);

if (!manifest.ok) {
  console.error("❌ Issues:");
  for (const i of integrity.issues) console.error(`   - [${i.severity}] ${i.gateId}: ${i.message}`);
  for (const i of fileIssues) console.error(`   - ${i}`);
  process.exit(1);
}
console.log("✅ Pass");
