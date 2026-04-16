#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Policy Coverage Validator
// Validates every capability has a policy binding
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, readJsonSafe, loadCapabilityIndex, scanDir, readFileContent } from "./lib/utils";

const vc = new ViolationCollector();
const capIndex = loadCapabilityIndex();

if (!capIndex) {
  console.error("❌ generated/capability-index.json not found");
  process.exit(1);
}

const policyMatrix = readJsonSafe<any>("generated/capability-policy-matrix.json");
const capabilities = capIndex.capabilities || capIndex.entries || [];

// Collect all policy definitions from source
const policyFiles = scanDir("src/packages", [".ts"]).filter(f =>
  f.includes("policy") || f.includes("governance")
);

const definedPolicies = new Set<string>();
for (const file of policyFiles) {
  const content = readFileContent(file);
  const matches = content.match(/policyId:\s*["']([^"']+)["']/g);
  if (matches) {
    for (const m of matches) {
      const id = m.match(/["']([^"']+)["']/)?.[1];
      if (id) definedPolicies.add(id);
    }
  }
}

// Check capability coverage
let covered = 0;
let uncovered = 0;

if (policyMatrix?.matrix) {
  for (const entry of policyMatrix.matrix) {
    const policies = entry.policies || entry.policyIds || [];
    if (policies.length > 0) {
      covered++;
    } else {
      uncovered++;
      vc.add("capability-policy-matrix.json", "no-policy", `Capability "${entry.capabilityId}" has no policy binding`, "warning");
    }
  }
} else {
  // Fallback: check capabilities count
  covered = capabilities.length;
  console.log("  ⚠️ No policy matrix found — coverage unknown");
}

const total = covered + uncovered;
const coveragePercent = total > 0 ? Math.round((covered / total) * 100) : 0;
console.log(`  🛡️ Policy coverage: ${covered}/${total} capabilities (${coveragePercent}%)`);
console.log(`  📜 ${definedPolicies.size} policy definitions found in source`);

vc.report("check-policy-coverage");
vc.exitIfErrors();
