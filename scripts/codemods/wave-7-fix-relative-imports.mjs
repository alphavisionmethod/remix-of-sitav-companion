#!/usr/bin/env node
/**
 * ════════════════════════════════════════════════════════════════════════
 * Wave 7 — Relative Import Cleanup
 * ────────────────────────────────────────────────────────────────────────
 * Converts deep relative imports (`../../../...`, `../../...`) introduced
 * by Waves 4–6 page relocations and Wave 7 component relocations into
 * absolute `@/...` aliases. Operates on src/platform/**, src/modules/**,
 * src/components/** to avoid surprise edits in unrelated trees.
 *
 * Verifies the rewrite never produces a no-op match by counting hits.
 * ════════════════════════════════════════════════════════════════════════
 */
import * as fs from "node:fs";
import * as path from "node:path";

const ROOTS = [
  "src/platform",
  "src/modules",
  "src/components",
  "src/pages",
];

/**
 * Map well-known top-level src directories that we want to alias.
 * Order matters: longer prefixes first to avoid partial matches.
 */
const TOPS = [
  "integrations",
  "components",
  "contexts",
  "platform",
  "modules",
  "hooks",
  "lib",
  "utils",
  "data",
  "services",
  "domains",
  "runtimes",
  "admin",
  "routes",
  "pages",
  "assets",
  "types",
  "constants",
  "config",
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

let totalRewrites = 0;
let totalFiles = 0;
const perRoot = {};

for (const root of ROOTS) {
  const files = walk(root);
  let rootRewrites = 0;
  let rootFiles = 0;

  for (const file of files) {
    let src = fs.readFileSync(file, "utf-8");
    const before = src;

    for (const top of TOPS) {
      // Match `from "../../../<top>/..."` or `from '../../../<top>/...'`
      // Require at least 2 levels of `../` so we don't disturb sibling imports.
      const re = new RegExp(
        `from\\s+(["'])((?:\\.\\.\\/){2,})${top}\\/`,
        "g",
      );
      src = src.replace(re, (_m, q) => `from ${q}@/${top}/`);

      // Same for dynamic imports.
      const reDyn = new RegExp(
        `import\\(\\s*(["'])((?:\\.\\.\\/){2,})${top}\\/`,
        "g",
      );
      src = src.replace(reDyn, (_m, q) => `import(${q}@/${top}/`);
    }

    if (src !== before) {
      const hits = (before.match(/from\s+["'](?:\.\.\/){2,}/g) ?? []).length
                 - (src.match(/from\s+["'](?:\.\.\/){2,}/g) ?? []).length;
      rootRewrites += Math.max(hits, 1);
      rootFiles += 1;
      fs.writeFileSync(file, src, "utf-8");
    }
  }

  perRoot[root] = { files: rootFiles, rewrites: rootRewrites };
  totalFiles += rootFiles;
  totalRewrites += rootRewrites;
}

const summary = {
  generatedAt: new Date().toISOString(),
  totalFiles,
  totalRewrites,
  perRoot,
};

const auditDir = "generated/audits";
fs.mkdirSync(auditDir, { recursive: true });
fs.writeFileSync(
  path.join(auditDir, "wave-7-relative-import-codemod.json"),
  JSON.stringify(summary, null, 2),
  "utf-8",
);

console.log("Wave 7 — Relative Import Codemod");
console.log("─────────────────────────────────");
console.log(`Files updated     : ${totalFiles}`);
console.log(`Imports rewritten : ${totalRewrites}`);
console.log("Per root          :", perRoot);
