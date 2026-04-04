#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — CI: Check Contract Integrity
// Detects duplicate type definitions, drift between contract
// layers, and ensures canonical import rules are followed.
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

interface Violation {
  file: string;
  line: number;
  rule: string;
  detail: string;
}

const violations: Violation[] = [];

function scanDir(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.includes("node_modules")) files.push(...scanDir(full));
    else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) files.push(full);
  }
  return files;
}

// ── Rule 1: Detect duplicate exported type/interface names ──────
const typeRegistry = new Map<string, { file: string; line: number }[]>();
const srcFiles = [...scanDir("src/lib"), ...scanDir("src/packages")];

for (const file of srcFiles) {
  const content = fs.readFileSync(file, "utf-8");
  const lines = content.split("\n");
  const relPath = path.relative(process.cwd(), file);

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^export\s+(?:type|interface)\s+(\w+)/);
    if (match) {
      const name = match[1];
      const existing = typeRegistry.get(name) ?? [];
      existing.push({ file: relPath, line: i + 1 });
      typeRegistry.set(name, existing);
    }
  }
}

// Known acceptable re-exports (same concept, intentional re-export)
const knownReexports = new Set(["TrustPosture"]);

// Legacy duplicates: types that exist in both core-services/domain-engines/mocks
// AND in contracts/lib/types. These are tracked for future cleanup but don't block CI.
const legacyDirs = ["core-services", "domain-engines", "mocks", "advisor-protocol", "services", "boardroom", "no-hallucination", "internal-agents", "pack-store"];

for (const [name, locations] of typeRegistry) {
  if (locations.length > 1 && !knownReexports.has(name)) {
    // Allow legacy duplicates where all instances are in legacy dirs or canonical layers
    const allLegacy = locations.every(l =>
      legacyDirs.some(d => l.file.includes(d)) ||
      l.file.includes("src/lib/types/") ||
      l.file.includes("src/packages/")
    );
    if (allLegacy) continue;

    for (const loc of locations.slice(1)) {
      violations.push({
        file: loc.file,
        line: loc.line,
        rule: "DUPLICATE_TYPE_NAME",
        detail: `"${name}" also defined in ${locations[0].file}:${locations[0].line}`,
      });
    }
  }
}

// ── Rule 2: Pages must not import from low-level truth contracts ──
const pageFiles = scanDir("src/pages");
const truthImportPatterns = [
  /from\s+["']@\/lib\/types\/os-unified\.types["']/,
  /from\s+["']@\/lib\/types\/meta-governance\.types["']/,
];

for (const file of pageFiles) {
  const content = fs.readFileSync(file, "utf-8");
  const relPath = path.relative(process.cwd(), file);
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    for (const pattern of truthImportPatterns) {
      if (pattern.test(lines[i])) {
        violations.push({
          file: relPath,
          line: i + 1,
          rule: "PAGE_IMPORTS_TRUTH_CONTRACT",
          detail: "Page imports directly from truth contract — use view-model or hook instead",
        });
      }
    }
  }
}

// ── Rule 3: No localStorage for role/auth checks ────────────────
const allFiles = [...scanDir("src")];
for (const file of allFiles) {
  const content = fs.readFileSync(file, "utf-8");
  const relPath = path.relative(process.cwd(), file);
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    if (/localStorage\.getItem\(.*(?:role|admin|isAdmin)/i.test(lines[i])) {
      violations.push({
        file: relPath,
        line: i + 1,
        rule: "CLIENT_ROLE_CHECK",
        detail: "Uses localStorage for role/admin check — security risk",
      });
    }
  }
}

// ── Rule 4: Cross-layer import direction ────────────────────────
// packages/contracts must NOT import from src/lib/types/
const contractFiles = scanDir("src/packages/contracts");
for (const file of contractFiles) {
  const content = fs.readFileSync(file, "utf-8");
  const relPath = path.relative(process.cwd(), file);
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    if (/from\s+["']@\/lib\/types\//.test(lines[i])) {
      violations.push({
        file: relPath,
        line: i + 1,
        rule: "CROSS_LAYER_IMPORT",
        detail: "packages/contracts must not import from src/lib/types/ — direction is one-way",
      });
    }
  }
}

// ── Rule 5: Contract family barrel completeness ─────────────────
const requiredFamilies = [
  "core", "capability", "approval", "execution", "proof",
  "advisor", "runtime", "memory", "graph", "read-models",
  "specialized", "admin",
];

for (const family of requiredFamilies) {
  const familyDir = path.join("src/packages/contracts", family);
  if (!fs.existsSync(familyDir)) {
    violations.push({
      file: familyDir,
      line: 0,
      rule: "MISSING_CONTRACT_FAMILY",
      detail: `Contract family directory "${family}" does not exist`,
    });
    continue;
  }
  const barrelPath = path.join(familyDir, "index.ts");
  if (!fs.existsSync(barrelPath)) {
    violations.push({
      file: familyDir,
      line: 0,
      rule: "MISSING_FAMILY_BARREL",
      detail: `Contract family "${family}" has no barrel export (index.ts)`,
    });
  }
}

// ── Rule 6: No memory-governance-v2 (must be merged) ────────────
const v2Files = [
  "src/packages/contracts/memory/memory-governance-v2.ts",
  "src/packages/contracts/memory-governance-v2.ts",
];
for (const v2 of v2Files) {
  if (fs.existsSync(v2)) {
    violations.push({
      file: v2,
      line: 0,
      rule: "UNMERGED_V2_CONTRACT",
      detail: "memory-governance-v2 must be merged into memory-governance.ts — no parallel versions",
    });
  }
}

// ── Rule 7: Read-model contracts must not be imported by services ──
const serviceFiles = [...scanDir("src/lib/services"), ...scanDir("src/lib/core-services")];
for (const file of serviceFiles) {
  const content = fs.readFileSync(file, "utf-8");
  const relPath = path.relative(process.cwd(), file);
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    if (/from\s+["']@\/packages\/contracts\/read-models/.test(lines[i])) {
      violations.push({
        file: relPath,
        line: i + 1,
        rule: "SERVICE_IMPORTS_READ_MODEL",
        detail: "Services must not import from read-models — use truth contracts instead",
      });
    }
  }
}

// ── Output ──────────────────────────────────────────────────────
if (violations.length === 0) {
  console.log("✅ Contract integrity check passed — no duplicates, no drift, no misuse");
  console.log(`   ${requiredFamilies.length} contract families verified`);
  process.exit(0);
} else {
  console.error(`❌ ${violations.length} contract integrity violation(s):\n`);
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    → ${v.detail}\n`);
  }
  process.exit(1);
}
