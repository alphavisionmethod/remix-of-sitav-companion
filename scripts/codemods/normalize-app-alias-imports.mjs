#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Normalize @/ Alias Imports
// Conventional source roots across the monorepo
// Usage: node scripts/codemods/normalize-app-alias-imports.mjs [--apply]
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const dryRun = !process.argv.includes("--apply");
const SRC_ROOT = "src";

function scanDir(dir, extensions) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
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

const NORMALIZATIONS = [
  // Normalize relative imports that should use @/ alias
  { from: /from\s+["']\.\.\/\.\.\/\.\.\/lib\//g, to: 'from "@/lib/' },
  { from: /from\s+["']\.\.\/\.\.\/\.\.\/packages\//g, to: 'from "@/packages/' },
  { from: /from\s+["']\.\.\/\.\.\/\.\.\/components\//g, to: 'from "@/components/' },
  { from: /from\s+["']\.\.\/\.\.\/\.\.\/hooks\//g, to: 'from "@/hooks/' },
];

const files = scanDir(SRC_ROOT, [".ts", ".tsx"]);
let modified = 0;
let rewrites = 0;

for (const file of files) {
  if (file.includes("node_modules") || file.includes(".test.")) continue;
  let content = fs.readFileSync(file, "utf-8");
  let changed = false;

  for (const rule of NORMALIZATIONS) {
    const matches = content.match(rule.from);
    if (matches) {
      content = content.replace(rule.from, rule.to);
      rewrites += matches.length;
      changed = true;
    }
  }

  if (changed) {
    modified++;
    if (!dryRun) fs.writeFileSync(file, content);
    else console.log(`  📝 Would modify: ${file}`);
  }
}

console.log(`\n${dryRun ? "🔍 DRY RUN:" : "✅"} ${modified} files, ${rewrites} normalizations`);
if (dryRun) console.log("   Run with --apply to write changes");
