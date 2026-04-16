#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Script Language Policy
// Defines when each language is appropriate for scripts
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";
import { classifyLanguage, type ScriptLanguage } from "./script-taxonomy";

export const LANGUAGE_POLICY: Record<ScriptLanguage, {
  useFor: string[];
  avoidFor: string[];
  newScriptDefault: boolean;
}> = {
  typescript: {
    useFor: [
      "Repo graph analysis",
      "JSON manifest generation",
      "Schema/manifest validation",
      "CI-governed validation logic",
      "Contract/runtime/db/deployment truth checks",
      "Architecture assertions with complex logic",
    ],
    avoidFor: ["System-level packaging that requires POSIX tools"],
    newScriptDefault: true,
  },
  shell: {
    useFor: [
      "Linux-specific packaging (ISO, OVA, Docker)",
      "System-level local ops wrappers",
      "POSIX-native system interactions",
      "Secret rotation requiring system tools",
      "Appliance image workflows",
    ],
    avoidFor: ["Complex validation logic", "JSON generation", "Graph analysis"],
    newScriptDefault: false,
  },
  powershell: {
    useFor: [
      "Windows/admin workflows where required",
      "Parity wrappers for shell scripts",
      "Pre-flight checks on Windows CI runners",
    ],
    avoidFor: ["New permanent validation logic", "Primary CI checks"],
    newScriptDefault: false,
  },
  javascript: {
    useFor: ["Compatibility with existing codemod tooling", "ESM-only edge cases"],
    avoidFor: ["New permanent scripts (use TypeScript instead)"],
    newScriptDefault: false,
  },
};

function scanAllScripts(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== "node_modules" && entry.name !== "iso") {
      results.push(...scanAllScripts(full));
    } else if (/\.(ts|js|mjs|sh|ps1)$/.test(entry.name) && !entry.name.startsWith("tsconfig")) {
      results.push(full);
    }
  }
  return results;
}

const scripts = scanAllScripts("scripts");
const breakdown: Record<ScriptLanguage, number> = { typescript: 0, shell: 0, powershell: 0, javascript: 0 };
for (const s of scripts) {
  breakdown[classifyLanguage(s)]++;
}

console.log("📊 Script Language Distribution:");
for (const [lang, count] of Object.entries(breakdown)) {
  console.log(`  ${lang}: ${count} scripts`);
}
console.log(`  Total: ${scripts.length}`);
console.log("✅ script-language-policy: Language policy defined and current scripts classified");
