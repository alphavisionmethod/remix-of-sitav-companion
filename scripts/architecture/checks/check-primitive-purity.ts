#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Primitive Purity Check
// Asserts components in src/components/primitives/** import nothing
// from forbidden layers (services / engines / hooks / domain / pages).
// ═══════════════════════════════════════════════════════════════

import { ViolationCollector, scanDir, extractImports } from "../lib/utils";

const PRIMITIVE_ROOT = "src/components/primitives";
const vc = new ViolationCollector();

const FORBIDDEN_PATTERNS: Array<[RegExp, string]> = [
  [/\/lib\/services\//,             "imports a service"],
  [/\/lib\/engines\//,              "imports an engine"],
  [/\/lib\/orchestrat/,             "imports an orchestrator"],
  [/\/integrations\/supabase\//,    "imports the Supabase client"],
  [/\/hooks\//,                     "imports a hook"],
  [/\/components\/domain\//,        "imports a domain component"],
  [/\/components\/surfaces\//,      "imports a surface component"],
  [/\/pages\//,                     "imports a page"],
];

const files = scanDir(PRIMITIVE_ROOT, [".tsx", ".ts"]).filter(f =>
  !f.endsWith(".test.tsx") && !f.endsWith(".test.ts")
);

console.log(`  🧪 Auditing ${files.length} primitive(s)...`);

for (const file of files) {
  const imports = extractImports(file);
  for (const imp of imports) {
    for (const [pattern, reason] of FORBIDDEN_PATTERNS) {
      if (pattern.test(imp.source)) {
        vc.add(file, "primitive-impurity", `${reason}: ${imp.source}`);
      }
    }
  }
}

vc.report("check-primitive-purity");
vc.exitIfErrors();
