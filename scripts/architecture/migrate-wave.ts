#!/usr/bin/env tsx
// ═══════════════════════════════════════════════════════════════
// SITA OS — Universal Wave Migrator (drives Waves 2-7)
//
// Reads target map JSON and migrates files of one or more klass values:
//   1. Copies file to canonical target path
//   2. Replaces original src/lib/... file with a deprecated wrapper shim
//   3. Updates src-lib-wrapper-map.json
//
// Usage:
//   npx tsx scripts/architecture/migrate-wave.ts --wave=2 --klass=data
//   npx tsx scripts/architecture/migrate-wave.ts --wave=3 --klass=runtime
//   npx tsx scripts/architecture/migrate-wave.ts --wave=4 --klass=platform --max=200
//   npx tsx scripts/architecture/migrate-wave.ts --dry-run --klass=integration
//
// SAFETY:
//   - Never deletes the original — replaces it with a wrapper that re-exports
//   - Skips files already migrated (target exists with same content)
//   - Skips files that would create a circular wrapper (target == source)
//   - Respects shared-internal "stay-in-place" files (never moves them)
// ═══════════════════════════════════════════════════════════════

import * as fs from "fs";
import * as path from "path";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "generated/lib-decomposition");
const TARGET_MAP_PATH = path.join(OUT, "src-lib-target-map.json");
const WRAPPER_MAP_PATH = path.join(OUT, "src-lib-wrapper-map.json");

const args = Object.fromEntries(
  process.argv.slice(2).map(a => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  })
);

const WAVE = Number(args.wave ?? 0);
const KLASS = (args.klass ?? "").split(",").filter(Boolean);
const DRY = args["dry-run"] === "true";
const MAX = args.max ? Number(args.max) : Infinity;

if (KLASS.length === 0) {
  console.error("❌ Provide --klass=data|runtime|platform|domain|integration|contract");
  process.exit(1);
}

const targetMap = JSON.parse(fs.readFileSync(TARGET_MAP_PATH, "utf8"));
const wrapperMap: { generatedAt: string; wrappers: any[] } = fs.existsSync(WRAPPER_MAP_PATH)
  ? JSON.parse(fs.readFileSync(WRAPPER_MAP_PATH, "utf8"))
  : { generatedAt: new Date().toISOString(), wrappers: [] };

// ── Pick eligible targets ────────────────────────────────────
const eligible = targetMap.targets.filter(
  (t: any) =>
    KLASS.includes(t.klass) &&
    t.migrationStrategy !== "stay-in-place" &&
    t.migrationStrategy !== "archive-or-review" &&
    !t.targetPath.includes("services-unclassified") // keep for Wave 7b
);

console.log(`🌊 Wave ${WAVE} — class(es) ${KLASS.join(",")}`);
console.log(`   Eligible: ${eligible.length}  Max: ${MAX === Infinity ? "all" : MAX}  Dry: ${DRY}`);

// Sort by lowest-risk first (importerCount asc) so failures surface gently
eligible.sort((a: any, b: any) => a.importerCount - b.importerCount);

const toProcess = eligible.slice(0, MAX);

// ── Helpers ──────────────────────────────────────────────────
function ensureDir(p: string) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
}

/** Compute a `@/...` import specifier for the canonical target path. */
function canonicalImportSpec(targetPath: string): string {
  // src/platform/policy/foo.ts → @/platform/policy/foo
  const noSrc = targetPath.replace(/^src\//, "");
  const noExt = noSrc.replace(/\.(tsx?|jsx?)$/, "");
  return `@/${noExt}`;
}

function buildWrapperShim(canonicalSpec: string, originalContent: string, wave: number): string {
  // Detect default export so wrapper preserves it
  const hasDefault = /export\s+default\b/.test(originalContent);
  const lines = [
    "/**",
    ` * @deprecated Migrated to \`${canonicalSpec}\` in Wave ${wave} of src/lib decomposition.`,
    " * This wrapper exists for back-compat and will be removed once consumers are rewired.",
    " * Tracked in: generated/lib-decomposition/src-lib-wrapper-map.json",
    " * Policy: docs/architecture/LEGACY_AND_WRAPPER_POLICY.md",
    " */",
    `export * from "${canonicalSpec}";`,
  ];
  if (hasDefault) {
    lines.push(`export { default } from "${canonicalSpec}";`);
  }
  lines.push("");
  return lines.join("\n");
}

// ── Process ──────────────────────────────────────────────────
let moved = 0;
let skipped = 0;
let failed = 0;
const failures: string[] = [];

// Track wrappers added this run
const newWrappers: any[] = [];

for (const t of toProcess) {
  const srcAbs = path.join(ROOT, t.currentPath);
  const dstAbs = path.join(ROOT, t.targetPath);

  try {
    if (!fs.existsSync(srcAbs)) {
      skipped++;
      continue;
    }
    // Skip if target == source (circular)
    if (path.resolve(srcAbs) === path.resolve(dstAbs)) {
      skipped++;
      continue;
    }

    const original = fs.readFileSync(srcAbs, "utf8");

    // Skip if already a wrapper to the same canonical
    const canonicalSpec = canonicalImportSpec(t.targetPath);
    if (original.includes(`from "${canonicalSpec}"`) && original.length < 1500) {
      skipped++;
      continue;
    }

    // Skip if target exists and differs — manual review required
    if (fs.existsSync(dstAbs)) {
      const existing = fs.readFileSync(dstAbs, "utf8");
      if (existing.trim() && existing.trim() !== original.trim() && !existing.includes("Canonical Barrel")) {
        // Target already has real content; don't overwrite — log and skip
        skipped++;
        failures.push(`SKIP target-exists-with-different-content: ${t.currentPath} → ${t.targetPath}`);
        continue;
      }
    }

    if (DRY) {
      console.log(`  [DRY] ${t.currentPath} → ${t.targetPath}`);
      moved++;
      continue;
    }

    // 1. Write canonical destination
    ensureDir(dstAbs);
    fs.writeFileSync(dstAbs, original);

    // 2. Replace original with wrapper shim
    const shim = buildWrapperShim(canonicalSpec, original, WAVE);
    fs.writeFileSync(srcAbs, shim);

    newWrappers.push({
      oldPath: t.currentPath,
      canonicalPath: t.targetPath,
      canonicalSpec,
      wave: WAVE,
      importerCount: t.importerCount,
      addedAt: new Date().toISOString(),
      removalCondition: "Remove after consumers migrate to canonical path AND check-legacy-wrapper-usage reports zero importers",
    });
    moved++;
  } catch (e) {
    failed++;
    failures.push(`FAIL ${t.currentPath}: ${(e as Error).message}`);
  }
}

// ── Persist wrapper map ─────────────────────────────────────
if (!DRY && newWrappers.length > 0) {
  // De-dupe by oldPath
  const existing = new Map(wrapperMap.wrappers.map((w: any) => [w.oldPath, w]));
  for (const w of newWrappers) existing.set(w.oldPath, w);
  wrapperMap.wrappers = [...existing.values()].sort((a, b) => a.oldPath.localeCompare(b.oldPath));
  wrapperMap.generatedAt = new Date().toISOString();
  fs.writeFileSync(WRAPPER_MAP_PATH, JSON.stringify(wrapperMap, null, 2));
}

console.log(`\n📊 Wave ${WAVE} results:`);
console.log(`   Moved:   ${moved}`);
console.log(`   Skipped: ${skipped}`);
console.log(`   Failed:  ${failed}`);
console.log(`   Total wrappers tracked: ${wrapperMap.wrappers.length}`);
if (failures.length > 0) {
  console.log(`\n⚠️  First 10 issues:`);
  for (const f of failures.slice(0, 10)) console.log(`   ${f}`);
}
