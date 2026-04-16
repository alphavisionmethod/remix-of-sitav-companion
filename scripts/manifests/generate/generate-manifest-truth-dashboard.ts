#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generate Manifest Truth Dashboard
// Produces generated/manifest-truth-dashboard.json
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { writeJsonOutput, readJsonSafe, envelope } from "../../architecture/lib/utils";

const generatedDir = "generated";
const jsonFiles = fs.existsSync(generatedDir)
  ? fs.readdirSync(generatedDir).filter(f => f.endsWith(".json"))
  : [];

let totalEntries = 0;
let withVersion = 0;
let withTimestamp = 0;
let stale = 0;
const now = Date.now();
const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

for (const file of jsonFiles) {
  const data = readJsonSafe(`${generatedDir}/${file}`);
  if (!data) continue;
  totalEntries++;
  if (data.version) withVersion++;
  if (data.generatedAt) {
    withTimestamp++;
    const age = now - new Date(data.generatedAt).getTime();
    if (age > STALE_THRESHOLD_MS) stale++;
  }
}

const dashboard = {
  totalManifests: totalEntries,
  withVersion,
  withTimestamp,
  staleManifests: stale,
  healthScore: totalEntries > 0
    ? Math.round(((withVersion + withTimestamp) / (totalEntries * 2)) * 100)
    : 0,
  freshness: stale === 0 ? "fresh" : stale < totalEntries * 0.3 ? "mostly-fresh" : "stale",
};

writeJsonOutput("generated/manifest-truth-dashboard.json", envelope("1.0.0", dashboard));
console.log(`✅ generate-manifest-truth-dashboard: Health ${dashboard.healthScore}%, freshness: ${dashboard.freshness}`);
