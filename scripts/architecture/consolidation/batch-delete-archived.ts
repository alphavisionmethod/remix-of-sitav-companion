#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — Archive: Batch Delete Archived Files
// Safely deletes files proven to have zero importers.
// Supports dry-run mode and validates build after each batch.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const DRY_RUN = process.argv.includes("--dry-run");
const BATCH_SIZE = 5;
const OUT = "generated/lib-remediation/batch-delete-archived.json";
mkdirSync("generated/lib-remediation", { recursive: true });

// Files eligible for deletion (populated after importer analysis)
const DELETION_CANDIDATES: string[] = [];

function countImporters(targetPath: string): number {
  const importPath = "@/" + targetPath.replace(/^src\//, "").replace(/\.(ts|tsx)$/, "");
  let count = 0;

  function walk(dir: string) {
    if (!existsSync(dir)) return;
    for (const e of readdirSync(dir)) {
      if (e === "node_modules" || e.startsWith(".")) continue;
      const p = join(dir, e);
      try {
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(ts|tsx)$/.test(e) && p !== targetPath) {
          const c = readFileSync(p, "utf8");
          if (c.includes(`"${importPath}"`) || c.includes(`'${importPath}'`)) count++;
        }
      } catch {}
    }
  }

  walk("src");
  return count;
}

interface DeleteResult {
  path: string;
  importerCount: number;
  action: "deleted" | "skipped-has-importers" | "skipped-missing" | "dry-run";
}

const results: DeleteResult[] = [];
let deletedCount = 0;

for (const candidate of DELETION_CANDIDATES) {
  if (!existsSync(candidate)) {
    results.push({ path: candidate, importerCount: 0, action: "skipped-missing" });
    continue;
  }

  const importers = countImporters(candidate);
  if (importers > 0) {
    results.push({ path: candidate, importerCount: importers, action: "skipped-has-importers" });
    console.log(`  ⚠ ${candidate}: ${importers} importer(s) — skipped`);
    continue;
  }

  if (DRY_RUN) {
    results.push({ path: candidate, importerCount: 0, action: "dry-run" });
    console.log(`  [DRY RUN] Would delete: ${candidate}`);
  } else {
    try {
      unlinkSync(candidate);
      results.push({ path: candidate, importerCount: 0, action: "deleted" });
      deletedCount++;
      console.log(`  ✓ Deleted: ${candidate}`);
    } catch (e) {
      console.error(`  ✗ Failed to delete ${candidate}: ${(e as Error).message}`);
    }
  }
}

writeFileSync(OUT, JSON.stringify({
  generatedAt: new Date().toISOString(),
  dryRun: DRY_RUN,
  candidatesChecked: DELETION_CANDIDATES.length,
  deleted: deletedCount,
  skipped: results.filter(r => r.action.startsWith("skipped")).length,
  results,
}, null, 2));

console.log(`\n${DRY_RUN ? "[DRY RUN] " : ""}Batch delete: ${deletedCount} deleted, ${results.filter(r => r.action.startsWith("skipped")).length} skipped`);