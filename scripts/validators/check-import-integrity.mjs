#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Import Integrity Validator
// Detects malformed multi-line imports (import injected mid-block).
// Handles: comments, trailing commas, `import type`, re-exports.
// Usage: node scripts/validators/check-import-integrity.mjs [--fix]
// ═══════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";

const FIX = process.argv.includes("--fix");

function walk(dir, ext, out = []) {
  try {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory() && !e.name.startsWith(".") && e.name !== "node_modules")
        walk(p, ext, out);
      else if (p.endsWith(ext)) out.push(p);
    }
  } catch {
    /* dir doesn't exist */
  }
  return out;
}

/** Strip single-line comments and inline block comments */
function stripComments(line) {
  return line.replace(/\/\/.*$/, "").replace(/\/\*.*?\*\//g, "").trim();
}

/** Detect if a stripped line starts a multi-line import */
function isImportOpen(stripped) {
  // import { ... (no closing brace or `from` on this line)
  if (!/^import\s/.test(stripped)) return false;
  if (!stripped.includes("{")) return false;
  // Has closing brace + from on same line → single-line
  const afterBrace = stripped.slice(stripped.indexOf("{"));
  if (afterBrace.includes("}")) return false;
  return true;
}

/** Detect if a stripped line closes a multi-line import */
function isImportClose(stripped) {
  // Must have } before `from "..."` AND must not start with `import`
  // (an injected single-line import also has } and from, but starts with import)
  if (/^import\s/.test(stripped)) return false;
  return stripped.includes("}") && /from\s+["']/.test(stripped);
}

const dirs = ["src/pages", "src/components"];
const files = dirs.flatMap((d) => walk(d, ".tsx").concat(walk(d, ".ts")));
let errors = 0;
let fixed = 0;

for (const file of files) {
  const source = readFileSync(file, "utf-8");
  const lines = source.split("\n");
  let inMultiline = false;
  let multilineStart = -1;
  const badLineIndices = [];

  for (let i = 0; i < lines.length; i++) {
    const t = stripComments(lines[i]);
    if (!t) continue; // blank or comment-only

    if (inMultiline) {
      if (isImportClose(t)) {
        inMultiline = false;
      } else if (/^import\s/.test(t)) {
        console.error(`❌ ${file}:${i + 1} — import inside multi-line import block`);
        console.error(`   ${lines[i]}`);
        badLineIndices.push(i);
        errors++;
        inMultiline = false;
      }
    } else if (isImportOpen(t)) {
      inMultiline = true;
      multilineStart = i;
    }
  }

  // Auto-fix: move bad import lines out of their host block
  if (FIX && badLineIndices.length > 0) {
    const extracted = [];
    const newLines = lines.filter((l, i) => {
      if (badLineIndices.includes(i)) {
        extracted.push(l);
        return false;
      }
      return true;
    });
    // Insert extracted imports at the top (after any leading comments/shebangs)
    let insertAt = 0;
    for (let j = 0; j < newLines.length; j++) {
      const s = newLines[j].trim();
      if (s.startsWith("//") || s.startsWith("/*") || s.startsWith("*") || !s) {
        insertAt = j + 1;
      } else break;
    }
    newLines.splice(insertAt, 0, ...extracted);
    writeFileSync(file, newLines.join("\n"));
    fixed += extracted.length;
    console.log(`  🔧 Fixed ${extracted.length} import(s) in ${file}`);
  }
}

if (FIX && fixed > 0) {
  console.log(`\n🔧 Auto-fixed ${fixed} import(s). Re-run without --fix to verify.`);
  process.exit(0);
} else if (errors > 0) {
  console.error(`\n🚫 ${errors} malformed import(s). Run \`npm run fix:imports\` or fix manually.`);
  process.exit(1);
} else {
  console.log("✅ Import integrity — all imports well-formed");
}