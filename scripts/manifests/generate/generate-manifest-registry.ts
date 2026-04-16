#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generate Manifest Registry
// Produces generated/manifest-registry.json
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { writeJsonOutput, readJsonSafe, envelope } from "../../architecture/lib/utils";

const generatedDir = "generated";
const jsonFiles = fs.existsSync(generatedDir)
  ? fs.readdirSync(generatedDir).filter(f => f.endsWith(".json"))
  : [];

const entries = jsonFiles.map(file => {
  const data = readJsonSafe(`${generatedDir}/${file}`);
  const stats = fs.statSync(`${generatedDir}/${file}`);
  return {
    file,
    path: `${generatedDir}/${file}`,
    sizeBytes: stats.size,
    lastModified: stats.mtime.toISOString(),
    hasVersion: !!data?.version,
    hasTimestamp: !!data?.generatedAt,
    topLevelKeys: data ? Object.keys(data).slice(0, 10) : [],
  };
});

writeJsonOutput("generated/manifest-registry.json", envelope("1.0.0", {
  totalManifests: entries.length,
  totalSizeBytes: entries.reduce((a, e) => a + e.sizeBytes, 0),
  entries,
}));

console.log(`✅ generate-manifest-registry: ${entries.length} manifests indexed`);
