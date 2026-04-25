#!/usr/bin/env tsx
/**
 * SITA OS — Platform Subclassification Validator (Constitution Rule 27, BLOCKING)
 *
 * Enforces:
 *   1. Every top-level src/platform/<X>/ folder MUST appear in
 *      generated/manifests/platform-subclassification-map.json.
 *      [PLATFORM_UNCLASSIFIED]
 *   2. Cross-subclass imports MUST follow ALLOWED_DEPENDENCIES.
 *      [PLATFORM_FORBIDDEN_CROSS_SUBCLASS_IMPORT]
 *      In Wave 0.5 these are recorded as ADVISORY against the baseline at
 *      generated/manifests/platform-cross-subclass-baseline.json (monotone
 *      ratchet — count may decrease, never grow). Will become BLOCKING after
 *      the future Platform Relocation Wave splits the offending folders.
 *   3. Imports of `src/platform/admin/**` from `src/admin/**` are flagged as
 *      ADVISORY warnings (Rule 28 transitional). Will become BLOCKING after
 *      the future Platform Relocation Wave moves the offending files.
 *      [PLATFORM_ADMIN_OVERLAP_ADVISORY]
 *
 * Modes:
 *   default (--strict): non-zero exit if any blocking violation present.
 *   --warn            : print everything, always exit 0 (used for diagnostics).
 *
 * Run: npx tsx scripts/architecture/check-platform-subclassification.ts
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const PLATFORM_DIR = join(ROOT, "src", "platform");
const ADMIN_DIR = join(ROOT, "src", "admin");
const MAP_PATH = join(ROOT, "generated", "manifests", "platform-subclassification-map.json");
const WARN_ONLY = process.argv.includes("--warn");

type Subclass =
  | "product-infrastructure"
  | "governance"
  | "operator-control"
  | "identity-and-tenant"
  | "intelligence"
  | "runtime-bridges";

type ManifestEntry = {
  folder: string;
  subclass: Subclass;
};

type Manifest = {
  folders: ManifestEntry[];
  subclasses: Array<{ id: Subclass; allowedDependencies: Subclass[] }>;
};

if (!existsSync(MAP_PATH)) {
  console.error(
    `❌ platform-subclassification-map.json not found.\n   Run: npx tsx scripts/manifests/generate/generate-platform-subclassification-map.ts`,
  );
  process.exit(WARN_ONLY ? 0 : 1);
}

const manifest: Manifest = JSON.parse(readFileSync(MAP_PATH, "utf8"));
const folderToSubclass = new Map<string, Subclass>();
for (const f of manifest.folders) folderToSubclass.set(f.folder, f.subclass);
const allowed = new Map<Subclass, Set<Subclass>>();
for (const s of manifest.subclasses) allowed.set(s.id, new Set(s.allowedDependencies));

type Violation = {
  severity: "block" | "advisory";
  rule: string;
  file: string;
  detail: string;
};
const violations: Violation[] = [];

const BASELINE_PATH = join(
  ROOT,
  "generated",
  "manifests",
  "platform-cross-subclass-baseline.json",
);

// ── Check 1: every src/platform/<X>/ is classified ───────────────────────────
const actualFolders = readdirSync(PLATFORM_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

for (const f of actualFolders) {
  if (!folderToSubclass.has(f)) {
    violations.push({
      severity: "block",
      rule: "PLATFORM_UNCLASSIFIED",
      file: `src/platform/${f}/`,
      detail:
        "New platform folder is not in CLASSIFICATION. Add to scripts/manifests/generate/generate-platform-subclassification-map.ts (Rule 27).",
    });
  }
}

// ── Check 2: scan imports for forbidden cross-subclass dependencies ─────────
function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const full = join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (/\.(tsx?|mts|cts|jsx?)$/.test(e.name)) out.push(full);
  }
  return out;
}

const PLATFORM_IMPORT_RE = /from\s+["']@\/platform\/([^/"']+)/g;
const ADMIN_PLATFORM_IMPORT_RE = /from\s+["']@\/platform\/admin(?:\/|["'])/;

function fileSubclass(filePath: string): Subclass | null {
  const rel = relative(PLATFORM_DIR, filePath).split(/[\\/]/);
  const top = rel[0];
  return folderToSubclass.get(top) ?? null;
}

const platformFiles = walk(PLATFORM_DIR);
let crossSubclassCount = 0;
for (const file of platformFiles) {
  const fromSub = fileSubclass(file);
  if (!fromSub) continue;
  const body = readFileSync(file, "utf8");
  const allowedFrom = allowed.get(fromSub) ?? new Set<Subclass>();
  const matches = body.matchAll(PLATFORM_IMPORT_RE);
  for (const m of matches) {
    const targetFolder = m[1];
    const toSub = folderToSubclass.get(targetFolder);
    if (!toSub) continue; // unclassified target already reported
    if (toSub === fromSub) continue; // intra-subclass always OK
    if (!allowedFrom.has(toSub)) {
      crossSubclassCount++;
      violations.push({
        severity: "advisory",
        rule: "PLATFORM_FORBIDDEN_CROSS_SUBCLASS_IMPORT",
        file: relative(ROOT, file),
        detail: `imports @/platform/${targetFolder} (subclass=${toSub}) but ${fromSub} may only depend on: ${[...allowedFrom].join(", ") || "(none)"}.`,
      });
    }
  }
}

// Monotone ratchet: cross-subclass violation count must not grow above the baseline.
let baselineCount = Number.POSITIVE_INFINITY;
if (existsSync(BASELINE_PATH)) {
  try {
    const b = JSON.parse(readFileSync(BASELINE_PATH, "utf8")) as { baselineCount: number };
    baselineCount = b.baselineCount;
  } catch {
    /* fall through */
  }
}
if (Number.isFinite(baselineCount) && crossSubclassCount > baselineCount) {
  violations.push({
    severity: "block",
    rule: "PLATFORM_CROSS_SUBCLASS_RATCHET",
    file: "generated/manifests/platform-cross-subclass-baseline.json",
    detail: `Cross-subclass violations grew from baseline ${baselineCount} → ${crossSubclassCount}. New cross-subclass imports are forbidden under the Rule 27 ratchet.`,
  });
}

// ── Check 3: advisory — src/admin re-exports from src/platform/admin ────────
const adminFiles = walk(ADMIN_DIR);
for (const file of adminFiles) {
  const body = readFileSync(file, "utf8");
  if (ADMIN_PLATFORM_IMPORT_RE.test(body)) {
    violations.push({
      severity: "advisory",
      rule: "PLATFORM_ADMIN_OVERLAP_ADVISORY",
      file: relative(ROOT, file),
      detail:
        "src/admin/** re-exports from src/platform/admin/** — Rule 28 transitional advisory. Will block after Platform Relocation Wave.",
    });
  }
}

// ── Report ──────────────────────────────────────────────────────────────────
const blocking = violations.filter((v) => v.severity === "block");
const advisory = violations.filter((v) => v.severity === "advisory");

if (blocking.length === 0) {
  console.log(
    `✅ Platform subclassification: OK (${actualFolders.length} folders, 6 subclasses, ${platformFiles.length} files scanned).`,
  );
} else {
  console.error(`❌ Platform subclassification: ${blocking.length} blocking violation(s).`);
  for (const v of blocking) {
    console.error(`  [${v.rule}] ${v.file} — ${v.detail}`);
  }
}

if (advisory.length > 0) {
  console.warn(
    `⚠️  Platform subclassification: ${advisory.length} advisory item(s) (Wave 0.5 transitional). Cross-subclass=${crossSubclassCount}, baseline=${Number.isFinite(baselineCount) ? baselineCount : "unset"}.`,
  );
  // Print only first 5 to keep CI logs readable.
  for (const v of advisory.slice(0, 5)) {
    console.warn(`  [${v.rule}] ${v.file} — ${v.detail}`);
  }
  if (advisory.length > 5) {
    console.warn(`  … and ${advisory.length - 5} more (see audit report).`);
  }
}

if (WARN_ONLY) process.exit(0);
process.exit(blocking.length === 0 ? 0 : 1);
