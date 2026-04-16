#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Deprecated Wrapper Discipline Check
// Asserts every file declared as a wrapper in
// component-duplication-map.ts is in fact a thin re-export only:
//   - ≤ 25 lines of code (excluding comments/blank)
//   - contains only `import` and `export` statements
//   - re-exports from the canonical path
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import { ViolationCollector } from "../lib/utils";
import {
  DUPLICATE_FAMILIES,
  allDeclaredWrappers,
} from "../../../src/lib/architecture/component-duplication-map";

const vc = new ViolationCollector();

const wrappers = allDeclaredWrappers();
console.log(`  🪟 Auditing ${wrappers.length} declared wrapper(s)...`);

for (const wrapperPath of wrappers) {
  if (!fs.existsSync(wrapperPath)) {
    vc.add(wrapperPath, "missing-wrapper", `Declared wrapper file does not exist`);
    continue;
  }

  const content = fs.readFileSync(wrapperPath, "utf-8");

  // Strip block comments and line comments
  const stripped = content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .map(l => l.replace(/\/\/.*$/, ""))
    .filter(l => l.trim().length > 0);

  if (stripped.length > 25) {
    vc.add(
      wrapperPath,
      "wrapper-too-fat",
      `${stripped.length} LOC > 25 max — wrapper must be a thin re-export`
    );
    continue;
  }

  const onlyExportImport = stripped.every(l => {
    const t = l.trim();
    return /^(export|import|\}|from|\{)/.test(t);
  });

  if (!onlyExportImport) {
    vc.add(
      wrapperPath,
      "wrapper-has-logic",
      `Contains non-export/import statements — wrapper must be a thin re-export`
    );
    continue;
  }

  // Must reference its canonical
  const family = DUPLICATE_FAMILIES.find(f => f.wrappers.includes(wrapperPath));
  if (family && !content.includes(family.canonical.replace("src/", "@/").replace(/\.tsx?$/, ""))) {
    // Soft warning — they may use a relative path
    const canonicalBase = family.canonical.split("/").pop()?.replace(/\.tsx?$/, "");
    if (canonicalBase && !content.includes(canonicalBase)) {
      vc.add(
        wrapperPath,
        "wrapper-missing-canonical-ref",
        `Wrapper does not reference canonical (${family.canonical})`,
        "warning"
      );
    }
  }
}

vc.report("check-deprecated-wrappers");
vc.exitIfErrors();
