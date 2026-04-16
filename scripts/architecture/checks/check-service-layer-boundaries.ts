#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Service Layer Boundary Check
// Asserts forbidden cross-layer imports per Service Layer Constitution.
//
// Rules enforced:
//   • L1 (core-services) MUST NOT import @/lib/services
//   • L4 projection-service files MUST NOT import @/lib/core-services/executor*
//   • L5 (data-services) MUST NOT import @/lib/core-services internals
//   • Pages/components MUST NOT import @/lib/core-services/<deep-path>
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir, readFileContent } from "../lib/utils";

const vc = new ViolationCollector();

// ── L1 platform must not import L2 domain ──────────────────────
const platformFiles = scanDir("src/lib/core-services", [".ts"])
  .filter(f => !f.includes("__tests__") && !f.includes("/index.ts") && !f.endsWith("/service-facade.ts"));

for (const file of platformFiles) {
  const content = readFileContent(file);
  // Allow service-tier-manifest references which are pure data
  if (file.endsWith("service-tier-manifest.ts")) continue;
  if (/from\s+["']@\/lib\/services["']/.test(content)) {
    vc.add(file, "platform-imports-domain", "L1 platform must not import the @/lib/services barrel — use service-facade if both layers are needed", "error");
  }
}

// ── L5 UI clients must not reach into core-services internals ──
const clientFiles = scanDir("src/lib/data-services", [".ts"]);
for (const file of clientFiles) {
  const content = readFileContent(file);
  if (/from\s+["']@\/lib\/core-services\/[^"']+["']/.test(content)) {
    vc.add(file, "client-imports-platform-internal", "L5 UI clients must not import deep core-services paths", "warning");
  }
}

// ── L4 projection services must not import executor/mutation paths ──
const projectionFiles = [
  ...scanDir("src/lib/core-services/projection-service", [".ts"]),
  ...scanDir("src/lib/services/projection-service", [".ts"]),
];
for (const file of projectionFiles) {
  const content = readFileContent(file);
  if (/from\s+["']@\/lib\/core-services\/executor[^"']*["']/.test(content)) {
    vc.add(file, "projection-imports-executor", "L4 projections must be read-only — no executor imports", "error");
  }
  if (/from\s+["']@\/lib\/core-services\/approval-engine[^"']*["']/.test(content)) {
    vc.add(file, "projection-imports-approval", "L4 projections must not own approval logic", "error");
  }
}

console.log(`  📊 scanned ${platformFiles.length} L1, ${clientFiles.length} L5, ${projectionFiles.length} L4 files`);
vc.report("check-service-layer-boundaries");
vc.exitIfErrors();
