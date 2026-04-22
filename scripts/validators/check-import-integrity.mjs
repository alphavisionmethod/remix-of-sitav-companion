#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════
// SITA OS — Import Integrity Validator
// Detects malformed multi-line imports (import injected mid-block)
// ═══════════════════════════════════════════════════════════════
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function walk(dir, ext, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, ext, out);
    else if (p.endsWith(ext)) out.push(p);
  }
  return out;
}

const files = walk("src/pages", ".tsx");
let errors = 0;

for (const file of files) {
  const lines = readFileSync(file, "utf-8").split("\n");
  let inMultiline = false;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (inMultiline) {
      if (t.includes("}") && t.includes("from")) {
        inMultiline = false;
      } else if (t.startsWith("import ")) {
        console.error(`❌ ${file}:${i + 1} — import inside multi-line import block`);
        console.error(`   ${lines[i]}`);
        errors++;
        inMultiline = false;
      }
    } else if (t.startsWith("import ") && t.includes("{") && !t.includes("}")) {
      inMultiline = true;
    }
  }
}

if (errors > 0) {
  console.error(`\n🚫 ${errors} malformed import(s). Fix before merging.`);
  process.exit(1);
} else {
  console.log("✅ Import integrity — all imports well-formed");
}