#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generate Runtime Capability Matrix
// Produces generated/runtime-capability-matrix.json
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { writeJsonOutput, readJsonSafe, envelope } from "../../architecture/lib/utils";

const matrixPath = "src/lib/runtime/runtime-capability-matrix.ts";
const capabilityIndex = readJsonSafe("generated/capability-index.json");

const runtimes = ["web", "desktop", "mobile", "appliance"] as const;
const matrix: Record<string, Record<string, string>> = {};

// Build matrix from capability index
const capabilities = capabilityIndex?.capabilities || capabilityIndex?.entries || [];
for (const cap of capabilities) {
  const capId = cap.id || cap.capabilityId || cap.name;
  matrix[capId] = {};
  for (const rt of runtimes) {
    // Default: web=supported, desktop=supported, mobile=limited, appliance=n/a
    if (rt === "web") matrix[capId][rt] = "supported";
    else if (rt === "desktop") matrix[capId][rt] = "supported";
    else if (rt === "mobile") matrix[capId][rt] = cap.mobile === false ? "not-supported" : "limited";
    else matrix[capId][rt] = "not-applicable";
  }
}

// If source file exists, try to parse actual data
if (fs.existsSync(matrixPath)) {
  const content = fs.readFileSync(matrixPath, "utf-8");
  // Extract any explicit runtime overrides from source
  const overrideMatch = content.match(/RUNTIME_CAPABILITIES\s*=\s*(\{[\s\S]*?\}\s*as\s*const)/);
  if (overrideMatch) {
    console.log("  📋 Found explicit runtime capability declarations in source");
  }
}

writeJsonOutput("generated/runtime-capability-matrix.json", envelope("1.0.0", {
  runtimes: [...runtimes],
  capabilityCount: Object.keys(matrix).length,
  matrix,
}));

console.log(`✅ generate-runtime-capability-matrix: ${Object.keys(matrix).length} capabilities × ${runtimes.length} runtimes`);
