#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Master Script Registry
// Discovers all scripts and produces the canonical registry
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { classifyLanguage, classifyScriptClass, type ScriptClass, type ScriptLanguage, type OwnershipDomain, type CIPhase } from "./script-taxonomy";
import { classifyOwnership } from "./script-owner-map";
import { getCIPhase } from "./script-ci-binding-map";
import { getScriptOutputs } from "./script-output-map";

export interface ScriptRegistryEntry {
  id: string;
  path: string;
  class: ScriptClass;
  owner: OwnershipDomain;
  language: ScriptLanguage;
  permanence: "permanent" | "migration" | "ops";
  ciPhase: CIPhase;
  outputs: string[];
  canonical: boolean;
  replacementTarget?: string;
  description: string;
}

function scanScripts(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !["node_modules", "iso", "templates", "autoinstall", "profiles"].includes(entry.name)) {
      results.push(...scanScripts(full));
    } else if (/\.(ts|js|mjs|sh|ps1)$/.test(entry.name) && !entry.name.startsWith("tsconfig")) {
      results.push(full);
    }
  }
  return results;
}

function derivePermanence(scriptPath: string, scriptClass: ScriptClass): "permanent" | "migration" | "ops" {
  if (scriptPath.includes("legacy/") || scriptPath.includes("codemods/") || scriptPath.includes("migrate/")) return "migration";
  if (["drill", "restore", "rotate"].includes(scriptClass)) return "ops";
  if (["codemod", "migrate"].includes(scriptClass)) return "migration";
  return "permanent";
}

function deriveDescription(scriptPath: string): string {
  const base = path.basename(scriptPath).replace(/\.(ts|js|mjs|sh|ps1)$/, "");
  return base.split(/[-_]/).filter(w => !["check", "assert", "validate", "generate", "scripts"].includes(w)).join(" ");
}

function deriveId(scriptPath: string): string {
  return scriptPath.replace(/^scripts\//, "").replace(/\.(ts|js|mjs|sh|ps1)$/, "").replace(/\//g, ".");
}

const scripts = scanScripts("scripts");
const registry: ScriptRegistryEntry[] = scripts.map(s => {
  const cls = classifyScriptClass(path.basename(s));
  return {
    id: deriveId(s),
    path: s,
    class: cls,
    owner: classifyOwnership(s),
    language: classifyLanguage(s),
    permanence: derivePermanence(s, cls),
    ciPhase: getCIPhase(s),
    outputs: getScriptOutputs(s),
    canonical: !s.includes("legacy/") && !s.includes("/wrappers/"),
    description: deriveDescription(s),
  };
});

const output = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  totalScripts: registry.length,
  entries: registry,
};

const outDir = "generated";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "script-registry.json"), JSON.stringify(output, null, 2) + "\n");

console.log(`✅ script-registry: ${registry.length} scripts registered`);
console.log(`  Permanent: ${registry.filter(r => r.permanence === "permanent").length}`);
console.log(`  Migration: ${registry.filter(r => r.permanence === "migration").length}`);
console.log(`  Ops: ${registry.filter(r => r.permanence === "ops").length}`);
