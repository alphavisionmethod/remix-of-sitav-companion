#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Component Governance Runner
// Single entry point that runs the full governance pipeline:
//   1. Re-audit components → regenerate registry + duplication map
//   2. Run all 5 governance checks
//   3. Emit pass/fail summary
//
// Usage:
//   npx tsx scripts/architecture/run-component-governance.ts
//   npx tsx scripts/architecture/run-component-governance.ts --strict   (exit 1 on warnings)
// ═══════════════════════════════════════════════════════════════

import { spawnSync } from "child_process";

const STRICT = process.argv.includes("--strict");

interface Step {
  name: string;
  script: string;
  required: boolean;
}

const STEPS: Step[] = [
  { name: "Audit components",         script: "scripts/architecture/audit-components.ts",                    required: true  },
  { name: "Classification check",     script: "scripts/architecture/checks/check-component-classification.ts", required: true  },
  { name: "Primitive purity",         script: "scripts/architecture/checks/check-primitive-purity.ts",         required: true  },
  { name: "Domain purity",            script: "scripts/architecture/checks/check-domain-purity.ts",            required: true  },
  { name: "Duplicate families",       script: "scripts/architecture/checks/check-duplicate-families.ts",       required: true  },
  { name: "Deprecated wrappers",      script: "scripts/architecture/checks/check-deprecated-wrappers.ts",      required: true  },
];

console.log("═══════════════════════════════════════════════════════════════");
console.log("  SITA OS — Component Governance");
console.log(`  Mode: ${STRICT ? "STRICT" : "STANDARD"}`);
console.log("═══════════════════════════════════════════════════════════════\n");

let failed = 0;
const results: Array<{ name: string; ok: boolean; output: string }> = [];

for (const step of STEPS) {
  process.stdout.write(`▶ ${step.name.padEnd(28)} `);
  const r = spawnSync("npx", ["tsx", step.script], { encoding: "utf-8" });
  const ok = r.status === 0;
  results.push({ name: step.name, ok, output: (r.stdout || "") + (r.stderr || "") });
  console.log(ok ? "✅" : "❌");
  if (!ok && step.required) failed++;
}

console.log("\n═══════════════════════════════════════════════════════════════");
console.log(`  Results: ${results.filter(r => r.ok).length}/${results.length} passed`);
console.log("═══════════════════════════════════════════════════════════════");

if (failed > 0) {
  console.log("\n❌ FAILED STEPS:\n");
  for (const r of results.filter(x => !x.ok)) {
    console.log(`── ${r.name} ──`);
    console.log(r.output);
  }
  process.exit(1);
}

console.log("\n✅ Component governance: GREEN");
process.exit(0);
