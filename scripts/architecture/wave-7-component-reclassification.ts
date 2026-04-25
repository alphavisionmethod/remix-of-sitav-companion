#!/usr/bin/env -S npx tsx
/**
 * ════════════════════════════════════════════════════════════════════════
 * SITA OS — Wave 7: Component Reclassification
 * ════════════════════════════════════════════════════════════════════════
 *
 * Scans src/components/ and relocates pillar- or platform-specific
 * component trees to their canonical owners:
 *   - Pillars   → src/modules/<pillar>/components/<sub>/...
 *   - Platforms → src/platform/<system>/components/<sub>/...
 *
 * Legacy paths in src/components/<sub>/... are replaced with thin
 * re-export adapters so every existing import path keeps working.
 *
 * Truly shared trees (ui/, primitives/, shared/, cards/, navigation/,
 * launcher/, __tests__/) are left in place.
 *
 * After file moves, runs an absolute-alias codemod on the relocated
 * files so any sibling-relative imports written for the old location
 * resolve correctly under the new path.
 *
 * Usage:
 *   npx tsx scripts/architecture/wave-7-component-reclassification.ts
 *   npx tsx scripts/architecture/wave-7-component-reclassification.ts --dry
 * ════════════════════════════════════════════════════════════════════════
 */

import * as fs from "node:fs";
import * as path from "node:path";

const DRY = process.argv.includes("--dry");
const ROOT = process.cwd();
const SRC_COMPONENTS = path.join(ROOT, "src", "components");
const SRC_MODULES = path.join(ROOT, "src", "modules");
const SRC_PLATFORM = path.join(ROOT, "src", "platform");

type OwnerKind = "module" | "platform" | "shared";
interface Mapping {
  legacySub: string;          // e.g. "business"
  ownerKind: OwnerKind;       // module | platform | shared
  ownerSlug: string;          // e.g. "business" | "admin" | ""  (empty for shared)
}

/**
 * Canonical reclassification map.
 * legacySub  → which canonical owner takes over the tree.
 */
const RECLASS: Mapping[] = [
  // ── Pillars (modules) ─────────────────────────────────────────────
  { legacySub: "business",          ownerKind: "module",   ownerSlug: "business" },
  { legacySub: "business-advisors", ownerKind: "module",   ownerSlug: "business" },
  { legacySub: "revenue-office",    ownerKind: "module",   ownerSlug: "business" },
  { legacySub: "revenue",           ownerKind: "module",   ownerSlug: "business" },
  { legacySub: "imports",           ownerKind: "module",   ownerSlug: "business" },
  { legacySub: "concierge",         ownerKind: "module",   ownerSlug: "concierge" },
  { legacySub: "finance",           ownerKind: "module",   ownerSlug: "finance" },
  { legacySub: "money",             ownerKind: "module",   ownerSlug: "finance" },
  { legacySub: "investment",        ownerKind: "module",   ownerSlug: "finance" },

  // ── Platforms ─────────────────────────────────────────────────────
  { legacySub: "admin",             ownerKind: "platform", ownerSlug: "admin" },
  { legacySub: "admin-ai",          ownerKind: "platform", ownerSlug: "admin" },
  { legacySub: "admin-os",          ownerKind: "platform", ownerSlug: "admin" },
  { legacySub: "advisors",          ownerKind: "platform", ownerSlug: "advisors" },
  { legacySub: "ai",                ownerKind: "platform", ownerSlug: "ai" },
  { legacySub: "ai-runtime",        ownerKind: "platform", ownerSlug: "ai" },
  { legacySub: "app-store",         ownerKind: "platform", ownerSlug: "app-platform" },
  { legacySub: "auth",              ownerKind: "platform", ownerSlug: "auth" },
  { legacySub: "autonomy",          ownerKind: "platform", ownerSlug: "trust" },
  { legacySub: "autopilot",         ownerKind: "platform", ownerSlug: "orchestration" },
  { legacySub: "claim-safety",      ownerKind: "platform", ownerSlug: "trust" },
  { legacySub: "cloud",             ownerKind: "platform", ownerSlug: "cloud" },
  { legacySub: "explainability",    ownerKind: "platform", ownerSlug: "ai" },
  { legacySub: "files",             ownerKind: "platform", ownerSlug: "files" },
  { legacySub: "governance",        ownerKind: "platform", ownerSlug: "governance" },
  { legacySub: "intelligence",      ownerKind: "platform", ownerSlug: "intelligence" },
  { legacySub: "marketing",         ownerKind: "platform", ownerSlug: "marketing" },
  { legacySub: "mobile",            ownerKind: "platform", ownerSlug: "experience" },
  { legacySub: "notifications",     ownerKind: "platform", ownerSlug: "notifications" },
  { legacySub: "observability",     ownerKind: "platform", ownerSlug: "observability" },
  { legacySub: "onboarding",        ownerKind: "platform", ownerSlug: "setup" },
  { legacySub: "operations",        ownerKind: "platform", ownerSlug: "operations" },
  { legacySub: "personal-brain",    ownerKind: "platform", ownerSlug: "personal-brain" },
  { legacySub: "platform",          ownerKind: "platform", ownerSlug: "core-services" },
  { legacySub: "reality",           ownerKind: "platform", ownerSlug: "product" },
  { legacySub: "runtime",           ownerKind: "platform", ownerSlug: "runtime" },
  { legacySub: "settings",          ownerKind: "platform", ownerSlug: "settings" },
  { legacySub: "simulation",        ownerKind: "platform", ownerSlug: "ai" },
  { legacySub: "sita",              ownerKind: "platform", ownerSlug: "sita" },
  { legacySub: "sync",              ownerKind: "platform", ownerSlug: "sync-engine" },
  { legacySub: "user-app",          ownerKind: "platform", ownerSlug: "experience" },

  // ── Stay shared (no-ops, declared for completeness) ───────────────
  { legacySub: "ui",                ownerKind: "shared",   ownerSlug: "" },
  { legacySub: "primitives",        ownerKind: "shared",   ownerSlug: "" },
  { legacySub: "shared",            ownerKind: "shared",   ownerSlug: "" },
  { legacySub: "cards",             ownerKind: "shared",   ownerSlug: "" },
  { legacySub: "navigation",        ownerKind: "shared",   ownerSlug: "" },
  { legacySub: "launcher",          ownerKind: "shared",   ownerSlug: "" },
  { legacySub: "__tests__",         ownerKind: "shared",   ownerSlug: "" },
];

interface MoveRecord {
  legacy: string;     // src/components/<sub>/path/to/File.tsx
  canonical: string;  // src/{modules|platform}/<owner>/components/<sub>/path/to/File.tsx
  aliasFrom: string;  // @/components/<sub>/path/to/File
  aliasTo: string;    // @/{modules|platform}/<owner>/components/<sub>/path/to/File
  ownerKind: OwnerKind;
  ownerSlug: string;
}

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function ensureDir(p: string) {
  if (DRY) return;
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

function toAlias(absFile: string): string {
  const rel = path.relative(path.join(ROOT, "src"), absFile).replace(/\\/g, "/");
  return "@/" + rel.replace(/\.(ts|tsx)$/, "");
}

function buildAdapter(canonicalAlias: string, isReact: boolean): string {
  // Re-export both default and named bindings; harmless if either is absent.
  return [
    `// ════════════════════════════════════════════════════════════`,
    `// Wave 7 — legacy component path. Canonical home:`,
    `//   ${canonicalAlias}`,
    `// This adapter preserves every existing @/components/<sub>/* import.`,
    `// ════════════════════════════════════════════════════════════`,
    `export * from "${canonicalAlias}";`,
    isReact ? `export { default } from "${canonicalAlias}";` : "",
    "",
  ].filter(Boolean).join("\n");
}

function looksLikeReactDefault(content: string): boolean {
  // Heuristic: file has `export default` somewhere.
  return /\bexport\s+default\b/.test(content);
}

const moves: MoveRecord[] = [];
const skipped: { sub: string; reason: string }[] = [];

for (const rule of RECLASS) {
  const legacyDir = path.join(SRC_COMPONENTS, rule.legacySub);
  if (!fs.existsSync(legacyDir)) {
    skipped.push({ sub: rule.legacySub, reason: "missing-legacy-dir" });
    continue;
  }
  if (rule.ownerKind === "shared") continue;

  const ownerRoot = rule.ownerKind === "module"
    ? path.join(SRC_MODULES, rule.ownerSlug, "components", rule.legacySub)
    : path.join(SRC_PLATFORM, rule.ownerSlug, "components", rule.legacySub);

  const files = walk(legacyDir);
  for (const legacy of files) {
    const relInsideSub = path.relative(legacyDir, legacy);
    const canonical = path.join(ownerRoot, relInsideSub);
    moves.push({
      legacy,
      canonical,
      aliasFrom: toAlias(legacy),
      aliasTo: toAlias(canonical),
      ownerKind: rule.ownerKind,
      ownerSlug: rule.ownerSlug,
    });
  }
}

let moved = 0;
let adapters = 0;

for (const m of moves) {
  // 1. Read the legacy file.
  const content = fs.readFileSync(m.legacy, "utf-8");

  // 2. Skip files that are already thin adapters (idempotent re-runs).
  if (/Wave 7 — legacy component path\./.test(content)) continue;

  // 3. Write canonical file (if absent OR identical adapter).
  if (!fs.existsSync(m.canonical)) {
    ensureDir(m.canonical);
    if (!DRY) fs.writeFileSync(m.canonical, content, "utf-8");
    moved++;
  }

  // 4. Replace legacy with adapter.
  const isReact = m.legacy.endsWith(".tsx") && looksLikeReactDefault(content);
  const adapter = buildAdapter(m.aliasTo, isReact);
  if (!DRY) fs.writeFileSync(m.legacy, adapter, "utf-8");
  adapters++;
}

// ── Codemod: rewrite same-folder relative imports inside relocated files
// so that previously sibling-relative paths resolve to canonical absolute aliases.
let rewrites = 0;
const allMovedCanonicals = moves.map(m => m.canonical);
for (const canonical of allMovedCanonicals) {
  if (!fs.existsSync(canonical)) continue;
  let src = fs.readFileSync(canonical, "utf-8");
  const before = src;

  // Convert any "../../../components/<sub>/x" or "../../components/x" patterns
  // that crept in to absolute @/components/* imports — those will hit the adapter
  // and resolve correctly. This is conservative and avoids cycles because the
  // adapter re-exports from the canonical alias (this file's neighborhood).
  src = src.replace(
    /from\s+["'](?:\.\.\/){2,}components\//g,
    'from "@/components/'
  );
  src = src.replace(
    /from\s+["'](?:\.\.\/){2,}lib\//g,
    'from "@/lib/'
  );
  src = src.replace(
    /from\s+["'](?:\.\.\/){2,}hooks\//g,
    'from "@/hooks/'
  );
  src = src.replace(
    /from\s+["'](?:\.\.\/){2,}contexts\//g,
    'from "@/contexts/'
  );
  src = src.replace(
    /from\s+["'](?:\.\.\/){2,}integrations\//g,
    'from "@/integrations/'
  );
  src = src.replace(
    /from\s+["'](?:\.\.\/){2,}utils\//g,
    'from "@/utils/'
  );
  src = src.replace(
    /from\s+["'](?:\.\.\/){2,}platform\//g,
    'from "@/platform/'
  );
  src = src.replace(
    /from\s+["'](?:\.\.\/){2,}modules\//g,
    'from "@/modules/'
  );

  if (src !== before) {
    if (!DRY) fs.writeFileSync(canonical, src, "utf-8");
    rewrites++;
  }
}

// ── Audit output ───────────────────────────────────────────────────────
const auditDir = path.join(ROOT, "generated", "audits");
fs.mkdirSync(auditDir, { recursive: true });

const summary = {
  generatedAt: new Date().toISOString(),
  dryRun: DRY,
  classifications: RECLASS.length,
  movedFiles: moved,
  adaptersWritten: adapters,
  importRewrites: rewrites,
  skipped,
  movesByOwner: moves.reduce<Record<string, number>>((acc, m) => {
    const key = `${m.ownerKind}:${m.ownerSlug}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {}),
  sample: moves.slice(0, 10).map(m => ({ from: m.aliasFrom, to: m.aliasTo })),
};

if (!DRY) {
  fs.writeFileSync(
    path.join(auditDir, "wave-7-component-reclassification.json"),
    JSON.stringify(summary, null, 2),
    "utf-8",
  );
}

console.log("════════════════════════════════════════════════════════════");
console.log(`Wave 7 — Component Reclassification ${DRY ? "(DRY RUN)" : ""}`);
console.log("════════════════════════════════════════════════════════════");
console.log(`Classifications        : ${RECLASS.length}`);
console.log(`Moved canonical files  : ${moved}`);
console.log(`Adapter files written  : ${adapters}`);
console.log(`Relative→alias rewrites: ${rewrites}`);
console.log(`Skipped legacy subs    : ${skipped.length}`);
if (skipped.length) console.log("   ", skipped);
console.log("Owner distribution     :", summary.movesByOwner);
if (DRY) console.log("\nDRY RUN — no files written. Re-run without --dry.");
