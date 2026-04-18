#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Fix Relative Imports in Migrated Files
//
// When files moved from src/lib/foo/x.ts → src/platform/foo/x.ts,
// their relative imports like `import ... from "../bar"` may now
// resolve to a wrapper instead of the canonical file. Worse, some
// resolve to nowhere because the sibling moved to a different
// canonical home.
//
// Strategy: rewrite every relative import inside migrated files to
// the absolute wrapper-old-path form `@/lib/...`. Wrappers exist
// at every old src/lib path, so this guarantees resolution AND
// preserves existing wrapper-bridged behavior. Cleanup of these
// indirections is a future wave; correctness first.
// ═══════════════════════════════════════════════════════════════
import * as fs from "fs";
import * as path from "path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "generated/lib-decomposition");
const WRAPPER_MAP_PATH = path.join(OUT, "src-lib-wrapper-map.json");

if (!fs.existsSync(WRAPPER_MAP_PATH)) {
  console.error("❌ Wrapper map missing.");
  process.exit(1);
}
const wrapperMap = JSON.parse(fs.readFileSync(WRAPPER_MAP_PATH, "utf8"));
const wrappers: Array<{ oldPath: string; canonicalPath: string }> = wrapperMap.wrappers ?? [];

// Map: canonicalPath (e.g. src/platform/policy/foo.ts) → oldPath (src/lib/policy/foo.ts)
const canonicalToOld = new Map<string, string>();
for (const w of wrappers) canonicalToOld.set(w.canonicalPath, w.oldPath);

// Files to scan: every canonical destination
const SCAN_DIRS = [
  "src/domains", "src/platform", "src/runtimes",
  "src/data", "src/integrations", "src/contracts",
];

function walk(dir: string, acc: string[] = []): string[] {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(ts|tsx)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

function resolveRelative(fromFile: string, spec: string): string | null {
  const dir = path.dirname(fromFile);
  const target = path.resolve(dir, spec);
  // Try variants
  for (const ext of [".ts", ".tsx", ""]) {
    const p = `${target}${ext}`;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  for (const idx of ["/index.ts", "/index.tsx"]) {
    const p = `${target}${idx}`;
    if (fs.existsSync(p) && fs.statSync(p).isFile()) return p;
  }
  return null;
}

const targetFiles = SCAN_DIRS.flatMap(d => walk(d));
console.log(`📂 Scanning ${targetFiles.length} migrated files for broken relative imports`);

const IMPORT_RE = /(from\s+|import\s*\(\s*)['"](\.[^'"]+)['"]/g;
let touched = 0;
let rewritten = 0;
const unresolved: string[] = [];

for (const file of targetFiles) {
  let content = fs.readFileSync(file, "utf8");
  let changed = false;
  content = content.replace(IMPORT_RE, (full, prefix: string, spec: string) => {
    const resolved = resolveRelative(file, spec);
    if (resolved) return full; // works as-is
    // Try to map: what would the old src/lib path have been?
    // Find the canonical-paired oldPath that matches this file
    const fileRel = path.relative(ROOT, file).replace(/\\/g, "/");
    const oldOfThisFile = canonicalToOld.get(fileRel);
    if (!oldOfThisFile) return full; // not a migrated file; leave alone

    // Resolve as if we were still at oldPath
    const fakeDir = path.dirname(path.join(ROOT, oldOfThisFile));
    const fakeTarget = path.resolve(fakeDir, spec);
    for (const ext of [".ts", ".tsx", ""]) {
      const p = `${fakeTarget}${ext}`;
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        const rel = path.relative(ROOT, p).replace(/\\/g, "/").replace(/\.(tsx?|jsx?)$/, "");
        const aliased = `@/${rel.replace(/^src\//, "")}`;
        changed = true; rewritten++;
        return `${prefix}"${aliased}"`;
      }
    }
    for (const idx of ["/index.ts", "/index.tsx"]) {
      const p = `${fakeTarget}${idx}`;
      if (fs.existsSync(p) && fs.statSync(p).isFile()) {
        const rel = path.relative(ROOT, p).replace(/\\/g, "/").replace(/\/index\.(tsx?|jsx?)$/, "");
        const aliased = `@/${rel.replace(/^src\//, "")}`;
        changed = true; rewritten++;
        return `${prefix}"${aliased}"`;
      }
    }
    unresolved.push(`${fileRel} → ${spec}`);
    return full;
  });

  if (changed) {
    fs.writeFileSync(file, content);
    touched++;
  }
}

console.log(`✅ Touched ${touched} files; rewrote ${rewritten} imports`);
if (unresolved.length > 0) {
  console.log(`⚠️  ${unresolved.length} unresolved relative imports (first 15):`);
  for (const u of unresolved.slice(0, 15)) console.log(`   ${u}`);
}
