#!/usr/bin/env tsx
/**
 * SITA OS — No Duplicate Platform Folders Validator (Constitution Rule 8 & 9)
 *
 * Asserts that the known duplicate platform folder pairs do not coexist,
 * and that src/platform/services-unclassified/ does not exist.
 *
 * Modes:
 *   --warn   (default): non-zero exit only on schema errors
 *   --strict : non-zero exit on any duplicate pair still present
 *
 * Run: npx tsx scripts/architecture/check-no-duplicate-platform.ts [--strict]
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const PLATFORM = join(ROOT, "src", "platform");
const STRICT = process.argv.includes("--strict");

/** keep → merge-from. After Wave 2, every "merge-from" must be empty/removed. */
const FORBIDDEN_PAIRS: Array<{ keep: string; mergeFrom: string; mergeTarget: string }> = [
  { keep: "ai", mergeFrom: "ai-gateway", mergeTarget: "ai/gateway" },
  { keep: "nova-sdk", mergeFrom: "nova-runtime-sdk", mergeTarget: "nova-sdk/runtime" },
  { keep: "policy", mergeFrom: "policies", mergeTarget: "policy" },
  { keep: "sync", mergeFrom: "sync-engine", mergeTarget: "sync/engine" },
  { keep: "core-services", mergeFrom: "core", mergeTarget: "core-services/kernel" },
  { keep: "core-services", mergeFrom: "os-services", mergeTarget: "core-services/os" },
];

const FORBIDDEN_FOLDERS = ["services-unclassified"];

function main() {
  const violations: string[] = [];

  for (const pair of FORBIDDEN_PAIRS) {
    const keepPath = join(PLATFORM, pair.keep);
    const fromPath = join(PLATFORM, pair.mergeFrom);
    if (existsSync(keepPath) && existsSync(fromPath)) {
      violations.push(
        `DUPLICATE_PLATFORM_PAIR: src/platform/${pair.mergeFrom}/ must be merged into src/platform/${pair.mergeTarget}/`,
      );
    }
  }

  for (const f of FORBIDDEN_FOLDERS) {
    if (existsSync(join(PLATFORM, f))) {
      violations.push(`FORBIDDEN_FOLDER: src/platform/${f}/ must be classified into proper subsystems`);
    }
  }

  if (violations.length === 0) {
    console.log("✅ No duplicate platform folders: OK");
    process.exit(0);
  }

  console[STRICT ? "error" : "warn"](
    `${STRICT ? "❌" : "⚠️"} Duplicate platform folders: ${violations.length} issue(s) (mode=${STRICT ? "STRICT" : "WARN"})`,
  );
  for (const v of violations) console[STRICT ? "error" : "warn"](`  ${v}`);
  process.exit(STRICT ? 1 : 0);
}

main();