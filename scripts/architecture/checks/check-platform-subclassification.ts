#!/usr/bin/env tsx
/**
 * SITA OS — Platform Subclassification Validator (gate-discovery shim)
 *
 * Authority: Constitution Rule 27 (Platform Subclassification, BLOCKING)
 *
 * The canonical implementation lives at
 * `scripts/architecture/check-platform-subclassification.ts` (foundation tier).
 * This shim exists under `scripts/architecture/checks/` so that
 * `generate-validator-gate-map.ts` (which only scans the `checks/` dir) can
 * auto-discover the gate and surface it in `generated/validator-gate-map.json`.
 *
 * Run: npx tsx scripts/architecture/checks/check-platform-subclassification.ts
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
