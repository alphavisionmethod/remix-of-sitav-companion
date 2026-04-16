#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Domain Purity Check
// Asserts domain components do not import from /pages/ or
// /components/surfaces/ — that direction must be inverted.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { ViolationCollector, scanDir, extractImports } from "../lib/utils";

const REGISTRY_PATH = "generated/component-registry.json";
const vc = new ViolationCollector();

if (!fs.existsSync(REGISTRY_PATH)) {
  console.error("❌ Run audit-components.ts first.");
  process.exit(1);
}

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf-8"));
const domainRecords = (registry.records as Array<{ path: string; classification: string }>)
  .filter(r => r.classification === "DOMAIN");

console.log(`  🧪 Auditing ${domainRecords.length} domain component(s)...`);

const FORBIDDEN: Array<[RegExp, string]> = [
  [/\/pages\//,                "imports from /pages/ — invert dependency"],
  [/\/components\/surfaces\//, "imports from /components/surfaces/ — domain may not depend on surface"],
];

for (const rec of domainRecords) {
  const imports = extractImports(rec.path);
  for (const imp of imports) {
    for (const [pattern, reason] of FORBIDDEN) {
      if (pattern.test(imp.source)) {
        vc.add(rec.path, "domain-impurity", `${reason}: ${imp.source}`);
      }
    }
  }
}

// Also: reuse scan against the live filesystem (catch new files not yet in registry)
const allFiles = scanDir("src/components", [".tsx", ".ts"]);
const liveDomainFiles = allFiles.filter(f =>
  f.includes("/components/domain/") ||
  f.includes("/components/business/") ||
  f.includes("/components/concierge/") ||
  f.includes("/components/governance/") ||
  f.includes("/components/advisors/")
);

for (const file of liveDomainFiles) {
  const imports = extractImports(file);
  for (const imp of imports) {
    if (/\/pages\//.test(imp.source)) {
      vc.add(file, "domain-impurity", `imports from /pages/: ${imp.source}`);
    }
  }
}

vc.report("check-domain-purity");
vc.exitIfErrors();
