#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Wrapper Purity Check
// Asserts every WRAPPER_COMPAT_ONLY entry in the authority map
// contains ONLY re-export statements (no independent logic).
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { ViolationCollector } from "../lib/utils";
import { WRAPPER_REGISTRY } from "../../../src/lib/migration/service-authority-map";

const vc = new ViolationCollector();

const ALLOWED_PATTERNS = [
  /^\s*$/,
  /^\s*\/\//,
  /^\s*\/\*/,
  /^\s*\*/,
  /^\s*export\s+\*\s+from/,
  /^\s*export\s+\{[\s\S]*?\}\s+from/,
  /^\s*export\s+type\s+\{[\s\S]*?\}\s+from/,
  /^\s*export\s+\{$/,
  /^\s*\}\s+from/,
  /^\s*[A-Za-z_][\w]*,?\s*$/,
  /^\s*type\s+[A-Za-z_][\w]*,?\s*$/,
];

let scanned = 0;
for (const entry of WRAPPER_REGISTRY) {
  const file = `src/lib/services/${entry.id}/index.ts`;
  if (!fs.existsSync(file)) continue;
  scanned += 1;
  const content = fs.readFileSync(file, "utf-8");
  const lines = content.split("\n");
  for (const [i, line] of lines.entries()) {
    if (!line.trim()) continue;
    if (ALLOWED_PATTERNS.some(p => p.test(line))) continue;
    vc.add(file, "wrapper-impurity", `line ${i + 1}: "${line.trim().slice(0, 80)}" — wrappers must contain only re-exports`, "error");
  }
}

console.log(`  📊 scanned ${scanned} wrapper(s)`);
vc.report("check-wrapper-purity");
vc.exitIfErrors();
