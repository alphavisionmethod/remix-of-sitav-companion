#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generate Golden Path Registry
// Produces generated/golden-path-registry.json
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { writeJsonOutput, envelope } from "../../architecture/lib/utils";

const registry = "src/lib/operations/golden-path-registry.ts";
const entries: Array<{ id: string; journey: string; steps: number }> = [];

if (fs.existsSync(registry)) {
  const content = fs.readFileSync(registry, "utf-8");
  const pathRegex = /journeyId:\s*["']([^"']+)["']|pathId:\s*["']([^"']+)["']/g;
  let match;
  while ((match = pathRegex.exec(content)) !== null) {
    const id = match[1] || match[2] || "unknown";
    entries.push({ id, journey: id.replace(/-/g, " "), steps: 0 });
  }
}

writeJsonOutput("generated/golden-path-registry.json", envelope("1.0.0", {
  totalPaths: entries.length,
  entries,
}));

console.log(`✅ generate-golden-path-registry: ${entries.length} golden paths indexed`);
