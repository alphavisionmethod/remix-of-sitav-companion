#!/usr/bin/env tsx
/**
 * SITA OS — Route Adapter Semantic Map Generator (Wave 0.7)
 *
 * Authority: Constitution Rules 33–35 (Semantic Route-Adapter Contract).
 *
 * Walks src/pages/** and classifies every .tsx/.ts file (excluding __tests__)
 * into one of six adapter subtypes:
 *   1. pure-reexport
 *   2. lazy
 *   3. redirect
 *   4. param-translate
 *   5. shell-mount
 *   6. event-dispatch
 * Plus a 7th status `legacy-violation` for pre-existing canonical bodies.
 *
 * Emits:
 *   generated/manifests/route-adapter-semantic-map.json
 *   generated/manifests/page-semantic-violation-baseline.json (only on first run)
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, sep } from "node:path";

import { classifyPageFile, type AdapterSubtype } from "../../architecture/lib/page-semantic-classifier";

const ROOT = process.cwd();
const PAGES_DIR = join(ROOT, "src", "pages");
const MANIFEST_DIR = join(ROOT, "generated", "manifests");
const NOW = new Date().toISOString();

function ensureDir(p: string) {
  if (!existsSync(p)) mkdirSync(p, { recursive: true });
}
function writeJson(file: string, data: unknown) {
  ensureDir(dirname(file));
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    if (e.name === "__tests__") continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (/\.tsx?$/.test(e.name)) out.push(full);
  }
  return out;
}

const files = walk(PAGES_DIR).sort();
const entries = files.map((file) => {
  const src = readFileSync(file, "utf8");
  const c = classifyPageFile(src);
  return {
    path: relative(ROOT, file).split(sep).join("/"),
    subtype: c.subtype,
    declaredSubtype: c.declaredSubtype,
    canonicalTarget: c.canonicalTarget,
    semanticStatus: c.semanticStatus,
    violations: c.violations,
    logicalLines: c.logicalLines,
  };
});

// Aggregate counts.
const bySubtype: Record<AdapterSubtype | "legacy-violation", number> = {
  "pure-reexport": 0,
  lazy: 0,
  redirect: 0,
  "param-translate": 0,
  "shell-mount": 0,
  "event-dispatch": 0,
  "legacy-violation": 0,
};
for (const e of entries) bySubtype[e.subtype] = (bySubtype[e.subtype] ?? 0) + 1;
const violationCount = entries.filter((e) => e.semanticStatus === "legacy-violation").length;

ensureDir(MANIFEST_DIR);
writeJson(join(MANIFEST_DIR, "route-adapter-semantic-map.json"), {
  generatedAt: NOW,
  schemaVersion: 1,
  rule: "Constitution Rules 33–35 (Semantic Route-Adapter Contract)",
  description:
    "Per-file classification of every src/pages/** route adapter. The seven categories include the six valid adapter subtypes plus 'legacy-violation' for files still owning canonical page state/data.",
  totalFiles: entries.length,
  violationCount,
  bySubtype,
  entries,
});

// Seed monotone-decreasing baseline on first run only.
const baselinePath = join(MANIFEST_DIR, "page-semantic-violation-baseline.json");
if (!existsSync(baselinePath)) {
  writeJson(baselinePath, {
    generatedAt: NOW,
    schemaVersion: 1,
    rule: "Constitution Rule 34 — page semantic violation monotone ratchet",
    description:
      "Sealed baseline of pre-existing src/pages/** files containing data fetching, mutations, or canonical state ownership. New PRs may only DECREASE this count. Drained by future Page Body Relocation Wave.",
    direction: "decrease-only",
    enforcer: "scripts/architecture/check-page-semantic-adapter.ts",
    violationCount,
    sealedAt: NOW,
    breakdown: {
      admin: entries.filter((e) => e.semanticStatus === "legacy-violation" && e.path.startsWith("src/pages/admin/")).length,
      mobile: entries.filter((e) => e.semanticStatus === "legacy-violation" && e.path.startsWith("src/pages/mobile/")).length,
      ownerMode: entries.filter((e) => e.semanticStatus === "legacy-violation" && e.path.startsWith("src/pages/owner-mode/")).length,
      other: entries.filter(
        (e) =>
          e.semanticStatus === "legacy-violation" &&
          !e.path.startsWith("src/pages/admin/") &&
          !e.path.startsWith("src/pages/mobile/") &&
          !e.path.startsWith("src/pages/owner-mode/"),
      ).length,
    },
  });
}

console.log(
  `✅ route-adapter-semantic-map: ${entries.length} files | violations=${violationCount} | ` +
    Object.entries(bySubtype)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => `${k}=${v}`)
      .join(", "),
);
