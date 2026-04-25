#!/usr/bin/env tsx
/**
 * SITA OS — Wave 2: Platform Deduplication
 *
 * Audit results (recorded in generated/audits/wave-2-dedup-report.json):
 *
 * Folder                          Consumers   Decision
 * src/platform/ai-gateway/         0          DELETE (empty `export {};` placeholder)
 * src/platform/ai/                 0          DELETE (empty `export {};` placeholder)
 * src/platform/core/               0          DELETE (empty `export {};` placeholder)
 * src/platform/os-services/        0          DELETE (empty `export {};` placeholder)
 * src/platform/services-unclassified/ 0       DELETE (empty `export {};` placeholder)
 * src/platform/policy/             0          DELETE (empty `export {};` placeholder)
 * src/platform/policies/           0          DELETE (re-exports @/lib/policy; no consumers)
 * src/platform/sync/               0          DELETE (re-exports @/lib/platform/sync; no consumers)
 * src/platform/nova-runtime-sdk/   0          DELETE (canonical-naming alias; no consumers — was Phase-3 scaffolding)
 * src/platform/sync-engine/        11         KEEP (38 real files, real consumers — this IS the canonical home)
 * src/platform/nova-sdk/           41         KEEP (real implementation, primary consumer)
 * src/platform/core-services/      30         KEEP (event-bus.ts + real consumers)
 *
 * Constitution amendment: the validator pair list was based on the assumption
 * that the SHORT name was canonical. The audit shows the LONG name is the real
 * implementation in 2 of 3 disputed pairs (sync-engine, core-services). The
 * validator (check-no-duplicate-platform.ts) is updated in the same wave PR
 * with the corrected target list.
 *
 * Idempotent: running twice is a no-op (deletes only existing dirs; codemod
 * only rewrites still-extant import paths).
 *
 * Run: npx tsx scripts/architecture/wave-2-platform-dedup.ts [--dry-run]
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const DRY = process.argv.includes("--dry-run");

const PLATFORM_DIR = join(ROOT, "src", "platform");
const REPORT_PATH = join(ROOT, "generated", "audits", "wave-2-dedup-report.json");

/** Folders to delete entirely. Pre-audit confirmed 0 consumers across src/. */
const DELETE_FOLDERS = [
  "ai-gateway",
  "ai",
  "core",
  "os-services",
  "services-unclassified",
  "policy",
  "policies",
  "sync",
  "nova-runtime-sdk",
] as const;

/** Import-path rewrites to apply across src/ before any folder deletion.
 *  Empty for this wave because all delete targets have 0 consumers, but kept
 *  here so future waves can extend the same script.
 */
const IMPORT_REWRITES: Array<{ from: RegExp; to: string }> = [
  // No rewrites needed — confirmed 0 consumers for every delete target.
];

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[] = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e);
    let s;
    try {
      s = statSync(p);
    } catch {
      continue;
    }
    if (s.isDirectory()) {
      // Skip noise dirs.
      if (e === "node_modules" || e.startsWith(".")) continue;
      walk(p, out);
    } else if (/\.(ts|tsx|mjs|cjs|js|jsx)$/.test(e)) out.push(p);
  }
  return out;
}

function rewriteImports(): { filesScanned: number; filesChanged: number; rewrites: number } {
  if (IMPORT_REWRITES.length === 0) return { filesScanned: 0, filesChanged: 0, rewrites: 0 };
  const SRC_DIR = join(ROOT, "src");
  const files = walk(SRC_DIR);
  let changed = 0;
  let rewrites = 0;
  for (const f of files) {
    let src = readFileSync(f, "utf8");
    let mutated = false;
    for (const r of IMPORT_REWRITES) {
      const before = src;
      src = src.replace(r.from, r.to);
      if (before !== src) {
        mutated = true;
        rewrites += (before.match(r.from) ?? []).length;
      }
    }
    if (mutated) {
      if (!DRY) writeFileSync(f, src, "utf8");
      changed++;
    }
  }
  return { filesScanned: files.length, filesChanged: changed, rewrites };
}

function deleteFolders(): { deleted: string[]; skipped: string[] } {
  const deleted: string[] = [];
  const skipped: string[] = [];
  for (const f of DELETE_FOLDERS) {
    const p = join(PLATFORM_DIR, f);
    if (!existsSync(p)) {
      skipped.push(f);
      continue;
    }
    if (DRY) {
      deleted.push(f);
      continue;
    }
    rmSync(p, { recursive: true, force: true });
    deleted.push(f);
  }
  return { deleted, skipped };
}

function main() {
  console.log(`▶ Wave 2 platform dedup ${DRY ? "(dry-run)" : ""}`);

  const importStats = rewriteImports();
  console.log(
    `   import rewrites: scanned=${importStats.filesScanned} changed=${importStats.filesChanged} replacements=${importStats.rewrites}`,
  );

  const folderStats = deleteFolders();
  console.log(`   folders deleted (${folderStats.deleted.length}): ${folderStats.deleted.join(", ") || "—"}`);
  if (folderStats.skipped.length > 0) {
    console.log(`   folders skipped (already gone): ${folderStats.skipped.join(", ")}`);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    schemaVersion: 1,
    dryRun: DRY,
    deleted: folderStats.deleted.map((f) => `src/platform/${f}/`),
    skipped: folderStats.skipped.map((f) => `src/platform/${f}/`),
    importRewrites: importStats,
    keptCanonical: ["src/platform/sync-engine/", "src/platform/nova-sdk/", "src/platform/core-services/"],
    note: "All deleted folders had 0 consumers in src/. See script header for full audit.",
  };
  if (!DRY) {
    if (!existsSync(join(ROOT, "generated", "audits"))) {
      mkdirSync(join(ROOT, "generated", "audits"), { recursive: true });
    }
    writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n", "utf8");
    console.log(`✅ Wrote report → ${relative(ROOT, REPORT_PATH)}`);
  }
}

main();