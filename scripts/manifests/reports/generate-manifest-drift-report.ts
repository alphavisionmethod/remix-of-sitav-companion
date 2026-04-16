#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Generate Manifest Drift Report
// Produces generated/manifest-drift-report.json
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { writeJsonOutput, readJsonSafe, scanDir, envelope } from "../../architecture/lib/utils";

const generatedDir = "generated";
const jsonFiles = fs.existsSync(generatedDir)
  ? fs.readdirSync(generatedDir).filter(f => f.endsWith(".json"))
  : [];

const driftEntries: Array<{ file: string; issue: string; severity: string }> = [];

// Check for manifests older than source
for (const file of jsonFiles) {
  const data = readJsonSafe(`${generatedDir}/${file}`);
  if (!data?.generatedAt) {
    driftEntries.push({ file, issue: "No generatedAt timestamp — cannot detect drift", severity: "warning" });
    continue;
  }
  const generatedTime = new Date(data.generatedAt).getTime();
  const fileStats = fs.statSync(`${generatedDir}/${file}`);
  // If file was modified after generation timestamp, possible manual edit
  if (fileStats.mtime.getTime() - generatedTime > 60000) {
    driftEntries.push({ file, issue: "File modified after generation — possible manual edit drift", severity: "warning" });
  }
}

// Check for generators that don't have corresponding output
const generators = scanDir("scripts", [".ts"]).filter(f => f.includes("generate-"));
for (const gen of generators) {
  const base = gen.split("/").pop()!.replace(/\.ts$/, "").replace("generate-", "");
  if (base === "all" || base === "health") continue;
  const possibleOutputs = jsonFiles.filter(f => f.includes(base));
  if (possibleOutputs.length === 0) {
    driftEntries.push({ file: gen, issue: `Generator has no matching output in generated/`, severity: "info" });
  }
}

writeJsonOutput("generated/manifest-drift-report.json", envelope("1.0.0", {
  totalIssues: driftEntries.length,
  bySeverity: {
    error: driftEntries.filter(e => e.severity === "error").length,
    warning: driftEntries.filter(e => e.severity === "warning").length,
    info: driftEntries.filter(e => e.severity === "info").length,
  },
  entries: driftEntries,
}));

console.log(`✅ generate-manifest-drift-report: ${driftEntries.length} drift issues detected`);
