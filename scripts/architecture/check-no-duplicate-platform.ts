#!/usr/bin/env tsx
/**
 * SITA OS — No Duplicate Platform Folders Validator (Constitution Rule 8 & 9)
 *
 * Asserts that the known duplicate platform folder placeholders do not exist.
 * After Wave 2, the empty/unused barrels were deleted; only the real
 * implementation folders remain.
 *
 * Modes:
 *   --warn  : print but always exit 0
 *   --strict (default after Wave 2): non-zero exit if any forbidden folder
 *           reappears.
 *
 * Run: npx tsx scripts/architecture/check-no-duplicate-platform.ts [--strict]
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const PLATFORM = join(ROOT, "src", "platform");
const WARN = process.argv.includes("--warn");
const STRICT = !WARN; // default is now strict (post-Wave 2)

/**
 * Folders that MUST NOT reappear under src/platform/. Each is either an
 * empty/scaffolding placeholder that was removed in Wave 2, or a duplicate
 * of one of the canonical implementation folders kept alive.
 *
 * Canonical implementations kept (do NOT add to this list):
 *   - src/platform/sync-engine/      (38 files — real implementation)
 *   - src/platform/nova-sdk/         (40+ files — real implementation)
 *   - src/platform/core-services/    (event-bus + 30 consumers)
 *
 * Wave 3 promoted these to canonical homes (do NOT add):
 *   - src/platform/ai/               (orchestrator client + explainability + streaming)
 *   - src/platform/knowledge/        (memory + chunks + ingestion + voice + federation)
 *   - src/platform/workspace/        (active workspace context)
 *   - src/platform/registry/         (module registry)
 *   - src/platform/contracts/        (pillar-contract, decision-queue)
 *   - src/platform/trust/            (receipts + approvals + authority + UI)
 */
const FORBIDDEN_FOLDERS: Array<{ name: string; reason: string }> = [
  { name: "ai-gateway", reason: "empty placeholder — AI gateway code lives at src/lib/services/ai-gateway/" },
  { name: "core", reason: "empty placeholder — kernel/runtime code lives in src/platform/core-services/ and src/runtimes/" },
  { name: "os-services", reason: "empty placeholder — OS services live in src/platform/core-services/" },
  { name: "services-unclassified", reason: "anti-pattern — every service must have a classified subsystem owner" },
  { name: "policy", reason: "empty placeholder — policy code lives at src/lib/policy/" },
  { name: "policies", reason: "empty placeholder — policy code lives at src/lib/policy/" },
  { name: "sync", reason: "empty placeholder — sync code lives in src/platform/sync-engine/" },
  { name: "nova-runtime-sdk", reason: "empty alias barrel — runtime canonical naming lives inside src/platform/nova-sdk/" },
];

function main() {
  const violations: string[] = [];

  for (const f of FORBIDDEN_FOLDERS) {
    if (existsSync(join(PLATFORM, f.name))) {
      violations.push(`FORBIDDEN_FOLDER: src/platform/${f.name}/ — ${f.reason}`);
    }
  }

  if (violations.length === 0) {
    console.log(`✅ No duplicate platform folders: OK (${FORBIDDEN_FOLDERS.length} forbidden names checked)`);
    process.exit(0);
  }

  console[STRICT ? "error" : "warn"](
    `${STRICT ? "❌" : "⚠️"} Forbidden platform folders: ${violations.length} issue(s) (mode=${STRICT ? "STRICT" : "WARN"})`,
  );
  for (const v of violations) console[STRICT ? "error" : "warn"](`  ${v}`);
  process.exit(STRICT ? 1 : 0);
}

main();