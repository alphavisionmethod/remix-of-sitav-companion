#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Artifact Ownership Coverage Check (WARN-tier)
// Asserts every generated/**/*.json has a declared producer.
// Threshold: ≥95% = pass, ≥80% = warn, <80% = error.
// Does NOT add a new BLOCK gate — keeps mandatory count at 21.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { readJsonSafe } from "../lib/utils";

interface Manifest {
  totalArtifacts: number;
  withProducer: number;
  withoutProducer: number;
  coveragePercent: number;
  orphanCount: number;
  declaredInRegistry: number;
  orphans: string[];
  entries: Array<{ artifact: string; producer: string | null; owner: string; source: string }>;
}

const MANIFEST_PATH = "generated/artifact-ownership-manifest.json";
const data = readJsonSafe<Manifest>(MANIFEST_PATH);

if (!data) {
  console.error(`❌ Missing ${MANIFEST_PATH}. Run: npm run generate:artifact-ownership`);
  process.exit(1);
}

let exitCode = 0;
const issues: string[] = [];

// Rule 1: coverage threshold
if (data.coveragePercent < 80) {
  issues.push(`coverage ${data.coveragePercent}% < 80% hard floor`);
  exitCode = 1;
} else if (data.coveragePercent < 95) {
  issues.push(`coverage ${data.coveragePercent}% < 95% target (warn)`);
}

// Rule 2: every producer script must exist on disk
let missingProducers = 0;
for (const e of data.entries) {
  if (e.producer && !e.producer.startsWith(".github/") && !e.producer.startsWith("supabase/functions/")) {
    if (!fs.existsSync(e.producer)) {
      missingProducers++;
      if (missingProducers <= 5) issues.push(`producer missing on disk: ${e.producer} (for ${e.artifact})`);
    }
  }
}
if (missingProducers > 0) {
  issues.push(`${missingProducers} producer script(s) referenced but not on disk`);
  exitCode = 1;
}

// Rule 3: every entry must have a non-empty owner
const noOwner = data.entries.filter((e) => !e.owner || e.owner.trim() === "").length;
if (noOwner > 0) {
  issues.push(`${noOwner} entries missing owner`);
  exitCode = 1;
}

// Summary
const symbol = exitCode === 0 ? (data.coveragePercent >= 95 ? "✅" : "⚠️") : "❌";
console.log(`${symbol} Artifact ownership coverage: ${data.coveragePercent}% (${data.withProducer}/${data.totalArtifacts})`);
console.log(`   Owners breakdown: declared-in-registry=${data.declaredInRegistry}, orphans=${data.orphanCount}`);
if (issues.length) {
  console.log(`   Issues:`);
  for (const i of issues.slice(0, 10)) console.log(`     - ${i}`);
}

// Sample orphans for visibility
if (data.orphans.length > 0) {
  console.log(`   Sample orphans (first 5):`);
  for (const o of data.orphans.slice(0, 5)) console.log(`     • ${o}`);
}

process.exit(exitCode);
