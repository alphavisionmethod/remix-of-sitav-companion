#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Script Classification Report Generator
// Produces a summary of unclassified, duplicate, deprecated scripts
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { classifyLanguage, classifyScriptClass, type ScriptClass } from "./script-taxonomy";
import { classifyOwnership } from "./script-owner-map";
import { getCIPhase } from "./script-ci-binding-map";
import { getScriptOutputs } from "./script-output-map";

function scanScripts(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !["node_modules", "iso", "templates"].includes(entry.name)) {
      results.push(...scanScripts(full));
    } else if (/\.(ts|js|mjs|sh|ps1)$/.test(entry.name) && !entry.name.startsWith("tsconfig")) {
      results.push(full);
    }
  }
  return results;
}

const scripts = scanScripts("scripts");

// Classify each script
const classified = scripts.map(s => ({
  path: s,
  language: classifyLanguage(s),
  class: classifyScriptClass(path.basename(s)),
  owner: classifyOwnership(s),
  ciPhase: getCIPhase(s),
  outputs: getScriptOutputs(s),
}));

// Detect duplicates: scripts with very similar base names
const baseNames = new Map<string, string[]>();
for (const s of scripts) {
  const base = path.basename(s).replace(/\.(ts|js|mjs|sh|ps1)$/, "")
    .replace(/^(check|assert|validate|generate)-/, "")
    .replace(/^(scripts\/)/, "");
  if (!baseNames.has(base)) baseNames.set(base, []);
  baseNames.get(base)!.push(s);
}
const duplicates = Array.from(baseNames.entries()).filter(([, paths]) => paths.length > 1);

// Find generators without outputs
const generators = classified.filter(s => s.class === "generate");
const generatorsWithoutOutputs = generators.filter(s => s.outputs.length === 0);

// Find phase/prompt-era scripts
const phaseScripts = scripts.filter(s => /phase\d|prompt\d/.test(path.basename(s)));

// Report
const report = {
  generatedAt: new Date().toISOString(),
  totalScripts: scripts.length,
  byLanguage: {
    typescript: classified.filter(s => s.language === "typescript").length,
    shell: classified.filter(s => s.language === "shell").length,
    powershell: classified.filter(s => s.language === "powershell").length,
    javascript: classified.filter(s => s.language === "javascript").length,
  },
  byClass: Object.fromEntries(
    (["assert", "check", "validate", "generate", "bootstrap", "migrate", "emit", "codemod", "drill", "restore", "rotate"] as ScriptClass[])
      .map(c => [c, classified.filter(s => s.class === c).length])
  ),
  byOwner: Object.fromEntries(
    Array.from(new Set(classified.map(s => s.owner))).map(o => [o, classified.filter(s => s.owner === o).length])
  ),
  byCIPhase: Object.fromEntries(
    Array.from(new Set(classified.map(s => s.ciPhase))).map(p => [p, classified.filter(s => s.ciPhase === p).length])
  ),
  issues: {
    duplicateConcepts: duplicates.map(([name, paths]) => ({ concept: name, files: paths })),
    generatorsWithoutOutputs: generatorsWithoutOutputs.map(s => s.path),
    phaseEraScripts: phaseScripts,
  },
};

const outDir = "generated";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "script-classification-report.json"), JSON.stringify(report, null, 2) + "\n");

console.log(`📊 Script Classification Report:`);
console.log(`  Total scripts: ${report.totalScripts}`);
console.log(`  Duplicate concepts: ${report.issues.duplicateConcepts.length}`);
console.log(`  Generators without outputs: ${report.issues.generatorsWithoutOutputs.length}`);
console.log(`  Phase-era scripts: ${report.issues.phaseEraScripts.length}`);
console.log(`✅ script-classification-report: Report written to generated/script-classification-report.json`);
