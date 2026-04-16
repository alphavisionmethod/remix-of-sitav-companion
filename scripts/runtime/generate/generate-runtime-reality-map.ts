#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generate Runtime Reality Map
// Produces generated/runtime-reality-map.json
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { writeJsonOutput, scanDir, envelope } from "../../architecture/lib/utils";

const REALITY_TIERS = [
  "real-executable-substrate",
  "architectural-simulation-layer",
  "testing-abstraction",
  "concept-scaffolding",
  "standard-app-code",
] as const;

type RealityTier = (typeof REALITY_TIERS)[number];

function classifyDirectoryReality(dirPath: string): RealityTier {
  const p = dirPath.replace(/\\/g, "/");
  if (p.includes("runtime") || p.includes("kernel") || p.includes("core-services")) return "real-executable-substrate";
  if (p.includes("architecture") || p.includes("contracts") || p.includes("deployment")) return "architectural-simulation-layer";
  if (p.includes("test") || p.includes("__test__") || p.includes("mock")) return "testing-abstraction";
  if (p.includes("bootstrap") || p.includes("scaffold") || p.includes("template")) return "concept-scaffolding";
  return "standard-app-code";
}

const srcDirs = [
  "src/lib/runtime", "src/lib/surfaces", "src/lib/devices", "src/lib/deployment",
  "src/lib/backend-topology", "src/lib/db", "src/lib/architecture",
  "src/components", "src/pages", "src/features", "src/hooks",
  "src/packages", "src/contracts",
];

const realityMap: Record<string, { tier: RealityTier; fileCount: number }> = {};

for (const dir of srcDirs) {
  if (!fs.existsSync(dir)) continue;
  const files = scanDir(dir, [".ts", ".tsx"]);
  realityMap[dir] = {
    tier: classifyDirectoryReality(dir),
    fileCount: files.length,
  };
}

const tierSummary: Record<string, number> = {};
for (const entry of Object.values(realityMap)) {
  tierSummary[entry.tier] = (tierSummary[entry.tier] || 0) + entry.fileCount;
}

writeJsonOutput("generated/runtime-reality-map.json", envelope("1.0.0", {
  tiers: [...REALITY_TIERS],
  directoryCount: Object.keys(realityMap).length,
  tierSummary,
  directories: realityMap,
}));

console.log(`✅ generate-runtime-reality-map: ${Object.keys(realityMap).length} directories classified across ${REALITY_TIERS.length} tiers`);
