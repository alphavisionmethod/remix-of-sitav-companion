#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Manifest CI Gates Check
// Validates that generators are bound to CI phases
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir } from "../../architecture/lib/utils";

const vc = new ViolationCollector();
const generators = scanDir("scripts", [".ts"]).filter(f =>
  f.includes("generate-") && !f.includes("node_modules")
);

// Check that generate-all.ts or validate-all.ts references each generator
const masterFiles = ["scripts/generate-all.ts", "scripts/validate-all.ts"];
const masterContent = masterFiles.map(f => {
  try { return require("fs").readFileSync(f, "utf-8"); } catch { return ""; }
}).join("\n");

let bound = 0;
let unbound = 0;

for (const gen of generators) {
  const basename = gen.split("/").pop()!;
  if (basename === "generate-all.ts") continue;
  if (masterContent.includes(basename) || masterContent.includes(gen)) {
    bound++;
  } else {
    unbound++;
    vc.add(gen, "unbound-generator", `Generator "${basename}" not referenced in master scripts`, "warning");
  }
}

console.log(`  🔗 ${bound} generators CI-bound, ${unbound} unbound`);

vc.report("check-manifest-ci-gates");
vc.exitIfErrors();
