#!/usr/bin/env -S bun run
// ════════════════════════════════════════════════════════════
// SITA OS — AI Orchestration Coverage Gate (Phase 4)
// ════════════════════════════════════════════════════════════
// Scans the frontend for direct invocations of the `ai-gateway`
// edge function. The Phase-4 contract is: every in-app AI call
// must flow through `ai-orchestrator` (which records a plan and
// emits explainability traces), with a small set of explicitly
// allow-listed call sites (the orchestrator client itself,
// internal runtime probes, and existing typed wrappers that are
// in the migration backlog).
//
// The script writes a deterministic snapshot to
// public/generated/ai-orchestration-coverage.json and exits non-zero
// if the number of direct callers exceeds the locked baseline.
// New violations therefore block PRs without forcing a big-bang
// codemod across ~20 sites.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { resolve, join } from "node:path";

const SRC_ROOT = resolve("src");
const MANIFEST_PATH = resolve("public/generated/ai-orchestration-coverage.json");

// Allow-list — these files are *meant* to call ai-gateway directly.
// Keep this list short and justified. Anything not in here counts.
const ALLOWLIST = new Set<string>([
  // The orchestrator itself lives in supabase/functions, not src/, so
  // it's already excluded by the SRC_ROOT scope. No frontend file
  // should be calling ai-gateway directly going forward.
  "src/lib/services/ai-gateway/invoke.ts",            // typed wrapper, owned by AI runtime
  "src/lib/services/ai-gateway/callable.ts",          // typed wrapper, owned by AI runtime
  "src/lib/ai-platform/runtime/ai-capability-client.ts", // capability client (lower-level than orchestrator)
  "src/lib/core-services/inference-gateway/inference-gateway.ts", // legacy inference gateway, slated for orch migration
  "src/components/sita/RuntimeTruthProbe.tsx",        // health probe (uses ping flag, not real inference)
]);

const INVOKE_PATTERN = /functions\s*\.\s*invoke\s*\(\s*["'`]ai-gateway["'`]/;

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (/\.(ts|tsx)$/.test(entry)) acc.push(full);
  }
  return acc;
}

function scan(): { violations: string[]; allowed: string[] } {
  const violations: string[] = [];
  const allowed: string[] = [];
  const files = walk(SRC_ROOT);
  for (const file of files) {
    let body: string;
    try {
      body = readFileSync(file, "utf8");
    } catch {
      continue;
    }
    if (!INVOKE_PATTERN.test(body)) continue;
    const rel = file.replace(`${process.cwd()}/`, "");
    if (ALLOWLIST.has(rel)) {
      allowed.push(rel);
    } else {
      violations.push(rel);
    }
  }
  return {
    violations: violations.sort(),
    allowed: allowed.sort(),
  };
}

// Locked baseline. Lower this number every time a site is migrated
// to `useOrchestrator` / `callOrchestrator`. Never raise it.
const BASELINE_VIOLATIONS = 1; // current: src/components/sita/CommandPalette.tsx

function main() {
  const { violations, allowed } = scan();

  const manifest = {
    generatedAt: new Date().toISOString(),
    rule: "All in-app AI calls must flow through `ai-orchestrator` (Phase 4).",
    baseline: BASELINE_VIOLATIONS,
    violationCount: violations.length,
    allowedCount: allowed.length,
    violations,
    allowed,
  };

  mkdirSync(resolve("public/generated"), { recursive: true });
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  if (violations.length > BASELINE_VIOLATIONS) {
    console.error(
      `❌ ai-orchestration coverage regression: ${violations.length} direct ai-gateway callers (baseline ${BASELINE_VIOLATIONS}).`,
    );
    for (const v of violations) console.error(`   - ${v}`);
    console.error(
      "\nFix: replace direct supabase.functions.invoke('ai-gateway', ...) with",
      "useOrchestrator() / callOrchestrator() from @/modules/_shared/ai.",
    );
    process.exit(1);
  }

  console.log(
    `✅ ai-orchestration coverage OK — ${violations.length} violation(s) at/under baseline (${BASELINE_VIOLATIONS}); ${allowed.length} allow-listed.`,
  );
}

main();