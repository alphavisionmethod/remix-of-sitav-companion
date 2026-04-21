#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Product Surface Boundary Validator (BLOCK gate)
// Ensures no forbidden cross-product imports exist
// ═══════════════════════════════════════════════════════════════

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

interface Violation { file: string; importPath: string; rule: string }

const SURFACE_ROUTES: Record<string, { dirs: string[]; forbidden: string[] }> = {
  "sita-mobile-app": {
    dirs: ["src/pages/mobile", "src/components/mobile"],
    forbidden: ["components/desktop/", "components/shell/", "components/dock/", "components/window/"],
  },
  "sita-admin-backend": {
    dirs: ["src/pages/admin"],
    forbidden: ["pages/business/", "pages/finance/", "pages/concierge/", "pages/investment/", "pages/boardroom/", "pages/mobile/", "components/mobile/"],
  },
  "sita-os-desktop": {
    dirs: ["src/pages/business", "src/pages/finance", "src/pages/concierge", "src/pages/boardroom", "src/pages/investment"],
    forbidden: ["components/mobile/", "pages/mobile/"],
  },
};

function walk(dir: string): string[] {
  const results: string[] = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      try {
        if (statSync(full).isDirectory()) results.push(...walk(full));
        else if (/\.(tsx?|jsx?)$/.test(full)) results.push(full);
      } catch { /* skip */ }
    }
  } catch { /* dir missing */ }
  return results;
}

const violations: Violation[] = [];

for (const [surface, config] of Object.entries(SURFACE_ROUTES)) {
  for (const dir of config.dirs) {
    for (const file of walk(dir)) {
      const content = readFileSync(file, "utf-8");
      const importRe = /(?:import|from)\s+["']([^"']+)["']/g;
      let m: RegExpExecArray | null;
      while ((m = importRe.exec(content)) !== null) {
        const importPath = m[1];
        for (const forbidden of config.forbidden) {
          if (importPath.includes(forbidden)) {
            violations.push({ file, importPath, rule: `${surface} cannot import ${forbidden}` });
          }
        }
      }
    }
  }
}

if (violations.length > 0) {
  console.error(`❌ Product surface boundary violations: ${violations.length}`);
  violations.slice(0, 10).forEach(v => console.error(`  ${v.file} → ${v.importPath} (${v.rule})`));
  process.exit(1);
} else {
  console.log("✅ Product surface boundaries: no forbidden cross-product imports");
}