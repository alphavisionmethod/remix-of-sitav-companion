#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Advisor Registry Validator
// Validates advisor-registry.json matches source advisor configs
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { ViolationCollector, readJsonSafe, scanDir, readFileContent } from "./lib/utils";

const vc = new ViolationCollector();
const registry = readJsonSafe<any>("generated/advisor-registry.json");

if (!registry) {
  console.error("❌ generated/advisor-registry.json not found");
  process.exit(1);
}

const registeredIds = new Set<string>();
const advisors = registry.advisors || registry.entries || [];

for (const advisor of advisors) {
  const id = advisor.id || advisor.advisorId;
  if (!id) {
    vc.add("advisor-registry.json", "missing-id", "Advisor entry has no id field");
    continue;
  }
  if (registeredIds.has(id)) {
    vc.add("advisor-registry.json", "duplicate-id", `Duplicate advisor id: ${id}`);
  }
  registeredIds.add(id);

  if (!advisor.name && !advisor.label) {
    vc.add("advisor-registry.json", "missing-name", `Advisor ${id} has no name/label`);
  }
}

// Cross-reference with source advisor configs
const advisorDirs = [
  "src/packages/advisor-config",
  "src/packages/advisor-protocol",
  "src/lib/services/advisor",
];

const sourceAdvisorIds = new Set<string>();
for (const dir of advisorDirs) {
  const files = scanDir(dir, [".ts", ".tsx"]);
  for (const file of files) {
    const content = readFileContent(file);
    const idMatches = content.match(/advisorId:\s*["']([^"']+)["']/g);
    if (idMatches) {
      for (const m of idMatches) {
        const id = m.match(/["']([^"']+)["']/)?.[1];
        if (id) sourceAdvisorIds.add(id);
      }
    }
    const enumMatches = content.match(/ADVISOR_(?:IDS|REGISTRY)\s*=\s*\{([^}]+)\}/s);
    if (enumMatches) {
      const entries = enumMatches[1].match(/["']([^"']+)["']/g);
      if (entries) {
        for (const e of entries) {
          sourceAdvisorIds.add(e.replace(/["']/g, ""));
        }
      }
    }
  }
}

for (const sourceId of sourceAdvisorIds) {
  if (!registeredIds.has(sourceId)) {
    vc.add("advisor-registry.json", "missing-advisor", `Source advisor "${sourceId}" not in registry`, "warning");
  }
}

vc.report("check-advisor-registry");
vc.exitIfErrors();
