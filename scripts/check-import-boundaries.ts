#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Import Boundary Checker
// Validates domain isolation: business-os ↛ finance-os ↛ concierge-os
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const DOMAIN_DIRS: Record<string, string[]> = {
  "business-os": ["src/lib/services/business-os", "src/lib/domain-engines/business-os.ts"],
  "finance-os": ["src/lib/services/finance-os", "src/lib/domain-engines/finance-os.ts"],
  "concierge-os": ["src/lib/services/concierge-os", "src/lib/domain-engines/concierge-os.ts"],
};

interface Violation { file: string; rule: string; detail: string }
const violations: Violation[] = [];

function scanDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...scanDir(full));
    else if (e.name.endsWith(".ts") || e.name.endsWith(".tsx")) files.push(full);
  }
  return files;
}

for (const [domain, paths] of Object.entries(DOMAIN_DIRS)) {
  const otherDomains = Object.keys(DOMAIN_DIRS).filter(d => d !== domain);
  for (const p of paths) {
    const files = fs.statSync(p).isDirectory() ? scanDir(p) : [p];
    for (const f of files) {
      const content = fs.readFileSync(f, "utf-8");
      const rel = path.relative(process.cwd(), f);
      for (const other of otherDomains) {
        const otherSlug = other.replace("-os", "");
        if (content.includes(`/${other}/`) || content.includes(`/${otherSlug}-os/`)) {
          violations.push({ file: rel, rule: "CROSS_DOMAIN", detail: `${domain} imports from ${other}` });
        }
      }
    }
  }
}

// Check edge functions don't import page components
const efFiles = scanDir("supabase/functions");
for (const f of efFiles) {
  const content = fs.readFileSync(f, "utf-8");
  if (content.includes("from \"@/pages") || content.includes("from \"@/components")) {
    violations.push({ file: path.relative(process.cwd(), f), rule: "EF_PAGE_IMPORT", detail: "Edge function imports frontend code" });
  }
}

if (violations.length === 0) {
  console.log("✅ Import boundary check passed — no cross-domain violations");
} else {
  console.error(`❌ ${violations.length} import boundary violation(s):\n`);
  for (const v of violations) console.error(`  [${v.rule}] ${v.file}\n    → ${v.detail}\n`);
  process.exit(1);
}
