#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generate Runbook Index
// Produces generated/runbook-index.json
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { writeJsonOutput, envelope } from "../../architecture/lib/utils";

const registry = "src/lib/operations/runbook-registry.ts";
const entries: Array<{ id: string; system: string; type: string }> = [];

if (fs.existsSync(registry)) {
  const content = fs.readFileSync(registry, "utf-8");
  // Extract runbook entries from the registry
  const entryRegex = /runbookId:\s*["']([^"']+)["']|id:\s*["']runbook-([^"']+)["']/g;
  let match;
  while ((match = entryRegex.exec(content)) !== null) {
    const id = match[1] || match[2] || "unknown";
    entries.push({ id, system: "platform", type: "recovery" });
  }
}

// Also scan for any runbook markdown files
const runbookDirs = ["docs/runbooks", "scripts/support/runbooks"];
for (const dir of runbookDirs) {
  if (fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir)) {
      if (file.endsWith(".md") || file.endsWith(".ts")) {
        entries.push({ id: file.replace(/\.(md|ts)$/, ""), system: "platform", type: "documented" });
      }
    }
  }
}

writeJsonOutput("generated/runbook-index.json", envelope("1.0.0", {
  totalRunbooks: entries.length,
  entries,
}));

console.log(`✅ generate-runbook-index: ${entries.length} runbooks indexed`);
