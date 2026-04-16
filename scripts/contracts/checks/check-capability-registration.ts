#!/usr/bin/env node
// SITA OS — Capability Registration Validator
import { ViolationCollector, loadCapabilityIndex, scanDir, readFileContent } from "../architecture/lib/utils";
const vc = new ViolationCollector();
const capIndex = loadCapabilityIndex();
if (!capIndex) { console.error("❌ capability-index.json not found"); process.exit(1); }
const capabilities = capIndex.capabilities || capIndex.entries || [];
const registeredIds = new Set(capabilities.map((c: any) => c.id || c.name));

// Scan source for capability declarations not in registry
const sourceFiles = scanDir("src/packages", [".ts"]);
const declaredCaps = new Set<string>();
for (const file of sourceFiles) {
  if (file.includes(".test.")) continue;
  const content = readFileContent(file);
  const matches = content.match(/capabilityId:\s*["']([^"']+)["']/g);
  if (matches) {
    for (const m of matches) {
      const id = m.match(/["']([^"']+)["']/)?.[1];
      if (id) declaredCaps.add(id);
    }
  }
}
for (const id of declaredCaps) {
  if (!registeredIds.has(id)) {
    vc.add("capability-index.json", "unregistered", `Capability "${id}" declared in source but not in registry`, "warning");
  }
}
console.log(`  📋 ${registeredIds.size} registered, ${declaredCaps.size} declared in source`);
vc.report("check-capability-registration");
vc.exitIfErrors();
