#!/usr/bin/env node
// SITA OS — Policy Mapping Completeness
import { ViolationCollector, readJsonSafe, loadCapabilityIndex, scanDir, readFileContent } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const capIndex = loadCapabilityIndex();
if (!capIndex) { console.error("❌ capability-index.json not found"); process.exit(1); }
const caps = capIndex.capabilities || capIndex.entries || [];

// Find policy definitions in source
const policyFiles = scanDir("src/packages", [".ts"]).filter(f => f.includes("policy") || f.includes("governance"));
const policyDefs = new Map<string, string>();
for (const file of policyFiles) {
  const content = readFileContent(file);
  const matches = content.matchAll(/(?:policyId|id):\s*["']([^"']+)["']/g);
  for (const m of matches) {
    policyDefs.set(m[1], file);
  }
}

// Check policy matrix coverage
const policyMatrix = readJsonSafe<any>("generated/capability-policy-matrix.json");
if (policyMatrix?.matrix) {
  let covered = 0;
  for (const entry of policyMatrix.matrix) {
    const policies = entry.policies || entry.policyIds || [];
    if (policies.length > 0) covered++;
  }
  console.log(`  🛡️ ${covered}/${policyMatrix.matrix.length} capabilities have policy mappings`);
}
console.log(`  📜 ${policyDefs.size} policy definitions found`);
vc.report("check-policy-mapping");
vc.exitIfErrors();
