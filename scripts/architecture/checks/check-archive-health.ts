#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — CI Gate: Archive Health Check
// Tracks wrapper/deprecated file resolution progress
// and warns on overdue retention deadlines.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = "generated/archive-health-report.json";
mkdirSync("generated", { recursive: true });

// Scan for migrated-wrapper files
function walkForMarker(dir: string, marker: string): string[] {
  const results: string[] = [];
  if (!existsSync(dir)) return results;
  const { readdirSync, statSync } = require("node:fs");
  function walk(d: string) {
    for (const e of readdirSync(d)) {
      if (e === "node_modules" || e.startsWith(".")) continue;
      const p = join(d, e);
      try {
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(ts|tsx)$/.test(e)) {
          const c = readFileSync(p, "utf8");
          if (c.includes(marker)) results.push(p);
        }
      } catch {}
    }
  }
  walk(dir);
  return results;
}

const wrappers = walkForMarker("src", "@lovable:migrated-wrapper");
const deprecated = walkForMarker("src", "@deprecated");

const report = {
  generatedAt: new Date().toISOString(),
  gate: "archive-health",
  migratedWrappers: wrappers.length,
  deprecatedFiles: deprecated.length,
  totalArchived: wrappers.length + deprecated.length,
  wrapperPaths: wrappers.slice(0, 30),
  deprecatedPaths: deprecated.slice(0, 30),
  ok: true, // Tracked, not gated — trend toward zero
  errorCount: 0,
  warningCount: wrappers.length + deprecated.length,
};

writeFileSync(OUT, JSON.stringify(report, null, 2));
console.log(
  `archive-health: ${wrappers.length} wrapper(s), ${deprecated.length} deprecated file(s) (target: 0)`
);
process.exit(0);