#!/usr/bin/env tsx
/**
 * SITA OS — Platform Anti-Patterns Validator (thin wrapper)
 *
 * Authority: Constitution Rule 27 (Platform Subclassification, BLOCKING)
 *
 * Historically `check-platform-anti-patterns` appeared in
 * `generated/validator-gate-map.json` as an advisory entry, but no script
 * existed on disk. This file revives that gate by delegating to the canonical
 * subclassification validator.
 *
 * Run: npx tsx scripts/architecture/checks/check-platform-anti-patterns.ts
 */
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const ROOT = process.cwd();
const TARGET = join(ROOT, "scripts", "architecture", "check-platform-subclassification.ts");

const result = spawnSync("npx", ["tsx", TARGET, ...process.argv.slice(2)], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
process.exit(result.status ?? 1);
