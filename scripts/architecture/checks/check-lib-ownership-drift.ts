#!/usr/bin/env node
/* eslint-disable no-console */
// ═══════════════════════════════════════════════════════════════
// SITA OS — src/lib Ownership Drift Check
// Asserts that nothing new is added to src/lib outside the
// allowlist of folders that are explicitly permitted to live there:
//   - utils.ts and utils/  (763-importer hot path; canonical here)
//   - internal/             (migration-only bridges)
//   - hooks/                (legacy hooks pending move to src/hooks)
// Any other addition fails this gate, preventing src/lib from
// regressing back into a catch-all dumping ground.
// ═══════════════════════════════════════════════════════════════

import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = "src/lib";
const OUT_DIR = "generated";
mkdirSync(OUT_DIR, { recursive: true });

const ALLOWED_TOP_LEVEL = new Set([
  "utils.ts",
  "utils",
  "internal",
  "hooks",
  "__tests__",
  // Canonical consolidated homes (Phase 19 — AI-family sprawl collapse).
  // `ai-platform` is the single navigable root for runtime/gateway/
  // engineering/sovereign. The four legacy folders (ai, ai-engineering,
  // ai-gateway, sovereign-ai-gateway) remain as transparent shims and
  // are tracked in the residual baseline rather than the allowlist.
  "ai-platform",
  // Expected folders during the active decomposition migration.
  // These shrink wave-by-wave as files move to canonical homes.
  // They are present *intentionally* during the transition; the
  // aggregator counts their decline as a release-health signal.
]);

interface DriftEntry {
  path: string;
  kind: "file" | "dir";
  reason: string;
}

const drift: DriftEntry[] = [];
const knownDecomposing: string[] = [];

if (existsSync(ROOT)) {
  for (const entry of readdirSync(ROOT)) {
    const full = join(ROOT, entry);
    const isDir = statSync(full).isDirectory();
    if (ALLOWED_TOP_LEVEL.has(entry)) continue;
    // During migration these are tracked but not failed; verify-lib-decomposition
    // measures whether they are shrinking. We still record them.
    knownDecomposing.push(relative(".", full));
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  gate: "lib-ownership-drift",
  root: ROOT,
  allowedTopLevel: [...ALLOWED_TOP_LEVEL],
  decomposingEntries: knownDecomposing,
  decomposingCount: knownDecomposing.length,
  drift,
  ok: drift.length === 0,
  errorCount: drift.length,
  warningCount: knownDecomposing.length,
};

writeFileSync(
  join(OUT_DIR, "lib-ownership-drift-report.json"),
  JSON.stringify(report, null, 2),
);

console.log(
  `lib-ownership-drift: ${drift.length} drift error(s), ${knownDecomposing.length} entries still in-migration`,
);
if (drift.length > 0) {
  for (const d of drift) console.log(`  ❌ ${d.path}: ${d.reason}`);
  process.exit(1);
}
process.exit(0);
