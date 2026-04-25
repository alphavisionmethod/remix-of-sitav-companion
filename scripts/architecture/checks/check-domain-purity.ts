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

// ── Wave 1.2 Rule 41 — extended forbidden imports for src/domains/** ──
// Domain code MUST NOT import React, Supabase, services, components, or pages.
const DOMAIN_FORBIDDEN: Array<[RegExp, string]> = [
  [/^react($|\/)/, "imports react — domain must be UI-free"],
  [/^react-dom($|\/)/, "imports react-dom — domain must be UI-free"],
  [/^@\/integrations\/supabase/, "imports @/integrations/supabase — domain must be persistence-free"],
  [/^@\/lib\/services(\/|$)/, "imports @/lib/services — domain must be side-effect-free"],
  [/^@\/components(\/|$)/, "imports @/components — domain must be UI-free"],
  [/^@\/pages(\/|$)/, "imports @/pages — domain must not depend on routes"],
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

// ── Wave 1.2 — scan all of src/domains/** for the extended Rule 41 set ──
const domainTreeFiles = scanDir("src/domains", [".ts", ".tsx"]);
for (const file of domainTreeFiles) {
  if (file.includes("/__tests__/") || file.endsWith(".test.ts") || file.endsWith(".test.tsx")) continue;
  const imports = extractImports(file);
  for (const imp of imports) {
    for (const [pattern, reason] of DOMAIN_FORBIDDEN) {
      if (pattern.test(imp.source)) {
        vc.add(file, "domain-impurity-rule-41", `${reason}: ${imp.source}`);
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
