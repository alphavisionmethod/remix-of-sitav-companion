#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Architecture Boundary Check
// Validates that the codebase respects the one-brain, three-domain
// architecture with no cross-domain imports or forbidden patterns.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const DOMAIN_MODULES = ["business-os", "finance-os", "concierge-os"];
const FORBIDDEN_DOMAINS = ["crm-os", "office-os", "files-os", "store-os", "analytics-os"];

interface Violation {
  file: string;
  rule: string;
  detail: string;
}

const violations: Violation[] = [];

function scanDir(dir: string, extensions: string[]): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.includes("node_modules")) {
      files.push(...scanDir(full, extensions));
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      files.push(full);
    }
  }
  return files;
}

function checkFile(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  const relPath = path.relative(process.cwd(), filePath);

  // Rule 1: No forbidden domain modules
  for (const forbidden of FORBIDDEN_DOMAINS) {
    if (content.includes(forbidden)) {
      violations.push({ file: relPath, rule: "FORBIDDEN_DOMAIN", detail: `References forbidden domain: ${forbidden}` });
    }
  }

  // Rule 2: Domain services should not import from other domains
  for (const domain of DOMAIN_MODULES) {
    if (relPath.includes(`services/${domain}/`)) {
      for (const other of DOMAIN_MODULES.filter(d => d !== domain)) {
        if (content.includes(`from ".*${other}`) || content.includes(`from '.*${other}`)) {
          violations.push({ file: relPath, rule: "CROSS_DOMAIN_IMPORT", detail: `${domain} imports from ${other}` });
        }
      }
    }
  }

  // Rule 3: Pages should not directly import from integrations/supabase/types.ts
  if (relPath.startsWith("src/pages/") && content.includes("from \"@/integrations/supabase/types\"")) {
    violations.push({ file: relPath, rule: "DIRECT_TYPE_IMPORT", detail: "Page imports directly from supabase types instead of using contracts" });
  }

  // Rule 4: No localStorage for auth/role checks (match localStorage keys containing role/admin)
  const roleLocalStoragePattern = /localStorage\.getItem\(\s*["'][^"']*(?:role|admin|isAdmin)[^"']*["']\s*\)/i;
  if (roleLocalStoragePattern.test(content)) {
    violations.push({ file: relPath, rule: "CLIENT_ROLE_CHECK", detail: "Uses localStorage for role/admin check — security risk" });
  }

  // Rule 5: No raw SQL strings
  if (content.includes("execute_sql") || content.includes("supabase.rpc(\"execute_sql\"")) {
    violations.push({ file: relPath, rule: "RAW_SQL", detail: "Contains raw SQL execution — security risk" });
  }
}

// Run
const srcFiles = scanDir("src", [".ts", ".tsx"]);
const fnFiles = scanDir("supabase/functions", [".ts"]);

for (const f of [...srcFiles, ...fnFiles]) {
  checkFile(f);
}

if (violations.length === 0) {
  console.log("✅ Architecture boundary check passed — no violations found");
  process.exit(0);
} else {
  console.error(`❌ ${violations.length} architecture violation(s) found:\n`);
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}`);
    console.error(`    → ${v.detail}\n`);
  }
  process.exit(1);
}
